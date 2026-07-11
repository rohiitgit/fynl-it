import { supabaseAdmin } from '@/lib/supabase-admin';
import { paymentLogger } from '@/lib/logger';

export interface Invoice {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  invoice_number: string;
  amount: number;
  currency: string;
  due_date: string;
  payment_link: string | null;
  razorpay_link_id: string | null;
  status: string;
  description?: string;
}

export interface PaymentDetails {
  razorpayPaymentId: string;
  paymentProvider: string;
  paidAt?: Date;
  autoDetected?: boolean;
}

class InvoiceService {
  async findByInvoiceId(invoiceId: string): Promise<Invoice | null> {
    paymentLogger.debug({
      action: 'invoice_lookup_by_id',
      invoiceId,
    }, 'Looking for invoice by ID');

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('status', 'pending')
      .single();

    if (error || !data) {
      return null;
    }

    return data as Invoice;
  }

  async findByRazorpayLinkId(linkId: string): Promise<Invoice | null> {
    paymentLogger.debug({
      action: 'invoice_lookup_by_link',
      razorpayLinkId: linkId,
    }, 'Looking for invoice by payment link ID');

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('razorpay_link_id', linkId)
      .eq('status', 'pending')
      .single();

    if (error || !data) {
      return null;
    }

    return data as Invoice;
  }

  // Tries invoice_id first, then falls back to razorpay_link_id
  async findByPaymentReference(
    invoiceId?: string,
    razorpayLinkId?: string
  ): Promise<Invoice | null> {
    if (invoiceId) {
      const invoice = await this.findByInvoiceId(invoiceId);
      if (invoice) return invoice;
    }

    if (razorpayLinkId) {
      const invoice = await this.findByRazorpayLinkId(razorpayLinkId);
      if (invoice) return invoice;
    }

    return null;
  }

  async markAsPaid(invoiceId: string, paymentDetails: PaymentDetails): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: (paymentDetails.paidAt || new Date()).toISOString(),
        auto_detected: paymentDetails.autoDetected ?? true,
        razorpay_payment_id: paymentDetails.razorpayPaymentId,
        payment_reference: paymentDetails.razorpayPaymentId,
        payment_provider: paymentDetails.paymentProvider,
      })
      .eq('id', invoiceId);

    if (error) {
      paymentLogger.error({
        action: 'invoice_update_failed',
        invoiceId,
        paymentId: paymentDetails.razorpayPaymentId,
        err: error,
      }, 'Failed to update invoice status to paid');
      return false;
    }

    paymentLogger.info({
      action: 'invoice_marked_paid',
      invoiceId,
      paymentId: paymentDetails.razorpayPaymentId,
    }, 'Invoice marked as paid');

    return true;
  }

  async findAnyByRazorpayLinkId(linkId: string): Promise<Invoice | null> {
    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('razorpay_link_id', linkId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Invoice;
  }
}

export const invoiceService = new InvoiceService();
