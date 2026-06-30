import React from 'react';
import { Clock, RotateCw, DollarSign, Check, X, Edit2, Activity, MessageSquare } from 'lucide-react';
import type { Order, Plan, GmailAccount } from '../types';

interface OrdersTabProps {
  filteredOrders: Order[];
  plans: Record<string, Plan>;
  gmailAccountsList: GmailAccount[];
  getOrderStatusDetails: (status: Order['status']) => { label: string; badgeClass: string; icon: React.ReactNode | null };
  onOpenAssignModal: (order: Order) => void;
  onProcess: (orderId: string) => void;
  onApprove: (order: Order) => void;
  onMarkPaid: (orderId: string) => void;
  onSendReminder: (order: Order) => void;
  onSaveNotes: (orderId: string, notes: string) => void;
  onReject: (orderId: string) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  filteredOrders,
  plans,
  gmailAccountsList,
  getOrderStatusDetails,
  onOpenAssignModal,
  onProcess,
  onApprove,
  onMarkPaid,
  onSendReminder,
  onSaveNotes,
  onReject
}) => {
  return (
    <table className="admin-table">
      <thead>
        <tr style={{ borderBottom: '2px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
          <th style={{ padding: '16px', color: 'var(--text)' }}>بريد التفعيل (Gmail)</th>
          <th style={{ padding: '16px', color: 'var(--text)' }}>حساب المشاركة المعين</th>
          <th style={{ padding: '16px', color: 'var(--text)' }}>رقم الهاتف</th>
          <th style={{ padding: '16px', color: 'var(--text)' }}>الباقة المطلوبة</th>
          <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ الطلب</th>
          <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ التفعيل</th>
          <th style={{ padding: '16px', color: 'var(--text)' }}>تاريخ الدفع</th>
          <th style={{ padding: '16px', color: 'var(--text)' }}>الحالة</th>
          <th style={{ padding: '16px', color: 'var(--text)', minWidth: '130px' }}>ملاحظات المسؤول</th>
          <th style={{ padding: '16px', color: 'var(--text)', textAlign: 'center' }}>العمليات</th>
        </tr>
      </thead>
      <tbody>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((o) => (
            <tr key={o.id} style={{ borderBottom: '1px solid var(--border)', background: o.status === 'pending' ? 'rgba(245, 158, 11, 0.02)' : 'none' }}>
              <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text)' }} className="number-latin">{o.gmail}</td>
              <td style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="number-latin" style={{ fontSize: '0.85rem' }}>
                    {gmailAccountsList.find(g => g.id === o.gmail_account_id)?.email || 'غير معين'}
                  </span>
                  <button
                    onClick={() => onOpenAssignModal(o)}
                    className="admin-table-action-btn"
                    style={{ padding: '4px 6px' }}
                    title="تغيير الحساب المعين"
                  >
                    <Edit2 size={10} />
                  </button>
                </div>
              </td>
              <td style={{ padding: '16px' }} className="number-latin">{o.phone}</td>
              <td style={{ padding: '16px' }}>{plans[o.plan_id]?.name || 'غير معروف'}</td>
              <td style={{ padding: '16px' }} className="number-latin">{new Date(o.created_at).toLocaleDateString('en-GB')}</td>
              <td style={{ padding: '16px' }} className="number-latin">{o.activation_date ? new Date(o.activation_date).toLocaleDateString('en-GB') : '—'}</td>
              <td style={{ padding: '16px' }} className="number-latin">{o.payment_date ? new Date(o.payment_date).toLocaleDateString('en-GB') : '—'}</td>
              <td style={{ padding: '16px' }}>
                <span className={getOrderStatusDetails(o.status).badgeClass}>
                  {getOrderStatusDetails(o.status).icon}
                  <span>{getOrderStatusDetails(o.status).label}</span>
                </span>
              </td>
              <td style={{ padding: '16px' }}>
                <input
                  type="text"
                  defaultValue={o.notes || ''}
                  placeholder="أضف ملاحظة..."
                  onBlur={(e) => onSaveNotes(o.id, e.target.value)}
                  dir="auto"
                  style={{
                    width: '120px',
                    padding: '6px 10px',
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text)',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </td>
              <td style={{ padding: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {o.status === 'pending' && (
                    <button
                      onClick={() => onProcess(o.id)}
                      className="admin-table-action-btn"
                    >
                      <Activity size={12} />
                      <span>بدء المعالجة</span>
                    </button>
                  )}
                  {(o.status === 'pending' || o.status === 'processing') && (
                    <button
                      onClick={() => onApprove(o)}
                      className="admin-table-action-btn success"
                    >
                      <Check size={12} />
                      <span>تنشيط</span>
                    </button>
                  )}
                  {o.status === 'awaiting_payment' && (
                    <>
                      <button
                        onClick={() => onMarkPaid(o.id)}
                        className="admin-table-action-btn success"
                      >
                        <Check size={12} />
                        <span>تأكيد الدفع</span>
                      </button>
                      <button
                        onClick={() => onSendReminder(o)}
                        className="admin-table-action-btn"
                        style={{ color: '#25d366', borderColor: 'rgba(37, 211, 102, 0.25)' }}
                      >
                        <MessageSquare size={12} />
                        <span>تذكير بالدفع</span>
                      </button>
                    </>
                  )}
                  {o.status !== 'paid' && o.status !== 'rejected' && o.status !== 'cancelled' && (
                    <button
                      onClick={() => onReject(o.id)}
                      className="admin-table-action-btn delete"
                    >
                      <X size={12} />
                      <span>رفض</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={10} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد طلبات تطابق معايير البحث.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
