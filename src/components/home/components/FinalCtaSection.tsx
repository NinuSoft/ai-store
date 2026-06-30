import React from 'react';
import { Sparkles } from 'lucide-react';

interface FinalCtaSectionProps {
  scrollToSection: (id: string) => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({
  scrollToSection
}) => {
  return (
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
  );
};
