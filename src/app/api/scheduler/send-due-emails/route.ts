// src/app/api/scheduler/send-due-emails/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emailService } from '@/lib/email/email-service';
import type { Database } from '@/types/supabase';

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

// Use service role key for server-side operations
const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(request: NextRequest) {
    try {
        // Simple API key authentication
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.SCHEDULER_API_KEY}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🕐 Starting scheduled email check...');

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
            console.error('Error fetching due follow-ups:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // Transform the data to ensure proper typing
        const dueFollowUps: FollowUpWithInvoice[] = (rawFollowUps || []).map(item => ({
            ...item,
            invoices: Array.isArray(item.invoices) ? item.invoices[0] : item.invoices
        })).filter(item => item.invoices) as FollowUpWithInvoice[];

        if (dueFollowUps.length === 0) {
            console.log('✅ No emails due to be sent');
            return NextResponse.json({
                success: true,
                message: 'No emails due',
                processed: 0
            });
        }

        console.log(`📧 Found ${dueFollowUps.length} emails to send`);

        const results: ProcessingResult[] = [];
        let successCount = 0;
        let errorCount = 0;

        // Process each due follow-up
        for (const followUp of dueFollowUps) {
            try {
                console.log(`Sending follow-up ${followUp.id} for invoice ${followUp.invoice_id} to ${followUp.invoices.client_email}`);

                const result: EmailResult = await emailService.sendFollowUpEmail(followUp.id);

                if (result.success) {
                    successCount++;
                    console.log(`✅ Sent email for follow-up ${followUp.id}`);

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
                    console.error(`❌ Failed to send follow-up ${followUp.id}:`, result.error);

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
                console.error(`❌ Error processing follow-up ${followUp.id}:`, errorMessage);
                results.push({
                    followUpId: followUp.id,
                    success: false,
                    error: errorMessage
                });
            }
        }

        console.log(`🎉 Completed: ${successCount} sent, ${errorCount} failed`);

        return NextResponse.json({
            success: true,
            message: `Processed ${dueFollowUps.length} emails`,
            processed: dueFollowUps.length,
            successful: successCount,
            failed: errorCount,
            results
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Scheduler failed';
        console.error('Scheduler error:', errorMessage);
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