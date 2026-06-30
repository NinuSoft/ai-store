import React from 'react';
import { User } from 'lucide-react';
import type { Subscription } from '../types';

interface WelcomeBannerProps {
  profile: any;
  greeting: string;
  activeSub: Subscription | undefined;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  profile,
  greeting,
  activeSub
}) => {
  return (
    <div className="dash-welcome animate-fade-in" style={{ marginBottom: '28px' }}>
      <div className="flex items-center gap-5 flex-wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className="dash-avatar">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile?.full_name || 'user'} />
          ) : (
            <User size={26} />
          )}
        </div>
        <div className="flex flex-col" style={{ gap: '2px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {greeting} 👋
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
            {profile?.full_name || 'مرحباً بك'}
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {activeSub?.status === 'active'
              ? 'اشتراكك نشط ومفعّل — استمتع بمزايا Google AI Pro'
              : activeSub?.status === 'suspended'
                ? 'اشتراكك معلّق حالياً — يرجى التواصل مع الدعم الفني'
                : activeSub?.status === 'expired'
                  ? 'انتهت صلاحية اشتراكك — جدّد الآن لاستئناف الخدمة'
                  : 'لا يوجد اشتراك مفعّل بعد — تصفح الباقات وابدأ الآن'}
          </span>
        </div>
      </div>
    </div>
  );
};
