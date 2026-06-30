import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Plan, Order, Subscription, Renewal } from './types';

export const useUserData = () => {
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

  const userId = user?.id;

  const loadData = useCallback(async (silent = false) => {
    if (!userId) return;
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
        .eq('user_id', userId)
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
        .eq('user_id', userId)
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
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    
    loadData();

    // Subscribe to realtime database updates for the logged-in user
    const channel = supabase
      .channel(`dashboard-realtime-${userId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders',
        filter: `user_id=eq.${userId}`
      }, () => {
        loadData(true);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'subscriptions',
        filter: `user_id=eq.${userId}`
      }, () => {
        loadData(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadData]);

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

    if (!user) return;

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

  const activeSub = subscriptions.find(s => s.status === 'active') || 
                    subscriptions.find(s => s.status === 'suspended') || 
                    subscriptions.find(s => s.status === 'expired');

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

  return {
    user,
    profile,
    loading,
    plans,
    orders,
    subscriptions,
    renewals,
    submittingRenewal,
    actionMessage,
    whatsappNum,
    cancellingOrder,
    confirmCancelId,
    setConfirmCancelId,
    setActionMessage,
    activeSub,
    daysRemaining,
    progressPercent,
    awaitingPaymentOrders,
    activeSubsCount,
    pendingOrdersCount,
    greeting,
    handleSignOut,
    handleRequestRenewal,
    handleCancelOrder,
    getSubscriptionStatusDetails,
    getOrderStatusDetails
  };
};
