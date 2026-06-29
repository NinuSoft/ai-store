import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckSquare, Calendar, HelpCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const Terms: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text)', transition: 'var(--transition)' }}>
      {/* HEADER */}
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--background-alt)', padding: '16px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container flex justify-between items-center">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:text-[var(--primary)] font-bold transition-colors cursor-pointer"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem' }}
          >
            <ArrowLeft size={18} />
            العودة للرئيسية
          </button>
          
          <div className="flex items-center gap-4">
            <span className="font-black text-lg tracking-wider text-gradient">NINŪSOFT AI</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ padding: '60px 0 40px 0', background: 'linear-gradient(180deg, var(--background-alt), var(--background))', textAlign: 'center' }}>
        <div className="container max-w-[800px]">
          <div className="flex justify-center mb-4">
            <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
              <FileText size={32} />
            </div>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>شروط الخدمة والاستخدام</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.8' }}>
            يرجى قراءة شروط الخدمة هذه بعناية قبل استخدام منصة نينوسوفت AI وطلب تفعيل اشتراك Google AI Pro.
          </p>
          <p style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', marginTop: '12px' }} className="number-latin">
            آخر تحديث: ٢٧ حزيران ٢٠٢٦
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <main style={{ padding: '40px 0 80px 0' }}>
        <div className="container max-w-[800px]">
          <div className="glass-panel" style={{ padding: '40px', borderRadius: 'var(--ns-radius-lg)' }}>
            
            {/* Sec 1 */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={20} style={{ color: 'var(--primary)' }} />
                ١. قبول الشروط ووصف الخدمة
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                باستخدامك لموقعنا أو تقديمك لطلب تفعيل، فإنك توافق على الالتزام الكامل بهذه الشروط. نينوسوفت هي منصة خدماتية ووسيطة تساعد المستخدمين في العراق على تنشيط وتفعيل اشتراكات خدمات الذكاء الاصطناعي المدفوعة (مثل Google One AI Premium / Google AI Pro) والدفع محلياً بالدينار العراقي للتغلب على صعوبات الدفع الدولي.
              </p>
            </div>

            {/* Sec 2 */}
            <div style={{ marginBottom: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} style={{ color: 'var(--primary)' }} />
                ٢. التفعيل والمدد الزمنية
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                تخضع عملية تفعيل الاشتراكات للسياسات التالية:
              </p>
              <ul style={{ listStyleType: 'disc', marginRight: '20px', marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8' }}>
                <li>يتم إرسال دعوة التفعيل الرسمية إلى عنوان Gmail الذي يحدده العميل في طلبه.</li>
                <li>يتحمل العميل المسؤولية الكاملة عن صحة بريد Gmail المدخل في الحقل المخصص.</li>
                <li>يستغرق تفعيل الطلبات عادة من ١٥ دقيقة إلى ساعتين كحد أقصى من استلام الطلب.</li>
              </ul>
            </div>

            {/* Sec 3 */}
            <div style={{ marginBottom: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={20} style={{ color: 'var(--primary)' }} />
                ٣. سياسة الدفع وتأكيد وصول المزايا
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                تتميز خدمتنا بمبدأ <strong>"التفعيل أولاً ثم الدفع"</strong> لضمان أمان عملائنا:
              </p>
              <ul style={{ listStyleType: 'disc', marginRight: '20px', marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8' }}>
                <li>يقوم فريقنا بتنشيط الباقة على حسابك الشخصي وإخطارك.</li>
                <li>يقوم العميل بالدخول إلى حسابه والتأكد من ظهور علامة Gemini Advanced ومساحة التخزين الإضافية 2TB.</li>
                <li>يلتزم العميل بتحويل مبلغ الباقة المتفق عليه كاملاً عبر طرق الدفع المحلية المتاحة (زين كاش، آسيا حوالة، إلخ) فوراً بعد التأكد من نجاح التنشيط.</li>
              </ul>
            </div>

            {/* Sec 4 */}
            <div style={{ marginBottom: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} style={{ color: 'var(--primary)' }} />
                ٤. الإلغاء والضمان والاسترداد
              </h2>
              <ul style={{ listStyleType: 'disc', marginRight: '20px', marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8' }}>
                <li><strong>الضمان الكامل:</strong> نضمن استمرار الخدمة على حسابك طوال فترة الاشتراك المحددة (مثلاً ١٢ شهراً). في حال حدوث أي خلل فني أو انقطاع، يرجى مراسلتنا فوراً وسيقوم الدعم بمعالجته أو تعويضك.</li>
                <li><strong>الاسترداد:</strong> نظراً لأن التنشيط رقمي ورسمي ويتم استهلاك الاعتمادات فوراً على خوادم Google، فلا يمكن إلغاء الاشتراك أو استرداد المبالغ بعد تفعيل الباقة بنجاح وقبول العميل للدعوة.</li>
              </ul>
            </div>

            {/* Sec 5 */}
            <div style={{ marginBottom: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} style={{ color: 'var(--primary)' }} />
                ٥. إخلاء المسؤولية القانونية
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                منصة نينوسوفت هي منصة خدماتية ووساطة دفع محلية مستقلة. نحن لسنا تابعين بشكل رسمي لشركة Google Inc ولا نمثلها. جميع الأسماء التجارية والشعارات وحقوق العلامات التجارية المسجلة هي ملك لأصحابها الأصليين (Google Inc). نحن نلتزم بشروط استخدام خدمات Google ونوفر المساعدة الفنية لتجاوز عوائق الدفع فقط.
              </p>
            </div>

            {/* Sec 6 */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} />
                ٦. التعديلات على الشروط
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                نحتفظ بالحق في تعديل شروط الخدمة هذه في أي وقت للتوافق مع التغييرات القانونية أو تحديثات خدمات Google. ننصح بمراجعة هذه الصفحة بشكل دوري للوقوف على آخر التحديثات.
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--background-alt)', padding: '32px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} NinuSoft AI. جميع الحقوق محفوظة ومضمونة.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-[var(--primary)] font-bold transition-colors">سياسة الخصوصية</Link>
            <Link to="/" className="hover:text-[var(--primary)] font-bold transition-colors">الرئيسية</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
