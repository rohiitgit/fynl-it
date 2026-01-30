// Mock Razorpay SDK for testing
// This mock simulates the Razorpay API behavior

export interface MockPaymentLink {
  id: string;
  short_url: string;
  upi_link: string;
  status: 'active' | 'inactive' | 'cancelled';
  amount: number;
  currency: string;
  created_at: number;
  customer: {
    name: string;
    email: string;
  };
  notes: Record<string, string>;
}

export interface MockPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  email: string;
  contact: string;
  vpa?: string;
  card?: {
    network: string;
    type: string;
    last4: string;
  };
  notes: Record<string, string>;
  created_at: number;
  fee?: number;
  tax?: number;
}

// Sample mock data
export const mockPaymentLink: MockPaymentLink = {
  id: 'plink_test123',
  short_url: 'https://rzp.io/i/test123',
  upi_link: 'upi://pay?pa=test@upi&pn=Test&am=1000',
  status: 'active',
  amount: 100000, // 1000 INR in paise
  currency: 'INR',
  created_at: Date.now() / 1000,
  customer: {
    name: 'Test Client',
    email: 'client@test.com',
  },
  notes: {
    invoice_id: 'inv-123',
    created_by: 'nudgr',
  },
};

export const mockPayment: MockPayment = {
  id: 'pay_test123',
  amount: 100000,
  currency: 'INR',
  status: 'captured',
  method: 'upi',
  email: 'client@test.com',
  contact: '+919876543210',
  vpa: 'client@upi',
  notes: {
    invoice_id: 'inv-123',
    razorpay_link_id: 'plink_test123',
  },
  created_at: Date.now() / 1000,
  fee: 2360, // 2% + GST
  tax: 360,
};

// Mock Razorpay class
class MockRazorpay {
  key_id: string;
  key_secret: string;

  constructor(config: { key_id: string; key_secret: string }) {
    this.key_id = config.key_id;
    this.key_secret = config.key_secret;
  }

  paymentLink = {
    create: jest.fn().mockResolvedValue(mockPaymentLink),
    fetch: jest.fn().mockResolvedValue(mockPaymentLink),
    cancel: jest.fn().mockResolvedValue({ ...mockPaymentLink, status: 'cancelled' }),
  };

  payments = {
    fetch: jest.fn().mockResolvedValue(mockPayment),
    all: jest.fn().mockResolvedValue({ items: [mockPayment] }),
    capture: jest.fn().mockResolvedValue({ ...mockPayment, status: 'captured' }),
  };

  plans = {
    all: jest.fn().mockResolvedValue({ items: [] }),
  };
}

// Export mock functions for test control
export const mockPaymentLinkCreate = jest.fn().mockResolvedValue(mockPaymentLink);
export const mockPaymentLinkFetch = jest.fn().mockResolvedValue(mockPaymentLink);
export const mockPaymentLinkCancel = jest.fn().mockResolvedValue({ ...mockPaymentLink, status: 'cancelled' });
export const mockPaymentFetch = jest.fn().mockResolvedValue(mockPayment);

// Helper to reset all mocks
export const resetRazorpayMocks = () => {
  mockPaymentLinkCreate.mockClear();
  mockPaymentLinkFetch.mockClear();
  mockPaymentLinkCancel.mockClear();
  mockPaymentFetch.mockClear();
};

// Helper to simulate errors
export const simulateRazorpayError = (mock: jest.Mock, error: Error) => {
  mock.mockRejectedValueOnce(error);
};

// Create a mock instance
export const createMockRazorpay = () => new MockRazorpay({
  key_id: 'rzp_test_key',
  key_secret: 'rzp_test_secret',
});

// Default export
export default MockRazorpay;
