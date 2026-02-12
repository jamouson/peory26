import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

// ============================================
// FINALIZE PAID ORDER
// Call this from payment webhooks (Stripe/PayPal)
// ============================================

interface FinalizeOrderParams {
  orderId: string;
  provider: "stripe" | "paypal";
  providerPaymentId: string;
  email: string;
  shipping?: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

interface FinalizeResult {
  already_finalized: boolean;
  updated_order: Record<string, unknown>;
}

export async function finalizePaidOrder(
  params: FinalizeOrderParams
): Promise<FinalizeResult> {
  const result = await prisma.$queryRaw<FinalizeResult[]>`
    SELECT * FROM finalize_paid_order(
      ${params.orderId}::uuid,
      ${params.provider},
      ${params.providerPaymentId},
      ${params.email},
      ${params.shipping ? JSON.stringify(params.shipping) : null}::jsonb
    )
  `;

  return result[0];
}

// ============================================
// AUDIT CONTEXT
// Sets the current user for audit logging triggers.
// Call this before any write operations you want audited.
// ============================================

export async function withAuditContext<T>(
  userId: string | null,
  userEmail: string | null,
  operation: () => Promise<T>
): Promise<T> {
  // Use $transaction to ensure SET LOCAL is in the same transaction
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (userId) {
      await tx.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`;
    }
    if (userEmail) {
      await tx.$executeRaw`SELECT set_config('app.current_user_email', ${userEmail}, true)`;
    }
    return operation();
  });
}

// ============================================
// AVAILABLE INVENTORY
// Calculates available stock minus active reservations
// ============================================

interface AvailableInventory {
  inventory_count: number;
  reserved: number;
  available: number;
}

export async function getAvailableInventory(
  variantId: string
): Promise<AvailableInventory | null> {
  const result = await prisma.$queryRaw<AvailableInventory[]>`
    SELECT 
      pv.inventory_count,
      COALESCE(SUM(ir.quantity), 0)::int as reserved,
      (pv.inventory_count - COALESCE(SUM(ir.quantity), 0))::int as available
    FROM product_variants pv
    LEFT JOIN inventory_reservations ir 
      ON ir.variant_id = pv.id 
      AND ir.expires_at > NOW()
    WHERE pv.id = ${variantId}::uuid
    GROUP BY pv.id
  `;

  return result[0] || null;
}

// ============================================
// CLEANUP EXPIRED CHECKOUTS
// Call this from a Vercel Cron job (replaces pg_cron)
// ============================================

export async function cleanupExpiredCheckouts(): Promise<{
  deletedOrders: number;
  deletedReservations: number;
}> {
  const [orders, reservations] = await prisma.$transaction([
    prisma.$executeRaw`
      DELETE FROM orders 
      WHERE status = 'pending' 
        AND locked = true 
        AND expires_at < NOW()
    `,
    prisma.$executeRaw`
      DELETE FROM inventory_reservations 
      WHERE expires_at < NOW()
    `,
  ]);

  return {
    deletedOrders: orders,
    deletedReservations: reservations,
  };
}
