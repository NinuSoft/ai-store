import React from 'react';
import { X, Check, ShoppingBag, Settings, MessageSquare, Clock, Sparkles, Coins, Star, User, Mail, Shield, Activity } from 'lucide-react';
import type { Plan, AdminTab } from '../types';

interface CrudFormModalProps {
  activeTab: AdminTab;
  isAdding: boolean;
  editingItem: any;
  formFields: any;
  setFormFields: (fields: any) => void;
  setIsAdding: (val: boolean) => void;
  setEditingItem: (item: any) => void;
  productsList: any[];
  plans: Record<string, Plan>;
  handleSaveProduct: () => Promise<void>;
  handleSavePlan: () => Promise<void>;
  handleSaveFaq: () => Promise<void>;
  handleSaveTestimonial: () => Promise<void>;
  handleSaveGmailAccount: () => Promise<void>;
}

export const CrudFormModal: React.FC<CrudFormModalProps> = ({
  activeTab,
  isAdding,
  editingItem,
  formFields,
  setFormFields,
  setIsAdding,
  setEditingItem,
  productsList,
  plans,
  handleSaveProduct,
  handleSavePlan,
  handleSaveFaq,
  handleSaveTestimonial,
  handleSaveGmailAccount
}) => {
  if (!isAdding && !editingItem) return null;

  return (
    <div className="admin-modal-overlay" onClick={() => { setIsAdding(false); setEditingItem(null); }}>
      <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
        <style>{`
          .redesign-input {
            width: 100% !important;
            padding: 12px 16px !important;
            background: var(--glass-nested-bg) !important;
            border: 1px solid var(--glass-nested-border) !important;
            border-radius: 12px !important;
            color: var(--text) !important;
            font-size: 0.85rem !important;
            outline: none !important;
            transition: all 0.2s !important;
          }
          .redesign-input:focus {
            border-color: #818cf8 !important;
            background: var(--glass-nested-bg) !important;
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2) !important;
          }
          .redesign-input::-webkit-outer-spin-button,
          .redesign-input::-webkit-inner-spin-button {
            -webkit-appearance: none !important;
            margin: 0 !important;
          }
          .redesign-input[type=number] {
            -moz-appearance: textfield !important;
          }
          .redesign-panel {
            background: var(--glass-nested-bg) !important;
            border: 1px solid var(--glass-nested-border) !important;
            border-radius: 12px !important;
          }
          .redesign-label {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            margin-bottom: 8px !important;
            font-size: 0.82rem !important;
            font-weight: 700 !important;
            color: var(--text-secondary) !important;
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
            border: 1px solid var(--glass-border) !important;
            color: var(--text-secondary) !important;
            transition: all 0.2s !important;
          }
          .redesign-btn-outline:hover {
            background: var(--glass-hover-bg) !important;
            color: var(--text) !important;
            border-color: rgba(99, 102, 241, 0.35) !important;
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
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)' }}>نشط ومتاح للعامة</span>
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
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--glass-nested-border)', paddingTop: '16px' }}>
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
                  value={formFields.price_iqd !== undefined ? Number(String(formFields.price_iqd).replace(/,/g, '')).toLocaleString('en-US') : ''}
                  onChange={e => {
                    const clean = e.target.value.replace(/,/g, '').replace(/\D/g, '');
                    setFormFields({ ...formFields, price_iqd: clean ? parseInt(clean) : '' });
                  }}
                  className="redesign-input number-latin"
                  placeholder="15,000"
                />
              </div>
              <div>
                <label className="redesign-label">
                  <Coins size={14} style={{ color: '#818cf8' }} />
                  <span>السعر الرسمي (د.ع) (اختياري)</span>
                </label>
                <input
                  type="text"
                  value={formFields.official_price_iqd ? Number(String(formFields.official_price_iqd).replace(/,/g, '')).toLocaleString('en-US') : ''}
                  onChange={e => {
                    const clean = e.target.value.replace(/,/g, '').replace(/\D/g, '');
                    setFormFields({ ...formFields, official_price_iqd: clean ? parseInt(clean) : '' });
                  }}
                  className="redesign-input number-latin"
                  placeholder="280,000"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="redesign-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px', height: '44px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)' }}>باقة مميزة</span>
                <button
                  type="button"
                  onClick={() => setFormFields({ ...formFields, is_featured: !(formFields.is_featured ?? false) })}
                  style={{
                    position: 'relative',
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: formFields.is_featured ? '#4f46e5' : 'rgba(71, 85, 105, 0.6)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    padding: 0
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    right: formFields.is_featured ? '2px' : 'calc(100% - 22px)',
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
                    {formFields.is_featured && <Check size={12} style={{ color: '#4f46e5' }} />}
                  </div>
                </button>
              </div>
              <div className="redesign-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px', height: '44px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)' }}>نشطة ومتاحة</span>
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

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--glass-nested-border)', paddingTop: '16px' }}>
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
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)' }}>نشط</span>
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
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--glass-nested-border)', paddingTop: '16px' }}>
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
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)' }}>نشط</span>
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
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--glass-nested-border)', paddingTop: '16px' }}>
              <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="redesign-btn-outline">إلغاء</button>
              <button onClick={handleSaveTestimonial} className="redesign-btn-primary">{editingItem ? "حفظ" : "إضافة"}</button>
            </div>
          </div>
        )}

        {activeTab === 'gmail_accounts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="redesign-label">
                <Mail size={14} style={{ color: '#818cf8' }} />
                <span>البريد الإلكتروني للـ Gmail</span>
              </label>
              <input
                type="email" value={formFields.email || ''}
                onChange={e => setFormFields({ ...formFields, email: e.target.value })}
                className="redesign-input"
                dir="auto"
                placeholder="example@gmail.com"
              />
            </div>
            <div>
              <label className="redesign-label">
                <ShoppingBag size={14} style={{ color: '#818cf8' }} />
                <span>الباقة المرتبطة</span>
              </label>
              <select
                value={formFields.plan_id || ''}
                onChange={e => setFormFields({ ...formFields, plan_id: e.target.value })}
                className="redesign-input"
              >
                <option value="">اختر الباقة...</option>
                {Object.values(plans).map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="redesign-label">
                <Shield size={14} style={{ color: '#818cf8' }} />
                <span>2FA Secret (مفتاح المصادقة الثنائية)</span>
              </label>
              <input
                type="text" value={formFields.twofa_secret || ''}
                onChange={e => {
                  const sanitized = e.target.value.replace(/\s/g, '').toUpperCase();
                  setFormFields({ ...formFields, twofa_secret: sanitized });
                }}
                className="redesign-input"
                placeholder="Base32 Key"
              />
            </div>
            <div>
              <label className="redesign-label">
                <Clock size={14} style={{ color: '#818cf8' }} />
                <span>صلاحية الاشتراك (اختياري)</span>
              </label>
              <input
                type="date"
                value={formFields.subscription_valid_until ? formFields.subscription_valid_until.substring(0, 10) : ''}
                onChange={e => setFormFields({ ...formFields, subscription_valid_until: e.target.value })}
                className="redesign-input"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label className="redesign-label">
                <Activity size={14} style={{ color: '#818cf8' }} />
                <span>حالة الحساب</span>
              </label>
              <select
                value={formFields.status || 'Available'}
                onChange={e => setFormFields({ ...formFields, status: e.target.value })}
                className="redesign-input"
              >
                <option value="Available">متاح</option>
                <option value="Full">ممتلئ</option>
                <option value="Expired">منتهي</option>
                <option value="Disabled">ملغى</option>
              </select>
            </div>
            <div>
              <label className="redesign-label">
                <MessageSquare size={14} style={{ color: '#818cf8' }} />
                <span>ملاحظات إضافية (اختياري)</span>
              </label>
              <textarea
                value={formFields.notes || ''}
                onChange={e => setFormFields({ ...formFields, notes: e.target.value })}
                className="redesign-input"
                dir="auto"
                style={{ minHeight: '70px', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--glass-nested-border)', paddingTop: '16px' }}>
              <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="redesign-btn-outline">إلغاء</button>
              <button onClick={handleSaveGmailAccount} className="redesign-btn-primary">حفظ</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
