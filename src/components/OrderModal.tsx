import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, Mail, Phone, User, RotateCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Plan {
  id: string;
  name: string;
  duration_months: number;
  price_iqd: number;
}

interface OrderModalProps {
  plan: Plan | null;
  whatsappNum?: string;
  onClose: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ plan, _whatsappNum = '9647750977509', onClose }) => {
  const { user, profile, signInWithGoogle, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Profile / Order inputs
  const [name, setName] = useState('');
  const [gmail, setGmail] = useState('');
  const [phone, setPhone] = useState('');

  // UX states
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const orderSubmitted = useRef(false);

  // Initialize inputs from user / profile
  useEffect(() => {
    if (user) {
      setGmail(user.email || '');
    }
    if (profile) {
      setName(profile.full_name || '');
      setPhone(profile.phone || '');
    } else if (user) {
      setName(user.user_metadata?.full_name || user.user_metadata?.name || '');
    }
  }, [user, profile]);

  // Automatic order submission if user has a phone
  const autoSubmitOrder = React.useCallback(async () => {
    if (!user || !profile || !profile.phone || !plan) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const orderEmail = user.email || profile.email || '';

      // 1. Prevent duplicate pending orders for the same Gmail
      const { data: existingOrders, error: orderCheckError } = await supabase
        .from('orders')
        .select('*')
        .eq('gmail', orderEmail.trim().toLowerCase())
        .eq('status', 'Pending');

      if (orderCheckError) throw orderCheckError;

      if (existingOrders && existingOrders.length > 0) {
        throw new Error('يوجد بالفعل طلب قيد الانتظار لهذا البريد الإلكتروني. سنقوم بالتواصل معكم قريباً لتفعيله.');
      }

      // 2. Create the order
      const { error: insertError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          gmail: orderEmail.trim().toLowerCase(),
          phone: profile.phone.trim(),
          status: 'Pending'
        });

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err: any) {
      console.error('Auto Order Submission Error:', err);
      setErrorMessage(err.message || 'حدث خطأ غير متوقع أثناء إرسال طلبك. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  }, [user, profile, plan]);

  useEffect(() => {
    if (user && profile && profile.phone && plan && !orderSubmitted.current) {
      orderSubmitted.current = true;
      autoSubmitOrder();
    }
  }, [user, profile, plan, autoSubmitOrder]);

  if (!plan) return null;

  const validatePhone = (number: string) => {
    const clean = number.replace(/[\s-]/g, '');
    return /^(07\d{9}|\+9647\d{9})$/.test(clean);
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setAuthLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMessage(error.message || 'حدث خطأ أثناء تسجيل الدخول بـ Google.');
      }
    } catch (err) {
      console.error('Google login error in modal:', err);
      setErrorMessage('فشل تسجيل الدخول بـ Google.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('يرجى إدخال اسمك الكامل.');
      return;
    }

    if (!phone) {
      setErrorMessage('رقم الهاتف مطلوب للتواصل وتفعيل الاشتراك.');
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMessage('يرجى إدخال رقم هاتف عراقي صالح (مثال: 07701234567).');
      return;
    }

    setLoading(true);

    try {
      if (!user) throw new Error('يرجى تسجيل الدخول أولاً.');

      // 1. Update the user profile with the entered name and phone
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: name.trim(),
          phone: phone.trim()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Refresh the context state
      await refreshProfile();

      // 2. Prevent duplicate pending orders for the same Gmail
      const orderEmail = user.email || '';
      const { data: existingOrders, error: orderCheckError } = await supabase
        .from('orders')
        .select('*')
        .eq('gmail', orderEmail.trim().toLowerCase())
        .eq('status', 'Pending');

      if (orderCheckError) throw orderCheckError;

      if (existingOrders && existingOrders.length > 0) {
        throw new Error('يوجد بالفعل طلب قيد الانتظار لهذا البريد الإلكتروني. سنقوم بالتواصل معكم قريباً لتفعيله.');
      }

      // 3. Create the order
      const { error: insertError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          gmail: orderEmail.trim().toLowerCase(),
          phone: phone.trim(),
          status: 'Pending'
        });

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err: any) {
      console.error('Order Submission Error:', err);
      setErrorMessage(err.message || 'حدث خطأ غير متوقع أثناء إرسال طلبك. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  const hasPhone = !!(profile && profile.phone);

  return (
    <div
      className="modal-overlay flex items-center justify-center"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        padding: '20px'
      }}
    >
      <div
        className="modal-container glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
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
        {/* Close Button */}
        {(!loading || success) && (
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
        )}

        {!success ? (
          <>
            {/* Header */}
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <div className="badge badge-secondary mb-2" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.75rem' }}>تفعيل رسمي - دفع بعد التأكد</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>طلب باقة {plan.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                قيمة الاشتراك: <span style={{ color: 'var(--success)', fontWeight: 700 }} className="number-latin">{plan.price_iqd.toLocaleString('en-US')} د.ع</span>
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && !hasPhone && (
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

            {!user ? (
              /* Google Authentication segment if not logged in */
              <div style={{ textAlign: 'center' }} className="flex flex-col gap-4">
                <div
                  style={{
                    background: 'rgba(124, 58, 237, 0.03)',
                    border: '1px dashed var(--border)',
                    borderRadius: '16px',
                    padding: '20px',
                    textAlign: 'right'
                  }}
                >
                  <h4 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: '8px' }} className="flex items-center gap-2">
                    <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
                    <span>يجب تسجيل الدخول للمتابعة</span>
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                    لتسجيل طلبك وحفظه على حسابك الشخصي، يرجى تسجيل الدخول باستخدام حساب Google.
                  </p>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    fontWeight: 800,
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-raised)',
                    color: 'var(--text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  {authLoading ? (
                    <RotateCw size={18} className="animate-spin" />
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>الدخول باستخدام حساب Google</span>
                    </>
                  )}
                </button>
              </div>
            ) : hasPhone ? (
              loading ? (
                /* Automatic Loader if profile is already complete */
                <div style={{ textAlign: 'center', padding: '40px 0' }} className="flex flex-col items-center gap-4">
                  <RotateCw size={36} className="animate-spin" style={{ color: 'var(--primary)' }} />
                  <h4 style={{ color: 'var(--text)', fontWeight: 700 }}>جاري تسجيل طلبك...</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    نقوم بتسجيل الباقة على حسابك الشخصي، يرجى الانتظار للحظة.
                  </p>
                </div>
              ) : errorMessage ? (
                /* Error Screen for automatic orders */
                <div style={{ textAlign: 'center', padding: '30px 0' }} className="flex flex-col items-center gap-4">
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f87171',
                    marginBottom: '8px'
                  }}>
                    <AlertTriangle size={28} />
                  </div>
                  <h4 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '1.15rem' }}>تعذر إرسال الطلب</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '340px', lineHeight: '1.6' }}>
                    {errorMessage}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        setErrorMessage('');
                        autoSubmitOrder();
                      }}
                      className="btn btn-primary"
                      style={{ padding: '10px 24px', fontSize: '0.88rem' }}
                    >
                      إعادة المحاولة
                    </button>
                    <button
                      onClick={onClose}
                      className="btn"
                      style={{ padding: '10px 24px', fontSize: '0.88rem', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }}
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              ) : null
            ) : (
              /* Form to complete profile (first login / missing phone) */
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.03)',
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                    borderRadius: '16px',
                    padding: '16px',
                    textAlign: 'right'
                  }}
                >
                  <h4 style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>
                    تأكيد معلومات الاتصال
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.5' }}>
                    سنقوم بربط هذا الاشتراك ببياناتك الشخصية وتفعيل الباقة على الـ Gmail الخاص بك مباشرة.
                  </p>
                </div>

                {/* Email (Disabled) */}
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>البريد الإلكتروني للتفعيل</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      value={gmail}
                      disabled
                      style={{
                        width: '100%', padding: '12px 42px 12px 16px',
                        borderRadius: '12px', border: '1px solid var(--border)',
                        background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)',
                        fontSize: '0.9rem', fontFamily: 'var(--font-latin)', cursor: 'not-allowed'
                      }}
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>الاسم الكامل (قابل للتعديل)</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="الاسم الكامل"
                      required
                      style={{
                        width: '100%', padding: '12px 42px 12px 16px',
                        borderRadius: '12px', border: '1px solid var(--border)',
                        background: 'rgba(255,255,255,0.01)', color: 'var(--text)',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>رقم الهاتف</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="مثال: 07701234567"
                      required
                      style={{
                        width: '100%', padding: '12px 42px 12px 16px',
                        borderRadius: '12px', border: '1px solid var(--border)',
                        background: 'rgba(255,255,255,0.01)', color: 'var(--text)',
                        fontSize: '0.9rem', fontFamily: 'var(--font-latin)'
                      }}
                    />
                  </div>
                </div>

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
                  {loading ? <RotateCw size={18} className="animate-spin" /> : 'تأكيد وحفظ الطلب الآن'}
                </button>
              </form>
            )}
          </>
        ) : (
          /* Success Screen */
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div className="flex justify-center mb-6">
              <CheckCircle size={64} style={{ color: 'var(--success)' }} />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px' }}>
              تم استلام طلبك بنجاح!
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '28px' }}>
              لقد سجلنا طلبك لتنشيط باقة <strong style={{ color: 'var(--text)' }}>{plan.name}</strong> على بريدك الإلكتروني:
              <br />
              <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-latin)', fontSize: '0.95rem' }}>{gmail || user?.email}</strong>.
              <br /><br />
              سيقوم فريق تفعيل <strong style={{ color: 'var(--text)' }}>نينوسوفت للذكاء الاصطناعي</strong> بالتواصل معك فوراً لتأكيد التنشيط على الرقم التالي:
              <br />
              <strong style={{ color: 'var(--text)', fontFamily: 'var(--font-latin)', fontSize: '1rem' }}>{phone || (profile && profile.phone)}</strong>.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  onClose();
                  navigate('/dashboard');
                }}
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
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                الانتقال إلى لوحة التحكم
              </button>

              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontWeight: 800,
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text)'
                }}
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderModal;
