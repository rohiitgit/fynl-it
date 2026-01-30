-- supabase/migrations/8_email_idempotency.sql
-- Add idempotency for email sending to prevent duplicate thank-you emails

-- Create email_sends table for tracking sent emails
CREATE TABLE IF NOT EXISTS public.email_sends (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    email_type TEXT NOT NULL, -- 'thank_you', 'reminder_1', 'reminder_2', etc.
    recipient_email TEXT NOT NULL,
    message_id TEXT, -- Resend message ID for tracking
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CRITICAL: Unique constraint for idempotency
-- Prevents duplicate thank-you emails (one per invoice)
-- For reminders, we use email_type to distinguish different tiers
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_sends_idempotency
ON public.email_sends (invoice_id, email_type);

-- Enable RLS for email_sends
ALTER TABLE public.email_sends ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own email sends
CREATE POLICY "Users can view their own email sends" ON public.email_sends
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = email_sends.invoice_id
        AND invoices.user_id = auth.uid()
    )
);

-- Policy: System can insert email sends (for webhooks/scheduler)
CREATE POLICY "System can insert email sends" ON public.email_sends
FOR INSERT WITH CHECK (true);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_email_sends_invoice_id
ON public.email_sends (invoice_id);

CREATE INDEX IF NOT EXISTS idx_email_sends_email_type
ON public.email_sends (email_type);

CREATE INDEX IF NOT EXISTS idx_email_sends_sent_at
ON public.email_sends (sent_at DESC);

-- Add comments for documentation
COMMENT ON TABLE public.email_sends IS
'Tracks all emails sent per invoice for idempotency and audit purposes';

COMMENT ON INDEX idx_email_sends_idempotency IS
'Ensures only one email of each type is sent per invoice';

COMMENT ON COLUMN public.email_sends.email_type IS
'Type of email: thank_you, reminder_1, reminder_2, reminder_3, reminder_4, reminder_5';

COMMENT ON COLUMN public.email_sends.message_id IS
'Resend API message ID for delivery tracking';
