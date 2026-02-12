import { cleanupExpiredCheckouts } from "@/lib/db-helpers";
import { NextRequest, NextResponse } from "next/server";

// This replaces the Supabase pg_cron job: cleanup-expired-checkouts
// Runs every 5 minutes via Vercel Cron

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await cleanupExpiredCheckouts();

    console.log(
      `[Cron] Cleanup: ${result.deletedOrders} expired orders, ${result.deletedReservations} expired reservations`
    );

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Cleanup failed:", error);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
