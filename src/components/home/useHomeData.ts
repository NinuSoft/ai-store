import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Plan } from './types';

export const useHomeData = () => {
  const { user, profile, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Plans & CRO States
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);
  const [whatsappNum, setWhatsappNum] = useState('9647750977509');

  // Listen to redirect query param from protected route guards
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('login') === 'true') {
      signInWithGoogle().catch(err => console.error('Redirect sign-in error:', err));
      navigate('/', { replace: true });
    }
  }, [location, navigate, signInWithGoogle]);

  // Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price_iqd', { ascending: true });
      if (!error && data) {
        setPlans(data);
      }
    };
    fetchPlans();
  }, []);

  // Fetch settings (WhatsApp number)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*');
        if (!error && data) {
          const wa = data.find((s: any) => s.key === 'whatsapp');
          if (wa && wa.value) {
            let val = typeof wa.value === 'string' ? JSON.parse(wa.value).value : wa.value.value;
            if (val) {
              const cleanNum = val.replace(/\D/g, '');
              setWhatsappNum(cleanNum);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching settings from Supabase:', err);
      }
    };
    fetchSettings();
  }, []);

  // Handle hash scrolling on page load/navigate
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        const timer = setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [location]);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsOrderModalOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return {
    user,
    profile,
    plans,
    selectedPlan,
    setSelectedPlan,
    isOrderModalOpen,
    setIsOrderModalOpen,
    isContactMenuOpen,
    setIsContactMenuOpen,
    whatsappNum,
    signInWithGoogle,
    handleSelectPlan,
    scrollToSection
  };
};
