import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

export const TrustInfoSection: React.FC = () => {
  return (
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
                borderRadius: 'var(--ns-radius)',
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

              <div className="flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--ns-radius-sm)', border: '1px solid var(--border)' }}>
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
  );
};
