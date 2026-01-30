// Mock Resend SDK for testing
// This mock simulates the Resend email API behavior

export interface MockEmailResponse {
  id: string;
}

export interface MockSendEmailParams {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  react?: React.ReactElement;
  text?: string;
  reply_to?: string;
  headers?: Record<string, string>;
  tags?: Array<{ name: string; value: string }>;
}

// Sample mock data
export const mockEmailId = 'email_test123';

export const mockEmailResponse: MockEmailResponse = {
  id: mockEmailId,
};

// Track sent emails for test assertions
export const sentEmails: MockSendEmailParams[] = [];

// Mock email send function
export const mockSend = jest.fn().mockImplementation(async (params: MockSendEmailParams) => {
  sentEmails.push(params);
  return { data: mockEmailResponse, error: null };
});

// Mock domains function (for health check)
export const mockDomainsList = jest.fn().mockResolvedValue({
  data: [{ id: 'domain_1', name: 'nudgr.dev' }],
  error: null,
});

// Mock Resend class
class MockResend {
  apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  emails = {
    send: mockSend,
  };

  domains = {
    list: mockDomainsList,
  };
}

// Helper to reset all mocks
export const resetResendMocks = () => {
  mockSend.mockClear();
  mockDomainsList.mockClear();
  sentEmails.length = 0;
};

// Helper to simulate errors
export const simulateResendError = (error: Error) => {
  mockSend.mockRejectedValueOnce(error);
};

// Helper to get last sent email
export const getLastSentEmail = (): MockSendEmailParams | undefined => {
  return sentEmails[sentEmails.length - 1];
};

// Helper to find emails by recipient
export const findEmailsByRecipient = (email: string): MockSendEmailParams[] => {
  return sentEmails.filter(e => {
    const to = Array.isArray(e.to) ? e.to : [e.to];
    return to.includes(email);
  });
};

// Create a mock instance
export const createMockResend = () => new MockResend('re_test_key');

// Named export for the Resend class
export const Resend = MockResend;

// Default export
export default MockResend;
