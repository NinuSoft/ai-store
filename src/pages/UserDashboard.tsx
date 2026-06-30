import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, LogOut, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { ProfileCompletionModal } from '../components/ProfileCompletionModal';
import { useUserData } from '../components/user/useUserData';

// Subcomponents
import { WelcomeBanner } from '../components/user/components/WelcomeBanner';
import { StatsOverview } from '../components/user/components/StatsOverview';
import { AwaitingPaymentBanner } from '../components/user/components/AwaitingPaymentBanner';
import { ActiveSubscriptionCard } from '../components/user/components/ActiveSubscriptionCard';
import { OrderHistoryList } from '../components/user/components/OrderHistoryList';
import { RenewalsTrackingPanel } from '../components/user/components/RenewalsTrackingPanel';
import { QuickSupportPanel } from '../components/user/components/QuickSupportPanel';

export const UserDashboard: React.FC = () => {
  const {
    profile,
    loading,
    plans,
    orders,
    renewals,
    submittingRenewal,
    actionMessage,
    whatsappNum,
    cancellingOrder,
    confirmCancelId,
    setConfirmCancelId,
    activeSub,
    daysRemaining,
    progressPercent,
    awaitingPaymentOrders,
    activeSubsCount,
    pendingOrdersCount,
    greeting,
    handleSignOut,
    handleRequestRenewal,
    handleCancelOrder,
    getSubscriptionStatusDetails,
    getOrderStatusDetails
  } = useUserData();

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <RotateCw size={40} className="animate-float" style={{ animationDuration: '2s', color: 'var(--primary)' }} />
          <p style={{ marginTop: '16px', fontSize: '1rem' }}>جاري تحميل بياناتك...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <style>{`
        .dash-metric {
          position: relative;
          border-radius: 24px;
          border: 1px solid var(--glass-border) !important;
          background: var(--glass-bg) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease, box-shadow 0.3s ease;
          box-shadow: var(--shadow);
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
        .dash-metric-inner {
          position: relative;
          padding: 22px;
          border-radius: 23px;
          overflow: hidden;
        }
        .dash-metric:hover {
          transform: translateY(-5px) translateZ(0);
          -webkit-transform: translateY(-5px) translateZ(0);
          border-color: rgba(99, 102, 241, 0.35);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18), 0 0 24px rgba(99, 102, 241, 0.08);
        }
        .dash-metric-glow {
          position: absolute;
          top: -50px; right: -50px;
          width: 120px; height: 120px;
          border-radius: 50%;
          filter: blur(45px);
          opacity: 0.14;
          pointer-events: none;
        }
        .dash-welcome {
          position: relative;
          border-radius: 28px;
          border: 1px solid var(--glass-border) !important;
          background: var(--glass-bg) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 28px 32px;
          overflow: hidden;
          box-shadow: var(--shadow);
        }
        .dash-welcome::before {
          content: '';
          position: absolute;
          top: -40px; left: -40px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--primary-glow), transparent 70%);
          opacity: 0.5;
          pointer-events: none;
        }
        .dash-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          font-weight: 800;
          color: white;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          box-shadow: var(--shadow-primary);
          flex-shrink: 0;
          overflow: hidden;
        }
        .dash-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .dash-profile-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
        }
        .dash-profile-row + .dash-profile-row {
          border-top: 1px solid var(--glass-border);
        }
      `}</style>
      
      {/* HEADER */}
      <header style={{ borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)', padding: '16px 0', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div className="container flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', color: 'white', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>لوحة التحكم</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="btn btn-outline" 
              style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Home size={14} /> الرئيسية
            </Link>
            <ThemeToggle />
            {profile?.is_admin && (
              <Link to="/admin" className="badge badge-secondary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
                🛡️ لوحة الإدارة
              </Link>
            )}
            <span style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>
              {profile?.full_name || profile?.email}
            </span>
            <button 
              onClick={handleSignOut}
              className="btn btn-outline" 
              style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={14} /> خروج
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '40px 20px' }}>
        
        {/* Welcome Banner */}
        <WelcomeBanner
          profile={profile}
          greeting={greeting}
          activeSub={activeSub}
        />

        {/* Stats Overview */}
        <StatsOverview
          daysRemaining={daysRemaining}
          activeSubsCount={activeSubsCount}
          pendingOrdersCount={pendingOrdersCount}
        />

        {/* Notification Banner */}
        {actionMessage.text && (
          <div 
            className="flex items-center gap-3 animate-fade-in"
            style={{
              background: actionMessage.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : actionMessage.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${actionMessage.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : actionMessage.type === 'warning' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: actionMessage.type === 'success' ? '#4ade80' : actionMessage.type === 'warning' ? '#fbbf24' : '#f87171',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '32px',
              fontSize: '0.95rem'
            }}
          >
            {actionMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Awaiting Payment Banner */}
        <AwaitingPaymentBanner
          awaitingPaymentOrders={awaitingPaymentOrders}
          plans={plans}
          whatsappNum={whatsappNum}
        />

        <div className="grid grid-cols-3 gap-6">
          
          {/* COLUMN 1: SUBSCRIPTION STATUS (SPAN 2 COLS) */}
          <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-6">
            
            {/* ACTIVE SUBSCRIPTION CARD */}
            <ActiveSubscriptionCard
              activeSub={activeSub}
              plans={plans}
              daysRemaining={daysRemaining}
              progressPercent={progressPercent}
              submittingRenewal={submittingRenewal}
              whatsappNum={whatsappNum}
              onRequestRenewal={handleRequestRenewal}
              getSubscriptionStatusDetails={getSubscriptionStatusDetails}
            />

            {/* ORDER HISTORY LIST */}
            <OrderHistoryList
              orders={orders}
              plans={plans}
              cancellingOrder={cancellingOrder}
              confirmCancelId={confirmCancelId}
              setConfirmCancelId={setConfirmCancelId}
              handleCancelOrder={handleCancelOrder}
              getOrderStatusDetails={getOrderStatusDetails}
            />

          </div>

          {/* COLUMN 2: RENEWAL HISTORY & CUSTOMER SUPPORT INFO */}
          <div className="flex flex-col gap-6">
            
            {/* RENEWALS TRACKING PANEL */}
            <RenewalsTrackingPanel
              renewals={renewals}
            />

            {/* QUICK SUPPORT PANEL */}
            <QuickSupportPanel
              whatsappNum={whatsappNum}
            />

          </div>

        </div>
      </main>

      {profile && !profile.phone && (
        <ProfileCompletionModal />
      )}
    </div>
  );
};

export default UserDashboard;
