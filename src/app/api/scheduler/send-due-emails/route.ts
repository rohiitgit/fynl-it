// src/app/api/scheduler/send-due-emails/route.ts - With structured logging
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { emailService } from '@/lib/email/email-service';
import { schedulerLogger, emailLogger } from '@/lib/logger';
import { maskEmail } from '@/lib/logger/redact';

export const runtime = 'nodejs';

/**
 * Timing-safe comparison for scheduler API token
 * Prevents timing attacks by using constant-time comparison
 */
function verifySchedulerToken(authHeader: string | null): boolean {
  const expectedToken = process.env.SCHEDULER_API_KEY;
  if (!authHeader || !expectedToken) {
    return false;
  }

  const providedToken = authHeader.replace('Bearer ', '');

  // Ensure same length for timingSafeEqual - pad shorter string
  // This prevents length-based timing leaks
  const maxLen = Math.max(providedToken.length, expectedToken.length);
  const a = Buffer.alloc(maxLen, 0);
  const b = Buffer.alloc(maxLen, 0);
  a.write(providedToken);
  b.write(expectedToken);

  // Both buffers must match AND original lengths must be equal
  return crypto.timingSafeEqual(a, b) && providedToken.length === expectedToken.length;
}

// Define types for better type safety
interface InvoiceData {
    id: string;
    client_name: string;
    client_email: string;
    invoice_number: string;
    amount: number;
    currency: string;
    due_date: string;
    payment_link: string | null;
    status: string;
}

interface FollowUpWithInvoice {
    id: string;
    invoice_id: string;
    user_id: string;
    email_type: string;
    subject: string;
    content: string;
    scheduled_for: string;
    invoice: InvoiceData;
}

interface ProfileData {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    business_name: string | null;
    email: string | null;
}

interface EmailSendResult {
    followUpId: string;
    success: boolean;
    messageId?: string;
    error?: string;
    followUp: FollowUpWithInvoice;
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
        // Timing-safe API key authentication
        const authHeader = request.headers.get('authorization');
        if (!verifySchedulerToken(authHeader)) {
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
          client_name,
          client_email,
          invoice_number,
          amount,
          currency,
          due_date,
          payment_link,
          status
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

        // Transform the data to ensure proper typing (rename invoices -> invoice)
        const dueFollowUps: FollowUpWithInvoice[] = (rawFollowUps || []).map(item => {
            const invoiceData = Array.isArray(item.invoices) ? item.invoices[0] : item.invoices;
            return {
                id: item.id,
                invoice_id: item.invoice_id,
                user_id: item.user_id,
                email_type: item.email_type,
                subject: item.subject,
                content: item.content,
                scheduled_for: item.scheduled_for,
                invoice: invoiceData as InvoiceData,
            };
        }).filter(item => item.invoice);

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

        // Batch fetch all unique user profiles (single query instead of N queries)
        const uniqueUserIds = [...new Set(dueFollowUps.map(fu => fu.user_id))];
        const { data: profiles, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('user_id, first_name, last_name, business_name, email')
            .in('user_id', uniqueUserIds);

        if (profileError) {
            schedulerLogger.error({
                action: 'scheduler_profile_fetch_error',
                err: profileError,
            }, 'Failed to fetch user profiles');
            return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
        }

        // Build profile lookup map for O(1) access
        const profileMap = new Map<string, ProfileData>();
        (profiles || []).forEach(profile => {
            profileMap.set(profile.user_id, profile);
        });

        schedulerLogger.info({
            action: 'scheduler_profiles_loaded',
            uniqueUsers: uniqueUserIds.length,
            profilesLoaded: profileMap.size,
        }, `Loaded ${profileMap.size} profiles for ${uniqueUserIds.length} unique users`);

        // Accumulate results for batch operations
        const successfulSends: EmailSendResult[] = [];
        const failedSends: EmailSendResult[] = [];

        // Process emails in batches for efficiency
        // Batch size of 10 with 100ms delay between batches (instead of 1s per email)
        const BATCH_SIZE = 10;
        const BATCH_DELAY_MS = 100;

        for (let i = 0; i < dueFollowUps.length; i += BATCH_SIZE) {
            const batch = dueFollowUps.slice(i, i + BATCH_SIZE);

            // Process batch in parallel
            const batchResults = await Promise.all(
                batch.map(async (followUp): Promise<EmailSendResult> => {
                    try {
                        const profile = profileMap.get(followUp.user_id);

                        if (!profile) {
                            emailLogger.warn({
                                action: 'scheduler_profile_missing',
                                followUpId: followUp.id,
                                userId: followUp.user_id,
                            }, 'Profile not found for user, skipping email');

                            return {
                                followUpId: followUp.id,
                                success: false,
                                error: 'User profile not found',
                                followUp,
                            };
                        }

                        emailLogger.info({
                            action: 'scheduler_sending_email',
                            followUpId: followUp.id,
                            invoiceId: followUp.invoice_id,
                            emailType: followUp.email_type,
                            recipientMasked: maskEmail(followUp.invoice.client_email),
                        }, 'Sending scheduled follow-up email');

                        // Use the optimized method with pre-fetched data (no DB queries)
                        const result: EmailResult = await emailService.sendFollowUpEmailWithData({
                            followUp: {
                                id: followUp.id,
                                user_id: followUp.user_id,
                                subject: followUp.subject,
                                content: followUp.content,
                            },
                            invoice: followUp.invoice,
                            profile,
                        });

                        if (result.success) {
                            emailLogger.info({
                                action: 'scheduler_email_sent',
                                followUpId: followUp.id,
                                invoiceId: followUp.invoice_id,
                                messageId: result.messageId,
                            }, 'Scheduled email sent successfully');
                        } else {
                            emailLogger.error({
                                action: 'scheduler_email_failed',
                                followUpId: followUp.id,
                                invoiceId: followUp.invoice_id,
                                error: result.error,
                            }, 'Failed to send scheduled email');
                        }

                        return {
                            followUpId: followUp.id,
                            success: result.success,
                            messageId: result.messageId,
                            error: result.error,
                            followUp,
                        };
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        emailLogger.error({
                            action: 'scheduler_email_processing_error',
                            followUpId: followUp.id,
                            err: error instanceof Error ? error : new Error(String(error)),
                        }, 'Error processing scheduled follow-up');

                        return {
                            followUpId: followUp.id,
                            success: false,
                            error: errorMessage,
                            followUp,
                        };
                    }
                })
            );

            // Categorize batch results
            for (const result of batchResults) {
                if (result.success) {
                    successfulSends.push(result);
                } else {
                    failedSends.push(result);
                }
            }

            // Small delay between batches (not individual emails) to avoid rate limiting
            if (i + BATCH_SIZE < dueFollowUps.length) {
                await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
            }
        }

        // Batch update and insert operations (replaces N individual queries with ~4 queries)
        const batchTimestamp = new Date().toISOString();

        // Batch update successful follow-ups
        if (successfulSends.length > 0) {
            const successIds = successfulSends.map(s => s.followUpId);

            const { error: successUpdateError } = await supabaseAdmin
                .from('follow_ups')
                .update({
                    status: 'sent',
                    sent_at: batchTimestamp,
                })
                .in('id', successIds);

            if (successUpdateError) {
                schedulerLogger.error({
                    action: 'scheduler_batch_update_error',
                    err: successUpdateError,
                    type: 'success',
                }, 'Failed to batch update successful follow-ups');
            }

            // Update message_ids individually (minor overhead, but necessary for tracking)
            for (const send of successfulSends) {
                if (send.messageId) {
                    await supabaseAdmin
                        .from('follow_ups')
                        .update({ message_id: send.messageId })
                        .eq('id', send.followUpId);
                }
            }

            // Batch insert success email logs
            const successLogs = successfulSends.map(s => ({
                user_id: s.followUp.user_id,
                invoice_id: s.followUp.invoice_id,
                follow_up_id: s.followUpId,
                email_type: 'reminder',
                recipient_email: s.followUp.invoice.client_email,
                subject: s.followUp.subject,
                message_id: s.messageId || null,
                status: 'sent' as const,
            }));

            const { error: successLogError } = await supabaseAdmin
                .from('email_logs')
                .insert(successLogs);

            if (successLogError) {
                schedulerLogger.error({
                    action: 'scheduler_batch_log_error',
                    err: successLogError,
                    type: 'success',
                }, 'Failed to batch insert success email logs');
            }
        }

        // Batch update failed follow-ups
        if (failedSends.length > 0) {
            const failIds = failedSends.map(f => f.followUpId);

            const { error: failUpdateError } = await supabaseAdmin
                .from('follow_ups')
                .update({ status: 'failed' })
                .in('id', failIds);

            if (failUpdateError) {
                schedulerLogger.error({
                    action: 'scheduler_batch_update_error',
                    err: failUpdateError,
                    type: 'failed',
                }, 'Failed to batch update failed follow-ups');
            }

            // Batch insert failure email logs
            const failureLogs = failedSends.map(f => ({
                user_id: f.followUp.user_id,
                invoice_id: f.followUp.invoice_id,
                follow_up_id: f.followUpId,
                email_type: 'reminder',
                recipient_email: f.followUp.invoice.client_email,
                subject: f.followUp.subject,
                status: 'failed' as const,
                error_message: f.error || 'Unknown error',
            }));

            const { error: failLogError } = await supabaseAdmin
                .from('email_logs')
                .insert(failureLogs);

            if (failLogError) {
                schedulerLogger.error({
                    action: 'scheduler_batch_log_error',
                    err: failLogError,
                    type: 'failed',
                }, 'Failed to batch insert failure email logs');
            }
        }

        // Build results for response
        const results: ProcessingResult[] = [
            ...successfulSends.map(s => ({
                followUpId: s.followUpId,
                invoiceNumber: s.followUp.invoice.invoice_number,
                clientEmail: s.followUp.invoice.client_email,
                success: true,
            })),
            ...failedSends.map(f => ({
                followUpId: f.followUpId,
                invoiceNumber: f.followUp.invoice.invoice_number,
                clientEmail: f.followUp.invoice.client_email,
                success: false,
                error: f.error,
            })),
        ];

        const successCount = successfulSends.length;
        const errorCount = failedSends.length;
        const duration = Date.now() - startTime;

        schedulerLogger.info({
            action: 'scheduler_job_completed',
            duration,
            processed: dueFollowUps.length,
            successful: successCount,
            failed: errorCount,
        }, `Scheduler job completed: ${successCount} sent, ${errorCount} failed`);

        // Return appropriate HTTP status based on actual results
        const allSucceeded = errorCount === 0;
        const allFailed = successCount === 0 && errorCount > 0;

        let httpStatus: number;
        let message: string;

        if (allSucceeded) {
            httpStatus = 200;
            message = `Successfully sent ${successCount} emails`;
        } else if (allFailed) {
            httpStatus = 500;
            message = `All ${errorCount} emails failed to send`;
        } else {
            httpStatus = 207; // Multi-Status (partial success)
            message = `Partial success: ${successCount} sent, ${errorCount} failed`;
        }

        return NextResponse.json({
            success: allSucceeded,
            message,
            processed: dueFollowUps.length,
            successful: successCount,
            failed: errorCount,
            results
        }, { status: httpStatus });

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