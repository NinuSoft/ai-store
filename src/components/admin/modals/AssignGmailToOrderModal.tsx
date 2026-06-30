import React from 'react';
import { X, Mail } from 'lucide-react';
import type { Plan, Order, Subscription, GmailAccount } from '../types';

interface AssignGmailToOrderModalProps {
  assigningOrder: Order | null;
  setAssigningOrder: (order: Order | null) => void;
  plans: Record<string, Plan>;
  gmailAccountsList: GmailAccount[];
  subscriptions: Subscription[];
  handleApproveOrderWithAccount: (order: Order, gmailAccountId: string | null) => Promise<void>;
}

export const AssignGmailToOrderModal: React.FC<AssignGmailToOrderModalProps> = ({
  assigningOrder,
  setAssigningOrder,
  plans,
  gmailAccountsList,
  subscriptions,
  handleApproveOrderWithAccount
}) => {
  if (!assigningOrder) return null;

  return (
    <div className="admin-modal-overlay" onClick={() => setAssigningOrder(null)}>
      <div className="admin-modal-card" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
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
            <label className="redesign-label">
              <Mail size={14} style={{ color: '#818cf8' }} />
              <span>حساب Gmail للمشاركة</span>
            </label>
            <select
              id="assign-gmail-select"
              className="redesign-input"
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

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--glass-nested-border)', paddingTop: '16px' }}>
          <button
            onClick={() => setAssigningOrder(null)}
            className="redesign-btn-outline"
          >
            إلغاء
          </button>
          <button
            onClick={() => {
              const selectEl = document.getElementById('assign-gmail-select') as HTMLSelectElement;
              const val = selectEl?.value || null;
              handleApproveOrderWithAccount(assigningOrder, val);
            }}
            className="redesign-btn-primary"
          >
            تنشيط وتفعيل
          </button>
        </div>
      </div>
    </div>
  );
};
