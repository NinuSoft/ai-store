import React from 'react';
import { Clock, Activity, RotateCw } from 'lucide-react';

interface StatsOverviewProps {
  daysRemaining: number;
  activeSubsCount: number;
  pendingOrdersCount: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  daysRemaining,
  activeSubsCount,
  pendingOrdersCount
}) => {
  return (
    <section className="grid grid-cols-3 gap-6" style={{ marginBottom: '28px' }}>
      <div className="dash-metric animate-fade-in animate-delay-1">
        <div className="dash-metric-inner">
          <div className="dash-metric-glow" style={{ background: '#4ade80' }} />
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>الأيام المتبقية</span>
            <Clock size={20} style={{ color: '#4ade80' }} />
          </div>
          <strong style={{ fontSize: '1.7rem', color: 'var(--text)', fontFamily: 'var(--font-latin)' }} className="number-latin">
            {daysRemaining}
          </strong>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block', marginTop: '2px' }}>يوم في الاشتراك الحالي</span>
        </div>
      </div>

      <div className="dash-metric animate-fade-in animate-delay-2">
        <div className="dash-metric-inner">
          <div className="dash-metric-glow" style={{ background: '#818cf8' }} />
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>الاشتراكات النشطة</span>
            <Activity size={20} style={{ color: '#818cf8' }} />
          </div>
          <strong style={{ fontSize: '1.7rem', color: 'var(--text)', fontFamily: 'var(--font-latin)' }} className="number-latin">
            {activeSubsCount}
          </strong>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block', marginTop: '2px' }}>اشتراك مفعّل الآن</span>
        </div>
      </div>

      <div className="dash-metric animate-fade-in animate-delay-3" style={{ border: pendingOrdersCount > 0 ? '1px solid rgba(245, 158, 11, 0.4) !important' : '1px solid var(--glass-border) !important' }}>
        <div className="dash-metric-inner">
          <div className="dash-metric-glow" style={{ background: '#fbbf24' }} />
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>طلبات قيد المراجعة</span>
            <RotateCw size={20} style={{ color: '#fbbf24' }} />
          </div>
          <strong style={{ fontSize: '1.7rem', color: pendingOrdersCount > 0 ? '#fbbf24' : 'var(--text)', fontFamily: 'var(--font-latin)' }} className="number-latin">
            {pendingOrdersCount}
          </strong>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block', marginTop: '2px' }}>بانتظار الموافقة</span>
        </div>
      </div>
    </section>
  );
};
