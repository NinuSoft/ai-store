import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

const defaultFaqs: FAQItem[] = [
  {
    question: 'هل يجب الدفع قبل التفعيل؟',
    answer: 'لا، نقوم بتفعيل الاشتراك أولاً على حسابك الشخصي، ثم تدفع لاحقاً بعد التأكد من وصول كامل المزايا ونماذج Gemini Advanced إلى بريدك.',
    category: 'الدفع'
  },
  {
    question: 'كيف أتأكد من نجاح التفعيل؟',
    answer: 'بمجرد التنشيط، ستظهر لك علامة Gemini Advanced ومساحة التخزين الإضافية 2TB مباشرة في حساب جوجل وجيميل الخاص بك. يمكنك تجربتها والتأكد بنفسك قبل تحويل أي مبلغ.',
    category: 'التفعيل'
  },
  {
    question: 'لماذا تقدمون خدمة التفعيل قبل الدفع؟',
    answer: 'لبناء الثقة التامة مع عملائنا في العراق، وتوفير تجربة شراء شفافة وآمنة تضمن حقوقك كاملة وتزيل أي شكوك أو مخاوف.',
    category: 'عام'
  },
  {
    question: 'هل الحساب رسمي 100%؟',
    answer: 'نعم، تفعيل رسمي 100% على حسابك الشخصي ببريد Gmail الخاص بك، وبشكل قانوني تماماً دون أي مخاطرة.',
    category: 'الأمان'
  },
  {
    question: 'هل أحتاج إلى VPN لتشغيل الخدمة في العراق؟',
    answer: 'لا، الخدمة تعمل بشكل طبيعي ومستقر في العراق ومتاحة باللغة العربية والإنجليزية دون الحاجة لتشغيل أي VPN.',
    category: 'عام'
  },
  {
    question: 'كم يستغرق تفعيل الاشتراك بعد الطلب؟',
    answer: 'يتم تفعيل الاشتراك بسرعة فائقة، وعادة ما يستغرق التفعيل من 15 دقيقة إلى ساعتين كحد أقصى بعد إرسال الطلب وتأكيده.',
    category: 'التفعيل'
  },
  {
    question: 'هل يمكنني تجديد اشتراكي الحالي لاحقاً؟',
    answer: 'نعم، يمكنك تجديد الاشتراك بسهولة من خلال لوحة التحكم الخاصة بك، أو بطلب تجديد الباقة وسيتم تمديدها تلقائياً دون فقدان بياناتك.',
    category: 'عام'
  },
  {
    question: 'هل يعمل على الهاتف والكمبيوتر في نفس الوقت؟',
    answer: 'نعم، يمكنك استخدام اشتراك Google AI Pro على جميع أجهزتك بما فيها الهاتف (Android/iOS) والكمبيوتر والأجهزة اللوحية بدون أي مشاكل.',
    category: 'عام'
  },
  {
    question: 'هل سأحصل على جميع مزايا Google AI Pro؟',
    answer: 'نعم، ستحصل على كامل المزايا الرسمية بما في ذلك نموذج Gemini 1.5 Pro الأكثر ذكاءً، ومساحة تخزين 2 تيرابايت في Google One، ودمج الذكاء الاصطناعي في Gmail وDocs وSlides.',
    category: 'المزايا'
  },
  {
    question: 'كيف تتم عملية الدفع داخل العراق؟',
    answer: 'نوفر طرق دفع محلية سهلة: زين كاش (Zain Cash)، آسيا حوالة، الطيف، بالإضافة إلى البطاقات الائتمانية والماستر كارد.',
    category: 'الدفع'
  },
  {
    question: 'هل أحتاج لمشاركة كلمة مرور Gmail؟',
    answer: 'لا، نحن لا نطلب كلمة مرور حسابك أبداً. نقوم بإرسال دعوة تفعيل رسمية إلى بريدك الإلكتروني وتقوم بقبولها بنفسك.',
    category: 'الأمان'
  },
  {
    question: 'هل الاشتراك شخصي أم مشترك؟',
    answer: 'الاشتراك شخصي وخاص بك بالكامل. لا أحد يشاركك حسابك أو ملفاتك أو محادثاتك مع الذكاء الاصطناعي.',
    category: 'الأمان'
  },
  {
    question: 'ماذا يحدث لملفاتي بعد انتهاء الاشتراك؟',
    answer: 'تظل جميع ملفاتك محفوظة بشكل آمن لدى جوجل. إذا لم تجدد، سيعود حسابك إلى السعة المجانية دون حذف أي ملفات.',
    category: 'عام'
  },
  {
    question: 'هل يمكنني ترقية الباقة لاحقاً؟',
    answer: 'نعم، يمكنك ترقية باقتك في أي وقت عبر لوحة التحكم أو التواصل مع الدعم الفني، وسنحتسب المدة المتبقية لك.',
    category: 'الباقات'
  },
  {
    question: 'هل الدعم الفني يغطي كامل فترة الاشتراك؟',
    answer: 'نعم، نقدم دعماً فنياً متواصلاً 24/7 عبر واتساب طوال فترة اشتراكك، لمعالجة أي مشكلة فوراً.',
    category: 'الدعم'
  },
  {
    question: 'هل يمكن استخدامه لأغراض تجارية؟',
    answer: 'نعم، الحساب مخصص للاستخدام الشخصي والتجاري والبرمجة وتحليل البيانات وإنشاء الصور وتوليد المحتوى.',
    category: 'عام'
  },
  {
    question: 'هل هذا السعر لمرة واحدة أم يتجدد تلقائياً؟',
    answer: 'الدفع لمرة واحدة فقط. لن يتم خصم أي مبالغ تلقائياً، وسننبهك قبل انتهاء اشتراكك لتحديد رغبتك بالتجديد.',
    category: 'الدفع'
  },
  {
    question: 'هل الخدمة مضمونة وموثوقة في العراق؟',
    answer: 'نعم، نحن أول وأكبر متجر متخصص في العراق لاشتراكات الذكاء الاصطناعي. خدمنا أكثر من 2500 عميل عراقي وحصلنا على تقييم 98% بفضل تفعيلنا السريع وضماننا الكامل.',
    category: 'عام'
  }
];

export const FAQAccordion: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'payment' | 'activation' | 'security' | 'general'>('all');
  const [openQuestion, setOpenQuestion] = useState<string | null>('هل يجب الدفع قبل التفعيل؟');
  const [faqs, setFaqs] = useState<FAQItem[]>(defaultFaqs);

  const getCategoryFromQuestion = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes('دفع') || q.includes('سعر') || q.includes('باقة') || q.includes('بطاق') || q.includes('كاش')) return 'الدفع';
    if (q.includes('تفعيل') || q.includes('تنشيط') || q.includes('وقت') || q.includes('ساعة') || q.includes('ساعات')) return 'التفعيل';
    if (q.includes('أمان') || q.includes('حساب') || q.includes('خصوص') || q.includes('مرور') || q.includes('جيميل') || q.includes('بريد')) return 'الأمان';
    if (q.includes('ميزة') || q.includes('مزايا') || q.includes('دعم') || q.includes('تواصل')) return 'المزايا';
    return 'عام';
  };

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          const mappedFaqs = data.map((item: any) => ({
            question: item.question,
            answer: item.answer,
            category: getCategoryFromQuestion(item.question)
          }));
          setFaqs(mappedFaqs);
        }
      } catch (err) {
        console.error('Error loading FAQs from Supabase:', err);
      }
    };
    fetchFaqs();
  }, []);

  const filteredFaqs = faqs.filter(faq => {
    if (activeTab === 'all') return true;
    if (activeTab === 'payment') return faq.category === 'الدفع' || faq.category === 'الباقات';
    if (activeTab === 'activation') return faq.category === 'التفعيل';
    if (activeTab === 'security') return faq.category === 'الأمان';
    if (activeTab === 'general') return faq.category === 'المزايا' || faq.category === 'الدعم' || faq.category === 'عام';
    return true;
  });

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    // Automatically open the first FAQ in the selected category
    const firstMatch = faqs.find(faq => {
      if (tab === 'all') return faq.question === 'هل يجب الدفع قبل التفعيل؟';
      if (tab === 'payment') return faq.category === 'الدفع' || faq.category === 'الباقات';
      if (tab === 'activation') return faq.category === 'التفعيل';
      if (tab === 'security') return faq.category === 'الأمان';
      if (tab === 'general') return faq.category === 'المزايا' || faq.category === 'الدعم' || faq.category === 'عام';
      return true;
    });
    setOpenQuestion(firstMatch ? firstMatch.question : null);
  };

  const toggleFAQ = (question: string) => {
    setOpenQuestion(openQuestion === question ? null : question);
  };

  const categoryColors: Record<string, string> = {
    'الدفع': '#10b981',     // Emerald
    'التفعيل': '#3b82f6',   // Blue
    'الأمان': '#8b5cf6',    // Violet
    'المزايا': '#06b6d4',    // Cyan
    'الباقات': '#f59e0b',    // Amber
    'الدعم': '#10b981',     // Emerald
    'عام': '#6b7280',       // Gray
  };

  const tabs = [
    { id: 'all', label: 'الكل' },
    { id: 'payment', label: 'الدفع والضمان' },
    { id: 'activation', label: 'طريقة التفعيل' },
    { id: 'security', label: 'الأمان والخصوصية' },
    { id: 'general', label: 'المميزات والدعم' }
  ] as const;

  return (
    <div style={{ width: '100%' }}>

      {/* Category Tabs */}
      <div className="faq-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`faq-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* FAQs List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '820px',
          margin: '0 auto',
        }}
      >
        {filteredFaqs.map((faq, index) => {
          const isOpen = openQuestion === faq.question;
          const catColor = categoryColors[faq.category ?? 'عام'] ?? '#6b7280';

          return (
            <div
              key={index}
              style={{
                borderRadius: '16px',
                border: '1px solid var(--border)',
                borderRight: isOpen ? `4px solid ${catColor}` : '1px solid var(--border)',
                background: isOpen ? 'var(--surface-raised)' : 'var(--surface-glass)',
                boxShadow: isOpen ? 'var(--shadow-lg)' : 'none',
                transform: isOpen ? 'translateY(0)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              }}
              className="group"
            >
              {/* Header / Button */}
              <button
                onClick={() => toggleFAQ(faq.question)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 24px',
                  textAlign: 'right',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {faq.category && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 900,
                        letterSpacing: '0.05em',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        color: catColor,
                        backgroundColor: `${catColor}12`,
                        border: `1px solid ${catColor}20`,
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                    >
                      {faq.category}
                    </span>
                  )}
                  <span 
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: isOpen ? 'var(--text)' : 'var(--text-secondary)',
                      transition: 'color 0.2s ease',
                      lineHeight: '1.4'
                    }}
                  >
                    {faq.question}
                  </span>
                </div>

                {/* Styled chevron button */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isOpen ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.02)',
                    border: isOpen ? '1px solid hsla(237, 90%, 58%, 0.15)' : '1px solid var(--border)',
                    color: isOpen ? 'var(--primary)' : 'var(--text-muted)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isOpen ? 'rotate(-90deg)' : 'rotate(0deg)',
                    marginLeft: '12px',
                    flexShrink: 0
                  }}
                >
                  <ChevronLeft size={16} />
                </div>
              </button>

              {/* Answer body */}
              <div
                style={{
                  maxHeight: isOpen ? '400px' : '0px',
                  opacity: isOpen ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
                }}
              >
                <div 
                  style={{
                    padding: '16px 24px 24px 24px',
                    fontSize: '0.925rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.8',
                    fontWeight: 500,
                    borderTop: '1px solid var(--border)',
                    background: 'rgba(255, 255, 255, 0.005)'
                  }}
                >
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default FAQAccordion;