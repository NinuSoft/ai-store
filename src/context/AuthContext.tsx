import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
}

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch public.profiles profile row for extra metadata (phone, is_admin)
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId);

      if (error) throw error;

      if (data && data.length > 0) {
        const dbProfile = data[0];
        setProfile({
          id: dbProfile.id,
          phone: dbProfile.phone || '',
          email: dbProfile.email || '',
          full_name: dbProfile.full_name || '',
          avatar_url: dbProfile.avatar_url || '',
          is_admin: dbProfile.role === 'admin',
          created_at: dbProfile.created_at
        });
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const checkLocalhostMock = async () => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      try {
        const { data } = await supabase.from('profiles').select('*').limit(1);
        if (data && data.length > 0) {
          const p = data[0];
          setUser({
            id: p.id,
            email: p.email || 'test@gmail.com',
            user_metadata: {
              full_name: p.full_name || 'مستخدم تجريبي',
              avatar_url: p.avatar_url || ''
            }
          });
          setProfile({
            id: p.id,
            phone: p.phone || '',
            email: p.email || 'test@gmail.com',
            full_name: p.full_name || 'مستخدم تجريبي',
            avatar_url: p.avatar_url || '',
            is_admin: p.role === 'admin',
            created_at: p.created_at
          });
          setLoading(false);
          return true;
        }
      } catch (e) {
        console.error('Error fetching mock profile:', e);
      }
      // Fallback mock profile
      const mockId = '00000000-0000-0000-0000-000000000000';
      setUser({
        id: mockId,
        email: 'test@gmail.com',
        user_metadata: {
          full_name: 'مستخدم تجريبي',
          avatar_url: ''
        }
      });
      setProfile({
        id: mockId,
        phone: '07701234567',
        email: 'test@gmail.com',
        full_name: 'مستخدم تجريبي',
        avatar_url: '',
        is_admin: true,
        created_at: new Date().toISOString()
      });
      setLoading(false);
      return true;
    }
    return false;
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }: any) => {
      if (session) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        const mocked = await checkLocalhostMock();
        if (!mocked) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          const mocked = await checkLocalhostMock();
          if (!mocked) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      });
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
