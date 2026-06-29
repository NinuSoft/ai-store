-- =========================================================================
-- SYSTEM RESET SCRIPT FOR NINUSOFT AI
-- WARNING: Running this script will drop all existing tables and data!
-- Execute this in the Supabase SQL Editor.
-- =========================================================================

-- 1. CLEAN TEARDOWN (Drop existing triggers, functions, and tables)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS trg_plans_updated_at ON public.plans;
DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
DROP TRIGGER IF EXISTS trg_settings_updated_at ON public.settings;
DROP TRIGGER IF EXISTS trg_orders_populate_product_id ON public.orders;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(user_id UUID) CASCADE;
DROP FUNCTION IF EXISTS public.handle_order_product_id() CASCADE;

DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.testimonials CASCADE;
DROP TABLE IF EXISTS public.faqs CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.renewals CASCADE;

-- 2. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. FUNCTIONS & TRIGGERS FOR TIMESTAMP TRACKING
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CREATE TABLES & CONSTRAINTS

-- Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT chk_profile_role CHECK (role IN ('customer', 'admin'))
);

-- Products Table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Plans Table
CREATE TABLE public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration_months INTEGER NOT NULL,
    price_iqd INTEGER NOT NULL,
    official_price_iqd INTEGER,
    badge TEXT,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT chk_plan_duration CHECK (duration_months > 0),
    CONSTRAINT chk_plan_price CHECK (price_iqd >= 0),
    CONSTRAINT chk_plan_official_price CHECK (official_price_iqd IS NULL OR official_price_iqd >= 0),
    CONSTRAINT chk_plan_display_order CHECK (display_order >= 0)
);

-- Orders Table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
    plan_id UUID REFERENCES public.plans(id) ON DELETE RESTRICT,
    gmail TEXT NOT NULL,
    phone TEXT,
    product_name_snapshot TEXT,
    plan_name_snapshot TEXT,
    price_snapshot INTEGER,
    status TEXT DEFAULT 'Pending' NOT NULL,
    payment_status TEXT DEFAULT 'Pending' NOT NULL,
    notes TEXT,
    activation_date TIMESTAMPTZ,
    payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT chk_order_price CHECK (price_snapshot IS NULL OR price_snapshot >= 0),
    CONSTRAINT chk_order_status CHECK (status IN ('Pending', 'Processing', 'Activated', 'Rejected', 'Cancelled')),
    CONSTRAINT chk_order_payment_status CHECK (payment_status IN ('Pending', 'AwaitingPayment', 'Paid'))
);

-- Subscriptions Table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
    plan_id UUID REFERENCES public.plans(id) ON DELETE RESTRICT,
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'Active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT chk_subscription_status CHECK (status IN ('Active', 'Expired', 'Cancelled', 'Suspended'))
);

-- FAQs Table
CREATE TABLE public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT chk_faq_display_order CHECK (display_order >= 0)
);

-- Testimonials Table
CREATE TABLE public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT chk_testimonial_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT chk_testimonial_display_order CHECK (display_order >= 0)
);

-- Settings Table
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. APPLY UPDATED_AT TRIGGERS
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_plans_updated_at
    BEFORE UPDATE ON public.plans
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to automatically populate product_id from plans when plan_id is set
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

CREATE TRIGGER trg_orders_populate_product_id
    BEFORE INSERT OR UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_order_product_id();

-- 6. INDEXES
CREATE INDEX idx_orders_user_id ON public.orders (user_id);
CREATE INDEX idx_orders_status ON public.orders (status);
CREATE INDEX idx_orders_payment_status ON public.orders (payment_status);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions (user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions (status);
CREATE INDEX idx_plans_product_id ON public.plans (product_id);
CREATE INDEX idx_products_slug ON public.products (slug);

-- Performance Composite Indexes
CREATE INDEX idx_plans_active_ordered ON public.plans (product_id, is_active, display_order);
CREATE INDEX idx_faqs_active_ordered ON public.faqs (is_active, display_order);
CREATE INDEX idx_testimonials_active_ordered ON public.testimonials (is_active, display_order);
CREATE INDEX idx_subscriptions_active_expires_at ON public.subscriptions (expires_at) WHERE status = 'Active';
CREATE INDEX idx_orders_created_at_desc ON public.orders (created_at DESC);
CREATE INDEX idx_subscriptions_created_at_desc ON public.subscriptions (created_at DESC);
CREATE INDEX idx_profiles_created_at_desc ON public.profiles (created_at DESC);
CREATE INDEX idx_products_active ON public.products (is_active);

-- 7. SECURITY DEFINER HELPER FOR ADMIN
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

-- 8. PROFILE CREATION TRIGGER (On auth.users insert)
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

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own phone number" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
        email = (SELECT email FROM public.profiles WHERE id = auth.uid()) AND
        created_at = (SELECT created_at FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "Admins have full access on profiles" ON public.profiles
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Products Policies
CREATE POLICY "Allow public read access on products" ON public.products
    FOR SELECT TO public USING (true);

CREATE POLICY "Admins have full access on products" ON public.products
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Plans Policies
CREATE POLICY "Allow public read access on plans" ON public.plans
    FOR SELECT TO public USING (true);

CREATE POLICY "Admins have full access on plans" ON public.plans
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Orders Policies
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own pending orders" ON public.orders
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id AND status = 'Pending')
    WITH CHECK (auth.uid() = user_id AND status = 'Cancelled');

CREATE POLICY "Admins have full access on orders" ON public.orders
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Subscriptions Policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access on subscriptions" ON public.subscriptions
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- FAQs Policies
CREATE POLICY "Allow public read access on faqs" ON public.faqs
    FOR SELECT TO public USING (true);

CREATE POLICY "Admins have full access on faqs" ON public.faqs
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Testimonials Policies
CREATE POLICY "Allow public read access on testimonials" ON public.testimonials
    FOR SELECT TO public USING (true);

CREATE POLICY "Admins have full access on testimonials" ON public.testimonials
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Settings Policies
CREATE POLICY "Allow public read access on settings" ON public.settings
    FOR SELECT TO public USING (true);

CREATE POLICY "Admins have full access on settings" ON public.settings
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 10. SEED PRODUCTS
INSERT INTO public.products (id, name, slug, description, is_active)
VALUES (
    'e5b98f24-5d5d-4f10-bf9d-f685d03a11b6',
    'Google AI Pro',
    'google-ai-pro',
    'اشتراك Google AI Pro مع ميزات الذكاء الاصطناعي الفائقة وقدرات التحليل المتقدمة.',
    true
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

-- 11. SEED PLANS
INSERT INTO public.plans (id, product_id, name, duration_months, price_iqd, official_price_iqd, badge, is_featured, display_order, is_active)
VALUES
    (
        'c7e47dfa-28bb-4a5f-9e7c-b6a3de17b189',
        'e5b98f24-5d5d-4f10-bf9d-f685d03a11b6',
        'شهر واحد',
        1,
        20000,
        26500,
        NULL,
        false,
        1,
        true
    ),
    (
        'e14d1d6a-54de-4f3b-ba4b-d779a54ff8bc',
        'e5b98f24-5d5d-4f10-bf9d-f685d03a11b6',
        '3 أشهر',
        3,
        30000,
        80000,
        'وفر 50 ألف د.ع',
        false,
        2,
        true
    ),
    (
        'a2205567-0c7f-4f51-b8be-b9222c53f538',
        'e5b98f24-5d5d-4f10-bf9d-f685d03a11b6',
        '12 شهرًا',
        12,
        40000,
        300000,
        'العرض الأفضل',
        true,
        3,
        true
    ),
    (
        '1c3b6fbe-6cb1-4475-ae90-c247ff5f5822',
        'e5b98f24-5d5d-4f10-bf9d-f685d03a11b6',
        '18 شهرًا',
        18,
        55000,
        450000,
        'الخيار الاحترافي',
        false,
        4,
        true
    )
ON CONFLICT (id) DO UPDATE
SET product_id = EXCLUDED.product_id,
    name = EXCLUDED.name,
    duration_months = EXCLUDED.duration_months,
    price_iqd = EXCLUDED.price_iqd,
    official_price_iqd = EXCLUDED.official_price_iqd,
    badge = EXCLUDED.badge,
    is_featured = EXCLUDED.is_featured,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- 12. SEED 10 FAQs
INSERT INTO public.faqs (id, question, answer, display_order, is_active)
VALUES
    (
        '938b812a-3051-4e76-a079-0524cb51bfa6',
        'ما هو نينوسوفت للذكاء الاصطناعي (Ninusoft AI)؟',
        'نينوسوفت للذكاء الاصطناعي هي منصة رائدة توفر اشتراكات أدوات الذكاء الاصطناعي المدفوعة، بما في ذلك اشتراك Google AI Pro، بأسعار محلية مخفضة ومناسبة للمستخدمين في العراق.',
        1,
        true
    ),
    (
        '57659a88-299f-4318-ae7f-4d929b35bc41',
        'كيف تتم عملية تفعيل الاشتراك؟',
        'بعد إتمام الطلب، يتلقى فريقنا طلبك ويقوم بتفعيل الاشتراك الرسمي يدوياً على عنوان Gmail الذي زودتنا به. ستتلقى تأكيداً عبر البريد الإلكتروني بمجرد اكتمال التفعيل.',
        2,
        true
    ),
    (
        '9d863f66-1051-432d-8693-e4a6a12bdf70',
        'هل أحتاج إلى مشاركة كلمة مرور حساب Gmail الخاص بي؟',
        'لا، لن نطلب منك كلمة المرور الخاصة بك أبداً. عملية التفعيل آمنة تماماً وتحافظ على خصوصية حسابك بالكامل.',
        3,
        true
    ),
    (
        '4f294a50-61b6-4b8c-a7a2-f852b7194645',
        'ما هي طرق الدفع المدعومة؟',
        'نحن ندعم طرق الدفع المحلية الأكثر شيوعاً في العراق، مثل زين كاش (Zain Cash)، وآسيا حوالة (AsiaCell)، وفاست بي (FastPay)، وبوابة الطيف.',
        4,
        true
    ),
    (
        '8b725c4e-5df5-48b4-93ff-ee5c42a22538',
        'كم من الوقت يستغرق تفعيل الاشتراك؟',
        'يستغرق التفعيل عادةً من 15 دقيقة إلى 3 ساعات خلال ساعات عملنا اليومية (من 9:00 صباحاً حتى 11:00 مساءً بتوقيت بغداد).',
        5,
        true
    ),
    (
        'ae2538ff-e1ef-42f8-bf78-fb9e30a5db22',
        'هل يمكنني تجديد اشتراك حالي؟',
        'نحن ندعم تجديد الاشتراكات بسهولة من خلال منصتنا قبل انتهاء صلاحيتها أو بعدها، وسيتم الحفاظ على جميع بياناتك وملفاتك السابقة دون أي تغيير.',
        6,
        true
    ),
    (
        'b362ffaa-c2d7-4638-95ef-f538e12d6a78',
        'هل هذه الاشتراكات رسمية ومضمونة؟',
        'نعم، جميع الاشتراكات رسمية وقانونية 100% ومفعّلة مباشرة من مزودي الخدمة الرسميين، وتدعم كافة التحديثات والميزات الرسمية.',
        7,
        true
    ),
    (
        '11c47dfd-a8bb-4b9d-a417-7389ab4cf538',
        'ما هي سياسة الاسترجاع الخاصة بكم؟',
        'في حال تعذر تفعيل اشتراكك خلال 24 ساعة من إتمام الدفع، يحق لك الحصول على استرداد كامل للمبلغ المدفوع دون أي اقتطاع.',
        8,
        true
    ),
    (
        '7381d6f2-bb4a-438b-9e90-c247a3e8ab22',
        'هل يمكنني استخدام الاشتراك على أجهزة متعددة؟',
        'نعم، بما أن الاشتراك يتم تفعيله وربطه مباشرة بحسابك الرسمي في جوجل، يمكنك استخدامه على أي جهاز تقوم بتسجيل الدخول إليه باستخدام حسابك.',
        9,
        true
    ),
    (
        '2b1a37c9-4a11-4cb5-ae90-c47ff5f58bc7',
        'كيف يمكنني التواصل مع الدعم الفني؟',
        'يمكنك التواصل معنا مباشرة عبر الواتساب أو التلغرام أو البريد الإلكتروني المخصص للدعم. جميع الروابط متوفرة في قسم الدعم أسفل الصفحة.',
        10,
        true
    )
ON CONFLICT (id) DO UPDATE
SET question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- 13. SEED TESTIMONIALS
INSERT INTO public.testimonials (id, name, rating, comment, display_order, is_active)
VALUES
    (
        'b3b812a3-0514-476a-a079-0524cb51bfa6',
        'أحمد المجيدي',
        5,
        'والله الخدمة فد شي راقي وسريعة كلش! تفعل عندي اشتراك Google AI Pro على حسابي بأقل من ربع ساعة. الجماعة بالدعم كلش متعاونين وخلوقين، أنصح بيهم وبشدة.',
        1,
        true
    ),
    (
        '67659a88-299f-4318-ae7f-4d929b35bc41',
        'زينب قاسم',
        5,
        'كلش أنصح تشتركون من عدهم. الأسعار كلش مناسبة ورخيصة مقارنة بالاشتراك المباشر، وأهم شي الدفع بزين كاش مريح وميحتاج فيزا كارت تعقد الأمور.',
        2,
        true
    ),
    (
        'ad863f66-1051-432d-8693-e4a6a12bdf70',
        'مصطفى الحسن',
        4,
        'تجربة ممتازة وتوب. صح التفعيل أخذ تقريباً 45 دقيقة بس ولد الدعم الفني ما عافوني لحظة وجاوبوا على كل أسئلتي بصدر رحب. بارك الله بيكم.',
        3,
        true
    ),
    (
        '5f294a50-61b6-4b8c-a7a2-f852b7194645',
        'نور محمد',
        5,
        'اشتراك Google AI Pro فادني كلش بدراستي وشغلي اليومي وسهل هواي أمور. شكراً لـ Ninusoft AI لأن ريحتنا من سالفة بطاقات الدفع والفيزا كارتات الما تشتغل.',
        4,
        true
    ),
    (
        '9b725c4e-5df5-48b4-93ff-ee5c42a22538',
        'حسن جميل',
        5,
        'أكثر شي عجبني وريحني هو الأمان، ما طلبوا مني أي باسورد للحساب مالتي حتى يفعلون الاشتراك. شغل مرتب، احترافي وموثوق كلش.',
        5,
        true
    ),
    (
        'be2538ff-e1ef-42f8-bf78-fb9e30a5db22',
        'رانيا خالد',
        5,
        'أحسن وأرقى موقع لتفعيل اشتراكات الذكاء الاصطناعي بالعراق بلا منافس. صارلي 3 أشهر أستخدم الخدمة وما واجهت أي قطوعات أو مشاكل. عاشت إيدكم!',
        6,
        true
    )
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    rating = EXCLUDED.rating,
    comment = EXCLUDED.comment,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- 14. SEED CONFIGURATION SETTINGS
INSERT INTO public.settings (key, value)
VALUES
    (
        'whatsapp',
        '{"value": "+9647750977509", "label": "الدعم الفني عبر الواتساب", "description": "قناة الدعم الفني الرسمية من خلال تطبيق الواتساب."}'::jsonb
    ),
    (
        'telegram',
        '{"value": "https://t.me/ninusoft", "label": "الدعم الفني عبر التلغرام", "description": "قناة الدعم الفني الرسمية على منصة التلغرام."}'::jsonb
    ),
    (
        'support_email',
        '{"value": "support@ninusoft.com", "label": "البريد الإلكتروني للدعم", "description": "البريد الإلكتروني المخصص لاستلام طلبات واستفسارات الدعم الفني."}'::jsonb
    ),
    (
        'exchange_rate',
        '{"value": 1500, "label": "سعر صرف الدولار (د.ع)", "description": "سعر صرف الدولار الأمريكي مقابل الدينار العراقي المعتمد للخطط."}'::jsonb
    ),
    (
        'google_official_annual_price',
        '{"value": 240, "label": "سعر جوجل السنوي الرسمي ($)", "description": "السعر السنوي الرسمي لاشتراك Google One AI Premium بالدولار الأمريكي."}'::jsonb
    )
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value;

-- =========================================================================
-- 15. ENABLE REALTIME REPLICATION
-- =========================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_rel pr 
        JOIN pg_class c ON pr.prrelid = c.oid 
        JOIN pg_publication p ON pr.prpubid = p.oid 
        WHERE p.pubname = 'supabase_realtime' AND c.relname = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_rel pr 
        JOIN pg_class c ON pr.prrelid = c.oid 
        JOIN pg_publication p ON pr.prpubid = p.oid 
        WHERE p.pubname = 'supabase_realtime' AND c.relname = 'subscriptions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_rel pr 
        JOIN pg_class c ON pr.prrelid = c.oid 
        JOIN pg_publication p ON pr.prpubid = p.oid 
        WHERE p.pubname = 'supabase_realtime' AND c.relname = 'profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
END $$;

