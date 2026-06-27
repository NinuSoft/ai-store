-- Supabase Migration: 006_users_cancel_orders.sql
-- Description: Allow authenticated users to cancel their own pending orders

DROP POLICY IF EXISTS "Users can cancel own pending orders" ON public.orders;
CREATE POLICY "Users can cancel own pending orders" ON public.orders
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id AND status = 'Pending')
    WITH CHECK (auth.uid() = user_id AND status = 'Cancelled');
