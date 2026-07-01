import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, LogIn, LayoutDashboard, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../../ThemeToggle';

interface HeaderProps {
  user: any;
  profile: any;
  signInWithGoogle: () => Promise<any>;
  scrollToSection: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  profile,
  signInWithGoogle,
  scrollToSection
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(24px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
        borderBottom: '1px solid var(--border)',
        zIndex: 1001,
        padding: '10px 0',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
      }}
    >
      <style>{`
        .header-btn {
          padding: 8px !important;
          min-width: unset !important;
        }
        @media (min-width: 640px) {
          .header-btn {
            padding: 8px 18px !important;
          }
        }
        .dashboard-header-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        @media (max-width: 639px) {
          .dashboard-header-btn {
            width: 40px !important;
            height: 40px !important;
            min-width: 40px !important;
            min-height: 40px !important;
            border-radius: 50% !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
            background: var(--surface-raised) !important;
            border: 1px solid var(--border) !important;
            box-shadow: var(--shadow) !important;
          }
        }
        .mobile-menu-toggle {
          display: flex !important;
          align-items: center;
          justify-content: center;
          background: var(--surface-raised) !important;
          border: 1px solid var(--border) !important;
          color: var(--text) !important;
          border-radius: 50% !important;
          width: 40px !important;
          height: 40px !important;
          min-width: 40px !important;
          min-height: 40px !important;
          padding: 0 !important;
          box-shadow: var(--shadow) !important;
          flex-shrink: 0 !important;
          cursor: pointer;
          transition: var(--transition) !important;
        }
        .mobile-menu-toggle:hover {
          background: var(--surface-alt) !important;
          border-color: var(--border-hover) !important;
          transform: scale(1.05);
        }
        .mobile-menu-toggle:active {
          transform: scale(0.95);
        }
        @media (min-width: 1024px) {
          .mobile-menu-toggle {
            display: none !important;
          }
        }
        .mobile-nav-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.18);
          animation: dropdown-slide-down 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          direction: rtl;
          z-index: 1002;
        }
        .mobile-nav-link {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-secondary);
          padding: 12px 20px;
          border-radius: 16px;
          background: rgba(148, 163, 184, 0.04);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: right;
          text-decoration: none;
          border: 1px solid transparent;
        }
        .mobile-nav-link:hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: var(--primary);
          transform: translateX(-6px);
        }
        @keyframes dropdown-slide-down {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div className="container flex items-center justify-between">

        {/* Brand logo */}
        <div
          className="flex items-center gap-3"
          style={{ cursor: 'pointer' }}
          onClick={() => scrollToSection('hero')}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-primary)',
              flexShrink: 0
            }}
          >
            <Sparkles size={18} color="white" />
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '-0.01em' }}>
            <span style={{ color: 'var(--logo-blue)' }}>Ninu</span>
            <span style={{
              background: 'linear-gradient(to right, var(--logo-blue) 50%, var(--text) 50%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>S</span>
            <span style={{ color: 'var(--text)' }}>oft</span>{' '}
            <span style={{ color: 'var(--secondary)' }}>AI</span>
          </span>
        </div>

        {/* Desktop Nav links - Hidden on mobile */}
        <nav className="hidden lg:flex items-center gap-2">
          {[
            { label: 'الرئيسية', id: 'hero' },
            { label: 'المميزات', id: 'benefits' },
            { label: 'الأسعار', id: 'pricing' },
            { label: 'الأسئلة الشائعة', id: 'faq' },
          ].map(({ label, id }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => { e.preventDefault(); scrollToSection(id); }}
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                padding: '7px 14px',
                borderRadius: '9999px',
                transition: 'var(--transition-sm)',
                display: 'block'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--primary-light)';
                (e.currentTarget as HTMLElement).style.color = 'var(--primary)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Auth + CTA */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Mobile Navigation Toggle */}
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="mobile-menu-toggle"
            aria-label="Toggle Menu"
          >
            {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {user ? (
            <Link
              to={profile?.is_admin ? "/admin" : "/dashboard"}
              className="btn btn-secondary header-btn dashboard-header-btn flex items-center gap-1.5"
              style={{ fontSize: '0.875rem', borderRadius: '9999px' }}
              title={profile?.is_admin ? "لوحة الإدارة" : "لوحة التحكم"}
            >
              <LayoutDashboard size={16} />
              <span className="hidden sm:inline">{profile?.is_admin ? 'لوحة الإدارة' : 'لوحة التحكم'}</span>
            </Link>
          ) : (
            <button
              onClick={() => signInWithGoogle().catch(err => console.error('Sign-in error:', err))}
              className="header-btn dashboard-header-btn flex items-center gap-1.5"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                borderRadius: '9999px',
                transition: 'var(--transition-sm)'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text)';
                (e.currentTarget as HTMLElement).style.background = 'var(--surface-alt)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">تسجيل الدخول</span>
            </button>
          )}

          <button
            onClick={() => scrollToSection('pricing')}
            className="btn btn-primary hidden sm:block"
            style={{ padding: '9px 22px', fontSize: '0.875rem', borderRadius: '9999px', fontWeight: 700 }}
          >
            اشترك الآن
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {isMobileNavOpen && (
        <div className="lg:hidden mobile-nav-dropdown">
          {[
            { label: 'الرئيسية', id: 'hero' },
            { label: 'المميزات', id: 'benefits' },
            { label: 'الأسعار', id: 'pricing' },
            { label: 'الأسئلة الشائعة', id: 'faq' },
          ].map(({ label, id }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(id);
                setIsMobileNavOpen(false);
              }}
              className="mobile-nav-link"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};
