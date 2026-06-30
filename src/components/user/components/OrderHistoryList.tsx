import React from 'react';
import { RotateCw } from 'lucide-react';
import type { Order, Plan } from '../types';

interface OrderHistoryListProps {
  orders: Order[];
  plans: Record<string, Plan>;
  cancellingOrder: string | null;
  confirmCancelId: string | null;
  setConfirmCancelId: (id: string | null) => void;
  handleCancelOrder: (orderId: string) => void;
  getOrderStatusDetails: (status: Order['status']) => { label: string; badgeClass: string };
}

export const OrderHistoryList: React.FC<OrderHistoryListProps> = ({
  orders,
  plans,
  cancellingOrder,
  confirmCancelId,
  setConfirmCancelId,
  handleCancelOrder,
  getOrderStatusDetails
}) => {
  return (
    <div className="glass-panel" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '20px' }}>سجل طلباتك</h3>
      
      {orders.length > 0 ? (
        <div className="flex flex-col gap-4">
          {orders.map((o) => (
            <div 
              key={o.id}
              style={{
                padding: '16px',
                border: '1px solid var(--glass-nested-border)',
                borderRadius: '12px',
                background: 'var(--glass-nested-bg)'
              }}
              className="flex items-center justify-between"
            >
              <div className="flex flex-col gap-1">
                <strong style={{ color: 'var(--text)', fontSize: '0.95rem' }}>
                  {plans[o.plan_id]?.name || 'Google AI Pro'}
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  تفعيل على: <span className="number-latin" style={{ color: 'var(--text)' }}>{o.gmail}</span>
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  تاريخ الطلب:{' '}
                  <span className="number-latin">
                    {new Date(o.created_at).toLocaleDateString('en-GB')}
                  </span>
                </span>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span 
                  className={`badge ${getOrderStatusDetails(o.status).badgeClass}`}
                  style={{ fontSize: '0.75rem' }}
                >
                  {getOrderStatusDetails(o.status).label}
                </span>

                <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 700, fontFamily: 'var(--font-latin)' }}>
                  {plans[o.plan_id]?.price_iqd.toLocaleString('en-US')} د.ع
                </span>

                {o.status === 'pending' && (
                  <div style={{ marginTop: '4px' }}>
                    {confirmCancelId === o.id ? (
                      <div className="flex items-center gap-2 animate-fade-in" style={{ fontSize: '0.72rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>تأكيد الإلغاء؟</span>
                        <button
                          onClick={() => {
                            handleCancelOrder(o.id);
                            setConfirmCancelId(null);
                          }}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: 'var(--danger)',
                            color: 'white',
                            border: 'none',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          نعم
                        </button>
                        <button
                          onClick={() => setConfirmCancelId(null)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border)',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          تراجع
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmCancelId(o.id)}
                        disabled={cancellingOrder === o.id}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          background: 'transparent',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          fontWeight: 700,
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        className="hover:bg-red-500/10 hover:border-red-500/20"
                      >
                        {cancellingOrder === o.id ? (
                          <RotateCw size={12} className="animate-spin" />
                        ) : (
                          'إلغاء الطلب'
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
          لا يوجد سجل طلبات سابقة.
        </p>
      )}
    </div>
  );
};
