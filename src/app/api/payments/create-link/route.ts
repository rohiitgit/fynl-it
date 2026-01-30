// src/app/api/payments/create-link/route.ts - With structured logging
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { razorpayUPIService } from '@/lib/payments/razorpay-upi';
import { applyRateLimit, addRateLimitHeaders } from '@/lib/rate-limit/rate-limiter';
import { PAYMENT_RATE_LIMIT } from '@/lib/rate-limit/config';
import { createAuthRequiredResponse } from '@/lib/rate-limit/responses';
import { paymentLogger, databaseLogger } from '@/lib/logger';
import { createPaymentLinkSchema, formatValidationErrors } from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
    try {
        // 1. Check authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return createAuthRequiredResponse();
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return createAuthRequiredResponse();
        }

        // 2. Check rate limit
        const rateLimitResult = await applyRateLimit(request, user.id, PAYMENT_RATE_LIMIT, 'payment');
        if (rateLimitResult.response) {
            return rateLimitResult.response; // Rate limit exceeded
        }

        // 3. Validate and process the request
        const body = await request.json();
        const validation = createPaymentLinkSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: formatValidationErrors(validation.error) },
                { status: 400 }
            );
        }

        const { invoiceId } = validation.data;

        // Get invoice details
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select(`
        *,
        profiles!inner(first_name, last_name, business_name)
      `)
            .eq('id', invoiceId)
            .eq('user_id', user.id)
            .single();

        if (invoiceError || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Get user profile
        const profile = Array.isArray(invoice.profiles) ? invoice.profiles[0] : invoice.profiles;
        const businessName = profile?.business_name ||
            `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
            'Your Business';

        // Create UPI payment link
        const paymentLink = await razorpayUPIService.createUPIPaymentLink({
            invoiceId: invoice.id,
            clientName: invoice.client_name,
            clientEmail: invoice.client_email,
            amount: invoice.amount,
            description: `Payment for Invoice ${invoice.invoice_number}${invoice.description ? ` - ${invoice.description}` : ''}`,
            businessName,
            notes: {
                invoice_number: invoice.invoice_number,
                due_date: invoice.due_date
            }
        });

        // Update invoice with payment link
        const { error: updateError } = await supabase
            .from('invoices')
            .update({
                payment_link: paymentLink.short_url,
                razorpay_link_id: paymentLink.id,
                payment_provider: 'razorpay'
            })
            .eq('id', invoiceId);

        if (updateError) {
            databaseLogger.error({
                action: 'invoice_payment_link_update_failed',
                invoiceId,
                userId: user.id,
                err: updateError,
            }, 'Failed to update invoice with payment link');
            // Don't fail the request, payment link is still created
        }

        // 4. Return response with rate limit headers
        const jsonResponse = NextResponse.json({
            success: true,
            paymentLink: {
                id: paymentLink.id,
                url: paymentLink.short_url,
                upi_link: paymentLink.upi_link,
                qr_code: paymentLink.qr_code
            }
        });
        return addRateLimitHeaders(jsonResponse, rateLimitResult);

    } catch (error) {
        paymentLogger.error({
            action: 'payment_link_api_error',
            err: error instanceof Error ? error : new Error(String(error)),
        }, 'Error creating payment link');
        return NextResponse.json(
            { error: 'Failed to create payment link' },
            { status: 500 }
        );
    }
}