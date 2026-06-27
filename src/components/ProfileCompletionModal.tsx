import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Phone, User, Mail, AlertTriangle, RotateCw, LogOut } from 'lucide-react';

interface ProfileCompletionModalProps {
  onComplete?: () => void;
}

export const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({ onComplete }) => {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '');
      setPhone(profile.phone || '');
    } else if (user) {
      setName(user.user_metadata?.full_name || user.user_metadata?.name || '');
    }
  }, [profile, user]);

  if (!user) return null;

  const validatePhone = (number: string) => {
    const clean = number.replace(/[\s-]/g, '');
    return /^(07\d{9}|\+9647\d{9})$/.test(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('يرجى إدخال اسمك الكامل.');
      return;
    }

    if (!phone) {
      setErrorMessage('رقم الهاتف مطلوب للتواصل وتفعيل اشتراكك.');
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMessage('يرجى إدخال رقم هاتف عراقي صالح (مثال: 07701234567).');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: name.trim(),
          phone: phone.trim()
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      if (onComplete) {
        onComplete();
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ البيانات. يرجى المحاولة لاحقاً.');
    } finally {
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
        backdropFilter: 'blur(12px)',
        zIndex: 2000,
        padding: '20px'
      }}
    >
      <div 
        className="modal-container glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '32px',
          borderRadius: '24px',
          position: 'relative',
          overflowY: 'auto',
          maxHeight: '90vh',
          animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          border: '1px solid var(--border)',
          background: 'var(--surface-glass)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="badge badge-primary mb-3" style={{ fontSize: '0.8rem' }}>التسجيل لأول مرة</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>إكمال معلومات حسابك</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '6px', lineHeight: '1.5' }}>
            أهلاً بك! يرجى ملء بياناتك الأساسية لتتمكن من تفعيل باقات الذكاء الاصطناعي وتتبع طلباتك.
          </p>
        </div>

        {errorMessage && (
          <div 
            className="flex items-start gap-3"
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid var(--danger)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#f87171',
              fontSize: '0.85rem'
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email (Read-Only) */}
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>البريد الإلكتروني (Gmail)</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  right: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-muted)' 
                }} 
              />
              <input 
                type="email" 
                value={user.email || ''} 
                disabled 
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.02)',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-latin)',
                  cursor: 'not-allowed'
                }}
              />
            </div>
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>الاسم الكامل (قابل للتعديل)</label>
            <div style={{ position: 'relative' }}>
              <User 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  right: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-secondary)' 
                }} 
              />
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
                required
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.01)',
                  color: 'var(--text)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>رقم الهاتف (زين كاش أو رقم اتصال)</label>
            <div style={{ position: 'relative' }}>
              <Phone 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  right: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-secondary)' 
                }} 
              />
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: 07701234567"
                required
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.01)',
                  color: 'var(--text)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-latin)'
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 20px',
              fontWeight: 800,
              borderRadius: '12px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '12px'
            }}
          >
            {loading ? (
              <RotateCw size={18} className="animate-spin" />
            ) : (
              'حفظ ومتابعة'
            )}
          </button>

          {/* Sign Out option */}
          <button
            type="button"
            onClick={() => signOut()}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '8px'
            }}
          >
            <LogOut size={14} />
            <span>تسجيل الخروج</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;
