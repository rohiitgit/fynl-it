import { supabaseAdmin } from '@/lib/supabase-admin';
import { paymentLogger } from '@/lib/logger';

class FollowUpService {
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

}

export const followUpService = new FollowUpService();
