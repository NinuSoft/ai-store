import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  confirmConfig: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  };
  setConfirmConfig: (config: any) => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  confirmConfig,
  setConfirmConfig
}) => {
  if (!confirmConfig.isOpen) return null;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '30px' }}>
        <button
          onClick={() => setConfirmConfig((prev: any) => ({ ...prev, isOpen: false }))}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
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
          <X size={16} />
        </button>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#f87171',
          marginBottom: '20px'
        }}>
          <AlertTriangle size={28} />
        </div>

        <h3 style={{ marginBottom: '12px', color: 'var(--text)', fontWeight: 800, fontSize: '1.2rem' }}>
          {confirmConfig.title}
        </h3>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
          {confirmConfig.message}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => setConfirmConfig((prev: any) => ({ ...prev, isOpen: false }))}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            إلغاء
          </button>
          <button
            onClick={confirmConfig.onConfirm}
            style={{
              background: 'var(--danger)',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            تأكيد
          </button>
        </div>
      </div>
    </div>
  );
};
