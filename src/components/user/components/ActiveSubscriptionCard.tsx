import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, AlertCircle, PlusCircle, MessageSquare } from 'lucide-react';
import type { Subscription, Plan } from '../types';

interface ActiveSubscriptionCardProps {
  activeSub: Subscription | undefined;
  plans: Record<string, Plan>;
  daysRemaining: number;
  progressPercent: number;
  submittingRenewal: string | null;
  whatsappNum: string;
  onRequestRenewal: (sub: Subscription) => void;
  getSubscriptionStatusDetails: (sub: Subscription) => { label: string; badgeClass: string };
}

export const ActiveSubscriptionCard: React.FC<ActiveSubscriptionCardProps> = ({
  activeSub,
  plans,
  daysRemaining,
  progressPercent,
  submittingRenewal,
  whatsappNum,
  onRequestRenewal,
  getSubscriptionStatusDetails
}) => {
  return (
    <div className="glass-panel" style={{ border: activeSub ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
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
            <div style={{ background: 'var(--glass-nested-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-nested-border)' }} className="flex items-center gap-3">
              <Clock size={24} style={{ color: '#818cf8' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>الباقة المفعلة</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text)' }}>{plans[activeSub.plan_id]?.name || 'Google AI Pro'}</strong>
              </div>
            </div>

            <div style={{ background: 'var(--glass-nested-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-nested-border)' }} className="flex items-center gap-3">
              <Calendar size={24} style={{ color: '#a78bfa' }} />
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
              <div className="flex items-center gap-2 mt-3" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--danger)' }}>
                <AlertCircle size={16} className="animate-pulse" style={{ color: 'var(--danger)', flexShrink: 0 }} />
                <span>تنبيه: تم تعليق اشتراكك مؤقتاً من قبل الإدارة. يرجى التواصل مع الدعم الفني للاستفسار.</span>
              </div>
            ) : activeSub.status === 'expired' ? (
              <div className="flex items-center gap-2 mt-3" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--danger)' }}>
                <AlertCircle size={16} className="animate-pulse" style={{ color: 'var(--danger)', flexShrink: 0 }} />
                <span>تنبيه: انتهت صلاحية اشتراكك. يرجى طلب تجديد الباقة لتجنب انقطاع الخدمة.</span>
              </div>
            ) : daysRemaining <= 7 ? (
              <div className="flex items-center gap-2 mt-3" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--warning)' }}>
                <AlertCircle size={16} className="animate-pulse" style={{ color: 'var(--warning)', flexShrink: 0 }} />
                <span>تنبيه: قارب اشتراكك على الانتهاء. يرجى طلب تجديد الباقة لتجنب انقطاع الخدمة.</span>
              </div>
            ) : null}
          </div>

          {/* Action row */}
          {activeSub.status === 'expired' && (
            <div className="flex gap-4 mt-2">
              <button 
                onClick={() => onRequestRenewal(activeSub)}
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
  );
};
