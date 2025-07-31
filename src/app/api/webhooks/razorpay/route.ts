// src/app/api/webhooks/razorpay/route.ts - TypeScript Compliant Version
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const runtime = 'nodejs';


// Use service role key for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

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
    console.error('Signature verification error:', error);
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
  console.log(`💳 Payment captured: ${payment.id} for amount ₹${payment.amount/100} via ${payment.method || 'unknown'}`);

  // Find the invoice using payment metadata
  let invoice = null;
  
  // Try to find invoice by notes (custom fields)
  if (payment.notes?.invoice_id) {
    console.log(`🔍 Looking for invoice: ${payment.notes.invoice_id}`);
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
    console.log(`🔍 Looking for invoice by link ID: ${payment.notes.razorpay_link_id}`);
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
    console.log(`🔍 Searching by amount (₹${payment.amount/100}) and email (${payment.email})`);
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
    console.log(`⚠️ No matching invoice found for payment ${payment.id}`);
    return {
      success: false,
      message: 'Payment received but no matching invoice found',
      payment_id: payment.id 
    };
  }

  console.log(`✅ Found matching invoice: ${invoice.invoice_number}`);

  // Get payment method details
  const paymentDetails = getPaymentMethodDetails(payment);
  const paymentMethod = paymentDetails.method;

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
    console.error('❌ Failed to update invoice:', updateError);
    throw new Error('Failed to update invoice');
  }

  // Cancel all pending follow-ups for this invoice
  const { error: cancelError } = await supabaseAdmin
    .from('follow_ups')
    .update({ status: 'cancelled' })
    .eq('invoice_id', invoice.id)
    .eq('status', 'scheduled');

  if (cancelError) {
    console.error('⚠️ Failed to cancel follow-ups:', cancelError);
  } else {
    console.log('🛑 Cancelled pending follow-ups');
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
      payment_method: paymentMethod,
      webhook_data: {
        event_data: event,
        payment_details: paymentDetails,
        fees: {
          fee: payment.fee ? payment.fee / 100 : 0,
          tax: payment.tax ? payment.tax / 100 : 0
        }
      }
    });
    console.log(`📊 Payment event logged with method: ${paymentMethod}`);
  } catch (logError) {
    console.error('⚠️ Failed to log payment event:', logError);
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
      }).catch(err => console.error('Thank you email failed:', err));
    }
  } catch (emailError) {
    console.error('⚠️ Thank you email trigger failed:', emailError);
  }

  return {
    success: true,
    message: 'Payment processed successfully',
    invoice_id: invoice.id,
    payment_id: payment.id,
    payment_method: paymentMethod,
    amount: payment.amount / 100
  };
}

async function handlePaymentLinkEvent(event: RazorpayPaymentLinkEvent): Promise<ProcessResult> {
  const paymentLink = event.payload.payment_link.entity;
  console.log(`🔗 Payment link event: ${event.event} for link ${paymentLink.id}`);

  // Handle payment link specific events
  if (event.event === 'payment_link.paid') {
    // Find invoice by payment link ID
    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('razorpay_link_id', paymentLink.id)
      .single();

    if (error || !invoice) {
      console.log(`⚠️ No invoice found for payment link ${paymentLink.id}`);
      return { success: false, message: 'Invoice not found for payment link' };
    }

    // The actual payment details will come via payment.captured event
    // This is just for tracking link usage
    console.log(`✅ Payment link ${paymentLink.id} was used for invoice ${invoice.invoice_number}`);
  }

  return { success: true, message: 'Payment link event processed' };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🔔 Razorpay webhook received');

    // Get the raw body and signature
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      console.error('❌ Missing Razorpay signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('❌ Missing RAZORPAY_WEBHOOK_SECRET');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    if (!verifyRazorpaySignature(body, signature, webhookSecret)) {
      console.error('❌ Invalid Razorpay signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the webhook payload
    const event: RazorpayPaymentEvent | RazorpayPaymentLinkEvent = JSON.parse(body);
    console.log(`📥 Processing event: ${event.event}`);

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
        console.log(`ℹ️ Ignoring event: ${event.event}`);
        return NextResponse.json({ message: `Event ${event.event} ignored` });
    }

    if (result.success) {
      console.log(`🎉 Event processing completed: ${event.event}`);
      return NextResponse.json(result);
    } else {
      console.log(`⚠️ Event processing failed: ${result.message}`);
      return NextResponse.json(result, { status: 200 }); // Return 200 to avoid retries
    }

  } catch (error) {
    console.error('💥 Webhook processing error:', error);
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