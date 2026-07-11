import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { resend, DEFAULT_FROM_EMAIL } from '@/lib/email/resend-client';
import { InvoiceReminderEmail, ThankYouEmail } from '@/lib/email/templates';
import { emailLogger } from '@/lib/logger';
import { maskEmail } from '@/lib/logger/redact';

export async function POST(request: NextRequest) {
  try {
    const { 
      type, 
      to, 
      subject, 
      templateProps, 
      fromEmail = DEFAULT_FROM_EMAIL,
      replyTo 
    } = await request.json();

    if (!type || !to || !subject || !templateProps) {
      return NextResponse.json(
        { error: 'Missing required fields: type, to, subject, templateProps' },
        { status: 400 }
      );
    }

    let emailHtml: string;
    
    if (type === 'reminder') {
      emailHtml = await render(<InvoiceReminderEmail {...templateProps} />);
    } else if (type === 'thank_you') {
      emailHtml = await render(<ThankYouEmail {...templateProps} />);
    } else {
      return NextResponse.json(
        { error: 'Invalid email type. Must be "reminder" or "thank_you"' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html: emailHtml,
      replyTo: replyTo || fromEmail,
      tags: [
        { name: 'type', value: type },
        { name: 'source', value: 'nudgr-app' },
      ],
    });

    if (error) {
      emailLogger.error({
        action: 'email_send_failed',
        recipientMasked: maskEmail(to),
        emailType: type,
        err: error instanceof Error ? error : new Error(String(error)),
      }, 'Resend error while sending email');
      return NextResponse.json(
        { error: error.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: 'Email sent successfully',
    });
  } catch (error) {
    emailLogger.error({
      action: 'email_api_error',
      err: error instanceof Error ? error : new Error(String(error)),
    }, 'Email API error');
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}