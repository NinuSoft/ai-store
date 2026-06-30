import React from 'react';
import { Send, X, MessageSquare } from 'lucide-react';

interface SupportFloatProps {
  isContactMenuOpen: boolean;
  setIsContactMenuOpen: (val: boolean) => void;
  whatsappNum: string;
}

const WhatsAppIcon = ({ size = 24, ...props }: { size?: number; [key: string]: any }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.448L0 24zm6.59-4.846c1.6.95 2.51 1.442 4.415 1.443 5.485.002 9.953-4.464 9.956-9.953.002-2.661-1.029-5.163-2.906-7.042C16.177 1.721 13.68 .69 11.02.69 5.534.69 1.066 5.158 1.063 10.645c-.001 1.896.486 2.802 1.444 4.416l-.995 3.637 3.737-.98a10.87 10.87 0 0 0 2.808.436zm10.74-5.385c-.27-.136-1.602-.79-1.85-.88-.25-.09-.432-.136-.614.137-.182.273-.705.88-.863 1.058-.158.177-.317.2-.587.064a7.393 7.393 0 0 1-2.18-1.34 8.15 8.15 0 0 1-1.51-1.879c-.16-.272-.017-.42.119-.556.122-.122.27-.318.406-.477.135-.16.18-.272.271-.453.09-.182.046-.34-.022-.477-.068-.137-.614-1.477-.84-2.023-.223-.537-.468-.463-.643-.472-.166-.008-.356-.01-.546-.01-.19 0-.5.07-.762.355-.262.286-1 .977-1 2.385s1.02 2.766 1.163 2.956c.143.19 2.01 3.07 4.869 4.3.68.293 1.213.468 1.628.6a3.9 3.9 0 0 0 1.787.112c.55-.082 1.602-.654 1.828-1.285.227-.63.227-1.173.159-1.285-.068-.113-.25-.177-.52-.313z" />
  </svg>
);

export const SupportFloat: React.FC<SupportFloatProps> = ({
  isContactMenuOpen,
  setIsContactMenuOpen,
  whatsappNum
}) => {
  return (
    <div className="support-float-container">
      {isContactMenuOpen && (
        <div className="support-float-menu" dir="rtl">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', display: 'block', marginBottom: '4px' }}>
            تواصل معنا عبر:
          </span>
          <a
            href={`https://wa.me/${whatsappNum}?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D9%84%D8%AF%D9%8A%20%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20Google%20AI%20Pro.`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsContactMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '12px',
              background: 'rgba(37, 211, 102, 0.1)',
              color: '#25d366',
              fontSize: '0.85rem',
              fontWeight: 700,
              transition: 'background 0.2s',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(37, 211, 102, 0.18)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(37, 211, 102, 0.1)'}
          >
            <WhatsAppIcon size={16} />
            <span>واتساب</span>
          </a>
          <a
            href="https://t.me/NinuSoft?direct"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsContactMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '12px',
              background: 'rgba(34, 158, 217, 0.1)',
              color: '#229ED9',
              fontSize: '0.85rem',
              fontWeight: 700,
              transition: 'background 0.2s',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(34, 158, 217, 0.18)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(34, 158, 217, 0.1)'}
          >
            <Send size={16} />
            <span>تلغرام</span>
          </a>
        </div>
      )}
      
      <button
        onClick={() => setIsContactMenuOpen(!isContactMenuOpen)}
        className="support-float-btn"
        title="تواصل معنا"
        style={{
          background: isContactMenuOpen ? 'var(--danger)' : 'var(--primary)',
          boxShadow: isContactMenuOpen ? '0 8px 24px rgba(239, 68, 68, 0.3)' : 'var(--shadow-primary)'
        }}
      >
        {isContactMenuOpen ? (
          <X size={22} style={{ color: 'white', position: 'relative', zIndex: 10 }} />
        ) : (
          <>
            <span className="support-pulse-ring" />
            <MessageSquare size={22} style={{ color: 'white', position: 'relative', zIndex: 10 }} />
          </>
        )}
      </button>
    </div>
  );
};
