// src/app/api/email/send-thank-you/route.ts
// Handles thank you email sending triggered by payment webhooks
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { emailService } from '@/lib/email/email-service';
import { emailLogger } from '@/lib/logger';
import { maskEmail } from '@/lib/logger/redact';
import { thankYouEmailSchema, formatValidationErrors } from '@/lib/validation/schemas';
import { formatAmount } from '@/lib/email/format-utils';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = thankYouEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatValidationErrors(validation.error) },
        { status: 400 }
      );
    }

    const { invoiceId } = validation.data;

    emailLogger.info({
      action: 'thank_you_email_request',
      invoiceId,
    }, 'Processing thank you email request');

    // Fetch invoice with client details
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('id, client_email, client_name, invoice_number, amount, user_id, status')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      emailLogger.error({
        action: 'thank_you_email_invoice_not_found',
        invoiceId,
        err: invoiceError instanceof Error ? invoiceError : new Error(String(invoiceError)),
      }, 'Invoice not found for thank you email');
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Validate invoice is paid
    if (invoice.status !== 'paid') {
      emailLogger.warn({
        action: 'thank_you_email_invoice_not_paid',
        invoiceId,
        status: invoice.status,
      }, 'Attempted to send thank you email for unpaid invoice');
      return NextResponse.json(
        { error: 'Invoice is not marked as paid' },
        { status: 400 }
      );
    }

    // Check if a thank you email was already sent for this invoice (idempotency)
    const { data: existingEmail } = await supabaseAdmin
      .from('email_logs')
      .select('id, message_id, sent_at')
      .eq('invoice_id', invoiceId)
      .eq('email_type', 'thank_you')
      .eq('status', 'sent')
      .maybeSingle();

    if (existingEmail) {
      emailLogger.info({
        action: 'thank_you_email_already_sent',
        invoiceId,
        existingMessageId: existingEmail.message_id,
        sentAt: existingEmail.sent_at,
      }, 'Thank you email already sent for this invoice');
      return NextResponse.json({
        success: true,
        message: 'Thank you email already sent',
        messageId: existingEmail.message_id,
        alreadySent: true,
      });
    }

    // Fetch user profile for sender info
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name, business_name, preferred_from_email, preferred_from_name')
      .eq('id', invoice.user_id)
      .single();

    if (profileError || !profile) {
      emailLogger.error({
        action: 'thank_you_email_profile_not_found',
        invoiceId,
        userId: invoice.user_id,
        err: profileError instanceof Error ? profileError : new Error(String(profileError)),
      }, 'User profile not found for thank you email');
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Format amount for display using shared utility
    const formattedAmount = formatAmount(invoice.amount, 'INR');

    // Build user name from first/last name or preferred_from_name
    const userName = profile.preferred_from_name
      || [profile.first_name, profile.last_name].filter(Boolean).join(' ')
      || 'Your Service Provider';

    // Send the thank you email
    const result = await emailService.sendThankYouEmail({
      to: invoice.client_email,
      subject: `Payment Received - Thank You! (${invoice.invoice_number})`,
      invoiceId: invoice.id,
      userId: invoice.user_id,
      emailType: 'thank_you',
      templateProps: {
        clientName: invoice.client_name || 'Valued Client',
        invoiceNumber: invoice.invoice_number,
        amount: formattedAmount,
        dueDate: '', // Not relevant for thank you emails
        userName,
        businessName: profile.business_name || undefined,
      },
      fromEmail: profile.preferred_from_email || undefined,
      replyTo: profile.preferred_from_email || undefined,
    });

    // Log to email_logs table
    const subject = `Payment Received - Thank You! (${invoice.invoice_number})`;
    const { error: logError } = await supabaseAdmin
      .from('email_logs')
      .insert({
        user_id: invoice.user_id,
        invoice_id: invoice.id,
        email_type: 'thank_you',
        recipient_email: invoice.client_email,
        subject,
        message_id: result.messageId,
        status: result.success ? 'sent' : 'failed',
        error_message: result.error,
      });

    if (logError) {
      emailLogger.warn({
        action: 'thank_you_email_log_failed',
        invoiceId,
        err: logError instanceof Error ? logError : new Error(String(logError)),
      }, 'Failed to log thank you email to database');
    }

    if (!result.success) {
      emailLogger.error({
        action: 'thank_you_email_send_failed',
        invoiceId,
        recipientMasked: maskEmail(invoice.client_email),
        error: result.error,
      }, 'Failed to send thank you email');
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    emailLogger.info({
      action: 'thank_you_email_sent',
      invoiceId,
      recipientMasked: maskEmail(invoice.client_email),
      messageId: result.messageId,
    }, 'Thank you email sent successfully');

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });

  } catch (error) {
    emailLogger.error({
      action: 'thank_you_email_api_error',
      err: error instanceof Error ? error : new Error(String(error)),
    }, 'Thank you email API error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
