import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, DollarSign, Check, X, RotateCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Plan, Order, Subscription, GmailAccount, Renewal, UserProfile, AdminTab } from './types';

export const useAdminData = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Guard routing: redirect if not admin
  useEffect(() => {
    if (profile && !profile.is_admin) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    const hash = window.location.hash.slice(1);
    const validTabs: AdminTab[] = ['overview', 'orders', 'users', 'renewals', 'subscriptions', 'products', 'plans', 'faqs', 'testimonials', 'settings', 'gmail_accounts'];
    return (hash && validTabs.includes(hash as any)) ? (hash as AdminTab) : 'overview';
  });

  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const validTabs: AdminTab[] = ['overview', 'orders', 'users', 'renewals', 'subscriptions', 'products', 'plans', 'faqs', 'testimonials', 'settings', 'gmail_accounts'];
      if (hash && validTabs.includes(hash as any)) {
        setActiveTab(hash as AdminTab);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
  const [tempSettings, setTempSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    if (settingsList.length > 0) {
      setTempSettings(prev => {
        const updated = { ...prev };
        settingsList.forEach(s => {
          if (updated[s.key] === undefined) {
            updated[s.key] = s.value.value;
          }
        });
        return updated;
      });
    }
  }, [settingsList]);
  const [gmailAccountsList, setGmailAccountsList] = useState<GmailAccount[]>([]);

  // Gmail Accounts assignment/details states
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
  const [assigningSub, setAssigningSub] = useState<Subscription | null>(null);
  const [selectedGmailAccountDetails, setSelectedGmailAccountDetails] = useState<GmailAccount | null>(null);

  // Periodic TOTP refresh timer
  const [totpTick, setTotpTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTotpTick(t => t + 1);
    }, 1000); // refresh every 1 second for smooth countdown
    return () => clearInterval(timer);
  }, []);

  // CRUD Modal/Editor States
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formFields, setFormFields] = useState<any>({});

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Snackbar State
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [suspendingSub, setSuspendingSub] = useState<string | null>(null);

  const showSnackbar = (message: string, type: 'success' | 'error' = 'success') => {
    setSnackbar({ message, type });
  };

  // Confirmation Dialog State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  const requestConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  useEffect(() => {
    if (snackbar) {
      const timer = setTimeout(() => {
        setSnackbar(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar]);

  // Stats Counters
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    activeSubs: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });

  const loadAdminData = async (silent = false) => {
    if (!silent) setLoading(true);
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
          full_name: u.full_name || '',
          avatar_url: u.avatar_url || '',
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
          if (o.status === 'Processing') {
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
            frontendStatus = 'cancelled';
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
          status: s.status.toLowerCase() as 'active' | 'expired' | 'suspended',
          gmail_account_id: s.gmail_account_id
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

      const { data: gmailData } = await supabase.from('gmail_accounts').select('*').order('created_at', { ascending: false });
      if (gmailData) setGmailAccountsList(gmailData);

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
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();

    // Subscribe to realtime database updates
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadAdminData(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => {
        loadAdminData(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadAdminData(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gmail_accounts' }, () => {
        loadAdminData(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 1. Mark order as Processing (Activation in progress)
  const handleProcessOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'Processing' })
        .eq('id', orderId);

      if (error) throw error;
      showSnackbar('تم تغيير حالة الطلب إلى (جاري التفعيل) بنجاح!');
      await loadAdminData(true);
    } catch (err: any) {
      showSnackbar('حدث خطأ: ' + err.message, 'error');
    }
  };

  // 2. Activate Subscription
  const handleApproveOrder = (order: Order) => {
    setAssigningOrder(order);
  };

  // Actual activation logic execution after Gmail Account has been selected
  const handleApproveOrderWithAccount = async (order: Order, gmailAccountId: string | null) => {
    try {
      const plan = plans[order.plan_id];
      if (!plan) throw new Error('الباقة غير متوفرة');

      // Check if the user already has an active subscription for the product
      const { data: existingSubs, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', order.user_id)
        .eq('product_id', order.product_id || 'e5b98f24-5d5d-4f10-bf9d-f685d03a11b6')
        .eq('status', 'Active');

      if (fetchError) throw fetchError;

      const now = new Date();
      const activeSub = existingSubs ? existingSubs.find(s => new Date(s.expires_at) > now) : null;

      let subError;
      if (activeSub) {
        // Extend the existing active subscription
        const currentExpiry = new Date(activeSub.expires_at);
        currentExpiry.setMonth(currentExpiry.getMonth() + plan.duration_months);

        const { error } = await supabase
          .from('subscriptions')
          .update({
            plan_id: order.plan_id, // Update to the new plan if they changed it
            expires_at: currentExpiry.toISOString(),
            gmail_account_id: gmailAccountId
          })
          .eq('id', activeSub.id);

        subError = error;
      } else {
        // Create a new subscription starting now
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + plan.duration_months);

        const { error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: order.user_id,
            product_id: order.product_id || 'e5b98f24-5d5d-4f10-bf9d-f685d03a11b6', // Google AI Pro UUID
            plan_id: order.plan_id,
            activated_at: startDate.toISOString(),
            expires_at: endDate.toISOString(),
            status: 'Active',
            gmail_account_id: gmailAccountId
          });

        subError = error;
      }

      if (subError) throw subError;

      // B. Update Order Status
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'Activated',
          payment_status: 'AwaitingPayment',
          activation_date: new Date().toISOString(),
          notes: '',
          gmail_account_id: gmailAccountId
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      showSnackbar('تم تنشيط وتفعيل الاشتراك وتعيين الحساب بنجاح! حالة الطلب الآن: بانتظار الدفع.');
      setAssigningOrder(null);
      await loadAdminData(true);
    } catch (err: any) {
      console.error(err);
      showSnackbar('حدث خطأ: ' + err.message, 'error');
    }
  };


  const handleAssignGmailAccountToSubscription = async (subId: string, gmailAccountId: string | null) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ gmail_account_id: gmailAccountId })
        .eq('id', subId);
      if (error) throw error;
      showSnackbar('تم تحديث تعيين حساب Gmail للاشتراك بنجاح.');
      await loadAdminData(true);
    } catch (err: any) {
      showSnackbar('خطأ أثناء التعيين: ' + err.message, 'error');
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
          payment_date: new Date().toISOString(),
          notes: ''
        })
        .eq('id', orderId);

      if (error) throw error;
      showSnackbar('تم تأكيد استلام الدفع وتحويل حالة الطلب إلى (مكتمل / مدفوع) بنجاح!');
      await loadAdminData(true);
    } catch (err: any) {
      showSnackbar('حدث خطأ: ' + err.message, 'error');
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
    const text = `مرحباً، تم تفعيل اشتراكك بـ ${planName} بنجاح على حسابك الشخصي. نود تذكيرك بتحويل مبلغ الاشتراك (${price.toLocaleString('en-US')} د.ع) لتأكيد حسابك بشكل نهائي عبر الرقم 07750977509. شكراً لثقتك بنا!`;
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
      showSnackbar('تم حفظ الملاحظة بنجاح!');
      await loadAdminData(true);
    } catch (err: any) {
      showSnackbar('حدث خطأ أثناء حفظ الملاحظة: ' + err.message, 'error');
    }
  };

  // 6. Reject Order
  const handleRejectOrder = (orderId: string) => {
    requestConfirmation(
      'تأكيد رفض الطلب',
      'هل أنت متأكد من رفض هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.',
      async () => {
        try {
          const { error } = await supabase
            .from('orders')
            .update({ status: 'Rejected' })
            .eq('id', orderId);

          if (error) throw error;
          showSnackbar('تم رفض الطلب بنجاح.');
          await loadAdminData(true);
        } catch (err: any) {
          showSnackbar('حدث خطأ: ' + err.message, 'error');
        }
      }
    );
  };

  // 7. Approve Renewal Request
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
          payment_status: 'Paid',
          activation_date: new Date().toISOString(),
          payment_date: new Date().toISOString()
        })
        .eq('id', renewal.id);

      if (orderError) throw orderError;

      showSnackbar('تمت الموافقة وتمديد الاشتراك بنجاح!');
      await loadAdminData(true);
    } catch (err: any) {
      console.error(err);
      showSnackbar('حدث خطأ: ' + err.message, 'error');
    }
  };

  // 8. Reject Renewal Request
  const handleRejectRenewal = (renewalId: string) => {
    requestConfirmation(
      'تأكيد رفض التجديد',
      'هل أنت متأكد من رفض طلب التجديد هذا؟',
      async () => {
        try {
          const { error } = await supabase
            .from('orders')
            .update({ status: 'Rejected' })
            .eq('id', renewalId);

          if (error) throw error;
          showSnackbar('تم رفض طلب التجديد.');
          await loadAdminData(true);
        } catch (err: any) {
          showSnackbar('حدث خطأ: ' + err.message, 'error');
        }
      }
    );
  };

  // 9. Toggle Admin Permission
  const handleToggleAdmin = async (u: UserProfile) => {
    if (u.id === user?.id) {
      showSnackbar('لا يمكنك إزالة صلاحيات المدير عن نفسك!', 'error');
      return;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: u.is_admin ? 'customer' : 'admin' })
        .eq('id', u.id);

      if (error) throw error;
      showSnackbar('تم تعديل صلاحية المدير بنجاح.');
      await loadAdminData(true);
    } catch (err: any) {
      showSnackbar('حدث خطأ: ' + err.message, 'error');
    }
  };

  // 10. Suspend / Unsuspend
  const handleToggleSuspendSubscription = async (sub: Subscription) => {
    setSuspendingSub(sub.id);
    const newStatus = sub.status === 'suspended' ? 'Active' : 'Suspended';
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: newStatus })
        .eq('id', sub.id);

      if (error) throw error;
      showSnackbar(newStatus === 'Suspended' ? 'تم تعليق الاشتراك بنجاح.' : 'تم إلغاء تعليق الاشتراك بنجاح.');
      await loadAdminData(true);
    } catch (err: any) {
      showSnackbar('حدث خطأ أثناء تعديل حالة الاشتراك: ' + err.message, 'error');
    } finally {
      setSuspendingSub(null);
    }
  };

  // Gmail Accounts CRUD
  const handleSaveGmailAccount = async () => {
    try {
      const payload = {
        email: formFields.email,
        plan_id: formFields.plan_id,
        twofa_secret: formFields.twofa_secret,
        subscription_valid_until: formFields.subscription_valid_until || null,
        max_members: 5,
        status: formFields.status || 'Available',
        notes: formFields.notes || null
      };
      let error;
      if (editingItem && editingItem.id) {
        const res = await supabase.from('gmail_accounts').update(payload).eq('id', editingItem.id);
        error = res.error;
      } else {
        const res = await supabase.from('gmail_accounts').insert(payload);
        error = res.error;
      }
      if (error) throw error;
      showSnackbar('تم حفظ حساب Gmail بنجاح!');
      setIsAdding(false);
      setEditingItem(null);
      await loadAdminData(true);
    } catch (err: any) {
      showSnackbar('خطأ أثناء حفظ الحساب: ' + err.message, 'error');
    }
  };

  const handleDeleteGmailAccount = (id: string) => {
    requestConfirmation(
      'حذف حساب Gmail',
      'هل أنت متأكد من حذف هذا الحساب؟ سيتم إلغاء تعيينه من الاشتراكات والطلبات المرتبطة به.',
      async () => {
        try {
          const { error } = await supabase.from('gmail_accounts').delete().eq('id', id);
          if (error) throw error;
          showSnackbar('تم حذف الحساب بنجاح.');
          await loadAdminData(true);
        } catch (err: any) {
          showSnackbar('خطأ أثناء الحذف: ' + err.message, 'error');
        }
      }
    );
  };

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
      showSnackbar('تم حفظ المنتج بنجاح!');
      setIsAdding(false);
      setEditingItem(null);
      await loadAdminData(true);
    } catch (err: any) {
      showSnackbar('خطأ أثناء حفظ المنتج: ' + err.message, 'error');
    }
  };

  const handleDeleteProduct = (id: string) => {
    requestConfirmation(
      'حذف المنتج',
      'هل أنت متأكد من حذف هذا المنتج؟ سيؤدي ذلك لحذف الباقات التابعة له بشكل نهائي.',
      async () => {
        try {
          const { error } = await supabase.from('products').delete().eq('id', id);
          if (error) throw error;
          showSnackbar('تم حذف المنتج بنجاح.');
          await loadAdminData(true);
        } catch (err: any) {
          showSnackbar('خطأ أثناء الحذف: ' + err.message, 'error');
        }
      }
    );
  };

  // Plans CRUD
  const handleSavePlan = async () => {
    try {
      const payload = {
        product_id: formFields.product_id,
        name: formFields.name,
        duration_months: parseInt(String(formFields.duration_months || '').replace(/,/g, '')),
        price_iqd: parseInt(String(formFields.price_iqd || '').replace(/,/g, '')),
        official_price_iqd: formFields.official_price_iqd ? parseInt(String(formFields.official_price_iqd).replace(/,/g, '')) : null,
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
      showSnackbar('تم حفظ الباقة بنجاح!');
      setIsAdding(false);
      setEditingItem(null);
      await loadAdminData(true);
    } catch (err: any) {
      showSnackbar('خطأ أثناء حفظ الباقة: ' + err.message, 'error');
    }
  };

  const handleDeletePlan = (id: string) => {
    requestConfirmation(
      'حذف الباقة',
      'هل أنت متأكد من حذف هذه الباقة؟ لا يمكن استرجاعها بعد الحذف.',
      async () => {
        try {
          const { error } = await supabase.from('plans').delete().eq('id', id);
          if (error) throw error;
          showSnackbar('تم حذف الباقة بنجاح.');
          await loadAdminData(true);
        } catch (err: any) {
          showSnackbar('خطأ أثناء الحذف: ' + err.message, 'error');
        }
      }
    );
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
      showSnackbar('تم حفظ السؤال بنجاح!');
      setIsAdding(false);
      setEditingItem(null);
      await loadAdminData(true);
    } catch (err: any) {
      showSnackbar('خطأ أثناء حفظ السؤال: ' + err.message, 'error');
    }
  };

  const handleDeleteFaq = (id: string) => {
    requestConfirmation(
      'حذف السؤال الشائع',
      'هل أنت متأكد من حذف هذا السؤال الشائع؟',
      async () => {
        try {
          const { error } = await supabase.from('faqs').delete().eq('id', id);
          if (error) throw error;
          showSnackbar('تم حذف السؤال بنجاح.');
          await loadAdminData(true);
        } catch (err: any) {
          showSnackbar('خطأ أثناء الحذف: ' + err.message, 'error');
        }
      }
    );
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
      showSnackbar('تم حفظ التقييم بنجاح!');
      setIsAdding(false);
      setEditingItem(null);
      await loadAdminData(true);
    } catch (err: any) {
      showSnackbar('خطأ أثناء حفظ التقييم: ' + err.message, 'error');
    }
  };

  const handleDeleteTestimonial = (id: string) => {
    requestConfirmation(
      'حذف التقييم',
      'هل أنت متأكد من حذف هذا التقييم؟',
      async () => {
        try {
          const { error } = await supabase.from('testimonials').delete().eq('id', id);
          if (error) throw error;
          showSnackbar('تم حذف التقييم بنجاح.');
          await loadAdminData(true);
        } catch (err: any) {
          showSnackbar('خطأ أثناء الحذف: ' + err.message, 'error');
        }
      }
    );
  };

  // Settings Update
  const handleSaveSetting = async (key: string, valueJson: any) => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ value: valueJson })
        .eq('key', key);
      if (error) throw error;
      showSnackbar('تم تحديث الإعداد بنجاح!');
      await loadAdminData(true);
    } catch (err: any) {
      showSnackbar('خطأ أثناء تحديث الإعداد: ' + err.message, 'error');
    }
  };

  // Helper mappings
  const getUserEmail = (userId: string) => {
    return users.find(u => u.id === userId)?.email || 'مستخدم مجهول';
  };

  const getUserDisplayName = (userId: string) => {
    const u = users.find(usr => usr.id === userId);
    if (!u) return 'مستخدم مجهول';
    return u.full_name ? `${u.full_name} (${u.email})` : u.email;
  };

  const getOrderStatusDetails = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { label: 'قيد المراجعة', badgeClass: 'status-pill pending', icon: React.createElement(Clock, { size: 12 }) };
      case 'processing':
        return { label: 'جاري التفعيل', badgeClass: 'status-pill processing', icon: React.createElement(RotateCw, { size: 12, className: "animate-spin" }) };
      case 'awaiting_payment':
        return { label: 'بانتظار الدفع', badgeClass: 'status-pill awaiting_payment', icon: React.createElement(DollarSign, { size: 12 }) };
      case 'paid':
        return { label: 'تم الدفع', badgeClass: 'status-pill paid', icon: React.createElement(Check, { size: 12 }) };
      case 'expired':
        return { label: 'منتهي الصلاحية', badgeClass: 'status-pill expired', icon: React.createElement(Clock, { size: 12 }) };
      case 'rejected':
        return { label: 'مرفوض', badgeClass: 'status-pill rejected', icon: React.createElement(X, { size: 12 }) };
      case 'cancelled':
        return { label: 'ملغي', badgeClass: 'status-pill cancelled', icon: React.createElement(X, { size: 12 }) };
      default:
        return { label: status, badgeClass: 'status-pill', icon: null };
    }
  };

  // Overview Dashboard Derivations
  const months = useMemo(() => {
    const out: { label: string; key: string; y: number; m: number }[] = [];
    const base = new Date();
    const AR_MONTHS = [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول",
    ];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      out.push({
        label: AR_MONTHS[d.getMonth()],
        key: `${d.getFullYear()}-${d.getMonth()}`,
        y: d.getFullYear(),
        m: d.getMonth(),
      });
    }
    return out;
  }, []);

  const series = useMemo(() => {
    const revenue: number[] = [];
    const orderCounts: number[] = [];
    const userCounts: number[] = [];
    const subCounts: number[] = [];

    months.forEach((mo) => {
      const inMonth = (iso?: string) => {
        if (!iso) return false;
        const d = new Date(iso);
        return d.getFullYear() === mo.y && d.getMonth() === mo.m;
      };

      let rev = 0;
      orders.forEach((o) => {
        if (inMonth(o.payment_date || o.created_at)) {
          if (o.status === "paid") {
            const p = plans[o.plan_id];
            if (p) rev += p.price_iqd;
          }
        }
      });
      revenue.push(rev);
      orderCounts.push(orders.filter((o) => inMonth(o.created_at)).length);
      userCounts.push(users.filter((u) => inMonth(u.created_at)).length);
      subCounts.push(subscriptions.filter((s) => inMonth(s.start_date)).length);
    });
    return { revenue, orderCounts, userCounts, subCounts };
  }, [months, orders, users, subscriptions, plans]);

  const pct = (a: number[], i: number) => {
    const prev = a[i - 1];
    const cur = a[i];
    if (!prev) return cur > 0 ? 100 : 0;
    return Math.round(((cur - prev) / prev) * 100);
  };

  const statusBreakdown = useMemo(() => {
    const map = {
      pending: 0, processing: 0, awaiting_payment: 0, paid: 0, expired: 0, rejected: 0, cancelled: 0,
    };
    orders.forEach((o) => {
      if (map[o.status] !== undefined) map[o.status]++;
    });
    const label: Record<string, string> = {
      pending: "معلق",
      processing: "قيد المعالجة",
      awaiting_payment: "بانتظار الدفع",
      paid: "مكتمل",
      expired: "منتهي",
      rejected: "مرفوض",
      cancelled: "ملغي",
    };
    const color: Record<string, string> = {
      pending: "#f59e0b",
      processing: "#6366f1",
      awaiting_payment: "#0ea5e9",
      paid: "#10b981",
      expired: "#94a3b8",
      rejected: "#f43f5e",
      cancelled: "#64748b",
    };
    return (Object.keys(map) as (keyof typeof map)[])
      .map((k) => ({ label: label[k] || k, value: map[k], color: color[k], key: k }))
      .filter((s) => s.value > 0);
  }, [orders]);

  const topPlans = useMemo(() => {
    const m = new Map<string, number>();
    orders.forEach((o) => {
      if (o.status === "paid") {
        const p = plans[o.plan_id];
        if (p) m.set(p.name, (m.get(p.name) || 0) + p.price_iqd);
      }
    });
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label, value]) => ({ label, value }));
  }, [orders, plans]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 6),
    [orders]
  );

  const lastIdx = series.revenue.length - 1;

  // Filtering logic
  const filteredOrders = orders.filter(o => {
    const emailMatch = o.gmail.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = o.phone.includes(searchTerm);
    const userEmailMatch = getUserEmail(o.user_id).toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' || o.status === statusFilter;
    return (emailMatch || phoneMatch || userEmailMatch) && statusMatch;
  });

  const filteredUsers = users.filter(u => {
    const nameMatch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = u.phone && u.phone.includes(searchTerm);
    let roleMatch = true;
    if (statusFilter === 'admin') {
      roleMatch = u.is_admin;
    } else if (statusFilter === 'customer') {
      roleMatch = !u.is_admin;
    }
    return (nameMatch || emailMatch || phoneMatch) && roleMatch;
  });

  const filteredRenewals = renewals.filter(r => {
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

  const filteredGmailAccounts = gmailAccountsList.filter(g => {
    const emailMatch = g.email.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' || g.status === statusFilter;
    return emailMatch && statusMatch;
  });

  return {
    user,
    profile,
    handleSignOut,
    loading,
    plans,
    orders,
    users,
    subscriptions,
    renewals,
    productsList,
    faqsList,
    testimonialsList,
    settingsList,
    tempSettings,
    setTempSettings,
    gmailAccountsList,
    assigningOrder,
    setAssigningOrder,
    assigningSub,
    setAssigningSub,
    selectedGmailAccountDetails,
    setSelectedGmailAccountDetails,
    totpTick,
    editingItem,
    setEditingItem,
    isAdding,
    setIsAdding,
    formFields,
    setFormFields,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    snackbar,
    setSnackbar,
    suspendingSub,
    confirmConfig,
    setConfirmConfig,
    showSnackbar,
    requestConfirmation,
    loadAdminData,
    handleProcessOrder,
    handleApproveOrder,
    handleApproveOrderWithAccount,

    handleAssignGmailAccountToSubscription,
    handleMarkPaid,
    handleSendReminder,
    handleSaveNotes,
    handleRejectOrder,
    handleApproveRenewal,
    handleRejectRenewal,
    handleToggleAdmin,
    handleToggleSuspendSubscription,
    handleSaveGmailAccount,
    handleDeleteGmailAccount,
    handleSaveProduct,
    handleDeleteProduct,
    handleSavePlan,
    handleDeletePlan,
    handleSaveFaq,
    handleDeleteFaq,
    handleSaveTestimonial,
    handleDeleteTestimonial,
    handleSaveSetting,
    activeTab,
    setActiveTab,
    getUserEmail,
    getUserDisplayName,
    getOrderStatusDetails,
    months,
    series,
    pct,
    statusBreakdown,
    topPlans,
    recentOrders,
    lastIdx,
    filteredOrders,
    filteredUsers,
    filteredRenewals,
    filteredSubscriptions,
    filteredGmailAccounts,
    stats
  };
};
