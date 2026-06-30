import React from 'react';
import { Shield, User, X, Check } from 'lucide-react';
import type { UserProfile } from '../types';

interface UsersTabProps {
  filteredUsers: UserProfile[];
  onToggleAdmin: (user: UserProfile) => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({
  filteredUsers,
  onToggleAdmin
}) => {
  return (
    <table className="admin-table">
      <thead>
        <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
          <th style={{ padding: '16px', color: 'var(--text)' }}>المستخدم</th>
          <th style={{ padding: '16px', color: 'var(--text)' }}>رقم الهاتف المسجل</th>
          <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ التسجيل</th>
          <th style={{ padding: '16px', color: 'var(--text)' }}>الرتبة</th>
          <th style={{ padding: '16px', color: 'var(--text)', textAlign: 'center' }}>العمليات</th>
        </tr>
      </thead>
      <tbody>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u) => (
            <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                    {(u.full_name || u.email || '?')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>{u.full_name || 'بدون اسم'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                </div>
              </td>
              <td style={{ padding: '16px' }} className="number-latin">{u.phone || 'غير متوفر'}</td>
              <td style={{ padding: '16px' }} className="number-latin">{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
              <td style={{ padding: '16px' }}>
                <span className={`status-pill ${u.is_admin ? 'awaiting_payment' : 'expired'}`}>
                  {u.is_admin ? <Shield size={12} /> : <User size={12} />}
                  <span>{u.is_admin ? 'مدير النظام' : 'عميل'}</span>
                </span>
              </td>
              <td style={{ padding: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    onClick={() => onToggleAdmin(u)}
                    className={`admin-table-action-btn ${u.is_admin ? 'delete' : 'success'}`}
                  >
                    {u.is_admin ? <X size={12} /> : <Check size={12} />}
                    <span>{u.is_admin ? 'إلغاء صلاحية مدير' : 'جعل كمدير للنظام'}</span>
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>لا يوجد مستخدمون يطابقون معايير البحث.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
