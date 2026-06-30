import React from 'react';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import type { Order, Plan } from '../types';

interface AwaitingPaymentBannerProps {
  awaitingPaymentOrders: Order[];
  plans: Record<string, Plan>;
  whatsappNum: string;
}

export const AwaitingPaymentBanner: React.FC<AwaitingPaymentBannerProps> = ({
  awaitingPaymentOrders,
  plans,
  whatsappNum
}) => {
  return (
    <>
      {awaitingPaymentOrders.map(order => {
        const plan = plans[order.plan_id];
        const planName = plan ? plan.name : 'Google AI Pro';
        const price = plan ? plan.price_iqd : 0;
        const whatsappText = `مرحباً، قمت بتحويل مبلغ ${price.toLocaleString('en-US')} د.ع لتفعيل باقة ${planName} على الحساب ${order.gmail}. يرجى تأكيد الدفع.`;
        
        return (
          <div 
            key={order.id}
            className="glass-panel glow-effect animate-fade-in"
            style={{
              borderColor: 'rgba(139, 92, 246, 0.4)',
              borderWidth: '1px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), var(--glass-bg))',
              padding: '24px',
              marginBottom: '32px',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)'
            }}
          >
            <div className="flex justify-between items-start gap-4 flex-wrap text-right">
              <div className="flex flex-col gap-2">
                <span className="badge badge-secondary flex items-center gap-1.5" style={{ alignSelf: 'flex-start' }}>
                  <CheckCircle2 size={13} />
                  مفعّل - بانتظار الدفع
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>
                  تم تفعيل اشتراكك بنجاح! يرجى إكمال عملية الدفع لتأكيد التفعيل بشكل نهائي.
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '700px', lineHeight: '1.6' }}>
                  نثق بعملائنا ونمنحهم فرصة التأكد من التفعيل أولاً. يرجى تحويل مبلغ الاشتراك للرقم أدناه عبر **زين كاش (Zain Cash)** أو **آسيا حوالة (Asia Hawala)**:
                </p>
                
                <div className="flex items-center gap-6 mt-2 flex-wrap">
                  <div style={{ background: 'var(--glass-nested-bg)', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--glass-nested-border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>رقم التحويل (زين كاش / آسيا حوالة)</span>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--text)' }} className="number-latin">07701234567</strong>
                  </div>

                  <div style={{ background: 'var(--glass-nested-bg)', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--glass-nested-border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>المبلغ المطلوب</span>
                    <strong style={{ fontSize: '1.2rem', color: '#4ade80' }} className="number-latin">
                      {price.toLocaleString('en-US')} د.ع
                    </strong>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3" style={{ minWidth: '220px', justifySelf: 'flex-end' }}>
                <a 
                  href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(whatsappText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    backgroundColor: '#25d366',
                    backgroundImage: 'none',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <MessageSquare size={16} /> تأكيد الدفع عبر واتساب
                </a>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center' }}>
                  * يرجى إرسال صورة التحويل بعد إتمام العملية.
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};
