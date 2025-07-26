// src/lib/hooks/use-email.ts - Fixed client-side approach
import { useState } from 'react';
import { useToast } from '@/lib/hooks/use-toast';
import { supabase } from '@/lib/supabase';

// Constants
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export function useEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  const sendReminder = async (followUpId: string): Promise<EmailResult> => {
    setLoading(true);
    setError(null);

    try {
      // Get current user (client-side auth)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Get follow-up details with invoice data
      const { data: followUp, error: followUpError } = await supabase
        .from('follow_ups')
        .select(`
          *,
          invoices (
            id,
            client_name,
            client_email,
            invoice_number,
            amount,
            currency,
            due_date,
            payment_link,
            description
          )
        `)
        .eq('id', followUpId)
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .single();

      if (followUpError || !followUp) {
        throw new Error('Follow-up not found or already processed');
      }

      // Get user profile separately using correct user_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, business_name, email')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile not found');
      }

      const invoice = followUp.invoices;

      if (!invoice) {
        throw new Error('Invoice data not found');
      }

      // Calculate days overdue
      const dueDate = new Date(invoice.due_date);
      const today = new Date();
      const diffTime = today.getTime() - dueDate.getTime();
      const daysOverdue = Math.max(0, Math.floor(diffTime / MILLISECONDS_PER_DAY));

      // Currency symbol mapping
      const currencySymbol = invoice.currency === 'USD' ? '$' : invoice.currency;
      const formattedAmount = `${currencySymbol}${invoice.amount.toFixed(2)}`;

      // Format user name
      const userName = `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim();

      // Prepare template props
      const templateProps = {
        clientName: invoice.client_name,
        invoiceNumber: invoice.invoice_number,
        amount: formattedAmount,
        dueDate: dueDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        daysOverdue,
        paymentLink: invoice.payment_link ?? undefined,
        userName,
        businessName: profile.business_name ?? undefined,
        customMessage: undefined, // Message content generated dynamically
      };

      // Send email via simplified API
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reminder',
          to: invoice.client_email,
          subject: followUp.subject,
          templateProps,
          replyTo: profile.email ?? undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? 'Failed to send email');
      }

      // Update follow-up status in database
      await supabase
        .from('follow_ups')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          message_id: result.messageId,
        })
        .eq('id', followUpId);

      success('Reminder sent!', 'Your payment reminder has been sent successfully.');

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reminder';
      setError(errorMessage);
      
      showError('Failed to send reminder', errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const sendThankYou = async (invoiceId: string): Promise<EmailResult> => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Get invoice data
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .eq('user_id', user.id)
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Invoice not found');
      }

      // Get user profile separately
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, business_name, email')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile not found');
      }

      // Currency symbol mapping
      const currencySymbol = invoice.currency === 'USD' ? '$' : invoice.currency;
      const formattedAmount = `${currencySymbol}${invoice.amount.toFixed(2)}`;

      // Format user name
      const userName = `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim();

      // Prepare template props
      const templateProps = {
        clientName: invoice.client_name,
        invoiceNumber: invoice.invoice_number,
        amount: formattedAmount,
        dueDate: new Date(invoice.due_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        userName,
        businessName: profile.business_name ?? undefined,
      };

      // Send thank you email
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'thank_you',
          to: invoice.client_email,
          subject: `Thank You! Payment Received for Invoice ${invoice.invoice_number}`,
          templateProps,
          replyTo: profile.email ?? undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? 'Failed to send thank you email');
      }

      // Cancel any pending follow-ups for this invoice
      await supabase
        .from('follow_ups')
        .update({ status: 'cancelled' })
        .eq('invoice_id', invoiceId)
        .eq('status', 'scheduled');

      success('Thank you email sent!', 'Your client has been thanked for their payment.');

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send thank you email';
      setError(errorMessage);
      
      showError('Failed to send thank you email', errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async (testEmail: string): Promise<EmailResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? 'Failed to send test email');
      }

      success('Test email sent!', `Check ${testEmail} for the test message.`);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send test email';
      setError(errorMessage);
      
      showError('Test email failed', errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    sendReminder,
    sendThankYou,
    sendTestEmail,
    loading,
    error,
  };
}