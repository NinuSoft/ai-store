import React from 'react';
import { X } from 'lucide-react';
import type { Plan, Subscription, GmailAccount } from '../types';

interface ReassignGmailToSubModalProps {
  assigningSub: Subscription | null;
  setAssigningSub: (sub: Subscription | null) => void;
  plans: Record<string, Plan>;
  gmailAccountsList: GmailAccount[];
  subscriptions: Subscription[];
  handleAssignGmailAccountToSubscription: (subId: string, gmailAccountId: string | null) => Promise<void>;
}

export const ReassignGmailToSubModal: React.FC<ReassignGmailToSubModalProps> = ({
  assigningSub,
  setAssigningSub,
  plans,
  gmailAccountsList,
  subscriptions,
  handleAssignGmailAccountToSubscription
}) => {
  if (!assigningSub) return null;

  return (
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
  );
};
