import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, ArrowLeft, Users, ShoppingBag, 
  DollarSign, Activity, Check, X, Search, PlusCircle
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
  product_id?: string;
  gmail: string;
  phone: string;
  status: 'pending' | 'processing' | 'awaiting_payment' | 'paid' | 'expired' | 'rejected';
  created_at: string;
  activation_date?: string;
  payment_date?: string;
  notes?: string;
  user_email?: string;
  plan_name_snapshot?: string;
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
  const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'renewals' | 'subscriptions' | 'products' | 'plans' | 'faqs' | 'testimonials' | 'settings'>('orders');
  
  // Data States
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [renewals, setRenewals] = useState<Renewal[]>([]);

  // CRUD Data States
  const [productsList, setProductsList] = useState<any[]>([]);
  const [faqsList, setFaqsList] = useState<any[]>([]);
  const [testimonialsList, setTestimonialsList] = useState<any[]>([]);
  const [settingsList, setSettingsList] = useState<any[]>([]);

  // CRUD Modal/Editor States
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formFields, setFormFields] = useState<any>({});

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

      // 2. Fetch users (profiles)
      const { data: usersData } = await supabase.from('profiles').select('*');
      let mappedUsers: UserProfile[] = [];
      if (usersData) {
        mappedUsers = usersData.map((u: any) => ({
          id: u.id,
          email: u.email || '',
          phone: u.phone || '',
          is_admin: u.role === 'admin',
          created_at: u.created_at
        }));
        setUsers(mappedUsers);
      }

      // 3. Fetch orders
      const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      let mappedOrders: Order[] = [];
      if (ordersData) {
        mappedOrders = ordersData.map((o: any) => {
          let frontendStatus: Order['status'] = 'pending';
          if (o.notes === 'PROCESSING') {
            frontendStatus = 'processing';
          } else if (o.status === 'Activated') {
            if (o.payment_status === 'Paid') {
              frontendStatus = 'paid';
            } else if (o.payment_status === 'AwaitingPayment') {
              frontendStatus = 'awaiting_payment';
            } else {
              frontendStatus = 'awaiting_payment';
            }
          } else if (o.status === 'Pending') {
            frontendStatus = 'pending';
          } else if (o.status === 'Rejected') {
            frontendStatus = 'rejected';
          } else if (o.status === 'Cancelled') {
            frontendStatus = 'rejected';
          }
          return {
            ...o,
            status: frontendStatus
          };
        });
        setOrders(mappedOrders);
      }

      // 4. Fetch subscriptions
      const { data: subsData } = await supabase.from('subscriptions').select('*').order('expires_at', { ascending: false });
      let mappedSubs: Subscription[] = [];
      if (subsData) {
        mappedSubs = subsData.map((s: any) => ({
          id: s.id,
          user_id: s.user_id,
          plan_id: s.plan_id,
          start_date: s.activated_at,
          end_date: s.expires_at,
          status: s.status.toLowerCase() as 'active' | 'expired'
        }));
        setSubscriptions(mappedSubs);
      }

      // 5. Derive renewals from orders and subscriptions
      const userHasSub = new Set(mappedSubs.map(s => s.user_id));
      const derivedRenewals = mappedOrders
        .filter((o: Order) => userHasSub.has(o.user_id) && o.status === 'pending')
        .map((o: Order) => {
          const associatedSub = mappedSubs.find(s => s.user_id === o.user_id);
          return {
            id: o.id,
            user_id: o.user_id,
            subscription_id: associatedSub?.id || '',
            status: 'pending' as const,
            created_at: o.created_at,
            gmail: o.gmail,
            phone: o.phone,
            plan_name: planMap[o.plan_id]?.name || o.plan_name_snapshot || 'تجديد اشتراك'
          };
        });
      setRenewals(derivedRenewals);

      // Calculate Statistics
      const uCount = mappedUsers.length;
      const oCount = mappedOrders.length;
      const pCount = mappedOrders.filter((o: Order) => o.status === 'pending').length;
      const sCount = mappedSubs.filter((s: Subscription) => s.status === 'active').length;
      
      // Calculate revenue from paid orders
      let rev = 0;
      mappedOrders.forEach((o: Order) => {
        if (o.status === 'paid' && planMap[o.plan_id]) {
          rev += planMap[o.plan_id].price_iqd;
        }
      });

      // 6. Fetch products, faqs, testimonials, settings
      const { data: prodData } = await supabase.from('products').select('*');
      if (prodData) setProductsList(prodData);

      const { data: faqData } = await supabase.from('faqs').select('*').order('display_order', { ascending: true });
      if (faqData) setFaqsList(faqData);

      const { data: testData } = await supabase.from('testimonials').select('*').order('display_order', { ascending: true });
      if (testData) setTestimonialsList(testData);

      const { data: settData } = await supabase.from('settings').select('*');
      if (settData) setSettingsList(settData);

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
        .update({ notes: 'PROCESSING' })
        .eq('id', orderId);

      if (error) throw error;
      alert('تم تغيير حالة الطلب إلى (جاري التفعيل) بنجاح!');
      await loadAdminData();
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  // 2. Activate Subscription
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
          product_id: 'e5b98f24-5d5d-4f10-bf9d-f685d03a11b6', // Google AI Pro UUID
          plan_id: order.plan_id,
          activated_at: startDate.toISOString(),
          expires_at: endDate.toISOString(),
          status: 'Active'
        });

      if (subError) throw subError;

      // B. Update Order Status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'Activated',
          payment_status: 'AwaitingPayment',
          notes: ''
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

  // 3. Mark Order as Paid
  const handleMarkPaid = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'Activated',
          payment_status: 'Paid',
          notes: ''
        })
        .eq('id', orderId);

      if (error) throw error;
      alert('تم تأكيد استلام الدفع وتحويل حالة الطلب إلى (مكتمل / مدفوع) بنجاح!');
      await loadAdminData();
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  // 4. Send Payment Reminder
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
    const text = `مرحباً، تم تفعيل اشتراكك بـ ${planName} بنجاح على حسابك الشخصي. نود تذكيرك بتحويل مبلغ الاشتراك (${price.toLocaleString()} د.ع) لتأكيد حسابك بشكل نهائي عبر الرقم 07750977509. شكراً لثقتك بنا!`;
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
        .update({ status: 'Rejected' })
        .eq('id', orderId);

      if (error) throw error;
      alert('تم رفض الطلب بنجاح.');
      await loadAdminData();
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  // 3. Approve Renewal Request
  const handleApproveRenewal = async (renewal: Renewal) => {
    try {
      const sub = subscriptions.find(s => s.id === renewal.subscription_id);
      if (!sub) throw new Error('الاشتراك الأصلي غير موجود');

      const plan = plans[sub.plan_id];
      if (!plan) throw new Error('الباقة غير موجودة');

      const isExpired = new Date(sub.end_date) < new Date();
      const baseDate = isExpired ? new Date() : new Date(sub.end_date);
      const newEndDate = new Date(baseDate);
      newEndDate.setMonth(newEndDate.getMonth() + plan.duration_months);

      // A. Update Subscription End Date & Status
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          expires_at: newEndDate.toISOString(),
          status: 'Active'
        })
        .eq('id', sub.id);

      if (subError) throw subError;

      // B. Update Renewal Order Status
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'Activated',
          payment_status: 'Paid'
        })
        .eq('id', renewal.id);

      if (orderError) throw orderError;

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
        .from('orders')
        .update({ status: 'Rejected' })
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
        .from('profiles')
        .update({ role: u.is_admin ? 'customer' : 'admin' })
        .eq('id', u.id);

      if (error) throw error;
      alert('تم تعديل صلاحية المدير بنجاح.');
      await loadAdminData();
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  // =========================================================================
  // CRUD Action Handlers
  // =========================================================================

  // Products CRUD
  const handleSaveProduct = async () => {
    try {
      const payload = {
        name: formFields.name,
        slug: formFields.slug,
        description: formFields.description,
        is_active: formFields.is_active ?? true
      };
      let error;
      if (editingItem && editingItem.id) {
        const res = await supabase.from('products').update(payload).eq('id', editingItem.id);
        error = res.error;
      } else {
        const res = await supabase.from('products').insert(payload);
        error = res.error;
      }
      if (error) throw error;
      alert('تم حفظ المنتج بنجاح!');
      setIsAdding(false);
      setEditingItem(null);
      await loadAdminData();
    } catch (err: any) {
      alert('خطأ أثناء حفظ المنتج: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟ سيؤدي ذلك لحذف الباقات التابعة له.')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      alert('تم حذف المنتج بنجاح.');
      await loadAdminData();
    } catch (err: any) {
      alert('خطأ أثناء الحذف: ' + err.message);
    }
  };

  // Plans CRUD
  const handleSavePlan = async () => {
    try {
      const payload = {
        product_id: formFields.product_id,
        name: formFields.name,
        duration_months: parseInt(formFields.duration_months),
        price_iqd: parseInt(formFields.price_iqd),
        official_price_iqd: formFields.official_price_iqd ? parseInt(formFields.official_price_iqd) : null,
        badge: formFields.badge || null,
        is_featured: formFields.is_featured ?? false,
        display_order: parseInt(formFields.display_order ?? 0),
        is_active: formFields.is_active ?? true
      };
      let error;
      if (editingItem && editingItem.id) {
        const res = await supabase.from('plans').update(payload).eq('id', editingItem.id);
        error = res.error;
      } else {
        const res = await supabase.from('plans').insert(payload);
        error = res.error;
      }
      if (error) throw error;
      alert('تم حفظ الباقة بنجاح!');
      setIsAdding(false);
      setEditingItem(null);
      await loadAdminData();
    } catch (err: any) {
      alert('خطأ أثناء حفظ الباقة: ' + err.message);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الباقة؟')) return;
    try {
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) throw error;
      alert('تم حذف الباقة بنجاح.');
      await loadAdminData();
    } catch (err: any) {
      alert('خطأ أثناء الحذف: ' + err.message);
    }
  };

  // FAQ CRUD
  const handleSaveFaq = async () => {
    try {
      const payload = {
        question: formFields.question,
        answer: formFields.answer,
        display_order: parseInt(formFields.display_order ?? 0),
        is_active: formFields.is_active ?? true
      };
      let error;
      if (editingItem && editingItem.id) {
        const res = await supabase.from('faqs').update(payload).eq('id', editingItem.id);
        error = res.error;
      } else {
        const res = await supabase.from('faqs').insert(payload);
        error = res.error;
      }
      if (error) throw error;
      alert('تم حفظ السؤال بنجاح!');
      setIsAdding(false);
      setEditingItem(null);
      await loadAdminData();
    } catch (err: any) {
      alert('خطأ أثناء حفظ السؤال: ' + err.message);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السؤال الشائع؟')) return;
    try {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) throw error;
      alert('تم حذف السؤال بنجاح.');
      await loadAdminData();
    } catch (err: any) {
      alert('خطأ أثناء الحذف: ' + err.message);
    }
  };

  // Testimonials CRUD
  const handleSaveTestimonial = async () => {
    try {
      const payload = {
        name: formFields.name,
        rating: parseInt(formFields.rating ?? 5),
        comment: formFields.comment,
        display_order: parseInt(formFields.display_order ?? 0),
        is_active: formFields.is_active ?? true
      };
      let error;
      if (editingItem && editingItem.id) {
        const res = await supabase.from('testimonials').update(payload).eq('id', editingItem.id);
        error = res.error;
      } else {
        const res = await supabase.from('testimonials').insert(payload);
        error = res.error;
      }
      if (error) throw error;
      alert('تم حفظ التقييم بنجاح!');
      setIsAdding(false);
      setEditingItem(null);
      await loadAdminData();
    } catch (err: any) {
      alert('خطأ أثناء حفظ التقييم: ' + err.message);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      alert('تم حذف التقييم بنجاح.');
      await loadAdminData();
    } catch (err: any) {
      alert('خطأ أثناء الحذف: ' + err.message);
    }
  };

  // Settings Update
  const handleSaveSetting = async (key: string, valueJson: any) => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ value: valueJson })
        .eq('key', key);
      if (error) throw error;
      alert('تم تحديث الإعداد بنجاح!');
      await loadAdminData();
    } catch (err: any) {
      alert('خطأ أثناء تحديث الإعداد: ' + err.message);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)] text-[var(--text)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

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
          <div className="flex flex-wrap gap-2">
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
            <button 
              onClick={() => { setActiveTab('products'); setStatusFilter('all'); }}
              className="btn"
              style={{
                fontSize: '0.85rem', padding: '8px 16px',
                background: activeTab === 'products' ? 'var(--secondary)' : 'transparent',
                color: activeTab === 'products' ? 'white' : 'var(--text)', border: activeTab === 'products' ? 'none' : '1px solid var(--border)'
              }}
            >
              المنتجات ({productsList.length})
            </button>
            <button 
              onClick={() => { setActiveTab('plans'); setStatusFilter('all'); }}
              className="btn"
              style={{
                fontSize: '0.85rem', padding: '8px 16px',
                background: activeTab === 'plans' ? 'var(--secondary)' : 'transparent',
                color: activeTab === 'plans' ? 'white' : 'var(--text)', border: activeTab === 'plans' ? 'none' : '1px solid var(--border)'
              }}
            >
              الباقات ({Object.keys(plans).length})
            </button>
            <button 
              onClick={() => { setActiveTab('faqs'); setStatusFilter('all'); }}
              className="btn"
              style={{
                fontSize: '0.85rem', padding: '8px 16px',
                background: activeTab === 'faqs' ? 'var(--secondary)' : 'transparent',
                color: activeTab === 'faqs' ? 'white' : 'var(--text)', border: activeTab === 'faqs' ? 'none' : '1px solid var(--border)'
              }}
            >
              الأسئلة الشائعة ({faqsList.length})
            </button>
            <button 
              onClick={() => { setActiveTab('testimonials'); setStatusFilter('all'); }}
              className="btn"
              style={{
                fontSize: '0.85rem', padding: '8px 16px',
                background: activeTab === 'testimonials' ? 'var(--secondary)' : 'transparent',
                color: activeTab === 'testimonials' ? 'white' : 'var(--text)', border: activeTab === 'testimonials' ? 'none' : '1px solid var(--border)'
              }}
            >
              الآراء ({testimonialsList.length})
            </button>
            <button 
              onClick={() => { setActiveTab('settings'); setStatusFilter('all'); }}
              className="btn"
              style={{
                fontSize: '0.85rem', padding: '8px 16px',
                background: activeTab === 'settings' ? 'var(--secondary)' : 'transparent',
                color: activeTab === 'settings' ? 'white' : 'var(--text)', border: activeTab === 'settings' ? 'none' : '1px solid var(--border)'
              }}
            >
              الإعدادات
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

            {['orders', 'renewals', 'subscriptions'].includes(activeTab) && (
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

          {/* CRUD Form Modal */}
          {(isAdding || editingItem) && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 1000,
              padding: '16px'
            }}>
              <div style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '24px', width: '100%',
                maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'
              }}>
                <h3 style={{ marginBottom: '20px', color: 'white', fontWeight: 600 }}>
                  {editingItem ? 'تعديل البيانات' : 'إضافة سجل جديد'}
                </h3>
                
                {activeTab === 'products' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>اسم المنتج</label>
                      <input 
                        type="text" value={formFields.name || ''} 
                        onChange={e => setFormFields({...formFields, name: e.target.value})}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>المعرف الفريد (Slug)</label>
                      <input 
                        type="text" value={formFields.slug || ''} 
                        onChange={e => setFormFields({...formFields, slug: e.target.value})}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>الوصف</label>
                      <textarea 
                        value={formFields.description || ''} 
                        onChange={e => setFormFields({...formFields, description: e.target.value})}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white', minHeight: '80px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="checkbox" checked={formFields.is_active ?? true} 
                        onChange={e => setFormFields({...formFields, is_active: e.target.checked})}
                        id="prod-active"
                      />
                      <label htmlFor="prod-active" style={{ fontSize: '0.85rem' }}>نشط ومتاح للعامة</label>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                      <button onClick={handleSaveProduct} className="btn btn-primary" style={{ padding: '8px 20px' }}>حفظ</button>
                      <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="btn btn-outline" style={{ padding: '8px 20px' }}>إلغاء</button>
                    </div>
                  </div>
                )}

                {activeTab === 'plans' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>المنتج التابع له</label>
                      <select 
                        value={formFields.product_id || ''} 
                        onChange={e => setFormFields({...formFields, product_id: e.target.value})}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white' }}
                      >
                        <option value="">اختر المنتج...</option>
                        {productsList.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>اسم الباقة (مثال: 12 شهراً)</label>
                      <input 
                        type="text" value={formFields.name || ''} 
                        onChange={e => setFormFields({...formFields, name: e.target.value})}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>المدة بالأشهر</label>
                        <input 
                          type="number" value={formFields.duration_months || ''} 
                          onChange={e => setFormFields({...formFields, duration_months: e.target.value})}
                          style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>الترتيب في العرض</label>
                        <input 
                          type="number" value={formFields.display_order ?? 0} 
                          onChange={e => setFormFields({...formFields, display_order: e.target.value})}
                          style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>السعر المحلي (د.ع)</label>
                        <input 
                          type="number" value={formFields.price_iqd || ''} 
                          onChange={e => setFormFields({...formFields, price_iqd: e.target.value})}
                          style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>السعر الرسمي (د.ع - اختياري)</label>
                        <input 
                          type="number" value={formFields.official_price_iqd || ''} 
                          onChange={e => setFormFields({...formFields, official_price_iqd: e.target.value})}
                          style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>شارة العرض (مثل: العرض الأفضل - اختياري)</label>
                      <input 
                        type="text" value={formFields.badge || ''} 
                        onChange={e => setFormFields({...formFields, badge: e.target.value})}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="checkbox" checked={formFields.is_featured ?? false} 
                          onChange={e => setFormFields({...formFields, is_featured: e.target.checked})}
                          id="plan-featured"
                        />
                        <label htmlFor="plan-featured" style={{ fontSize: '0.85rem' }}>باقة مميزة وممتازة</label>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="checkbox" checked={formFields.is_active ?? true} 
                          onChange={e => setFormFields({...formFields, is_active: e.target.checked})}
                          id="plan-active"
                        />
                        <label htmlFor="plan-active" style={{ fontSize: '0.85rem' }}>نشطة ومتاحة</label>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                      <button onClick={handleSavePlan} className="btn btn-primary" style={{ padding: '8px 20px' }}>حفظ</button>
                      <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="btn btn-outline" style={{ padding: '8px 20px' }}>إلغاء</button>
                    </div>
                  </div>
                )}

                {activeTab === 'faqs' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>السؤال (باللغة العربية)</label>
                      <input 
                        type="text" value={formFields.question || ''} 
                        onChange={e => setFormFields({...formFields, question: e.target.value})}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>الإجابة (باللغة العربية)</label>
                      <textarea 
                        value={formFields.answer || ''} 
                        onChange={e => setFormFields({...formFields, answer: e.target.value})}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white', minHeight: '120px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>ترتيب العرض</label>
                      <input 
                        type="number" value={formFields.display_order ?? 0} 
                        onChange={e => setFormFields({...formFields, display_order: e.target.value})}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="checkbox" checked={formFields.is_active ?? true} 
                        onChange={e => setFormFields({...formFields, is_active: e.target.checked})}
                        id="faq-active"
                      />
                      <label htmlFor="faq-active" style={{ fontSize: '0.85rem' }}>نشط ويعرض بالموقع</label>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                      <button onClick={handleSaveFaq} className="btn btn-primary" style={{ padding: '8px 20px' }}>حفظ</button>
                      <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="btn btn-outline" style={{ padding: '8px 20px' }}>إلغاء</button>
                    </div>
                  </div>
                )}

                {activeTab === 'testimonials' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>اسم العميل</label>
                      <input 
                        type="text" value={formFields.name || ''} 
                        onChange={e => setFormFields({...formFields, name: e.target.value})}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>التقييم (عدد النجوم)</label>
                      <select 
                        value={formFields.rating ?? 5} 
                        onChange={e => setFormFields({...formFields, rating: e.target.value})}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white' }}
                      >
                        <option value="5">5 نجوم</option>
                        <option value="4">4 نجوم</option>
                        <option value="3">3 نجوم</option>
                        <option value="2">2 نجوم</option>
                        <option value="1">نجمة واحدة</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>التعليق والريادة</label>
                      <textarea 
                        value={formFields.comment || ''} 
                        onChange={e => setFormFields({...formFields, comment: e.target.value})}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white', minHeight: '100px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>ترتيب العرض</label>
                      <input 
                        type="number" value={formFields.display_order ?? 0} 
                        onChange={e => setFormFields({...formFields, display_order: e.target.value})}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="checkbox" checked={formFields.is_active ?? true} 
                        onChange={e => setFormFields({...formFields, is_active: e.target.checked})}
                        id="test-active"
                      />
                      <label htmlFor="test-active" style={{ fontSize: '0.85rem' }}>نشط ويعرض بالموقع</label>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                      <button onClick={handleSaveTestimonial} className="btn btn-primary" style={{ padding: '8px 20px' }}>حفظ</button>
                      <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="btn btn-outline" style={{ padding: '8px 20px' }}>إلغاء</button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 5: PRODUCTS */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button 
                  onClick={() => { setIsAdding(true); setEditingItem(null); setFormFields({ name: '', slug: '', description: '', is_active: true }); }}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <PlusCircle size={16} /> إضافة منتج جديد
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                    <th style={{ padding: '16px', color: 'var(--text)' }}>الاسم</th>
                    <th style={{ padding: '16px', color: 'var(--text)' }}>المعرف (Slug)</th>
                    <th style={{ padding: '16px', color: 'var(--text)' }}>الوصف</th>
                    <th style={{ padding: '16px', color: 'var(--text)' }}>الحالة</th>
                    <th style={{ padding: '16px', color: 'white', textAlign: 'center' }}>العمليات</th>
                  </tr>
                </thead>
                <tbody>
                  {productsList.length > 0 ? (
                    productsList.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px', fontWeight: 600, color: 'white' }}>{p.name}</td>
                        <td style={{ padding: '16px' }} className="number-latin">{p.slug}</td>
                        <td style={{ padding: '16px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</td>
                        <td style={{ padding: '16px' }}>
                          <span className={`badge ${p.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {p.is_active ? 'نشط' : 'معطل'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => { setEditingItem(p); setIsAdding(false); setFormFields(p); }}
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          >
                            تعديل
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'var(--danger)', color: '#f87171' }}
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد منتجات مسجلة.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 6: PLANS */}
          {activeTab === 'plans' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button 
                  onClick={() => { setIsAdding(true); setEditingItem(null); setFormFields({ name: '', product_id: productsList[0]?.id || '', duration_months: 1, price_iqd: 15000, official_price_iqd: null, badge: '', is_featured: false, display_order: 0, is_active: true }); }}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <PlusCircle size={16} /> إضافة باقة جديدة
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                    <th style={{ padding: '16px', color: 'var(--text)' }}>الباقة</th>
                    <th style={{ padding: '16px', color: 'var(--text)' }}>المنتج</th>
                    <th style={{ padding: '16px', color: 'var(--text)' }}>المدة</th>
                    <th style={{ padding: '16px', color: 'var(--text)' }}>السعر المحلي</th>
                    <th style={{ padding: '16px', color: 'var(--text)' }}>شارة الباقة</th>
                    <th style={{ padding: '16px', color: 'var(--text)' }}>الحالة</th>
                    <th style={{ padding: '16px', color: 'white', textAlign: 'center' }}>العمليات</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(plans).length > 0 ? (
                    Object.values(plans).map((p: any) => {
                      const prod = productsList.find(pr => pr.id === p.product_id);
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '16px', fontWeight: 600, color: 'white' }}>{p.name} {p.is_featured && <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>(مميزة)</span>}</td>
                          <td style={{ padding: '16px' }}>{prod?.name || 'غير معروف'}</td>
                          <td style={{ padding: '16px' }} className="number-latin">{p.duration_months} شهر</td>
                          <td style={{ padding: '16px' }} className="number-latin">{p.price_iqd.toLocaleString()} د.ع</td>
                          <td style={{ padding: '16px' }}>{p.badge || '-'}</td>
                          <td style={{ padding: '16px' }}>
                            <span className={`badge ${p.is_active ? 'badge-success' : 'badge-danger'}`}>
                              {p.is_active ? 'نشطة' : 'معطلة'}
                            </span>
                          </td>
                          <td style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button 
                              onClick={() => { setEditingItem(p); setIsAdding(false); setFormFields(p); }}
                              className="btn btn-outline"
                              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            >
                              تعديل
                            </button>
                            <button 
                              onClick={() => handleDeletePlan(p.id)}
                              className="btn btn-outline"
                              style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'var(--danger)', color: '#f87171' }}
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد باقات مسجلة.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 7: FAQS */}
          {activeTab === 'faqs' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button 
                  onClick={() => { setIsAdding(true); setEditingItem(null); setFormFields({ question: '', answer: '', display_order: 0, is_active: true }); }}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <PlusCircle size={16} /> إضافة سؤال شائع
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {faqsList.length > 0 ? (
                  faqsList.map((f) => (
                    <div key={f.id} style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '16px', background: 'rgba(255,255,255,0.01)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 600, color: 'white' }}>{f.question}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span className={`badge ${f.is_active ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                            {f.is_active ? 'نشط' : 'معطل'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>الترتيب: {f.display_order}</span>
                        </div>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>{f.answer}</p>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => { setEditingItem(f); setIsAdding(false); setFormFields(f); }}
                          className="btn btn-outline"
                          style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                        >
                          تعديل
                        </button>
                        <button 
                          onClick={() => handleDeleteFaq(f.id)}
                          className="btn btn-outline"
                          style={{ padding: '4px 10px', fontSize: '0.7rem', borderColor: 'var(--danger)', color: '#f87171' }}
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد أسئلة شائعة مسجلة.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: TESTIMONIALS */}
          {activeTab === 'testimonials' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button 
                  onClick={() => { setIsAdding(true); setEditingItem(null); setFormFields({ name: '', rating: 5, comment: '', display_order: 0, is_active: true }); }}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <PlusCircle size={16} /> إضافة رأي عميل
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                    <th style={{ padding: '16px', color: 'var(--text)' }}>العميل</th>
                    <th style={{ padding: '16px', color: 'var(--text)' }}>التقييم</th>
                    <th style={{ padding: '16px', color: 'var(--text)' }}>التعليق</th>
                    <th style={{ padding: '16px', color: 'var(--text)' }}>الترتيب</th>
                    <th style={{ padding: '16px', color: 'white', textAlign: 'center' }}>العمليات</th>
                  </tr>
                </thead>
                <tbody>
                  {testimonialsList.length > 0 ? (
                    testimonialsList.map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px', fontWeight: 600, color: 'white' }}>{t.name}</td>
                        <td style={{ padding: '16px', color: '#fbbf24' }}>{Array(t.rating).fill('★').join('')}</td>
                        <td style={{ padding: '16px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.comment}</td>
                        <td style={{ padding: '16px' }} className="number-latin">{t.display_order}</td>
                        <td style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => { setEditingItem(t); setIsAdding(false); setFormFields(t); }}
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          >
                            تعديل
                          </button>
                          <button 
                            onClick={() => handleDeleteTestimonial(t.id)}
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'var(--danger)', color: '#f87171' }}
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد تقييمات مسجلة.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
              {settingsList.map((s) => {
                const currentVal = s.value;
                return (
                  <div key={s.key} style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '20px', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '15px' }}>
                      <h4 style={{ fontWeight: 600, color: 'white' }}>{currentVal.label || s.key}</h4>
                      <code style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{s.key}</code>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{currentVal.description || 'إعدادات النظام.'}</p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input 
                        type={s.key === 'exchange_rate' || s.key === 'google_official_annual_price' ? 'number' : 'text'}
                        defaultValue={currentVal.value}
                        id={`setting-input-${s.key}`}
                        style={{ flexGrow: 1, padding: '8px 12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white', fontSize: '0.85rem' }}
                      />
                      <button 
                        onClick={() => {
                          const input = document.getElementById(`setting-input-${s.key}`) as HTMLInputElement;
                          const rawVal = input.value;
                          const parsedVal = s.key === 'exchange_rate' || s.key === 'google_official_annual_price' ? parseFloat(rawVal) : rawVal;
                          const updatedVal = {
                            ...currentVal,
                            value: parsedVal
                          };
                          handleSaveSetting(s.key, updatedVal);
                        }}
                        className="btn btn-primary"
                        style={{ padding: '8px 20px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      >
                        حفظ التعديل
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </section>

      </main>

    </div>
  );
};

export default Admin;
