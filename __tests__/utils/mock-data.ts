import { Database } from '@/types/supabase'

type Invoice = Database['public']['Tables']['invoices']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type FollowUp = Database['public']['Tables']['follow_ups']['Row']

// Mock profile data
export const mockProfile: Profile = {
  id: 'test-user-id',
  business_name: 'Test Business',
  email: 'test@business.com',
  phone: '+919876543210',
  upi_id: 'test@upi',
  razorpay_account_id: null,
  razorpay_enabled: false,
  default_currency: 'INR',
  default_payment_terms: 'NET_30',
  signature: 'Best regards,\nTest Business',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// Mock invoice data
export const mockInvoice: Invoice = {
  id: 'test-invoice-id',
  user_id: 'test-user-id',
  invoice_number: 'INV-001',
  client_name: 'Test Client',
  client_email: 'client@example.com',
  amount: 10000,
  currency: 'INR',
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  status: 'pending',
  payment_link: null,
  notes: 'Test invoice notes',
  razorpay_payment_link_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// Mock overdue invoice
export const mockOverdueInvoice: Invoice = {
  ...mockInvoice,
  id: 'test-overdue-invoice-id',
  invoice_number: 'INV-002',
  due_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
}

// Mock paid invoice
export const mockPaidInvoice: Invoice = {
  ...mockInvoice,
  id: 'test-paid-invoice-id',
  invoice_number: 'INV-003',
  status: 'paid',
}

// Mock follow-up data
export const mockFollowUp: FollowUp = {
  id: 'test-followup-id',
  invoice_id: 'test-invoice-id',
  user_id: 'test-user-id',
  message: 'Test reminder message',
  scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  sent_at: null,
  tier: 1,
  status: 'scheduled',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// Mock sent follow-up
export const mockSentFollowUp: FollowUp = {
  ...mockFollowUp,
  id: 'test-sent-followup-id',
  sent_at: new Date().toISOString(),
  status: 'sent',
}

// Helper function to create custom invoice
export const createMockInvoice = (overrides: Partial<Invoice> = {}): Invoice => ({
  ...mockInvoice,
  ...overrides,
})

// Helper function to create custom profile
export const createMockProfile = (overrides: Partial<Profile> = {}): Profile => ({
  ...mockProfile,
  ...overrides,
})

// Helper function to create custom follow-up
export const createMockFollowUp = (overrides: Partial<FollowUp> = {}): FollowUp => ({
  ...mockFollowUp,
  ...overrides,
})

// Mock API responses
export const mockApiResponses = {
  success: {
    ok: true,
    json: async () => ({ success: true }),
  },
  error: {
    ok: false,
    json: async () => ({ error: 'API Error' }),
  },
  invoiceCreated: {
    ok: true,
    json: async () => ({
      success: true,
      invoice: mockInvoice
    }),
  },
  paymentLinkCreated: {
    ok: true,
    json: async () => ({
      success: true,
      paymentLink: 'https://razorpay.com/payment/test-link'
    }),
  },
}
