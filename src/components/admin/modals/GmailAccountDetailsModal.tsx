import React from 'react';
import { X, Clock, Copy } from 'lucide-react';
import { generateTOTP } from '../../../utils/totp';
import type { Plan, Subscription, GmailAccount, UserProfile } from '../types';

interface GmailAccountDetailsModalProps {
  selectedGmailAccountDetails: GmailAccount | null;
  setSelectedGmailAccountDetails: (gmail: GmailAccount | null) => void;
  plans: Record<string, Plan>;
  subscriptions: Subscription[];
  users: UserProfile[];
  showSnackbar: (msg: string, type?: 'success' | 'error') => void;
}

export const GmailAccountDetailsModal: React.FC<GmailAccountDetailsModalProps> = ({
  selectedGmailAccountDetails,
  setSelectedGmailAccountDetails,
  plans,
  subscriptions,
  users,
  showSnackbar
}) => {
  if (!selectedGmailAccountDetails) return null;

  return (
    <div className="admin-modal-overlay" onClick={() => setSelectedGmailAccountDetails(null)}>
      <div className="admin-modal-card" style={{ maxWidth: '700px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setSelectedGmailAccountDetails(null)}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--text)', fontWeight: 800 }}>تفاصيل حساب Gmail للمشاركة</h3>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>البريد الإلكتروني للـ Gmail</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: '1.35rem', color: 'var(--text)', letterSpacing: '0.5px', fontFamily: 'monospace' }} className="number-latin">
              {selectedGmailAccountDetails.email}
            </strong>
            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedGmailAccountDetails.email);
                showSnackbar('تم نسخ البريد الإلكتروني (Email copied).', 'success');
              }}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', border: '1px solid var(--border)' }}
            >
              <Copy size={14} />
              <span>نسخ البريد</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>رمز الـ 2FA المؤقت (TOTP)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <Clock size={14} style={{ color: 'var(--success)' }} />
                  <span className="number-latin" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {30 - (Math.floor(Date.now() / 1000) % 30)}s
                  </span>
                </div>
                <strong className="number-latin" style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1.6rem', color: 'var(--success)', letterSpacing: '2px', whiteSpace: 'nowrap' }}>
                  {(() => {
                    const otp = generateTOTP(selectedGmailAccountDetails.twofa_secret);
                    return otp.length === 6 ? `${otp.substring(0, 3)} ${otp.substring(3)}` : otp;
                  })()}
                </strong>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  const otp = generateTOTP(selectedGmailAccountDetails.twofa_secret);
                  navigator.clipboard.writeText(otp);
                  showSnackbar('تم نسخ رمز 2FA (2FA code copied).', 'success');
                }}
                className="admin-table-action-btn success"
                style={{ padding: '8px 12px', fontSize: '0.8rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Copy size={12} /> نسخ الرمز
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedGmailAccountDetails.twofa_secret);
                  showSnackbar('تم نسخ المفتاح السري (2FA Secret copied).', 'success');
                }}
                className="admin-table-action-btn"
                style={{ padding: '8px 12px', fontSize: '0.8rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Copy size={12} /> نسخ Secret
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>الباقة</span>
                <strong style={{ display: 'block', fontSize: '0.95rem', marginTop: '2px', color: 'var(--text)' }}>
                  {plans[selectedGmailAccountDetails.plan_id]?.name || 'غير معروف'}
                </strong>
              </div>
              <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>الحالة</span>
                <div style={{ marginTop: '4px' }}>
                  <span className={`status-pill ${selectedGmailAccountDetails.status === 'Available' ? 'paid' : 'expired'}`} style={{ display: 'inline-flex', padding: '2px 8px', fontSize: '0.75rem' }}>
                    {selectedGmailAccountDetails.status === 'Available' ? 'متاح' :
                     selectedGmailAccountDetails.status === 'Full' ? 'ممتلئ' :
                     selectedGmailAccountDetails.status === 'Expired' ? 'منتهي' : 'ملغى'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>انتهاء الصلاحية</span>
                <strong style={{ display: 'block', fontSize: '0.95rem', marginTop: '2px', color: 'var(--text)' }} className="number-latin">
                  {selectedGmailAccountDetails.subscription_valid_until ? new Date(selectedGmailAccountDetails.subscription_valid_until).toLocaleDateString('en-GB') : '—'}
                </strong>
              </div>
              <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>المشتركون الحاليون</span>
                <strong style={{ display: 'block', fontSize: '0.95rem', marginTop: '2px', color: 'var(--text)' }} className="number-latin">
                  {subscriptions.filter(s => s.gmail_account_id === selectedGmailAccountDetails.id && s.status === 'active').length} / {selectedGmailAccountDetails.max_members}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {selectedGmailAccountDetails.notes && (
          <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.01)', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ملاحظات الحساب</span>
            <p style={{ color: 'var(--text)', fontSize: '0.9rem', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }} dir="auto">
              {selectedGmailAccountDetails.notes}
            </p>
          </div>
        )}

        <div>
          <h4 style={{ color: 'var(--text)', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>العملاء النشطون المشتركون بالحساب</h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                  <th style={{ padding: '10px 16px', fontSize: '0.8rem' }}>اسم العميل</th>
                  <th style={{ padding: '10px 16px', fontSize: '0.8rem' }}>البريد الإلكتروني للعميل</th>
                  <th style={{ padding: '10px 16px', fontSize: '0.8rem' }}>رقم الهاتف</th>
                  <th style={{ padding: '10px 16px', fontSize: '0.8rem' }}>تاريخ تفعيل الاشتراك</th>
                  <th style={{ padding: '10px 16px', fontSize: '0.8rem' }}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.filter(s => s.gmail_account_id === selectedGmailAccountDetails.id).length > 0 ? (
                  subscriptions
                    .filter(s => s.gmail_account_id === selectedGmailAccountDetails.id)
                    .map(sub => {
                      const profileObj = users.find(u => u.id === sub.user_id);
                      return (
                        <tr key={sub.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                          <td style={{ padding: '10px 16px' }}>{profileObj?.full_name || 'غير معروف'}</td>
                          <td style={{ padding: '10px 16px' }} className="number-latin">{profileObj?.email || '—'}</td>
                          <td style={{ padding: '10px 16px' }} className="number-latin">{profileObj?.phone || '—'}</td>
                          <td style={{ padding: '10px 16px' }} className="number-latin">{new Date(sub.start_date).toLocaleDateString('en-GB')}</td>
                          <td style={{ padding: '10px 16px' }}>
                            <span className={`status-pill ${sub.status === 'active' ? 'paid' : 'expired'}`} style={{ fontSize: '0.7rem' }}>
                              {sub.status === 'active' ? 'نشط' : 'منتهي'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      لا يوجد عملاء معينين على هذا الحساب حالياً.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
