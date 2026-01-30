-- supabase/migrations/7_payment_transaction.sql
-- Add atomic transaction function for payment processing
-- This ensures all payment-related updates happen atomically or not at all

-- Create enum for payment processing result
DO $$ BEGIN
    CREATE TYPE payment_process_result AS (
        success BOOLEAN,
        is_duplicate BOOLEAN,
        cancelled_followups INTEGER,
        error_message TEXT
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create the atomic payment processing function
CREATE OR REPLACE FUNCTION process_payment_captured(
    p_invoice_id UUID,
    p_payment_id TEXT,
    p_payment_provider TEXT,
    p_paid_at TIMESTAMPTZ,
    p_event_type TEXT,
    p_razorpay_event_id TEXT,
    p_amount DECIMAL,
    p_currency TEXT,
    p_payment_method TEXT,
    p_webhook_data JSONB
) RETURNS JSONB AS $$
DECLARE
    v_cancelled_count INTEGER;
    v_existing_event UUID;
BEGIN
    -- All operations run in a single transaction by default in plpgsql

    -- 1. Check for duplicate event (idempotency)
    SELECT id INTO v_existing_event
    FROM payment_events
    WHERE payment_provider = p_payment_provider
      AND external_payment_id = p_payment_id
      AND event_type = p_event_type
    LIMIT 1;

    IF v_existing_event IS NOT NULL THEN
        -- Already processed - return success with duplicate flag
        RETURN jsonb_build_object(
            'success', true,
            'is_duplicate', true,
            'cancelled_followups', 0,
            'existing_event_id', v_existing_event
        );
    END IF;

    -- 2. Insert payment event record
    BEGIN
        INSERT INTO payment_events (
            invoice_id,
            payment_provider,
            external_payment_id,
            event_type,
            razorpay_event_id,
            amount,
            currency,
            payment_method,
            status,
            webhook_data,
            processed_at
        ) VALUES (
            p_invoice_id,
            p_payment_provider,
            p_payment_id,
            p_event_type,
            p_razorpay_event_id,
            p_amount,
            p_currency,
            p_payment_method,
            'processed',
            p_webhook_data,
            NOW()
        );
    EXCEPTION WHEN unique_violation THEN
        -- Concurrent duplicate - another transaction beat us
        RETURN jsonb_build_object(
            'success', true,
            'is_duplicate', true,
            'cancelled_followups', 0,
            'message', 'Concurrent duplicate rejected by constraint'
        );
    END;

    -- 3. Mark invoice as paid
    UPDATE invoices SET
        status = 'paid',
        paid_at = p_paid_at,
        auto_detected = true,
        razorpay_payment_id = p_payment_id,
        payment_reference = p_payment_id,
        payment_provider = p_payment_provider
    WHERE id = p_invoice_id;

    IF NOT FOUND THEN
        -- Invoice not found - rollback will happen automatically on exception
        RAISE EXCEPTION 'Invoice not found: %', p_invoice_id;
    END IF;

    -- 4. Cancel all pending follow-ups for this invoice
    UPDATE follow_ups
    SET status = 'cancelled'
    WHERE invoice_id = p_invoice_id
      AND status = 'scheduled';

    GET DIAGNOSTICS v_cancelled_count = ROW_COUNT;

    -- Return success
    RETURN jsonb_build_object(
        'success', true,
        'is_duplicate', false,
        'cancelled_followups', v_cancelled_count
    );

EXCEPTION WHEN OTHERS THEN
    -- Any error will cause the entire transaction to rollback
    RETURN jsonb_build_object(
        'success', false,
        'is_duplicate', false,
        'cancelled_followups', 0,
        'error_message', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION process_payment_captured TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION process_payment_captured IS
'Atomically processes a captured payment: records event, updates invoice, cancels follow-ups.
All operations succeed or fail together. Handles idempotency via unique constraint.';
