// src/app/api/payments/create-link/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { razorpayUPIService } from '@/lib/payments/razorpay-upi';

export async function POST(request: NextRequest) {
    try {
        // Get current user
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { invoiceId } = await request.json();

        if (!invoiceId) {
            return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });
        }

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
                payment_provider: 'razorpay'
            })
            .eq('id', invoiceId);

        if (updateError) {
            console.error('Failed to update invoice with payment link:', updateError);
            // Don't fail the request, payment link is still created
        }

        return NextResponse.json({
            success: true,
            paymentLink: {
                id: paymentLink.id,
                url: paymentLink.short_url,
                upi_link: paymentLink.upi_link,
                qr_code: paymentLink.qr_code
            }
        });

    } catch (error) {
        console.error('Error creating payment link:', error);
        return NextResponse.json(
            { error: 'Failed to create payment link' },
            { status: 500 }
        );
    }
}