import React from 'react';
import { InvoiceReminderEmail, ThankYouEmail, type EmailTemplateProps } from './templates';
import { emailLogger } from '@/lib/logger';
import { sendEmail, type EmailResult } from './send-email';
import { prepareTemplateProps, type InvoiceData, type ProfileData } from './format-utils';

export type { EmailResult } from './send-email';

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

class EmailService {
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

  /** Uses pre-fetched data — no DB queries. Optimized for batch processing. */
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
      const templateProps = prepareTemplateProps(
        invoice as InvoiceData,
        profile as ProfileData,
        { customMessage: followUp.content }
      );

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

}

export const emailService = new EmailService();
