import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Sparkles, CheckCircle2, ShieldCheck, MessageSquare,
  CreditCard, Laptop, Brain, FileText, Image as ImageIcon,
  Code, PenTool, Search, Check
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { StatsCounter } from '../components/StatsCounter';
import { TestimonialsCarousel } from '../components/TestimonialsCarousel';
import { FAQAccordion } from '../components/FAQAccordion';
import { OrderModal } from '../components/OrderModal';
import { IntroScreen } from '../components/IntroScreen';
import { supabase } from '../lib/supabase';
import { ThemeToggle } from '../components/ThemeToggle';
import { ScrollProgressButton } from '../components/ScrollProgressButton';

interface Plan {
  id: string;
  name: string;
  duration_months: number;
  price_iqd: number;
  official_price_iqd?: number;
}

export const Home: React.FC = () => {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Plans & CRO States
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(() => !!document.getElementById('ns-intro'));
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 14, seconds: 45 });

  // Listen to redirect query param from protected route guards
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('login') === 'true') {
      signInWithGoogle().catch(err => console.error('Redirect sign-in error:', err));
      navigate('/', { replace: true });
    }
  }, [location, navigate, signInWithGoogle]);

  // Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price_iqd', { ascending: true });
      if (!error && data) {
        setPlans(data);
      }
    };
    fetchPlans();
  }, []);

  const [whatsappNum, setWhatsappNum] = useState('9647750977509');

  // Fetch settings (WhatsApp number)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*');
        if (!error && data) {
          const wa = data.find((s: any) => s.key === 'whatsapp');
          if (wa && wa.value) {
            let val = typeof wa.value === 'string' ? JSON.parse(wa.value).value : wa.value.value;
            if (val) {
              const cleanNum = val.replace(/\D/g, '');
              setWhatsappNum(cleanNum);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching settings from Supabase:', err);
      }
    };
    fetchSettings();
  }, []);

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsOrderModalOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <div style={{ position: 'relative' }}>
      {showIntro && <IntroScreen onComplete={() => setShowIntro(false)} />}

      {/* 1. LOSS AVERSION COUNTDOWN BANNER */}
      <div className="countdown-banner flex items-center justify-center gap-4">
        <span>⚡ الأسعار الحالية محدودة! اشترك الآن قبل انتهاء العرض</span>
        <span
          className="number-latin"
          style={{
            background: 'rgba(0,0,0,0.25)',
            padding: '3px 12px',
            borderRadius: '9999px',
            fontWeight: 900,
            letterSpacing: '0.05em',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          {countdown.hours.toString().padStart(2, '0')}:{countdown.minutes.toString().padStart(2, '0')}:{countdown.seconds.toString().padStart(2, '0')}
        </span>
      </div>

      {/* 2. HEADER — Premium glassy navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          background: 'var(--surface-glass)',
          backdropFilter: 'blur(24px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
          borderBottom: '1px solid var(--border)',
          zIndex: 1001,
          padding: '14px 0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
        }}
      >
        <div className="container flex items-center justify-between">

          {/* Brand logo */}
          <div
            className="flex items-center gap-3"
            style={{ cursor: 'pointer' }}
            onClick={() => scrollToSection('hero')}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-primary)',
                flexShrink: 0
              }}
            >
              <Sparkles size={18} color="white" />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.01em' }}>
              NinuSoft <span style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>AI</span>
            </span>
          </div>

          {/* Desktop Nav links */}
          <nav className="flex items-center gap-2">
            {[
              { label: 'الرئيسية', id: 'hero' },
              { label: 'المميزات', id: 'benefits' },
              { label: 'الأسعار', id: 'pricing' },
              { label: 'الأسئلة الشائعة', id: 'faq' },
            ].map(({ label, id }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(id); }}
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  transition: 'var(--transition-sm)',
                  display: 'block'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--primary-light)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--primary)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                }}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Auth + CTA */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link
                to="/dashboard"
                className="btn btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.875rem', borderRadius: '9999px' }}
              >
                لوحة التحكم
              </Link>
            ) : (
              <button
                onClick={() => signInWithGoogle().catch(err => console.error('Sign-in error:', err))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  padding: '8px 14px',
                  borderRadius: '9999px',
                  transition: 'var(--transition-sm)'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--text)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--surface-alt)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                تسجيل الدخول
              </button>
            )}
            <button
              onClick={() => scrollToSection('pricing')}
              className="btn btn-primary"
              style={{ padding: '9px 22px', fontSize: '0.875rem', borderRadius: '9999px', fontWeight: 700 }}
            >
              اشترك الآن
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section
        id="hero"
        style={{
          padding: '80px 0 60px 0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="container flex flex-col items-center justify-center text-center gap-6 max-w-4xl mx-auto">
          <div className="animate-fade-in flex flex-col items-center gap-6 w-full">
            <div className="badge badge-success" style={{ width: 'max-content' }}>
              التفعيل أولاً - الدفع لاحقاً
            </div>

            <h1 style={{ fontWeight: 900, color: 'var(--text)', lineHeight: '1.2' }}>
              احصل على <span className="shimmer-text">Google AI Pro</span> على حسابك الشخصي وادفع بعد التأكد
            </h1>

            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.85' }}>
              لا نطلب أي دفعة مسبقة. نقوم بتنشيط الاشتراك الرسمي على حساب Gmail الشخصي الخاص بك أولاً، ثم تقوم بالدفع محلياً بعد التأكد من نجاح التفعيل وظهور كامل المزايا.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => scrollToSection('pricing')}
                className="btn btn-primary"
                style={{ padding: '14px 38px', fontSize: '1.05rem', borderRadius: 'var(--radius-xl)' }}
              >
                اشترك الآن
              </button>

              <button
                onClick={() => scrollToSection('pricing')}
                className="btn btn-outline"
                style={{ padding: '14px 32px', fontSize: '1.05rem', borderRadius: 'var(--radius-xl)' }}
              >
                عرض الباقات
              </button>
            </div>

            {/* Micro-trust indicators under CTA */}
            <div className="flex justify-center gap-6 mt-4" style={{ flexWrap: 'wrap' }}>
              <div className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>تفعيل رسمي ومضمون 100%</span>
              </div>
              <div className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>حسابك الشخصي بالكامل</span>
              </div>
              <div className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>دعم فني عبر واتساب 24/7</span>
              </div>
            </div>

            {/* Customer Avatar Stack / Social Proof */}
            <div className="flex flex-col items-center gap-3 mt-6 border-t border-dashed border-[var(--border)] pt-6">
              <div className="flex justify-center -space-x-3 space-x-reverse">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--surface)] bg-[var(--surface-alt)] flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=e2e8f0`} alt={`User ${i}`} className="w-full h-full" />
                  </div>
                ))}
              </div>
              <div className="text-center">
                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)' }}>
                  ينصح به أكثر من 2,500 مشترك في العراق
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  تفعيل فوري ودعم فني متكامل ومستمر
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SOCIAL PROOF SOCIAL COUNTERS */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--secondary-glow) 100%)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '48px 0'
        }}
      >
        <div className="container grid grid-cols-4 gap-6 text-center">
          <div className="flex flex-col gap-2 animate-fade-in animate-delay-1">
            <span style={{ fontSize: '3rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              +<StatsCounter target={2500} />
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>اشتراك مفعل في العراق</span>
          </div>

          <div className="flex flex-col gap-2 animate-fade-in animate-delay-2">
            <span style={{ fontSize: '3rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--secondary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              <StatsCounter target={98} />%
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>نسبة رضا العملاء</span>
          </div>

          <div className="flex flex-col gap-2 animate-fade-in animate-delay-3">
            <span style={{ fontSize: '3rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--success), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              +<StatsCounter target={1200} />
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>عملية تجديد ناجحة</span>
          </div>

          <div className="flex flex-col gap-2 animate-fade-in animate-delay-4">
            <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text)' }}>
              <span className="number-latin">24/7</span>
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>دعم فني متواصل</span>
          </div>
        </div>
      </section>

      {/* 5. BENEFITS SECTION */}
      <section id="benefits" className="section-padding">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="badge badge-primary mb-4">مزايا لا حصر لها</div>
            <h2 style={{ color: 'var(--text)', marginBottom: '16px' }}>
              ماذا ستحصل عليه مع <span className="shimmer-text">Google AI Pro</span>؟
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.7' }}>
              احصل على أحدث وأقوى تقنيات الذكاء الاصطناعي من جوجل المدمجة مباشرة في حسابك الشخصي.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">

            {/* Card 1 */}
            <div className="glass-panel flex flex-col gap-4">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', color: 'var(--primary)', justifyContent: 'center' }}>
                <Brain size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>Gemini Advanced</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                الوصول إلى أحدث نماذج جوجل 1.5 Pro الأكثر كفاءة في أداء المهام المعقدة، البرمجة، والتحليل المنطقي.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-panel flex flex-col gap-4">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', color: 'var(--secondary)', justifyContent: 'center' }}>
                <FileText size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>تحليل الملفات الضخمة</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                ارفع ملفات PDF، المستندات، الجداول والتقارير الضخمة وحللها في ثوانٍ للحصول على خلاصات دقيقة وعميقة.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-panel flex flex-col gap-4">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', color: 'var(--success)', justifyContent: 'center' }}>
                <Search size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>البحث والربط المتطور</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                ربط حسابك بأدوات جوجل الأخرى كخرائط جوجل، يوتيوب، وGmail لتجربة بحث وربط معلومات ذكية للغاية.
              </p>
            </div>

            {/* Card 4 */}
            <div className="glass-panel flex flex-col gap-4">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', color: 'var(--warning)', justifyContent: 'center' }}>
                <ImageIcon size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>إنشاء وتوليد الصور</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                استفد من نموذج Imagen 3 لإنشاء وتوليد صور احترافية وفنية فائقة الدقة بتوجيهات نصية بسيطة.
              </p>
            </div>

            {/* Card 5 */}
            <div className="glass-panel flex flex-col gap-4">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', color: 'var(--danger)', justifyContent: 'center' }}>
                <Code size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>مساعد البرمجة الذكي</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                اكتب، واختبر، واكتشف الأخطاء في الكود البرمجي بمختلف اللغات وتلقى شرحاً وافياً وحلولاً مقترحة فورية.
              </p>
            </div>

            {/* Card 6 */}
            <div className="glass-panel flex flex-col gap-4">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', color: '#3b82f6', justifyContent: 'center' }}>
                <PenTool size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>إنتاج المحتوى وكتابة الرسائل</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                توليد مقالات، تقارير، منشورات تواصل اجتماعي ورسائل بريد احترافية بلهجات مختلفة وبسرعة قياسية.
              </p>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <div className="flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 24px', fontSize: '0.95rem' }}>
              <Laptop size={18} style={{ color: 'var(--secondary)' }} />
              <span>الاشتراك يعمل بكل سلاسة على الهواتف والأجهزة اللوحية وأجهزة الكمبيوتر.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5.5. TRUST INFO SECTION */}
      <section
        className="section-padding"
        style={{
          background: 'var(--background-alt)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
            <div className="flex flex-col gap-6">
              <div className="badge badge-primary" style={{ width: 'max-content' }}>لماذا متجرنا؟</div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text)', lineHeight: '1.3' }}>
                نحن لسنا مجرد وسطاء،<br />بل نقدم خدمة برمجية موثوقة ومضمونة.
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7' }}>
                في NinuSoft، نتفهم مدى أهمية الأمان والمصداقية في المعاملات المالية والخدمات التقنية في العراق. لذلك ابتكرنا نموذج "التفعيل أولاً ثم الدفع" لنضمن حصولك على كامل المزايا على حسابك الشخصي بكل ثقة ودون قلق.
              </p>
              <ul className="flex flex-col gap-4 mt-2" style={{ listStyle: 'none' }}>
                {[
                  "شركة برمجيات حقيقية ذات مصداقية وتواجد محلي",
                  "تفعيل رسمي ومضمون طوال فترة الاشتراك بنسبة 100%",
                  "دعم فني مباشر ومستمر عبر الواتساب لحل أي مشكلة فوراً",
                  "تفعيل آمن بالكامل على حساب Gmail الشخصي دون طلب كلمة المرور",
                  "لوحة تحكم ذكية خاصة بك لمتابعة اشتراكاتك وطلب التجديد بسهولة"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3" style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                    <CheckCircle2 size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  borderRadius: 'var(--radius)',
                  filter: 'blur(30px)',
                  opacity: 0.15,
                  pointerEvents: 'none'
                }}
              />
              <div
                className="glass-panel"
                style={{
                  background: 'var(--surface-glass)',
                  borderColor: 'var(--border)',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
                  <div className="flex flex-col gap-1">
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>حالة الاشتراك</span>
                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      مفعّل ونشط
                    </span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>الخطة الحالية</span>
                    <span style={{ fontWeight: 800, color: 'var(--text)' }}>Google AI Pro</span>
                  </div>
                </div>

                <div className="flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <ShieldCheck size={36} style={{ color: 'var(--primary)' }} />
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>حماية وضمان ذهبي 100%</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      التنشيط يتم عبر دعوة رسمية من نظام جوجل إلى بريدك الإلكتروني مباشرة.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5.6. SAVINGS COMPARISON SECTION */}
      <section className="section-padding" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px' }}>
              لماذا تدفع مبالغ طائلة؟
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              نقدم لك نفس الميزات والاشتراك الرسمي بجزء بسيط من السعر العالمي وبطرق دفع محلية تناسبك.
            </p>
          </div>

          <div
            className="glass-panel flex flex-col md:flex-row"
            style={{
              padding: 0,
              overflow: 'hidden',
              border: '1px solid var(--border)',
              background: 'transparent'
            }}
          >
            {/* Google Cost */}
            <div
              className="w-full md:w-1/2"
              style={{
                padding: '40px',
                background: 'var(--surface-glass)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                borderLeft: '1px solid var(--border)'
              }}
            >
              <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '1rem', marginBottom: '16px' }}>السعر الرسمي من Google</span>
              <span className="number-latin" style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                360,000
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>د.ع / سنوياً</span>
            </div>

            {/* Our Cost */}
            <div
              className="w-full md:w-1/2"
              style={{
                padding: '40px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                color: 'white',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  opacity: 0.1
                }}
              >
                <Sparkles size={120} />
              </div>
              <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 700, fontSize: '1rem', marginBottom: '16px' }}>سعر NinuSoft AI</span>
              <span className="number-latin" style={{ fontSize: '3.2rem', fontWeight: 900 }}>
                40,000
              </span>
              <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '4px' }}>د.ع / سنوياً</span>
              <div
                style={{
                  marginTop: '24px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '9999px',
                  padding: '6px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 800
                }}
              >
                وفر أكثر من 88%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRICING SECTION */}
      <section id="pricing" className="section-padding" style={{ position: 'relative', overflow: 'hidden' }}>

        {/* Background glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 55% at 50% 50%, var(--primary-light) 0%, transparent 70%)'
        }} />

        <div className="container" style={{ position: 'relative' }}>

          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="badge badge-primary mb-4" style={{ fontSize: '0.8rem' }}>باقات Google AI Pro</div>
            <h2 style={{ color: 'var(--text)', marginBottom: '18px' }}>
              خطة واحدة،{' '}
              <span className="shimmer-text">مدد مختلفة</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.75' }}>
              نوفّر اشتراك <strong style={{ color: 'var(--text)' }}>Google AI Pro</strong> الرسمي على حسابك الشخصي — اختر المدة التي تناسبك وادفع بعد التأكد من التفعيل.
            </p>
          </div>

          {/* What's included — shared feature strip */}
          <div style={{
            background: 'var(--surface-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '28px 36px',
            maxWidth: '900px',
            margin: '0 auto 48px',
          }}>
            <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              كل باقة تشمل — نفس المزايا الرسمية الكاملة لـ Google AI Pro
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px 24px',
            }}>
              {[
                { icon: <Brain size={14} className="text-[var(--primary)]" />, label: 'Gemini Pro — نموذج الذكاء الاصطناعي المتقدم' },
                { icon: <Laptop size={14} className="text-[var(--primary)]" />, label: '5 تيرابايت تخزين على Google One' },
                { icon: <Sparkles size={14} className="text-[var(--primary)]" />, label: 'AI في Gmail, Docs, Slides, Sheets' },
                { icon: <Brain size={14} className="text-[var(--primary)]" />, label: 'سياق مليون رمز — Deep Research' },
                { icon: <ImageIcon size={14} className="text-[var(--primary)]" />, label: 'توليد وتعديل الصور بالذكاء الاصطناعي' },
                { icon: <Laptop size={14} className="text-[var(--primary)]" />, label: 'توليد فيديو في Google Vids' },
                { icon: <MessageSquare size={14} className="text-[var(--primary)]" />, label: 'Gemini Live — محادثة صوتية' },
                { icon: <Laptop size={14} className="text-[var(--primary)]" />, label: 'مزايا Meet Premium واجتماعات HD' },
                { icon: <MessageSquare size={14} className="text-[var(--primary)]" />, label: 'دعم فني 24/7 عبر واتساب' },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '30px', height: '30px', flexShrink: 0,
                    background: 'var(--primary-light)',
                    border: '1px solid hsla(237,90%,58%,0.15)',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px',
                  }}>{icon}</span>
                  <span style={{ fontSize: '0.87rem', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.3 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Duration cards */}
          <div
            className="pricing-grid"
            style={{
              display: 'grid',
              maxWidth: '1000px',
              margin: '0 auto',
              alignItems: 'stretch',
              paddingTop: '12px',
            }}
          >
            <style>{`
              .pricing-grid {
                grid-template-columns: 1fr;
                gap: 16px;
                padding: 0;
              }
              @media (min-width: 768px) {
                .pricing-grid {
                  grid-template-columns: repeat(3, minmax(0, 1fr));
                  gap: 32px;
                }
              }
              @media (max-width: 767px) {
                .pricing-card-elevated { transform: translateY(0) !important; }
              }
            `}</style>
            {plans.map((p) => {
              const isRecommended = p.duration_months === 12;
              const isMid = p.duration_months === 3;
              const monthlyPrice = Math.round(p.price_iqd / p.duration_months);

              // Reference: compute savings relative to official Google price if available, otherwise vs monthly base
              const basePlan = plans.find(x => x.duration_months === 1);
              const savingsPct = p.official_price_iqd && p.official_price_iqd > p.price_iqd
                ? Math.round((1 - p.price_iqd / p.official_price_iqd) * 100)
                : (basePlan && p.duration_months > 1
                  ? Math.round((1 - monthlyPrice / basePlan.price_iqd) * 100)
                  : 0);

              return (
                <div
                  key={p.id}
                  className={`relative group rounded-[24px] border transition-all duration-500 flex flex-col h-full ${isRecommended
                      ? 'border-[var(--primary)] pricing-card-recommended pricing-card-elevated shadow-[0_20px_40px_rgba(99,102,241,0.12)]'
                      : 'border-[var(--border)] shadow-md hover:border-[var(--primary)]/30 hover:shadow-xl'
                    }`}
                  style={{
                    background: isRecommended ? 'var(--surface-raised)' : 'var(--surface-glass)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    transform: isRecommended ? 'translateY(-8px)' : 'translateY(0)',
                    transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease, border-color 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    if (!isRecommended) {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                    } else {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-12px)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isRecommended) {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    } else {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-8px)';
                    }
                  }}
                >
                  {/* Animated glow border for recommended */}
                  {isRecommended && (
                    <div style={{
                      position: 'absolute',
                      inset: '-2px',
                      borderRadius: '26px',
                      background: 'linear-gradient(135deg, hsl(258,82%,60%), hsl(220,90%,65%), hsl(195,90%,60%), hsl(258,82%,60%))',
                      backgroundSize: '300% 300%',
                      animation: 'shimmer 3s linear infinite',
                      zIndex: -1,
                    }} />
                  )}

                  {/* Card Header */}
                  <div className="p-4 md:p-6 pb-3 md:pb-4 border-b border-[var(--border)]/40 relative overflow-hidden">
                    {/* Glow effect at top corner */}
                    <div
                      className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none ${p.duration_months === 1 ? 'bg-cyan-500' : p.duration_months === 3 ? 'bg-violet-500' : 'bg-primary'
                        }`}
                    />

                    {/* Badges row */}
                    <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
                      <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-full text-[var(--text-secondary)]">
                        {p.duration_months === 1 ? '١ شهر' : p.duration_months === 3 ? '٣ أشهر' : '١٢ شهراً'}
                      </span>

                      {isRecommended ? (
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full text-white bg-gradient-to-r from-indigo-500 to-violet-600 shadow-sm animate-pulse">
                          الأفضل قيمة
                        </span>
                      ) : isMid ? (
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full text-[var(--secondary)] bg-[var(--secondary-glow)] border border-[var(--secondary-glow-border)]">
                          الأكثر طلباً
                        </span>
                      ) : null}
                    </div>

                    {/* Plan title */}
                    <h3 className="text-xl font-black text-[var(--text)] mb-1 flex items-center gap-2">
                      Google AI Pro
                      {isRecommended && <Sparkles size={16} className="text-amber-500 animate-pulse" />}
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)] font-medium">
                      تفعيل رسمي وآمن بنسبة 100% على بريدك الشخصي
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Price block */}
                      <div className="bg-black/[0.02] dark:bg-white/[0.01] border border-[var(--border)] rounded-2xl p-5 text-center mb-6 relative flex flex-col items-center justify-center min-h-[140px]">
                        {/* Floating discount badge */}
                        {savingsPct > 0 && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black px-3.5 py-1 rounded-full shadow-md shadow-emerald-500/20 whitespace-nowrap animate-bounce">
                            وفر {savingsPct}%
                          </div>
                        )}

                        {/* Original Google Price */}
                        {p.official_price_iqd && p.official_price_iqd > p.price_iqd && (
                          <div className="text-[11px] text-[var(--text-muted)] line-through mb-1 font-bold">
                            السعر الرسمي من Google: <span className="number-latin">{p.official_price_iqd.toLocaleString()}</span> د.ع
                          </div>
                        )}

                        {/* Price tag */}
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="number-latin text-3xl md:text-4xl font-black text-[var(--text)] tracking-tight">
                            {p.price_iqd.toLocaleString()}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] font-bold">د.ع</span>
                        </div>

                        {/* Per-month breakdown */}
                        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 rounded-lg">
                          <span className="text-[11px] text-[var(--text-muted)]">يعادل تقريباً:</span>
                          <span className="number-latin font-black text-xs text-emerald-600 dark:text-emerald-400">
                            {monthlyPrice.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">د.ع / شهر</span>
                        </div>

                        {p.duration_months === 1 && (
                          <p className="text-[10px] text-[var(--text-subtle)] mt-2 font-medium">
                            دفعة واحدة — بدون تجديد تلقائي
                          </p>
                        )}
                      </div>

                      {/* Features checklist inside card */}
                      <div className="space-y-3 mb-6">
                        <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-wider">تشمل الباقة:</p>
                        {[
                          'تفعيل رسمي كامل على إيميلك الشخصي',
                          'الوصول لنموذج Gemini Advanced الأقوى',
                          'مساحة تخزين 2 تيرابايت في Google One',
                          'دمج الذكاء الاصطناعي في خدمات Google',
                          isRecommended ? 'أولوية قصوى للتنشيط والدعم الفني' : 'تنشيط سريع ودعم متواصل 24/7',
                        ].map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] font-medium">
                            <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                            <span className="leading-tight">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card CTA Button */}
                    <button
                      onClick={() => handleSelectPlan(p)}
                      className={`w-full py-3.5 px-5 font-bold rounded-xl text-sm transition-all duration-300 transform active:scale-95 cursor-pointer shadow-md ${isRecommended
                          ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white hover:opacity-95 hover:shadow-primary/30 hover:shadow-lg'
                          : 'bg-black/5 dark:bg-white/5 border border-[var(--border)] text-[var(--text)] hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] hover:shadow-primary/10'
                        }`}
                    >
                      {isRecommended ? 'اشترك بأفضل قيمة' : isMid ? 'اشترك الآن' : '← اختر هذه المدة'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '28px',
            marginTop: '52px',
            flexWrap: 'wrap',
            padding: '20px 24px',
            background: 'var(--surface-glass)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            maxWidth: '800px',
            margin: '52px auto 0',
          }}>
            {[
              { icon: <ShieldCheck size={16} className="text-emerald-500" />, text: 'لا نطلب كلمة مرورك أبداً' },
              { icon: <CheckCircle2 size={16} className="text-emerald-500" />, text: 'تفعيل أولاً — ادفع بعد التأكد' },
              { icon: <CreditCard size={16} className="text-emerald-500" />, text: 'دفع بالدينار العراقي' },
              { icon: <Sparkles size={16} className="text-amber-500" />, text: 'تقييم 98% من أكثر من 2500 عميل' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. HOW IT WORKS (TIMELINE) */}
      <section className="section-padding" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="badge badge-primary mb-2">خطوات التفعيل</div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>
              كيف تتم عملية التفعيل؟
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              4 خطوات سريعة وسهلة لتفعيل اشتراكك وبدء مغامرة الذكاء الاصطناعي معنا.
            </p>
          </div>

          {/* Steps Grid UI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ position: 'relative' }}>

            {/* Step 1 */}
            <div
              className="glass-panel"
              style={{
                padding: '32px 24px',
                textAlign: 'center',
                position: 'relative',
                borderRadius: '24px',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-glow-md)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow)';
              }}
            >
              <div style={{
                width: '60px', height: '60px', borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 900, margin: '0 auto 20px',
                boxShadow: '0 8px 24px rgba(var(--primary-rgb), 0.3)'
              }}>
                1
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px' }}>اختر الباقة المناسبة</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                تصفح باقاتنا السنوية أو الشهرية وحدد الباقة الأكثر ملاءمة لاحتياجاتك وميزانيتك من جدول الأسعار.
              </p>
            </div>

            {/* Step 2 */}
            <div
              className="glass-panel"
              style={{
                padding: '32px 24px',
                textAlign: 'center',
                position: 'relative',
                borderRadius: '24px',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-glow-md)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow)';
              }}
            >
              <div style={{
                width: '60px', height: '60px', borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--secondary), var(--accent))',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 900, margin: '0 auto 20px',
                boxShadow: '0 8px 24px rgba(var(--secondary-rgb), 0.3)'
              }}>
                2
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px' }}>أدخل بياناتك</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                انقر على الباقة وسيفتح لك نموذج إدخال بريد Gmail المراد التنشيط عليه ورقم هاتفك للتواصل وتأكيد الدفع.
              </p>
            </div>

            {/* Step 3 */}
            <div
              className="glass-panel"
              style={{
                padding: '32px 24px',
                textAlign: 'center',
                position: 'relative',
                borderRadius: '24px',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-glow-md)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow)';
              }}
            >
              <div style={{
                width: '60px', height: '60px', borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--success), hsl(150, 70%, 40%))',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 900, margin: '0 auto 20px',
                boxShadow: '0 8px 24px rgba(40, 180, 100, 0.3)'
              }}>
                3
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px' }}>نقوم بالتفعيل الفوري</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                بعد استلام الطلب وتأكيد الدفع، يرسل لك فريقنا دعوة رسمية مقبولة على Gmail لتفعيل الاشتراك خلال دقائق.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS */}
      <section className="section-padding" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="badge badge-primary mb-2">تجارب حقيقية</div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>
              ماذا يقول عملاؤنا في العراق؟
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              آراء حقيقية من مبرمجين، مصممين، طلاب، ورواد أعمال عراقيين وثقوا بخدمتنا.
            </p>
          </div>

          <TestimonialsCarousel />
        </div>
      </section>

      {/* 10. FAQ SECTION */}
      <section id="faq" className="section-padding" style={{ background: 'linear-gradient(180deg, transparent 0%, var(--secondary-glow) 50%, transparent 100%)' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="badge badge-secondary mb-4">الأسئلة الشائعة</div>
            <h2 style={{ color: 'var(--text)', marginBottom: '16px' }}>
              كل ما تريد معرفته قبل الاشتراك
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7', maxWidth: '520px', margin: '0 auto' }}>
              أجوبة شفافة وكاملة لكل تساؤلاتك — اشترك بثقة واطمئنان تام.
            </p>
          </div>

          <FAQAccordion />
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section
        className="section-padding"
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(124, 58, 237, 0.15))',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          textAlign: 'center'
        }}
      >
        <div className="container" style={{ maxWidth: '700px' }}>
          <Sparkles size={48} style={{ color: 'var(--secondary)', marginBottom: '24px', animation: 'float 4s ease-in-out infinite' }} />

          <h2 style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--text)', marginBottom: '16px', lineHeight: '1.3' }}>
            ابدأ رحلتك الإبداعية الآن واستفد من Google AI Pro
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '32px' }}>
            نثق بعملائنا ونمنحهم فرصة التأكد من التنشيط أولاً قبل الدفع. اطلب باقتك الآن لتنشيط اشتراك Google AI Pro على حسابك الشخصي مجاناً وسدد لاحقاً بعد التأكد!
          </p>

          <button
            onClick={() => scrollToSection('pricing')}
            className="btn btn-primary"
            style={{ padding: '16px 48px', fontSize: '1.15rem', fontWeight: 800 }}
          >
            اشترك واختر الباقة الآن
          </button>
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer
        style={{
          background: 'var(--background-alt)',
          borderTop: '1px solid var(--border)',
          padding: '48px 0 32px 0',
          color: 'var(--text-muted)'
        }}
      >
        <div className="container grid grid-cols-4 gap-6" style={{ marginBottom: '40px' }}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} color="white" />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>NinuSoft AI</span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
              المنصة الأولى الموثوقة في العراق لتوفير وتفعيل اشتراكات جوجل والذكاء الاصطناعي رسميًا وبأسهل طرق الدفع المحلية.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--text)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>روابط سريعة</h4>
            <ul className="flex flex-col gap-2" style={{ listStyle: 'none', fontSize: '0.85rem' }}>
              <li><a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>الرئيسية</a></li>
              <li><a href="#benefits" onClick={(e) => { e.preventDefault(); scrollToSection('benefits'); }}>المميزات</a></li>
              <li><a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}>الباقات والأسعار</a></li>
              <li><a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>الأسئلة الشائعة</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--text)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>معلومات وضمانات</h4>
            <ul className="flex flex-col gap-2" style={{ listStyle: 'none', fontSize: '0.85rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: 'var(--success)' }} /> تفعيل رسمي وقانوني 100%</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: 'var(--success)' }} /> لا نطلب أي كلمة مرور</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: 'var(--success)' }} /> ضمان كامل ومستمر للمدة</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--text)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>تواصل معنا</h4>
            <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>لديكم استفسار أو بحاجة لمساعدة؟</p>
            <a
              href={`https://wa.me/${whatsappNum}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text)',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MessageSquare size={16} style={{ color: '#25d366' }} />
              واتساب: <span className="number-latin">+{whatsappNum.slice(0, 3)} {whatsappNum.slice(3, 6)} {whatsappNum.slice(6, 9)} {whatsappNum.slice(9)}</span>
            </a>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', textAlign: 'center', fontSize: '0.8rem' }}>
          <p>© {new Date().getFullYear()} NinuSoft AI. جميع الحقوق محفوظة ومضمونة.</p>
          <div className="flex justify-center gap-6 mt-3 mb-2">
            <Link to="/privacy" className="hover:text-[var(--primary)] font-semibold transition-colors">سياسة الخصوصية</Link>
            <Link to="/terms" className="hover:text-[var(--primary)] font-semibold transition-colors">شروط الخدمة والاستخدام</Link>
          </div>
          <p style={{ marginTop: '4px', opacity: 0.5 }}>موقع مستقل وغير تابع لشركة Google Inc. رسميًا، نوفر خدمات المساعدة لتنشيط الاشتراكات محليًا.</p>
        </div>
      </footer>

      {/* 13. FLOATING STICKY WHATSAPP ESCAPE HATCH */}
      <a
        href={`https://wa.me/${whatsappNum}?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D9%84%D8%AF%D9%8A%20%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20Google%20AI%20Pro.`}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float animate-float"
        title="تواصل معنا قبل الشراء"
      >
        <MessageSquare size={28} />
      </a>

      {/* 14. STICKY MOBILE CTA BAR */}
      <div className="sticky-bar">
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Google AI Pro</span>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--success)' }}>باقات تبدأ من 20,000 د.ع</div>
        </div>
        <button
          onClick={() => scrollToSection('pricing')}
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          اشترك الآن
        </button>
      </div>

      {/* 15. EXIT INTENT POPUP (REMOVED) */}

      {/* 16. ORDER MODAL */}
      {isOrderModalOpen && (
        <OrderModal
          plan={selectedPlan}
          whatsappNum={whatsappNum}
          onClose={() => setIsOrderModalOpen(false)}
        />
      )}

      {/* 17. LOGIN MODAL REMOVED (DIRECT GOOGLE OAUTH) */}

      {/* 18. SCROLL PROGRESS BACK TO TOP */}
      <ScrollProgressButton />

    </div>
  );
};

export default Home;