-- supabase/migrations/9_invoice_unique_constraints.sql
-- Add unique constraints to prevent duplicate payment associations

-- Unique constraint on razorpay_payment_id
-- Ensures a single payment cannot be associated with multiple invoices
-- Partial index excludes NULL values (invoices without payments yet)
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_unique_razorpay_payment_id
ON public.invoices (razorpay_payment_id)
WHERE razorpay_payment_id IS NOT NULL;

-- Unique constraint on razorpay_link_id
-- Ensures a single payment link cannot be associated with multiple invoices
-- Partial index excludes NULL values (invoices without payment links)
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_unique_razorpay_link_id
ON public.invoices (razorpay_link_id)
WHERE razorpay_link_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON INDEX idx_invoices_unique_razorpay_payment_id IS
'Ensures one-to-one relationship between Razorpay payments and invoices';

COMMENT ON INDEX idx_invoices_unique_razorpay_link_id IS
'Ensures one-to-one relationship between Razorpay payment links and invoices';
