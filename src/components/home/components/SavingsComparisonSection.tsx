import React from 'react';
import { Sparkles } from 'lucide-react';

export const SavingsComparisonSection: React.FC = () => {
  return (
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
              300,000
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
              وفر أكثر من 86%
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
