-- Migration: Add activation_date and payment_date columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS activation_date TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ;
