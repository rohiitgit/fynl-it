import { NextRequest, NextResponse } from 'next/server';
import { resend, DEFAULT_FROM_EMAIL } from '@/lib/email/resend-client';

export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Test email address is required' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: testEmail,
      subject: 'Nudgr Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>🎉 Email Configuration Test</h2>
          <p>If you're receiving this email, your Nudgr email configuration is working correctly!</p>
          <p>You can now send automated invoice reminders to your clients.</p>
          <hr style="margin: 20px 0; border: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is a test email from Nudgr. You can safely ignore or delete this message.
          </p>
        </div>
      `,
      tags: [{ name: 'type', value: 'test' }],
    });

    if (error) {
      console.error('Resend error:', error); // Now using the error variable
      return NextResponse.json(
        { error: error.message || 'Failed to send test email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: 'Test email sent successfully',
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}