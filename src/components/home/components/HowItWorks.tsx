import React from 'react';

export const HowItWorks: React.FC = () => {
  return (
    <section className="section-padding" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="badge badge-primary mb-2">خطوات التفعيل</div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>
            كيف تتم عملية التفعيل؟
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            4 خطوات سريعة وسهلة لتفعيل اشتراكك وبدء مغامرة الذكاء الاصطناعي معنا.
          </p>
        </div>

        {/* Steps Grid UI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ position: 'relative' }}>

          {/* Step 1 */}
          <div
            className="glass-panel"
            style={{
              padding: '32px 24px',
              textAlign: 'center',
              position: 'relative',
              borderRadius: '24px',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-glow-md)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow)';
            }}
          >
            <div style={{
              width: '60px', height: '60px', borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 900, margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(var(--primary-rgb), 0.3)'
            }}>
              1
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px' }}>اختر الباقة المناسبة</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              تصفح باقاتنا السنوية أو الشهرية وحدد الباقة الأكثر ملاءمة لاحتياجاتك وميزانيتك من جدول الأسعار.
            </p>
          </div>

          {/* Step 2 */}
          <div
            className="glass-panel"
            style={{
              padding: '32px 24px',
              textAlign: 'center',
              position: 'relative',
              borderRadius: '24px',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-glow-md)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow)';
            }}
          >
            <div style={{
              width: '60px', height: '60px', borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--secondary), var(--accent))',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 900, margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(var(--secondary-rgb), 0.3)'
            }}>
              2
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px' }}>أدخل بياناتك</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              انقر على الباقة وسيفتح لك نموذج إدخال بريد Gmail المراد التنشيط عليه ورقم هاتفك للتواصل وتأكيد الدفع.
            </p>
          </div>

          {/* Step 3 */}
          <div
            className="glass-panel"
            style={{
              padding: '32px 24px',
              textAlign: 'center',
              position: 'relative',
              borderRadius: '24px',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-glow-md)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow)';
            }}
          >
            <div style={{
              width: '60px', height: '60px', borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--success), hsl(150, 70%, 40%))',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 900, margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(40, 180, 100, 0.3)'
            }}>
              3
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px' }}>نقوم بالتفعيل الفوري</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              بعد استلام الطلب وتأكيد الدفع، يرسل لك فريقنا دعوة رسمية مقبولة على Gmail لتفعيل الاشتراك خلال دقائق.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
