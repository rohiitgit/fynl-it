// src/lib/services/payment-events-service.ts
// Service layer for payment event idempotency and tracking

import { supabaseAdmin } from '@/lib/supabase-admin';
import { paymentLogger } from '@/lib/logger';
import type { Json } from '@/types/supabase';

export interface PaymentEventData {
  paymentProvider: string;
  externalPaymentId: string;
  eventType: string;
  razorpayEventId: string | null;
  invoiceId: string | null;
  amount: number | null;
  currency: string | null;
  paymentMethod: string | null;
  webhookData: Json;
}

class PaymentEventsService {
  /**
   * Check if a webhook event has already been processed and record it if new.
   * Uses database unique constraint to handle race conditions from concurrent webhook delivery.
   */
  async recordIfNew(
    eventData: PaymentEventData
  ): Promise<{ isNew: boolean; existingId?: string }> {
    const {
      paymentProvider,
      externalPaymentId,
      eventType,
      razorpayEventId,
      invoiceId,
      amount,
      currency,
      paymentMethod,
      webhookData,
    } = eventData;

    // Check if this event was already processed
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('payment_events')
      .select('id')
      .eq('payment_provider', paymentProvider)
      .eq('external_payment_id', externalPaymentId)
      .eq('event_type', eventType)
      .maybeSingle();

    if (checkError) {
      paymentLogger.error({
        action: 'idempotency_check_failed',
        paymentId: externalPaymentId,
        eventType,
        err: checkError,
      }, 'Failed to check for existing payment event');
      throw new Error('Idempotency check failed');
    }

    if (existing) {
      paymentLogger.info({
        action: 'duplicate_webhook_detected',
        paymentId: externalPaymentId,
        eventType,
        existingRecordId: existing.id,
      }, 'Duplicate webhook detected - event already processed');
      return { isNew: false, existingId: existing.id };
    }

    // Attempt to insert a new record
    // The unique constraint will reject duplicates from concurrent requests
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('payment_events')
      .insert({
        invoice_id: invoiceId,
        payment_provider: paymentProvider,
        external_payment_id: externalPaymentId,
        razorpay_event_id: razorpayEventId,
        event_type: eventType,
        amount,
        currency,
        status: 'processed',
        payment_method: paymentMethod,
        webhook_data: webhookData,
      })
      .select('id')
      .single();

    if (insertError) {
      // Check if this is a unique constraint violation (code 23505)
      if (insertError.code === '23505') {
        paymentLogger.info({
          action: 'concurrent_duplicate_rejected',
          paymentId: externalPaymentId,
          eventType,
        }, 'Concurrent duplicate webhook rejected by database constraint');
        return { isNew: false };
      }

      // Other database errors should be thrown
      paymentLogger.error({
        action: 'payment_event_insert_failed',
        paymentId: externalPaymentId,
        eventType,
        err: insertError,
      }, 'Failed to insert payment event record');
      throw insertError;
    }

    paymentLogger.debug({
      action: 'webhook_event_recorded',
      paymentId: externalPaymentId,
      eventType,
      eventRecordId: inserted.id,
    }, 'Successfully recorded webhook event');

    return { isNew: true };
  }

  /**
   * Update the invoice_id on a payment event record after invoice is identified
   */
  async updateWithInvoice(
    externalPaymentId: string,
    eventType: string,
    invoiceId: string
  ): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('payment_events')
      .update({ invoice_id: invoiceId })
      .eq('external_payment_id', externalPaymentId)
      .eq('event_type', eventType);

    if (error) {
      paymentLogger.error({
        action: 'payment_event_invoice_update_failed',
        paymentId: externalPaymentId,
        invoiceId,
        err: error,
      }, 'Failed to update payment event with invoice ID');
      return false;
    }

    return true;
  }
}

export const paymentEventsService = new PaymentEventsService();
