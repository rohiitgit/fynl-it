import { paymentProcessorService, RazorpayPaymentEntity } from '@/lib/services/payment-processor';

// Mock dependencies
jest.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
    })),
  },
}));

jest.mock('@/lib/services/invoice-service', () => ({
  invoiceService: {
    findByPaymentReference: jest.fn(),
    markAsPaid: jest.fn(),
    findByInvoiceId: jest.fn(),
    findByRazorpayLinkId: jest.fn(),
  },
}));

jest.mock('@/lib/services/payment-events-service', () => ({
  paymentEventsService: {
    recordIfNew: jest.fn(),
    updateWithInvoice: jest.fn(),
  },
}));

jest.mock('@/lib/services/follow-up-service', () => ({
  followUpService: {
    cancelByInvoice: jest.fn(),
  },
}));

jest.mock('@/lib/logger', () => ({
  paymentLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('@/lib/logger/redact', () => ({
  maskEmail: jest.fn((email: string) => email.replace(/^(.{2}).*(@.*)$/, '$1***$2')),
}));

import { supabaseAdmin } from '@/lib/supabase-admin';
import { invoiceService } from '@/lib/services/invoice-service';
import { paymentEventsService } from '@/lib/services/payment-events-service';

describe('PaymentProcessorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPayment: RazorpayPaymentEntity = {
    id: 'pay_test123',
    amount: 100000, // 1000 INR in paise
    currency: 'INR',
    status: 'captured',
    email: 'client@test.com',
    contact: '+919876543210',
    method: 'upi',
    vpa: 'client@upi',
    notes: {
      invoice_id: 'inv-123',
      razorpay_link_id: 'plink_test123',
    },
    created_at: Date.now() / 1000,
    fee: 2360,
    tax: 360,
  };

  const mockInvoice = {
    id: 'inv-123',
    user_id: 'user-123',
    invoice_number: 'INV-001',
    client_email: 'client@test.com',
    client_name: 'Test Client',
    amount: 1000,
    currency: 'INR',
    status: 'pending',
  };

  describe('detectPaymentMethod', () => {
    it('should detect UPI payment method', () => {
      const payment = { ...mockPayment, method: 'upi' };
      expect(paymentProcessorService.detectPaymentMethod(payment)).toBe('upi');
    });

    it('should detect card payment method', () => {
      const payment = { ...mockPayment, method: 'card' };
      expect(paymentProcessorService.detectPaymentMethod(payment)).toBe('card');
    });

    it('should detect netbanking payment method', () => {
      const payment = { ...mockPayment, method: 'netbanking' };
      expect(paymentProcessorService.detectPaymentMethod(payment)).toBe('netbanking');
    });

    it('should detect wallet payment method', () => {
      const payment = { ...mockPayment, method: 'wallet' };
      expect(paymentProcessorService.detectPaymentMethod(payment)).toBe('wallet');
    });

    it('should fallback to UPI if method is empty but vpa is present', () => {
      const payment = { ...mockPayment, method: '', vpa: 'client@upi' };
      expect(paymentProcessorService.detectPaymentMethod(payment)).toBe('upi');
    });

    it('should fallback to card if method is empty but card is present', () => {
      const payment = {
        ...mockPayment,
        method: '',
        vpa: undefined,
        card: { network: 'Visa', type: 'credit', last4: '1234' },
      };
      expect(paymentProcessorService.detectPaymentMethod(payment)).toBe('card');
    });

    it('should return other if no method can be detected', () => {
      const payment = { ...mockPayment, method: '', vpa: undefined };
      expect(paymentProcessorService.detectPaymentMethod(payment)).toBe('other');
    });
  });

  describe('getPaymentMethodDetails', () => {
    it('should extract UPI details', () => {
      const details = paymentProcessorService.getPaymentMethodDetails(mockPayment);
      expect(details).toEqual({
        method: 'upi',
        vpa: 'client@upi',
        provider: 'upi',
      });
    });

    it('should extract card details', () => {
      const payment = {
        ...mockPayment,
        method: 'card',
        vpa: undefined,
        card: { network: 'Visa', type: 'credit', last4: '1234', issuer: 'HDFC' },
      };
      const details = paymentProcessorService.getPaymentMethodDetails(payment);
      expect(details).toEqual({
        method: 'card',
        network: 'Visa',
        type: 'credit',
        last4: '1234',
      });
    });

    it('should extract netbanking details', () => {
      const payment = {
        ...mockPayment,
        method: 'netbanking',
        vpa: undefined,
        bank: 'HDFC',
      };
      const details = paymentProcessorService.getPaymentMethodDetails(payment);
      expect(details).toEqual({
        method: 'netbanking',
        bank: 'HDFC',
      });
    });

    it('should extract wallet details', () => {
      const payment = {
        ...mockPayment,
        method: 'wallet',
        vpa: undefined,
        wallet: 'paytm',
      };
      const details = paymentProcessorService.getPaymentMethodDetails(payment);
      expect(details).toEqual({
        method: 'wallet',
        wallet: 'paytm',
      });
    });
  });

  describe('processPaymentCaptured', () => {
    it('should process a new payment successfully using atomic transaction', async () => {
      // Mock invoice lookup
      (invoiceService.findByPaymentReference as jest.Mock).mockResolvedValue(mockInvoice);

      // Mock atomic transaction success
      (supabaseAdmin.rpc as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          is_duplicate: false,
          cancelled_followups: 2,
        },
        error: null,
      });

      const result = await paymentProcessorService.processPaymentCaptured(
        mockPayment,
        'evt_test123',
        { event: 'payment.captured' }
      );

      expect(result.success).toBe(true);
      expect(result.invoiceId).toBe('inv-123');
      expect(result.paymentId).toBe('pay_test123');
      expect(result.paymentMethod).toBe('upi');
      expect(result.amount).toBe(1000);
      expect(result.isDuplicate).toBeUndefined();

      // Verify atomic transaction was called
      expect(supabaseAdmin.rpc).toHaveBeenCalledWith('process_payment_captured', expect.objectContaining({
        p_invoice_id: 'inv-123',
        p_payment_id: 'pay_test123',
        p_payment_provider: 'razorpay',
        p_event_type: 'payment.captured',
        p_razorpay_event_id: 'evt_test123',
        p_amount: 1000,
        p_currency: 'INR',
        p_payment_method: 'upi',
      }));
    });

    it('should detect duplicate payment and return success with isDuplicate flag', async () => {
      // Mock invoice lookup
      (invoiceService.findByPaymentReference as jest.Mock).mockResolvedValue(mockInvoice);

      // Mock atomic transaction returning duplicate
      (supabaseAdmin.rpc as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          is_duplicate: true,
          cancelled_followups: 0,
          existing_event_id: 'event-456',
        },
        error: null,
      });

      const result = await paymentProcessorService.processPaymentCaptured(
        mockPayment,
        'evt_test123',
        { event: 'payment.captured' }
      );

      expect(result.success).toBe(true);
      expect(result.isDuplicate).toBe(true);
      expect(result.message).toContain('already processed');
    });

    it('should return failure when no invoice is found', async () => {
      // Mock invoice lookup returning null
      (invoiceService.findByPaymentReference as jest.Mock).mockResolvedValue(null);

      // Mock orphan payment recording
      (paymentEventsService.recordIfNew as jest.Mock).mockResolvedValue({ isNew: true });

      const result = await paymentProcessorService.processPaymentCaptured(
        mockPayment,
        'evt_test123',
        { event: 'payment.captured' }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('no matching invoice');

      // Verify orphan payment was recorded
      expect(paymentEventsService.recordIfNew).toHaveBeenCalled();
    });

    it('should fallback to non-atomic processing when RPC is unavailable', async () => {
      // Mock invoice lookup
      (invoiceService.findByPaymentReference as jest.Mock).mockResolvedValue(mockInvoice);

      // Mock RPC error (function not found)
      (supabaseAdmin.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: 'PGRST202', message: 'function process_payment_captured not found' },
      });

      // Mock fallback flow
      (paymentEventsService.recordIfNew as jest.Mock).mockResolvedValue({ isNew: true });
      (invoiceService.markAsPaid as jest.Mock).mockResolvedValue(true);

      // We need to mock the dynamic imports for fallback
      jest.doMock('@/lib/services/invoice-service', () => ({
        invoiceService: {
          markAsPaid: jest.fn().mockResolvedValue(true),
        },
      }));

      jest.doMock('@/lib/services/follow-up-service', () => ({
        followUpService: {
          cancelByInvoice: jest.fn().mockResolvedValue({ success: true, count: 2 }),
        },
      }));

      const result = await paymentProcessorService.processPaymentCaptured(
        mockPayment,
        'evt_test123',
        { event: 'payment.captured' }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('fallback');
    });

    it('should throw error when atomic transaction fails with unexpected error', async () => {
      // Mock invoice lookup
      (invoiceService.findByPaymentReference as jest.Mock).mockResolvedValue(mockInvoice);

      // Mock RPC error (not function-not-found)
      (supabaseAdmin.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: '42P01', message: 'relation "payment_events" does not exist' },
      });

      await expect(
        paymentProcessorService.processPaymentCaptured(
          mockPayment,
          'evt_test123',
          { event: 'payment.captured' }
        )
      ).rejects.toThrow('Payment processing failed');
    });

    it('should handle transaction returning failure result', async () => {
      // Mock invoice lookup
      (invoiceService.findByPaymentReference as jest.Mock).mockResolvedValue(mockInvoice);

      // Mock atomic transaction returning failure
      (supabaseAdmin.rpc as jest.Mock).mockResolvedValue({
        data: {
          success: false,
          is_duplicate: false,
          cancelled_followups: 0,
          error_message: 'Invoice not found: inv-123',
        },
        error: null,
      });

      const result = await paymentProcessorService.processPaymentCaptured(
        mockPayment,
        'evt_test123',
        { event: 'payment.captured' }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invoice not found');
    });
  });
});
