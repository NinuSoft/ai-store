-- Supabase Migration: 008_auto_populate_order_product_id.sql
-- Description: Automatically populate product_id in orders based on plan_id if it is set

CREATE OR REPLACE FUNCTION public.handle_order_product_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.plan_id IS NOT NULL THEN
        SELECT product_id INTO NEW.product_id
        FROM public.plans
        WHERE id = NEW.plan_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_orders_populate_product_id ON public.orders;
CREATE TRIGGER trg_orders_populate_product_id
    BEFORE INSERT OR UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_order_product_id();
