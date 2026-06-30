import React from 'react';
import { Brain, FileText, Search, Image as ImageIcon, Code, PenTool, Laptop } from 'lucide-react';

export const BenefitsSection: React.FC = () => {
  return (
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
          <div className="flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--ns-radius)', padding: '12px 24px', fontSize: '0.95rem' }}>
            <Laptop size={18} style={{ color: 'var(--secondary)' }} />
            <span>الاشتراك يعمل بكل سلاسة على الهواتف والأجهزة اللوحية وأجهزة الكمبيوتر.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
