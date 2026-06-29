-- Supabase Migration: 011_gmail_accounts.sql
-- Description: Create gmail_accounts table and reference fields in orders and subscriptions

-- Create Gmail Accounts table
CREATE TABLE IF NOT EXISTS public.gmail_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    plan_id UUID REFERENCES public.plans(id) ON DELETE RESTRICT NOT NULL,
    twofa_secret TEXT NOT NULL,
    subscription_valid_until TIMESTAMPTZ,
    max_members INTEGER DEFAULT 5 NOT NULL,
    status TEXT DEFAULT 'Available' NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT chk_gmail_status CHECK (status IN ('Available', 'Full', 'Expired', 'Disabled')),
    CONSTRAINT chk_gmail_max_members CHECK (max_members >= 1)
);

-- Add updated_at trigger for gmail_accounts
DROP TRIGGER IF EXISTS trg_gmail_accounts_updated_at ON public.gmail_accounts;
CREATE TRIGGER trg_gmail_accounts_updated_at
    BEFORE UPDATE ON public.gmail_accounts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add gmail_account_id to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS gmail_account_id UUID REFERENCES public.gmail_accounts(id) ON DELETE SET NULL;

-- Add gmail_account_id to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS gmail_account_id UUID REFERENCES public.gmail_accounts(id) ON DELETE SET NULL;

-- Enable Realtime replication for gmail_accounts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_rel pr 
        JOIN pg_class c ON pr.prrelid = c.oid 
        JOIN pg_publication p ON pr.prpubid = p.oid 
        WHERE p.pubname = 'supabase_realtime' AND c.relname = 'gmail_accounts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.gmail_accounts;
    END IF;
END $$;

-- Enable Row-Level Security (RLS)
ALTER TABLE public.gmail_accounts ENABLE ROW LEVEL SECURITY;

-- Admins RLS Policy for gmail_accounts
CREATE POLICY "Admins have full access on gmail_accounts" ON public.gmail_accounts
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
