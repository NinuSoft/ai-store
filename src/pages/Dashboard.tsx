import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles, LogOut, Clock, Calendar, CheckCircle2,
  AlertCircle, MessageSquare, RotateCw, PlusCircle,
  User, Activity, Send
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ThemeToggle } from '../components/ThemeToggle';
import { ProfileCompletionModal } from '../components/ProfileCompletionModal';

interface Plan {
  id: string;
  name: string;
  duration_months: number;
  price_iqd: number;
}

interface Order {
  id: string;
  user_id: string;
  gmail: string;
  phone: string;
  status: 'pending' | 'processing' | 'awaiting_payment' | 'paid' | 'expired' | 'rejected' | 'cancelled';
  created_at: string;
  plan_id: string;
  activation_date?: string;
  payment_date?: string;
  notes?: string;
  plan_name_snapshot?: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  product_id?: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'suspended';
  gmail?: string;
  phone?: string;
}

interface Renewal {
  id: string;
  subscription_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const Dashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  
  // Action states
  const [submittingRenewal, setSubmittingRenewal] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });
  const [whatsappNum, setWhatsappNum] = useState('9647750977509');
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const loadData = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    try {
      // 1. Fetch plans
      const { data: plansData } = await supabase.from('plans').select('*');
      const planMap: Record<string, Plan> = {};
      if (plansData) {
        plansData.forEach((p: Plan) => { planMap[p.id] = p; });
        setPlans(planMap);
      }

      // Fetch settings
      const { data: settingsData } = await supabase.from('settings').select('*');
      if (settingsData) {
        const wa = settingsData.find((s: any) => s.key === 'whatsapp');
        if (wa && wa.value) {
          let val = typeof wa.value === 'string' ? JSON.parse(wa.value).value : wa.value.value;
          if (val) {
            setWhatsappNum(val.replace(/\D/g, ''));
          }
        }
      }

      // 2. Fetch user orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      let mappedOrders: Order[] = [];
      if (ordersData) {
        mappedOrders = ordersData.map((o: any) => {
          let frontendStatus: Order['status'] = 'pending';
          if (o.status === 'Activated') {
            if (o.payment_status === 'Paid') {
              frontendStatus = 'paid';
            } else if (o.payment_status === 'AwaitingPayment') {
              frontendStatus = 'awaiting_payment';
            } else {
              frontendStatus = 'awaiting_payment';
            }
          } else if (o.status === 'Processing') {
            frontendStatus = 'processing';
          } else if (o.status === 'Pending') {
            frontendStatus = 'pending';
          } else if (o.status === 'Rejected') {
            frontendStatus = 'rejected';
          } else if (o.status === 'Cancelled') {
            frontendStatus = 'cancelled';
          }
          return {
            ...o,
            status: frontendStatus
          };
        });
        setOrders(mappedOrders);
      }

      // 3. Fetch user subscriptions
      const { data: subsData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('expires_at', { ascending: false });
      
      let mappedSubs: Subscription[] = [];
      if (subsData) {
        mappedSubs = subsData.map((s: any) => ({
          id: s.id,
          user_id: s.user_id,
          plan_id: s.plan_id,
          product_id: s.product_id,
          start_date: s.activated_at,
          end_date: s.expires_at,
          status: s.status.toLowerCase() as 'active' | 'expired' | 'suspended'
        }));
        setSubscriptions(mappedSubs);
      }

      // 4. Derive renewals from mapped orders and subscriptions
      const activeSubRef = mappedSubs.find(s => s.status === 'active') || mappedSubs[0];
      const derivedRenewals = mappedOrders
        .filter((o: Order) => o.status === 'pending')
        .map((o: Order) => ({
          id: o.id,
          user_id: o.user_id,
          subscription_id: activeSubRef?.id || '',
          status: 'pending' as const,
          created_at: o.created_at,
          gmail: o.gmail,
          phone: o.phone,
          plan_name: planMap[o.plan_id]?.name || 'تجديد اشتراك'
        }));
      setRenewals(derivedRenewals);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();

    if (!user) return;

    // Subscribe to realtime database updates for the logged-in user
    const channel = supabase
      .channel(`dashboard-realtime-${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders',
        filter: `user_id=eq.${user.id}`
      }, () => {
        loadData(true);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'subscriptions',
        filter: `user_id=eq.${user.id}`
      }, () => {
        loadData(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadData]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleRequestRenewal = async (sub: Subscription) => {
    // Check if there is already a pending renewal for this subscription
    const hasPending = orders.some(o => o.status === 'pending');

    if (hasPending) {
      setActionMessage({ text: 'يوجد بالفعل طلب تجديد قيد المراجعة لهذا الاشتراك.', type: 'warning' });
      return;
    }

    setSubmittingRenewal(sub.id);
    setActionMessage({ text: '', type: '' });

    try {
      const plan = plans[sub.plan_id];
      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          product_id: sub.product_id || 'e5b98f24-5d5d-4f10-bf9d-f685d03a11b6',
          plan_id: sub.plan_id,
          gmail: sub.gmail || user.email || '',
          phone: sub.phone || profile?.phone || '',
          status: 'Pending',
          payment_status: 'Pending',
          product_name_snapshot: 'Google AI Pro',
          plan_name_snapshot: plan?.name || '12 Months',
          price_snapshot: plan?.price_iqd || 40000
        });

      if (error) throw error;

      setActionMessage({ text: 'تم إرسال طلب التجديد بنجاح! سيقوم الدعم الفني بمراجعته وتفعيله قريباً.', type: 'success' });
      await loadData(true); // Reload
    } catch (err: any) {
      console.error('Error requesting renewal:', err);
      setActionMessage({ text: 'حدث خطأ أثناء تقديم طلب التجديد. يرجى المحاولة لاحقاً.', type: 'danger' });
    } finally {
      setSubmittingRenewal(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrder(orderId);
    setActionMessage({ text: '', type: '' });

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'Cancelled' })
        .eq('id', orderId);

      if (error) throw error;

      setActionMessage({ text: 'تم إلغاء الطلب بنجاح.', type: 'success' });
      await loadData(true);
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      setActionMessage({
        text: err.message || 'حدث خطأ أثناء إلغاء الطلب. يرجى المحاولة لاحقاً.',
        type: 'danger'
      });
    } finally {
      setCancellingOrder(null);
    }
  };

  // Helper: calculate remaining days
  const calculateDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const activeSub = subscriptions.find(s => s.status === 'active') || subscriptions.find(s => s.status === 'suspended') || subscriptions.find(s => s.status === 'expired');
  const daysRemaining = activeSub ? calculateDaysRemaining(activeSub.end_date) : 0;
  
  // Total subscription length in days for the progress bar
  const totalDays = activeSub && plans[activeSub.plan_id] 
    ? plans[activeSub.plan_id].duration_months * 30 
    : 30;
  const progressPercent = activeSub ? Math.min((daysRemaining / totalDays) * 100, 100) : 0;

  const awaitingPaymentOrders = orders.filter(o => o.status === 'awaiting_payment');

  // Dashboard overview stats
  const activeSubsCount = subscriptions.filter(s => s.status === 'active').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء الخير';
  })();

  const getSubscriptionStatusDetails = (sub: Subscription) => {
    const hasPendingRenewal = renewals.some(
      r => r.subscription_id === sub.id && r.status === 'pending'
    );
    if (hasPendingRenewal) {
      return { label: 'مطلوب التجديد', badgeClass: 'badge-warning' };
    }
    if (sub.status === 'suspended') {
      return { label: 'معلّق / موقوف مؤقتاً', badgeClass: 'badge-danger' };
    }
    if (sub.status === 'active') {
      return { label: 'نشط ومفعّل', badgeClass: 'badge-success' };
    }
    return { label: 'منتهي الصلاحية', badgeClass: 'badge-danger' };
  };

  const getOrderStatusDetails = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { label: 'قيد المراجعة', badgeClass: 'badge-warning', color: '#fbbf24' };
      case 'processing':
        return { label: 'جاري التفعيل', badgeClass: 'badge-primary', color: '#60a5fa' };
      case 'awaiting_payment':
        return { label: 'مفعّل - بانتظار الدفع', badgeClass: 'badge-secondary', color: '#a78bfa' };
      case 'paid':
        return { label: 'تم الدفع', badgeClass: 'badge-success', color: '#34d399' };
      case 'expired':
        return { label: 'منتهي الصلاحية', badgeClass: 'badge-danger', color: '#f87171' };
      case 'rejected':
        return { label: 'مرفوض', badgeClass: 'badge-danger', color: '#f87171' };
      case 'cancelled':
        return { label: 'تم الإلغاء', badgeClass: 'badge-danger', color: '#f87171' };
      default:
        return { label: status, badgeClass: 'badge-primary', color: 'var(--text-muted)' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <RotateCw size={40} className="animate-float" style={{ animationDuration: '2s', color: 'var(--primary)' }} />
          <p style={{ marginTop: '16px', fontSize: '1rem' }}>جاري تحميل بياناتك...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <style>{`
        .dash-metric {
          position: relative;
          border-radius: 24px;
          border: 1px solid var(--border);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.015) 0%, rgba(255, 255, 255, 0.005) 100%);
          padding: 22px;
          overflow: hidden;
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease, box-shadow 0.3s ease;
          box-shadow: var(--shadow);
        }
        .dash-metric:hover {
          transform: translateY(-5px);
          border-color: rgba(99, 102, 241, 0.35);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18), 0 0 24px rgba(99, 102, 241, 0.08);
        }
        .dash-metric-glow {
          position: absolute;
          top: -50px; right: -50px;
          width: 120px; height: 120px;
          border-radius: 50%;
          filter: blur(45px);
          opacity: 0.14;
          pointer-events: none;
        }
        .dash-welcome {
          position: relative;
          border-radius: 28px;
          border: 1px solid var(--border);
          background: linear-gradient(135deg, var(--primary-light) 0%, var(--secondary-glow) 100%);
          padding: 28px 32px;
          overflow: hidden;
          box-shadow: var(--shadow);
        }
        .dash-welcome::before {
          content: '';
          position: absolute;
          top: -40px; left: -40px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--primary-glow), transparent 70%);
          opacity: 0.5;
          pointer-events: none;
        }
        .dash-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          font-weight: 800;
          color: white;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          box-shadow: var(--shadow-primary);
          flex-shrink: 0;
          overflow: hidden;
        }
        .dash-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .dash-profile-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
        }
        .dash-profile-row + .dash-profile-row {
          border-top: 1px solid var(--border);
        }
      `}</style>
      
      {/* HEADER */}
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--background-alt)', padding: '16px 0' }}>
        <div className="container flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', color: 'white', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>لوحة التحكم</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {profile?.is_admin && (
              <Link to="/admin" className="badge badge-secondary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
                🛡️ لوحة الإدارة
              </Link>
            )}
            <span style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>
              {profile?.full_name || profile?.email}
            </span>
            <button 
              onClick={handleSignOut}
              className="btn btn-outline" 
              style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={14} /> خروج
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '40px 20px' }}>
        
        {/* Welcome Banner */}
        <div className="dash-welcome animate-fade-in" style={{ marginBottom: '28px' }}>
          <div className="flex items-center gap-5 flex-wrap" style={{ position: 'relative', zIndex: 1 }}>
            <div className="dash-avatar">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile?.full_name || 'user'} />
              ) : (
                <User size={26} />
              )}
            </div>
            <div className="flex flex-col" style={{ gap: '2px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {greeting} 👋
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
                {profile?.full_name || 'مرحباً بك'}
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {activeSub?.status === 'active'
                  ? 'اشتراكك نشط ومفعّل — استمتع بمزايا Google AI Pro'
                  : activeSub?.status === 'suspended'
                    ? 'اشتراكك معلّق حالياً — يرجى التواصل مع الدعم الفني'
                    : activeSub?.status === 'expired'
                      ? 'انتهت صلاحية اشتراكك — جدّد الآن لاستئناف الخدمة'
                      : 'لا يوجد اشتراك مفعّل بعد — تصفح الباقات وابدأ الآن'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <section className="grid grid-cols-3 gap-6" style={{ marginBottom: '28px' }}>
          <div className="dash-metric animate-fade-in animate-delay-1">
            <div className="dash-metric-glow" style={{ background: 'var(--success)' }} />
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>الأيام المتبقية</span>
              <Clock size={20} style={{ color: 'var(--success)' }} />
            </div>
            <strong style={{ fontSize: '1.7rem', color: 'var(--text)', fontFamily: 'var(--font-latin)' }} className="number-latin">
              {daysRemaining}
            </strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block', marginTop: '2px' }}>يوم في الاشتراك الحالي</span>
          </div>

          <div className="dash-metric animate-fade-in animate-delay-2">
            <div className="dash-metric-glow" style={{ background: 'var(--primary)' }} />
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>الاشتراكات النشطة</span>
              <Activity size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <strong style={{ fontSize: '1.7rem', color: 'var(--text)', fontFamily: 'var(--font-latin)' }} className="number-latin">
              {activeSubsCount}
            </strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block', marginTop: '2px' }}>اشتراك مفعّل الآن</span>
          </div>

          <div className="dash-metric animate-fade-in animate-delay-3" style={{ border: pendingOrdersCount > 0 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border)' }}>
            <div className="dash-metric-glow" style={{ background: 'var(--warning)' }} />
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>طلبات قيد المراجعة</span>
              <RotateCw size={20} style={{ color: 'var(--warning)' }} />
            </div>
            <strong style={{ fontSize: '1.7rem', color: pendingOrdersCount > 0 ? 'var(--warning)' : 'var(--text)', fontFamily: 'var(--font-latin)' }} className="number-latin">
              {pendingOrdersCount}
            </strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block', marginTop: '2px' }}>بانتظار الموافقة</span>
          </div>
        </section>

        {/* Notification Banner */}
        {actionMessage.text && (
          <div 
            className="flex items-center gap-3 animate-fade-in"
            style={{
              background: actionMessage.type === 'success' ? 'var(--success-light)' : actionMessage.type === 'warning' ? 'var(--warning-light)' : 'var(--danger-light)',
              border: `1px solid ${actionMessage.type === 'success' ? 'var(--success)' : actionMessage.type === 'warning' ? 'var(--warning)' : 'var(--danger)'}`,
              color: actionMessage.type === 'success' ? '#34d399' : actionMessage.type === 'warning' ? '#fbbf24' : '#f87171',
              borderRadius: 'var(--ns-radius)',
              padding: '16px 20px',
              marginBottom: '32px',
              fontSize: '0.95rem'
            }}
          >
            {actionMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Awaiting Payment Banner */}
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
                borderColor: 'var(--secondary)',
                borderWidth: '2px',
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(37, 99, 235, 0.05))',
                padding: '24px',
                marginBottom: '32px',
                position: 'relative',
                overflow: 'hidden'
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
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 20px', borderRadius: 'var(--ns-radius-sm)', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>رقم التحويل (زين كاش / آسيا حوالة)</span>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--text)' }} className="number-latin">07701234567</strong>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 20px', borderRadius: 'var(--ns-radius-sm)', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>المبلغ المطلوب</span>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--success)' }} className="number-latin">
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

        <div className="grid grid-cols-3 gap-6">
          
          {/* COLUMN 1: SUBSCRIPTION STATUS (SPAN 2 COLS) */}
          <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-6">
            
            {/* ACTIVE SUBSCRIPTION CARD */}
            <div className="glass-panel" style={{ border: activeSub ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border)' }}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>حالة اشتراكك الحالي</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                    تفعيل رسمي كامل لمزايا Google AI Pro
                  </p>
                </div>
                
                {activeSub ? (
                  <span 
                    className={`badge ${getSubscriptionStatusDetails(activeSub).badgeClass}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    {activeSub.status === 'active' && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                    {getSubscriptionStatusDetails(activeSub).label}
                  </span>
                ) : (
                  <span className="badge badge-danger">لا يوجد اشتراك نشط</span>
                )}
              </div>

              {activeSub ? (
                <div className="flex flex-col gap-6">
                  {/* Plan Meta Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--ns-radius-sm)', border: '1px solid var(--border)' }} className="flex items-center gap-3">
                      <Clock size={24} style={{ color: 'var(--primary)' }} />
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>الباقة المفعلة</span>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text)' }}>{plans[activeSub.plan_id]?.name || 'Google AI Pro'}</strong>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--ns-radius-sm)', border: '1px solid var(--border)' }} className="flex items-center gap-3">
                      <Calendar size={24} style={{ color: 'var(--secondary)' }} />
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>تاريخ انتهاء الصلاحية</span>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text)' }} className="number-latin">
                          {new Date(activeSub.end_date).toLocaleDateString('en-GB')}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Days remaining counter bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2" style={{ fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>الأيام المتبقية للاشتراك</span>
                      <strong style={{ color: 'var(--text)' }} className="number-latin">{daysRemaining} يومًا</strong>
                    </div>
                    {/* Visual Progress Bar */}
                    <div style={{ width: '100%', height: '8px', background: 'var(--surface-alt)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${progressPercent}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, var(--primary), var(--success))',
                          borderRadius: '9999px',
                          transition: 'width 1s ease'
                        }} 
                      />
                    </div>
                    {activeSub.status === 'suspended' ? (
                      <div className="flex items-center gap-2 mt-3 text-rose-500" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--danger)' }}>
                        <AlertCircle size={16} className="animate-pulse" style={{ color: 'var(--danger)', flexShrink: 0 }} />
                        <span>تنبيه: تم تعليق اشتراكك مؤقتاً من قبل الإدارة. يرجى التواصل مع الدعم الفني للاستفسار.</span>
                      </div>
                    ) : activeSub.status === 'expired' ? (
                      <div className="flex items-center gap-2 mt-3 text-rose-500" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--danger)' }}>
                        <AlertCircle size={16} className="animate-pulse" style={{ color: 'var(--danger)', flexShrink: 0 }} />
                        <span>تنبيه: انتهت صلاحية اشتراكك. يرجى طلب تجديد الباقة لتجنب انقطاع الخدمة.</span>
                      </div>
                    ) : daysRemaining <= 7 ? (
                      <div className="flex items-center gap-2 mt-3 text-amber-500" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--warning)' }}>
                        <AlertCircle size={16} className="animate-pulse" style={{ color: 'var(--warning)', flexShrink: 0 }} />
                        <span>تنبيه: قارب اشتراكك على الانتهاء. يرجى طلب تجديد الباقة لتجنب انقطاع الخدمة.</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Action row */}
                  {activeSub.status === 'expired' && (
                    <div className="flex gap-4 mt-2">
                      <button 
                        onClick={() => handleRequestRenewal(activeSub)}
                        disabled={submittingRenewal === activeSub.id}
                        className="btn btn-primary"
                        style={{ padding: '10px 24px', fontSize: '0.9rem' }}
                      >
                        {submittingRenewal === activeSub.id ? 'جاري إرسال الطلب...' : 'طلب تجديد الاشتراك'}
                      </button>
                      
                      <a 
                        href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(`مرحباً، انتهى اشتراكي وأود تجديده وتفعيل الباقة مجدداً.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                        style={{ padding: '10px 24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <MessageSquare size={16} style={{ color: '#25d366' }} /> تواصل مع الدعم
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty state */
                <div style={{ textAlign: 'center', padding: '40px 0' }} className="flex flex-col items-center gap-4">
                  <AlertCircle size={48} style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '420px' }}>
                    ليس لديك أي اشتراك مفعّل حالياً. يرجى اختيار باقة وتأكيد طلبك أو انتظار موافقة المسؤول على طلباتك المعلقة.
                  </p>
                  <Link to="/#pricing" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <PlusCircle size={16} /> تصفح الباقات واشترك الآن
                  </Link>
                </div>
              )}
            </div>

            {/* ORDER HISTORY LIST */}
            <div className="glass-panel">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '20px' }}>سجل طلباتك</h3>
              
              {orders.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {orders.map((o) => (
                    <div 
                      key={o.id}
                      style={{
                        padding: '16px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--ns-radius-sm)',
                        background: 'rgba(255, 255, 255, 0.01)'
                      }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex flex-col gap-1">
                        <strong style={{ color: 'var(--text)', fontSize: '0.95rem' }}>
                          {plans[o.plan_id]?.name || 'Google AI Pro'}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          تفعيل على: <span className="number-latin" style={{ color: 'var(--text)' }}>{o.gmail}</span>
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          تاريخ الطلب:{' '}
                          <span className="number-latin">
                            {new Date(o.created_at).toLocaleDateString('en-GB')}
                          </span>
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span 
                          className={`badge ${getOrderStatusDetails(o.status).badgeClass}`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {getOrderStatusDetails(o.status).label}
                        </span>

                        <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 700, fontFamily: 'var(--font-latin)' }}>
                          {plans[o.plan_id]?.price_iqd.toLocaleString('en-US')} د.ع
                        </span>

                        {o.status === 'pending' && (
                          <div style={{ marginTop: '4px' }}>
                            {confirmCancelId === o.id ? (
                              <div className="flex items-center gap-2 animate-fade-in" style={{ fontSize: '0.72rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>تأكيد الإلغاء؟</span>
                                <button
                                  onClick={() => {
                                    handleCancelOrder(o.id);
                                    setConfirmCancelId(null);
                                  }}
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    background: 'var(--danger)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  نعم
                                </button>
                                <button
                                  onClick={() => setConfirmCancelId(null)}
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    background: 'transparent',
                                    color: 'var(--text-muted)',
                                    border: '1px solid var(--border)',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  تراجع
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmCancelId(o.id)}
                                disabled={cancellingOrder === o.id}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.72rem',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border)',
                                  background: 'transparent',
                                  color: 'var(--danger)',
                                  cursor: 'pointer',
                                  fontWeight: 700,
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                className="hover:bg-red-500/10 hover:border-red-500/20"
                              >
                                {cancellingOrder === o.id ? (
                                  <RotateCw size={12} className="animate-spin" />
                                ) : (
                                  'إلغاء الطلب'
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                  لا يوجد سجل طلبات سابقة.
                </p>
              )}
            </div>

          </div>

          {/* COLUMN 2: RENEWAL HISTORY & CUSTOMER SUPPORT INFO */}
          <div className="flex flex-col gap-6">
            
            {/* RENEWALS TRACKING PANEL */}
            <div className="glass-panel">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>
                متابعة طلبات التجديد
              </h3>

              {renewals.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {renewals.map((r) => (
                    <div 
                      key={r.id}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--ns-radius-sm)',
                        border: '1px solid var(--border)',
                        background: 'rgba(255,255,255,0.01)'
                      }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>طلب تجديد اشتراك</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} className="number-latin">
                          {new Date(r.created_at).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      
                      <span 
                        className={`badge ${
                          r.status === 'approved' ? 'badge-success' : r.status === 'pending' ? 'badge-warning' : 'badge-danger'
                        }`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {r.status === 'approved' ? 'تم التجديد' : r.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>
                  لا توجد طلبات تجديد حالية.
                </p>
              )}
            </div>

            {/* QUICK WHATSAPP SUPPORT */}
            <div 
              className="glass-panel glow-effect" 
              style={{ 
                background: 'rgba(37,211,102,0.05)',
                border: '1px solid rgba(37,211,102,0.2)',
                padding: '24px'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div style={{ background: '#25d366', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', color: 'white', justifyContent: 'center' }}>
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
                  راسلنا الآن عبر واتساب
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
                  <Send size={16} /> الدعم الفني عبر التلغرام
                </a>
              </div>
            </div>

          </div>

        </div>
      </main>

      {profile && !profile.phone && (
        <ProfileCompletionModal />
      )}
    </div>
  );
};

export default Dashboard;
