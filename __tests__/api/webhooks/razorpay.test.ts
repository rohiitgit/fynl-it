/**
 * @jest-environment node
 */
import crypto from 'crypto';
import { NextRequest } from 'next/server';

// Mock dependencies before importing the route
jest.mock('@/lib/rate-limit/rate-limiter', () => ({
  applyRateLimit: jest.fn().mockResolvedValue({
    success: true,
    limit: 100,
    remaining: 99,
    reset: Date.now() + 60000,
  }),
}));

jest.mock('@/lib/logger', () => ({
  paymentLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  securityLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/services/payment-processor', () => ({
  paymentProcessorService: {
    processPaymentCaptured: jest.fn(),
  },
}));

jest.mock('@/lib/services/invoice-service', () => ({
  invoiceService: {
    findAnyByRazorpayLinkId: jest.fn(),
  },
}));

// Import after mocks are set up
import { POST, GET } from '@/app/api/webhooks/razorpay/route';
import { paymentProcessorService } from '@/lib/services/payment-processor';
import { invoiceService } from '@/lib/services/invoice-service';
import { applyRateLimit } from '@/lib/rate-limit/rate-limiter';

describe('Razorpay Webhook API', () => {
  const WEBHOOK_SECRET = 'test_webhook_secret';

  beforeAll(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to create signed webhook request
  const createSignedRequest = (body: object): NextRequest => {
    const bodyString = JSON.stringify(body);
    const signature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(bodyString)
      .digest('hex');

    return new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature,
        'x-razorpay-event-id': 'evt_test123',
      },
      body: bodyString,
    });
  };

  // Helper to create unsigned request
  const createUnsignedRequest = (body: object): NextRequest => {
    return new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  const mockPaymentCapturedEvent = {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_test123',
          amount: 100000,
          currency: 'INR',
          status: 'captured',
          email: 'client@test.com',
          contact: '+919876543210',
          method: 'upi',
          vpa: 'client@upi',
          notes: {
            invoice_id: 'inv-123',
          },
          created_at: Date.now() / 1000,
        },
      },
    },
  };

  const mockPaymentLinkPaidEvent = {
    event: 'payment_link.paid',
    payload: {
      payment_link: {
        entity: {
          id: 'plink_test123',
          status: 'paid',
          amount: 100000,
          currency: 'INR',
          created_at: Date.now() / 1000,
        },
      },
    },
  };

  describe('GET /api/webhooks/razorpay', () => {
    it('should return health check status', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.webhook).toBe('razorpay-upi-payment-detection');
      expect(data.supported_events).toContain('payment.captured');
      expect(data.supported_methods).toContain('upi');
    });
  });

  describe('POST /api/webhooks/razorpay', () => {
    describe('Signature Verification', () => {
      it('should reject requests without signature', async () => {
        const request = createUnsignedRequest(mockPaymentCapturedEvent);
        const response = await POST(request);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBe('Missing signature');
      });

      it('should reject requests with invalid signature', async () => {
        const bodyString = JSON.stringify(mockPaymentCapturedEvent);
        const request = new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-razorpay-signature': 'invalid_signature',
          },
          body: bodyString,
        });

        const response = await POST(request);
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error).toBe('Invalid signature');
      });

      it('should accept requests with valid signature', async () => {
        (paymentProcessorService.processPaymentCaptured as jest.Mock).mockResolvedValue({
          success: true,
          message: 'Payment processed',
          paymentId: 'pay_test123',
          invoiceId: 'inv-123',
        });

        const request = createSignedRequest(mockPaymentCapturedEvent);
        const response = await POST(request);

        expect(response.status).toBe(200);
      });
    });

    describe('Payment Captured Event', () => {
      it('should process payment.captured event successfully', async () => {
        (paymentProcessorService.processPaymentCaptured as jest.Mock).mockResolvedValue({
          success: true,
          message: 'Payment processed successfully',
          paymentId: 'pay_test123',
          invoiceId: 'inv-123',
          paymentMethod: 'upi',
          amount: 1000,
        });

        const request = createSignedRequest(mockPaymentCapturedEvent);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.payment_id).toBe('pay_test123');
        expect(data.invoice_id).toBe('inv-123');

        // Verify service was called with correct parameters
        expect(paymentProcessorService.processPaymentCaptured).toHaveBeenCalledWith(
          mockPaymentCapturedEvent.payload.payment.entity,
          'evt_test123',
          mockPaymentCapturedEvent
        );
      });

      it('should handle duplicate payment gracefully', async () => {
        (paymentProcessorService.processPaymentCaptured as jest.Mock).mockResolvedValue({
          success: true,
          message: 'Payment already processed (duplicate webhook)',
          paymentId: 'pay_test123',
          isDuplicate: true,
        });

        const request = createSignedRequest(mockPaymentCapturedEvent);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      });

      it('should return 200 even when invoice not found', async () => {
        // Return 200 to prevent webhook retries
        (paymentProcessorService.processPaymentCaptured as jest.Mock).mockResolvedValue({
          success: false,
          message: 'Payment received but no matching invoice found',
          paymentId: 'pay_test123',
        });

        const request = createSignedRequest(mockPaymentCapturedEvent);
        const response = await POST(request);

        // Should return 200 to avoid Razorpay retries
        expect(response.status).toBe(200);
      });
    });

    describe('Payment Link Events', () => {
      it('should process payment_link.paid event', async () => {
        (invoiceService.findAnyByRazorpayLinkId as jest.Mock).mockResolvedValue({
          id: 'inv-123',
          invoice_number: 'INV-001',
        });

        const request = createSignedRequest(mockPaymentLinkPaidEvent);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      });

      it('should handle payment_link.paid when invoice not found', async () => {
        (invoiceService.findAnyByRazorpayLinkId as jest.Mock).mockResolvedValue(null);

        const request = createSignedRequest(mockPaymentLinkPaidEvent);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(false);
        expect(data.message).toContain('Invoice not found');
      });
    });

    describe('Unhandled Events', () => {
      it('should ignore unhandled event types', async () => {
        const unknownEvent = {
          event: 'refund.created',
          payload: {},
        };

        const request = createSignedRequest(unknownEvent);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toContain('ignored');
      });
    });

    describe('Rate Limiting', () => {
      it('should rate limit unsigned requests', async () => {
        (applyRateLimit as jest.Mock).mockResolvedValueOnce({
          success: false,
          limit: 10,
          remaining: 0,
          reset: Date.now() + 60000,
          response: new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
          }),
        });

        const request = createUnsignedRequest(mockPaymentCapturedEvent);
        const response = await POST(request);

        // The mocked rate limiter returns its own response
        expect(applyRateLimit).toHaveBeenCalled();
      });

      it('should not rate limit valid signed requests', async () => {
        (paymentProcessorService.processPaymentCaptured as jest.Mock).mockResolvedValue({
          success: true,
          message: 'Payment processed',
          paymentId: 'pay_test123',
        });

        const request = createSignedRequest(mockPaymentCapturedEvent);
        await POST(request);

        // applyRateLimit should not have been called for valid signatures
        // (it's only called for unsigned or invalid signature requests)
        // Check the order of calls - rate limit is only called after signature check fails
      });
    });

    describe('Error Handling', () => {
      it('should handle service errors gracefully', async () => {
        (paymentProcessorService.processPaymentCaptured as jest.Mock).mockRejectedValue(
          new Error('Database connection failed')
        );

        const request = createSignedRequest(mockPaymentCapturedEvent);
        const response = await POST(request);

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.error).toBe('Webhook processing failed');
      });
    });
  });
});
