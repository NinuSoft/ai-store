import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, ShieldCheck, ArrowLeft, Users, ShoppingBag, 
  RefreshCw, DollarSign, Activity, Check, X, Search, 
  Trash2, UserPlus, Filter, Calendar, Mail, Phone
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ThemeToggle } from '../components/ThemeToggle';

interface Plan {
  id: string;
  name: string;
  duration_months: number;
  price_iqd: number;
}

interface Order {
  id: string;
  user_id: string;
  plan_id: string;
  gmail: string;
  phone: string;
  status: 'pending' | 'processing' | 'awaiting_payment' | 'paid' | 'expired' | 'rejected';
  created_at: string;
  activation_date?: string;
  payment_date?: string;
  notes?: string;
  user_email?: string; // Optional joined user data
}

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired';
  gmail?: string;
  phone?: string;
}

interface Renewal {
  id: string;
  user_id: string;
  subscription_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  gmail?: string;
  phone?: string;
  plan_name?: string;
}

interface UserProfile {
  id: string;
  email: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
}

export const Admin: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Guard routing: redirect if not admin
  useEffect(() => {
    if (profile && !profile.is_admin) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  // Tab State
  const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'renewals' | 'subscriptions'>('orders');
  
  // Data States
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [renewals, setRenewals] = useState<Renewal[]>([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Stats Counters
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    activeSubs: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch plans
      const { data: plansData } = await supabase.from('plans').select('*');
      const planMap: Record<string, Plan> = {};
      if (plansData) {
        plansData.forEach((p: Plan) => { planMap[p.id] = p; });
        setPlans(planMap);
      }

      // 2. Fetch users
      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData) setUsers(usersData);

      // 3. Fetch orders
      const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (ordersData) setOrders(ordersData);

      // 4. Fetch subscriptions
      const { data: subsData } = await supabase.from('subscriptions').select('*').order('end_date', { ascending: false });
      if (subsData) setSubscriptions(subsData);

      // 5. Fetch renewals
      const { data: renewalsData } = await supabase.from('renewals').select('*').order('created_at', { ascending: false });
      if (renewalsData) setRenewals(renewalsData);

      // Calculate Statistics
      const uCount = usersData?.length || 0;
      const oCount = ordersData?.length || 0;
      const pCount = ordersData?.filter((o: Order) => o.status === 'pending').length || 0;
      const sCount = subsData?.filter((s: Subscription) => s.status === 'active').length || 0;
      
      // Calculate revenue from paid orders
      let rev = 0;
      if (ordersData && planMap) {
        ordersData.forEach((o: Order) => {
          if (o.status === 'paid' && planMap[o.plan_id]) {
            rev += planMap[o.plan_id].price_iqd;
          }
        });
      }

      setStats({
        totalUsers: uCount,
        totalOrders: oCount,
        activeSubs: sCount,
        pendingOrders: pCount,
        totalRevenue: rev
      });

    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // -------------------------------------------------------------
  // Admin Operations Actions
  // -------------------------------------------------------------

  // 1. Mark order as Processing (Activation in progress)
  const handleProcessOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'processing' })
        .eq('id', orderId);

      if (error) throw error;
      alert('تم تغيير حالة الطلب إلى (جاري التفعيل) بنجاح!');
      await loadAdminData();
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  // 2. Activate Subscription (Transitions status to awaiting_payment, automatically inserts active subscription, and sets activation_date)
  const handleApproveOrder = async (order: Order) => {
    try {
      const plan = plans[order.plan_id];
      if (!plan) throw new Error('الباقة غير متوفرة');

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(startDate.getMonth() + plan.duration_months);

      // A. Create Subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: order.user_id,
          plan_id: order.plan_id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active'
        });

      if (subError) throw subError;

      // B. Update Order Status to awaiting_payment and set activation_date
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'awaiting_payment',
          activation_date: new Date().toISOString()
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      alert('تم تنشيط وتفعيل الاشتراك بنجاح! حالة الطلب الآن: بانتظار الدفع.');
      await loadAdminData();
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ: ' + err.message);
    }
  };

  // 3. Mark Order as Paid (Transitions order to paid, sets payment_date)
  const handleMarkPaid = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          payment_date: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      alert('تم تأكيد استلام الدفع وتحويل حالة الطلب إلى (مكتمل / مدفوع) بنجاح!');
      await loadAdminData();
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  // 4. Send Payment Reminder (Prefilled WhatsApp reminder)
  const formatIraqiPhoneForWhatsapp = (phone: string) => {
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('07')) {
      cleaned = '964' + cleaned.substring(1);
    }
    return cleaned;
  };

  const handleSendReminder = (order: Order) => {
    const plan = plans[order.plan_id];
    const planName = plan ? plan.name : 'Google AI Pro';
    const price = plan ? plan.price_iqd : 0;
    const text = `مرحباً، تم تفعيل اشتراكك بـ ${planName} بنجاح على حسابك الشخصي. نود تذكيرك بتحويل مبلغ الاشتراك (${price.toLocaleString()} د.ع) لتأكيد حسابك بشكل نهائي عبر الرقم 07701234567. شكراً لثقتك بنا!`;
    const phoneFormatted = formatIraqiPhoneForWhatsapp(order.phone);
    const url = `https://wa.me/${phoneFormatted}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // 5. Save manual notes
  const handleSaveNotes = async (orderId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ notes })
        .eq('id', orderId);

      if (error) throw error;
      alert('تم حفظ الملاحظة بنجاح!');
      await loadAdminData();
    } catch (err: any) {
      alert('حدث خطأ أثناء حفظ الملاحظة: ' + err.message);
    }
  };

  // 6. Reject Order
  const handleRejectOrder = async (orderId: string) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'rejected' })
        .eq('id', orderId);

      if (error) throw error;
      alert('تم رفض الطلب بنجاح.');
      await loadAdminData();
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  // 3. Approve Renewal Request (extends active/expired sub)
  const handleApproveRenewal = async (renewal: Renewal) => {
    try {
      // Find subscription details
      const sub = subscriptions.find(s => s.id === renewal.subscription_id);
      if (!sub) throw new Error('الاشتراك الأصلي غير موجود');

      const plan = plans[sub.plan_id];
      if (!plan) throw new Error('الباقة غير موجودة');

      // Calculate new end date: if already expired, start from now. If active, add to current end date.
      const isExpired = new Date(sub.end_date) < new Date();
      const baseDate = isExpired ? new Date() : new Date(sub.end_date);
      const newEndDate = new Date(baseDate);
      newEndDate.setMonth(newEndDate.getMonth() + plan.duration_months);

      // A. Update Subscription End Date & Status
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          end_date: newEndDate.toISOString(),
          status: 'active'
        })
        .eq('id', sub.id);

      if (subError) throw subError;

      // B. Update Renewal Request Status
      const { error: renewalError } = await supabase
        .from('renewals')
        .update({ status: 'approved' })
        .eq('id', renewal.id);

      if (renewalError) throw renewalError;

      alert('تمت الموافقة وتمديد الاشتراك بنجاح!');
      await loadAdminData();
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ: ' + err.message);
    }
  };

  // 4. Reject Renewal Request
  const handleRejectRenewal = async (renewalId: string) => {
    if (!window.confirm('هل أنت متأكد من رفض طلب التجديد هذا؟')) return;
    try {
      const { error } = await supabase
        .from('renewals')
        .update({ status: 'rejected' })
        .eq('id', renewalId);

      if (error) throw error;
      alert('تم رفض طلب التجديد.');
      await loadAdminData();
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  // 5. Toggle Admin Permission
  const handleToggleAdmin = async (u: UserProfile) => {
    if (u.id === user.id) {
      alert('لا يمكنك إزالة صلاحيات المدير عن نفسك!');
      return;
    }
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: !u.is_admin })
        .eq('id', u.id);

      if (error) throw error;
      alert('تم تعديل صلاحية المدير بنجاح.');
      await loadAdminData();
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  // Helper mappings
  const getUserEmail = (userId: string) => {
    return users.find(u => u.id === userId)?.email || 'مستخدم مجهول';
  };

  const getOrderStatusDetails = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { label: 'قيد المراجعة', badgeClass: 'badge-warning' };
      case 'processing':
        return { label: 'جاري التفعيل', badgeClass: 'badge-primary' };
      case 'awaiting_payment':
        return { label: 'مفعّل - بانتظار الدفع', badgeClass: 'badge-secondary' };
      case 'paid':
        return { label: 'تم الدفع', badgeClass: 'badge-success' };
      case 'expired':
        return { label: 'منتهي الصلاحية', badgeClass: 'badge-danger' };
      case 'rejected':
        return { label: 'مرفوض', badgeClass: 'badge-danger' };
      default:
        return { label: status, badgeClass: 'badge-primary' };
    }
  };

  // -------------------------------------------------------------
  // Filtering logic
  // -------------------------------------------------------------
  const filteredOrders = orders.filter(o => {
    const emailMatch = o.gmail.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = o.phone.includes(searchTerm);
    const userEmailMatch = getUserEmail(o.user_id).toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' || o.status === statusFilter;
    return (emailMatch || phoneMatch || userEmailMatch) && statusMatch;
  });

  const filteredUsers = users.filter(u => {
    return u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (u.phone && u.phone.includes(searchTerm));
  });

  const filteredRenewals = renewals.filter(r => {
    // Map details on the fly
    const sub = subscriptions.find(s => s.id === r.subscription_id);
    const orderRef = orders.find(o => o.user_id === r.user_id);
    const emailMatch = (orderRef?.gmail || getUserEmail(r.user_id)).toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' || r.status === statusFilter;
    return emailMatch && statusMatch;
  });

  const filteredSubscriptions = subscriptions.filter(s => {
    const orderRef = orders.find(o => o.user_id === s.user_id);
    const emailMatch = (orderRef?.gmail || getUserEmail(s.user_id)).toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' || s.status === statusFilter;
    return emailMatch && statusMatch;
  });

  if (profile && !profile.is_admin) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      
      {/* HEADER */}
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--background-alt)', padding: '16px 0' }}>
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck size={24} style={{ color: 'var(--secondary)' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>لوحة الإدارة والمتابعة</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/dashboard" className="btn btn-outline" style={{ padding: '6px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /> لوحة العميل
            </Link>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '40px 20px' }}>
        
        {/* 1. METRICS DASHBOARD */}
        <section className="grid grid-cols-4 gap-6 mb-8 text-right">
          
          {/* Revenue */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>إجمالي الإيرادات</span>
              <DollarSign size={20} style={{ color: 'var(--success)' }} />
            </div>
            <strong style={{ fontSize: '1.8rem', color: 'var(--text)', fontFamily: 'var(--font-latin)' }} className="number-latin">
              {stats.totalRevenue.toLocaleString()}
            </strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginTop: '2px' }}>د.ع (الطلبات المقبولة)</span>
          </div>

          {/* Active Subscriptions */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>الاشتراكات النشطة</span>
              <Activity size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <strong style={{ fontSize: '1.8rem', color: 'var(--text)', fontFamily: 'var(--font-latin)' }} className="number-latin">
              {stats.activeSubs}
            </strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginTop: '2px' }}>اشتراك مفعل الآن</span>
          </div>

          {/* Pending Orders */}
          <div className="glass-panel" style={{ padding: '24px', border: stats.pendingOrders > 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>طلبات معلقة</span>
              <ShoppingBag size={20} style={{ color: 'var(--warning)' }} />
            </div>
            <strong style={{ fontSize: '1.8rem', color: stats.pendingOrders > 0 ? 'var(--warning)' : 'var(--text)', fontFamily: 'var(--font-latin)' }} className="number-latin">
              {stats.pendingOrders}
            </strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginTop: '2px' }}>بانتظار التنشيط والتفعيل</span>
          </div>

          {/* Total Registrations */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>إجمالي المسجلين</span>
              <Users size={20} style={{ color: 'var(--text)' }} />
            </div>
            <strong style={{ fontSize: '1.8rem', color: 'var(--text)', fontFamily: 'var(--font-latin)' }} className="number-latin">
              {stats.totalUsers}
            </strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginTop: '2px' }}>حساب مستخدم مسجل</span>
          </div>

        </section>

        {/* 2. LIVE CONTROLS & FILTERING */}
        <section 
          className="flex justify-between items-center gap-4 mb-6"
          style={{
            background: 'var(--background-alt)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px 20px',
            flexWrap: 'wrap'
          }}
        >
          {/* Tabs Toggles */}
          <div className="flex gap-2">
            <button 
              onClick={() => { setActiveTab('orders'); setStatusFilter('all'); }}
              className="btn"
              style={{
                fontSize: '0.85rem', padding: '8px 16px',
                background: activeTab === 'orders' ? 'var(--secondary)' : 'transparent',
                color: activeTab === 'orders' ? 'white' : 'var(--text)', border: activeTab === 'orders' ? 'none' : '1px solid var(--border)'
              }}
            >
              الطلبات ({orders.length})
            </button>
            <button 
              onClick={() => { setActiveTab('renewals'); setStatusFilter('all'); }}
              className="btn"
              style={{
                fontSize: '0.85rem', padding: '8px 16px',
                background: activeTab === 'renewals' ? 'var(--secondary)' : 'transparent',
                color: activeTab === 'renewals' ? 'white' : 'var(--text)', border: activeTab === 'renewals' ? 'none' : '1px solid var(--border)'
              }}
            >
              طلبات التجديد ({renewals.length})
            </button>
            <button 
              onClick={() => { setActiveTab('subscriptions'); setStatusFilter('all'); }}
              className="btn"
              style={{
                fontSize: '0.85rem', padding: '8px 16px',
                background: activeTab === 'subscriptions' ? 'var(--secondary)' : 'transparent',
                color: activeTab === 'subscriptions' ? 'white' : 'var(--text)', border: activeTab === 'subscriptions' ? 'none' : '1px solid var(--border)'
              }}
            >
              الاشتراكات ({subscriptions.length})
            </button>
            <button 
              onClick={() => { setActiveTab('users'); setStatusFilter('all'); }}
              className="btn"
              style={{
                fontSize: '0.85rem', padding: '8px 16px',
                background: activeTab === 'users' ? 'var(--secondary)' : 'transparent',
                color: activeTab === 'users' ? 'white' : 'var(--text)', border: activeTab === 'users' ? 'none' : '1px solid var(--border)'
              }}
            >
              المستخدمين ({users.length})
            </button>
          </div>

          {/* Search box & filter status dropdown */}
          <div className="flex items-center gap-4" style={{ flexGrow: 1, justifySelf: 'flex-end', maxWidth: '500px' }}>
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <Search size={16} style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالـ Gmail أو رقم الهاتف..."
                style={{
                  width: '100%', padding: '8px 36px 8px 12px',
                  background: 'var(--background)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '0.85rem'
                }}
              />
            </div>

            {activeTab !== 'users' && (
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: 'var(--background)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                <option value="all">كل الحالات</option>
                {activeTab === 'orders' ? (
                  <>
                    <option value="pending">قيد المراجعة</option>
                    <option value="processing">جاري التفعيل</option>
                    <option value="awaiting_payment">مفعّل - بانتظار الدفع</option>
                    <option value="paid">تم الدفع</option>
                    <option value="rejected">مرفوض</option>
                    <option value="expired">منتهي الصلاحية</option>
                  </>
                ) : activeTab === 'renewals' ? (
                  <>
                    <option value="pending">قيد المراجعة</option>
                    <option value="approved">تم القبول</option>
                    <option value="rejected">مرفوض</option>
                  </>
                ) : (
                  <>
                    <option value="active">نشط</option>
                    <option value="expired">منتهي الصلاحية</option>
                  </>
                )}
              </select>
            )}
          </div>
        </section>

        {/* 3. DYNAMIC DATA TABLE PANEL */}
        <section className="glass-panel" style={{ padding: '0', overflowX: 'auto' }}>
          
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>بريد التفعيل (Gmail)</th>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>رقم الهاتف</th>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>الباقة المطلوبة</th>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ الطلب</th>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ التفعيل</th>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ الدفع</th>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>الحالة</th>
                  <th style={{ padding: '16px', color: 'white', minWidth: '130px' }}>ملاحظات المسؤول</th>
                  <th style={{ padding: '16px', color: 'white', textAlign: 'center' }}>العمليات</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((o) => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border)', background: o.status === 'pending' ? 'rgba(245, 158, 11, 0.02)' : 'none' }}>
                      <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text)' }} className="number-latin">{o.gmail}</td>
                      <td style={{ padding: '16px' }} className="number-latin">{o.phone}</td>
                      <td style={{ padding: '16px' }}>{plans[o.plan_id]?.name || 'غير معروف'}</td>
                      <td style={{ padding: '16px' }} className="number-latin">{new Date(o.created_at).toLocaleDateString('ar-IQ')}</td>
                      <td style={{ padding: '16px' }} className="number-latin">{o.activation_date ? new Date(o.activation_date).toLocaleDateString('ar-IQ') : '—'}</td>
                      <td style={{ padding: '16px' }} className="number-latin">{o.payment_date ? new Date(o.payment_date).toLocaleDateString('ar-IQ') : '—'}</td>
                      <td style={{ padding: '16px' }}>
                        <span className={`badge ${getOrderStatusDetails(o.status).badgeClass}`}>
                          {getOrderStatusDetails(o.status).label}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <input 
                          type="text"
                          defaultValue={o.notes || ''}
                          placeholder="أضف ملاحظة..."
                          onBlur={(e) => handleSaveNotes(o.id, e.target.value)}
                          style={{
                            width: '120px',
                            padding: '6px 10px',
                            background: 'var(--background)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text)',
                            fontSize: '0.8rem',
                            outline: 'none'
                          }}
                        />
                      </td>
                      <td style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {o.status === 'pending' && (
                          <button 
                            onClick={() => handleProcessOrder(o.id)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          >
                            بدء المعالجة
                          </button>
                        )}
                        {(o.status === 'pending' || o.status === 'processing') && (
                          <button 
                            onClick={() => handleApproveOrder(o)}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: 'var(--success)', backgroundImage: 'none' }}
                          >
                            <Check size={12} /> تنشيط
                          </button>
                        )}
                        {o.status === 'awaiting_payment' && (
                          <>
                            <button 
                              onClick={() => handleMarkPaid(o.id)}
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: 'var(--success)', backgroundImage: 'none' }}
                            >
                              <Check size={12} /> تأكيد الدفع
                            </button>
                            <button 
                              onClick={() => handleSendReminder(o)}
                              className="btn btn-outline"
                              style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: '#25d366', color: '#25d366' }}
                            >
                              تذكير بالدفع
                            </button>
                          </>
                        )}
                        {o.status !== 'paid' && o.status !== 'rejected' && (
                          <button 
                            onClick={() => handleRejectOrder(o.id)}
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'var(--danger)', color: '#f87171' }}
                          >
                            <X size={12} /> رفض
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد طلبات تطابق معايير البحث.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* TAB 2: RENEWALS */}
          {activeTab === 'renewals' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>حساب العميل</th>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>رقم الهاتف للعميل</th>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ الطلب</th>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>الحالة</th>
                  <th style={{ padding: '16px', color: 'white', textAlign: 'center' }}>العمليات</th>
                </tr>
              </thead>
              <tbody>
                {filteredRenewals.length > 0 ? (
                  filteredRenewals.map((r) => {
                    const subRef = subscriptions.find(s => s.id === r.subscription_id);
                    const userPhone = users.find(u => u.id === r.user_id)?.phone || 'غير مسجل';
                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', background: r.status === 'pending' ? 'rgba(245, 158, 11, 0.02)' : 'none' }}>
                        <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text)' }}>{getUserEmail(r.user_id)}</td>
                        <td style={{ padding: '16px' }} className="number-latin">{userPhone}</td>
                        <td style={{ padding: '16px' }} className="number-latin">{new Date(r.created_at).toLocaleString('ar-IQ')}</td>
                        <td style={{ padding: '16px' }}>
                          <span className={`badge ${r.status === 'approved' ? 'badge-success' : r.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                            {r.status === 'approved' ? 'تم التجديد' : r.status === 'pending' ? 'معلق' : 'مرفوض'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          {r.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApproveRenewal(r)}
                                className="btn btn-primary"
                                style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: 'var(--success)', backgroundImage: 'none' }}
                              >
                                <Check size={12} /> تمديد وتجديد
                              </button>
                              <button 
                                onClick={() => handleRejectRenewal(r.id)}
                                className="btn btn-outline"
                                style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'var(--danger)', color: '#f87171' }}
                              >
                                <X size={12} /> رفض
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد طلبات تجديد تطابق معايير البحث.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* TAB 3: SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>حساب العميل</th>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>الباقة المفعلة</th>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ البدء</th>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ الانتهاء</th>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>حالة الاشتراك</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.length > 0 ? (
                  filteredSubscriptions.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text)' }}>{getUserEmail(s.user_id)}</td>
                      <td style={{ padding: '16px' }}>{plans[s.plan_id]?.name || 'غير معروف'}</td>
                      <td style={{ padding: '16px' }} className="number-latin">{new Date(s.start_date).toLocaleDateString('ar-IQ')}</td>
                      <td style={{ padding: '16px' }} className="number-latin">{new Date(s.end_date).toLocaleDateString('ar-IQ')}</td>
                      <td style={{ padding: '16px' }}>
                        <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                          {s.status === 'active' ? 'نشط' : 'منتهي'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد اشتراكات نشطة تطابق معايير البحث.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* TAB 4: USERS */}
          {activeTab === 'users' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>البريد الإلكتروني</th>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>رقم الهاتف المسجل</th>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ التسجيل</th>
                  <th style={{ padding: '16px', color: 'var(--text)' }}>الرتبة</th>
                  <th style={{ padding: '16px', color: 'white', textAlign: 'center' }}>العمليات</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text)' }}>{u.email}</td>
                      <td style={{ padding: '16px' }} className="number-latin">{u.phone || 'غير متوفر'}</td>
                      <td style={{ padding: '16px' }} className="number-latin">{new Date(u.created_at).toLocaleDateString('ar-IQ')}</td>
                      <td style={{ padding: '16px' }}>
                        <span className={`badge ${u.is_admin ? 'badge-secondary' : 'badge-primary'}`}>
                          {u.is_admin ? 'مدير النظام' : 'عميل'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => handleToggleAdmin(u)}
                          className="btn btn-outline"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          {u.is_admin ? 'إلغاء صلاحية مدير' : 'جعل كمدير للنظام'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>لا يوجد مستخدمون يطابقون معايير البحث.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

        </section>

      </main>

    </div>
  );
};

export default Admin;
