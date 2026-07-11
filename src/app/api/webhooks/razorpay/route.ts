import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { applyRateLimit } from '@/lib/rate-limit/rate-limiter';
import { WEBHOOK_RATE_LIMIT } from '@/lib/rate-limit/config';
import { paymentLogger, securityLogger } from '@/lib/logger';
import {
  paymentProcessorService,
  type RazorpayPaymentEntity,
} from '@/lib/services/payment-processor';
import { invoiceService } from '@/lib/services/invoice-service';

export const runtime = 'nodejs';

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

async function handlePaymentCaptured(
  event: RazorpayPaymentEvent,
  razorpayEventId: string | null
): Promise<ProcessResult> {
  const payment = event.payload.payment.entity;

  const result = await paymentProcessorService.processPaymentCaptured(
    payment,
    razorpayEventId,
    event
  );

  if (result.success && result.invoiceId && !result.isDuplicate) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl) {
      fetch(`${appUrl}/api/email/send-thank-you`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: result.invoiceId }),
      }).catch((err) => {
        paymentLogger.error({
          action: 'thank_you_email_failed',
          invoiceId: result.invoiceId,
          err: err instanceof Error ? err : new Error(String(err)),
        }, 'Thank you email API call failed');
      });
    }
  }

  return {
    success: result.success,
    message: result.message,
    invoice_id: result.invoiceId,
    payment_id: result.paymentId,
    payment_method: result.paymentMethod,
    amount: result.amount,
  };
}

async function handlePaymentLinkEvent(
  event: RazorpayPaymentLinkEvent
): Promise<ProcessResult> {
  const paymentLink = event.payload.payment_link.entity;

  paymentLogger.info({
    action: 'payment_link_event',
    event: event.event,
    linkId: paymentLink.id,
    status: paymentLink.status,
  }, 'Payment link event received');

  if (event.event === 'payment_link.paid') {
    const invoice = await invoiceService.findAnyByRazorpayLinkId(paymentLink.id);

    if (!invoice) {
      paymentLogger.warn({
        action: 'payment_link_invoice_not_found',
        linkId: paymentLink.id,
      }, 'No invoice found for payment link');
      return { success: false, message: 'Invoice not found for payment link' };
    }

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
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  try {
    paymentLogger.info({
      action: 'webhook_received',
      ip: clientIp,
    }, 'Razorpay webhook received');

    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    // rate-limit unsigned requests to prevent endpoint probing
    if (!signature) {
      const rateLimitResult = await applyRateLimit(request, null, WEBHOOK_RATE_LIMIT, 'webhook');
      if (rateLimitResult.response) {
        securityLogger.warn({
          action: 'webhook_rate_limit_exceeded',
          ip: clientIp,
          reason: 'missing_signature',
        }, 'Webhook rate limit exceeded for unsigned request');
        return rateLimitResult.response;
      }
      securityLogger.error({
        action: 'webhook_missing_signature',
      }, 'Webhook missing Razorpay signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      securityLogger.error({
        action: 'webhook_secret_not_configured',
      }, 'RAZORPAY_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Valid signatures bypass rate limiting; failed signatures are rate-limited to prevent brute-force
    if (!verifyRazorpaySignature(body, signature, webhookSecret)) {
      const rateLimitResult = await applyRateLimit(request, null, WEBHOOK_RATE_LIMIT, 'webhook');
      if (rateLimitResult.response) {
        securityLogger.warn({
          action: 'webhook_rate_limit_exceeded',
          ip: clientIp,
          reason: 'invalid_signature',
        }, 'Webhook rate limit exceeded for invalid signature');
        return rateLimitResult.response;
      }
      securityLogger.error({
        action: 'webhook_invalid_signature',
        ip: clientIp,
      }, 'Invalid Razorpay webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event: RazorpayPaymentEvent | RazorpayPaymentLinkEvent = JSON.parse(body);
    const razorpayEventId = request.headers.get('x-razorpay-event-id');

    paymentLogger.info({
      action: 'webhook_event_processing',
      event: event.event,
      razorpayEventId,
    }, 'Processing Razorpay webhook event');

    let result: ProcessResult;

    switch (event.event) {
      case 'payment.captured':
        result = await handlePaymentCaptured(event as RazorpayPaymentEvent, razorpayEventId);
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
      return NextResponse.json(result, { status: 200 }); // 200 prevents Razorpay retry storms
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
        details: error instanceof Error ? error.message : 'Unknown error',
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
      'payment_link.expired',
    ],
    supported_methods: ['upi', 'card', 'netbanking', 'wallet'],
  });
}
