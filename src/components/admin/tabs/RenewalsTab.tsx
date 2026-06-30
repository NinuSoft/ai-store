import React from 'react';
import { Check, Clock, X } from 'lucide-react';
import type { Renewal, UserProfile } from '../types';

interface RenewalsTabProps {
  filteredRenewals: Renewal[];
  users: UserProfile[];
  onApproveRenewal: (renewal: Renewal) => void;
  onRejectRenewal: (renewalId: string) => void;
  getUserDisplayName: (userId: string) => string;
}

export const RenewalsTab: React.FC<RenewalsTabProps> = ({
  filteredRenewals,
  users,
  onApproveRenewal,
  onRejectRenewal,
  getUserDisplayName
}) => {
  return (
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
                          onClick={() => onApproveRenewal(r)}
                          className="admin-table-action-btn success"
                        >
                          <Check size={12} />
                          <span>تمديد وتجديد</span>
                        </button>
                        <button
                          onClick={() => onRejectRenewal(r.id)}
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
  );
};
