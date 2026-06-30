import React from 'react';
import { MessageSquare, Send } from 'lucide-react';

interface QuickSupportPanelProps {
  whatsappNum: string;
}

const WhatsAppIcon = ({ size = 24, ...props }: { size?: number; [key: string]: any }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    {...props}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.634-1.02-5.111-2.88-6.973L16.74 5.6C14.88 3.74 12.4 2.717 9.77 2.717 4.332 2.717.91 7.138.908 12.574c-.001 1.706.452 3.373 1.312 4.869l-.95 3.47 3.557-.933c1.481.808 3.097 1.234 4.73 1.234zm10.707-7.408c-.29-.145-1.72-.849-1.987-.947-.268-.098-.463-.146-.658.146-.195.292-.756.947-.927 1.14-.17.195-.34.22-.63.074-.29-.145-1.228-.453-2.338-1.444-.864-.77-1.448-1.721-1.618-2.013-.17-.29-.018-.447.127-.592.13-.13.29-.34.436-.51.145-.17.195-.29.29-.485.097-.194.048-.364-.025-.51-.073-.145-.658-1.585-.902-2.167-.237-.57-.48-.493-.658-.502-.17-.008-.365-.01-.56-.01-.194 0-.51.073-.78.364-.268.29-1.022.998-1.022 2.43 0 1.43 1.043 2.809 1.188 3.002.146.195 2.053 3.134 4.973 4.39.694.298 1.236.478 1.66.614.697.221 1.33.19 1.83.115.558-.084 1.72-.702 1.964-1.38.243-.678.243-1.26.17-1.38-.073-.122-.268-.195-.56-.34z" />
  </svg>
);

export const QuickSupportPanel: React.FC<QuickSupportPanelProps> = ({
  whatsappNum
}) => {
  return (
    <div 
      className="glass-panel glow-effect" 
      style={{ 
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        padding: '24px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MessageSquare size={18} />
        </div>
        <h4 style={{ color: 'var(--text)', fontSize: '1rem', fontWeight: 700 }}>الدعم الفني المباشر</h4>
      </div>
      
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '20px' }}>
        هل واجهت مشكلة في التفعيل؟ أو ترغب بالاستفسار عن طرق الدفع كزين كاش؟ فريقنا متواجد طوال اليوم لمساعدتك.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <a 
          href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent('مرحباً، لدي استفسار بخصوص اشتراكي.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{
            width: '100%',
            backgroundColor: '#25d366',
            backgroundImage: 'none',
            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)',
            fontSize: '0.85rem',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <WhatsAppIcon size={16} /> راسلنا عبر واتساب
        </a>
        <a 
          href="https://t.me/NinuSoft?direct"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{
            width: '100%',
            backgroundColor: '#229ED9',
            border: 'none',
            backgroundImage: 'none',
            boxShadow: '0 4px 12px rgba(34, 158, 217, 0.2)',
            fontSize: '0.85rem',
            padding: '10px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Send size={16} /> راسلنا عبر تلغرام
        </a>
      </div>
    </div>
  );
};
