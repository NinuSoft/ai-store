import React from 'react';
import { FAQAccordion } from '../../FAQAccordion';

export const FaqSection: React.FC = () => {
  return (
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
  );
};
