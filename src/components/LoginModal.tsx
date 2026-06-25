import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMsg(error.message || 'حدث خطأ أثناء تسجيل الدخول باستخدام Google.');
        setLoading(false);
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      setErrorMsg('حدث خطأ غير متوقع أثناء تسجيل الدخول.');
      setLoading(false);
    }
  };

  return (
    <div 
      className="modal-overlay flex items-center justify-center"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1500,
        padding: '20px'
      }}
    >
      <div 
        className="modal-container glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px',
          position: 'relative',
          textAlign: 'center',
          animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px', left: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Logo / Header */}
        <div style={{ marginBottom: '24px' }}>
          <div className="flex justify-center mb-4">
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', color: 'white', justifyContent: 'center' }}>
              <Sparkles size={28} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>تسجيل الدخول للمتجر</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
            سجل دخولك لمتابعة اشتراكاتك وطلبات التجديد الفورية
          </p>
        </div>

        {/* Info card for administrative sandbox simulation */}
        <div 
          style={{
            background: 'rgba(124, 58, 237, 0.05)',
            border: '1px dashed var(--secondary)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginBottom: '24px',
            lineHeight: '1.6',
            textAlign: 'right'
          }}
        >
          💡 محاكاة تسجيل الدخول:
          <br />
          اكتب <strong style={{ color: 'var(--text)' }}>admin@googleai.iq</strong> للتحكم كمدير نظام، أو اكتب أي بريد إلكتروني آخر للدخول كعميل.
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div 
            className="flex items-start gap-3"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#f87171',
              fontSize: '0.85rem',
              textAlign: 'right'
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn"
          style={{
            width: '100%',
            padding: '14px 20px',
            fontSize: '1rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            backgroundColor: 'white',
            color: '#0f172a',
            border: 'none',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            transition: 'var(--transition)',
            opacity: loading ? 0.7 : 1
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 15.01.5 12 .5 7.37.5 3.4 3.17 1.5 7.08l3.9 3.02c.9-2.72 3.43-4.56 6.6-4.56z"/>
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.43c-.28 1.44-1.1 2.66-2.33 3.48l3.63 2.81c2.13-1.97 3.76-4.87 3.76-8.38z"/>
            <path fill="#FBBC05" d="M5.4 14.9a6.86 6.86 0 0 1 0-4.23L1.5 7.65a11.95 11.95 0 0 0 0 10.49l3.9-3.24z"/>
            <path fill="#34A853" d="M12 23.5c3.24 0 5.95-1.07 7.94-2.91l-3.63-2.81c-1.01.68-2.3 1.08-4.31 1.08-3.17 0-5.7-1.84-6.6-4.56L1.5 17.34c1.9 3.91 5.87 6.16 10.5 6.16z"/>
          </svg>
          {loading ? 'جاري الاتصال بـ Google...' : 'الدخول السريع بـ Google'}
        </button>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '20px', lineHeight: '1.6' }}>
          ✓ لا يتطلب أي كلمات مرور، الدفع والتفعيل آمن 100%.
        </p>

      </div>
    </div>
  );
};

export default LoginModal;
