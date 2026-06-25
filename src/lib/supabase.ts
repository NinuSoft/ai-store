import { createClient } from '@supabase/supabase-js';

const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are valid URL and keys
const hasCredentials = 
  VITE_SUPABASE_URL && 
  VITE_SUPABASE_URL !== 'YOUR_SUPABASE_URL' && 
  VITE_SUPABASE_ANON_KEY && 
  VITE_SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';

// Default mock data for localStorage if not present
const defaultPlans = [
  { id: 'p1', name: 'Google AI Pro - شهر واحد', duration_months: 1, price_iqd: 20000 },
  { id: 'p2', name: 'Google AI Pro - 3 أشهر', duration_months: 3, price_iqd: 30000 },
  { id: 'p3', name: 'Google AI Pro - 12 شهر', duration_months: 12, price_iqd: 40000 }
];

const defaultTestimonials = [
  { id: 't1', name: 'أحمد الخفاجي', rating: 5, comment: 'خدمة ممتازة وسريعة جداً. تم تفعيل اشتراك Google AI Pro خلال أقل من ساعة. أنصح بالتعامل معهم بشدة!' },
  { id: 't2', name: 'مريم الجبوري', rating: 5, comment: 'كطالبة دراسات عليا، أدوات Gemini Advanced ساعدتني كثيراً في أبحاثي. السعر مناسب جداً مقارنة بالميزات.' },
  { id: 't3', name: 'سيف الدين علي', rating: 5, comment: 'بصفتي مبرمج، أستخدم الذكاء الاصطناعي بشكل يومي. التفعيل رسمي 100% والدعم الفني متعاون جداً عبر واتساب.' },
  { id: 't4', name: 'زينب الربيعي', rating: 5, comment: 'أنصح باشتراك الـ 12 شهراً، هو الأوفر والدفع محلي بالدينار العراقي وهو ما يحل مشكلة كبيرة للكثيرين.' },
  { id: 't5', name: 'مصطفى كمال', rating: 5, comment: 'تفعيل سريع جداً وحساب شخصي بالكامل وليس حساباً مشتركاً. هذا يضمن خصوصية ملفاتي وبياناتي.' },
  { id: 't6', name: 'فاطمة البغدادي', rating: 5, comment: 'أفضل خدمة بيع اشتراكات ذكاء اصطناعي في العراق. الدعم متواجد دائماً للإجابة على أي استفسار.' },
  { id: 't7', name: 'علي الحلفي', rating: 5, comment: 'استخدمه لصناعة المحتوى وكتابة المقالات. أداة جبارة وتفعيل ممتاز بدون الحاجة لأي VPN.' },
  { id: 't8', name: 'نور الهدى', rating: 5, comment: 'شكراً لكم على هذه الخدمة الرائعة. التفعيل تم على حسابي الشخصي ولم أحتاج إلى تغيير أي إعدادات.' },
  { id: 't9', name: 'حيدر الكعبي', rating: 5, comment: 'أفضل قيمة مقابل السعر في السوق العراقي. خدمة عملاء ممتازة ومتابعة مستمرة.' },
  { id: 't10', name: 'سارة التميمي', rating: 5, comment: 'توفير الدفع المحلي هو الميزة الأبرز، التفعيل رسمي ومباشر. تجربة رائعة وسأقوم بالتجديد بكل تأكيد.' }
];

// LocalStorage helpers for mock database
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(item);
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize localStorage databases
if (!hasCredentials) {
  getStorageItem('mock_plans', defaultPlans);
  getStorageItem('mock_testimonials', defaultTestimonials);
  getStorageItem('mock_users', [
    // Pre-seeded Admin account for testing dashboard features out of the box
    { id: 'admin-uuid', email: 'admin@googleai.iq', phone: '07701234567', is_admin: true, created_at: new Date().toISOString() }
  ]);
  getStorageItem('mock_orders', []);
  getStorageItem('mock_subscriptions', []);
  getStorageItem('mock_renewals', []);
}

// -------------------------------------------------------------
// Stateful Mock Supabase Client
// -------------------------------------------------------------
const createMockClient = () => {
  let authListeners: Array<(event: string, session: any) => void> = [];
  let currentUserSession: any = JSON.parse(localStorage.getItem('mock_session') || 'null');

  const triggerAuthChange = (event: string, session: any) => {
    authListeners.forEach(listener => listener(event, session));
  };

  const getTableData = (table: string): any[] => {
    return getStorageItem<any[]>(`mock_${table}`, []);
  };

  const setTableData = (table: string, data: any) => {
    setStorageItem(`mock_${table}`, data);
  };

  return {
    auth: {
      getSession: async () => ({
        data: { session: currentUserSession },
        error: null
      }),
      signInWithOAuth: async ({ provider }: any) => {
        if (provider !== 'google') {
          return { data: null, error: new Error('المزود غير مدعوم') };
        }

        const email = prompt(
          'محاكاة تسجيل الدخول بـ Google:\nيرجى إدخال البريد الإلكتروني (Gmail) لاستخدامه:\n(أدخل admin@googleai.iq لتجربة حساب المدير)',
          'user@gmail.com'
        );

        if (!email) {
          return { data: null, error: new Error('تم إلغاء تسجيل الدخول بـ Google') };
        }

        const users = getTableData('users');
        let user = users.find((u: any) => u.email === email);

        if (!user) {
          user = {
            id: email === 'admin@googleai.iq' ? 'admin-uuid' : Math.random().toString(36).substring(2, 15),
            email,
            phone: '',
            is_admin: email === 'admin@googleai.iq',
            created_at: new Date().toISOString()
          };
          users.push(user);
          setTableData('users', users);
        }

        const session = {
          access_token: 'mock-google-token',
          user: {
            id: user.id,
            email: user.email,
            user_metadata: { phone: user.phone }
          }
        };

        currentUserSession = session;
        localStorage.setItem('mock_session', JSON.stringify(session));
        triggerAuthChange('SIGNED_IN', session);

        return { data: { provider: 'google', url: '#' }, error: null };
      },
      signOut: async () => {
        currentUserSession = null;
        localStorage.removeItem('mock_session');
        triggerAuthChange('SIGNED_OUT', null);
        return { error: null };
      },
      onAuthStateChange: (callback: any) => {
        authListeners.push(callback);
        // Fire initial session status
        callback(currentUserSession ? 'SIGNED_IN' : 'SIGNED_OUT', currentUserSession);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                authListeners = authListeners.filter(l => l !== callback);
              }
            }
          }
        };
      }
    },
    from: (table: string) => {
      const data = getTableData(table);
      let queryResult = [...data];

      const chain = {
        select: (columns: string = '*') => {
          return chain;
        },
        eq: (column: string, value: any) => {
          queryResult = queryResult.filter((item: any) => item[column] === value);
          return chain;
        },
        order: (column: string, { ascending = true } = {}) => {
          queryResult.sort((a: any, b: any) => {
            if (a[column] < b[column]) return ascending ? -1 : 1;
            if (a[column] > b[column]) return ascending ? 1 : -1;
            return 0;
          });
          return chain;
        },
        insert: async (records: any | any[]) => {
          const arr = Array.isArray(records) ? records : [records];
          const updatedTable = getTableData(table);
          
          const newRecords = arr.map((rec: any) => ({
            id: Math.random().toString(36).substring(2, 15),
            created_at: new Date().toISOString(),
            ...rec
          }));

          updatedTable.push(...newRecords);
          setTableData(table, updatedTable);
          return { data: newRecords, error: null };
        },
        update: (updates: any) => {
          return {
            eq: async (column: string, value: any) => {
              const updatedTable = getTableData(table);
              let updatedCount = 0;
              const mapped = updatedTable.map((item: any) => {
                if (item[column] === value) {
                  updatedCount++;
                  return { ...item, ...updates };
                }
                return item;
              });
              setTableData(table, mapped);
              return { data: mapped.filter((item: any) => item[column] === value), error: null };
            }
          };
        },
        // Mimic standard supabase promise resolution
        then: (onfulfilled: any) => {
          // Resolve standard select query response
          return Promise.resolve(onfulfilled({ data: queryResult, error: null }));
        }
      };

      return chain;
    }
  } as any;
};

export const supabase = hasCredentials
  ? createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
  : createMockClient();

export const isMocked = !hasCredentials;
