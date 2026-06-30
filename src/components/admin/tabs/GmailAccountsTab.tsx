import React from 'react';
import { Copy, Edit2, Trash2 } from 'lucide-react';
import { generateTOTP } from '../../../utils/totp';
import type { GmailAccount, Subscription, Plan } from '../types';

interface GmailAccountsTabProps {
  filteredGmailAccounts: GmailAccount[];
  subscriptions: Subscription[];
  plans: Record<string, Plan>;
  onSelectDetails: (gmail: GmailAccount) => void;
  onEdit: (gmail: GmailAccount) => void;
  onDelete: (id: string) => void;
  showSnackbar: (msg: string, type?: 'success' | 'error') => void;
}

export const GmailAccountsTab: React.FC<GmailAccountsTabProps> = ({
  filteredGmailAccounts,
  subscriptions,
  plans,
  onSelectDetails,
  onEdit,
  onDelete,
  showSnackbar
}) => {
  return (
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
                  onClick={() => onSelectDetails(g)}
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
                      onClick={() => onEdit(g)}
                      className="admin-table-action-btn"
                    >
                      <Edit2 size={12} />
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() => onDelete(g.id)}
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
  );
};
