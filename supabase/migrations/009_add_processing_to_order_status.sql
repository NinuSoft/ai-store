-- Supabase Migration: 009_add_processing_to_order_status.sql
-- Description: Add 'Processing' to the orders status check constraint and migrate existing records

-- 1. Drop the check constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS chk_order_status;

-- 2. Add it back with 'Processing' included
ALTER TABLE public.orders ADD CONSTRAINT chk_order_status 
    CHECK (status IN ('Pending', 'Processing', 'Activated', 'Rejected', 'Cancelled'));

-- 3. Migrate existing records: orders with notes = 'PROCESSING' should have status = 'Processing' and notes cleared
UPDATE public.orders 
SET status = 'Processing', notes = NULL 
WHERE notes = 'PROCESSING';
