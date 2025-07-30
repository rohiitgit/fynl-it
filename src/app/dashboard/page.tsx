// src/app/dashboard/page.tsx - Fixed to use AuthProvider
'use client'

import { 
  DollarSign, 
  Plus, 
  MoreVertical, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Mail,
  Send,
  Heart as ThankYou,
  TrendingUp,
  FileText,
  Edit,
  LogOut,
} from "lucide-react";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Invoice Actions Dropdown Component
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
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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

export default function Dashboard() {
  const { user, session, signOut, loading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const { error, success } = useToast();
  const { sendReminder, sendThankYou } = useEmail();

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
      // Wait a bit for session to be fully ready on first load
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
        // If it's a network/auth error and we haven't retried, try once more
        if ((error.message.includes('NetworkError') || error.message.includes('JWT')) && retryCount < 2) {
          console.log('Retrying invoice fetch after auth/network error...');
          setTimeout(() => fetchInvoices(retryCount + 1), 500);
          return;
        }
        throw error;
      }
      
      setInvoices(data || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      // Only show error toast if it's not a retry and we've tried multiple times
      if (retryCount >= 1) {
        error("Error", "Failed to load invoices");
      }
    } finally {
      setLoading(false);
    }
  }, [user, session, authLoading, error]);

  // Load invoices when user and session are both available and auth is not loading
  useEffect(() => {
    if (user && session && !authLoading) {
      // Small delay to ensure session is fully established
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

      // If marking as paid, send thank you email and cancel follow-ups
      if (newStatus === 'paid') {
        await sendThankYou(invoiceId);
        
        // Cancel any pending follow-ups
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
      // Find the next scheduled follow-up for this invoice
      const { data: followUps } = await supabase
        .from('follow_ups')
        .select('id')
        .eq('invoice_id', invoiceId)
        .eq('status', 'scheduled')
        .order('scheduled_for', { ascending: true })
        .limit(1);

      if (followUps && followUps.length > 0) {
        await sendReminder(followUps[0].id);
        fetchInvoices(); // Refresh the list
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'overdue': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadgeWithEmail = (invoice: Invoice) => {
    const baseStatusElement = (
      <Badge
        variant="outline"
        className={`${getStatusColor(invoice.status)} flex items-center gap-1`}
      >
        {getStatusIcon(invoice.status)}
        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
      </Badge>
    );

    // Add email indicator if there are scheduled follow-ups
    if (invoice.status !== 'paid') {
      return (
        <div className="flex items-center gap-2">
          {baseStatusElement}
          <Badge variant="secondary" className="text-xs">
            <Mail className="h-3 w-3 mr-1" />
            Auto
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

  // Show loading while auth is being checked
  if (authLoading || (loading && !user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // This should not happen due to middleware, but just in case
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to access your dashboard</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">Nudgr</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome back, {getUserDisplayName()}!
              </span>
              <NewInvoiceModal onSuccess={fetchInvoices} />
              <Button 
                variant="outline" 
                size="sm"
                onClick={signOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paid</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.paidAmount.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.paid} invoices
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <TrendingUp className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(stats.totalAmount - stats.paidAmount).toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pending + stats.overdue} invoices
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>
                  Your latest invoice activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first invoice to start getting paid faster
                    </p>
                    <NewInvoiceModal onSuccess={fetchInvoices} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.slice(0, 5).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{invoice.client_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Invoice #{invoice.invoice_number}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              Due: {new Date(invoice.due_date).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadgeWithEmail(invoice)}
                          <InvoiceActionsDropdown
                            invoice={invoice}
                            onMarkPaid={(id) => updateInvoiceStatus(id, 'paid')}
                            onSendReminder={handleSendReminder}
                            onSendThankYou={handleSendThankYou}
                            onEditInvoice={handleEditInvoice}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>All Invoices</CardTitle>
                <CardDescription>
                  Manage your invoices and payment reminders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first invoice to start getting paid faster
                    </p>
                    <NewInvoiceModal onSuccess={fetchInvoices} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{invoice.client_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {invoice.client_email} • Invoice #{invoice.invoice_number}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              Due: {new Date(invoice.due_date).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadgeWithEmail(invoice)}
                          <InvoiceActionsDropdown
                            invoice={invoice}
                            onMarkPaid={(id) => updateInvoiceStatus(id, 'paid')}
                            onSendReminder={handleSendReminder}
                            onSendThankYou={handleSendThankYou}
                            onEditInvoice={handleEditInvoice}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails">
            <Card>
              <CardHeader>
                <CardTitle>Email Activity</CardTitle>
                <CardDescription>
                  Recent email reminders and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No email activity yet</h3>
                  <p className="text-muted-foreground">
                    Email history will appear here once you start sending reminders
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Manage your personal and business information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Account Details</h4>
                    <p className="text-sm text-muted-foreground">
                      Email: {user?.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Name: {getUserDisplayName()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Business Information</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure your business name and details in your profile
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Email Settings */}
              <EmailSettings />

              {/* Follow-up Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Follow-up Preferences</CardTitle>
                  <CardDescription>
                    Configure your automated reminder settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Default Timing</h4>
                    <p className="text-sm text-muted-foreground">
                      Reminders are sent: Due date, +3 days, +7 days, +14 days, +30 days
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Auto-scheduling</h4>
                    <p className="text-sm text-muted-foreground">
                      Follow-up sequences are automatically activated when you create an invoice
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

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