import React from 'react';
import { StatsCounter } from '../../StatsCounter';

export const SocialProofCounters: React.FC = () => {
  return (
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
            +<StatsCounter target={50} />
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
            +<StatsCounter target={20} />
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
  );
};
