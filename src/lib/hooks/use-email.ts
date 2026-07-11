import { useState, useCallback } from 'react';
import { useToast } from '@/lib/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { formatAmount, calculateDaysOverdue, type ProfileData } from '@/lib/email/format-utils';
import type { EmailTemplateProps } from '@/lib/email/templates';
import type { EmailResult } from '@/lib/email/send-email';

type UserProfile = Pick<ProfileData, 'first_name' | 'last_name' | 'business_name' | 'email'>;

// Supabase query result types (only the fields we actually select)
interface FollowUpQueryResult {
  id: string;
  user_id: string;
  subject: string;
  content: string;
  invoices: {
    id: string;
    client_name: string;
    client_email: string;
    invoice_number: string;
    amount: number;
    currency: string;
    due_date: string;
    payment_link: string | null;
    description: string | null;
    status: string;
  } | null;
}

export function useEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  const formatUserName = useCallback((profile: UserProfile): string => {
    const firstName = profile.first_name?.trim() || '';
    const lastName = profile.last_name?.trim() || '';
    return `${firstName} ${lastName}`.trim() || 'Your Name';
  }, []);

  const validateEmail = useCallback((email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }, []);

  const sendReminder = async (followUpId: string): Promise<EmailResult> => {
    if (!followUpId) {
      const errorMessage = 'Follow-up ID is required';
      setError(errorMessage);
      showError('Invalid request', errorMessage);
      return { success: false, error: errorMessage };
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Not authenticated');
      }

      const { data: followUp, error: followUpError } = await supabase
        .from('follow_ups')
        .select(`
          id,
          user_id,
          subject,
          content,
          invoices (
            id,
            client_name,
            client_email,
            invoice_number,
            amount,
            currency,
            due_date,
            payment_link,
            description,
            status
          )
        `)
        .eq('id', followUpId)
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .single();

      if (followUpError || !followUp) {
        throw new Error('Follow-up not found or already processed');
      }

      const typedFollowUp = followUp as FollowUpQueryResult;

      if (!typedFollowUp.invoices) {
        throw new Error('Invoice data not found');
      }

      const invoice = typedFollowUp.invoices;

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, business_name, email')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile not found');
      }

      // Calculate days overdue
      const dueDate = new Date(invoice.due_date);
      const daysOverdue = calculateDaysOverdue(dueDate);

      // Prepare template props
      const templateProps: EmailTemplateProps = {
        clientName: invoice.client_name,
        invoiceNumber: invoice.invoice_number,
        amount: formatAmount(invoice.amount, invoice.currency),
        dueDate: dueDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        daysOverdue,
        paymentLink: invoice.payment_link || undefined,
        upiLink: invoice.payment_link || undefined,
        userName: formatUserName(profile),
        businessName: profile.business_name || undefined,
        customMessage: typedFollowUp.content,
      };

      // Send email via API
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reminder',
          to: invoice.client_email,
          subject: typedFollowUp.subject,
          templateProps,
          replyTo: profile.email || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to send email');
      }

      const result = await response.json();

      // Update follow-up status
      const { error: updateError } = await supabase
        .from('follow_ups')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          message_id: result.messageId || null,
        })
        .eq('id', followUpId);

      if (updateError) {
        console.error('Failed to update follow-up status:', updateError);
      }

      // Log email
      const { error: logError } = await supabase
        .from('email_logs')
        .insert({
          user_id: user.id,
          invoice_id: invoice.id,
          follow_up_id: followUpId,
          email_type: 'reminder',
          recipient_email: invoice.client_email,
          subject: typedFollowUp.subject,
          message_id: result.messageId || null,
          status: 'sent'
        });

      if (logError) {
        console.error('Failed to log email:', logError);
      }

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

  // Send thank you email
  const sendThankYou = async (invoiceId: string): Promise<EmailResult> => {
    if (!invoiceId) {
      const errorMessage = 'Invoice ID is required';
      setError(errorMessage);
      showError('Invalid request', errorMessage);
      return { success: false, error: errorMessage };
    }

    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
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

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, business_name, email')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile not found');
      }

      // Prepare template props
      const templateProps: Omit<EmailTemplateProps, 'daysOverdue' | 'paymentLink' | 'upiLink' | 'qrCode' | 'customMessage'> = {
        clientName: invoice.client_name,
        invoiceNumber: invoice.invoice_number,
        amount: formatAmount(invoice.amount, invoice.currency),
        dueDate: new Date(invoice.due_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        userName: formatUserName(profile),
        businessName: profile.business_name || undefined,
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
          replyTo: profile.email || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to send thank you email');
      }

      const result = await response.json();

      // Cancel pending follow-ups
      const { error: cancelError } = await supabase
        .from('follow_ups')
        .update({ status: 'cancelled' })
        .eq('invoice_id', invoiceId)
        .eq('status', 'scheduled');

      if (cancelError) {
        console.error('Failed to cancel follow-ups:', cancelError);
      }

      // Log email
      const { error: logError } = await supabase
        .from('email_logs')
        .insert({
          user_id: user.id,
          invoice_id: invoiceId,
          follow_up_id: null,
          email_type: 'thank_you',
          recipient_email: invoice.client_email,
          subject: `Thank You! Payment Received for Invoice ${invoice.invoice_number}`,
          message_id: result.messageId || null,
          status: 'sent'
        });

      if (logError) {
        console.error('Failed to log email:', logError);
      }

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

  // Send test email
  const sendTestEmail = async (testEmail: string): Promise<EmailResult> => {
    if (!testEmail || !validateEmail(testEmail)) {
      const errorMessage = 'Please provide a valid email address';
      setError(errorMessage);
      showError('Invalid email', errorMessage);
      return { success: false, error: errorMessage };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to send test email');
      }

      const result = await response.json();

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