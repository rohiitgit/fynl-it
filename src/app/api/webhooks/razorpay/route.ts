// src/app/api/webhooks/razorpay/route.ts - With structured logging
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';
import { applyRateLimit } from '@/lib/rate-limit/rate-limiter';
import { WEBHOOK_RATE_LIMIT } from '@/lib/rate-limit/config';
import { paymentLogger, securityLogger } from '@/lib/logger';
import { maskEmail } from '@/lib/logger/redact';

export const runtime = 'nodejs';

interface RazorpayCard {
  network: string;
  type: string;
  last4?: string;
  issuer?: string;
}

interface RazorpayPaymentEntity {
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
  card?: RazorpayCard;
  notes: Record<string, string>;
  created_at: number;
  fee?: number;
  tax?: number;
}

interface RazorpayPaymentEvent {
  event: string;
  payload: {
    payment: {
      entity: RazorpayPaymentEntity;
    };
  };
}

interface RazorpayPaymentLinkEntity {
  id: string;
  status: string;
  amount: number;
  currency: string;
  created_at: number;
  payments?: Array<Record<string, unknown>>;
}

interface RazorpayPaymentLinkEvent {
  event: string;
  payload: {
    payment_link: {
      entity: RazorpayPaymentLinkEntity;
    };
  };
}

interface PaymentMethodDetails {
  method: string;
  vpa?: string;
  provider?: string;
  network?: string;
  type?: string;
  last4?: string;
  bank?: string;
  wallet?: string;
}

interface ProcessResult {
  success: boolean;
  message: string;
  payment_id?: string;
  invoice_id?: string;
  payment_method?: string;
  amount?: number;
}

function verifyRazorpaySignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    );
  } catch (error) {
    securityLogger.error({
      action: 'signature_verification_error',
      err: error instanceof Error ? error : new Error(String(error)),
    }, 'Webhook signature verification failed');
    return false;
  }
}

function detectPaymentMethod(payment: RazorpayPaymentEntity): string {
  if (payment.method) {
    return payment.method.toLowerCase();
  }
  
  // Fallback detection based on available fields
  if (payment.vpa) return 'upi';
  if (payment.card) return 'card';
  if (payment.bank) return 'netbanking';
  if (payment.wallet) return 'wallet';
  return 'other';
}

function getPaymentMethodDetails(payment: RazorpayPaymentEntity): PaymentMethodDetails {
  const method = detectPaymentMethod(payment);
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

async function handlePaymentCaptured(event: RazorpayPaymentEvent): Promise<ProcessResult> {
  const payment = event.payload.payment.entity;
  const paymentMethod = detectPaymentMethod(payment);

  paymentLogger.info({
    action: 'payment_captured',
    paymentId: payment.id,
    amount: payment.amount / 100,
    currency: payment.currency,
    method: paymentMethod,
  }, 'Payment captured from Razorpay');

  // Find the invoice using payment metadata
  let invoice = null;

  // Try to find invoice by notes (custom fields)
  if (payment.notes?.invoice_id) {
    paymentLogger.debug({
      action: 'invoice_lookup_by_id',
      invoiceId: payment.notes.invoice_id,
      paymentId: payment.id,
    }, 'Looking for invoice by ID');

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', payment.notes.invoice_id)
      .eq('status', 'pending')
      .single();

    if (!error && data) {
      invoice = data;
    }
  }

  // Fallback: Try to find by Razorpay link ID
  if (!invoice && payment.notes?.razorpay_link_id) {
    paymentLogger.debug({
      action: 'invoice_lookup_by_link',
      razorpayLinkId: payment.notes.razorpay_link_id,
      paymentId: payment.id,
    }, 'Looking for invoice by payment link ID');

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('razorpay_link_id', payment.notes.razorpay_link_id)
      .eq('status', 'pending')
      .single();

    if (!error && data) {
      invoice = data;
    }
  }

  // Fallback: Try to find by amount and email
  if (!invoice) {
    paymentLogger.debug({
      action: 'invoice_lookup_by_amount_email',
      amount: payment.amount / 100,
      emailMasked: maskEmail(payment.email),
      paymentId: payment.id,
    }, 'Searching for invoice by amount and email');

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('amount', payment.amount / 100)
      .eq('client_email', payment.email)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (!error && data && data.length > 0) {
      invoice = data[0];
    }
  }

  if (!invoice) {
    paymentLogger.warn({
      action: 'invoice_not_found',
      paymentId: payment.id,
      amount: payment.amount / 100,
      emailMasked: maskEmail(payment.email),
    }, 'No matching invoice found for payment');
    return {
      success: false,
      message: 'Payment received but no matching invoice found',
      payment_id: payment.id
    };
  }

  paymentLogger.info({
    action: 'invoice_matched',
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoice_number,
    paymentId: payment.id,
  }, 'Successfully matched payment to invoice');

  // Get payment method details
  const paymentDetails = getPaymentMethodDetails(payment);

  // Update invoice status to paid with enhanced fields
  const { error: updateError } = await supabaseAdmin
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      auto_detected: true,
      razorpay_payment_id: payment.id,
      payment_reference: payment.id,
      payment_provider: 'razorpay'
    })
    .eq('id', invoice.id);

  if (updateError) {
    paymentLogger.error({
      action: 'invoice_update_failed',
      invoiceId: invoice.id,
      paymentId: payment.id,
      err: updateError,
    }, 'Failed to update invoice status to paid');
    throw new Error('Failed to update invoice');
  }

  // Cancel all pending follow-ups for this invoice
  const { error: cancelError } = await supabaseAdmin
    .from('follow_ups')
    .update({ status: 'cancelled' })
    .eq('invoice_id', invoice.id)
    .eq('status', 'scheduled');

  if (cancelError) {
    paymentLogger.error({
      action: 'followups_cancel_failed',
      invoiceId: invoice.id,
      err: cancelError,
    }, 'Failed to cancel follow-ups');
  } else {
    paymentLogger.info({
      action: 'followups_cancelled',
      invoiceId: invoice.id,
    }, 'Cancelled pending follow-ups');
  }

  // Log the payment event with enhanced details
  try {
    await supabaseAdmin.from('payment_events').insert({
      invoice_id: invoice.id,
      payment_provider: 'razorpay',
      external_payment_id: payment.id,
      event_type: 'payment.captured',
      amount: payment.amount / 100,
      currency: payment.currency,
      status: 'processed',
      payment_method: paymentDetails.method,
      webhook_data: JSON.parse(JSON.stringify({
        event_data: event,
        payment_details: paymentDetails,
        fees: {
          fee: payment.fee ? payment.fee / 100 : 0,
          tax: payment.tax ? payment.tax / 100 : 0
        }
      }))
    });
    paymentLogger.debug({
      action: 'payment_event_logged',
      invoiceId: invoice.id,
      paymentId: payment.id,
      method: paymentDetails.method,
    }, 'Payment event logged to database');
  } catch (logError) {
    paymentLogger.error({
      action: 'payment_event_log_failed',
      invoiceId: invoice.id,
      paymentId: payment.id,
      err: logError instanceof Error ? logError : new Error(String(logError)),
    }, 'Failed to log payment event');
    // Don't fail the webhook for logging issues
  }

  // Send thank you email for successful payment
  try {
    // We'll trigger this via a separate API call to avoid webhook timeout
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl) {
      fetch(`${appUrl}/api/email/send-thank-you`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id })
      }).catch(err => {
        paymentLogger.error({
          action: 'thank_you_email_failed',
          invoiceId: invoice.id,
          err: err instanceof Error ? err : new Error(String(err)),
        }, 'Thank you email API call failed');
      });
    }
  } catch (emailError) {
    paymentLogger.error({
      action: 'thank_you_email_trigger_failed',
      invoiceId: invoice.id,
      err: emailError instanceof Error ? emailError : new Error(String(emailError)),
    }, 'Thank you email trigger failed');
  }

  return {
    success: true,
    message: 'Payment processed successfully',
    invoice_id: invoice.id,
    payment_id: payment.id,
    payment_method: paymentDetails.method,
    amount: payment.amount / 100
  };
}

async function handlePaymentLinkEvent(event: RazorpayPaymentLinkEvent): Promise<ProcessResult> {
  const paymentLink = event.payload.payment_link.entity;

  paymentLogger.info({
    action: 'payment_link_event',
    event: event.event,
    linkId: paymentLink.id,
    status: paymentLink.status,
  }, 'Payment link event received');

  // Handle payment link specific events
  if (event.event === 'payment_link.paid') {
    // Find invoice by payment link ID
    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('razorpay_link_id', paymentLink.id)
      .single();

    if (error || !invoice) {
      paymentLogger.warn({
        action: 'payment_link_invoice_not_found',
        linkId: paymentLink.id,
      }, 'No invoice found for payment link');
      return { success: false, message: 'Invoice not found for payment link' };
    }

    // The actual payment details will come via payment.captured event
    // This is just for tracking link usage
    paymentLogger.info({
      action: 'payment_link_used',
      linkId: paymentLink.id,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
    }, 'Payment link was successfully used');
  }

  return { success: true, message: 'Payment link event processed' };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    paymentLogger.info({
      action: 'webhook_received',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    }, 'Razorpay webhook received');

    // 1. Check rate limit first (by IP, no user authentication for webhooks)
    const rateLimitResult = await applyRateLimit(request, null, WEBHOOK_RATE_LIMIT, 'webhook');
    if (rateLimitResult.response) {
      securityLogger.warn({
        action: 'webhook_rate_limit_exceeded',
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      }, 'Webhook rate limit exceeded');
      return rateLimitResult.response; // Rate limit exceeded
    }

    // 2. Get the raw body and signature
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      securityLogger.error({
        action: 'webhook_missing_signature',
      }, 'Webhook missing Razorpay signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // 3. Verify webhook signature (primary security check)
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      securityLogger.error({
        action: 'webhook_secret_not_configured',
      }, 'RAZORPAY_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    if (!verifyRazorpaySignature(body, signature, webhookSecret)) {
      securityLogger.error({
        action: 'webhook_invalid_signature',
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      }, 'Invalid Razorpay webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the webhook payload
    const event: RazorpayPaymentEvent | RazorpayPaymentLinkEvent = JSON.parse(body);

    paymentLogger.info({
      action: 'webhook_event_processing',
      event: event.event,
    }, 'Processing Razorpay webhook event');

    let result: ProcessResult;

    // Handle different event types
    switch (event.event) {
      case 'payment.captured':
        result = await handlePaymentCaptured(event as RazorpayPaymentEvent);
        break;

      case 'payment_link.paid':
      case 'payment_link.cancelled':
      case 'payment_link.expired':
        result = await handlePaymentLinkEvent(event as RazorpayPaymentLinkEvent);
        break;

      default:
        paymentLogger.debug({
          action: 'webhook_event_ignored',
          event: event.event,
        }, 'Webhook event ignored (not handled)');
        return NextResponse.json({ message: `Event ${event.event} ignored` });
    }

    const duration = Date.now() - startTime;

    if (result.success) {
      paymentLogger.info({
        action: 'webhook_processing_completed',
        event: event.event,
        duration,
        paymentId: result.payment_id,
        invoiceId: result.invoice_id,
      }, 'Webhook event processing completed successfully');
      return NextResponse.json(result);
    } else {
      paymentLogger.warn({
        action: 'webhook_processing_failed',
        event: event.event,
        duration,
        message: result.message,
      }, 'Webhook event processing failed');
      return NextResponse.json(result, { status: 200 }); // Return 200 to avoid retries
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    paymentLogger.error({
      action: 'webhook_processing_error',
      duration,
      err: error instanceof Error ? error : new Error(String(error)),
    }, 'Webhook processing error');
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'healthy',
    webhook: 'razorpay-upi-payment-detection',
    timestamp: new Date().toISOString(),
    supported_events: [
      'payment.captured',
      'payment_link.paid',
      'payment_link.cancelled',
      'payment_link.expired'
    ],
    supported_methods: ['upi', 'card', 'netbanking', 'wallet']
  });
}