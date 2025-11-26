// src/app/dashboard/page.tsx - Fully Responsive Version
'use client'

import {
  MoreVertical,
  CheckCircle2,
  Mail,
  Send,
  Heart as ThankYou,
  TrendingUp,
  FileText,
  Edit,
  User,
  DollarSign,
  Plus,
} from "lucide-react";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { InvoiceCardSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { InvoiceEmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/lib/hooks/use-toast";
import { useEmail } from "@/lib/hooks/use-email";
import { Tables } from "@/types/supabase";
import EmailSettings from "@/components/EmailSettings";
import NewInvoiceModal from "@/components/NewInvoiceModal";
import { useAuth } from "@/components/AuthProvider";

type Invoice = Tables<"invoices">;

// Mobile-optimized Invoice Actions Component
const InvoiceActionsDropdown = ({ 
  invoice, 
  onMarkPaid, 
  onSendReminder, 
  onSendThankYou,
  onEditInvoice,
}: {
  invoice: Invoice;
  onMarkPaid: (id: string) => void;
  onSendReminder: (id: string) => void;
  onSendThankYou: (id: string) => void;
  onEditInvoice: (id: string) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex-shrink-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onEditInvoice(invoice.id)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Invoice
        </DropdownMenuItem>
        {invoice.status !== 'paid' && (
          <>
            <DropdownMenuItem onClick={() => onSendReminder(invoice.id)}>
              <Send className="h-4 w-4 mr-2" />
              Send Reminder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMarkPaid(invoice.id)}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark as Paid
            </DropdownMenuItem>
          </>
        )}
        {invoice.status === 'paid' && (
          <DropdownMenuItem onClick={() => onSendThankYou(invoice.id)}>
            <ThankYou className="h-4 w-4 mr-2" />
            Send Thank You
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Mobile-optimized Invoice Card Component
const InvoiceCard = ({
  invoice,
  onMarkPaid,
  onSendReminder,
  onSendThankYou,
  onEditInvoice,
  getStatusBadgeWithEmail
}: {
  invoice: Invoice;
  onMarkPaid: (id: string) => void;
  onSendReminder: (id: string) => void;
  onSendThankYou: (id: string) => void;
  onEditInvoice: (id: string) => void;
  getStatusBadgeWithEmail: (invoice: Invoice) => React.ReactNode;
}) => {
  // Get left border color based on status
  const getBorderColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'border-l-green-500 dark:border-l-green-400'
      case 'overdue':
        return 'border-l-red-500 dark:border-l-red-400'
      case 'pending':
        return 'border-l-orange-500 dark:border-l-orange-400'
      default:
        return 'border-l-blue-500 dark:border-l-blue-400'
    }
  }

  return (
    <div className={`group relative rounded-xl border border-l-4 transition-all duration-300 bg-card hover:shadow-md border-border/50 hover:border-border ${getBorderColor(invoice.status)}`}>
    <div className="p-4 sm:p-6">
      {/* Mobile: Stacked layout, Desktop: Horizontal layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* Client Info */}
        <div className="flex items-start space-x-3 sm:space-x-4 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:from-green-500/20 group-hover:to-emerald-500/20 transition-all">
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-base sm:text-lg truncate">{invoice.client_name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {invoice.client_email}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Invoice #{invoice.invoice_number}
            </p>
          </div>
        </div>

        {/* Amount & Status - Mobile: Full width row, Desktop: Right aligned */}
        <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6">
          {/* Amount & Due Date */}
          <div className="text-left sm:text-right">
            <p className="text-lg sm:text-xl font-bold">${invoice.amount.toFixed(2)}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Due: {new Date(invoice.due_date).toLocaleDateString()}
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0">
            {getStatusBadgeWithEmail(invoice)}
          </div>

          {/* Actions - Always visible on mobile, hover on desktop */}
          <div className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
            <InvoiceActionsDropdown
              invoice={invoice}
              onMarkPaid={onMarkPaid}
              onSendReminder={onSendReminder}
              onSendThankYou={onSendThankYou}
              onEditInvoice={onEditInvoice}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default function Dashboard() {
  const searchParams = useSearchParams();
  const { user, session, loading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { error, success } = useToast();
  const { sendReminder, sendThankYou } = useEmail();

  // Update active tab based on URL query parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["overview", "invoices", "emails", "settings"].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab("overview");
    }
  }, [searchParams]);

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Single fetchInvoices function with session validation
  const fetchInvoices = useCallback(async (retryCount = 0) => {
    if (!user || !session) return;

    try {
      if (retryCount === 0 && authLoading) {
        setTimeout(() => fetchInvoices(1), 100);
        return;
      }

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        if ((error.message.includes('NetworkError') || error.message.includes('JWT')) && retryCount < 2) {
          // Retry on transient auth/network errors
          setTimeout(() => fetchInvoices(retryCount + 1), 500);
          return;
        }
        throw error;
      }
      
      setInvoices(data || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      if (retryCount >= 1) {
        error("Error", "Failed to load invoices");
      }
    } finally {
      setLoading(false);
    }
  }, [user, session, authLoading, error]);

  useEffect(() => {
    if (user && session && !authLoading) {
      const timer = setTimeout(() => {
        fetchInvoices();
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [user, session, authLoading, fetchInvoices]);

  const updateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: newStatus,
          paid_at: newStatus === 'paid' ? new Date().toISOString() : null
        })
        .eq('id', invoiceId);

      if (error) throw error;

      if (newStatus === 'paid') {
        await sendThankYou(invoiceId);
        
        await supabase
          .from('follow_ups')
          .update({ status: 'cancelled' })
          .eq('invoice_id', invoiceId)
          .eq('status', 'scheduled');
      }

      success("Success", newStatus === 'paid' 
        ? "Invoice marked as paid and thank you email sent!" 
        : "Invoice status updated");
      
      await fetchInvoices();
    } catch (err) {
      console.error('Error updating invoice:', err);
      error("Error", "Failed to update invoice");
    }
  };

  const handleSendReminder = async (invoiceId: string) => {
    try {
      const { data: followUps } = await supabase
        .from('follow_ups')
        .select('id')
        .eq('invoice_id', invoiceId)
        .eq('status', 'scheduled')
        .order('scheduled_for', { ascending: true })
        .limit(1);

      if (followUps && followUps.length > 0) {
        await sendReminder(followUps[0].id);
        fetchInvoices();
      } else {
        error("No reminders scheduled", "Set up follow-up messages for this invoice first.");
      }
    } catch (err) {
      console.error('Error sending reminder:', err);
    }
  };

  const handleSendThankYou = async (invoiceId: string) => {
    await sendThankYou(invoiceId);
  };

  const handleEditInvoice = (invoiceId: string) => {
    setEditingInvoiceId(invoiceId);
  };

  const handleEditSuccess = () => {
    setEditingInvoiceId(null);
    fetchInvoices();
  };

  const getStatusBadgeWithEmail = (invoice: Invoice) => {
    // Map invoice status to StatusBadge variants
    const statusMap: Record<string, 'paid' | 'pending' | 'overdue'> = {
      'paid': 'paid',
      'pending': 'pending',
      'overdue': 'overdue',
    };

    const status = statusMap[invoice.status] || 'pending';

    const baseStatusElement = (
      <StatusBadge status={status} className="text-xs sm:text-sm">
        <span className="hidden xs:inline">
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </span>
      </StatusBadge>
    );

    if (invoice.status !== 'paid') {
      return (
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2">
          {baseStatusElement}
          <Badge variant="secondary" className="text-xs">
            <Mail className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Auto</span>
          </Badge>
        </div>
      );
    }

    return baseStatusElement;
  };

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'pending').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, invoice) => sum + invoice.amount, 0),
    paidAmount: invoices.filter(i => i.status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0),
  };

  // Loading states
  if (authLoading || (loading && !user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4 sm:p-6 lg:p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded animate-shimmer" />
              <div className="h-4 w-72 bg-muted rounded animate-shimmer" />
            </div>
            <div className="h-10 w-32 bg-muted rounded animate-shimmer" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>

          {/* Invoice List Skeleton */}
          <div className="space-y-4">
            <div className="h-6 w-32 bg-muted rounded animate-shimmer" />
            <InvoiceCardSkeleton />
            <InvoiceCardSkeleton />
            <InvoiceCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to access your dashboard</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto animate-fade-in">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">

          <TabsContent value="overview">
            {/* Responsive Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-blue-200 dark:border-blue-800 shadow-info hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-70 dark:text-gray-30">Total Invoices</CardTitle>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700 dark:text-blue-300" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full" />
                    <p className="text-xs text-blue-600 dark:text-blue-400">All invoices</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background border-emerald-200 dark:border-emerald-800 shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-70 dark:text-gray-30">Total Amount</CardTitle>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-full flex items-center justify-center group-hover:from-emerald-200 group-hover:to-green-200 dark:group-hover:from-emerald-900/50 dark:group-hover:to-green-900/50 transition-all">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-700 dark:text-emerald-300" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-700 to-green-700 dark:from-emerald-300 dark:to-green-300 bg-clip-text text-transparent">${stats.totalAmount.toFixed(0)}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" />
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Invoice value</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background border-green-200 dark:border-green-800 shadow-success hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-70 dark:text-gray-30">Paid</CardTitle>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-700 dark:text-green-300" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="text-xl sm:text-3xl font-bold text-green-700 dark:text-green-300">${stats.paidAmount.toFixed(0)}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full" />
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {stats.paid} collected
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background border-orange-200 dark:border-orange-800 shadow-warning hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-70 dark:text-gray-30">Pending</CardTitle>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-orange-700 dark:text-orange-300" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="text-xl sm:text-3xl font-bold text-orange-700 dark:text-orange-300">${(stats.totalAmount - stats.paidAmount).toFixed(0)}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full" />
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      {stats.pending + stats.overdue} awaiting
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Invoices */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Recent Invoices</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Your latest invoice activity
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {invoices.length === 0 ? (
                  <InvoiceEmptyState onCreateInvoice={() => setEditingInvoiceId("new")} />
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {invoices.slice(0, 5).map((invoice) => (
                      <InvoiceCard
                        key={invoice.id}
                        invoice={invoice}
                        onMarkPaid={(id) => updateInvoiceStatus(id, 'paid')}
                        onSendReminder={handleSendReminder}
                        onSendThankYou={handleSendThankYou}
                        onEditInvoice={handleEditInvoice}
                        getStatusBadgeWithEmail={getStatusBadgeWithEmail}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">All Invoices</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Manage your invoices and payment reminders
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {invoices.length === 0 ? (
                  <InvoiceEmptyState onCreateInvoice={() => setEditingInvoiceId("new")} />
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {invoices.map((invoice) => (
                      <InvoiceCard
                        key={invoice.id}
                        invoice={invoice}
                        onMarkPaid={(id) => updateInvoiceStatus(id, 'paid')}
                        onSendReminder={handleSendReminder}
                        onSendThankYou={handleSendThankYou}
                        onEditInvoice={handleEditInvoice}
                        getStatusBadgeWithEmail={getStatusBadgeWithEmail}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Email Activity</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Recent email reminders and their status
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-center py-8 sm:py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No email activity yet</h3>
                  <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
                    Email history will appear here once you start sending reminders
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-4 sm:space-y-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Manage your personal and business information
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Account Details</h4>
                    <p className="text-sm text-muted-foreground break-all">
                      Email: {user?.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Name: {getUserDisplayName()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Business Information</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure your business name and details in your profile
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Email Settings - Mobile optimized */}
              <div className="w-full">
                <EmailSettings />
              </div>

              {/* Follow-up Settings */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Follow-up Preferences</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Configure your automated reminder settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Default Timing</h4>
                    <p className="text-sm text-muted-foreground">
                      Reminders are sent: Due date, +3 days, +7 days, +14 days, +21 days
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Auto-scheduling</h4>
                    <p className="text-sm text-muted-foreground">
                      Follow-up sequences are automatically activated when you create an invoice
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Invoice Modal - Always render but control with open prop */}
        <NewInvoiceModal
          mode="edit"
          invoiceId={editingInvoiceId || undefined}
          open={!!editingInvoiceId}
          onSuccess={handleEditSuccess}
          onClose={() => setEditingInvoiceId(null)}
        />
      </div>
    );
  }