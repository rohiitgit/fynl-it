// src/lib/email/email-service.ts
import { render } from '@react-email/render';
import { resend, DEFAULT_FROM_EMAIL } from './resend-client';
import { InvoiceReminderEmail, ThankYouEmail, type EmailTemplateProps } from './templates';
import { supabase } from '@/lib/supabase';
import React from 'react';

// Constants
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

export interface SendEmailParams {
  to: string;
  subject: string;
  invoiceId: string;
  userId: string;
  emailType: 'reminder' | 'thank_you';
  templateProps: EmailTemplateProps;
  fromEmail?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  /**
   * Send an invoice reminder email
   */
  async sendInvoiceReminder(params: SendEmailParams): Promise<EmailResult> {
    try {
      const {
        to,
        subject,
        invoiceId,
        userId,
        templateProps,
        fromEmail = DEFAULT_FROM_EMAIL,
        replyTo,
      } = params;

      // Render the email template with proper React element (async in newer versions)
      const emailHtml = await render(React.createElement(InvoiceReminderEmail, templateProps));

      // Send email via Resend
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html: emailHtml,
        replyTo: replyTo ?? fromEmail,
        tags: [
          { name: 'type', value: 'invoice-reminder' },
          { name: 'invoice-id', value: invoiceId },
          { name: 'user-id', value: userId },
        ],
      });

      if (error) {
        console.error('Resend error:', error);
        return {
          success: false,
          error: error.message ?? 'Failed to send email',
        };
      }

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send a thank you email for payment received
   */
  async sendThankYouEmail(params: SendEmailParams): Promise<EmailResult> {
    try {
      const {
        to,
        subject,
        invoiceId,
        userId,
        templateProps,
        fromEmail = DEFAULT_FROM_EMAIL,
        replyTo,
      } = params;

      // Render the email template with proper React element (async in newer versions)
      const emailHtml = await render(React.createElement(ThankYouEmail, templateProps));

      // Send email via Resend
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html: emailHtml,
        replyTo: replyTo ?? fromEmail,
        tags: [
          { name: 'type', value: 'thank-you' },
          { name: 'invoice-id', value: invoiceId },
          { name: 'user-id', value: userId },
        ],
      });

      if (error) {
        console.error('Resend error:', error);
        return {
          success: false,
          error: error.message ?? 'Failed to send email',
        };
      }

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send a follow-up email based on database record
   */
  /**
 * Send a follow-up email based on database record
 */
async sendFollowUpEmail(followUpId: string): Promise<EmailResult> {
  try {
    // Get follow-up details from database
    const { data: followUp, error: followUpError } = await supabase
      .from('follow_ups')
      .select(`
        *,
        invoices (
          id,
          client_name,
          client_email,
          invoice_number,
          amount,
          currency,
          due_date,
          payment_link,
          description,
          status
        )
      `)
      .eq('id', followUpId)
      .eq('status', 'scheduled')
      .single();

    if (followUpError || !followUp) {
      return {
        success: false,
        error: 'Follow-up not found or already processed',
      };
    }

    // Handle the case where invoices might be an array or single object
    const invoice = Array.isArray(followUp.invoices) 
      ? followUp.invoices[0] 
      : followUp.invoices;

    if (!invoice) {
      return {
        success: false,
        error: 'Invoice data not found',
      };
    }

    // Check if invoice is still unpaid
    if (invoice.status !== 'pending') {
      // Update follow-up status to cancelled since invoice is no longer pending
      await supabase
        .from('follow_ups')
        .update({ status: 'cancelled' })
        .eq('id', followUpId);
        
      return {
        success: false,
        error: 'Invoice is no longer pending - follow-up cancelled',
      };
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, business_name, email')
      .eq('user_id', followUp.user_id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: 'User profile not found',
      };
    }

    // Calculate days overdue
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    const daysOverdue = Math.max(0, Math.floor(diffTime / MILLISECONDS_PER_DAY));

    // Currency symbol mapping
    const currencySymbol = invoice.currency === 'USD' ? '$' : invoice.currency;
    const formattedAmount = `${currencySymbol}${invoice.amount.toFixed(2)}`;

    // Format user name
    const userName = `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim();

    // Prepare template props
    const templateProps: EmailTemplateProps = {
      clientName: invoice.client_name,
      invoiceNumber: invoice.invoice_number,
      amount: formattedAmount,
      dueDate: dueDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      daysOverdue,
      paymentLink: invoice.payment_link ?? undefined,
      userName,
      businessName: profile.business_name ?? undefined,
      customMessage: followUp.content, // Use the stored message content
    };

    // Send the email
    const result = await this.sendInvoiceReminder({
      to: invoice.client_email,
      subject: followUp.subject,
      invoiceId: invoice.id,
      userId: followUp.user_id,
      emailType: 'reminder',
      templateProps,
      replyTo: profile.email ?? undefined,
    });

    // Update follow-up status in database
    if (result.success) {
      await supabase
        .from('follow_ups')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString(),
          message_id: result.messageId || null
        })
        .eq('id', followUpId);
    } else {
      await supabase
        .from('follow_ups')
        .update({ status: 'failed' })
        .eq('id', followUpId);
    }

    return result;
  } catch (error) {
    console.error('Error sending follow-up email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

  /**
   * Test email configuration
   */
  async testEmailConfiguration(testEmail: string): Promise<EmailResult> {
    try {
      const testEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>🎉 Email Configuration Test</h2>
          <p>If you&apos;re receiving this email, your Nudgr email configuration is working correctly!</p>
          <p>You can now send automated invoice reminders to your clients.</p>
          <hr style="margin: 20px 0; border: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is a test email from Nudgr. You can safely ignore or delete this message.
          </p>
        </div>
      `;

      const { data, error } = await resend.emails.send({
        from: DEFAULT_FROM_EMAIL,
        to: testEmail,
        subject: 'Nudgr Email Test',
        html: testEmailHtml,
        tags: [{ name: 'type', value: 'test' }],
      });

      if (error) {
        return {
          success: false,
          error: error.message ?? 'Failed to send test email',
        };
      }

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();