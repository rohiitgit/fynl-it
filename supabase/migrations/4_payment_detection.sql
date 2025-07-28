-- supabase/migrations/4_payment_detection.sql
-- Add payment detection fields to invoices table
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS payment_provider TEXT;

ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS payment_reference TEXT;

ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS auto_detected BOOLEAN DEFAULT FALSE;

-- Add indexes for payment lookup
CREATE INDEX IF NOT EXISTS idx_invoices_payment_provider ON public.invoices (payment_provider);

CREATE INDEX IF NOT EXISTS idx_invoices_payment_reference ON public.invoices (payment_reference);

CREATE INDEX IF NOT EXISTS idx_invoices_razorpay_payment_id ON public.invoices (razorpay_payment_id);

-- Create payment_events table for webhook logging
CREATE TABLE
    IF NOT EXISTS public.payment_events (
        id UUID NOT NULL DEFAULT gen_random_uuid () PRIMARY KEY,
        invoice_id UUID REFERENCES public.invoices (id) ON DELETE CASCADE,
        payment_provider TEXT NOT NULL,
        external_payment_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        amount DECIMAL(10, 2),
        currency TEXT,
        status TEXT NOT NULL,
        webhook_data JSONB,
        processed_at TIMESTAMP
        WITH
            TIME ZONE NOT NULL DEFAULT now (),
            created_at TIMESTAMP
        WITH
            TIME ZONE NOT NULL DEFAULT now ()
    );

-- Enable RLS for payment_events
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- Create policy for payment_events
CREATE POLICY "Users can view their own payment events" ON public.payment_events FOR
SELECT
    USING (
        EXISTS (
            SELECT
                1
            FROM
                public.invoices
            WHERE
                invoices.id = payment_events.invoice_id
                AND invoices.user_id = auth.uid ()
        )
    );

CREATE POLICY "System can insert payment events" ON public.payment_events FOR INSERT
WITH
    CHECK (true);

-- Add indexes for payment events
CREATE INDEX IF NOT EXISTS idx_payment_events_invoice_id ON public.payment_events (invoice_id);

CREATE INDEX IF NOT EXISTS idx_payment_events_external_payment_id ON public.payment_events (external_payment_id);

CREATE INDEX IF NOT EXISTS idx_payment_events_provider ON public.payment_events (payment_provider);

-- Update existing invoices
UPDATE public.invoices
SET
    auto_detected = FALSE
WHERE
    auto_detected IS NULL;