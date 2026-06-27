-- Supabase Migration: 002_rls.sql
-- Description: RLS activation, is_admin() helper, auth sync trigger, and access control policies

-- =========================================================================
-- 1. ROW LEVEL SECURITY ACTIVATION
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 2. ADMIN HELPER FUNCTION
-- =========================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN COALESCE(
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        ),
        false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =========================================================================
-- 3. PROFILE CREATION TRIGGER (On auth.users insert)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, phone, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
        new.raw_user_meta_data->>'avatar_url',
        COALESCE(new.phone, new.raw_user_meta_data->>'phone'),
        'customer'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- 4. POLICIES FOR profiles
-- =========================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own phone number" ON public.profiles;
CREATE POLICY "Users can update own phone number" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
        email = (SELECT email FROM public.profiles WHERE id = auth.uid()) AND
        created_at = (SELECT created_at FROM public.profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins have full access on profiles" ON public.profiles;
CREATE POLICY "Admins have full access on profiles" ON public.profiles
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =========================================================================
-- 5. POLICIES FOR products
-- =========================================================================
DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;
CREATE POLICY "Allow public read access on products" ON public.products
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins have full access on products" ON public.products;
CREATE POLICY "Admins have full access on products" ON public.products
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =========================================================================
-- 6. POLICIES FOR plans
-- =========================================================================
DROP POLICY IF EXISTS "Allow public read access on plans" ON public.plans;
CREATE POLICY "Allow public read access on plans" ON public.plans
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins have full access on plans" ON public.plans;
CREATE POLICY "Admins have full access on plans" ON public.plans
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =========================================================================
-- 7. POLICIES FOR orders
-- =========================================================================
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders" ON public.orders
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can cancel own pending orders" ON public.orders;
CREATE POLICY "Users can cancel own pending orders" ON public.orders
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id AND status = 'Pending')
    WITH CHECK (auth.uid() = user_id AND status = 'Cancelled');

DROP POLICY IF EXISTS "Admins have full access on orders" ON public.orders;
CREATE POLICY "Admins have full access on orders" ON public.orders
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =========================================================================
-- 8. POLICIES FOR subscriptions
-- =========================================================================
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins have full access on subscriptions" ON public.subscriptions;
CREATE POLICY "Admins have full access on subscriptions" ON public.subscriptions
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =========================================================================
-- 9. POLICIES FOR faqs
-- =========================================================================
DROP POLICY IF EXISTS "Allow public read access on faqs" ON public.faqs;
CREATE POLICY "Allow public read access on faqs" ON public.faqs
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins have full access on faqs" ON public.faqs;
CREATE POLICY "Admins have full access on faqs" ON public.faqs
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =========================================================================
-- 10. POLICIES FOR testimonials
-- =========================================================================
DROP POLICY IF EXISTS "Allow public read access on testimonials" ON public.testimonials;
CREATE POLICY "Allow public read access on testimonials" ON public.testimonials
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins have full access on testimonials" ON public.testimonials;
CREATE POLICY "Admins have full access on testimonials" ON public.testimonials
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =========================================================================
-- 11. POLICIES FOR settings
-- =========================================================================
DROP POLICY IF EXISTS "Allow public read access on settings" ON public.settings;
CREATE POLICY "Allow public read access on settings" ON public.settings
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins have full access on settings" ON public.settings;
CREATE POLICY "Admins have full access on settings" ON public.settings
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
