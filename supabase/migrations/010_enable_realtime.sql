-- Supabase Migration: 010_enable_realtime.sql
-- Description: Add orders, subscriptions, and profiles to supabase_realtime publication

-- Check if supabase_realtime publication exists. If not, create it.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Enable Realtime for specific tables (idempotent addition using alter publication)
DO $$
BEGIN
    -- Enable orders
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_rel pr 
        JOIN pg_class c ON pr.prrelid = c.oid 
        JOIN pg_publication p ON pr.prpubid = p.oid 
        WHERE p.pubname = 'supabase_realtime' AND c.relname = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;

    -- Enable subscriptions
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_rel pr 
        JOIN pg_class c ON pr.prrelid = c.oid 
        JOIN pg_publication p ON pr.prpubid = p.oid 
        WHERE p.pubname = 'supabase_realtime' AND c.relname = 'subscriptions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
    END IF;

    -- Enable profiles
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_rel pr 
        JOIN pg_class c ON pr.prrelid = c.oid 
        JOIN pg_publication p ON pr.prpubid = p.oid 
        WHERE p.pubname = 'supabase_realtime' AND c.relname = 'profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
END $$;
