import React from 'react';
import { Edit2, ShieldAlert, Play, RotateCw } from 'lucide-react';
import type { Subscription, Plan, GmailAccount } from '../types';

interface SubscriptionsTabProps {
  filteredSubscriptions: Subscription[];
  plans: Record<string, Plan>;
  gmailAccountsList: GmailAccount[];
  onOpenReassignModal: (sub: Subscription) => void;
  onToggleSuspend: (sub: Subscription) => void;
  suspendingSub: string | null;
  getUserDisplayName: (userId: string) => string;
}

export const SubscriptionsTab: React.FC<SubscriptionsTabProps> = ({
  filteredSubscriptions,
  plans,
  gmailAccountsList,
  onOpenReassignModal,
  onToggleSuspend,
  suspendingSub,
  getUserDisplayName
}) => {
  return (
    <table className="admin-table">
      <thead>
        <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
          <th style={{ padding: '16px', color: 'var(--text)' }}>حساب العميل</th>
          <th style={{ padding: '16px', color: 'var(--text)' }}>حساب المشاركة المعين</th>
          <th style={{ padding: '16px', color: 'var(--text)' }}>الباقة المفعلة</th>
          <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ البدء</th>
          <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ الانتهاء (الضمان)</th>
          <th style={{ padding: '16px', color: 'var(--text)' }}>الحالة</th>
          <th style={{ padding: '16px', color: 'var(--text)', textAlign: 'center' }}>العمليات</th>
        </tr>
      </thead>
      <tbody>
        {filteredSubscriptions.length > 0 ? (
          filteredSubscriptions.map((s) => (
            <tr key={s.id} style={{ borderBottom: '1px solid var(--border)', background: s.status === 'suspended' ? 'rgba(239, 68, 68, 0.02)' : 'none' }}>
              <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text)' }}>{getUserDisplayName(s.user_id)}</td>
              <td style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="number-latin" style={{ fontSize: '0.85rem' }}>
                    {gmailAccountsList.find(g => g.id === s.gmail_account_id)?.email || 'غير معين'}
                  </span>
                  <button
                    onClick={() => onOpenReassignModal(s)}
                    className="admin-table-action-btn"
                    style={{ padding: '4px 6px' }}
                    title="تغيير الحساب المعين"
                  >
                    <Edit2 size={10} />
                  </button>
                </div>
              </td>
              <td style={{ padding: '16px' }}>{plans[s.plan_id]?.name || 'غير معروف'}</td>
              <td style={{ padding: '16px' }} className="number-latin">{new Date(s.start_date).toLocaleDateString('en-GB')}</td>
              <td style={{ padding: '16px' }} className="number-latin">
                <span style={{ color: new Date(s.end_date) < new Date() ? '#f87171' : 'inherit' }}>
                  {new Date(s.end_date).toLocaleDateString('en-GB')}
                </span>
              </td>
              <td style={{ padding: '16px' }}>
                <span className={`status-pill ${s.status === 'active' ? 'paid' : s.status === 'suspended' ? 'suspended' : 'expired'}`}>
                  <span>{s.status === 'active' ? 'نشط (مفعل)' : s.status === 'suspended' ? 'معلق مؤقتاً' : 'منتهي الصلاحية'}</span>
                </span>
              </td>
              <td style={{ padding: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    onClick={() => onToggleSuspend(s)}
                    disabled={suspendingSub === s.id}
                    className={`admin-table-action-btn ${s.status === 'suspended' ? 'success' : 'delete'}`}
                    style={{ minWidth: '120px' }}
                  >
                    {suspendingSub === s.id ? (
                      <RotateCw size={12} className="animate-spin" />
                    ) : s.status === 'suspended' ? (
                      <Play size={12} />
                    ) : (
                      <ShieldAlert size={12} />
                    )}
                    <span>{s.status === 'suspended' ? 'إعادة التفعيل' : 'تعليق الضمان'}</span>
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد اشتراكات تطابق معايير البحث.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
