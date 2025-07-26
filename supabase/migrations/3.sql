-- supabase/migrations/2_add_email_functionality.sql
-- Incremental migration to add email functionality to existing database

-- Add custom domain fields to existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_domain TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_from_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_from_name TEXT;

-- Add email tracking fields to existing follow_ups table
ALTER TABLE public.follow_ups ADD COLUMN IF NOT EXISTS message_id TEXT;
ALTER TABLE public.follow_ups ADD COLUMN IF NOT EXISTS delivery_status TEXT;
ALTER TABLE public.follow_ups ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.follow_ups ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMP WITH TIME ZONE;

-- Update follow_ups email_type check constraint to include new types
ALTER TABLE public.follow_ups DROP CONSTRAINT IF EXISTS follow_ups_email_type_check;
ALTER TABLE public.follow_ups ADD CONSTRAINT follow_ups_email_type_check 
  CHECK (email_type IN ('initial', 'reminder', 'follow_up', 'urgent', 'final', 'thank_you'));

-- Create email_logs table for tracking all email activity
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  follow_up_id UUID REFERENCES public.follow_ups(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('reminder', 'thank_you', 'test')),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message_id TEXT, -- Resend message ID
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'bounced', 'complained', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for email_logs if table was just created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'email_logs' 
    AND policyname = 'Users can view their own email logs'
  ) THEN
    ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own email logs" 
    ON public.email_logs 
    FOR SELECT 
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can create their own email logs" 
    ON public.email_logs 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create new indexes for email functionality
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_invoice_id ON public.email_logs(invoice_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_follow_ups_message_id ON public.follow_ups(message_id);
CREATE INDEX IF NOT EXISTS idx_profiles_domain_verified ON public.profiles(domain_verified);

-- Create function to automatically update invoice status to overdue
CREATE OR REPLACE FUNCTION public.update_overdue_invoices()
RETURNS void AS $$
BEGIN
  UPDATE public.invoices 
  SET status = 'overdue'
  WHERE status = 'pending' 
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for invoice analytics
DROP VIEW IF EXISTS public.invoice_analytics;
CREATE VIEW public.invoice_analytics AS
SELECT 
  i.user_id,
  COUNT(*) as total_invoices,
  COUNT(CASE WHEN i.status = 'paid' THEN 1 END) as paid_invoices,
  COUNT(CASE WHEN i.status = 'pending' THEN 1 END) as pending_invoices,
  COUNT(CASE WHEN i.status = 'overdue' THEN 1 END) as overdue_invoices,
  SUM(i.amount) as total_amount,
  SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) as paid_amount,
  SUM(CASE WHEN i.status IN ('pending', 'overdue') THEN i.amount ELSE 0 END) as pending_amount,
  AVG(CASE WHEN i.status = 'paid' AND i.paid_at IS NOT NULL 
      THEN EXTRACT(DAYS FROM i.paid_at - i.due_date) END) as avg_days_to_payment
FROM public.invoices i
GROUP BY i.user_id;

-- Create view for email activity
DROP VIEW IF EXISTS public.email_activity;
CREATE VIEW public.email_activity AS
SELECT 
  el.user_id,
  el.invoice_id,
  i.client_name,
  i.invoice_number,
  el.email_type,
  el.status,
  el.sent_at,
  el.delivered_at,
  el.opened_at,
  el.clicked_at,
  CASE 
    WHEN el.opened_at IS NOT NULL THEN true 
    ELSE false 
  END as was_opened,
  CASE 
    WHEN el.clicked_at IS NOT NULL THEN true 
    ELSE false 
  END as was_clicked
FROM public.email_logs el
JOIN public.invoices i ON el.invoice_id = i.id
ORDER BY el.sent_at DESC;

-- Grant permissions (in case they don't exist)
DO $$
BEGIN
  GRANT SELECT ON public.invoice_analytics TO authenticated;
  GRANT SELECT ON public.email_activity TO authenticated;
EXCEPTION WHEN others THEN
  NULL; -- Ignore if permissions already exist
END $$;