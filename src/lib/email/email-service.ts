// src/lib/email/email-service.ts - Refactored with shared utilities
import React from 'react';
import { resend, DEFAULT_FROM_EMAIL } from './resend-client';
import { InvoiceReminderEmail, ThankYouEmail, type EmailTemplateProps } from './templates';
import { supabase } from '@/lib/supabase';
import { emailLogger } from '@/lib/logger';
import { sendEmail } from './send-email';
import { prepareTemplateProps, type InvoiceData, type ProfileData } from './format-utils';

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
    const { to, subject, invoiceId, userId, templateProps, fromEmail, replyTo } = params;

    return sendEmail({
      to,
      subject,
      template: React.createElement(InvoiceReminderEmail, templateProps),
      invoiceId,
      userId,
      emailType: 'reminder',
      fromEmail,
      replyTo,
    });
  }

  /**
   * Send a thank you email for payment received
   */
  async sendThankYouEmail(params: SendEmailParams): Promise<EmailResult> {
    const { to, subject, invoiceId, userId, templateProps, fromEmail, replyTo } = params;

    return sendEmail({
      to,
      subject,
      template: React.createElement(ThankYouEmail, templateProps),
      invoiceId,
      userId,
      emailType: 'thank_you',
      fromEmail,
      replyTo,
    });
  }

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

      // Use shared utility to prepare template props
      const templateProps = prepareTemplateProps(
        invoice as InvoiceData,
        profile as ProfileData,
        { customMessage: followUp.content }
      );

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
            message_id: result.messageId || null,
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
      emailLogger.error({
        action: 'follow_up_email_error',
        followUpId,
        err: error instanceof Error ? error : new Error(String(error)),
      }, 'Error sending follow-up email');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send a follow-up email using pre-fetched data (optimized for batch processing)
   * This method does NOT fetch from database - all data must be provided
   */
  async sendFollowUpEmailWithData(params: {
    followUp: {
      id: string;
      user_id: string;
      subject: string;
      content: string;
    };
    invoice: {
      id: string;
      client_name: string;
      client_email: string;
      invoice_number: string;
      amount: number;
      currency: string;
      due_date: string;
      payment_link: string | null;
    };
    profile: {
      first_name: string | null;
      last_name: string | null;
      business_name: string | null;
      email: string | null;
    };
  }): Promise<EmailResult> {
    const { followUp, invoice, profile } = params;

    try {
      // Use shared utility to prepare template props
      const templateProps = prepareTemplateProps(
        invoice as InvoiceData,
        profile as ProfileData,
        { customMessage: followUp.content }
      );

      // Send the email using existing method
      return await this.sendInvoiceReminder({
        to: invoice.client_email,
        subject: followUp.subject,
        invoiceId: invoice.id,
        userId: followUp.user_id,
        emailType: 'reminder',
        templateProps,
        replyTo: profile.email ?? undefined,
      });
    } catch (error) {
      emailLogger.error({
        action: 'follow_up_email_with_data_error',
        followUpId: followUp.id,
        err: error instanceof Error ? error : new Error(String(error)),
      }, 'Error sending follow-up email with pre-fetched data');
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
