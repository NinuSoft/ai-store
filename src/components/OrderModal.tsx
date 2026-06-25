import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, Mail, Phone, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Plan {
  id: string;
  name: string;
  duration_months: number;
  price_iqd: number;
}

interface OrderModalProps {
  plan: Plan | null;
  onClose: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ plan, onClose }) => {
  const { user, profile, signInWithGoogle } = useAuth();
  
  // Order inputs
  const [name, setName] = useState('');
  const [gmail, setGmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // UX states
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  // Pre-fill phone if user is already logged in
  useEffect(() => {
    if (profile) {
      setPhone(profile.phone || '');
    }
  }, [profile]);

  if (!plan) return null;

  const validateInputs = () => {
    if (!phone) return 'رقم الهاتف مطلوب للتواصل وتفعيل الاشتراك.';
    
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!/^(07\d{9}|\+9647\d{9})$/.test(cleanPhone)) {
      return 'يرجى إدخال رقم هاتف عراقي صالح (مثال: 07701234567).';
    }

    if (!gmail) return 'يرجى إدخال حساب الـ Gmail المراد تفعيل الاشتراك عليه.';
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(gmail.trim().toLowerCase())) {
      return 'يجب أن يكون البريد الإلكتروني للتفعيل حساب Gmail رسمي ينتهي بـ @gmail.com.';
    }

    return null;
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
      setErrorMessage('فشل تسجيل الدخول بـ Google.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    const errorMsg = validateInputs();
    if (errorMsg) {
      setErrorMessage(errorMsg);
      return;
    }

    setLoading(true);

    try {
      if (!user) throw new Error('يرجى تسجيل الدخول أولاً.');

      // 1. Prevent duplicate pending orders for the same Gmail address
      const { data: existingOrders, error: orderCheckError } = await supabase
        .from('orders')
        .select('*')
        .eq('gmail', gmail.trim().toLowerCase())
        .eq('status', 'pending');

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
          gmail: gmail.trim().toLowerCase(),
          phone: phone.trim(),
          status: 'pending'
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
          maxWidth: '560px',
          padding: '32px',
          position: 'relative',
          overflowY: 'auto',
          maxHeight: '90vh',
          animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
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

        {!success ? (
          <>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <div className="badge badge-secondary mb-2" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid #10b981' }}>تفعيل أولاً - دفع لاحقاً</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{plan.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                القيمة عند الدفع: <span style={{ color: 'var(--success)', fontWeight: 700, fontFamily: 'var(--font-latin)' }}>{plan.price_iqd.toLocaleString()} د.ع</span> (تسدد بعد التنشيط)
              </p>
            </div>

            {/* Trust-First Flow Box */}
            <div 
              style={{
                background: 'rgba(16, 185, 129, 0.04)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                borderRadius: 'var(--radius)',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'right'
              }}
            >
              <h4 style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>
                كيف تعمل العملية؟
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: 'var(--secondary)', width: '18px', height: '18px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.7rem' }}>١</span>
                  <span>أرسل بريد الـ Gmail ورقم هاتفك (لا يطلب أي دفع مسبق).</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: 'var(--secondary)', width: '18px', height: '18px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.7rem' }}>٢</span>
                  <span>نقوم بتفعيل الباقة وإرسال دعوة التنشيط لحسابك مباشرة.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: 'var(--secondary)', width: '18px', height: '18px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.7rem' }}>٣</span>
                  <span>تتأكد بنفسك من تفعيل Gemini Advanced ومساحة الـ 2TB.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#10b981', width: '18px', height: '18px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.7rem' }}>٤</span>
                  <span>بعد نجاح التنشيط والتأكد التام، تقوم بتحويل قيمة الباقة محلياً.</span>
                </li>
              </ul>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div 
                className="flex items-start gap-3"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--danger)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  color: '#f87171',
                  fontSize: '0.9rem'
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {!user ? (
              /* Google Authentication segment if not logged in */
              <div style={{ textAlign: 'center', padding: '16px 0' }} className="flex flex-col gap-4">
                <div 
                  style={{
                    background: 'rgba(124, 58, 237, 0.05)',
                    border: '1px dashed var(--secondary)',
                    borderRadius: 'var(--radius)',
                    padding: '20px',
                    textAlign: 'right'
                  }}
                >
                  <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '8px' }} className="flex items-center gap-2">
                    <ShieldCheck size={18} style={{ color: 'var(--secondary)' }} />
                    <span>تنبيه: يجب تسجيل الدخول للمتابعة</span>
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                    لحفظ طلب تفعيل باقة الذكاء الاصطناعي ومتابعة حالة التنشيط مع فريق الدعم الفني، يرجى تسجيل الدخول السريع بـ Google أولاً.
                  </p>
                </div>

                <button 
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
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
                    opacity: authLoading ? 0.7 : 1
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 15.01.5 12 .5 7.37.5 3.4 3.17 1.5 7.08l3.9 3.02c.9-2.72 3.43-4.56 6.6-4.56z"/>
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.43c-.28 1.44-1.1 2.66-2.33 3.48l3.63 2.81c2.13-1.97 3.76-4.87 3.76-8.38z"/>
                    <path fill="#FBBC05" d="M5.4 14.9a6.86 6.86 0 0 1 0-4.23L1.5 7.65a11.95 11.95 0 0 0 0 10.49l3.9-3.24z"/>
                    <path fill="#34A853" d="M12 23.5c3.24 0 5.95-1.07 7.94-2.91l-3.63-2.81c-1.01.68-2.3 1.08-4.31 1.08-3.17 0-5.7-1.84-6.6-4.56L1.5 17.34c1.9 3.91 5.87 6.16 10.5 6.16z"/>
                  </svg>
                  {authLoading ? 'جاري الاتصال بـ Google...' : 'الدخول السريع باستخدام حساب Google'}
                </button>
              </div>
            ) : (
              /* Order placement fields once logged in */
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      الاسم بالكامل (اختياري)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="أدخل اسمك الكريم"
                        style={{
                          width: '100%', padding: '10px 36px 10px 12px',
                          background: 'var(--background)', border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)', color: 'white', fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      رقم الهاتف للتواصل (زين كاش / واتساب) <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="077XXXXXXXX"
                        style={{
                          width: '100%', padding: '10px 36px 10px 12px',
                          background: 'var(--background)', border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)', color: 'white', fontSize: '0.9rem',
                          fontFamily: 'var(--font-latin)', direction: 'ltr', textAlign: 'right'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      بريد Gmail المراد تفعيل الاشتراك عليه <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text"
                        value={gmail}
                        onChange={(e) => setGmail(e.target.value)}
                        placeholder="username@gmail.com"
                        style={{
                          width: '100%', padding: '10px 36px 10px 12px',
                          background: 'var(--background)', border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)', color: 'white', fontSize: '0.9rem',
                          fontFamily: 'var(--font-latin)', direction: 'ltr', textAlign: 'right'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      ✓ سنقوم بتنشيط الاشتراك مباشرة على هذا الحساب الرسمي.
                    </span>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    fontSize: '1.05rem',
                    marginTop: '12px',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'جاري معالجة الطلب...' : 'تأكيد وحفظ الطلب الآن'}
                </button>
                
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  طلبك آمن 100%، ولن يتم خصم أي مبالغ حتى يتم التواصل وتأكيد التفعيل معك.
                </p>
              </form>
            )}
          </>
        ) : (
          /* Success Screen */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="flex justify-center mb-6">
              <CheckCircle size={72} style={{ color: 'var(--success)' }} />
            </div>
            
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
              تم استلام طلبك بنجاح!
            </h3>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.8', marginBottom: '32px' }}>
              شكراً لثقتك بنا. لقد تم تسجيل طلبك لتفعيل باقة <strong style={{ color: 'white' }}>{plan.name}</strong> على حساب Gmail التالي:
              <br />
              <strong style={{ color: 'var(--secondary)', fontFamily: 'var(--font-latin)' }}>{gmail}</strong>.
              <br /><br />
              سيقوم فريق الدعم بالتواصل معك فوراً على الرقم <strong style={{ color: 'white', fontFamily: 'var(--font-latin)' }}>{phone}</strong> لتزويدك بتفاصيل الدفع وتأكيد تفعيل الاشتراك خلال دقائق معدودة.
            </p>

            <div className="flex flex-col gap-3">
              <a 
                href={`https://wa.me/9647701234567?text=${encodeURIComponent(`مرحباً، قمت بتقديم طلب تفعيل باقة ${plan.name} على بريد ${gmail} وأود تسريع عملية التفعيل.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  backgroundColor: '#25d366',
                  backgroundImage: 'none',
                  boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)',
                  width: '100%',
                  padding: '14px 20px'
                }}
              >
                تواصل معنا لتسريع التفعيل عبر واتساب
              </a>
              
              <button 
                onClick={onClose}
                className="btn btn-outline"
                style={{ width: '100%', padding: '12px 20px' }}
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
