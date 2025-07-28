// src/app/api/webhooks/razorpay/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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

interface RazorpayPaymentEvent {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        email: string;
        contact: string;
        notes: Record<string, string>;
        created_at: number;
      };
    };
  };
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

export async function POST(request: NextRequest) {
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
    const event: RazorpayPaymentEvent = JSON.parse(body);
    console.log(`📥 Processing event: ${event.event}`);

    // Only process successful payment events
    if (event.event !== 'payment.captured') {
      console.log(`ℹ️ Ignoring event: ${event.event}`);
      return NextResponse.json({ message: 'Event ignored' });
    }

    const payment = event.payload.payment.entity;
    console.log(`💳 Payment captured: ${payment.id} for amount ${payment.amount/100}`);

    // Find the invoice using payment metadata
    let invoice;
    
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

    // Fallback: Try to find by amount and email
    if (!invoice) {
      console.log(`🔍 Searching by amount (${payment.amount/100}) and email (${payment.email})`);
      const { data, error } = await supabaseAdmin
        .from('invoices')
        .select('*')
        .eq('amount', payment.amount / 100) // Razorpay sends amount in paise
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
      return NextResponse.json({ 
        message: 'Payment received but no matching invoice found',
        payment_id: payment.id 
      });
    }

    console.log(`✅ Found matching invoice: ${invoice.invoice_number}`);

    // Update invoice status to paid
    const { error: updateError } = await supabaseAdmin
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        auto_detected: true,
        razorpay_payment_id: payment.id
      })
      .eq('id', invoice.id);

    if (updateError) {
      console.error('❌ Failed to update invoice:', updateError);
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
    }

    // Cancel all pending follow-ups for this invoice
    await supabaseAdmin
      .from('follow_ups')
      .update({ status: 'cancelled' })
      .eq('invoice_id', invoice.id)
      .eq('status', 'scheduled');

    console.log('🛑 Cancelled pending follow-ups');

    // Log the payment event
    try {
      await supabaseAdmin.from('payment_events').insert({
        invoice_id: invoice.id,
        payment_provider: 'razorpay',
        external_payment_id: payment.id,
        event_type: 'payment.captured',
        amount: payment.amount / 100,
        currency: payment.currency,
        status: 'processed',
        webhook_data: event
      });
    } catch (logError) {
      console.error('⚠️ Failed to log payment event:', logError);
      // Don't fail the webhook for logging issues
    }

    console.log(`🎉 Payment processing completed for invoice ${invoice.invoice_number}`);

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      invoice_id: invoice.id,
      payment_id: payment.id
    });

  } catch (error) {
    console.error('💥 Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    webhook: 'razorpay-payment-detection',
    timestamp: new Date().toISOString()
  });
}