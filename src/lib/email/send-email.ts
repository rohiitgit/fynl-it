import { render } from '@react-email/render';
import { resend, DEFAULT_FROM_EMAIL } from './resend-client';
import { emailLogger } from '@/lib/logger';
import { maskEmail } from '@/lib/logger/redact';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  template: React.ReactElement;
  invoiceId: string;
  userId: string;
  emailType: 'reminder' | 'thank_you' | 'test';
  fromEmail?: string;
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const {
    to,
    subject,
    template,
    invoiceId,
    userId,
    emailType,
    fromEmail = DEFAULT_FROM_EMAIL,
    replyTo,
  } = options;

  const actionPrefix = emailType === 'thank_you' ? 'thank_you' : 'reminder';

  try {
    const emailHtml = await render(template);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html: emailHtml,
      replyTo: replyTo ?? fromEmail,
      tags: [
        { name: 'type', value: emailType === 'thank_you' ? 'thank-you' : 'invoice-reminder' },
        { name: 'invoice-id', value: invoiceId },
        { name: 'user-id', value: userId },
      ],
    });

    if (error) {
      emailLogger.error({
        action: `${actionPrefix}_email_send_failed`,
        recipientMasked: maskEmail(to),
        invoiceId,
        userId,
        err: error instanceof Error ? error : new Error(String(error)),
      }, `Resend error sending ${emailType} email`);

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
    emailLogger.error({
      action: `${actionPrefix}_email_service_error`,
      recipientMasked: maskEmail(to),
      invoiceId,
      userId,
      err: error instanceof Error ? error : new Error(String(error)),
    }, `Email service error sending ${emailType} email`);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
