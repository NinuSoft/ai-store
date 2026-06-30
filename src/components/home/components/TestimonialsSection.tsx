import React from 'react';
import { TestimonialsCarousel } from '../../TestimonialsCarousel';

export const TestimonialsSection: React.FC = () => {
  return (
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
  );
};
