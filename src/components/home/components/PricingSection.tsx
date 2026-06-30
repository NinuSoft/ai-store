import React from 'react';
import { Brain, Laptop, Sparkles, Image as ImageIcon, MessageSquare, Check, ShieldCheck, CheckCircle2, CreditCard } from 'lucide-react';
import type { Plan } from '../types';

interface PricingSectionProps {
  plans: Plan[];
  handleSelectPlan: (plan: Plan) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  plans,
  handleSelectPlan
}) => {
  return (
    <section id="pricing" className="section-padding" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 55% at 50% 50%, var(--primary-light) 0%, transparent 70%)'
      }} />

      <div className="container" style={{ position: 'relative', maxWidth: '1350px' }}>

        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div className="badge badge-primary mb-4" style={{ fontSize: '0.8rem' }}>باقات Google AI Pro</div>
          <h2 style={{ color: 'var(--text)', marginBottom: '18px' }}>
            خطة واحدة،{' '}
            <span className="shimmer-text">مدد مختلفة</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.75' }}>
            نوفّر اشتراك <strong style={{ color: 'var(--text)' }}>Google AI Pro</strong> الرسمي على حسابك الشخصي — اختر المدة التي تناسبك وادفع بعد التأكد من التفعيل.
          </p>
        </div>

        {/* What's included — shared feature strip */}
        <div style={{
          background: 'var(--surface-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '28px 36px',
          maxWidth: '900px',
          margin: '0 auto 48px',
        }}>
          <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            كل باقة تشمل — نفس المزايا الرسمية الكاملة لـ Google AI Pro
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px 24px',
          }}>
            {[
              { icon: <Brain size={14} className="text-[var(--primary)]" />, label: 'Gemini Pro — نموذج الذكاء الاصطناعي المتقدم' },
              { icon: <Laptop size={14} className="text-[var(--primary)]" />, label: '5 تيرابايت تخزين على Google One' },
              { icon: <Sparkles size={14} className="text-[var(--primary)]" />, label: 'AI في Gmail, Docs, Slides, Sheets' },
              { icon: <Brain size={14} className="text-[var(--primary)]" />, label: 'سياق مليون رمز — Deep Research' },
              { icon: <ImageIcon size={14} className="text-[var(--primary)]" />, label: 'توليد وتعديل الصور بالذكاء الاصطناعي' },
              { icon: <Laptop size={14} className="text-[var(--primary)]" />, label: 'توليد فيديو في Google Vids' },
              { icon: <MessageSquare size={14} className="text-[var(--primary)]" />, label: 'Gemini Live — محادثة صوتية' },
              { icon: <Laptop size={14} className="text-[var(--primary)]" />, label: 'مزايا Meet Premium واجتماعات HD' },
              { icon: <MessageSquare size={14} className="text-[var(--primary)]" />, label: 'دعم فني 24/7 عبر واتساب' },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '30px', height: '30px', flexShrink: 0,
                  background: 'var(--primary-light)',
                  border: '1px solid hsla(237,90%,58%,0.15)',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px',
                }}>{icon}</span>
                <span style={{ fontSize: '0.87rem', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.3 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Duration cards */}
        <div
          className="pricing-grid"
          style={{
            display: 'grid',
            maxWidth: '1350px',
            margin: '0 auto',
            alignItems: 'stretch',
            paddingTop: '12px',
          }}
        >
          <style>{`
            .pricing-grid {
              grid-template-columns: 1fr;
              gap: 16px;
              padding: 0;
            }
            @media (min-width: 768px) {
              .pricing-grid {
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 20px;
              }
            }
            @media (max-width: 767px) {
              .pricing-card-elevated { transform: translateY(0) !important; }
            }
          `}</style>
          {plans.map((p) => {
            const isRecommended = p.duration_months === 12;
            const isMid = p.duration_months === 3;
            const monthlyPrice = Math.round(p.price_iqd / p.duration_months);

            // Reference: compute savings relative to official Google price if available, otherwise vs monthly base
            const basePlan = plans.find(x => x.duration_months === 1);
            const savingsPct = p.official_price_iqd && p.official_price_iqd > p.price_iqd
              ? Math.round((1 - p.price_iqd / p.official_price_iqd) * 100)
              : (basePlan && p.duration_months > 1
                ? Math.round((1 - monthlyPrice / basePlan.price_iqd) * 100)
                : 0);

            return (
              <div
                key={p.id}
                style={{
                  position: 'relative',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: isRecommended ? '2.5px solid var(--primary)' : '1px solid var(--border)',
                  background: 'var(--surface-glass)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transform: 'translateY(0)',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.3s ease',
                  zIndex: 1
                }}
                className="group"
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                  e.currentTarget.style.borderColor = isRecommended ? 'var(--primary)' : 'rgba(99, 102, 241, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-6px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = isRecommended ? 'var(--primary)' : 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Card Header */}
                <div
                  style={{
                    padding: '24px',
                    borderBottom: '1px solid var(--border)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Glowing aura at background corner */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-48px',
                      right: '-48px',
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      filter: 'blur(32px)',
                      opacity: 0.15,
                      pointerEvents: 'none',
                      background: p.duration_months === 1 ? 'var(--accent)' : p.duration_months === 3 ? 'var(--secondary)' : 'var(--primary)'
                    }}
                  />

                  {/* Badges row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '16px', position: 'relative', zIndex: 10 }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '4px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border)',
                        borderRadius: '9999px',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {p.duration_months === 1 ? 'شهر واحد' : p.duration_months === 3 ? '3 أشهر' : p.duration_months === 12 ? '12 شهراً' : `${p.duration_months} شهراً`}
                    </span>

                    {isRecommended ? (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 900,
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          color: 'var(--primary)',
                          background: 'var(--primary-light)',
                          border: '1px solid var(--secondary-glow-border)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        الأكثر طلباً ⭐
                      </span>
                    ) : isMid ? (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          color: 'var(--secondary)',
                          background: 'var(--secondary-glow)',
                          border: '1px solid var(--secondary-glow-border)'
                        }}
                      >
                        شائع 🔥
                      </span>
                    ) : null}
                  </div>

                  {/* Plan title */}
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Google AI Pro
                    {isRecommended && <Sparkles size={16} style={{ color: '#f59e0b' }} className="animate-pulse" />}
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                    تفعيل رسمي وأصلي 100% على إيميلك الشخصي
                  </p>
                </div>

                {/* Card Body */}
                <div style={{ padding: '24px', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Price block */}
                    <div
                      style={{
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid var(--border)',
                        borderRadius: '20px',
                        padding: '24px 16px',
                        textAlign: 'center',
                        marginBottom: '24px',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '155px',
                      }}
                    >
                      {/* Floating discount badge */}
                      {savingsPct > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'linear-gradient(90deg, #10b981, #059669)',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 900,
                            padding: '4px 14px',
                            borderRadius: '9999px',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          وفر {savingsPct}%
                        </div>
                      )}

                      {/* Original Google Price */}
                      {p.official_price_iqd && p.official_price_iqd > p.price_iqd && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-through', marginBottom: '4px', fontWeight: 600 }}>
                          السعر الرسمي: <span className="number-latin">{p.official_price_iqd.toLocaleString('en-US')}</span> د.ع
                        </div>
                      )}

                      {/* Price tag */}
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
                        <span className="number-latin text-gradient" style={{ fontSize: '2.6rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                          {p.price_iqd.toLocaleString('en-US')}
                        </span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700 }}>د.ع</span>
                      </div>

                      {/* Per-month breakdown */}
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          background: 'rgba(16, 185, 129, 0.05)',
                          border: '1px solid rgba(16, 185, 129, 0.12)',
                          borderRadius: '8px'
                        }}
                      >
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>يعادل:</span>
                        <span className="number-latin" style={{ fontWeight: 800, fontSize: '12px', color: '#059669' }}>
                          {monthlyPrice.toLocaleString('en-US')}
                        </span>
                        <span style={{ fontSize: '10px', color: '#059669', fontWeight: 700 }}>د.ع / شهر</span>
                      </div>

                      {/* Absolute savings label */}
                      {p.official_price_iqd && p.official_price_iqd > p.price_iqd && (
                        <div style={{ fontSize: '10px', color: 'var(--success)', fontWeight: 800, marginTop: '12px' }}>
                          توفير حقيقي بقيمة <span className="number-latin">{(p.official_price_iqd - p.price_iqd).toLocaleString('en-US')}</span> د.ع!
                        </div>
                      )}
                    </div>

                    {/* Features checklist inside card */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>تشمل الباقة:</p>
                      {[
                        'تفعيل رسمي كامل على إيميلك الشخصي',
                        'الوصول لنموذج Gemini Advanced الأقوى',
                        'مساحة تخزين 2 تيرابايت في Google One',
                        'دمج الذكاء الاصطناعي في خدمات Google',
                        isRecommended ? 'أولوية قصوى للتنشيط والدعم الفني' : 'تنشيط سريع ودعم متواصل 24/7',
                      ].map((feature, fIdx) => (
                        <div key={fIdx} style={{ display: 'flex', alignItems: 'start', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          <Check size={14} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ lineHeight: '1.4' }}>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(p)}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      fontWeight: 800,
                      borderRadius: '14px',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: 'none',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    className="bg-black/5 dark:bg-white/5 border border-[var(--border)] text-[var(--text)] hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] active:scale-[0.98]"
                  >
                    {isRecommended ? 'اشترك بأفضل قيمة' : isMid ? 'اشترك الآن' : '← اختر هذه المدة'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '28px',
          marginTop: '52px',
          flexWrap: 'wrap',
          padding: '20px 24px',
          background: 'var(--surface-glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          maxWidth: '800px',
          margin: '52px auto 0',
        }}>
          {[
            { icon: <ShieldCheck size={16} className="text-emerald-500" />, text: 'لا نطلب كلمة مرورك أبداً' },
            { icon: <CheckCircle2 size={16} className="text-emerald-500" />, text: 'تفعيل أولاً — ادفع بعد التأكد' },
            { icon: <CreditCard size={16} className="text-emerald-500" />, text: 'دفع بالدينار العراقي' },
            { icon: <Sparkles size={16} className="text-amber-500" />, text: 'تقييم 98% من أكثر من 50 عميل' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
