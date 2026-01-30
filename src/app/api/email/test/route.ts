import { NextRequest, NextResponse } from 'next/server';
import { resend, DEFAULT_FROM_EMAIL } from '@/lib/email/resend-client';
import { supabase } from '@/lib/supabase';
import { applyRateLimit, addRateLimitHeaders } from '@/lib/rate-limit/rate-limiter';
import { EMAIL_RATE_LIMIT } from '@/lib/rate-limit/config';
import { createAuthRequiredResponse } from '@/lib/rate-limit/responses';
import { emailLogger } from '@/lib/logger';
import { maskEmail } from '@/lib/logger/redact';
import { testEmailSchema, formatValidationErrors } from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createAuthRequiredResponse();
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return createAuthRequiredResponse();
    }

    // 2. Check rate limit
    const rateLimitResult = await applyRateLimit(request, user.id, EMAIL_RATE_LIMIT, 'email');
    if (rateLimitResult.response) {
      return rateLimitResult.response; // Rate limit exceeded
    }

    // 3. Validate the request body
    const body = await request.json();
    const validation = testEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatValidationErrors(validation.error) },
        { status: 400 }
      );
    }

    const { testEmail } = validation.data;

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
      emailLogger.error({
        action: 'test_email_send_failed',
        userId: user.id,
        recipientMasked: maskEmail(testEmail),
        err: error instanceof Error ? error : new Error(String(error)),
      }, 'Resend error while sending test email');
      return NextResponse.json(
        { error: error.message || 'Failed to send test email' },
        { status: 500 }
      );
    }

    // 4. Return response with rate limit headers
    const jsonResponse = NextResponse.json({
      success: true,
      messageId: data?.id,
      message: 'Test email sent successfully',
    });
    return addRateLimitHeaders(jsonResponse, rateLimitResult);
  } catch (error) {
    emailLogger.error({
      action: 'test_email_api_error',
      err: error instanceof Error ? error : new Error(String(error)),
    }, 'Test email API error');
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}