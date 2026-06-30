export interface Plan {
  id: string;
  name: string;
  duration_months: number;
  price_iqd: number;
}

export interface Order {
  id: string;
  user_id: string;
  gmail: string;
  phone: string;
  status: 'pending' | 'processing' | 'awaiting_payment' | 'paid' | 'expired' | 'rejected' | 'cancelled';
  created_at: string;
  plan_id: string;
  activation_date?: string;
  payment_date?: string;
  notes?: string;
  plan_name_snapshot?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  product_id?: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'suspended';
  gmail?: string;
  phone?: string;
}

export interface Renewal {
  id: string;
  subscription_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_id?: string;
  gmail?: string;
  phone?: string;
  plan_name?: string;
}
