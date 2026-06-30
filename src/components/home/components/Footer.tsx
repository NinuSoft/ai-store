import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Check, Phone, Send } from 'lucide-react';

interface FooterProps {
  whatsappNum: string;
  scrollToSection: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  whatsappNum,
  scrollToSection
}) => {
  return (
    <footer
      style={{
        background: 'var(--background-alt)',
        borderTop: '1px solid var(--border)',
        padding: '48px 0 32px 0',
        color: 'var(--text-muted)'
      }}
    >
      <div className="container grid grid-cols-4 gap-6" style={{ marginBottom: '40px' }}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} color="white" />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>
              <span style={{ color: 'var(--logo-blue)' }}>Ninu</span>
              <span style={{
                background: 'linear-gradient(to right, var(--logo-blue) 50%, var(--text) 50%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>S</span>
              <span style={{ color: 'var(--text)' }}>oft</span>{' '}
              <span style={{ color: 'var(--secondary)' }}>AI</span>
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
            المنصة الأولى الموثوقة في العراق لتوفير وتفعيل اشتراكات جوجل والذكاء الاصطناعي رسميًا وبأسهل طرق الدفع المحلية.
          </p>
        </div>

        <div>
          <h4 style={{ color: 'var(--text)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>روابط سريعة</h4>
          <ul className="flex flex-col gap-2" style={{ listStyle: 'none', fontSize: '0.85rem' }}>
            <li><a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>الرئيسية</a></li>
            <li><a href="#benefits" onClick={(e) => { e.preventDefault(); scrollToSection('benefits'); }}>المميزات</a></li>
            <li><a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}>الباقات والأسعار</a></li>
            <li><a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>الأسئلة الشائعة</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'var(--text)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>معلومات وضمانات</h4>
          <ul className="flex flex-col gap-2" style={{ listStyle: 'none', fontSize: '0.85rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: 'var(--success)' }} /> تفعيل رسمي وقانوني 100%</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: 'var(--success)' }} /> لا نطلب أي كلمة مرور</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} style={{ color: 'var(--success)' }} /> ضمان كامل ومستمر للمدة</li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'var(--text)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>تواصل معنا</h4>
          <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>لديكم استفسار أو بحاجة لمساعدة?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a
              href={`https://wa.me/${whatsappNum}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text)',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Phone size={16} style={{ color: 'var(--primary)' }} />
              <span className="number-latin">
                {whatsappNum.startsWith('964')
                  ? `+964 ${whatsappNum.slice(3, 5)} ${whatsappNum.slice(5, 8)} ${whatsappNum.slice(8, 10)} ${whatsappNum.slice(10)}`
                  : whatsappNum.startsWith('0')
                    ? `+964 ${whatsappNum.slice(1, 3)} ${whatsappNum.slice(3, 6)} ${whatsappNum.slice(6, 8)} ${whatsappNum.slice(8)}`
                    : whatsappNum.length === 10
                      ? `+964 ${whatsappNum.slice(0, 2)} ${whatsappNum.slice(2, 5)} ${whatsappNum.slice(5, 7)} ${whatsappNum.slice(7)}`
                      : whatsappNum
                }
              </span>
            </a>
            <a
              href="https://t.me/NinuSoft?direct"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text)',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Send size={16} style={{ color: '#229ED9' }} />
              <span>الدعم الفني (تلغرام)</span>
            </a>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', textAlign: 'center', fontSize: '0.8rem' }}>
        <p>© {new Date().getFullYear()} NinuSoft AI. جميع الحقوق محفوظة ومضمونة.</p>
        <div className="flex justify-center gap-6 mt-3 mb-2">
          <Link to="/privacy" className="hover:text-[var(--primary)] font-semibold transition-colors">سياسة الخصوصية</Link>
          <Link to="/terms" className="hover:text-[var(--primary)] font-semibold transition-colors">شروط الخدمة والاستخدام</Link>
        </div>
        <p style={{ marginTop: '4px', opacity: 0.5 }}>موقع مستقل وغير تابع لشركة Google Inc. رسميًا، نوفر خدمات المساعدة لتنشيط الاشتراكات محليًا.</p>
      </div>
    </footer>
  );
};
