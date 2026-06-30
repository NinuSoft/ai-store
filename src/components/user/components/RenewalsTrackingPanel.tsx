import React from 'react';
import type { Renewal } from '../types';

interface RenewalsTrackingPanelProps {
  renewals: Renewal[];
}

export const RenewalsTrackingPanel: React.FC<RenewalsTrackingPanelProps> = ({
  renewals
}) => {
  return (
    <div className="glass-panel" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>
        متابعة طلبات التجديد
      </h3>

      {renewals.length > 0 ? (
        <div className="flex flex-col gap-3">
          {renewals.map((r) => (
            <div 
              key={r.id}
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--glass-nested-border)',
                background: 'var(--glass-nested-bg)'
              }}
              className="flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>طلب تجديد اشتراك</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} className="number-latin">
                  {new Date(r.created_at).toLocaleDateString('en-GB')}
                </span>
              </div>
              
              <span 
                className={`badge ${
                  r.status === 'approved' ? 'badge-success' : r.status === 'pending' ? 'badge-warning' : 'badge-danger'
                }`}
                style={{ fontSize: '0.7rem' }}
              >
                {r.status === 'approved' ? 'تم التجديد' : r.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>
          لا توجد طلبات تجديد حالية.
        </p>
      )}
    </div>
  );
};
