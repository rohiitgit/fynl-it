// src/lib/payments/razorpay-upi.ts - Enhanced TypeScript Version
import Razorpay from 'razorpay';

// Environment validation
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Missing Razorpay credentials. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
}

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Type definitions
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

// Define Razorpay API response types (actual API returns string for created_at)
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

// Custom error class
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

    /**
     * Create a UPI-optimized payment link via Razorpay
     */
    async createUPIPaymentLink(data: UPIPaymentLinkData): Promise<UPIPaymentLinkResponse> {
        try {
            // Validate input data
            this.validatePaymentLinkData(data);

            const paymentLinkData = {
                amount: Math.round(data.amount * 100), // Convert to paise and ensure integer
                currency: 'INR',
                accept_partial: false,
                description: data.description.substring(0, 255), // Razorpay description limit
                customer: {
                    name: data.clientName.substring(0, 120), // Customer name limit
                    email: data.clientEmail,
                },
                notify: {
                    sms: false, // We handle notifications via Nudgr
                    email: false,
                    whatsapp: false,
                },
                reminder_enable: false, // We handle our own reminders
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

            console.log('Creating Razorpay payment link for invoice:', data.invoiceId);

            const paymentLink = await razorpay.paymentLink.create(paymentLinkData) as unknown as RazorpayPaymentLinkResponse;

            if (!paymentLink || !paymentLink.id) {
                throw new RazorpayUPIError('Invalid response from Razorpay API', 'INVALID_RESPONSE');
            }

            // Handle the upi_link field safely
            let upiLink: string;
            if (typeof paymentLink.upi_link === 'string' && paymentLink.upi_link.length > 0) {
                upiLink = paymentLink.upi_link;
            } else {
                // Fallback to short_url for UPI payments
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

            console.log('Successfully created payment link:', response.id);
            return response;

        } catch (error) {
            console.error('Error creating UPI payment link:', error);

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

    /**
     * Get payment link details
     */
    async getPaymentLink(paymentLinkId: string): Promise<RazorpayPaymentLinkResponse> {
        try {
            if (!paymentLinkId || typeof paymentLinkId !== 'string') {
                throw new RazorpayUPIError('Invalid payment link ID', 'INVALID_ID');
            }

            console.log('Fetching payment link:', paymentLinkId);

            const result = await razorpay.paymentLink.fetch(paymentLinkId) as unknown as RazorpayPaymentLinkResponse;

            if (!result || !result.id) {
                throw new RazorpayUPIError('Payment link not found', 'NOT_FOUND');
            }

            return result;

        } catch (error) {
            console.error('Error fetching payment link:', error);

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

    /**
     * Cancel a payment link
     */
    async cancelPaymentLink(paymentLinkId: string): Promise<RazorpayPaymentLinkResponse> {
        try {
            if (!paymentLinkId || typeof paymentLinkId !== 'string') {
                throw new RazorpayUPIError('Invalid payment link ID', 'INVALID_ID');
            }

            console.log('Cancelling payment link:', paymentLinkId);

            const result = await razorpay.paymentLink.cancel(paymentLinkId) as unknown as RazorpayPaymentLinkResponse;

            if (!result || !result.id) {
                throw new RazorpayUPIError('Failed to cancel payment link', 'CANCEL_FAILED');
            }

            console.log('Successfully cancelled payment link:', paymentLinkId);
            return result;

        } catch (error) {
            console.error('Error cancelling payment link:', error);

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

    /**
     * Create a direct UPI link (NPCI compliant)
     */
    createDirectUPILink(data: DirectUPILinkData): string {
        try {
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
            console.log('Generated direct UPI link for invoice:', invoiceNumber);

            return upiLink;

        } catch (error) {
            console.error('Error creating direct UPI link:', error);
            throw new RazorpayUPIError('Failed to create direct UPI link', 'DIRECT_UPI_ERROR');
        }
    }

    /**
     * Generate QR code URL for any UPI link
     */
    generateQRCode(upiLink: string, size: number = this.defaultQRSize): string {
        try {
            if (!upiLink || typeof upiLink !== 'string') {
                throw new RazorpayUPIError('Invalid UPI link for QR code generation', 'INVALID_UPI_LINK');
            }

            if (size < 100 || size > 500) {
                console.warn('QR code size should be between 100-500px, using default:', this.defaultQRSize);
                size = this.defaultQRSize;
            }

            const encodedUpiLink = encodeURIComponent(upiLink);
            return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUpiLink}&format=png&margin=10`;

        } catch (error) {
            console.error('Error generating QR code:', error);
            throw new RazorpayUPIError('Failed to generate QR code', 'QR_GENERATION_ERROR');
        }
    }

    /**
     * Validate UPI ID format
     */
    validateUPIId(upiId: string): boolean {
        // Basic UPI ID validation: should contain @ and have valid format
        const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        return upiPattern.test(upiId);
    }

    /**
     * Get payment status by payment link ID
     */
    async getPaymentStatus(paymentLinkId: string): Promise<{
        status: 'pending' | 'paid' | 'cancelled' | 'expired';
        amount_paid?: number;
        payment_id?: string;
    }> {
        try {
            const paymentLink = await this.getPaymentLink(paymentLinkId);

            // Check if payment link is active
            if (paymentLink.status === 'cancelled') {
                return { status: 'cancelled' };
            }

            // For more detailed payment status, you would need to fetch payments
            // This is a simplified version
            return {
                status: paymentLink.status === 'active' ? 'pending' : 'expired'
            };

        } catch (error) {
            console.error('Error getting payment status:', error);
            throw new RazorpayUPIError('Failed to get payment status', 'STATUS_CHECK_ERROR');
        }
    }

    /**
     * Create a UPI payment link with advanced options
     */
    async createAdvancedUPILink(data: UPIPaymentLinkData & {
        expiryDays?: number;
        maxPayments?: number;
        minAmount?: number;
    }): Promise<UPIPaymentLinkResponse> {
        try {
            const expiryDate = data.expiryDays
                ? new Date(Date.now() + data.expiryDays * 24 * 60 * 60 * 1000)
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

            const advancedData = {
                ...data,
                notes: {
                    ...data.notes,
                    expiry_days: data.expiryDays?.toString() || '30',
                    max_payments: data.maxPayments?.toString() || '1',
                    min_amount: data.minAmount?.toString() || data.amount.toString(),
                }
            };

            return await this.createUPIPaymentLink(advancedData);

        } catch (error) {
            console.error('Error creating advanced UPI link:', error);
            if (error instanceof RazorpayUPIError) {
                throw error;
            }
            throw new RazorpayUPIError('Failed to create advanced UPI link', 'ADVANCED_CREATION_ERROR');
        }
    }

    // Private helper methods

    /**
     * Validate payment link data
     */
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

    /**
     * Validate direct UPI data
     */
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

    /**
     * Check if error is from Razorpay
     */
    private isRazorpayError(error: unknown): error is RazorpayError {
        return (
            error instanceof Error &&
            (error as RazorpayError).statusCode !== undefined &&
            (error as RazorpayError).error !== undefined
        );
    }

    /**
     * Validate email format
     */
    private isValidEmail(email: string): boolean {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    /**
     * Get service health status
     */
    async getServiceHealth(): Promise<{
        status: 'healthy' | 'unhealthy';
        razorpay_connected: boolean;
        timestamp: string;
    }> {
        try {
            // Try to make a simple API call to check connectivity
            await razorpay.plans.all({ count: 1 });

            return {
                status: 'healthy',
                razorpay_connected: true,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Razorpay health check failed:', error);
            return {
                status: 'unhealthy',
                razorpay_connected: false,
                timestamp: new Date().toISOString(),
            };
        }
    }
}

// Export singleton instance
export const razorpayUPIService = new RazorpayUPIService();

// Export utility functions
export const upiUtils = {
    /**
     * Format amount for display
     */
    formatAmount: (amount: number, currency: string = 'INR'): string => {
        const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        return formatter.format(amount);
    },

    /**
     * Parse UPI link to extract payment details
     */
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

    /**
     * Check if string is a valid UPI link
     */
    isValidUPILink: (link: string): boolean => {
        try {
            const url = new URL(link);
            return url.protocol === 'upi:' && url.pathname === '//pay' && url.searchParams.has('pa');
        } catch {
            return false;
        }
    },
};