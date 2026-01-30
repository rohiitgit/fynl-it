-- supabase/migrations/6_webhook_idempotency.sql
-- Add idempotency support for webhook processing to prevent duplicate events

-- Add column for Razorpay's event ID (X-Razorpay-Event-Id header)
ALTER TABLE public.payment_events
ADD COLUMN IF NOT EXISTS razorpay_event_id TEXT;

-- Add payment_method column if missing (for tracking payment method used)
ALTER TABLE public.payment_events
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- CRITICAL: Unique constraint for idempotency
-- This prevents the same payment+event_type combination from being processed twice
-- PostgreSQL will reject duplicate INSERTs, which we handle in application code
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_events_idempotency
ON public.payment_events (payment_provider, external_payment_id, event_type);

-- Index for audit lookups by Razorpay event ID
CREATE INDEX IF NOT EXISTS idx_payment_events_razorpay_event_id
ON public.payment_events (razorpay_event_id);

-- Add comments for documentation
COMMENT ON INDEX idx_payment_events_idempotency IS
'Ensures webhook idempotency - prevents duplicate processing of the same payment event';

COMMENT ON COLUMN public.payment_events.razorpay_event_id IS
'Razorpay X-Razorpay-Event-Id header value for audit trail';

COMMENT ON COLUMN public.payment_events.payment_method IS
'Payment method used (upi, card, netbanking, wallet)';
