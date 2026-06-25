-- Database Schema for Google AI Pro Iraq Storefront

-- 1. ENABLE EXTENSIONS (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE PLAN TABLE
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    duration_months INT NOT NULL,
    price_iqd INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CREATE USERS PROFILE TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    phone TEXT,
    is_admin BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CREATE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.plans(id) ON DELETE RESTRICT NOT NULL,
    gmail TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT DEFAULT 'pending'::text NOT NULL CHECK (status IN ('pending', 'processing', 'awaiting_payment', 'paid', 'expired', 'rejected')),
    activation_date TIMESTAMP WITH TIME ZONE,
    payment_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CREATE SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.plans(id) ON DELETE RESTRICT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'active'::text NOT NULL CHECK (status IN ('active', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CREATE RENEWALS TABLE
CREATE TABLE IF NOT EXISTS public.renewals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending'::text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CREATE TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_renewals_user_id ON public.renewals(user_id);
CREATE INDEX IF NOT EXISTS idx_renewals_status ON public.renewals(status);

-- 8. HELPER SECURITY FUNCTION FOR ADMIN CHECKS
-- Using SECURITY DEFINER to bypass RLS policies and prevent recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = user_id AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Plans Policies
CREATE POLICY "Allow read access to plans for everyone" ON public.plans
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow write access to plans for admins only" ON public.plans
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Users Policies
CREATE POLICY "Allow users to read their own profile" ON public.users
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" ON public.users
    FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Allow admins to manage all profiles" ON public.users
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Orders Policies
CREATE POLICY "Allow users to see their own orders" ON public.orders
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow users to create orders" ON public.orders
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admins to manage all orders" ON public.orders
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Subscriptions Policies
CREATE POLICY "Allow users to view their own subscriptions" ON public.subscriptions
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to manage all subscriptions" ON public.subscriptions
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Renewals Policies
CREATE POLICY "Allow users to see their own renewals" ON public.renewals
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow users to request renewals" ON public.renewals
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admins to manage all renewals" ON public.renewals
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Testimonials Policies
CREATE POLICY "Allow read access to testimonials for everyone" ON public.testimonials
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin access to testimonials" ON public.testimonials
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 10. AUTH TRIGGER TO CREATE PUBLIC USER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, phone, is_admin)
    VALUES (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'phone', ''),
        -- First registered user can be designated admin for testing convenience, or check for specific email
        CASE WHEN NOT EXISTS (SELECT 1 FROM public.users) THEN true ELSE false END
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. SEED DEFAULT PLANS
INSERT INTO public.plans (name, duration_months, price_iqd) VALUES
('Google AI Pro - شهر واحد', 1, 20000),
('Google AI Pro - 3 أشهر', 3, 30000),
('Google AI Pro - 12 شهر', 12, 40000)
ON CONFLICT DO NOTHING;

-- 12. SEED DEFAULT TESTIMONIALS
INSERT INTO public.testimonials (name, rating, comment) VALUES
('أحمد الخفاجي', 5, 'خدمة ممتازة وسريعة جداً. تم تفعيل اشتراك Google AI Pro خلال أقل من ساعة. أنصح بالتعامل معهم بشدة!'),
('مريم الجبوري', 5, 'كطالبة دراسات عليا، أدوات Gemini Advanced ساعدتني كثيراً في أبحاثي. السعر مناسب جداً مقارنة بالميزات.'),
('سيف الدين علي', 5, 'بصفتي مبرمج، أستخدم الذكاء الاصطناعي بشكل يومي. التفعيل رسمي 100% والدعم الفني متعاون جداً عبر واتساب.'),
('زينب الربيعي', 5, 'أنصح باشتراك الـ 12 شهراً، هو الأوفر والدفع محلي بالدينار العراقي وهو ما يحل مشكلة كبيرة للكثيرين.'),
('مصطفى كمال', 5, 'تفعيل سريع جداً وحساب شخصي بالكامل وليس حساباً مشتركاً. هذا يضمن خصوصية ملفاتي وبياناتي.'),
('فاطمة البغدادي', 5, 'أفضل خدمة بيع اشتراكات ذكاء اصطناعي في العراق. الدعم متواجد دائماً للإجابة على أي استفسار.'),
('علي الحلفي', 5, 'استخدمه لصناعة المحتوى وكتابة المقالات. أداة جبارة وتفعيل ممتاز بدون الحاجة لأي VPN.'),
('نور الهدى', 5, 'شكراً لكم على هذه الخدمة الرائعة. التفعيل تم على حسابي الشخصي ولم أحتاج إلى تغيير أي إعدادات.'),
('حيدر الكعبي', 5, 'أفضل قيمة مقابل السعر في السوق العراقي. خدمة عملاء ممتازة ومتابعة مستمرة.'),
('سارة التميمي', 5, 'توفير الدفع المحلي هو الميزة الأبرز، التفعيل رسمي ومباشر. تجربة رائعة وسأقوم بالتجديد بكل تأكيد.')
ON CONFLICT DO NOTHING;
