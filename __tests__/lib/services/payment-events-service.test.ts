import { paymentEventsService, PaymentEventData } from '@/lib/services/payment-events-service';

// Mock dependencies
const mockSelect = jest.fn().mockReturnThis();
const mockInsert = jest.fn().mockReturnThis();
const mockUpdate = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockMaybeSingle = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      eq: mockEq,
      maybeSingle: mockMaybeSingle,
      single: mockSingle,
    })),
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

import { supabaseAdmin } from '@/lib/supabase-admin';

describe('PaymentEventsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock chain
    mockSelect.mockReturnThis();
    mockInsert.mockReturnThis();
    mockUpdate.mockReturnThis();
    mockEq.mockReturnThis();
  });

  const mockEventData: PaymentEventData = {
    paymentProvider: 'razorpay',
    externalPaymentId: 'pay_test123',
    eventType: 'payment.captured',
    razorpayEventId: 'evt_test123',
    invoiceId: 'inv-123',
    amount: 1000,
    currency: 'INR',
    paymentMethod: 'upi',
    webhookData: { test: true },
  };

  describe('recordIfNew', () => {
    it('should return isNew: true when event does not exist', async () => {
      // Mock no existing record found
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock successful insert
      mockSingle.mockResolvedValueOnce({
        data: { id: 'event-123' },
        error: null,
      });

      const result = await paymentEventsService.recordIfNew(mockEventData);

      expect(result.isNew).toBe(true);
      expect(result.existingId).toBeUndefined();

      // Verify the check query
      expect(supabaseAdmin.from).toHaveBeenCalledWith('payment_events');
      expect(mockSelect).toHaveBeenCalledWith('id');
      expect(mockEq).toHaveBeenCalledWith('payment_provider', 'razorpay');
      expect(mockEq).toHaveBeenCalledWith('external_payment_id', 'pay_test123');
      expect(mockEq).toHaveBeenCalledWith('event_type', 'payment.captured');
    });

    it('should return isNew: false when event already exists', async () => {
      // Mock existing record found
      mockMaybeSingle.mockResolvedValueOnce({
        data: { id: 'existing-event-456' },
        error: null,
      });

      const result = await paymentEventsService.recordIfNew(mockEventData);

      expect(result.isNew).toBe(false);
      expect(result.existingId).toBe('existing-event-456');

      // Verify insert was never called
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('should handle concurrent duplicate by catching unique constraint violation', async () => {
      // Mock no existing record found (first check)
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock unique constraint violation on insert (code 23505)
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint' },
      });

      const result = await paymentEventsService.recordIfNew(mockEventData);

      expect(result.isNew).toBe(false);
      expect(result.existingId).toBeUndefined();
    });

    it('should throw error when check query fails', async () => {
      // Mock check query error
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: { code: '42P01', message: 'relation does not exist' },
      });

      await expect(paymentEventsService.recordIfNew(mockEventData)).rejects.toThrow(
        'Idempotency check failed'
      );
    });

    it('should throw error when insert fails with non-unique constraint error', async () => {
      // Mock no existing record found
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock insert error (not unique constraint)
      const dbError = { code: '23503', message: 'foreign key violation' };
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: dbError,
      });

      await expect(paymentEventsService.recordIfNew(mockEventData)).rejects.toEqual(dbError);
    });

    it('should handle null optional fields', async () => {
      const eventDataWithNulls: PaymentEventData = {
        ...mockEventData,
        invoiceId: null,
        razorpayEventId: null,
        amount: null,
        currency: null,
        paymentMethod: null,
      };

      // Mock no existing record found
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock successful insert
      mockSingle.mockResolvedValueOnce({
        data: { id: 'event-123' },
        error: null,
      });

      const result = await paymentEventsService.recordIfNew(eventDataWithNulls);

      expect(result.isNew).toBe(true);
    });
  });

  describe('updateWithInvoice', () => {
    it('should update event with invoice ID successfully', async () => {
      // Reset mock to return success
      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      const result = await paymentEventsService.updateWithInvoice(
        'pay_test123',
        'payment.captured',
        'inv-123'
      );

      expect(result).toBe(true);
      expect(supabaseAdmin.from).toHaveBeenCalledWith('payment_events');
    });

    it('should return false when update fails', async () => {
      // Mock update error
      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: { code: '42P01', message: 'relation does not exist' },
            }),
          }),
        }),
      });

      const result = await paymentEventsService.updateWithInvoice(
        'pay_test123',
        'payment.captured',
        'inv-123'
      );

      expect(result).toBe(false);
    });
  });
});
