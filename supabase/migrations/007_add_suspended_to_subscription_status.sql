-- Add Suspended to subscription status check constraint
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS chk_subscription_status;
ALTER TABLE public.subscriptions ADD CONSTRAINT chk_subscription_status CHECK (status IN ('Active', 'Expired', 'Cancelled', 'Suspended'));
