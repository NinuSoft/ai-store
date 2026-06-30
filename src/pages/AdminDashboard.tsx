import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, ArrowRight, Activity, ShoppingBag,
  DollarSign, RotateCw, Users, Mail, PlusCircle,
  MessageSquare, Sparkles, Settings, LogOut, Check, X,
  Search
} from 'lucide-react';

import { ThemeToggle } from '../components/ThemeToggle';
import { useAdminData } from '../components/admin/useAdminData';

// Tab Views
import { OverviewTab } from '../components/admin/tabs/OverviewTab';
import { OrdersTab } from '../components/admin/tabs/OrdersTab';
import { RenewalsTab } from '../components/admin/tabs/RenewalsTab';
import { SubscriptionsTab } from '../components/admin/tabs/SubscriptionsTab';
import { UsersTab } from '../components/admin/tabs/UsersTab';
import { GmailAccountsTab } from '../components/admin/tabs/GmailAccountsTab';
import { CatalogTabs } from '../components/admin/tabs/CatalogTabs';
import { SettingsTab } from '../components/admin/tabs/SettingsTab';

// Modals & Charts
import { AdminModals } from '../components/admin/AdminModals';
import { Sparkline } from '../components/admin/AdminCharts';

export const AdminDashboard: React.FC = () => {
  const adminState = useAdminData();

  const {
    profile,
    handleSignOut,
    loading,
    plans,
    orders,
    users,
    subscriptions,
    renewals,
    productsList,
    faqsList,
    testimonialsList,
    settingsList,
    tempSettings,
    setTempSettings,
    gmailAccountsList,
    assigningOrder,
    setAssigningOrder,
    assigningSub,
    setAssigningSub,
    selectedGmailAccountDetails,
    setSelectedGmailAccountDetails,
    editingItem,
    setEditingItem,
    isAdding,
    setIsAdding,
    formFields,
    setFormFields,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    snackbar,
    setSnackbar,
    suspendingSub,
    confirmConfig,
    setConfirmConfig,
    stats,
    showSnackbar,
    handleProcessOrder,
    handleApproveOrder,
    handleApproveOrderWithAccount,
    handleMarkPaid,
    handleSendReminder,
    handleSaveNotes,
    handleRejectOrder,
    handleApproveRenewal,
    handleRejectRenewal,
    handleToggleAdmin,
    handleToggleSuspendSubscription,
    handleSaveGmailAccount,
    handleDeleteGmailAccount,
    handleSaveProduct,
    handleDeleteProduct,
    handleSavePlan,
    handleDeletePlan,
    handleSaveFaq,
    handleDeleteFaq,
    handleSaveTestimonial,
    handleDeleteTestimonial,
    handleSaveSetting,
    handleAssignGmailAccountToSubscription,
    getUserDisplayName,
    getOrderStatusDetails,
    months,
    series,
    pct,
    statusBreakdown,
    topPlans,
    recentOrders,
    lastIdx,
    filteredOrders,
    filteredUsers,
    filteredRenewals,
    filteredSubscriptions,
    filteredGmailAccounts,
    activeTab,
    setActiveTab
  } = adminState;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)] text-[var(--text)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (profile && !profile.is_admin) {
    return null;
  }

  return (
    <div className="admin-page-wrapper" style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text)' }}>
      <style>{`
        .admin-page-wrapper .container {
          max-width: 1600px;
        }
        select option {
          background-color: var(--surface);
          color: var(--text);
        }
        .clickable-email {
          color: var(--text) !important;
          text-decoration: none;
          transition: color 0.2s ease, text-decoration 0.2s ease;
        }
        .clickable-email:hover {
          color: var(--primary) !important;
          text-decoration: underline;
        }
        @keyframes slide-in {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .admin-layout {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        @media (min-width: 1024px) {
          .admin-layout {
            flex-direction: row;
            align-items: start;
          }
          .admin-sidebar {
            width: 280px;
            flex-shrink: 0;
            position: sticky;
            top: 24px;
          }
          .admin-content {
            flex-grow: 1;
            min-width: 0;
          }
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none !important;
          margin: 0 !important;
        }
        input[type=number] {
          -moz-appearance: textfield !important;
        }
        .admin-tab-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: right;
          gap: 12px;
        }
        .admin-tab-item:hover:not(.active) {
          background: var(--glass-hover-bg);
          color: var(--text);
          transform: translateX(-4px);
        }
        .admin-tab-item.active {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%);
          border: 1px solid rgba(99, 102, 241, 0.25);
          color: var(--primary);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.08);
        }
        .redesign-input {
          width: 100% !important;
          padding: 12px 16px !important;
          background: var(--glass-nested-bg) !important;
          border: 1px solid var(--glass-nested-border) !important;
          border-radius: 12px !important;
          color: var(--text) !important;
          font-size: 0.85rem !important;
          outline: none !important;
          transition: all 0.2s !important;
        }
        .redesign-input:focus {
          border-color: #818cf8 !important;
          background: var(--glass-nested-bg) !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2) !important;
        }
        .redesign-search-input {
          width: 100% !important;
          padding: 12px 42px 12px 16px !important;
          background: var(--glass-nested-bg) !important;
          border: 1px solid var(--glass-nested-border) !important;
          border-radius: 12px !important;
          color: var(--text) !important;
          font-size: 0.85rem !important;
          outline: none !important;
          transition: all 0.2s !important;
        }
        .redesign-search-input:focus {
          border-color: #818cf8 !important;
          background: var(--glass-nested-bg) !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2) !important;
        }
        .metric-card {
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
        .metric-card-inner {
          position: relative;
          padding: 24px;
          border-radius: 23px;
          overflow: hidden;
        }
        .metric-card:hover {
          transform: translateY(-6px) translateZ(0);
          -webkit-transform: translateY(-6px) translateZ(0);
          border-color: rgba(99, 102, 241, 0.35);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25), 0 0 24px rgba(99, 102, 241, 0.08);
        }
        .metric-glow {
          position: absolute;
          top: -60px; right: -60px;
          width: 140px; height: 140px;
          border-radius: 50%;
          filter: blur(50px);
          opacity: 0.12;
          pointer-events: none;
        }
        .admin-table-container {
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--glass-border) !important;
          background: var(--glass-bg) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: var(--shadow-sm);
        }
        .admin-table-wrapper {
          overflow-x: auto;
          width: 100%;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: right;
          font-size: 0.85rem;
          white-space: nowrap;
        }
        .admin-table thead tr {
          border-bottom: 1px solid var(--glass-border) !important;
          background: var(--glass-nested-bg) !important;
        }
        .admin-table th {
          padding: 14px 16px !important;
          font-weight: 800 !important;
          color: var(--text-muted) !important;
          border-bottom: none !important;
          background: transparent !important;
          font-size: 0.8rem !important;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .admin-table tbody tr {
          border-bottom: 1px solid rgba(148, 163, 184, 0.08) !important;
          transition: background-color 0.2s ease !important;
        }
        .admin-table tbody tr:nth-child(even) {
          background: transparent !important;
        }
        .admin-table tbody tr:nth-child(odd) {
          background: rgba(148, 163, 184, 0.03) !important;
        }
        .admin-table tbody tr:hover {
          background: var(--glass-hover-bg) !important;
        }
        .admin-table td {
          padding: 14px 16px !important;
          border-bottom: none !important;
          color: var(--text) !important;
          vertical-align: middle;
        }
        .admin-table tbody tr:nth-child(even) td,
        .admin-table tbody tr:nth-child(odd) td,
        .admin-table tbody tr:hover td {
          background: transparent !important;
        }
        .admin-table-wrapper::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .admin-table-wrapper::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-table-wrapper::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 99px;
        }
        .admin-table-wrapper::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 800;
          border: 1px solid transparent;
        }
        .status-pill.pending {
          background: rgba(245, 158, 11, 0.08);
          color: #fbbf24;
          border-color: rgba(245, 158, 11, 0.25);
        }
        .status-pill.processing {
          background: rgba(59, 130, 246, 0.08);
          color: #60a5fa;
          border-color: rgba(59, 130, 246, 0.25);
        }
        .status-pill.paid {
          background: rgba(34, 197, 94, 0.08);
          color: #4ade80;
          border-color: rgba(34, 197, 94, 0.25);
        }
        .status-pill.awaiting_payment {
          background: rgba(139, 92, 246, 0.08);
          color: #a78bfa;
          border-color: rgba(139, 92, 246, 0.25);
        }
        .status-pill.rejected {
          background: rgba(239, 68, 68, 0.08);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.25);
        }
        .status-pill.cancelled {
          background: rgba(100, 116, 139, 0.08);
          color: #94a3b8;
          border-color: rgba(100, 116, 139, 0.25);
        }
        .status-pill.expired {
          background: rgba(156, 163, 175, 0.08);
          color: #9ca3af;
          border-color: rgba(156, 163, 175, 0.25);
        }
        .status-pill.suspended {
          background: rgba(239, 68, 68, 0.08);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.25);
        }
        .admin-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 14px;
          font-size: 0.78rem;
          font-weight: 700;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          gap: 6px;
          border: 1px solid transparent;
        }
        .admin-action-btn:hover {
          transform: scale(1.03);
        }
        .admin-action-btn:active {
          transform: scale(0.97);
        }
        .admin-input-select {
          padding: 12px 16px;
          background: var(--background-alt);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-size: 0.85rem;
          outline: none;
          min-width: 150px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .admin-input-select:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .admin-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
          animation: overlay-fade-in 0.25s ease-out forwards;
        }
        @keyframes overlay-fade-in {
          from { background: rgba(15, 23, 42, 0); }
          to { background: rgba(15, 23, 42, 0.4); }
        }
        .admin-modal-card {
          position: relative;
          background: var(--glass-modal-bg) !important;
          border: 1px solid var(--glass-modal-border) !important;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 24px;
          padding: 32px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--glass-nested-border) !important;
          color: var(--text);
          animation: modal-scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes modal-scale-up {
          from {
            transform: scale(0.92) translateY(12px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .admin-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }
        .admin-form-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 800;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }
        .admin-input-text {
          width: 100%;
          padding: 12px 16px;
          background: var(--background-alt);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-size: 0.88rem;
          outline: none;
          transition: all 0.3s ease;
          unicode-bidi: plaintext;
          text-align: start;
        }
        .admin-input-text:focus {
          border-color: var(--primary);
          background: var(--background);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .admin-table-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-secondary);
        }
        .admin-table-action-btn:hover {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          transform: translateY(-1px);
        }
        .admin-table-action-btn.delete {
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.2);
        }
        .admin-table-action-btn.delete:hover {
          background: #ef4444;
          border-color: #ef4444;
          color: white;
        }
        .admin-table-action-btn.success {
          color: #4ade80;
          border-color: rgba(34, 197, 94, 0.2);
        }
        .admin-table-action-btn.success:hover {
          background: #22c55e;
          border-color: #22c55e;
          color: white;
        }
      `}</style>

      {/* HEADER */}
      <header style={{ borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)', padding: '16px 0', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck size={24} style={{ color: 'var(--secondary)' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>لوحة الإدارة والمتابعة</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/" className="btn btn-outline" style={{ padding: '6px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowRight size={14} /> الصفحة الرئيسية
            </Link>
            <button
              onClick={handleSignOut}
              className="btn btn-outline"
              style={{ padding: '6px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <LogOut size={14} /> تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '40px 20px' }}>
        <div className="admin-layout">

          {/* RIGHT COLUMN: Sidebar (Navigation) */}
          <aside className="admin-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
              <div style={{ padding: '0 8px 12px 8px', borderBottom: '1px solid var(--glass-border)', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>لوحات التحكم</span>
              </div>

              <button
                onClick={() => { setActiveTab('overview'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'overview' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Activity size={18} />
                  <span>الرئيسية</span>
                </div>
              </button>

              <button
                onClick={() => { setActiveTab('orders'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'orders' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShoppingBag size={18} />
                  <span>الطلبات الواردة</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'var(--glass-nested-bg)', border: '1px solid var(--glass-nested-border)', color: 'var(--text-secondary)', fontWeight: 800 }}>{orders.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('renewals'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'renewals' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <RotateCw size={18} />
                  <span>طلبات التجديد</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'var(--glass-nested-bg)', border: '1px solid var(--glass-nested-border)', color: 'var(--text-secondary)', fontWeight: 800 }}>{renewals.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('subscriptions'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={18} />
                  <span>الاشتراكات</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'var(--glass-nested-bg)', border: '1px solid var(--glass-nested-border)', color: 'var(--text-secondary)', fontWeight: 800 }}>{subscriptions.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('users'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'users' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users size={18} />
                  <span>المستخدمين</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'var(--glass-nested-bg)', border: '1px solid var(--glass-nested-border)', color: 'var(--text-secondary)', fontWeight: 800 }}>{users.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('gmail_accounts'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'gmail_accounts' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={18} />
                  <span>حسابات Gmail للمشاركة</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'var(--glass-nested-bg)', border: '1px solid var(--glass-nested-border)', color: 'var(--text-secondary)', fontWeight: 800 }}>{gmailAccountsList.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('products'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'products' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <DollarSign size={18} />
                  <span>المنتجات</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'var(--glass-nested-bg)', border: '1px solid var(--glass-nested-border)', color: 'var(--text-secondary)', fontWeight: 800 }}>{productsList.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('plans'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'plans' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <PlusCircle size={18} />
                  <span>الباقات</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'var(--glass-nested-bg)', border: '1px solid var(--glass-nested-border)', color: 'var(--text-secondary)', fontWeight: 800 }}>{Object.keys(plans).length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('faqs'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'faqs' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MessageSquare size={18} />
                  <span>الأسئلة الشائعة</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'var(--glass-nested-bg)', border: '1px solid var(--glass-nested-border)', color: 'var(--text-secondary)', fontWeight: 800 }}>{faqsList.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('testimonials'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'testimonials' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={18} />
                  <span>الآراء والتقييمات</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: 'var(--glass-nested-bg)', border: '1px solid var(--glass-nested-border)', color: 'var(--text-secondary)', fontWeight: 800 }}>{testimonialsList.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setStatusFilter('all'); }}
                className={`admin-tab-item ${activeTab === 'settings' ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Settings size={18} />
                  <span>إعدادات المتجر</span>
                </div>
              </button>
            </div>
          </aside>

          {/* LEFT COLUMN: Main content area */}
          <div className="admin-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* 1. METRICS DASHBOARD */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-right animate-slide-up">

              {/* Revenue card */}
              <div className="metric-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <span style={{ display: 'flex', width: '44px', height: '44px', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
                    <DollarSign size={20} />
                  </span>
                  <div style={{ width: '96px', height: '40px', opacity: 0.9 }}>
                    <Sparkline data={series.revenue} color="var(--success)" />
                  </div>
                </div>
                <p style={{ marginTop: '16px', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)' }}>إجمالي الإيرادات</p>
                <div style={{ marginTop: '4px', display: 'flex', alignItems: 'end', gap: '8px' }}>
                  <strong style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)' }} className="number-latin">
                    {stats.totalRevenue.toLocaleString('en-US')}
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>د.ع</span>
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${pct(series.revenue, lastIdx) >= 0 ? "bg-emerald-100/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-100/10 text-rose-500 border border-rose-500/20"
                    }`} style={{ direction: 'ltr', marginBottom: '4px' }}>
                    {pct(series.revenue, lastIdx) >= 0 ? '+' : ''}{pct(series.revenue, lastIdx)}%
                  </span>
                </div>
              </div>

              {/* Active subs card */}
              <div className="metric-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <span style={{ display: 'flex', width: '44px', height: '44px', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                    <Activity size={20} />
                  </span>
                  <div style={{ width: '96px', height: '40px', opacity: 0.9 }}>
                    <Sparkline data={series.subCounts} color="var(--primary)" />
                  </div>
                </div>
                <p style={{ marginTop: '16px', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)' }}>الاشتراكات النشطة</p>
                <div style={{ marginTop: '4px', display: 'flex', alignItems: 'end', gap: '8px' }}>
                  <strong style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)' }} className="number-latin">
                    {stats.activeSubs}
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>اشتراك</span>
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${pct(series.subCounts, lastIdx) >= 0 ? "bg-emerald-100/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-100/10 text-rose-500 border border-rose-500/20"
                    }`} style={{ direction: 'ltr', marginBottom: '4px' }}>
                    {pct(series.subCounts, lastIdx) >= 0 ? '+' : ''}{pct(series.subCounts, lastIdx)}%
                  </span>
                </div>
              </div>

              {/* Pending orders card */}
              <div className="metric-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <span style={{ display: 'flex', width: '44px', height: '44px', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                    <ShoppingBag size={20} />
                  </span>
                  <div style={{ width: '96px', height: '40px', opacity: 0.9 }}>
                    <Sparkline data={series.orderCounts} color="var(--warning)" />
                  </div>
                </div>
                <p style={{ marginTop: '16px', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)' }}>طلبات معلّقة</p>
                <div style={{ marginTop: '4px', display: 'flex', alignItems: 'end', gap: '8px' }}>
                  <strong style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)' }} className="number-latin">
                    {stats.pendingOrders}
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>طلب معلق</span>
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${pct(series.orderCounts, lastIdx) >= 0 ? "bg-emerald-100/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-100/10 text-rose-500 border border-rose-500/20"
                    }`} style={{ direction: 'ltr', marginBottom: '4px' }}>
                    {pct(series.orderCounts, lastIdx) >= 0 ? '+' : ''}{pct(series.orderCounts, lastIdx)}%
                  </span>
                </div>
              </div>

              {/* Total Users card */}
              <div className="metric-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <span style={{ display: 'flex', width: '44px', height: '44px', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
                    <Users size={20} />
                  </span>
                  <div style={{ width: '96px', height: '40px', opacity: 0.9 }}>
                    <Sparkline data={series.userCounts} color="var(--secondary)" />
                  </div>
                </div>
                <p style={{ marginTop: '16px', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)' }}>إجمالي المسجّلين</p>
                <div style={{ marginTop: '4px', display: 'flex', alignItems: 'end', gap: '8px' }}>
                  <strong style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)' }} className="number-latin">
                    {stats.totalUsers}
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>عميل مسجل</span>
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${pct(series.userCounts, lastIdx) >= 0 ? "bg-emerald-100/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-100/10 text-rose-500 border border-rose-500/20"
                    }`} style={{ direction: 'ltr', marginBottom: '4px' }}>
                    {pct(series.userCounts, lastIdx) >= 0 ? '+' : ''}{pct(series.userCounts, lastIdx)}%
                  </span>
                </div>
              </div>
            </section>

            {/* Header for dynamic section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '20px 24px', borderRadius: '16px', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)' }}>
                  {activeTab === 'overview' ? 'لوحة التحكم والمؤشرات الرئيسية' :
                    activeTab === 'orders' ? 'إدارة الطلبات الواردة' :
                      activeTab === 'renewals' ? 'طلبات تجديد الاشتراكات' :
                        activeTab === 'subscriptions' ? 'الاشتراكات النشطة' :
                          activeTab === 'users' ? 'قائمة حسابات المستخدمين' :
                            activeTab === 'gmail_accounts' ? 'حسابات Gmail المشتركة' :
                              activeTab === 'products' ? 'المنتجات المعروضة' :
                                activeTab === 'plans' ? 'باقات تفعيل Google AI Pro' :
                                  activeTab === 'faqs' ? 'الأسئلة الشائعة للزوار' :
                                    activeTab === 'testimonials' ? 'تقييمات وآراء العملاء' :
                                      'إعدادات وثوابت متجر نينوسوفت'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {activeTab === 'overview' ? 'نظرة شاملة ومؤشرات تفاعلية لأداء متجرك اليوم.' :
                    activeTab === 'orders' ? 'تتبع وتنشيط وتعديل حالة طلبات العملاء الجدد.' :
                      activeTab === 'renewals' ? 'مراجعة وتأكيد طلبات العملاء الراغبين بتجديد باقاتهم.' :
                        activeTab === 'subscriptions' ? 'عرض فترات الضمان والاشتراكات المفعلة للعملاء.' :
                          activeTab === 'users' ? 'متابعة تفاصيل المستخدمين المسجلين وصلاحياتهم.' :
                            activeTab === 'gmail_accounts' ? 'إدارة حسابات Gmail المستخدمة في تفعيل وتوزيع الاشتراكات.' :
                              activeTab === 'products' ? 'إضافة وتعديل وحذف المنتجات وخصائصها.' :
                                activeTab === 'plans' ? 'التحكم بالمدد الزمنية للأسعار والتخفيضات الفعلية.' :
                                  activeTab === 'faqs' ? 'تعديل أو ترتيب الأسئلة الشائعة وأجوبتها.' :
                                    activeTab === 'testimonials' ? 'إدارة التقييمات المعروضة في الصفحة الرئيسية.' :
                                      'تعديل المتغيرات الأساسية للمنصة مثل رقم الهاتف للدعم.'}
                </p>
              </div>
            </div>

            {/* TAB CONTENTS */}
            {activeTab === 'overview' ? (
              <OverviewTab
                stats={stats}
                series={series}
                months={months}
                recentOrders={recentOrders}
                plans={plans}
                users={users}
                statusBreakdown={statusBreakdown}
                topPlans={topPlans}
                gmailAccountsList={gmailAccountsList}
                subscriptions={subscriptions}
                productsList={productsList}
                lastIdx={lastIdx}
                pct={pct}
                getUserDisplayName={getUserDisplayName}
                getOrderStatusDetails={getOrderStatusDetails}
                setActiveTab={setActiveTab}
              />
            ) : activeTab === 'settings' ? (
              <SettingsTab
                settingsList={settingsList}
                tempSettings={tempSettings}
                setTempSettings={setTempSettings}
                onSaveSetting={handleSaveSetting}
              />
            ) : (
              <>
                {/* Search & Filters Controls Bar */}
                {['products', 'plans', 'faqs', 'testimonials', 'gmail_accounts', 'orders', 'renewals', 'subscriptions', 'users'].includes(activeTab) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '12px 16px', borderRadius: '16px', width: '100%', marginBottom: '16px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Search size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={
                          activeTab === 'products' ? 'ابحث عن منتج...' :
                          activeTab === 'plans' ? 'ابحث عن باقة...' :
                          activeTab === 'faqs' ? 'ابحث عن سؤال...' :
                          activeTab === 'gmail_accounts' ? 'ابحث عن حساب Gmail...' :
                          activeTab === 'testimonials' ? 'ابحث عن تقييم...' :
                          activeTab === 'orders' ? 'ابحث عن طلب (Gmail، الاسم، أو رقم الهاتف)...' :
                          activeTab === 'renewals' ? 'ابحث عن طلب تجديد (Gmail، الاسم، أو رقم الهاتف)...' :
                          activeTab === 'subscriptions' ? 'ابحث عن اشتراك نشط...' :
                          activeTab === 'users' ? 'ابحث عن مستخدم (Gmail، الاسم، أو رقم الهاتف)...' :
                          'ابحث...'
                        }
                        dir={searchTerm ? 'auto' : 'rtl'}
                        className="redesign-search-input"
                      />
                    </div>

                    {['orders', 'renewals', 'subscriptions', 'gmail_accounts', 'users'].includes(activeTab) && (
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                          padding: '10px 16px',
                          background: 'var(--glass-nested-bg)', border: '1px solid var(--glass-nested-border)',
                          borderRadius: '12px', color: 'var(--text)', fontSize: '0.85rem',
                          outline: 'none', width: '180px', flexShrink: 0, cursor: 'pointer'
                        }}
                      >
                        <option value="all">جميع الحالات</option>
                        {activeTab === 'orders' ? (
                          <>
                            <option value="pending">قيد المراجعة</option>
                            <option value="processing">جاري التفعيل</option>
                            <option value="awaiting_payment">بانتظار الدفع</option>
                            <option value="paid">تم الدفع ونشط</option>
                            <option value="rejected">مرفوض</option>
                            <option value="cancelled">ملغي</option>
                            <option value="expired">منتهي الصلاحية</option>
                          </>
                        ) : activeTab === 'renewals' ? (
                          <>
                            <option value="pending">معلق</option>
                            <option value="approved">تم التجديد</option>
                            <option value="rejected">مرفوض</option>
                          </>
                        ) : activeTab === 'gmail_accounts' ? (
                          <>
                            <option value="Available">متاح</option>
                            <option value="Full">ممتلئ</option>
                            <option value="Expired">منتهي</option>
                            <option value="Disabled">ملغي</option>
                          </>
                        ) : activeTab === 'users' ? (
                          <>
                            <option value="admin">المشرفين (Admins)</option>
                            <option value="customer">العملاء (Customers)</option>
                          </>
                        ) : (
                          <>
                            <option value="active">نشط</option>
                            <option value="expired">منتهي الصلاحية</option>
                          </>
                        )}
                      </select>
                    )}

                    {activeTab === 'products' && (
                      <button
                        onClick={() => { setIsAdding(true); setEditingItem(null); setFormFields({ name: '', slug: '', description: '', is_active: true }); }}
                        style={{
                          padding: '10px 18px', fontWeight: 800, borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer',
                          border: 'none', background: '#4f46e5', color: 'white',
                          display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0
                        }}
                      >
                        <PlusCircle size={16} />
                        <span>إضافة منتج</span>
                      </button>
                    )}
                    {activeTab === 'plans' && (
                      <button
                        onClick={() => { setIsAdding(true); setEditingItem(null); setFormFields({ name: '', product_id: productsList[0]?.id || '', duration_months: 1, price_iqd: 15000, official_price_iqd: null, badge: '', is_featured: false, display_order: 0, is_active: true }); }}
                        style={{
                          padding: '10px 18px', fontWeight: 800, borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer',
                          border: 'none', background: '#4f46e5', color: 'white',
                          display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0
                        }}
                      >
                        <PlusCircle size={16} />
                        <span>إضافة باقة جديدة</span>
                      </button>
                    )}
                    {activeTab === 'faqs' && (
                      <button
                        onClick={() => { setIsAdding(true); setEditingItem(null); setFormFields({ question: '', answer: '', display_order: 0, is_active: true }); }}
                        style={{
                          padding: '10px 18px', fontWeight: 800, borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer',
                          border: 'none', background: '#4f46e5', color: 'white',
                          display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0
                        }}
                      >
                        <PlusCircle size={16} />
                        <span>إضافة سؤال</span>
                      </button>
                    )}
                    {activeTab === 'testimonials' && (
                      <button
                        onClick={() => { setIsAdding(true); setEditingItem(null); setFormFields({ name: '', rating: 5, comment: '', display_order: 0, is_active: true }); }}
                        style={{
                          padding: '10px 18px', fontWeight: 800, borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer',
                          border: 'none', background: '#4f46e5', color: 'white',
                          display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0
                        }}
                      >
                        <PlusCircle size={16} />
                        <span>إضافة رأي عميل</span>
                      </button>
                    )}
                    {activeTab === 'gmail_accounts' && (
                      <button
                        onClick={() => { setIsAdding(true); setEditingItem(null); setFormFields({ max_members: 5, status: 'Available' }); }}
                        style={{
                          padding: '10px 18px', fontWeight: 800, borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer',
                          border: 'none', background: '#4f46e5', color: 'white',
                          display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0
                        }}
                      >
                        <PlusCircle size={16} />
                        <span>إضافة حساب Gmail جديد</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Tab Tables rendering wrapper */}
                {activeTab === 'faqs' ? (
                  <CatalogTabs
                    activeTab="faqs"
                    searchTerm={searchTerm}
                    productsList={productsList}
                    plans={plans}
                    faqsList={faqsList}
                    testimonialsList={testimonialsList}
                    onEdit={(item) => { setEditingItem(item); setFormFields(item); }}
                    onDeleteProduct={handleDeleteProduct}
                    onDeletePlan={handleDeletePlan}
                    onDeleteFaq={handleDeleteFaq}
                    onDeleteTestimonial={handleDeleteTestimonial}
                  />
                ) : (
                  <div className="admin-table-container">
                    <div className="admin-table-wrapper">
                      {activeTab === 'orders' && (
                        <OrdersTab
                          filteredOrders={filteredOrders}
                          plans={plans}
                          gmailAccountsList={gmailAccountsList}
                          getOrderStatusDetails={getOrderStatusDetails}
                          onOpenAssignModal={setAssigningOrder}
                          onProcess={handleProcessOrder}
                          onApprove={handleApproveOrder}
                          onMarkPaid={handleMarkPaid}
                          onSendReminder={handleSendReminder}
                          onSaveNotes={handleSaveNotes}
                          onReject={handleRejectOrder}
                        />
                      )}

                      {activeTab === 'renewals' && (
                        <RenewalsTab
                          filteredRenewals={filteredRenewals}
                          users={users}
                          onApproveRenewal={handleApproveRenewal}
                          onRejectRenewal={handleRejectRenewal}
                          getUserDisplayName={getUserDisplayName}
                        />
                      )}

                      {activeTab === 'subscriptions' && (
                        <SubscriptionsTab
                          filteredSubscriptions={filteredSubscriptions}
                          plans={plans}
                          gmailAccountsList={gmailAccountsList}
                          onOpenReassignModal={setAssigningSub}
                          onToggleSuspend={handleToggleSuspendSubscription}
                          suspendingSub={suspendingSub}
                          getUserDisplayName={getUserDisplayName}
                        />
                      )}

                      {activeTab === 'gmail_accounts' && (
                        <GmailAccountsTab
                          filteredGmailAccounts={filteredGmailAccounts}
                          subscriptions={subscriptions}
                          plans={plans}
                          onSelectDetails={setSelectedGmailAccountDetails}
                          onEdit={(gmail) => {
                            setEditingItem(gmail);
                            setFormFields({
                              email: gmail.email,
                              plan_id: gmail.plan_id,
                              twofa_secret: gmail.twofa_secret,
                              subscription_valid_until: gmail.subscription_valid_until ? gmail.subscription_valid_until.substring(0, 10) : '',
                              max_members: gmail.max_members,
                              status: gmail.status,
                              notes: gmail.notes || ''
                            });
                          }}
                          onDelete={handleDeleteGmailAccount}
                          showSnackbar={showSnackbar}
                        />
                      )}

                      {activeTab === 'users' && (
                        <UsersTab
                          filteredUsers={filteredUsers}
                          onToggleAdmin={handleToggleAdmin}
                        />
                      )}

                      {['products', 'plans', 'testimonials'].includes(activeTab) && (
                        <CatalogTabs
                          activeTab={activeTab as any}
                          searchTerm={searchTerm}
                          productsList={productsList}
                          plans={plans}
                          faqsList={faqsList}
                          testimonialsList={testimonialsList}
                          onEdit={(item) => { setEditingItem(item); setFormFields(item); }}
                          onDeleteProduct={handleDeleteProduct}
                          onDeletePlan={handleDeletePlan}
                          onDeleteFaq={handleDeleteFaq}
                          onDeleteTestimonial={handleDeleteTestimonial}
                        />
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* OVERLAY MODALS */}
      <AdminModals
        activeTab={activeTab}
        isAdding={isAdding}
        editingItem={editingItem}
        formFields={formFields}
        setFormFields={setFormFields}
        setIsAdding={setIsAdding}
        setEditingItem={setEditingItem}
        productsList={productsList}
        plans={plans}
        subscriptions={subscriptions}
        gmailAccountsList={gmailAccountsList}
        users={users}
        confirmConfig={confirmConfig}
        setConfirmConfig={setConfirmConfig}
        assigningOrder={assigningOrder}
        setAssigningOrder={setAssigningOrder}
        assigningSub={assigningSub}
        setAssigningSub={setAssigningSub}
        selectedGmailAccountDetails={selectedGmailAccountDetails}
        setSelectedGmailAccountDetails={setSelectedGmailAccountDetails}
        showSnackbar={showSnackbar}
        handleSaveProduct={handleSaveProduct}
        handleSavePlan={handleSavePlan}
        handleSaveFaq={handleSaveFaq}
        handleSaveTestimonial={handleSaveTestimonial}
        handleSaveGmailAccount={handleSaveGmailAccount}
        handleApproveOrderWithAccount={handleApproveOrderWithAccount}
        handleAssignGmailAccountToSubscription={handleAssignGmailAccountToSubscription}
      />

      {/* SNACKBAR */}
      {snackbar && (
        <div
          dir="rtl"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 18px',
            borderRadius: '16px',
            background: 'var(--surface-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: snackbar.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
            boxShadow: snackbar.type === 'success'
              ? '0 10px 30px rgba(0, 0, 0, 0.25), 0 0 20px rgba(34, 197, 94, 0.1)'
              : '0 10px 30px rgba(0, 0, 0, 0.25), 0 0 20px rgba(239, 68, 68, 0.1)',
            animation: 'slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            minWidth: '280px',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: snackbar.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: snackbar.type === 'success' ? '#4ade80' : '#f87171',
                flexShrink: 0
              }}
            >
              {snackbar.type === 'success' ? (
                <Check size={18} />
              ) : (
                <X size={18} />
              )}
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>
              {snackbar.message}
            </span>
          </div>

          <button
            onClick={() => setSnackbar(null)}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background 0.2s, color 0.2s',
              marginRight: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
