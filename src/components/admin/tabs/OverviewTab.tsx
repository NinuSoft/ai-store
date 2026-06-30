import React from 'react';
import { DollarSign, Activity, ShoppingBag, Users, HelpCircle } from 'lucide-react';
import { Sparkline, AreaChart, BarChart, DonutChart } from '../AdminCharts';
import type { Order, Plan, UserProfile, GmailAccount, Subscription, AdminTab } from '../types';

interface OverviewTabProps {
  stats: {
    totalUsers: number;
    totalOrders: number;
    activeSubs: number;
    pendingOrders: number;
    totalRevenue: number;
  };
  series: {
    revenue: number[];
    orderCounts: number[];
    userCounts: number[];
    subCounts: number[];
  };
  months: { label: string; key: string; y: number; m: number }[];
  recentOrders: Order[];
  plans: Record<string, Plan>;
  users: UserProfile[];
  statusBreakdown: { label: string; value: number; color: string; key: string }[];
  topPlans: { label: string; value: number }[];
  gmailAccountsList: GmailAccount[];
  subscriptions: Subscription[];
  productsList: any[];
  lastIdx: number;
  pct: (a: number[], i: number) => number;
  getUserDisplayName: (userId: string) => string;
  getOrderStatusDetails: (status: Order['status']) => { label: string; badgeClass: string; icon: React.ReactNode | null };
  setActiveTab: (tab: AdminTab) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  series,
  months,
  recentOrders,
  plans,
  users,
  statusBreakdown,
  topPlans,
  gmailAccountsList,
  subscriptions,
  productsList,
  lastIdx,
  pct,
  getUserDisplayName,
  getOrderStatusDetails,
  setActiveTab,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-slide-up">
      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Area Chart panel */}
        <div className="glass-panel md:col-span-2" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
          <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>مخطط الإيرادات الشهرية</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>آخر 6 أشهر · بالدينار العراقي</p>
          </div>
          <div style={{ padding: '12px 0' }}>
            <AreaChart data={series.revenue} labels={months.map((m) => m.label)} />
          </div>
        </div>

        {/* Donut Chart panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
          <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>توزيع حالات الطلبات</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>حسب إجمالي الطلبات المستلمة</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', gap: '16px', flex: 1, justifyContent: 'center' }}>
            <DonutChart
              segments={statusBreakdown}
              center={
                <>
                  <span className="number-latin" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)' }}>
                    {stats.totalOrders}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>إجمالي الطلبات</span>
                </>
              }
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              {statusBreakdown.map((s) => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                    {s.label}
                  </span>
                  <strong style={{ color: 'var(--text)' }} className="number-latin">{s.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Seat Stats Grid/Panel */}
      {(() => {
        let totalCapacity = 0;
        let occupiedSeats = 0;

        gmailAccountsList.forEach((g) => {
          if (g.status !== 'Disabled') {
            totalCapacity += g.max_members;
          }
        });

        subscriptions.forEach((s) => {
          if (s.status === 'active' && s.gmail_account_id) {
            const acc = gmailAccountsList.find(g => g.id === s.gmail_account_id);
            if (acc && acc.status !== 'Disabled') {
              occupiedSeats += 1;
            }
          }
        });

        const freeSeats = Math.max(0, totalCapacity - occupiedSeats);
        const occupancyRate = totalCapacity > 0 ? Math.round((occupiedSeats / totalCapacity) * 100) : 0;

        const productSeatStatsMap: Record<string, { productName: string; totalCapacity: number; occupiedSeats: number }> = {};
        
        productsList.forEach((p) => {
          productSeatStatsMap[p.id] = {
            productName: p.name,
            totalCapacity: 0,
            occupiedSeats: 0
          };
        });

        gmailAccountsList.forEach((g) => {
          if (g.status !== 'Disabled') {
            const plan = plans[g.plan_id];
            if (plan && productSeatStatsMap[plan.product_id]) {
              productSeatStatsMap[plan.product_id].totalCapacity += g.max_members;
            }
          }
        });

        subscriptions.forEach((s) => {
          if (s.status === 'active' && s.gmail_account_id) {
            const acc = gmailAccountsList.find(g => g.id === s.gmail_account_id);
            if (acc && acc.status !== 'Disabled') {
              const plan = plans[acc.plan_id];
              if (plan && productSeatStatsMap[plan.product_id]) {
                productSeatStatsMap[plan.product_id].occupiedSeats += 1;
              }
            }
          }
        });

        const productStatsList = Object.values(productSeatStatsMap).filter(p => p.totalCapacity > 0);

        return (
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '0.5px' }}>مؤشرات توزيع واستهلاك مقاعد الحسابات</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>متابعة تفصيلية للقدرة الاستيعابية وسعة المقاعد الشاغرة لحسابات الـ Gmail للمشاركة</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>معدل الاستهلاك العام:</span>
                <span className="status-pill paid" style={{ fontSize: '0.95rem', fontWeight: 900, padding: '6px 16px', borderRadius: '10px' }}>
                  {occupancyRate}%
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel" style={{ padding: '24px', background: 'var(--glass-nested-bg)', border: '1px solid var(--glass-nested-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 800 }}>السعة الإجمالية للمقاعد</span>
                  <strong style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text)' }} className="number-latin">{totalCapacity}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>مقعد متوفر كلياً</span>
                </div>
                <div className="glass-panel" style={{ padding: '24px', background: 'var(--glass-nested-bg)', border: '1px solid var(--glass-nested-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 800 }}>المقاعد المشغولة</span>
                  <strong style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }} className="number-latin">{occupiedSeats}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', opacity: 0.8 }} className="number-latin">{occupancyRate}% إشغال</span>
                </div>
                <div className="glass-panel" style={{ padding: '24px', background: 'var(--glass-nested-bg)', border: '1px solid var(--glass-nested-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 800 }}>المقاعد الشاغرة</span>
                  <strong style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--success)' }} className="number-latin">{freeSeats}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--success)', opacity: 0.8 }} className="number-latin">{totalCapacity - occupiedSeats} مقعد متاح فورياً</span>
                </div>
              </div>

              <div style={{ width: '100%', height: '14px', background: 'var(--glass-nested-bg)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--glass-nested-border)', padding: '2px' }}>
                <div style={{ width: `${occupancyRate}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: '999px', boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h5 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)', borderRight: '3px solid var(--primary)', paddingRight: '8px' }}>توزيع المقاعد لكل منتج تفصيلياً</h5>
              
              {productStatsList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {productStatsList.map((pStat, index) => {
                    const rate = pStat.totalCapacity > 0 ? Math.round((pStat.occupiedSeats / pStat.totalCapacity) * 100) : 0;
                    return (
                      <div key={index} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--glass-nested-bg)', border: '1px solid var(--glass-nested-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)' }}>{pStat.productName}</span>
                          <span className="number-latin" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            {pStat.occupiedSeats} / {pStat.totalCapacity} مقعد
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--glass-nested-bg)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--glass-nested-border)' }}>
                          <div style={{ width: `${rate}%`, height: '100%', background: 'var(--primary)', borderRadius: '999px' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <span>الإشغال: {rate}%</span>
                          <span>الشاغر: {pStat.totalCapacity - pStat.occupiedSeats}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', background: 'var(--glass-nested-bg)', borderRadius: '12px', border: '1px solid var(--glass-nested-border)' }}>
                  لا توجد حسابات نشطة أو مقاعد مدخلة حالياً لحساب توزيعها.
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Recent Orders + Top Plans Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Recent Orders list */}
        <div className="glass-panel md:col-span-2" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>أحدث الطلبات الواردة</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>آخر 6 طلبات تم تسجيلها</p>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
            >
              عرض الكل
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentOrders.map((o) => {
              const plan = plans[o.plan_id];
              const statusDetails = getOrderStatusDetails(o.status);
              const statusColor = o.status === 'paid' ? 'var(--success)' 
                                : o.status === 'pending' ? 'var(--warning)' 
                                : o.status === 'processing' ? 'var(--primary)' 
                                : o.status === 'awaiting_payment' ? 'var(--warning)' 
                                : o.status === 'rejected' ? 'var(--danger)' 
                                : 'var(--text-muted)';
              return (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--glass-nested-bg)', border: '1px solid var(--glass-nested-border)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      {(getUserDisplayName(o.user_id) || o.gmail || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)' }}>{o.gmail}</h5>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {plan?.name || "باقة"} · <span className="number-latin">{new Date(o.created_at).toLocaleDateString('en-GB')}</span>
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: statusColor }}>
                      {statusDetails.label}
                    </span>
                    {plan && (
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text)' }}>
                        <span className="number-latin">{plan.price_iqd.toLocaleString('en-US')}</span> د.ع
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Plans bar chart */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
          <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>أعلى الباقات إيراداً</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>حسب إجمالي الطلبات المكتملة</p>
          </div>
          <div style={{ padding: '24px 0 12px 0', flex: 1, display: 'flex', alignItems: 'center' }}>
            <BarChart
              data={topPlans.map((p) => p.value)}
              labels={topPlans.map((p) => p.label.split(" ").slice(0, 2).join(" "))}
              formatValue={(n) => `${(n / 1000).toFixed(0)}K`}
            />
          </div>
        </div>

      </div>

    </div>
  );
};
