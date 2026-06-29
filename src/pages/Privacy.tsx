import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, FileText, ChevronLeft } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const Privacy: React.FC = () => {
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
              <Shield size={32} />
            </div>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>سياسة الخصوصية</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.8' }}>
            تلتزم منصة نينوسوفت للذكاء الاصطناعي (NinuSoft AI) بحماية خصوصيتك وبياناتك الشخصية. نوضح هنا كيفية جمع بياناتك واستخدامها وحمايتها عند طلب اشتراكات Google AI Pro.
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
                <Eye size={20} style={{ color: 'var(--primary)' }} />
                ١. البيانات التي نجمعها
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                نقوم بجمع الحد الأدنى من المعلومات اللازمة لتزويدك بالخدمة وتفعيل اشتراكك وتوفير الدعم المحلي:
              </p>
              <ul style={{ listStyleType: 'disc', marginRight: '20px', marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8' }}>
                <li><strong>بيانات الحساب:</strong> الاسم، والبريد الإلكتروني (Gmail) المقدم من خلال تسجيل الدخول بـ Google، لتنشيط الباقة عليه.</li>
                <li><strong>بيانات التواصل:</strong> رقم الهاتف (الواتساب) للتواصل لتأكيد عملية التنشيط وتحويل مبالغ الدفع محلياً.</li>
                <li><strong>بيانات الطلب:</strong> تفاصيل الباقة المحددة، والأسعار، وتواريخ التنشيط وانتهاء الصلاحية لإدارة حسابك.</li>
              </ul>
            </div>

            {/* Sec 2 */}
            <div style={{ marginBottom: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={20} style={{ color: 'var(--primary)' }} />
                ٢. حماية وأمن الحساب
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                نحن نولي أمن حسابات عملائنا أهمية قصوى:
              </p>
              <ul style={{ listStyleType: 'disc', marginRight: '20px', marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8' }}>
                <li><strong>لا نطلب كلمات المرور:</strong> لن نطلب منك كلمة مرور بريدك الإلكتروني (Gmail) مطلقاً. يتم التفعيل بشكل رسمي من خلال إرسال دعوة تفعيل معتمدة من Google تقبلها بنفسك.</li>
                <li><strong>الخصوصية التامة للمحتوى:</strong> حسابك شخصي ومستقل تماماً. لا يمكن لأي طرف آخر، بما في ذلك نينوسوفت، الاطلاع على ملفاتك أو صورك أو محادثاتك مع الذكاء الاصطناعي.</li>
              </ul>
            </div>

            {/* Sec 3 */}
            <div style={{ marginBottom: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} />
                ٣. كيفية استخدام البيانات
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                نستخدم البيانات التي نجمعها للأغراض التالية فقط:
              </p>
              <ul style={{ listStyleType: 'disc', marginRight: '20px', marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8' }}>
                <li>معالجة وتنفيذ طلبات الاشتراك والتجديد الخاصة بك.</li>
                <li>التواصل معك عبر واتساب لإرسال إشعارات التفعيل وتأكيدات الدفع.</li>
                <li>توفير الدعم الفني وحل المشكلات المتعلقة بالخدمة.</li>
                <li>إعلامك بتواريخ انتهاء باقتك لتجنب انقطاع الخدمة عن حسابك.</li>
              </ul>
            </div>

            {/* Sec 4 */}
            <div style={{ marginBottom: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} style={{ color: 'var(--primary)' }} />
                ٤. مشاركة البيانات مع أطراف ثالثة
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                لا نقوم ببيع أو تأجير أو مشاركة بياناتك الشخصية مع أي جهات خارجية لأغراض تسويقية. تتم مشاركة البيانات فقط مع:
              </p>
              <ul style={{ listStyleType: 'disc', marginRight: '20px', marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8' }}>
                <li><strong>Supabase / Google:</strong> لتسجيل وتأمين حسابك عبر مصادقة Google OAuth وإدارة قواعد البيانات بشكل آمن ومحمي.</li>
                <li>الجهات القانونية المختصة في العراق في حال وجود طلب رسمي متوافق مع القوانين والتشريعات السارية.</li>
              </ul>
            </div>

            {/* Sec 5 */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ChevronLeft size={20} style={{ color: 'var(--primary)' }} />
                ٥. تعديل البيانات وحذفها
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                يحق لك في أي وقت مراجعة بياناتك المسجلة لدينا أو طلب حذف حسابك وتفاصيلك بشكل كامل من قواعد بياناتنا عند انتهاء اشتراكك. يمكنك تقديم هذا الطلب مباشرة عبر التواصل مع فريق الدعم الفني عبر واتساب وسنقوم بتلبيته فوراً.
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
            <Link to="/terms" className="hover:text-[var(--primary)] font-bold transition-colors">شروط الخدمة</Link>
            <Link to="/" className="hover:text-[var(--primary)] font-bold transition-colors">الرئيسية</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
