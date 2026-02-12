-- ============================================
-- POST-PRISMA MIGRATION
-- Run this AFTER `prisma db push` or `prisma migrate dev`
-- This adds triggers, stored procedures, and CHECK constraints
-- that Prisma cannot define declaratively.
-- ============================================

-- ============================================
-- 1. CHECK CONSTRAINTS
-- ============================================

-- Products
ALTER TABLE products ADD CONSTRAINT chk_products_base_price CHECK (base_price >= 0);
ALTER TABLE products ADD CONSTRAINT chk_products_compare_price CHECK (compare_at_price >= 0);
ALTER TABLE products ADD CONSTRAINT chk_products_status CHECK (status IN ('draft', 'scheduled', 'published', 'archived'));

-- Product Variants
ALTER TABLE product_variants ADD CONSTRAINT chk_variants_price CHECK (price >= 0);
ALTER TABLE product_variants ADD CONSTRAINT chk_variants_compare_price CHECK (compare_at_price >= 0);
ALTER TABLE product_variants ADD CONSTRAINT chk_variants_inventory CHECK (inventory_count >= 0);
ALTER TABLE product_variants ADD CONSTRAINT chk_variants_weight CHECK (weight_grams >= 0);

-- Cart Items
ALTER TABLE cart_items ADD CONSTRAINT chk_cart_quantity CHECK (quantity > 0);

-- Orders
ALTER TABLE orders ADD CONSTRAINT chk_orders_subtotal CHECK (subtotal >= 0);
ALTER TABLE orders ADD CONSTRAINT chk_orders_shipping CHECK (shipping_cost >= 0);
ALTER TABLE orders ADD CONSTRAINT chk_orders_tax CHECK (tax >= 0);
ALTER TABLE orders ADD CONSTRAINT chk_orders_total CHECK (total >= 0);
ALTER TABLE orders ADD CONSTRAINT chk_orders_status CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'));
ALTER TABLE orders ADD CONSTRAINT chk_orders_provider CHECK (payment_provider IN ('stripe', 'paypal'));

-- Order Items
ALTER TABLE order_items ADD CONSTRAINT chk_items_price CHECK (price >= 0);
ALTER TABLE order_items ADD CONSTRAINT chk_items_quantity CHECK (quantity > 0);
ALTER TABLE order_items ADD CONSTRAINT chk_items_total CHECK (line_total >= 0);

-- Inventory Reservations
ALTER TABLE inventory_reservations ADD CONSTRAINT chk_reservations_quantity CHECK (quantity > 0);
ALTER TABLE inventory_reservations ADD CONSTRAINT chk_reservations_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL);

-- Shipping Rates
ALTER TABLE shipping_rates ADD CONSTRAINT chk_shipping_rate CHECK (rate >= 0);
ALTER TABLE shipping_rates ADD CONSTRAINT chk_shipping_threshold CHECK (free_shipping_threshold >= 0);

-- Audit Logs
ALTER TABLE audit_logs ADD CONSTRAINT chk_audit_action CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'));

-- Error Logs
ALTER TABLE error_logs ADD CONSTRAINT chk_errors_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'));


-- ============================================
-- 2. TRIGGER FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Audit log trigger function
-- NOTE: Without Supabase JWT, we pass user info via application-level context.
-- Use: SET LOCAL app.current_user_id = 'xxx'; before operations.
CREATE OR REPLACE FUNCTION log_audit_changes()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_email_val TEXT;
BEGIN
  -- Try to get user context set by the application
  BEGIN
    user_id_val := current_setting('app.current_user_id', true)::uuid;
  EXCEPTION WHEN OTHERS THEN
    user_id_val := NULL;
  END;

  BEGIN
    user_email_val := current_setting('app.current_user_email', true);
  EXCEPTION WHEN OTHERS THEN
    user_email_val := NULL;
  END;

  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, user_id, user_email)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), user_id_val, user_email_val);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id, user_email)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), user_id_val, user_email_val);
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id, user_email)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), user_id_val, user_email_val);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 3. APPLY TRIGGERS
-- ============================================

-- Timestamp triggers (BEFORE UPDATE)
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER product_variants_updated_at BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER shipping_rates_updated_at BEFORE UPDATE ON shipping_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Audit triggers (AFTER INSERT/UPDATE/DELETE)
CREATE TRIGGER products_audit AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

CREATE TRIGGER product_variants_audit AFTER INSERT OR UPDATE OR DELETE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

CREATE TRIGGER orders_audit AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION log_audit_changes();


-- ============================================
-- 4. STORED PROCEDURES
-- ============================================

-- Finalize paid order (called by payment webhooks)
CREATE OR REPLACE FUNCTION finalize_paid_order(
  p_order_id UUID,
  p_provider TEXT,
  p_provider_payment_id TEXT,
  p_email TEXT,
  p_shipping JSONB DEFAULT NULL,
  p_billing JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS TABLE(already_finalized BOOLEAN, updated_order JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
BEGIN
  -- 1. Lock order row
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_not_found: Order % does not exist', p_order_id;
  END IF;

  -- 2. Idempotency check
  IF v_order.status = 'paid' THEN
    RETURN QUERY SELECT true::boolean, to_jsonb(v_order);
    RETURN;
  END IF;

  IF v_order.status != 'pending' THEN
    RAISE EXCEPTION 'order_not_pending: Order % has status %', p_order_id, v_order.status;
  END IF;

  IF v_order.payment_provider != p_provider THEN
    RAISE EXCEPTION 'provider_mismatch: Expected %, got %', v_order.payment_provider, p_provider;
  END IF;

  -- 3. Decrement inventory
  UPDATE product_variants v
  SET inventory_count = inventory_count - r.quantity
  FROM inventory_reservations r
  WHERE r.variant_id = v.id
    AND r.order_id = p_order_id
    AND v.track_inventory = true;

  -- 4. Snapshot order items
  INSERT INTO order_items (order_id, product_id, variant_id, product_name, variant_name, sku, price, quantity, line_total, image_url)
  SELECT
    p_order_id,
    p.id,
    v.id,
    p.name,
    NULL, -- variant_name computed by app if needed
    v.sku,
    v.price,
    r.quantity,
    v.price * r.quantity,
    COALESCE(v.image_url, p.images[1])
  FROM inventory_reservations r
  JOIN product_variants v ON v.id = r.variant_id
  JOIN products p ON p.id = v.product_id
  WHERE r.order_id = p_order_id;

  -- 5. Update order status
  UPDATE orders SET
    status = 'paid',
    locked = false,
    paid_at = NOW(),
    email = COALESCE(NULLIF(p_email, ''), email),
    shipping_name = COALESCE(p_shipping->>'name', shipping_name),
    shipping_address_line1 = COALESCE(p_shipping->>'line1', shipping_address_line1),
    shipping_address_line2 = COALESCE(p_shipping->>'line2', shipping_address_line2),
    shipping_city = COALESCE(p_shipping->>'city', shipping_city),
    shipping_state = COALESCE(p_shipping->>'state', shipping_state),
    shipping_zip = COALESCE(p_shipping->>'postal_code', shipping_zip),
    shipping_country = COALESCE(p_shipping->>'country', shipping_country),
    stripe_payment_intent_id = CASE WHEN p_provider = 'stripe' THEN p_provider_payment_id ELSE stripe_payment_intent_id END,
    paypal_order_id = CASE WHEN p_provider = 'paypal' THEN p_provider_payment_id ELSE paypal_order_id END
  WHERE id = p_order_id;

  -- 6. Delete reservations
  DELETE FROM inventory_reservations WHERE order_id = p_order_id;

  -- 7. Return updated order
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  RETURN QUERY SELECT false::boolean, to_jsonb(v_order);
END;
$$;
