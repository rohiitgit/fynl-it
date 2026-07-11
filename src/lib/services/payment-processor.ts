import { invoiceService } from './invoice-service';
import { paymentEventsService, type PaymentEventData } from './payment-events-service';
import { paymentLogger } from '@/lib/logger';
import { maskEmail } from '@/lib/logger/redact';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Json } from '@/types/supabase';

export interface RazorpayPaymentEntity {
  id: string;
  amount: number;
  currency: string;
  status: string;
  email: string;
  contact: string;
  method: string;
  vpa?: string;
  bank?: string;
  wallet?: string;
  card?: {
    network: string;
    type: string;
    last4?: string;
    issuer?: string;
  };
  notes: Record<string, string>;
  created_at: number;
  fee?: number;
  tax?: number;
}

export interface PaymentMethodDetails {
  method: string;
  vpa?: string;
  provider?: string;
  network?: string;
  type?: string;
  last4?: string;
  bank?: string;
  wallet?: string;
}

export interface ProcessPaymentResult {
  success: boolean;
  message: string;
  paymentId: string;
  invoiceId?: string;
  paymentMethod?: string;
  amount?: number;
  isDuplicate?: boolean;
}

interface TransactionResult {
  success: boolean;
  is_duplicate: boolean;
  cancelled_followups: number;
  existing_event_id: string | null;
  error_message: string | null;
  message: string | null;
}

class PaymentProcessorService {
  detectPaymentMethod(payment: RazorpayPaymentEntity): string {
    if (payment.method) {
      return payment.method.toLowerCase();
    }

    if (payment.vpa) return 'upi';
    if (payment.card) return 'card';
    if (payment.bank) return 'netbanking';
    if (payment.wallet) return 'wallet';
    return 'other';
  }

  getPaymentMethodDetails(payment: RazorpayPaymentEntity): PaymentMethodDetails {
    const method = this.detectPaymentMethod(payment);
    const details: PaymentMethodDetails = { method };

    switch (method) {
      case 'upi':
        details.vpa = payment.vpa;
        details.provider = payment.vpa?.split('@')[1] || 'unknown';
        break;
      case 'card':
        if (payment.card) {
          details.network = payment.card.network;
          details.type = payment.card.type;
          details.last4 = payment.card.last4;
        }
        break;
      case 'netbanking':
        details.bank = payment.bank;
        break;
      case 'wallet':
        details.wallet = payment.wallet;
        break;
    }

    return details;
  }

  // Atomic DB transaction: record event + mark invoice paid + cancel follow-ups (all or nothing)
  async processPaymentCaptured(
    payment: RazorpayPaymentEntity,
    razorpayEventId: string | null,
    webhookEvent: unknown
  ): Promise<ProcessPaymentResult> {
    const paymentMethod = this.detectPaymentMethod(payment);
    const paymentDetails = this.getPaymentMethodDetails(payment);

    paymentLogger.info({
      action: 'payment_captured',
      paymentId: payment.id,
      razorpayEventId,
      amount: payment.amount / 100,
      currency: payment.currency,
      method: paymentMethod,
    }, 'Payment captured from Razorpay');

    const invoice = await invoiceService.findByPaymentReference(
      payment.notes?.invoice_id,
      payment.notes?.razorpay_link_id
    );

    if (!invoice) {
      paymentLogger.warn({
        action: 'invoice_not_found',
        paymentId: payment.id,
        amount: payment.amount / 100,
        emailMasked: maskEmail(payment.email),
      }, 'No matching invoice found for payment');

      await this.recordOrphanPaymentEvent(payment, razorpayEventId, paymentDetails, webhookEvent);

      return {
        success: false,
        message: 'Payment received but no matching invoice found',
        paymentId: payment.id,
      };
    }

    paymentLogger.info({
      action: 'invoice_matched',
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      paymentId: payment.id,
    }, 'Successfully matched payment to invoice');

    const webhookData = JSON.parse(JSON.stringify({  // cast to Json-serialisable
      event_data: webhookEvent,
      payment_details: paymentDetails,
      fees: {
        fee: payment.fee ? payment.fee / 100 : 0,
        tax: payment.tax ? payment.tax / 100 : 0,
      },
    })) as Json;

    const { data, error } = await supabaseAdmin.rpc('process_payment_captured', {
      p_invoice_id: invoice.id,
      p_payment_id: payment.id,
      p_payment_provider: 'razorpay',
      p_paid_at: new Date().toISOString(),
      p_event_type: 'payment.captured',
      p_razorpay_event_id: razorpayEventId,
      p_amount: payment.amount / 100,
      p_currency: payment.currency,
      p_payment_method: paymentDetails.method,
      p_webhook_data: webhookData,
    });

    if (error) {
      paymentLogger.error({
        action: 'transaction_error',
        paymentId: payment.id,
        invoiceId: invoice.id,
        err: error,
      }, 'Atomic payment transaction failed');

      throw new Error(`Payment processing failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('Payment processing returned no data');
    }

    const result: TransactionResult = data;

    if (result.is_duplicate) {
      paymentLogger.info({
        action: 'duplicate_webhook_skipped',
        paymentId: payment.id,
        razorpayEventId,
        existingEventId: result.existing_event_id,
      }, 'Duplicate payment webhook - already processed');

      return {
        success: true,
        message: 'Payment already processed (duplicate webhook)',
        paymentId: payment.id,
        paymentMethod,
        amount: payment.amount / 100,
        isDuplicate: true,
      };
    }

    if (!result.success) {
      paymentLogger.error({
        action: 'transaction_failed',
        paymentId: payment.id,
        invoiceId: invoice.id,
        errorMessage: result.error_message,
      }, 'Payment transaction returned failure');

      return {
        success: false,
        message: result.error_message || 'Payment processing failed',
        paymentId: payment.id,
      };
    }

    paymentLogger.info({
      action: 'payment_processed_atomically',
      paymentId: payment.id,
      invoiceId: invoice.id,
      cancelledFollowups: result.cancelled_followups,
    }, 'Payment processed successfully with atomic transaction');

    return {
      success: true,
      message: 'Payment processed successfully',
      invoiceId: invoice.id,
      paymentId: payment.id,
      paymentMethod: paymentDetails.method,
      amount: payment.amount / 100,
    };
  }

  private async recordOrphanPaymentEvent(
    payment: RazorpayPaymentEntity,
    razorpayEventId: string | null,
    paymentDetails: PaymentMethodDetails,
    webhookEvent: unknown
  ): Promise<void> {
    const eventData: PaymentEventData = {
      paymentProvider: 'razorpay',
      externalPaymentId: payment.id,
      eventType: 'payment.captured',
      razorpayEventId,
      invoiceId: null,
      amount: payment.amount / 100,
      currency: payment.currency,
      paymentMethod: paymentDetails.method,
      webhookData: JSON.parse(JSON.stringify({
        event_data: webhookEvent,
        payment_details: paymentDetails,
        orphan_reason: 'no_matching_invoice',
        fees: {
          fee: payment.fee ? payment.fee / 100 : 0,
          tax: payment.tax ? payment.tax / 100 : 0,
        },
      })) as Json,
    };

    try {
      await paymentEventsService.recordIfNew(eventData);
    } catch (error) {
      paymentLogger.error({
        action: 'orphan_payment_record_failed',
        paymentId: payment.id,
        err: error instanceof Error ? error : new Error(String(error)),
      }, 'Failed to record orphan payment event');
    }
  }
}

export const paymentProcessorService = new PaymentProcessorService();
