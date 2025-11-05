// src/app/api/scheduler/send-due-emails/route.ts - With structured logging
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { emailService } from '@/lib/email/email-service';
import { schedulerLogger, emailLogger } from '@/lib/logger';
import { maskEmail } from '@/lib/logger/redact';

export const runtime = 'nodejs';


// Define types for better type safety
interface FollowUpWithInvoice {
    id: string;
    invoice_id: string;
    user_id: string;
    email_type: string;
    subject: string;
    content: string;
    scheduled_for: string;
    invoices: {
        id: string;
        client_email: string;
        status: string;
        client_name: string;
        invoice_number: string;
    };
}

interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

interface ProcessingResult {
    followUpId: string;
    invoiceNumber?: string;
    clientEmail?: string;
    success: boolean;
    error?: string;
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        // Simple API key authentication
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.SCHEDULER_API_KEY}`) {
            schedulerLogger.warn({
                action: 'scheduler_unauthorized',
            }, 'Unauthorized scheduler API request');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        schedulerLogger.info({
            action: 'scheduler_job_started',
        }, 'Starting scheduled email check');

        // Get all follow-ups that are due to be sent
        const now = new Date();
        const { data: rawFollowUps, error } = await supabaseAdmin
            .from('follow_ups')
            .select(`
        id,
        invoice_id,
        user_id,
        email_type,
        subject,
        content,
        scheduled_for,
        invoices!inner (
          id,
          client_email,
          status,
          client_name,
          invoice_number
        )
      `)
            .eq('status', 'scheduled')
            .lte('scheduled_for', now.toISOString())
            .eq('invoices.status', 'pending') // Only send for unpaid invoices
            .order('scheduled_for', { ascending: true });

        if (error) {
            schedulerLogger.error({
                action: 'scheduler_db_error',
                err: error,
            }, 'Failed to fetch due follow-ups');
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // Transform the data to ensure proper typing
        const dueFollowUps: FollowUpWithInvoice[] = (rawFollowUps || []).map(item => ({
            ...item,
            invoices: Array.isArray(item.invoices) ? item.invoices[0] : item.invoices
        })).filter(item => item.invoices) as FollowUpWithInvoice[];

        if (dueFollowUps.length === 0) {
            const duration = Date.now() - startTime;
            schedulerLogger.info({
                action: 'scheduler_job_completed',
                duration,
                processed: 0,
            }, 'No emails due to be sent');
            return NextResponse.json({
                success: true,
                message: 'No emails due',
                processed: 0
            });
        }

        schedulerLogger.info({
            action: 'scheduler_emails_found',
            count: dueFollowUps.length,
        }, `Found ${dueFollowUps.length} emails to send`);

        const results: ProcessingResult[] = [];
        let successCount = 0;
        let errorCount = 0;

        // Process each due follow-up
        for (const followUp of dueFollowUps) {
            try {
                emailLogger.info({
                    action: 'scheduler_sending_email',
                    followUpId: followUp.id,
                    invoiceId: followUp.invoice_id,
                    emailType: followUp.email_type,
                    recipientMasked: maskEmail(followUp.invoices.client_email),
                }, 'Sending scheduled follow-up email');

                const result: EmailResult = await emailService.sendFollowUpEmail(followUp.id);

                if (result.success) {
                    successCount++;
                    emailLogger.info({
                        action: 'scheduler_email_sent',
                        followUpId: followUp.id,
                        invoiceId: followUp.invoice_id,
                        messageId: result.messageId,
                    }, 'Scheduled email sent successfully');

                    // Log the email send
                    await supabaseAdmin.from('email_logs').insert({
                        user_id: followUp.user_id,
                        invoice_id: followUp.invoice_id,
                        follow_up_id: followUp.id,
                        email_type: 'reminder',
                        recipient_email: followUp.invoices.client_email,
                        subject: followUp.subject,
                        message_id: result.messageId || null,
                        status: 'sent'
                    });

                } else {
                    errorCount++;
                    emailLogger.error({
                        action: 'scheduler_email_failed',
                        followUpId: followUp.id,
                        invoiceId: followUp.invoice_id,
                        error: result.error,
                    }, 'Failed to send scheduled email');

                    // Log the failure
                    await supabaseAdmin.from('email_logs').insert({
                        user_id: followUp.user_id,
                        invoice_id: followUp.invoice_id,
                        follow_up_id: followUp.id,
                        email_type: 'reminder',
                        recipient_email: followUp.invoices.client_email,
                        subject: followUp.subject,
                        status: 'failed',
                        error_message: result.error || 'Unknown error'
                    });
                }

                results.push({
                    followUpId: followUp.id,
                    invoiceNumber: followUp.invoices.invoice_number,
                    clientEmail: followUp.invoices.client_email,
                    success: result.success,
                    error: result.error
                });

                // Add small delay between emails to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                errorCount++;
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                emailLogger.error({
                    action: 'scheduler_email_processing_error',
                    followUpId: followUp.id,
                    err: error instanceof Error ? error : new Error(String(error)),
                }, 'Error processing scheduled follow-up');
                results.push({
                    followUpId: followUp.id,
                    success: false,
                    error: errorMessage
                });
            }
        }

        const duration = Date.now() - startTime;
        schedulerLogger.info({
            action: 'scheduler_job_completed',
            duration,
            processed: dueFollowUps.length,
            successful: successCount,
            failed: errorCount,
        }, `Scheduler job completed: ${successCount} sent, ${errorCount} failed`);

        return NextResponse.json({
            success: true,
            message: `Processed ${dueFollowUps.length} emails`,
            processed: dueFollowUps.length,
            successful: successCount,
            failed: errorCount,
            results
        });

    } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Scheduler failed';
        schedulerLogger.error({
            action: 'scheduler_job_error',
            duration,
            err: error instanceof Error ? error : new Error(String(error)),
        }, 'Scheduler job failed');
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

// Health check endpoint
export async function GET() {
    return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'email-scheduler'
    });
}