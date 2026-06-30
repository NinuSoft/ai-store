import React from 'react';

interface StickyMobileCtaProps {
  scrollToSection: (id: string) => void;
}

export const StickyMobileCta: React.FC<StickyMobileCtaProps> = ({
  scrollToSection
}) => {
  return (
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
  );
};
