import React from 'react';
import { MessageSquare, Phone, Send, Mail, Save, Coins, DollarSign } from 'lucide-react';

interface SettingsTabProps {
  settingsList: any[];
  tempSettings: Record<string, any>;
  setTempSettings: (settings: any) => void;
  onSaveSetting: (key: string, valueJson: any) => Promise<void>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settingsList,
  tempSettings,
  setTempSettings,
  onSaveSetting
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }} className="animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ width: '100%', direction: 'rtl' }}>
        
        {/* Section 1: Support & Communication */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
          <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text)' }}>الدعم الفني وقنوات التواصل</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>تعديل روابط تواصل الدعم الفني مع العملاء في المتجر</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {settingsList.filter(s => ['whatsapp', 'telegram', 'support_email'].includes(s.key)).map((s) => {
              const currentVal = s.value;
              const tempVal = tempSettings[s.key] !== undefined ? tempSettings[s.key] : currentVal.value;
              const isDirty = tempSettings[s.key] !== undefined && tempSettings[s.key] !== currentVal.value;
              return (
                <div key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{currentVal.label || s.key}</label>
                    <span className="number-latin" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s.key}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--glass-nested-bg)',
                    border: isDirty ? '1.5px solid var(--warning)' : '1px solid var(--glass-nested-border)',
                    borderRadius: '12px',
                    padding: '4px 12px',
                    transition: 'all 0.2s ease',
                    boxShadow: isDirty ? '0 0 0 3px rgba(245, 158, 11, 0.15)' : 'none',
                    direction: 'ltr'
                  }}>
                    <span style={{ color: isDirty ? 'var(--warning)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', paddingRight: '10px' }}>
                      {s.key === 'whatsapp' && <Phone size={16} />}
                      {s.key === 'telegram' && <Send size={16} />}
                      {s.key === 'support_email' && <Mail size={16} />}
                    </span>
                    <input
                      type="text"
                      value={tempVal}
                      onChange={(e) => setTempSettings((prev: any) => ({ ...prev, [s.key]: e.target.value }))}
                      dir="auto"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: '8px 0',
                        color: 'var(--text)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        width: '100%'
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '10px' }}>
                      {isDirty && (
                        <>
                          <button
                            onClick={() => {
                              setTempSettings((prev: any) => ({ ...prev, [s.key]: currentVal.value }));
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                            title="تراجع عن التعديل"
                          >
                            تراجع
                          </button>
                          <span style={{ fontSize: '0.7rem', background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                            عدّل
                          </span>
                        </>
                      )}
                      <button
                        onClick={async () => {
                          const updatedVal = { ...currentVal, value: tempVal };
                          await onSaveSetting(s.key, updatedVal);
                        }}
                        disabled={!isDirty}
                        className={`admin-table-action-btn ${isDirty ? 'success' : ''}`}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          borderRadius: '8px',
                          opacity: isDirty ? 1 : 0.35,
                          pointerEvents: isDirty ? 'auto' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: isDirty ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                          borderColor: isDirty ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                          color: isDirty ? '#4ade80' : 'var(--text-muted)'
                        }}
                      >
                        <Save size={12} />
                        <span>حفظ</span>
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 4px 0 4px' }}>{currentVal.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Financial & Pricing */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
          <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text)' }}>سعر الصرف والأسعار الرسمية</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>تحديث أسعار صرف الدولار ومقارنة التوفير المالي للباقات</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {settingsList.filter(s => ['exchange_rate', 'google_official_annual_price'].includes(s.key)).map((s) => {
              const currentVal = s.value;
              const tempVal = tempSettings[s.key] !== undefined ? tempSettings[s.key] : currentVal.value;
              const isDirty = tempSettings[s.key] !== undefined && tempSettings[s.key] !== currentVal.value;
              return (
                <div key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{currentVal.label || s.key}</label>
                    <span className="number-latin" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s.key}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--glass-nested-bg)',
                    border: isDirty ? '1.5px solid var(--warning)' : '1px solid var(--glass-nested-border)',
                    borderRadius: '12px',
                    padding: '4px 12px',
                    transition: 'all 0.2s ease',
                    boxShadow: isDirty ? '0 0 0 3px rgba(245, 158, 11, 0.15)' : 'none',
                    direction: 'ltr'
                  }}>
                    <span style={{ color: isDirty ? 'var(--warning)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', paddingRight: '10px' }}>
                      {s.key === 'exchange_rate' && <DollarSign size={16} />}
                      {s.key === 'google_official_annual_price' && <Coins size={16} />}
                    </span>
                    <input
                      type="number"
                      value={tempVal}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const parsed = parseFloat(raw);
                        setTempSettings((prev: any) => ({ ...prev, [s.key]: isNaN(parsed) ? '' : parsed }));
                      }}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: '8px 0',
                        color: 'var(--text)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        width: '100%',
                        textAlign: 'left'
                      }}
                      className="number-latin"
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '10px' }}>
                      {isDirty && (
                        <>
                          <button
                            onClick={() => {
                              setTempSettings((prev: any) => ({ ...prev, [s.key]: currentVal.value }));
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                            title="تراجع عن التعديل"
                          >
                            تراجع
                          </button>
                          <span style={{ fontSize: '0.7rem', background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                            عدّل
                          </span>
                        </>
                      )}
                      <button
                        onClick={async () => {
                          const updatedVal = { ...currentVal, value: tempVal };
                          await onSaveSetting(s.key, updatedVal);
                        }}
                        disabled={!isDirty}
                        className={`admin-table-action-btn ${isDirty ? 'success' : ''}`}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          borderRadius: '8px',
                          opacity: isDirty ? 1 : 0.35,
                          pointerEvents: isDirty ? 'auto' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: isDirty ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                          borderColor: isDirty ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                          color: isDirty ? '#4ade80' : 'var(--text-muted)'
                        }}
                      >
                        <Save size={12} />
                        <span>حفظ</span>
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 4px 0 4px' }}>{currentVal.description}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
