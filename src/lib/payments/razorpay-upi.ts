import Razorpay from 'razorpay';
import { paymentLogger } from '@/lib/logger';
import { maskEmail } from '@/lib/logger/redact';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Missing Razorpay credentials. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export interface UPIPaymentLinkData {
    invoiceId: string;
    clientName: string;
    clientEmail: string;
    amount: number; // in rupees
    description: string;
    businessName?: string;
    notes?: Record<string, string>;
    callbackUrl?: string;
}

export interface UPIPaymentLinkResponse {
    id: string;
    short_url: string;
    upi_link: string;
    qr_code: string;
    status: 'active' | 'inactive' | 'cancelled';
    created_at: number;
}

export interface DirectUPILinkData {
    upiId: string;
    amount: number;
    invoiceNumber: string;
    businessName?: string;
    transactionNote?: string;
}

// Razorpay API returns created_at as string or number depending on SDK version
interface RazorpayPaymentLinkResponse {
    id: string;
    short_url: string;
    upi_link?: string | boolean;
    status: 'active' | 'inactive' | 'cancelled';
    created_at: string | number; // Razorpay can return either string or number
    amount: number;
    currency: string;
    description: string;
    customer: {
        name: string;
        email: string;
    };
    notes: Record<string, string>;
    [key: string]: unknown;
}

interface RazorpayError extends Error {
    statusCode?: number;
    error?: {
        code: string;
        description: string;
        field?: string;
    };
}

export class RazorpayUPIError extends Error {
    public readonly code: string;
    public readonly statusCode?: number;

    constructor(message: string, code: string = 'RAZORPAY_ERROR', statusCode?: number) {
        super(message);
        this.name = 'RazorpayUPIError';
        this.code = code;
        this.statusCode = statusCode;
    }
}

export class RazorpayUPIService {
    private readonly baseAppUrl: string;
    private readonly defaultQRSize = 200;

    constructor() {
        this.baseAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    }

    async createUPIPaymentLink(data: UPIPaymentLinkData): Promise<UPIPaymentLinkResponse> {
        try {
            this.validatePaymentLinkData(data);

            const paymentLinkData = {
                amount: Math.round(data.amount * 100), // paise
                currency: 'INR',
                accept_partial: false,
                description: data.description.substring(0, 255), // Razorpay limit
                customer: {
                    name: data.clientName.substring(0, 120), // Razorpay limit
                    email: data.clientEmail,
                },
                notify: {
                    sms: false, // Nudgr handles notifications
                    email: false,
                    whatsapp: false,
                },
                reminder_enable: false, // Nudgr handles reminders
                notes: {
                    invoice_id: data.invoiceId,
                    created_by: 'nudgr',
                    business_name: data.businessName?.substring(0, 100) || '',
                    created_at: new Date().toISOString(),
                    ...data.notes,
                },
                callback_url: data.callbackUrl || `${this.baseAppUrl}/payment/success`,
                callback_method: 'get' as const,
                options: {
                    checkout: {
                        method: {
                            upi: true,
                            card: true,
                            netbanking: true,
                            wallet: true,
                        },
                    },
                },
            };

            paymentLogger.info({
                action: 'payment_link_creating',
                invoiceId: data.invoiceId,
                amount: data.amount,
                clientEmailMasked: maskEmail(data.clientEmail),
            }, 'Creating Razorpay payment link for invoice');

            const paymentLink = await razorpay.paymentLink.create(paymentLinkData) as unknown as RazorpayPaymentLinkResponse;

            if (!paymentLink || !paymentLink.id) {
                throw new RazorpayUPIError('Invalid response from Razorpay API', 'INVALID_RESPONSE');
            }

            let upiLink: string;
            if (typeof paymentLink.upi_link === 'string' && paymentLink.upi_link.length > 0) {
                upiLink = paymentLink.upi_link;
            } else {
                upiLink = paymentLink.short_url;
            }

            const response: UPIPaymentLinkResponse = {
                id: paymentLink.id,
                short_url: paymentLink.short_url,
                upi_link: upiLink,
                qr_code: this.generateQRCode(upiLink),
                status: paymentLink.status,
                created_at: typeof paymentLink.created_at === 'string'
                    ? Date.parse(paymentLink.created_at) / 1000
                    : paymentLink.created_at,
            };

            paymentLogger.info({
                action: 'payment_link_created',
                paymentLinkId: response.id,
                invoiceId: data.invoiceId,
                status: response.status,
            }, 'Successfully created payment link');
            return response;

        } catch (error) {
            paymentLogger.error({
                action: 'payment_link_creation_error',
                invoiceId: data.invoiceId,
                err: error instanceof Error ? error : new Error(String(error)),
            }, 'Error creating UPI payment link');

            if (this.isRazorpayError(error)) {
                const rzpError = error as RazorpayError;
                throw new RazorpayUPIError(
                    rzpError.error?.description || rzpError.message || 'Razorpay API error',
                    rzpError.error?.code || 'RAZORPAY_API_ERROR',
                    rzpError.statusCode
                );
            }

            if (error instanceof RazorpayUPIError) {
                throw error;
            }

            throw new RazorpayUPIError('Failed to create payment link', 'CREATION_FAILED');
        }
    }

    async getPaymentLink(paymentLinkId: string): Promise<RazorpayPaymentLinkResponse> {
        try {
            if (!paymentLinkId || typeof paymentLinkId !== 'string') {
                throw new RazorpayUPIError('Invalid payment link ID', 'INVALID_ID');
            }

            paymentLogger.debug({
                action: 'payment_link_fetching',
                paymentLinkId,
            }, 'Fetching payment link');

            const result = await razorpay.paymentLink.fetch(paymentLinkId) as unknown as RazorpayPaymentLinkResponse;

            if (!result || !result.id) {
                throw new RazorpayUPIError('Payment link not found', 'NOT_FOUND');
            }

            return result;

        } catch (error) {
            paymentLogger.error({
                action: 'payment_link_fetch_error',
                paymentLinkId,
                err: error instanceof Error ? error : new Error(String(error)),
            }, 'Error fetching payment link');

            if (this.isRazorpayError(error)) {
                const rzpError = error as RazorpayError;
                throw new RazorpayUPIError(
                    rzpError.error?.description || 'Failed to fetch payment link',
                    rzpError.error?.code || 'FETCH_ERROR',
                    rzpError.statusCode
                );
            }

            if (error instanceof RazorpayUPIError) {
                throw error;
            }

            throw new RazorpayUPIError('Failed to fetch payment link', 'FETCH_FAILED');
        }
    }

    async cancelPaymentLink(paymentLinkId: string): Promise<RazorpayPaymentLinkResponse> {
        try {
            if (!paymentLinkId || typeof paymentLinkId !== 'string') {
                throw new RazorpayUPIError('Invalid payment link ID', 'INVALID_ID');
            }

            paymentLogger.info({
                action: 'payment_link_cancelling',
                paymentLinkId,
            }, 'Cancelling payment link');

            const result = await razorpay.paymentLink.cancel(paymentLinkId) as unknown as RazorpayPaymentLinkResponse;

            if (!result || !result.id) {
                throw new RazorpayUPIError('Failed to cancel payment link', 'CANCEL_FAILED');
            }

            paymentLogger.info({
                action: 'payment_link_cancelled',
                paymentLinkId,
                status: result.status,
            }, 'Successfully cancelled payment link');
            return result;

        } catch (error) {
            paymentLogger.error({
                action: 'payment_link_cancel_error',
                paymentLinkId,
                err: error instanceof Error ? error : new Error(String(error)),
            }, 'Error cancelling payment link');

            if (this.isRazorpayError(error)) {
                const rzpError = error as RazorpayError;
                throw new RazorpayUPIError(
                    rzpError.error?.description || 'Failed to cancel payment link',
                    rzpError.error?.code || 'CANCEL_ERROR',
                    rzpError.statusCode
                );
            }

            if (error instanceof RazorpayUPIError) {
                throw error;
            }

            throw new RazorpayUPIError('Failed to cancel payment link', 'CANCEL_FAILED');
        }
    }

    createDirectUPILink(data: DirectUPILinkData): string {
        this.validateDirectUPIData(data);

        const { upiId, amount, invoiceNumber, businessName, transactionNote } = data;

        // Create UPI URL as per NPCI specification
        const upiUrl = new URL('upi://pay');
        upiUrl.searchParams.set('pa', upiId); // Payee address (UPI ID)
        upiUrl.searchParams.set('pn', businessName || 'Business'); // Payee name
        upiUrl.searchParams.set('am', amount.toFixed(2)); // Amount with 2 decimal places
        upiUrl.searchParams.set('cu', 'INR'); // Currency
        upiUrl.searchParams.set('tn', transactionNote || `Payment for Invoice ${invoiceNumber}`); // Transaction note

        const upiLink = upiUrl.toString();
        paymentLogger.debug({
            action: 'direct_upi_link_generated',
            invoiceNumber,
            amount,
        }, 'Generated direct UPI link for invoice');

        return upiLink;
    }

    generateQRCode(upiLink: string, size: number = this.defaultQRSize): string {
        if (!upiLink || typeof upiLink !== 'string') {
            throw new RazorpayUPIError('Invalid UPI link for QR code generation', 'INVALID_UPI_LINK');
        }

        if (size < 100 || size > 500) {
            paymentLogger.warn({
                action: 'qr_code_size_adjusted',
                requestedSize: size,
                defaultSize: this.defaultQRSize,
            }, 'QR code size should be between 100-500px, using default');
            size = this.defaultQRSize;
        }

        const encodedUpiLink = encodeURIComponent(upiLink);
        return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUpiLink}&format=png&margin=10`;
    }

    validateUPIId(upiId: string): boolean {
        // format per NPCI spec: localpart@psp
        const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        return upiPattern.test(upiId);
    }

    async getPaymentStatus(paymentLinkId: string): Promise<{
        status: 'pending' | 'paid' | 'cancelled' | 'expired';
        amount_paid?: number;
        payment_id?: string;
    }> {
        try {
            const paymentLink = await this.getPaymentLink(paymentLinkId);

            if (paymentLink.status === 'cancelled') {
                return { status: 'cancelled' };
            }

            return {
                status: paymentLink.status === 'active' ? 'pending' : 'expired'
            };

        } catch (error) {
            paymentLogger.error({
                action: 'payment_status_check_error',
                paymentLinkId,
                err: error instanceof Error ? error : new Error(String(error)),
            }, 'Error getting payment status');
            throw new RazorpayUPIError('Failed to get payment status', 'STATUS_CHECK_ERROR');
        }
    }

    async createAdvancedUPILink(data: UPIPaymentLinkData & {
        expiryDays?: number;
        maxPayments?: number;
        minAmount?: number;
    }): Promise<UPIPaymentLinkResponse> {
        const advancedData = {
            ...data,
            notes: {
                ...data.notes,
                expiry_days: data.expiryDays?.toString() || '30',
                max_payments: data.maxPayments?.toString() || '1',
                min_amount: data.minAmount?.toString() || data.amount.toString(),
            }
        };

        return this.createUPIPaymentLink(advancedData);
    }

    private validatePaymentLinkData(data: UPIPaymentLinkData): void {
        const errors: string[] = [];

        if (!data.invoiceId || typeof data.invoiceId !== 'string') {
            errors.push('Invalid invoice ID');
        }

        if (!data.clientName || typeof data.clientName !== 'string' || data.clientName.trim().length === 0) {
            errors.push('Invalid client name');
        }

        if (!data.clientEmail || !this.isValidEmail(data.clientEmail)) {
            errors.push('Invalid client email');
        }

        if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
            errors.push('Invalid amount - must be a positive number');
        }

        if (data.amount > 500000) {
            errors.push('Amount exceeds maximum limit of ₹5,00,000');
        }

        if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
            errors.push('Invalid description');
        }

        if (errors.length > 0) {
            throw new RazorpayUPIError(`Validation failed: ${errors.join(', ')}`, 'VALIDATION_ERROR');
        }
    }

    private validateDirectUPIData(data: DirectUPILinkData): void {
        const errors: string[] = [];

        if (!data.upiId || !this.validateUPIId(data.upiId)) {
            errors.push('Invalid UPI ID format');
        }

        if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
            errors.push('Invalid amount - must be a positive number');
        }

        if (!data.invoiceNumber || typeof data.invoiceNumber !== 'string') {
            errors.push('Invalid invoice number');
        }

        if (errors.length > 0) {
            throw new RazorpayUPIError(`Validation failed: ${errors.join(', ')}`, 'VALIDATION_ERROR');
        }
    }

    private isRazorpayError(error: unknown): error is RazorpayError {
        return (
            error instanceof Error &&
            (error as RazorpayError).statusCode !== undefined &&
            (error as RazorpayError).error !== undefined
        );
    }

    private isValidEmail(email: string): boolean {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    async getServiceHealth(): Promise<{
        status: 'healthy' | 'unhealthy';
        razorpay_connected: boolean;
        timestamp: string;
    }> {
        try {
            await razorpay.plans.all({ count: 1 });

            return {
                status: 'healthy',
                razorpay_connected: true,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            paymentLogger.error({
                action: 'razorpay_health_check_failed',
                err: error instanceof Error ? error : new Error(String(error)),
            }, 'Razorpay health check failed');
            return {
                status: 'unhealthy',
                razorpay_connected: false,
                timestamp: new Date().toISOString(),
            };
        }
    }
}

export const razorpayUPIService = new RazorpayUPIService();

export const upiUtils = {
    formatAmount: (amount: number, currency: string = 'INR'): string => {
        const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        return formatter.format(amount);
    },

    parseUPILink: (upiLink: string): {
        payeeAddress?: string;
        payeeName?: string;
        amount?: number;
        currency?: string;
        transactionNote?: string;
    } | null => {
        try {
            const url = new URL(upiLink);
            if (url.protocol !== 'upi:') return null;

            return {
                payeeAddress: url.searchParams.get('pa') || undefined,
                payeeName: url.searchParams.get('pn') || undefined,
                amount: url.searchParams.get('am') ? parseFloat(url.searchParams.get('am')!) : undefined,
                currency: url.searchParams.get('cu') || undefined,
                transactionNote: url.searchParams.get('tn') || undefined,
            };
        } catch {
            return null;
        }
    },

    isValidUPILink: (link: string): boolean => {
        try {
            const url = new URL(link);
            return url.protocol === 'upi:' && url.pathname === '//pay' && url.searchParams.has('pa');
        } catch {
            return false;
        }
    },
};