import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  scrollToSection: (id: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  scrollToSection
}) => {
  return (
    <section
      id="hero"
      style={{
        padding: '80px 0 60px 0',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="container flex flex-col items-center justify-center text-center gap-6 max-w-4xl mx-auto">
        <div className="animate-fade-in flex flex-col items-center gap-6 w-full">
          <div className="badge badge-success" style={{ width: 'max-content' }}>
            التفعيل أولاً - الدفع لاحقاً
          </div>

          <h1 style={{ fontWeight: 900, color: 'var(--text)', lineHeight: '1.2' }}>
            احصل على <span className="shimmer-text">Google AI Pro</span> على حسابك الشخصي وادفع بعد التأكد
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.85' }}>
            لا نطلب أي دفعة مسبقة. نقوم بتنشيط الاشتراك الرسمي على حساب Gmail الشخصي الخاص بك أولاً، ثم تقوم بالدفع محلياً بعد التأكد من نجاح التفعيل وظهور كامل المزايا.
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => scrollToSection('pricing')}
              className="btn btn-primary"
              style={{ padding: '14px 38px', fontSize: '1.05rem', borderRadius: 'var(--ns-radius-xl)' }}
            >
              اشترك الآن
            </button>

            <button
              onClick={() => scrollToSection('pricing')}
              className="btn btn-outline"
              style={{ padding: '14px 32px', fontSize: '1.05rem', borderRadius: 'var(--ns-radius-xl)' }}
            >
              عرض الباقات
            </button>
          </div>

          {/* Micro-trust indicators under CTA */}
          <div className="flex justify-center gap-6 mt-4" style={{ flexWrap: 'wrap' }}>
            <div className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
              <span>تفعيل رسمي ومضمون 100%</span>
            </div>
            <div className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
              <span>حسابك الشخصي بالكامل</span>
            </div>
            <div className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
              <span>دعم فني عبر واتساب 24/7</span>
            </div>
          </div>

          {/* Customer Avatar Stack / Social Proof */}
          <div className="flex flex-col items-center gap-3 mt-6 border-t border-dashed border-[var(--border)] pt-6">
            <div className="flex justify-center -space-x-3 space-x-reverse">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--surface)] bg-[var(--surface-alt)] flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=e2e8f0`} alt={`User ${i}`} className="w-full h-full" />
                </div>
              ))}
            </div>
            <div className="text-center">
              <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)' }}>
                ينصح به أكثر من 50 مشترك في العراق
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                تفعيل فوري ودعم فني متكامل ومستمر
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
