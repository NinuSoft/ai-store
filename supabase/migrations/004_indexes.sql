-- Supabase Migration: 004_indexes.sql
-- Description: Performance optimization indexes for composite filtering, ordering, and admin sorting

-- =========================================================================
-- 1. COMPOSITE INDEXES FOR FRONTEND PRESENTATION (Active & Ordered)
-- =========================================================================

-- Optimizes plans retrieval for a product (active, sorted by display_order)
CREATE INDEX IF NOT EXISTS idx_plans_active_ordered
    ON public.plans (product_id, is_active, display_order);

-- Optimizes active FAQs sorting
CREATE INDEX IF NOT EXISTS idx_faqs_active_ordered
    ON public.faqs (is_active, display_order);

-- Optimizes active testimonials sorting
CREATE INDEX IF NOT EXISTS idx_testimonials_active_ordered
    ON public.testimonials (is_active, display_order);

-- =========================================================================
-- 2. PARTIAL INDEXES FOR SUBSCRIPTION EXPIRY ENGINE
-- =========================================================================

-- Optimizes background workers running checks on active subscriptions near expiry
CREATE INDEX IF NOT EXISTS idx_subscriptions_active_expires_at
    ON public.subscriptions (expires_at)
    WHERE status = 'Active';

-- =========================================================================
-- 3. SORTING INDEXES FOR ADMIN DASHBOARDS & LOGS (Descending order)
-- =========================================================================

-- Optimizes fetching latest orders
CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc
    ON public.orders (created_at DESC);

-- Optimizes fetching latest subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at_desc
    ON public.subscriptions (created_at DESC);

-- Optimizes fetching newly registered profiles
CREATE INDEX IF NOT EXISTS idx_profiles_created_at_desc
    ON public.profiles (created_at DESC);

-- =========================================================================
-- 4. CONDITIONAL OR BULK FILTER INDEXES
-- =========================================================================

-- Optimizes filtering active products
CREATE INDEX IF NOT EXISTS idx_products_active
    ON public.products (is_active);
