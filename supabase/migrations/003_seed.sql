-- Supabase Migration: 003_seed.sql
-- Description: Seed data in Arabic for products, plans, FAQs, testimonials, and configurations

-- =========================================================================
-- 1. SEED PRODUCT (Google AI Pro)
-- =========================================================================
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

-- =========================================================================
-- 2. SEED PLANS (Google AI Pro Plans)
-- =========================================================================
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

-- =========================================================================
-- 3. SEED 10 FAQs (Arabic)
-- =========================================================================
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

-- =========================================================================
-- 4. SEED 6 TESTIMONIALS (Arabic)
-- =========================================================================
INSERT INTO public.testimonials (id, name, rating, comment, display_order, is_active)
VALUES
    (
        'b3b812a3-0514-476a-a079-0524cb51bfa6',
        'أحمد المجيدي',
        5,
        'خدمة استثنائية وسريعة جداً! تم تفعيل اشتراك Google AI Pro على حسابي الشخصي في أقل من 15 دقيقة. فريق الدعم متعاون جداً وأنصح بالتعامل معهم.',
        1,
        true
    ),
    (
        '67659a88-299f-4318-ae7f-4d929b35bc41',
        'زينب قاسم',
        5,
        'أنصح بالاشتراك من خلالهم بشدة. الأسعار مناسبة جداً مقارنة بالدفع المباشر، والدفع عن طريق زين كاش يسهل العملية كثيراً.',
        2,
        true
    ),
    (
        'ad863f66-1051-432d-8693-e4a6a12bdf70',
        'مصطفى الحسن',
        4,
        'تجربة ممتازة جداً. استغرق التفعيل حوالي 45 دقيقة، ولكن فريق الدعم الفني كان متواصلاً معي طوال الوقت ويجيب على كافة استفساراتي.',
        3,
        true
    ),
    (
        '5f294a50-61b6-4b8c-a7a2-f852b7194645',
        'نور محمد',
        5,
        'اشتراك Google AI Pro أحدث فرقاً كبيراً في إنتاجيتي ودراستي اليومية. شكراً لـ Ninusoft AI لتوفيرها دون الحاجة لبطاقات دفع دولية.',
        4,
        true
    ),
    (
        '9b725c4e-5df5-48b4-93ff-ee5c42a22538',
        'حسن جميل',
        5,
        'أكثر ما أعجبني هو الأمان العالي، لم يطلبوا مني أي كلمة مرور للحساب لتفعيل الخدمة. عمل احترافي وموثوق.',
        5,
        true
    ),
    (
        'be2538ff-e1ef-42f8-bf78-fb9e30a5db22',
        'رانيا خالد',
        5,
        'أفضل موقع لتفعيل اشتراكات الذكاء الاصطناعي في العراق. أستخدم الخدمة منذ 3 أشهر دون أي انقطاع أو مشاكل.',
        6,
        true
    )
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    rating = EXCLUDED.rating,
    comment = EXCLUDED.comment,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- =========================================================================
-- 5. SEED CONFIGURATION SETTINGS (Arabic Meta)
-- =========================================================================
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
