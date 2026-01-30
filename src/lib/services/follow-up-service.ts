// src/lib/services/follow-up-service.ts
// Service layer for follow-up database operations

import { supabaseAdmin } from '@/lib/supabase-admin';
import { paymentLogger } from '@/lib/logger';

class FollowUpService {
  /**
   * Cancel all pending/scheduled follow-ups for an invoice
   * Used when an invoice is paid to stop reminder emails
   */
  async cancelByInvoice(invoiceId: string): Promise<{ success: boolean; count?: number }> {
    const { data, error } = await supabaseAdmin
      .from('follow_ups')
      .update({ status: 'cancelled' })
      .eq('invoice_id', invoiceId)
      .eq('status', 'scheduled')
      .select('id');

    if (error) {
      paymentLogger.error({
        action: 'followups_cancel_failed',
        invoiceId,
        err: error,
      }, 'Failed to cancel follow-ups');
      return { success: false };
    }

    const count = data?.length || 0;

    paymentLogger.info({
      action: 'followups_cancelled',
      invoiceId,
      count,
    }, `Cancelled ${count} pending follow-ups`);

    return { success: true, count };
  }

  /**
   * Mark a follow-up as sent
   */
  async markAsSent(followUpId: string, messageId?: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('follow_ups')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        message_id: messageId || null,
      })
      .eq('id', followUpId);

    if (error) {
      paymentLogger.error({
        action: 'followup_mark_sent_failed',
        followUpId,
        err: error,
      }, 'Failed to mark follow-up as sent');
      return false;
    }

    return true;
  }

  /**
   * Mark a follow-up as failed
   */
  async markAsFailed(followUpId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('follow_ups')
      .update({
        status: 'failed',
      })
      .eq('id', followUpId);

    if (error) {
      paymentLogger.error({
        action: 'followup_mark_failed_failed',
        followUpId,
        err: error,
      }, 'Failed to mark follow-up as failed');
      return false;
    }

    return true;
  }

  /**
   * Mark a follow-up as cancelled
   */
  async markAsCancelled(followUpId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('follow_ups')
      .update({ status: 'cancelled' })
      .eq('id', followUpId);

    if (error) {
      paymentLogger.error({
        action: 'followup_cancel_failed',
        followUpId,
        err: error,
      }, 'Failed to cancel follow-up');
      return false;
    }

    return true;
  }
}

export const followUpService = new FollowUpService();
