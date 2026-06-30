import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
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
        padding: '14px 0',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
      }}
    >
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
          <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.01em' }}>
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

        {/* Desktop Nav links */}
        <nav className="flex items-center gap-2">
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
          {user ? (
            profile?.is_admin ? (
              <Link
                to="/admin"
                className="btn btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.875rem', borderRadius: '9999px' }}
              >
                لوحة الإدارة
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="btn btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.875rem', borderRadius: '9999px' }}
              >
                لوحة التحكم
              </Link>
            )
          ) : (
            <button
              onClick={() => signInWithGoogle().catch(err => console.error('Sign-in error:', err))}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                padding: '8px 14px',
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
              تسجيل الدخول
            </button>
          )}
          <button
            onClick={() => scrollToSection('pricing')}
            className="btn btn-primary"
            style={{ padding: '9px 22px', fontSize: '0.875rem', borderRadius: '9999px', fontWeight: 700 }}
          >
            اشترك الآن
          </button>
        </div>
      </div>
    </header>
  );
};
