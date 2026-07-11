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
  // Uses DB unique constraint to handle concurrent duplicate delivery atomically
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
      if (insertError.code === '23505') { // unique constraint — concurrent duplicate
        paymentLogger.info({
          action: 'concurrent_duplicate_rejected',
          paymentId: externalPaymentId,
          eventType,
        }, 'Concurrent duplicate webhook rejected by database constraint');
        return { isNew: false };
      }

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

}

export const paymentEventsService = new PaymentEventsService();
