import React, { useState, useEffect, useId } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, ArrowLeft, Users, ShoppingBag,
  DollarSign, Activity, Check, X, Search, PlusCircle,
  RotateCw, MessageSquare, Settings, Sparkles, Clock, User, Shield,
  Edit2, Trash2, Star, Ban, Play, AlertTriangle, Mail, Copy, Save,
  ChevronDown, LogOut, Phone, Send, Coins, HelpCircle
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ThemeToggle } from '../components/ThemeToggle';
import { generateTOTP } from '../utils/totp';

interface Plan {
  id: string;
  name: string;
  duration_months: number;
  price_iqd: number;
  product_id: string;
}

interface Order {
  id: string;
  user_id: string;
  plan_id: string;
  product_id?: string;
  gmail: string;
  phone: string;
  status: 'pending' | 'processing' | 'awaiting_payment' | 'paid' | 'expired' | 'rejected' | 'cancelled';
  created_at: string;
  activation_date?: string;
  payment_date?: string;
  notes?: string;
  user_email?: string;
  plan_name_snapshot?: string;
  gmail_account_id?: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'suspended';
  gmail?: string;
  phone?: string;
  gmail_account_id?: string;
}

interface GmailAccount {
  id: string;
  email: string;
  plan_id: string;
  twofa_secret: string;
  subscription_valid_until?: string;
  max_members: number;
  status: 'Available' | 'Full' | 'Expired' | 'Disabled';
  notes?: string;
  created_at: string;
  updated_at: string;
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
  full_name?: string;
  avatar_url?: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
}

function formatNumberWithCommas(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return '';
  const clean = String(value).replace(/,/g, '').replace(/\D/g, '');
  if (!clean) return '';
  return Number(clean).toLocaleString('en-US');
}

export const Admin: React.FC = () => {
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

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'users' | 'renewals' | 'subscriptions' | 'products' | 'plans' | 'faqs' | 'testimonials' | 'settings' | 'gmail_accounts'>(() => {
    const hash = window.location.hash.slice(1);
    const validTabs = ['overview', 'orders', 'users', 'renewals', 'subscriptions', 'products', 'plans', 'faqs', 'testimonials', 'settings', 'gmail_accounts'];
    return (hash && validTabs.includes(hash)) ? (hash as any) : 'overview';
  });

  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const validTabs = ['overview', 'orders', 'users', 'renewals', 'subscriptions', 'products', 'plans', 'faqs', 'testimonials', 'settings', 'gmail_accounts'];
      if (hash && validTabs.includes(hash)) {
        setActiveTab(hash as any);
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
  const [productSearch, setProductSearch] = useState('');
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

  // -------------------------------------------------------------
  // Admin Operations Actions
  // -------------------------------------------------------------

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

  // 2. Activate Subscription (Set state to open Gmail Account selection modal)
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

  const handleAssignGmailAccountToOrder = async (orderId: string, gmailAccountId: string | null) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ gmail_account_id: gmailAccountId })
        .eq('id', orderId);
      if (error) throw error;
      showSnackbar('تم تحديث تعيين حساب Gmail للطلب بنجاح.');
      await loadAdminData(true);
    } catch (err: any) {
      showSnackbar('خطأ أثناء التعيين: ' + err.message, 'error');
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

  // 4. Reject Renewal Request
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

  // 5. Toggle Admin Permission
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

  // =========================================================================
  // CRUD Action Handlers
  // =========================================================================

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
    const u = users.find(user => user.id === userId);
    if (!u) return 'مستخدم مجهول';
    return u.full_name ? `${u.full_name} (${u.email})` : u.email;
  };

  const getOrderStatusDetails = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { label: 'قيد المراجعة', badgeClass: 'status-pill pending', icon: <Clock size={12} /> };
      case 'processing':
        return { label: 'جاري التفعيل', badgeClass: 'status-pill processing', icon: <RotateCw size={12} className="animate-spin" /> };
      case 'awaiting_payment':
        return { label: 'بانتظار الدفع', badgeClass: 'status-pill awaiting_payment', icon: <DollarSign size={12} /> };
      case 'paid':
        return { label: 'تم الدفع', badgeClass: 'status-pill paid', icon: <Check size={12} /> };
      case 'expired':
        return { label: 'منتهي الصلاحية', badgeClass: 'status-pill expired', icon: <Clock size={12} /> };
      case 'rejected':
        return { label: 'مرفوض', badgeClass: 'status-pill rejected', icon: <X size={12} /> };
      case 'cancelled':
        return { label: 'ملغي', badgeClass: 'status-pill cancelled', icon: <X size={12} /> };
      default:
        return { label: status, badgeClass: 'status-pill', icon: null };
    }
  };

  // -------------------------------------------------------------
  // Overview Dashboard Derivations (borrowed from redesign-admin-dashboard-componeadd processubg as a status nt)
  // -------------------------------------------------------------
  const months = React.useMemo(() => {
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

  const series = React.useMemo(() => {
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

  const statusBreakdown = React.useMemo(() => {
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

  const topPlans = React.useMemo(() => {
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

  const recentOrders = React.useMemo(
    () => [...orders].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 6),
    [orders]
  );

  const lastIdx = series.revenue.length - 1;

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

  const filteredGmailAccounts = gmailAccountsList.filter(g => {
    const emailMatch = g.email.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' || g.status === statusFilter;
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
    <div className="admin-page-wrapper" style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text)' }}>
      <style>{`
        .admin-page-wrapper .container {
          max-width: 1600px;
        }
        select option {
          background-color: #1e293b;
          color: #f8fafc;
        }
        .clickable-email {
          color: var(--text) !important;
          text-decoration: none;
          transition: color 0.2s ease, text-decoration 0.2s ease;
        }
        .clickable-email:hover {
          color: var(--primary) !important;
          text-decoration: underline;
        }
        @keyframes slide-in {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .admin-layout {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        @media (min-width: 1024px) {
          .admin-layout {
            flex-direction: row;
            align-items: start;
          }
          .admin-sidebar {
            width: 280px;
            flex-shrink: 0;
            position: sticky;
            top: 24px;
          }
          .admin-content {
            flex-grow: 1;
            min-width: 0;
          }
        }
        .admin-tab-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: right;
          gap: 12px;
        }
        .admin-tab-item:hover:not(.active) {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text);
          transform: translateX(-4px);
        }
        .admin-tab-item.active {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%);
          border: 1px solid rgba(99, 102, 241, 0.25);
          color: #818cf8;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.08);
        }
        
        .metric-card {
          position: relative;
          border-radius: 24px;
          border: 1px solid var(--border);
          background: var(--surface);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease, box-shadow 0.3s ease;
          box-shadow: var(--shadow);
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
        .metric-card-inner {
          position: relative;
          padding: 24px;
          border-radius: 23px;
          overflow: hidden;
        }
        .metric-card:hover {
          transform: translateY(-6px) translateZ(0);
          -webkit-transform: translateY(-6px) translateZ(0);
          border-color: rgba(99, 102, 241, 0.35);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25), 0 0 24px rgba(99, 102, 241, 0.08);
        }
        .metric-glow {
          position: absolute;
          top: -60px; right: -60px;
          width: 140px; height: 140px;
          border-radius: 50%;
          filter: blur(50px);
          opacity: 0.12;
          pointer-events: none;
        }
        
        .admin-table-container {
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.005);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: var(--shadow-sm);
        }
        .admin-table-wrapper {
          overflow-x: auto;
          width: 100%;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: right;
          font-size: 0.85rem;
          white-space: nowrap;
        }
        .admin-table th {
          padding: 18px 16px;
          font-weight: 800;
          color: var(--text-secondary);
          border-bottom: 2px solid var(--border);
          background: rgba(255, 255, 255, 0.012);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .admin-table td {
          padding: 16px;
          border-bottom: 1px solid var(--border);
          color: var(--text);
          transition: background 0.2s ease;
          vertical-align: middle;
        }
        .admin-table tbody tr:nth-child(even) td {
          background: rgba(255, 255, 255, 0.005);
        }
        .admin-table tbody tr:nth-child(odd) td {
          background: rgba(255, 255, 255, 0.015);
        }
        .admin-table tbody tr:hover td {
          background: rgba(255, 255, 255, 0.035) !important;
        }
        html:not(.dark) .admin-table tbody tr:nth-child(even) td {
          background: rgba(0, 0, 0, 0.005);
        }
        html:not(.dark) .admin-table tbody tr:nth-child(odd) td {
          background: rgba(0, 0, 0, 0.018);
        }
        html:not(.dark) .admin-table tbody tr:hover td {
          background: rgba(0, 0, 0, 0.04) !important;
        }
        .admin-table tr:last-child td {
          border-bottom: none;
        }
        
        /* Scrollbars */
        .admin-table-wrapper::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .admin-table-wrapper::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-table-wrapper::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 99px;
        }
        .admin-table-wrapper::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        /* Status Pills */
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 800;
          border: 1px solid transparent;
        }
        .status-pill.pending {
          background: rgba(245, 158, 11, 0.08);
          color: #fbbf24;
          border-color: rgba(245, 158, 11, 0.25);
        }
        .status-pill.processing {
          background: rgba(59, 130, 246, 0.08);
          color: #60a5fa;
          border-color: rgba(59, 130, 246, 0.25);
        }
        .status-pill.paid {
          background: rgba(34, 197, 94, 0.08);
          color: #4ade80;
          border-color: rgba(34, 197, 94, 0.25);
        }
        .status-pill.awaiting_payment {
          background: rgba(139, 92, 246, 0.08);
          color: #a78bfa;
          border-color: rgba(139, 92, 246, 0.25);
        }
        .status-pill.rejected {
          background: rgba(239, 68, 68, 0.08);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.25);
        }
        .status-pill.cancelled {
          background: rgba(100, 116, 139, 0.08);
          color: #94a3b8;
          border-color: rgba(100, 116, 139, 0.25);
        }
         .status-pill.expired {
          background: rgba(156, 163, 175, 0.08);
          color: #9ca3af;
          border-color: rgba(156, 163, 175, 0.25);
        }
        .status-pill.suspended {
          background: rgba(239, 68, 68, 0.08);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.25);
        }

        /* Admin action items buttons */
        .admin-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 14px;
          font-size: 0.78rem;
          font-weight: 700;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          gap: 6px;
          border: 1px solid transparent;
        }
        .admin-action-btn:hover {
          transform: scale(1.03);
        }
        .admin-action-btn:active {
          transform: scale(0.97);
        }
        
        .admin-input-select {
          padding: 12px 16px;
          background: var(--background-alt);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-size: 0.85rem;
          outline: none;
          min-width: 150px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .admin-input-select:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        /* Modals & Forms UI/UX */
        .admin-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
          animation: overlay-fade-in 0.25s ease-out forwards;
        }
        @keyframes overlay-fade-in {
          from { background: rgba(15, 23, 42, 0); }
          to { background: rgba(15, 23, 42, 0.4); }
        }
        .admin-modal-card {
          position: relative;
          background: var(--surface-raised);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 32px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--border);
          color: var(--text);
          animation: modal-scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes modal-scale-up {
          from {
            transform: scale(0.92) translateY(12px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .admin-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }
        .admin-form-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 800;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }
        .admin-input-text {
          width: 100%;
          padding: 12px 16px;
          background: var(--background-alt);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-size: 0.88rem;
          outline: none;
          transition: all 0.3s ease;
          unicode-bidi: plaintext;
          text-align: start;
        }
        .admin-input-text:focus {
          border-color: var(--primary);
          background: var(--background);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        
        /* Table Action Buttons */
        .admin-table-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-secondary);
        }
        .admin-table-action-btn:hover {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          transform: translateY(-1px);
        }
        .admin-table-action-btn.delete {
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.2);
        }
        .admin-table-action-btn.delete:hover {
          background: #ef4444;
          border-color: #ef4444;
          color: white;
        }
        .admin-table-action-btn.success {
          color: #4ade80;
          border-color: rgba(34, 197, 94, 0.2);
        }
        .admin-table-action-btn.success:hover {
          background: #22c55e;
          border-color: #22c55e;
          color: white;
        }
      
      `}</style>

      {/* HEADER */}
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--background-alt)', padding: '16px 0' }}>
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck size={24} style={{ color: 'var(--secondary)' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>لوحة الإدارة والمتابعة</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/" className="btn btn-outline" style={{ padding: '6px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /> الصفحة الرئيسية
            </Link>
            <button
              onClick={handleSignOut}
              className="btn btn-outline"
              style={{ padding: '6px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <LogOut size={14} /> تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '40px 20px' }}>

        {/* 2. MAIN LAYOUT SPLIT */}
        <div className="admin-layout">

          {/* RIGHT COLUMN: Sidebar (Metrics + Navigation) */}
          <aside className="admin-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>



            {/* NAVIGATION PANEL */}
            <div className="glass-panel" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ padding: '0 8px 12px 8px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>لوحات التحكم</span>
              </div>

              <button
                onClick={() => { setActiveTab('overview'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'overview' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Activity size={18} />
                  <span>الرئيسية</span>
                </div>
              </button>

              <button
                onClick={() => { setActiveTab('orders'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'orders' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShoppingBag size={18} />
                  <span>الطلبات الواردة</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 800 }}>{orders.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('renewals'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'renewals' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <RotateCw size={18} />
                  <span>طلبات التجديد</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 800 }}>{renewals.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('subscriptions'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={18} />
                  <span>الاشتراكات</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 800 }}>{subscriptions.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('users'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'users' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users size={18} />
                  <span>المستخدمين</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 800 }}>{users.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('gmail_accounts'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'gmail_accounts' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={18} />
                  <span>حسابات Gmail للمشاركة</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 800 }}>{gmailAccountsList.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('products'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'products' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <DollarSign size={18} />
                  <span>المنتجات</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 800 }}>{productsList.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('plans'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'plans' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <PlusCircle size={18} />
                  <span>الباقات</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 800 }}>{Object.keys(plans).length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('faqs'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'faqs' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MessageSquare size={18} />
                  <span>الأسئلة الشائعة</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 800 }}>{faqsList.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('testimonials'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'testimonials' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={18} />
                  <span>الآراء والتقييمات</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 800 }}>{testimonialsList.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'settings' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Settings size={18} />
                  <span>إعدادات المتجر</span>
                </div>
              </button>
            </div>
          </aside>

          {/* LEFT COLUMN: Main content area */}
          <div className="admin-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* 1. METRICS DASHBOARD */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-right animate-slide-up">

              {/* Revenue card */}
              <div className="metric-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <span style={{ display: 'flex', width: '44px', height: '44px', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: 'var(--success-light)', color: 'var(--success)' }}>
                    <DollarSign size={20} />
                  </span>
                  <div style={{ width: '96px', height: '40px', opacity: 0.9 }}>
                    <Sparkline data={series.revenue} color="var(--success)" />
                  </div>
                </div>
                <p style={{ marginTop: '16px', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)' }}>إجمالي الإيرادات</p>
                <div style={{ marginTop: '4px', display: 'flex', alignItems: 'end', gap: '8px' }}>
                  <strong style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)' }} className="number-latin">
                    {stats.totalRevenue.toLocaleString('en-US')}
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>د.ع</span>
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${pct(series.revenue, lastIdx) >= 0 ? "bg-emerald-100/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-100/10 text-rose-500 border border-rose-500/20"
                    }`} style={{ direction: 'ltr', marginBottom: '4px' }}>
                    {pct(series.revenue, lastIdx) >= 0 ? '+' : ''}{pct(series.revenue, lastIdx)}%
                  </span>
                </div>
              </div>

              {/* Active subs card */}
              <div className="metric-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <span style={{ display: 'flex', width: '44px', height: '44px', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    <Activity size={20} />
                  </span>
                  <div style={{ width: '96px', height: '40px', opacity: 0.9 }}>
                    <Sparkline data={series.subCounts} color="var(--primary)" />
                  </div>
                </div>
                <p style={{ marginTop: '16px', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)' }}>الاشتراكات النشطة</p>
                <div style={{ marginTop: '4px', display: 'flex', alignItems: 'end', gap: '8px' }}>
                  <strong style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)' }} className="number-latin">
                    {stats.activeSubs}
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>اشتراك</span>
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${pct(series.subCounts, lastIdx) >= 0 ? "bg-emerald-100/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-100/10 text-rose-500 border border-rose-500/20"
                    }`} style={{ direction: 'ltr', marginBottom: '4px' }}>
                    {pct(series.subCounts, lastIdx) >= 0 ? '+' : ''}{pct(series.subCounts, lastIdx)}%
                  </span>
                </div>
              </div>

              {/* Pending orders card */}
              <div className="metric-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <span style={{ display: 'flex', width: '44px', height: '44px', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: 'var(--warning-light)', color: 'var(--warning)' }}>
                    <ShoppingBag size={20} />
                  </span>
                  <div style={{ width: '96px', height: '40px', opacity: 0.9 }}>
                    <Sparkline data={series.orderCounts} color="var(--warning)" />
                  </div>
                </div>
                <p style={{ marginTop: '16px', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)' }}>طلبات معلّقة</p>
                <div style={{ marginTop: '4px', display: 'flex', alignItems: 'end', gap: '8px' }}>
                  <strong style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)' }} className="number-latin">
                    {stats.pendingOrders}
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>طلب معلق</span>
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${pct(series.orderCounts, lastIdx) >= 0 ? "bg-emerald-100/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-100/10 text-rose-500 border border-rose-500/20"
                    }`} style={{ direction: 'ltr', marginBottom: '4px' }}>
                    {pct(series.orderCounts, lastIdx) >= 0 ? '+' : ''}{pct(series.orderCounts, lastIdx)}%
                  </span>
                </div>
              </div>

              {/* Total Users card */}
              <div className="metric-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <span style={{ display: 'flex', width: '44px', height: '44px', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.08)', color: 'var(--secondary)' }}>
                    <Users size={20} />
                  </span>
                  <div style={{ width: '96px', height: '40px', opacity: 0.9 }}>
                    <Sparkline data={series.userCounts} color="var(--secondary)" />
                  </div>
                </div>
                <p style={{ marginTop: '16px', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)' }}>إجمالي المسجّلين</p>
                <div style={{ marginTop: '4px', display: 'flex', alignItems: 'end', gap: '8px' }}>
                  <strong style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)' }} className="number-latin">
                    {stats.totalUsers}
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>عميل مسجل</span>
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${pct(series.userCounts, lastIdx) >= 0 ? "bg-emerald-100/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-100/10 text-rose-500 border border-rose-500/20"
                    }`} style={{ direction: 'ltr', marginBottom: '4px' }}>
                    {pct(series.userCounts, lastIdx) >= 0 ? '+' : ''}{pct(series.userCounts, lastIdx)}%
                  </span>
                </div>
              </div>

            </section>

            {/* Header for dynamic section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', background: 'var(--background-alt)', padding: '20px 24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)' }}>
                  {activeTab === 'overview' ? 'لوحة التحكم والمؤشرات الرئيسية' :
                    activeTab === 'orders' ? 'إدارة الطلبات الواردة' :
                      activeTab === 'renewals' ? 'طلبات تجديد الاشتراكات' :
                        activeTab === 'subscriptions' ? 'الاشتراكات النشطة' :
                          activeTab === 'users' ? 'قائمة حسابات المستخدمين' :
                            activeTab === 'gmail_accounts' ? 'حسابات Gmail المشتركة' :
                              activeTab === 'products' ? 'المنتجات المعروضة' :
                                activeTab === 'plans' ? 'باقات تفعيل Google AI Pro' :
                                  activeTab === 'faqs' ? 'الأسئلة الشائعة للزوار' :
                                    activeTab === 'testimonials' ? 'تقييمات وآراء العملاء' :
                                      'إعدادات وثوابت متجر نينوسوفت'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {activeTab === 'overview' ? 'نظرة شاملة ومؤشرات تفاعلية لأداء متجرك اليوم.' :
                    activeTab === 'orders' ? 'تتبع وتنشيط وتعديل حالة طلبات العملاء الجدد.' :
                      activeTab === 'renewals' ? 'مراجعة وتأكيد طلبات العملاء الراغبين بتجديد باقاتهم.' :
                        activeTab === 'subscriptions' ? 'عرض فترات الضمان والاشتراكات المفعلة للعملاء.' :
                          activeTab === 'users' ? 'متابعة تفاصيل المستخدمين المسجلين وصلاحياتهم.' :
                            activeTab === 'gmail_accounts' ? 'إدارة حسابات Gmail المستخدمة في تفعيل وتوزيع الاشتراكات.' :
                              activeTab === 'products' ? 'إضافة وتعديل وحذف المنتجات وخصائصها.' :
                                activeTab === 'plans' ? 'التحكم بالمدد الزمنية للأسعار والتخفيضات الفعلية.' :
                                  activeTab === 'faqs' ? 'تعديل أو ترتيب الأسئلة الشائعة وأجوبتها.' :
                                    activeTab === 'testimonials' ? 'إدارة التقييمات المعروضة في الصفحة الرئيسية.' :
                                      'تعديل المتغيرات الأساسية للمنصة مثل رقم الهاتف للدعم.'}
                </p>
              </div>


              {activeTab === 'gmail_accounts' && (
                <button
                  onClick={() => { setIsAdding(true); setEditingItem(null); setFormFields({ max_members: 5, status: 'Available' }); }}
                  style={{
                    padding: '10px 18px', fontWeight: 800, borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer',
                    transition: 'all 0.3s ease', border: 'none', background: 'var(--primary)', color: 'white',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <PlusCircle size={16} />
                  <span>إضافة حساب Gmail جديد</span>
                </button>
              )}
            </div>

            {activeTab === 'overview' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-slide-up">



                {/* Charts grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* Area Chart panel */}
                  <div className="glass-panel md:col-span-2" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>مخطط الإيرادات الشهرية</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>آخر 6 أشهر · بالدينار العراقي</p>
                    </div>
                    <div style={{ padding: '12px 0' }}>
                      <AreaChart data={series.revenue} labels={months.map((m) => m.label)} />
                    </div>
                  </div>

                  {/* Donut Chart panel */}
                  <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>توزيع حالات الطلبات</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>حسب إجمالي الطلبات المستلمة</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', gap: '16px', flex: 1, justifyContent: 'center' }}>
                      <DonutChart
                        segments={statusBreakdown}
                        center={
                          <>
                            <span className="number-latin" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)' }}>
                              {stats.totalOrders}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>إجمالي الطلبات</span>
                          </>
                        }
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                        {statusBreakdown.map((s) => (
                          <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                              {s.label}
                            </span>
                            <strong style={{ color: 'var(--text)' }} className="number-latin">{s.value}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Seat Stats Grid/Panel */}
                {(() => {
                  // Calculate overall seat stats
                  let totalCapacity = 0;
                  let occupiedSeats = 0;

                  gmailAccountsList.forEach((g: any) => {
                    if (g.status !== 'Disabled') {
                      totalCapacity += g.max_members;
                    }
                  });

                  subscriptions.forEach((s: any) => {
                    if (s.status === 'active' && s.gmail_account_id) {
                      const acc = gmailAccountsList.find(g => g.id === s.gmail_account_id);
                      if (acc && acc.status !== 'Disabled') {
                        occupiedSeats += 1;
                      }
                    }
                  });

                  const freeSeats = Math.max(0, totalCapacity - occupiedSeats);
                  const occupancyRate = totalCapacity > 0 ? Math.round((occupiedSeats / totalCapacity) * 100) : 0;

                  // Calculate per product seat stats
                  const productSeatStatsMap: Record<string, { productName: string; totalCapacity: number; occupiedSeats: number }> = {};
                  
                  // Initialize products
                  productsList.forEach((p: any) => {
                    productSeatStatsMap[p.id] = {
                      productName: p.name,
                      totalCapacity: 0,
                      occupiedSeats: 0
                    };
                  });

                  // Sum capacities
                  gmailAccountsList.forEach((g: any) => {
                    if (g.status !== 'Disabled') {
                      const plan = plans[g.plan_id];
                      if (plan && productSeatStatsMap[plan.product_id]) {
                        productSeatStatsMap[plan.product_id].totalCapacity += g.max_members;
                      }
                    }
                  });

                  // Sum occupied
                  subscriptions.forEach((s: any) => {
                    if (s.status === 'active' && s.gmail_account_id) {
                      const acc = gmailAccountsList.find(g => g.id === s.gmail_account_id);
                      if (acc && acc.status !== 'Disabled') {
                        const plan = plans[acc.plan_id];
                        if (plan && productSeatStatsMap[plan.product_id]) {
                          productSeatStatsMap[plan.product_id].occupiedSeats += 1;
                        }
                      }
                    }
                  });

                  const productStatsList = Object.values(productSeatStatsMap).filter(p => p.totalCapacity > 0);

                  return (
                    <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <h4 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '0.5px' }}>مؤشرات توزيع واستهلاك مقاعد الحسابات</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>متابعة تفصيلية للقدرة الاستيعابية وسعة المقاعد الشاغرة لحسابات الـ Gmail للمشاركة</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>معدل الاستهلاك العام:</span>
                          <span className="status-pill paid" style={{ fontSize: '0.95rem', fontWeight: 900, padding: '6px 16px', borderRadius: '10px' }}>
                            {occupancyRate}%
                          </span>
                        </div>
                      </div>

                      {/* Section 1: Giant Metrics Summary */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 800 }}>السعة الإجمالية للمقاعد</span>
                            <strong style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text)' }} className="number-latin">{totalCapacity}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>مقعد متوفر كلياً</span>
                          </div>
                          <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 800 }}>المقاعد المشغولة</span>
                            <strong style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }} className="number-latin">{occupiedSeats}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', opacity: 0.8 }} className="number-latin">{occupancyRate}% إشغال</span>
                          </div>
                          <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 800 }}>المقاعد الشاغرة</span>
                            <strong style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--success)' }} className="number-latin">{freeSeats}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--success)', opacity: 0.8 }} className="number-latin">{totalCapacity - occupiedSeats} مقعد متاح فورياً</span>
                          </div>
                        </div>

                        {/* Large progress bar */}
                        <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border)', padding: '2px' }}>
                          <div style={{ width: `${occupancyRate}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: '999px', boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)' }} />
                        </div>
                      </div>

                      {/* Section 2: Product breakdown */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h5 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)', borderRight: '3px solid var(--primary)', paddingRight: '8px' }}>توزيع المقاعد لكل منتج تفصيلياً</h5>
                        
                        {productStatsList.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {productStatsList.map((pStat, index) => {
                              const rate = pStat.totalCapacity > 0 ? Math.round((pStat.occupiedSeats / pStat.totalCapacity) * 100) : 0;
                              return (
                                <div key={index} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)' }}>{pStat.productName}</span>
                                    <span className="number-latin" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                      {pStat.occupiedSeats} / {pStat.totalCapacity} مقعد
                                    </span>
                                  </div>
                                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <div style={{ width: `${rate}%`, height: '100%', background: 'var(--primary)', borderRadius: '999px' }} />
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                    <span>الإشغال: {rate}%</span>
                                    <span>الشاغر: {pStat.totalCapacity - pStat.occupiedSeats}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            لا توجد حسابات نشطة أو مقاعد مدخلة حالياً لحساب توزيعها.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Recent Orders + Top Plans Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* Recent Orders list */}
                  <div className="glass-panel md:col-span-2" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>أحدث الطلبات الواردة</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>آخر 6 طلبات تم تسجيلها</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('orders')}
                        style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        عرض الكل
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {recentOrders.map((o) => {
                        const plan = plans[o.plan_id];
                        const statusDetails = getOrderStatusDetails(o.status);
                        const statusColor = o.status === 'paid' ? 'var(--success)' 
                                          : o.status === 'pending' ? 'var(--warning)' 
                                          : o.status === 'processing' ? 'var(--primary)' 
                                          : o.status === 'awaiting_payment' ? 'var(--warning)' 
                                          : o.status === 'rejected' ? 'var(--danger)' 
                                          : 'var(--text-muted)';
                        return (
                          <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                {(getUserDisplayName(o.user_id) || o.gmail || '?')[0].toUpperCase()}
                              </div>
                              <div>
                                <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)' }}>{o.gmail}</h5>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  {plan?.name || "باقة"} · <span className="number-latin">{new Date(o.created_at).toLocaleDateString('en-GB')}</span>
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: statusColor }}>
                                {statusDetails.label}
                              </span>
                              {plan && (
                               <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text)' }}>
                                  <span className="number-latin">{plan.price_iqd.toLocaleString('en-US')}</span> د.ع
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Plans bar chart */}
                  <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>أعلى الباقات إيراداً</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>حسب إجمالي الطلبات المكتملة</p>
                    </div>
                    <div style={{ padding: '24px 0 12px 0', flex: 1, display: 'flex', alignItems: 'center' }}>
                      <BarChart
                        data={topPlans.map((p) => p.value)}
                        labels={topPlans.map((p) => p.label.split(" ").slice(0, 2).join(" "))}
                        formatValue={(n) => `${(n / 1000).toFixed(0)}K`}
                      />
                    </div>
                  </div>

                </div>

              </div>
            ) : activeTab === 'settings' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }} className="animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ width: '100%', direction: 'rtl' }}>
                  
                  {/* Section 1: Support & Communication */}
                  <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--border)' }}>
                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MessageSquare size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text)' }}>الدعم الفني وقنوات التواصل</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>تعديل روابط تواصل الدعم الفني مع العملاء في المتجر</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {settingsList.filter(s => ['whatsapp', 'telegram', 'support_email'].includes(s.key)).map((s) => {
                        const currentVal = s.value;
                        const tempVal = tempSettings[s.key] !== undefined ? tempSettings[s.key] : currentVal.value;
                        const isDirty = tempSettings[s.key] !== undefined && tempSettings[s.key] !== currentVal.value;
                        return (
                          <div key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{currentVal.label || s.key}</label>
                              <span className="number-latin" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s.key}</span>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              background: 'var(--background-alt)',
                              border: isDirty ? '1.5px solid var(--warning)' : '1px solid var(--border)',
                              borderRadius: '12px',
                              padding: '4px 12px',
                              transition: 'all 0.2s ease',
                              boxShadow: isDirty ? '0 0 0 3px rgba(245, 158, 11, 0.15)' : 'none',
                              direction: 'ltr'
                            }}>
                              <span style={{ color: isDirty ? 'var(--warning)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', paddingRight: '10px' }}>
                                {s.key === 'whatsapp' && <Phone size={16} />}
                                {s.key === 'telegram' && <Send size={16} />}
                                {s.key === 'support_email' && <Mail size={16} />}
                              </span>
                              <input
                                type="text"
                                value={tempVal}
                                onChange={(e) => setTempSettings({ ...tempSettings, [s.key]: e.target.value })}
                                dir="auto"
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  padding: '8px 0',
                                  color: 'var(--text)',
                                  fontSize: '0.85rem',
                                  outline: 'none',
                                  width: '100%'
                                }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '10px' }}>
                                {isDirty && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setTempSettings({ ...tempSettings, [s.key]: currentVal.value });
                                      }}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                      }}
                                      title="تراجع عن التعديل"
                                    >
                                      تراجع
                                    </button>
                                    <span style={{ fontSize: '0.7rem', background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                      عدّل
                                    </span>
                                  </>
                                )}
                                <button
                                  onClick={async () => {
                                    const updatedVal = { ...currentVal, value: tempVal };
                                    await handleSaveSetting(s.key, updatedVal);
                                  }}
                                  disabled={!isDirty}
                                  className="admin-table-action-btn success"
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '0.78rem',
                                    borderRadius: '8px',
                                    opacity: isDirty ? 1 : 0.3,
                                    pointerEvents: isDirty ? 'auto' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Save size={12} />
                                  <span>حفظ</span>
                                </button>
                              </div>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 4px 0 4px' }}>{currentVal.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 2: Financial & Pricing */}
                  <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--border)' }}>
                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ background: 'var(--success-light)', color: 'var(--success)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Coins size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text)' }}>سعر الصرف والأسعار الرسمية</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>تحديث أسعار صرف الدولار ومقارنة التوفير المالي للباقات</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {settingsList.filter(s => ['exchange_rate', 'google_official_annual_price'].includes(s.key)).map((s) => {
                        const currentVal = s.value;
                        const tempVal = tempSettings[s.key] !== undefined ? tempSettings[s.key] : currentVal.value;
                        const isDirty = tempSettings[s.key] !== undefined && tempSettings[s.key] !== currentVal.value;
                        return (
                          <div key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{currentVal.label || s.key}</label>
                              <span className="number-latin" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s.key}</span>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              background: 'var(--background-alt)',
                              border: isDirty ? '1.5px solid var(--warning)' : '1px solid var(--border)',
                              borderRadius: '12px',
                              padding: '4px 12px',
                              transition: 'all 0.2s ease',
                              boxShadow: isDirty ? '0 0 0 3px rgba(245, 158, 11, 0.15)' : 'none',
                              direction: 'ltr'
                            }}>
                              <span style={{ color: isDirty ? 'var(--warning)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', paddingRight: '10px' }}>
                                {s.key === 'exchange_rate' && <DollarSign size={16} />}
                                {s.key === 'google_official_annual_price' && <Coins size={16} />}
                              </span>
                              <input
                                type="number"
                                value={tempVal}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const parsed = parseFloat(raw);
                                  setTempSettings({ ...tempSettings, [s.key]: isNaN(parsed) ? '' : parsed });
                                }}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  padding: '8px 0',
                                  color: 'var(--text)',
                                  fontSize: '0.85rem',
                                  outline: 'none',
                                  width: '100%',
                                  textAlign: 'left'
                                }}
                                className="number-latin"
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '10px' }}>
                                {isDirty && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setTempSettings({ ...tempSettings, [s.key]: currentVal.value });
                                      }}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                      }}
                                      title="تراجع عن التعديل"
                                    >
                                      تراجع
                                    </button>
                                    <span style={{ fontSize: '0.7rem', background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                      عدّل
                                    </span>
                                  </>
                                )}
                                <button
                                  onClick={async () => {
                                    const updatedVal = { ...currentVal, value: tempVal };
                                    await handleSaveSetting(s.key, updatedVal);
                                  }}
                                  disabled={!isDirty}
                                  className="admin-table-action-btn success"
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '0.78rem',
                                    borderRadius: '8px',
                                    opacity: isDirty ? 1 : 0.3,
                                    pointerEvents: isDirty ? 'auto' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Save size={12} />
                                  <span>حفظ</span>
                                </button>
                              </div>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 4px 0 4px' }}>{currentVal.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <>
                {/* Filter and Search controls bar */}
                {['products', 'plans', 'faqs', 'testimonials'].includes(activeTab) ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(30, 41, 59, 0.25)', border: '1px solid rgba(148, 163, 184, 0.12)', padding: '12px 16px', borderRadius: '16px', width: '100%', marginBottom: '16px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Search size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={
                          activeTab === 'products' ? 'ابحث عن منتج...' :
                          activeTab === 'plans' ? 'ابحث عن باقة...' :
                          activeTab === 'faqs' ? 'ابحث عن سؤال...' :
                          'ابحث عن تقييم...'
                        }
                        dir={searchTerm ? 'auto' : 'rtl'}
                        style={{
                          width: '100%', padding: '10px 42px 10px 16px',
                          background: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(148, 163, 184, 0.18)',
                          borderRadius: '12px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none'
                        }}
                      />
                    </div>

                    {activeTab === 'products' && (
                      <button
                        onClick={() => { setIsAdding(true); setEditingItem(null); setFormFields({ name: '', slug: '', description: '', is_active: true }); }}
                        style={{
                          padding: '10px 18px', fontWeight: 800, borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer',
                          border: 'none', background: '#4f46e5', color: 'white',
                          display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0
                        }}
                      >
                        <PlusCircle size={16} />
                        <span>إضافة منتج</span>
                      </button>
                    )}
                    {activeTab === 'plans' && (
                      <button
                        onClick={() => { setIsAdding(true); setEditingItem(null); setFormFields({ name: '', product_id: productsList[0]?.id || '', duration_months: 1, price_iqd: 15000, official_price_iqd: null, badge: '', is_featured: false, display_order: 0, is_active: true }); }}
                        style={{
                          padding: '10px 18px', fontWeight: 800, borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer',
                          border: 'none', background: '#4f46e5', color: 'white',
                          display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0
                        }}
                      >
                        <PlusCircle size={16} />
                        <span>إضافة باقة جديدة</span>
                      </button>
                    )}
                    {activeTab === 'faqs' && (
                      <button
                        onClick={() => { setIsAdding(true); setEditingItem(null); setFormFields({ question: '', answer: '', display_order: 0, is_active: true }); }}
                        style={{
                          padding: '10px 18px', fontWeight: 800, borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer',
                          border: 'none', background: '#4f46e5', color: 'white',
                          display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0
                        }}
                      >
                        <PlusCircle size={16} />
                        <span>إضافة سؤال</span>
                      </button>
                    )}
                    {activeTab === 'testimonials' && (
                      <button
                        onClick={() => { setIsAdding(true); setEditingItem(null); setFormFields({ name: '', rating: 5, comment: '', display_order: 0, is_active: true }); }}
                        style={{
                          padding: '10px 18px', fontWeight: 800, borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer',
                          border: 'none', background: '#4f46e5', color: 'white',
                          display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0
                        }}
                      >
                        <PlusCircle size={16} />
                        <span>إضافة رأي عميل</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '12px', width: '100%', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
                      <Search size={16} style={{ position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ابحث بالـ Gmail، الاسم، أو رقم الهاتف..."
                        dir={searchTerm ? 'auto' : 'rtl'}
                        style={{
                          width: '100%', padding: '12px 42px 12px 16px',
                          background: 'var(--background-alt)', border: '1px solid var(--border)',
                          borderRadius: '12px', color: 'var(--text)', fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    {['orders', 'renewals', 'subscriptions', 'gmail_accounts', 'users'].includes(activeTab) && (
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                          padding: '12px 16px',
                          background: 'var(--background-alt)', border: '1px solid var(--border)',
                          borderRadius: '12px', color: 'var(--text)', fontSize: '0.85rem',
                          outline: 'none', minWidth: '150px', cursor: 'pointer'
                        }}
                      >
                        <option value="all">جميع الحالات</option>
                        {activeTab === 'orders' ? (
                          <>
                            <option value="pending">قيد المراجعة</option>
                            <option value="processing">جاري التفعيل</option>
                            <option value="awaiting_payment">بانتظار الدفع</option>
                            <option value="paid">تم الدفع ونشط</option>
                            <option value="rejected">مرفوض</option>
                            <option value="cancelled">ملغي</option>
                            <option value="expired">منتهي الصلاحية</option>
                          </>
                        ) : activeTab === 'renewals' ? (
                          <>
                            <option value="pending">معلق</option>
                            <option value="approved">تم التجديد</option>
                            <option value="rejected">مرفوض</option>
                          </>
                        ) : activeTab === 'gmail_accounts' ? (
                          <>
                            <option value="Available">متاح</option>
                            <option value="Full">ممتلئ</option>
                            <option value="Expired">منتهي</option>
                            <option value="Disabled">ملغي</option>
                          </>
                        ) : activeTab === 'users' ? (
                          <>
                            <option value="admin">المشرفين (Admins)</option>
                            <option value="customer">العملاء (Customers)</option>
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
                )}

                {/* DYNAMIC DATA TABLE PANEL */}
                <div className="admin-table-container">
                  <div className="admin-table-wrapper">

                    {/* TAB 1: ORDERS */}
                    {activeTab === 'orders' && (
                      <table className="admin-table">
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>بريد التفعيل (Gmail)</th>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>حساب المشاركة المعين</th>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>رقم الهاتف</th>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>الباقة المطلوبة</th>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ الطلب</th>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ التفعيل</th>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ الدفع</th>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>الحالة</th>
                            <th style={{ padding: '16px', color: 'var(--text)', minWidth: '130px' }}>ملاحظات المسؤول</th>
                            <th style={{ padding: '16px', color: 'var(--text)', textAlign: 'center' }}>العمليات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.length > 0 ? (
                            filteredOrders.map((o) => (
                              <tr key={o.id} style={{ borderBottom: '1px solid var(--border)', background: o.status === 'pending' ? 'rgba(245, 158, 11, 0.02)' : 'none' }}>
                                <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text)' }} className="number-latin">{o.gmail}</td>
                                <td style={{ padding: '16px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="number-latin" style={{ fontSize: '0.85rem' }}>
                                      {gmailAccountsList.find(g => g.id === o.gmail_account_id)?.email || 'غير معين'}
                                    </span>
                                    <button
                                      onClick={() => setAssigningOrder(o)}
                                      className="admin-table-action-btn"
                                      style={{ padding: '4px 6px' }}
                                      title="تغيير الحساب المعين"
                                    >
                                      <Edit2 size={10} />
                                    </button>
                                  </div>
                                </td>
                                <td style={{ padding: '16px' }} className="number-latin">{o.phone}</td>
                                <td style={{ padding: '16px' }}>{plans[o.plan_id]?.name || 'غير معروف'}</td>
                                <td style={{ padding: '16px' }} className="number-latin">{new Date(o.created_at).toLocaleDateString('en-GB')}</td>
                                <td style={{ padding: '16px' }} className="number-latin">{o.activation_date ? new Date(o.activation_date).toLocaleDateString('en-GB') : '—'}</td>
                                <td style={{ padding: '16px' }} className="number-latin">{o.payment_date ? new Date(o.payment_date).toLocaleDateString('en-GB') : '—'}</td>
                                <td style={{ padding: '16px' }}>
                                  <span className={getOrderStatusDetails(o.status).badgeClass}>
                                    {getOrderStatusDetails(o.status).icon}
                                    <span>{getOrderStatusDetails(o.status).label}</span>
                                  </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                  <input
                                    type="text"
                                    defaultValue={o.notes || ''}
                                    placeholder="أضف ملاحظة..."
                                    onBlur={(e) => handleSaveNotes(o.id, e.target.value)}
                                    dir="auto"
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
                                <td style={{ padding: '16px' }}>
                                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    {o.status === 'pending' && (
                                      <button
                                        onClick={() => handleProcessOrder(o.id)}
                                        className="admin-table-action-btn"
                                      >
                                        <Activity size={12} />
                                        <span>بدء المعالجة</span>
                                      </button>
                                    )}
                                    {(o.status === 'pending' || o.status === 'processing') && (
                                      <button
                                        onClick={() => handleApproveOrder(o)}
                                        className="admin-table-action-btn success"
                                      >
                                        <Check size={12} />
                                        <span>تنشيط</span>
                                      </button>
                                    )}
                                    {o.status === 'awaiting_payment' && (
                                      <>
                                        <button
                                          onClick={() => handleMarkPaid(o.id)}
                                          className="admin-table-action-btn success"
                                        >
                                          <Check size={12} />
                                          <span>تأكيد الدفع</span>
                                        </button>
                                        <button
                                          onClick={() => handleSendReminder(o)}
                                          className="admin-table-action-btn"
                                          style={{ color: '#25d366', borderColor: 'rgba(37, 211, 102, 0.25)' }}
                                        >
                                          <MessageSquare size={12} />
                                          <span>تذكير بالدفع</span>
                                        </button>
                                      </>
                                    )}
                                    {o.status !== 'paid' && o.status !== 'rejected' && o.status !== 'cancelled' && (
                                      <button
                                        onClick={() => handleRejectOrder(o.id)}
                                        className="admin-table-action-btn delete"
                                      >
                                        <X size={12} />
                                        <span>رفض</span>
                                      </button>
                                    )}
                                  </div>
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
                      <table className="admin-table">
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>حساب العميل</th>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>رقم الهاتف للعميل</th>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ الطلب</th>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>الحالة</th>
                            <th style={{ padding: '16px', color: 'var(--text)', textAlign: 'center' }}>العمليات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRenewals.length > 0 ? (
                            filteredRenewals.map((r) => {
                              const userPhone = users.find(u => u.id === r.user_id)?.phone || 'غير مسجل';
                              return (
                                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', background: r.status === 'pending' ? 'rgba(245, 158, 11, 0.02)' : 'none' }}>
                                  <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text)' }}>{getUserDisplayName(r.user_id)}</td>
                                  <td style={{ padding: '16px' }} className="number-latin">{userPhone}</td>
                                  <td style={{ padding: '16px' }} className="number-latin">{new Date(r.created_at).toLocaleString('en-GB')}</td>
                                  <td style={{ padding: '16px' }}>
                                    <span className={`status-pill ${r.status === 'approved' ? 'paid' : r.status === 'pending' ? 'pending' : 'rejected'}`}>
                                      {r.status === 'approved' ? <Check size={12} /> : r.status === 'pending' ? <Clock size={12} /> : <X size={12} />}
                                      <span>{r.status === 'approved' ? 'تم التجديد' : r.status === 'pending' ? 'معلق' : 'مرفوض'}</span>
                                    </span>
                                  </td>
                                  <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                      {r.status === 'pending' && (
                                        <>
                                          <button
                                            onClick={() => handleApproveRenewal(r)}
                                            className="admin-table-action-btn success"
                                          >
                                            <Check size={12} />
                                            <span>تمديد وتجديد</span>
                                          </button>
                                          <button
                                            onClick={() => handleRejectRenewal(r.id)}
                                            className="admin-table-action-btn delete"
                                          >
                                            <X size={12} />
                                            <span>رفض</span>
                                          </button>
                                        </>
                                      )}
                                    </div>
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
                      <table className="admin-table">
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>حساب العميل</th>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>حساب المشاركة المعين</th>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>الباقة المفعلة</th>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ البدء</th>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ الانتهاء</th>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>حالة الاشتراك</th>
                            <th style={{ padding: '16px', color: 'var(--text)', textAlign: 'center' }}>العمليات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSubscriptions.length > 0 ? (
                            filteredSubscriptions.map((s) => (
                              <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text)' }}>{getUserDisplayName(s.user_id)}</td>
                                <td style={{ padding: '16px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="number-latin" style={{ fontSize: '0.85rem' }}>
                                      {gmailAccountsList.find(g => g.id === s.gmail_account_id)?.email || 'غير معين'}
                                    </span>
                                    <button
                                      onClick={() => setAssigningSub(s)}
                                      className="admin-table-action-btn"
                                      style={{ padding: '4px 6px' }}
                                      title="تعديل حساب المشاركة المعين"
                                    >
                                      <Edit2 size={10} />
                                    </button>
                                  </div>
                                </td>
                                <td style={{ padding: '16px' }}>{plans[s.plan_id]?.name || 'غير معروف'}</td>
                                <td style={{ padding: '16px' }} className="number-latin">{new Date(s.start_date).toLocaleDateString('en-GB')}</td>
                                <td style={{ padding: '16px' }} className="number-latin">{new Date(s.end_date).toLocaleDateString('en-GB')}</td>
                                <td style={{ padding: '16px' }}>
                                  <span className={`status-pill ${s.status === 'active' ? 'paid' : s.status === 'suspended' ? 'suspended' : 'expired'}`}>
                                    {s.status === 'active' ? <Check size={12} /> : s.status === 'suspended' ? <Ban size={12} /> : <Clock size={12} />}
                                    <span>{s.status === 'active' ? 'نشط' : s.status === 'suspended' ? 'معلّق' : 'منتهي'}</span>
                                  </span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                  {(s.status === 'active' || s.status === 'suspended') && (
                                    <button
                                      onClick={() => handleToggleSuspendSubscription(s)}
                                      disabled={suspendingSub === s.id}
                                      className="admin-table-action-btn"
                                      style={{
                                        color: s.status === 'suspended' ? 'var(--success)' : 'var(--danger)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                      }}
                                      title={s.status === 'suspended' ? 'تنشيط الاشتراك' : 'تعليق الاشتراك'}
                                    >
                                      {suspendingSub === s.id ? (
                                        <RotateCw size={14} className="animate-spin" />
                                      ) : s.status === 'suspended' ? (
                                        <Play size={14} />
                                      ) : (
                                        <Ban size={14} />
                                      )}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد اشتراكات نشطة تطابق معايير البحث.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}

                    {activeTab === 'gmail_accounts' && (
                      <div>
                        <table className="admin-table">
                          <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                              <th style={{ padding: '16px', color: 'var(--text)' }}>البريد الإلكتروني للـ Gmail</th>
                              <th style={{ padding: '16px', color: 'var(--text)' }}>الباقة المرتبطة</th>
                              <th style={{ padding: '16px', color: 'var(--text)' }}>رمز الـ 2FA المؤقت (TOTP)</th>
                              <th style={{ padding: '16px', color: 'var(--text)' }}>صلاحية الاشتراك</th>
                              <th style={{ padding: '16px', color: 'var(--text)' }}>الأعضاء (الحالي / الأقصى)</th>
                              <th style={{ padding: '16px', color: 'var(--text)' }}>الحالة</th>
                              <th style={{ padding: '16px', color: 'var(--text)', textAlign: 'center' }}>العمليات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredGmailAccounts.length > 0 ? (
                              filteredGmailAccounts.map((g) => {
                                const activeMembersCount = subscriptions.filter(s => s.gmail_account_id === g.id && s.status === 'active').length;
                                return (
                                  <tr key={g.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td
                                      style={{ padding: '16px', fontWeight: 600, cursor: 'pointer' }}
                                      onClick={() => setSelectedGmailAccountDetails(g)}
                                      className="number-latin clickable-email"
                                    >
                                      {g.email}
                                    </td>
                                    <td style={{ padding: '16px' }}>{plans[g.plan_id]?.name || 'غير معروف'}</td>
                                    <td style={{ padding: '16px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                                        <span className="number-latin" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }} title="الوقت المتبقي لتغير الرمز">
                                          {30 - (Math.floor(Date.now() / 1000) % 30)}s
                                        </span>
                                        <span className="number-latin" style={{ fontFamily: 'monospace', fontWeight: 800, letterSpacing: '1px', fontSize: '1rem', color: 'var(--success)' }}>
                                          {(() => {
                                            const otp = generateTOTP(g.twofa_secret);
                                            return otp.length === 6 ? `${otp.substring(0, 3)} ${otp.substring(3)}` : otp;
                                          })()}
                                        </span>
                                        <button
                                          onClick={() => {
                                            const otp = generateTOTP(g.twofa_secret);
                                            navigator.clipboard.writeText(otp);
                                            showSnackbar('تم نسخ رمز 2FA (2FA code copied).', 'success');
                                          }}
                                          className="admin-table-action-btn success"
                                          style={{ padding: '4px 6px' }}
                                          title="نسخ رمز 2FA الحالي"
                                        >
                                          <Copy size={10} />
                                        </button>
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(g.twofa_secret);
                                            showSnackbar('تم نسخ المفتاح السري (2FA Secret copied).', 'success');
                                          }}
                                          className="admin-table-action-btn"
                                          style={{ padding: '4px 6px' }}
                                          title="نسخ المفتاح السري (Base32)"
                                        >
                                          <span>Secret</span>
                                        </button>
                                      </div>
                                    </td>
                                    <td style={{ padding: '16px' }} className="number-latin">
                                      {g.subscription_valid_until ? new Date(g.subscription_valid_until).toLocaleDateString('en-GB') : '—'}
                                    </td>
                                    <td style={{ padding: '16px' }} className="number-latin">
                                      {activeMembersCount} / {g.max_members}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                      <span className={`status-pill ${g.status === 'Available' ? 'paid' : g.status === 'Full' ? 'suspended' : 'expired'
                                        }`}>
                                        <span>{
                                          g.status === 'Available' ? 'متاح' : g.status === 'Full' ? 'ممتلئ' : g.status === 'Expired' ? 'منتهي' : 'ملغى'
                                        }</span>
                                      </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                          onClick={() => {
                                            setEditingItem(g);
                                            setFormFields({
                                              email: g.email,
                                              plan_id: g.plan_id,
                                              twofa_secret: g.twofa_secret,
                                              subscription_valid_until: g.subscription_valid_until ? g.subscription_valid_until.substring(0, 10) : '',
                                              max_members: g.max_members,
                                              status: g.status,
                                              notes: g.notes || ''
                                            });
                                          }}
                                          className="admin-table-action-btn"
                                        >
                                          <Edit2 size={12} />
                                          <span>تعديل</span>
                                        </button>
                                        <button
                                          onClick={() => handleDeleteGmailAccount(g.id)}
                                          className="admin-table-action-btn delete"
                                        >
                                          <Trash2 size={12} />
                                          <span>حذف</span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                  لا توجد حسابات Gmail مطابقة لمعايير البحث.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeTab === 'users' && (
                      <table className="admin-table">
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>المستخدم</th>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>رقم الهاتف المسجل</th>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ التسجيل</th>
                            <th style={{ padding: '16px', color: 'var(--text)' }}>الرتبة</th>
                            <th style={{ padding: '16px', color: 'var(--text)', textAlign: 'center' }}>العمليات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map((u) => (
                              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  {u.avatar_url ? (
                                    <img src={u.avatar_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                  ) : (
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                                      {(u.full_name || u.email || '?')[0].toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>{u.full_name || 'بدون اسم'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                  </div>
                                </td>
                                <td style={{ padding: '16px' }} className="number-latin">{u.phone || 'غير متوفر'}</td>
                                <td style={{ padding: '16px' }} className="number-latin">{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
                                <td style={{ padding: '16px' }}>
                                  <span className={`status-pill ${u.is_admin ? 'awaiting_payment' : 'expired'}`}>
                                    {u.is_admin ? <Shield size={12} /> : <User size={12} />}
                                    <span>{u.is_admin ? 'مدير النظام' : 'عميل'}</span>
                                  </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <button
                                      onClick={() => handleToggleAdmin(u)}
                                      className={`admin-table-action-btn ${u.is_admin ? 'delete' : 'success'}`}
                                    >
                                      {u.is_admin ? <X size={12} /> : <Check size={12} />}
                                      <span>{u.is_admin ? 'إلغاء صلاحية مدير' : 'جعل كمدير للنظام'}</span>
                                    </button>
                                  </div>
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



                    {/* TAB 5: PRODUCTS */}
                    {activeTab === 'products' && (
                      <table className="admin-table">
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.12)', background: 'rgba(30, 41, 59, 0.45)' }}>
                            <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textAlign: 'right' }}>المنتج</th>
                            <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textAlign: 'right' }}>المعرّف (Slug)</th>
                            <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textAlign: 'right' }}>الوصف</th>
                            <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textAlign: 'right' }}>الحالة</th>
                            <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textAlign: 'center' }}>العمليات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const filtered = productsList.filter(p => {
                              const q = searchTerm.trim().toLowerCase();
                              return !q || p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
                            });
                            if (filtered.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                    <ShoppingBag size={32} style={{ color: '#475569', marginBottom: '12px' }} />
                                    <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>لا توجد منتجات مطابقة للبحث.</div>
                                  </td>
                                </tr>
                              );
                            }
                            return filtered.map((p) => (
                              <tr key={p.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }} className="transition-colors hover:bg-slate-800/20">
                                <td style={{ padding: '14px 16px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{
                                      width: '36px',
                                      height: '36px',
                                      borderRadius: '10px',
                                      background: 'rgba(99, 102, 241, 0.15)',
                                      color: '#818cf8',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}>
                                      <ShoppingBag size={17} />
                                    </span>
                                    <span style={{ fontWeight: 800, color: '#f8fafc' }}>{p.name}</span>
                                  </div>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                  <code style={{
                                    background: 'rgba(30, 41, 59, 0.6)',
                                    border: '1px solid rgba(148, 163, 184, 0.15)',
                                    borderRadius: '6px',
                                    padding: '4px 8px',
                                    fontSize: '0.75rem',
                                    color: '#a78bfa',
                                    fontFamily: 'monospace'
                                  }}>
                                    {p.slug}
                                  </code>
                                </td>
                                <td style={{ padding: '14px 16px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#94a3b8', fontSize: '0.82rem' }}>
                                  {p.description}
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                  <span
                                    className="status-pill"
                                    style={{
                                      background: p.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                                      color: p.is_active ? '#34d399' : '#cbd5e1',
                                      border: p.is_active ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(148, 163, 184, 0.2)',
                                      padding: '4px 10px',
                                      borderRadius: '20px',
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      width: 'fit-content'
                                    }}
                                  >
                                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: p.is_active ? '#10b981' : '#94a3b8' }}></span>
                                    {p.is_active ? 'نشط' : 'معطّل'}
                                  </span>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <button
                                      onClick={() => { setEditingItem(p); setIsAdding(false); setFormFields(p); }}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '6px 12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        border: '1px solid rgba(148, 163, 184, 0.15)',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        color: '#cbd5e1',
                                        transition: 'all 0.2s'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                        e.currentTarget.style.color = '#f8fafc';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                        e.currentTarget.style.color = '#cbd5e1';
                                      }}
                                    >
                                      <Edit2 size={12} />
                                      <span>تعديل</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(p.id)}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '6px 12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        border: '1px solid rgba(239, 68, 68, 0.15)',
                                        background: 'rgba(239, 68, 68, 0.05)',
                                        color: '#f87171',
                                        transition: 'all 0.2s'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                        e.currentTarget.style.color = '#fca5a5';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                                        e.currentTarget.style.color = '#f87171';
                                      }}
                                    >
                                      <Trash2 size={12} />
                                      <span>حذف</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    )}

                    {/* TAB 6: PLANS */}
                    {activeTab === 'plans' && (
                      <div>
                        <table className="admin-table">
                          <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                              <th style={{ padding: '16px', color: 'var(--text)' }}>الباقة</th>
                              <th style={{ padding: '16px', color: 'var(--text)' }}>المنتج</th>
                              <th style={{ padding: '16px', color: 'var(--text)' }}>المدة</th>
                              <th style={{ padding: '16px', color: 'var(--text)' }}>السعر المحلي</th>
                              <th style={{ padding: '16px', color: 'var(--text)' }}>شارة الباقة</th>
                              <th style={{ padding: '16px', color: 'var(--text)' }}>الحالة</th>
                              <th style={{ padding: '16px', color: 'var(--text)', textAlign: 'center' }}>العمليات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.values(plans).length > 0 ? (
                              Object.values(plans).map((p: any) => {
                                const prod = productsList.find(pr => pr.id === p.product_id);
                                return (
                                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text)' }}>{p.name} {p.is_featured && <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>(مميزة)</span>}</td>
                                    <td style={{ padding: '16px' }}>{prod?.name || 'غير معروف'}</td>
                                    <td style={{ padding: '16px' }} className="number-latin">{p.duration_months} شهر</td>
                                    <td style={{ padding: '16px' }}><span className="number-latin">{p.price_iqd.toLocaleString('en-US')}</span> د.ع</td>
                                    <td style={{ padding: '16px' }}>{p.badge || '-'}</td>
                                    <td style={{ padding: '16px' }}>
                                      <span className={`status-pill ${p.is_active ? 'paid' : 'rejected'}`}>
                                        {p.is_active ? <Check size={12} /> : <X size={12} />}
                                        <span>{p.is_active ? 'نشطة' : 'معطلة'}</span>
                                      </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                          onClick={() => { setEditingItem(p); setIsAdding(false); setFormFields(p); }}
                                          className="admin-table-action-btn"
                                        >
                                          <Edit2 size={12} />
                                          <span>تعديل</span>
                                        </button>
                                        <button
                                          onClick={() => handleDeletePlan(p.id)}
                                          className="admin-table-action-btn delete"
                                        >
                                          <Trash2 size={12} />
                                          <span>حذف</span>
                                        </button>
                                      </div>
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
                        {faqsList.length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                            {[...faqsList]
                              .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                              .map((f) => (
                                <div
                                  key={f.id}
                                  className="glass-panel"
                                  style={{
                                    borderRadius: '16px',
                                    border: '1px solid rgba(148, 163, 184, 0.12)',
                                    background: 'rgba(30, 41, 59, 0.4)',
                                    padding: '20px',
                                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.15)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '180px',
                                    gap: '12px'
                                  }}
                                >
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <span style={{
                                          width: '32px',
                                          height: '32px',
                                          borderRadius: '8px',
                                          background: 'rgba(99, 102, 241, 0.15)',
                                          color: '#818cf8',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          flexShrink: 0,
                                          marginTop: '2px'
                                        }}>
                                          <HelpCircle size={16} />
                                        </span>
                                        <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.4 }}>
                                          {f.question}
                                        </h3>
                                      </div>
                                      <span
                                        className="status-pill"
                                        style={{
                                          background: f.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                                          color: f.is_active ? '#34d399' : '#cbd5e1',
                                          border: f.is_active ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(148, 163, 184, 0.2)',
                                          padding: '4px 10px',
                                          borderRadius: '20px',
                                          fontSize: '0.72rem',
                                          fontWeight: 800,
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          height: 'fit-content',
                                          whiteSpace: 'nowrap'
                                        }}
                                      >
                                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: f.is_active ? '#10b981' : '#94a3b8' }}></span>
                                        {f.is_active ? 'نشط' : 'معطّل'}
                                      </span>
                                    </div>
                                    <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.6', marginTop: '12px', whiteSpace: 'pre-wrap' }}>
                                      {f.answer}
                                    </p>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(148, 163, 184, 0.1)', paddingTop: '12px', marginTop: 'auto' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                                      الترتيب: <span className="number-latin" style={{ fontWeight: 800, color: '#94a3b8' }}>{f.display_order}</span>
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <button
                                        onClick={() => { setEditingItem(f); setIsAdding(false); setFormFields(f); }}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          padding: '6px 12px',
                                          fontSize: '0.75rem',
                                          fontWeight: 800,
                                          borderRadius: '8px',
                                          cursor: 'pointer',
                                          border: '1px solid rgba(148, 163, 184, 0.15)',
                                          background: 'rgba(255, 255, 255, 0.03)',
                                          color: '#cbd5e1',
                                          transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                          e.currentTarget.style.color = '#f8fafc';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                          e.currentTarget.style.color = '#cbd5e1';
                                        }}
                                      >
                                        <Edit2 size={12} />
                                        <span>تعديل</span>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteFaq(f.id)}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          padding: '6px 12px',
                                          fontSize: '0.75rem',
                                          fontWeight: 800,
                                          borderRadius: '8px',
                                          cursor: 'pointer',
                                          border: '1px solid rgba(239, 68, 68, 0.15)',
                                          background: 'rgba(239, 68, 68, 0.05)',
                                          color: '#f87171',
                                          transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                          e.currentTarget.style.color = '#fca5a5';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                                          e.currentTarget.style.color = '#f87171';
                                        }}
                                      >
                                        <Trash2 size={12} />
                                        <span>حذف</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: '#64748b',
                            background: 'rgba(30, 41, 59, 0.2)',
                            borderRadius: '16px',
                            border: '1px dashed rgba(148, 163, 184, 0.12)'
                          }}>
                            <HelpCircle size={32} style={{ color: '#475569', marginBottom: '12px' }} />
                            <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>لا توجد أسئلة شائعة مسجلة.</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 8: TESTIMONIALS */}
                    {activeTab === 'testimonials' && (
                      <div>
                        <table className="admin-table">
                          <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                              <th style={{ padding: '16px', color: 'var(--text)' }}>العميل</th>
                              <th style={{ padding: '16px', color: 'var(--text)' }}>التقييم</th>
                              <th style={{ padding: '16px', color: 'var(--text)' }}>التعليق</th>
                              <th style={{ padding: '16px', color: 'var(--text)' }}>الترتيب</th>
                              <th style={{ padding: '16px', color: 'var(--text)', textAlign: 'center' }}>العمليات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {testimonialsList.length > 0 ? (
                              testimonialsList.map((t) => (
                                <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                  <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text)' }}>{t.name}</td>
                                  <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      {Array.from({ length: 5 }).map((_, idx) => (
                                        <Star
                                          key={idx}
                                          size={14}
                                          fill={idx < t.rating ? '#fbbf24' : 'transparent'}
                                          color={idx < t.rating ? '#fbbf24' : 'var(--text-muted)'}
                                        />
                                      ))}
                                    </div>
                                  </td>
                                  <td style={{ padding: '16px' }}>
                                    <div style={{ maxWidth: '420px', whiteSpace: 'normal', wordBreak: 'break-word', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                      {t.comment}
                                    </div>
                                  </td>
                                  <td style={{ padding: '16px' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', background: 'var(--background-alt)', border: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 800 }} className="number-latin">
                                      {t.display_order}
                                    </span>
                                  </td>
                                  <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                      <button
                                        onClick={() => { setEditingItem(t); setIsAdding(false); setFormFields(t); }}
                                        className="admin-table-action-btn"
                                      >
                                        <Edit2 size={12} />
                                        <span>تعديل</span>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTestimonial(t.id)}
                                        className="admin-table-action-btn delete"
                                      >
                                        <Trash2 size={12} />
                                        <span>حذف</span>
                                      </button>
                                    </div>
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


                  </div> {/* Close admin-table-wrapper */}
                </div> {/* Close admin-table-container */}
              </>
            )}
          </div> {/* Close admin-content */}
        </div> {/* Close admin-layout */}

      </main>

      {/* CRUD Form Modal */}
      {(isAdding || editingItem) && (
        <div className="admin-modal-overlay" onClick={() => { setIsAdding(false); setEditingItem(null); }}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <style>{`
              .redesign-input {
                width: 100% !important;
                padding: 12px 16px !important;
                background: rgba(30, 41, 59, 0.45) !important;
                border: 1px solid rgba(148, 163, 184, 0.18) !important;
                border-radius: 12px !important;
                color: #f8fafc !important;
                font-size: 0.85rem !important;
                outline: none !important;
                transition: all 0.2s !important;
              }
              .redesign-input:focus {
                border-color: #818cf8 !important;
                background: rgba(30, 41, 59, 0.6) !important;
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2) !important;
              }
              /* Hide spinner arrows on number inputs */
              .redesign-input::-webkit-outer-spin-button,
              .redesign-input::-webkit-inner-spin-button {
                -webkit-appearance: none !important;
                margin: 0 !important;
              }
              .redesign-input[type=number] {
                -moz-appearance: textfield !important;
              }
              .redesign-panel {
                background: rgba(30, 41, 59, 0.4) !important;
                border: 1px solid rgba(148, 163, 184, 0.18) !important;
                border-radius: 12px !important;
              }
              .redesign-label {
                display: flex !important;
                align-items: center !important;
                gap: 6px !important;
                margin-bottom: 8px !important;
                font-size: 0.82rem !important;
                font-weight: 700 !important;
                color: #cbd5e1 !important;
              }
              .redesign-btn-primary {
                padding: 10px 24px !important;
                border-radius: 12px !important;
                font-size: 0.85rem !important;
                font-weight: 800 !important;
                cursor: pointer !important;
                background: #4f46e5 !important;
                border: 1px solid #4f46e5 !important;
                color: #ffffff !important;
                box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25) !important;
                transition: all 0.2s !important;
              }
              .redesign-btn-primary:hover {
                background: #4338ca !important;
                border-color: #4338ca !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35) !important;
              }
              .redesign-btn-outline {
                padding: 10px 24px !important;
                border-radius: 12px !important;
                font-size: 0.85rem !important;
                font-weight: 800 !important;
                cursor: pointer !important;
                background: transparent !important;
                border: 1px solid rgba(148, 163, 184, 0.25) !important;
                color: #cbd5e1 !important;
                transition: all 0.2s !important;
              }
              .redesign-btn-outline:hover {
                background: rgba(255, 255, 255, 0.05) !important;
                color: #f8fafc !important;
                border-color: rgba(148, 163, 184, 0.4) !important;
              }
            `}</style>
            <button
              onClick={() => { setIsAdding(false); setEditingItem(null); }}
              style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'var(--text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              title="إغلاق"
            >
              <X size={18} />
            </button>
            <h3 style={{ marginBottom: '20px', color: 'var(--text)', fontWeight: 800 }}>
              {activeTab === 'testimonials'
                ? (editingItem ? 'تعديل التقييم' : 'إضافة رأي عميل')
                : activeTab === 'faqs'
                ? (editingItem ? 'تعديل السؤال' : 'إضافة سؤال شائع')
                : activeTab === 'products'
                ? (editingItem ? 'تعديل المنتج' : 'إضافة منتج جديد')
                : activeTab === 'plans'
                ? (editingItem ? 'تعديل الباقة' : 'إضافة باقة جديدة')
                : (editingItem ? 'تعديل البيانات' : 'إضافة سجل جديد')}
            </h3>
            {activeTab === 'products' && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-12px', marginBottom: '20px' }}>
                المنتجات تضم الباقات المعروضة على الموقع
              </p>
            )}
            {activeTab === 'plans' && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-12px', marginBottom: '20px' }}>
                حدّد المنتج، المدة، والأسعار
              </p>
            )}

            {activeTab === 'products' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>


                <div>
                  <label className="redesign-label">
                    <ShoppingBag size={14} style={{ color: '#818cf8' }} />
                    <span>اسم المنتج</span>
                  </label>
                  <input
                    type="text" value={formFields.name || ''}
                    onChange={e => setFormFields({ ...formFields, name: e.target.value })}
                    className="redesign-input"
                    placeholder="مثال: Google AI Pro"
                    dir="auto"
                  />
                </div>
                <div>
                  <label className="redesign-label">
                    <Settings size={14} style={{ color: '#818cf8' }} />
                    <span>المعرّف الفريد (Slug)</span>
                  </label>
                  <input
                    type="text" value={formFields.slug || ''}
                    onChange={e => setFormFields({ ...formFields, slug: e.target.value })}
                    className="redesign-input"
                    placeholder="google-ai-pro"
                    dir="ltr"
                  />
                  <span style={{ display: 'block', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    يُستخدم في روابط الموقع، بالإنجليزية فقط.
                  </span>
                </div>
                <div>
                  <label className="redesign-label">
                    <MessageSquare size={14} style={{ color: '#818cf8' }} />
                    <span>الوصف</span>
                  </label>
                  <textarea
                    value={formFields.description || ''}
                    onChange={e => setFormFields({ ...formFields, description: e.target.value })}
                    className="redesign-input"
                    placeholder="وصف مختصر للمنتج ومزاياه..."
                    dir="auto"
                    style={{
                      minHeight: '90px',
                      resize: 'vertical',
                      lineHeight: '1.6'
                    }}
                  />
                </div>
                <div>
                  <div className="redesign-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1' }}>نشط ومتاح للعامة</span>
                    <button
                      type="button"
                      onClick={() => setFormFields({ ...formFields, is_active: !(formFields.is_active ?? true) })}
                      style={{
                        position: 'relative',
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        background: (formFields.is_active ?? true) ? '#4f46e5' : 'rgba(71, 85, 105, 0.6)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        padding: 0
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        right: (formFields.is_active ?? true) ? '2px' : 'calc(100% - 22px)',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'right 0.2s, left 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {(formFields.is_active ?? true) && <Check size={12} style={{ color: '#4f46e5' }} />}
                      </div>
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid rgba(148, 163, 184, 0.18)', paddingTop: '16px' }}>
                  <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="redesign-btn-outline">إلغاء</button>
                  <button onClick={handleSaveProduct} className="redesign-btn-primary">{editingItem ? "حفظ التعديلات" : "إضافة المنتج"}</button>
                </div>
              </div>
            )}

            {activeTab === 'plans' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>


                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="redesign-label">
                      <ShoppingBag size={14} style={{ color: '#818cf8' }} />
                      <span>المنتج التابع له</span>
                    </label>
                    <select
                      value={formFields.product_id || ''}
                      onChange={e => setFormFields({ ...formFields, product_id: e.target.value })}
                      className="redesign-input"
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">اختر المنتج...</option>
                      {productsList.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="redesign-label">
                      <Activity size={14} style={{ color: '#818cf8' }} />
                      <span>الترتيب في العرض</span>
                    </label>
                    <input
                      type="number" value={formFields.display_order ?? 0}
                      onChange={e => setFormFields({ ...formFields, display_order: Number(e.target.value) })}
                      className="redesign-input number-latin"
                    />
                  </div>
                </div>

                <div>
                  <label className="redesign-label">
                    <Sparkles size={14} style={{ color: '#818cf8' }} />
                    <span>اسم الباقة</span>
                  </label>
                  <input
                    type="text" value={formFields.name || ''}
                    onChange={e => setFormFields({ ...formFields, name: e.target.value })}
                    className="redesign-input"
                    placeholder="مثال: باقة 12 شهراً"
                    dir="auto"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="redesign-label">
                      <Clock size={14} style={{ color: '#818cf8' }} />
                      <span>المدة بالأشهر</span>
                    </label>
                    <input
                      type="number" value={formFields.duration_months || ''}
                      onChange={e => setFormFields({ ...formFields, duration_months: Number(e.target.value) })}
                      className="redesign-input number-latin"
                    />
                  </div>
                  <div>
                    <label className="redesign-label">
                      <Sparkles size={14} style={{ color: '#818cf8' }} />
                      <span>شارة العرض (اختياري)</span>
                    </label>
                    <input
                      type="text" value={formFields.badge || ''}
                      onChange={e => setFormFields({ ...formFields, badge: e.target.value })}
                      className="redesign-input"
                      placeholder="أفضل قيمة"
                      dir="auto"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="redesign-label">
                      <Coins size={14} style={{ color: '#818cf8' }} />
                      <span>السعر المحلي (د.ع)</span>
                    </label>
                    <input
                      type="text"
                      value={formatNumberWithCommas(formFields.price_iqd)}
                      onChange={e => {
                        const cleanVal = e.target.value.replace(/,/g, '').replace(/\D/g, '');
                        setFormFields({ ...formFields, price_iqd: cleanVal });
                      }}
                      className="redesign-input number-latin"
                    />
                  </div>
                  <div>
                    <label className="redesign-label">
                      <Coins size={14} style={{ color: '#818cf8' }} />
                      <span>السعر الرسمي (د.ع)</span>
                    </label>
                    <input
                      type="text"
                      value={formatNumberWithCommas(formFields.official_price_iqd)}
                      onChange={e => {
                        const cleanVal = e.target.value.replace(/,/g, '').replace(/\D/g, '');
                        setFormFields({ ...formFields, official_price_iqd: cleanVal });
                      }}
                      className="redesign-input number-latin"
                      placeholder="اختياري — يُعرض مشطوباً"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="redesign-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px', height: '44px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1' }}>باقة مميزة</span>
                    <button
                      type="button"
                      onClick={() => setFormFields({ ...formFields, is_featured: !(formFields.is_featured ?? false) })}
                      style={{
                        position: 'relative',
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        background: (formFields.is_featured ?? false) ? '#4f46e5' : 'rgba(71, 85, 105, 0.6)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        padding: 0
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        right: (formFields.is_featured ?? false) ? '2px' : 'calc(100% - 22px)',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'right 0.2s, left 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {(formFields.is_featured ?? false) && <Check size={12} style={{ color: '#4f46e5' }} />}
                      </div>
                    </button>
                  </div>
                  <div className="redesign-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px', height: '44px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1' }}>نشطة ومتاحة</span>
                    <button
                      type="button"
                      onClick={() => setFormFields({ ...formFields, is_active: !(formFields.is_active ?? true) })}
                      style={{
                        position: 'relative',
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        background: (formFields.is_active ?? true) ? '#4f46e5' : 'rgba(71, 85, 105, 0.6)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        padding: 0
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        right: (formFields.is_active ?? true) ? '2px' : 'calc(100% - 22px)',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'right 0.2s, left 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {(formFields.is_active ?? true) && <Check size={12} style={{ color: '#4f46e5' }} />}
                      </div>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid rgba(148, 163, 184, 0.18)', paddingTop: '16px' }}>
                  <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="redesign-btn-outline">إلغاء</button>
                  <button onClick={handleSavePlan} className="redesign-btn-primary">{editingItem ? "حفظ التعديلات" : "إضافة الباقة"}</button>
                </div>
              </div>
            )}

            {activeTab === 'faqs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>


                <div>
                  <label className="redesign-label">
                    <MessageSquare size={14} style={{ color: '#818cf8' }} />
                    <span>السؤال</span>
                  </label>
                  <input
                    type="text" value={formFields.question || ''}
                    onChange={e => setFormFields({ ...formFields, question: e.target.value })}
                    className="redesign-input"
                    placeholder="اكتب السؤال..."
                    dir="auto"
                  />
                </div>
                <div>
                  <label className="redesign-label">
                    <Sparkles size={14} style={{ color: '#818cf8' }} />
                    <span>الإجابة</span>
                  </label>
                  <textarea
                    value={formFields.answer || ''}
                    onChange={e => setFormFields({ ...formFields, answer: e.target.value })}
                    className="redesign-input"
                    placeholder="اكتب الإجابة التفصيلية..."
                    dir="auto"
                    style={{
                      minHeight: '120px',
                      resize: 'vertical',
                      lineHeight: '1.6'
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'end' }}>
                  <div>
                    <label className="redesign-label">
                      <Activity size={14} style={{ color: '#818cf8' }} />
                      <span>ترتيب العرض</span>
                    </label>
                    <input
                      type="number" value={formFields.display_order ?? 0}
                      onChange={e => setFormFields({ ...formFields, display_order: Number(e.target.value) })}
                      className="redesign-input number-latin"
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', height: '44px', paddingBottom: '4px' }}>
                    <div className="redesign-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px', height: '44px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1' }}>نشط</span>
                      <button
                        type="button"
                        onClick={() => setFormFields({ ...formFields, is_active: !(formFields.is_active ?? true) })}
                        style={{
                          position: 'relative',
                          width: '44px',
                          height: '24px',
                          borderRadius: '12px',
                          background: (formFields.is_active ?? true) ? '#4f46e5' : 'rgba(71, 85, 105, 0.6)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          padding: 0
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '2px',
                          right: (formFields.is_active ?? true) ? '2px' : 'calc(100% - 22px)',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#ffffff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          transition: 'right 0.2s, left 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {(formFields.is_active ?? true) && <Check size={12} style={{ color: '#4f46e5' }} />}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid rgba(148, 163, 184, 0.18)', paddingTop: '16px' }}>
                  <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="redesign-btn-outline">إلغاء</button>
                  <button onClick={handleSaveFaq} className="redesign-btn-primary">{editingItem ? "حفظ" : "إضافة"}</button>
                </div>
              </div>
            )}

            {activeTab === 'testimonials' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>


                <div>
                  <label className="redesign-label">
                    <User size={14} style={{ color: '#818cf8' }} />
                    <span>اسم العميل</span>
                  </label>
                  <input
                    type="text" value={formFields.name || ''}
                    onChange={e => setFormFields({ ...formFields, name: e.target.value })}
                    className="redesign-input"
                    placeholder="اسم العميل"
                    dir="auto"
                  />
                </div>
                <div>
                  <label className="redesign-label">
                    <Star size={14} style={{ color: '#818cf8' }} />
                    <span>التقييم</span>
                  </label>
                  <div className="redesign-panel" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px',
                    width: '100%'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', direction: 'ltr' }}>
                      {[1, 2, 3, 4, 5].map((star) => {
                        const ratingValue = formFields.rating ?? 5;
                        const isFilled = star <= ratingValue;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormFields({ ...formFields, rating: star })}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '2px',
                              color: isFilled ? '#fbbf24' : 'rgba(71, 85, 105, 0.4)',
                              transition: 'transform 0.15s, color 0.15s',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <Star 
                              size={28} 
                              fill={isFilled ? '#fbbf24' : 'rgba(71, 85, 105, 0.4)'} 
                              stroke={isFilled ? '#d97706' : 'rgba(148, 163, 184, 0.5)'} 
                              style={{
                                filter: isFilled ? 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.4))' : 'none'
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#818cf8' }} className="number-latin">
                      {(formFields.rating ?? 5) === 5 ? 'ممتاز (5 / 5)' :
                       (formFields.rating ?? 5) === 4 ? 'جيد جداً (4 / 5)' :
                       (formFields.rating ?? 5) === 3 ? 'جيد (3 / 5)' :
                       (formFields.rating ?? 5) === 2 ? 'مقبول (2 / 5)' : 'ضعيف (1 / 5)'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="redesign-label">
                    <MessageSquare size={14} style={{ color: '#818cf8' }} />
                    <span>التعليق</span>
                  </label>
                  <textarea
                    value={formFields.comment || ''}
                    onChange={e => setFormFields({ ...formFields, comment: e.target.value })}
                    className="redesign-input"
                    placeholder="رأي العميل..."
                    dir="auto"
                    style={{
                      minHeight: '110px',
                      resize: 'vertical',
                      lineHeight: '1.6'
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'end' }}>
                  <div>
                    <label className="redesign-label">
                      <Activity size={14} style={{ color: '#818cf8' }} />
                      <span>ترتيب العرض</span>
                    </label>
                    <input
                      type="number" value={formFields.display_order ?? 0}
                      onChange={e => setFormFields({ ...formFields, display_order: Number(e.target.value) })}
                      className="redesign-input number-latin"
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', height: '44px', paddingBottom: '4px' }}>
                    <div className="redesign-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px', height: '44px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1' }}>نشط</span>
                      <button
                        type="button"
                        onClick={() => setFormFields({ ...formFields, is_active: !(formFields.is_active ?? true) })}
                        style={{
                          position: 'relative',
                          width: '44px',
                          height: '24px',
                          borderRadius: '12px',
                          background: (formFields.is_active ?? true) ? '#4f46e5' : 'rgba(71, 85, 105, 0.6)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          padding: 0
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '2px',
                          right: (formFields.is_active ?? true) ? '2px' : 'calc(100% - 22px)',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#ffffff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          transition: 'right 0.2s, left 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {(formFields.is_active ?? true) && <Check size={12} style={{ color: '#4f46e5' }} />}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid rgba(148, 163, 184, 0.18)', paddingTop: '16px' }}>
                  <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="redesign-btn-outline">إلغاء</button>
                  <button onClick={handleSaveTestimonial} className="redesign-btn-primary">{editingItem ? "حفظ" : "إضافة"}</button>
                </div>
              </div>
            )}

            {activeTab === 'gmail_accounts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="admin-form-label">البريد الإلكتروني للـ Gmail</label>
                  <input
                    type="email" value={formFields.email || ''}
                    onChange={e => setFormFields({ ...formFields, email: e.target.value })}
                    className="admin-input-text"
                    dir="auto"
                    placeholder="example@gmail.com"
                  />
                </div>
                <div>
                  <label className="admin-form-label">الباقة المرتبطة</label>
                  <select
                    value={formFields.plan_id || ''}
                    onChange={e => setFormFields({ ...formFields, plan_id: e.target.value })}
                    className="admin-input-text"
                  >
                    <option value="">اختر الباقة...</option>
                    {Object.values(plans).map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="admin-form-label">2FA Secret (مفتاح المصادقة الثنائية)</label>
                  <input
                    type="text" value={formFields.twofa_secret || ''}
                    onChange={e => {
                      const sanitized = e.target.value.replace(/\s/g, '').toUpperCase();
                      setFormFields({ ...formFields, twofa_secret: sanitized });
                    }}
                    className="admin-input-text"
                    placeholder="Base32 Key"
                  />
                </div>
                <div>
                  <label className="admin-form-label">صلاحية الاشتراك (اختياري)</label>
                  <input
                    type="date"
                    value={formFields.subscription_valid_until ? formFields.subscription_valid_until.substring(0, 10) : ''}
                    onChange={e => setFormFields({ ...formFields, subscription_valid_until: e.target.value })}
                    className="admin-input-text"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <label className="admin-form-label">حالة الحساب</label>
                  <select
                    value={formFields.status || 'Available'}
                    onChange={e => setFormFields({ ...formFields, status: e.target.value })}
                    className="admin-input-text"
                  >
                    <option value="Available">متاح</option>
                    <option value="Full">ممتلئ</option>
                    <option value="Expired">منتهي</option>
                    <option value="Disabled">ملغى</option>
                  </select>
                </div>
                <div>
                  <label className="admin-form-label">ملاحظات إضافية (اختياري)</label>
                  <textarea
                    value={formFields.notes || ''}
                    onChange={e => setFormFields({ ...formFields, notes: e.target.value })}
                    className="admin-input-text"
                    dir="auto"
                    style={{ minHeight: '60px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button onClick={handleSaveGmailAccount} className="btn btn-primary" style={{ padding: '8px 20px' }}>حفظ</button>
                  <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="btn btn-outline" style={{ padding: '8px 20px' }}>إلغاء</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {snackbar && (
        <div
          dir="rtl"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 18px',
            borderRadius: '16px',
            background: 'var(--surface-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: snackbar.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
            boxShadow: snackbar.type === 'success'
              ? '0 10px 30px rgba(0, 0, 0, 0.25), 0 0 20px rgba(34, 197, 94, 0.1)'
              : '0 10px 30px rgba(0, 0, 0, 0.25), 0 0 20px rgba(239, 68, 68, 0.1)',
            animation: 'slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            minWidth: '280px',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: snackbar.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: snackbar.type === 'success' ? '#4ade80' : '#f87171',
                flexShrink: 0
              }}
            >
              {snackbar.type === 'success' ? (
                <Check size={18} />
              ) : (
                <X size={18} />
              )}
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>
              {snackbar.message}
            </span>
          </div>

          <button
            onClick={() => setSnackbar(null)}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background 0.2s, color 0.2s',
              marginRight: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmConfig.isOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '30px' }}>
            <button
              onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'var(--text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              title="إلغاء"
            >
              <X size={16} />
            </button>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              marginBottom: '20px'
            }}>
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ marginBottom: '12px', color: 'var(--text)', fontWeight: 800, fontSize: '1.2rem' }}>
              {confirmConfig.title}
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
              {confirmConfig.message}
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                إلغاء
              </button>
              <button
                onClick={confirmConfig.onConfirm}
                style={{
                  background: 'var(--danger)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Assign Gmail Account to Order Modal */}
      {assigningOrder && (
        <div className="admin-modal-overlay" onClick={() => setAssigningOrder(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setAssigningOrder(null)}
              style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'var(--text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              title="إغلاق"
            >
              <X size={18} />
            </button>
            <h3 style={{ marginBottom: '16px', color: 'var(--text)', fontWeight: 800 }}>
              تنشيط وتعيين حساب Gmail للطلب
            </h3>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              اختر أحد الحسابات المتوافقة مع باقة <strong>{plans[assigningOrder.plan_id]?.name}</strong> (أو باقة أعلى لنفس المنتج) لإضافة العميل إليها:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label className="admin-form-label">حساب Gmail للمشاركة</label>
                <select
                  id="assign-gmail-select"
                  className="admin-input-text"
                  defaultValue=""
                >
                  <option value="">بدون تعيين حساب (تنشيط فقط)...</option>
                  {gmailAccountsList
                    .filter(g => {
                      const accountPlan = plans[g.plan_id];
                      const orderPlan = plans[assigningOrder.plan_id];
                      return accountPlan && orderPlan && 
                             accountPlan.product_id === orderPlan.product_id && 
                             accountPlan.duration_months >= orderPlan.duration_months;
                    })
                    .map(g => {
                      const currentCount = subscriptions.filter(s => s.gmail_account_id === g.id && s.status === 'active').length;
                      const slotsLeft = g.max_members - currentCount;
                      return (
                        <option key={g.id} value={g.id} disabled={g.status !== 'Available' || slotsLeft <= 0}>
                          {g.email} ({g.status === 'Available' ? 'متاح' : g.status === 'Full' ? 'ممتلئ' : g.status === 'Expired' ? 'منتهي' : 'ملغى'}) - المتبقي: {slotsLeft} مقاعد
                        </option>
                      );
                    })}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setAssigningOrder(null)}
                className="btn btn-secondary"
                style={{ padding: '8px 16px' }}
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  const selectEl = document.getElementById('assign-gmail-select') as HTMLSelectElement;
                  const val = selectEl?.value || null;
                  handleApproveOrderWithAccount(assigningOrder, val);
                }}
                className="btn btn-primary"
                style={{ padding: '8px 16px' }}
              >
                تنشيط وتفعيل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Gmail Account to Subscription Modal */}
      {assigningSub && (
        <div className="admin-modal-overlay" onClick={() => setAssigningSub(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setAssigningSub(null)}
              style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'var(--text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              title="إغلاق"
            >
              <X size={18} />
            </button>
            <h3 style={{ marginBottom: '16px', color: 'var(--text)', fontWeight: 800 }}>
              تعديل حساب Gmail للاشتراك
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              تعديل أو تعيين حساب Gmail المرتبط باشتراك العميل:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label className="admin-form-label">حساب Gmail للمشاركة</label>
                <select
                  id="reassign-gmail-select"
                  className="admin-input-text"
                  defaultValue={assigningSub.gmail_account_id || ""}
                >
                  <option value="">إزالة تعيين الحساب...</option>
                  {gmailAccountsList
                    .filter(g => {
                      const accountPlan = plans[g.plan_id];
                      const subPlan = plans[assigningSub.plan_id];
                      return accountPlan && subPlan && 
                             accountPlan.product_id === subPlan.product_id && 
                             accountPlan.duration_months >= subPlan.duration_months;
                    })
                    .map(g => {
                      const currentCount = subscriptions.filter(s => s.gmail_account_id === g.id && s.status === 'active').length;
                      const slotsLeft = g.max_members - currentCount;
                      return (
                        <option key={g.id} value={g.id} disabled={g.id !== assigningSub.gmail_account_id && (g.status !== 'Available' || slotsLeft <= 0)}>
                          {g.email} ({g.status === 'Available' ? 'متاح' : g.status === 'Full' ? 'ممتلئ' : g.status === 'Expired' ? 'منتهي' : 'ملغى'}) - المتبقي: {slotsLeft} مقاعد
                        </option>
                      );
                    })}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setAssigningSub(null)}
                className="btn btn-secondary"
                style={{ padding: '8px 16px' }}
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  const selectEl = document.getElementById('reassign-gmail-select') as HTMLSelectElement;
                  const val = selectEl?.value || null;
                  handleAssignGmailAccountToSubscription(assigningSub.id, val);
                  setAssigningSub(null);
                }}
                className="btn btn-primary"
                style={{ padding: '8px 16px' }}
              >
                تحديث
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gmail Account Details Modal */}
      {selectedGmailAccountDetails && (
        <div className="admin-modal-overlay" onClick={() => setSelectedGmailAccountDetails(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '700px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedGmailAccountDetails(null)}
              style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'var(--text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              title="إغلاق"
            >
              <X size={18} />
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: 'var(--text)', fontWeight: 800 }}>تفاصيل حساب Gmail للمشاركة</h3>
            </div>

            {/* Premium Email Banner */}
            <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>البريد الإلكتروني للـ Gmail</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '1.35rem', color: 'var(--text)', letterSpacing: '0.5px', fontFamily: 'monospace' }} className="number-latin">
                  {selectedGmailAccountDetails.email}
                </strong>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedGmailAccountDetails.email);
                    showSnackbar('تم نسخ البريد الإلكتروني (Email copied).', 'success');
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', border: '1px solid var(--border)' }}
                >
                  <Copy size={14} />
                  <span>نسخ البريد</span>
                </button>
              </div>
            </div>

            {/* Grid Layout for details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              
              {/* Column 1: 2FA Authentication Card */}
              <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>رمز الـ 2FA المؤقت (TOTP)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <Clock size={14} style={{ color: 'var(--success)' }} />
                      <span className="number-latin" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {30 - (Math.floor(Date.now() / 1000) % 30)}s
                      </span>
                    </div>
                    <strong className="number-latin" style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1.6rem', color: 'var(--success)', letterSpacing: '2px', whiteSpace: 'nowrap' }}>
                      {(() => {
                        const otp = generateTOTP(selectedGmailAccountDetails.twofa_secret);
                        return otp.length === 6 ? `${otp.substring(0, 3)} ${otp.substring(3)}` : otp;
                      })()}
                    </strong>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      const otp = generateTOTP(selectedGmailAccountDetails.twofa_secret);
                      navigator.clipboard.writeText(otp);
                      showSnackbar('تم نسخ رمز 2FA (2FA code copied).', 'success');
                    }}
                    className="admin-table-action-btn success"
                    style={{ padding: '8px 12px', fontSize: '0.8rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Copy size={12} /> نسخ الرمز
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedGmailAccountDetails.twofa_secret);
                      showSnackbar('تم نسخ المفتاح السري (2FA Secret copied).', 'success');
                    }}
                    className="admin-table-action-btn"
                    style={{ padding: '8px 12px', fontSize: '0.8rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Copy size={12} /> نسخ Secret
                  </button>
                </div>
              </div>

              {/* Column 2: Plan, Expiry, Status, capacity */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Row 1: Plan and Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>الباقة</span>
                    <strong style={{ display: 'block', fontSize: '0.95rem', marginTop: '2px', color: 'var(--text)' }}>
                      {plans[selectedGmailAccountDetails.plan_id]?.name || 'غير معروف'}
                    </strong>
                  </div>
                  <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>الحالة</span>
                    <div style={{ marginTop: '4px' }}>
                      <span className={`status-pill ${selectedGmailAccountDetails.status === 'Available' ? 'paid' : 'expired'}`} style={{ display: 'inline-flex', padding: '2px 8px', fontSize: '0.75rem' }}>
                        {selectedGmailAccountDetails.status === 'Available' ? 'متاح' :
                         selectedGmailAccountDetails.status === 'Full' ? 'ممتلئ' :
                         selectedGmailAccountDetails.status === 'Expired' ? 'منتهي' : 'ملغى'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 2: Expiration and Members count */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>انتهاء الصلاحية</span>
                    <strong style={{ display: 'block', fontSize: '0.95rem', marginTop: '2px', color: 'var(--text)' }} className="number-latin">
                      {selectedGmailAccountDetails.subscription_valid_until ? new Date(selectedGmailAccountDetails.subscription_valid_until).toLocaleDateString('en-GB') : '—'}
                    </strong>
                  </div>
                  <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>المشتركون الحاليون</span>
                    <strong style={{ display: 'block', fontSize: '0.95rem', marginTop: '2px', color: 'var(--text)' }} className="number-latin">
                      {subscriptions.filter(s => s.gmail_account_id === selectedGmailAccountDetails.id && s.status === 'active').length} / {selectedGmailAccountDetails.max_members}
                    </strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Notes Section (if exists) */}
            {selectedGmailAccountDetails.notes && (
              <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.01)', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ملاحظات الحساب</span>
                <p style={{ color: 'var(--text)', fontSize: '0.9rem', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }} dir="auto">
                  {selectedGmailAccountDetails.notes}
                </p>
              </div>
            )}

            <div>
              <h4 style={{ color: 'var(--text)', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>العملاء النشطون المشتركون بالحساب</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                      <th style={{ padding: '10px 16px', fontSize: '0.8rem' }}>اسم العميل</th>
                      <th style={{ padding: '10px 16px', fontSize: '0.8rem' }}>البريد الإلكتروني للعميل</th>
                      <th style={{ padding: '10px 16px', fontSize: '0.8rem' }}>رقم الهاتف</th>
                      <th style={{ padding: '10px 16px', fontSize: '0.8rem' }}>تاريخ تفعيل الاشتراك</th>
                      <th style={{ padding: '10px 16px', fontSize: '0.8rem' }}>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.filter(s => s.gmail_account_id === selectedGmailAccountDetails.id).length > 0 ? (
                      subscriptions
                        .filter(s => s.gmail_account_id === selectedGmailAccountDetails.id)
                        .map(sub => {
                          const profileObj = users.find(u => u.id === sub.user_id);
                          return (
                            <tr key={sub.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                              <td style={{ padding: '10px 16px' }}>{profileObj?.full_name || 'غير معروف'}</td>
                              <td style={{ padding: '10px 16px' }} className="number-latin">{profileObj?.email || '—'}</td>
                              <td style={{ padding: '10px 16px' }} className="number-latin">{profileObj?.phone || '—'}</td>
                              <td style={{ padding: '10px 16px' }} className="number-latin">{new Date(sub.start_date).toLocaleDateString('en-GB')}</td>
                              <td style={{ padding: '10px 16px' }}>
                                <span className={`status-pill ${sub.status === 'active' ? 'paid' : 'expired'}`} style={{ fontSize: '0.7rem' }}>
                                  {sub.status === 'active' ? 'نشط' : 'منتهي'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          لا يوجد عملاء معينين على هذا الحساب حالياً.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- Smooth Path Helper for SVG Charts ---------- */
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/* ---------- Sparkline Component ---------- */
const Sparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = "#6366f1" }) => {
  const id = useId().replace(/:/g, "");
  const W = 100;
  const H = 32;
  const pad = 3;
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1 || 1)) * (W - pad * 2) + pad,
    y: H - pad - ((v - min) / range) * (H - pad * 2),
  }));
  const line = buildSmoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id={`sp-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sp-${id})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/* ---------- AreaChart Component ---------- */
const AreaChart: React.FC<{ data: number[]; labels?: string[]; color?: string }> = ({
  data,
  labels,
  color = "#6366f1",
}) => {
  const id = useId().replace(/:/g, "");
  const W = 320;
  const H = 130;
  const padY = 12;
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1) * 1.15;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1 || 1)) * W,
    y: H - padY - (v / max) * (H - padY * 2),
  }));
  const line = buildSmoothPath(pts);
  const area = `${line} L ${W} ${H} L 0 ${H} Z`;

  return (
    <div style={{ width: "100%" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: 160 }}
      >
        <defs>
          <linearGradient id={`ar-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1="0"
            x2={W}
            y1={H * g}
            y2={H * g}
            stroke="rgba(148, 163, 184, 0.15)"
            strokeWidth={1}
            strokeDasharray="3 5"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={area} fill={`url(#ar-${id})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === pts.length - 1 ? 4 : 0}
            fill={color}
            stroke="white"
            strokeWidth={2}
          />
        ))}
      </svg>
      {labels && (
        <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between", padding: "0 2px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>
          {labels.map((l, i) => (
            <span key={i} className="number-latin">{l}</span>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- BarChart Component ---------- */
const BarChart: React.FC<{
  data: number[];
  labels?: string[];
  formatValue?: (n: number) => string;
}> = ({ data, labels, formatValue }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  return (
    <div style={{ width: "100%" }}>
      <div style={{ height: "144px", display: "flex", alignItems: "end", justifyContent: "space-between", gap: "8px" }}>
        {data.map((v, i) => (
          <div key={i} style={{ display: "flex", height: "100%", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "end", gap: "6px" }} className="group">
            <span
              style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)", transition: "opacity 0.2s" }}
              className="opacity-0 group-hover:opacity-100 number-latin"
            >
              {formatValue ? formatValue(v) : v}
            </span>
            <div style={{ display: "flex", width: "100%", maxWidth: "36px", flex: 1, alignItems: "end" }}>
              <div
                style={{
                  width: "100%",
                  height: `${Math.max((v / max) * 100, 3)}%`,
                  background: "linear-gradient(to top, #6366f1 0%, #a78bfa 100%)",
                  borderRadius: "8px 8px 0 0",
                  transition: "all 0.5s ease"
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {labels && (
        <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between", padding: "0 2px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>
          {labels.map((l, i) => (
            <span key={i} style={{ flex: 1, textAlign: "center" }}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- DonutChart Component ---------- */
const DonutChart: React.FC<{
  segments: { label: string; value: number; color: string }[];
  center?: React.ReactNode;
}> = ({ segments, center }) => {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 42;
  const C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ position: "relative", width: "160px", height: "160px", flexShrink: 0 }}>
      <svg viewBox="0 0 120 120" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth="13"
        />
        {segments.map((s, i) => {
          const len = (s.value / total) * C;
          const offset = -acc;
          acc += len;
          return (
            <circle
              key={i}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="13"
              strokeLinecap="round"
              strokeDasharray={`${Math.max(len - 2, 0)} ${C}`}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
          );
        })}
      </svg>
      {center && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {center}
        </div>
      )}
    </div>
  );
};

export default Admin;
