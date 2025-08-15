-- supabase/migrations/5_upi_enhancements.sql
-- Add UPI-specific fields to support Razorpay payment links
-- Add Razorpay payment link ID to track generated links
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS razorpay_link_id TEXT;

-- Add UPI-specific metadata
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS upi_link TEXT;

ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- Create index for payment link lookups
CREATE INDEX IF NOT EXISTS idx_invoices_razorpay_link_id ON public.invoices (razorpay_link_id);

-- Add UPI payment method to payment_events
ALTER TABLE public.payment_events
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Update existing Razorpay payments to include UPI method
UPDATE public.payment_events
SET
    payment_method = 'upi'
WHERE
    payment_provider = 'razorpay'
    AND payment_method IS NULL;

-- Add constraint to ensure valid payment methods
ALTER TABLE public.payment_events ADD CONSTRAINT payment_events_method_check CHECK (
    payment_method IN (
        'upi',
        'card',
        'netbanking',
        'wallet',
        'emi',
        'other'
    )
);

-- Create view for UPI payment analytics
CREATE
OR REPLACE VIEW public.upi_payment_analytics AS
SELECT
    i.user_id,
    COUNT(*) as total_upi_invoices,
    COUNT(
        CASE
            WHEN i.status = 'paid' THEN 1
        END
    ) as paid_upi_invoices,
    AVG(
        CASE
            WHEN i.status = 'paid'
            AND i.paid_at IS NOT NULL THEN EXTRACT(
                HOURS
                FROM
                    i.paid_at - i.created_at
            )
        END
    ) as avg_hours_to_payment,
    SUM(i.amount) as total_upi_amount,
    SUM(
        CASE
            WHEN i.status = 'paid' THEN i.amount
            ELSE 0
        END
    ) as paid_upi_amount
FROM
    public.invoices i
WHERE
    i.payment_provider = 'razorpay'
GROUP BY
    i.user_id;

-- Grant permissions for the new view
GRANT
SELECT
    ON public.upi_payment_analytics TO authenticated;

-- Add helpful comments
COMMENT ON COLUMN public.invoices.razorpay_link_id IS 'Razorpay payment link ID for tracking';

COMMENT ON COLUMN public.invoices.upi_link IS 'Direct UPI link for payments';

COMMENT ON COLUMN public.invoices.qr_code_url IS 'QR code URL for UPI payments';

COMMENT ON VIEW public.upi_payment_analytics IS 'Analytics for UPI payment performance';
