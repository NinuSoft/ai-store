import React from 'react';
import { ShoppingBag, Edit2, Trash2, Check, X, HelpCircle, Star } from 'lucide-react';
import type { Plan } from '../types';

interface CatalogTabsProps {
  activeTab: 'products' | 'plans' | 'faqs' | 'testimonials';
  searchTerm: string;
  productsList: any[];
  plans: Record<string, Plan>;
  faqsList: any[];
  testimonialsList: any[];
  onEdit: (item: any) => void;
  onDeleteProduct: (id: string) => void;
  onDeletePlan: (id: string) => void;
  onDeleteFaq: (id: string) => void;
  onDeleteTestimonial: (id: string) => void;
}

export const CatalogTabs: React.FC<CatalogTabsProps> = ({
  activeTab,
  searchTerm,
  productsList,
  plans,
  faqsList,
  testimonialsList,
  onEdit,
  onDeleteProduct,
  onDeletePlan,
  onDeleteFaq,
  onDeleteTestimonial
}) => {
  // FAQs Tab
  if (activeTab === 'faqs') {
    const filteredFaqs = faqsList.filter(f => {
      const q = searchTerm.trim().toLowerCase();
      return !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    });

    return (
      <div className="animate-slide-up" style={{ width: '100%' }}>
        {filteredFaqs.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
            {[...filteredFaqs]
              .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
              .map((f) => (
                <div
                  key={f.id}
                  className="glass-panel"
                  style={{
                    borderRadius: '16px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
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
                        <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.4 }}>
                          {f.question}
                        </h3>
                      </div>
                      <span
                        className="status-pill"
                        style={{
                          background: f.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                          color: f.is_active ? '#34d399' : 'var(--text-muted)',
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
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.6', marginTop: '12px', whiteSpace: 'pre-wrap' }}>
                      {f.answer}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '12px', marginTop: 'auto' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      الترتيب: <span className="number-latin" style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>{f.display_order}</span>
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => onEdit(f)}
                        className="admin-table-action-btn"
                      >
                        <Edit2 size={12} />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={() => onDeleteFaq(f.id)}
                        className="admin-table-action-btn delete"
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
            background: 'var(--glass-bg)',
            borderRadius: '16px',
            border: '1px dashed var(--glass-border)'
          }}>
            <HelpCircle size={32} style={{ color: '#475569', marginBottom: '12px' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>لا توجد أسئلة شائعة مسجلة.</div>
          </div>
        )}
      </div>
    );
  }

  // Products Tab
  if (activeTab === 'products') {
    const filteredProducts = productsList.filter(p => {
      const q = searchTerm.trim().toLowerCase();
      return !q || p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    });

    return (
      <table className="admin-table">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-nested-bg)' }}>
            <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textAlign: 'right' }}>المنتج</th>
            <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textAlign: 'right' }}>المعرّف (Slug)</th>
            <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textAlign: 'right' }}>الوصف</th>
            <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textAlign: 'right' }}>الحالة</th>
            <th style={{ padding: '14px 16px', fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textAlign: 'center' }}>العمليات</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
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
                    <span style={{ fontWeight: 800, color: 'var(--text)' }}>{p.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <code style={{
                    background: 'var(--glass-nested-bg)',
                    border: '1px solid var(--glass-nested-border)',
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
                      color: p.is_active ? '#34d399' : 'var(--text-muted)',
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
                      onClick={() => onEdit(p)}
                      className="admin-table-action-btn"
                    >
                      <Edit2 size={12} />
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() => onDeleteProduct(p.id)}
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
              <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                <ShoppingBag size={32} style={{ color: '#475569', marginBottom: '12px' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>لا توجد منتجات مطابقة للبحث.</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  // Plans Tab
  if (activeTab === 'plans') {
    const filteredPlans = Object.values(plans).filter((p: any) => {
      const q = searchTerm.trim().toLowerCase();
      return !q || p.name.toLowerCase().includes(q);
    });

    return (
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
          {filteredPlans.length > 0 ? (
            filteredPlans.map((p: any) => {
              const prod = productsList.find(pr => pr.id === p.product_id);
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text)' }}>
                    {p.name} {p.is_featured && <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>(مميزة)</span>}
                  </td>
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
                        onClick={() => onEdit(p)}
                        className="admin-table-action-btn"
                      >
                        <Edit2 size={12} />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={() => onDeletePlan(p.id)}
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
    );
  }

  // Testimonials Tab
  if (activeTab === 'testimonials') {
    const filteredTestimonials = testimonialsList.filter(t => {
      const q = searchTerm.trim().toLowerCase();
      return !q || t.name.toLowerCase().includes(q) || t.comment.toLowerCase().includes(q);
    });

    return (
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
          {filteredTestimonials.length > 0 ? (
            filteredTestimonials.map((t) => (
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
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', background: 'var(--glass-nested-bg)', border: '1px solid var(--glass-nested-border)', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 800 }} className="number-latin">
                    {t.display_order}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={() => onEdit(t)}
                      className="admin-table-action-btn"
                    >
                      <Edit2 size={12} />
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() => onDeleteTestimonial(t.id)}
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
    );
  }

  return null;
};
