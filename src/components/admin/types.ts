export interface Plan {
  id: string;
  name: string;
  duration_months: number;
  price_iqd: number;
  product_id: string;
}

export interface Order {
  id: string;
  user_id: string;
  plan_id: string;
  product_id?: string;
  gmail: string;
  phone: string;
  status: 'pending' | 'processing' | 'awaiting_payment' | 'paid' | 'expired' | 'rejected' | 'cancelled';
  created_at: string;
  activation_date?: string;
  payment_date?: string;
  notes?: string;
  user_email?: string;
  plan_name_snapshot?: string;
  gmail_account_id?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'suspended';
  gmail?: string;
  phone?: string;
  gmail_account_id?: string;
}

export interface GmailAccount {
  id: string;
  email: string;
  plan_id: string;
  twofa_secret: string;
  subscription_valid_until?: string;
  max_members: number;
  status: 'Available' | 'Full' | 'Expired' | 'Disabled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Renewal {
  id: string;
  user_id: string;
  subscription_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  gmail?: string;
  phone?: string;
  plan_name?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
}

export type AdminTab =
  | 'overview'
  | 'orders'
  | 'users'
  | 'renewals'
  | 'subscriptions'
  | 'products'
  | 'plans'
  | 'faqs'
  | 'testimonials'
  | 'settings'
  | 'gmail_accounts';
