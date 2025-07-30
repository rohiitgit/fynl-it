// src/components/NewInvoiceModal.tsx - Fixed modal rendering and state issues
'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Upload,
    FileText,
    Loader2,
    Calendar,
    DollarSign,
    User,
    Mail,
    Link,
    Hash,
    Plus,
    Sparkles,
    Smartphone,
    CheckCircle2,
    QrCode,
    Edit,
    Save
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/lib/hooks/use-toast";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Tables } from "@/types/supabase";

interface InvoiceFormData {
    clientName: string;
    clientEmail: string;
    invoiceNumber: string;
    amount: string;
    currency: string;
    dueDate: string;
    paymentLink: string;
    description: string;
    paymentProvider: string;
}

interface NewInvoiceModalProps {
  mode?: 'create' | 'edit';
  invoiceId?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  // For create mode
  children?: React.ReactNode;
  // Add explicit open control for edit mode (optional - if not provided, component manages its own state)
  open?: boolean;
  // Trigger element for edit mode
  trigger?: React.ReactNode;
}

export default function NewInvoiceModal({ 
  mode = 'create', 
  invoiceId, 
  onSuccess, 
  onClose,
  children,
  open: externalOpen,
  trigger
}: NewInvoiceModalProps) {
    const router = useRouter();
    const { toast } = useToast();
    
    // For edit mode, use external open state if provided, otherwise use internal state
    // For create mode, always use internal state
    const [internalOpen, setInternalOpen] = useState(false);
    const isEditMode = mode === 'edit';
    const hasExternalControl = isEditMode && externalOpen !== undefined;
    const open = hasExternalControl ? externalOpen : internalOpen;
    const setOpen = hasExternalControl ? (onClose ? () => onClose() : () => {}) : setInternalOpen;
    
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [loadingInvoice, setLoadingInvoice] = useState(false);
    const [formData, setFormData] = useState<InvoiceFormData>({
        clientName: "",
        clientEmail: "",
        invoiceNumber: "",
        amount: "",
        currency: "INR",
        dueDate: "",
        paymentLink: "",
        description: "",
        paymentProvider: "razorpay"
    });

    const modalTitle = isEditMode ? 'Edit Invoice' : 'Create New Invoice';
    const modalDescription = isEditMode 
        ? 'Update your invoice details' 
        : 'Upload an invoice for AI processing or fill in the details manually';

    // Load existing invoice data in edit mode
    useEffect(() => {
        if (isEditMode && invoiceId && open) {
            loadInvoiceData();
        }
    }, [isEditMode, invoiceId, open]);

    const loadInvoiceData = async () => {
        if (!invoiceId) return;

        setLoadingInvoice(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { data: invoice, error } = await supabase
                .from('invoices')
                .select('*')
                .eq('id', invoiceId)
                .eq('user_id', user.id)
                .single();

            if (error) throw error;

            if (invoice) {
                setFormData({
                    clientName: invoice.client_name,
                    clientEmail: invoice.client_email,
                    invoiceNumber: invoice.invoice_number,
                    amount: invoice.amount.toString(),
                    currency: invoice.currency,
                    dueDate: invoice.due_date,
                    paymentLink: invoice.payment_link || "",
                    description: invoice.description || "",
                    paymentProvider: invoice.payment_link ? "" : "razorpay"
                });
            }
        } catch (error) {
            console.error('Error loading invoice:', error);
            toast({
                title: "Error",
                description: "Failed to load invoice data",
            });
            if (onClose) onClose();
        } finally {
            setLoadingInvoice(false);
        }
    };

    const resetForm = () => {
        setFormData({
            clientName: "",
            clientEmail: "",
            invoiceNumber: "",
            amount: "",
            currency: "INR",
            dueDate: "",
            paymentLink: "",
            description: "",
            paymentProvider: "razorpay",
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow file upload in create mode
        if (isEditMode) return;

        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            toast({
                title: "Invalid file type",
                description: "Please upload a PDF or image file (PNG, JPG)",
            });
            return;
        }

        setUploadLoading(true);

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;

                try {
                    const response = await fetch('/api/process-invoice', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            file: base64,
                            mimeType: file.type
                        })
                    });

                    if (!response.ok) throw new Error('Failed to process invoice');

                    const data = await response.json();

                    setFormData({
                        clientName: data.clientName || "",
                        clientEmail: data.clientEmail || "",
                        invoiceNumber: data.invoiceNumber || "",
                        amount: data.amount || "",
                        currency: data.currency || "INR",
                        dueDate: data.dueDate || "",
                        paymentLink: data.paymentLink || "",
                        description: data.description || "",
                        paymentProvider: "razorpay"
                    });

                    toast({
                        title: "Invoice processed!",
                        description: "Please review and confirm the extracted details",
                    });

                    setTimeout(() => {
                        setUploadLoading(false);
                    }, 500);
                } catch (error) {
                    console.error('Error processing invoice:', error);
                    toast({
                        title: "Processing failed",
                        description: "Could not extract invoice details. Please fill manually.",
                    });
                    setUploadLoading(false);
                }
            };

            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error reading file:', error);
            setUploadLoading(false);
            toast({
                title: "Error reading file",
                description: "Could not read the file. Please try again.",
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const invoiceData = {
                client_name: formData.clientName,
                client_email: formData.clientEmail,
                invoice_number: formData.invoiceNumber,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                due_date: formData.dueDate,
                payment_link: formData.paymentLink,
                description: formData.description,
            };

            if (isEditMode && invoiceId) {
                // Update existing invoice
                const { error } = await supabase
                    .from('invoices')
                    .update(invoiceData)
                    .eq('id', invoiceId)
                    .eq('user_id', user.id);

                if (error) throw error;

                toast({
                    title: "Invoice updated successfully!",
                    description: "Your changes have been saved",
                });

                if (onClose) onClose();
                if (onSuccess) onSuccess();

            } else {
                // Create new invoice
                const { data: invoice, error } = await supabase
                    .from('invoices')
                    .insert({
                        user_id: user.id,
                        ...invoiceData,
                        status: 'pending'
                    })
                    .select()
                    .single();

                if (error) throw error;

                // Handle UPI payment link generation for new invoices
                if (formData.paymentProvider === 'razorpay') {
                    try {
                        const { data: session } = await supabase.auth.getSession();
                        const response = await fetch('/api/payments/create-link', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.session?.access_token}`
                            },
                            body: JSON.stringify({ invoiceId: invoice.id })
                        });

                        const linkResult = await response.json();
                        
                        if (linkResult.success) {
                            toast({
                                title: "Invoice created with UPI payment!",
                                description: "Payment link with UPI + QR code generated automatically",
                            });
                        } else {
                            toast({
                                title: "Invoice created",
                                description: "Payment link generation failed - you can add it manually",
                            });
                        }
                    } catch (linkError) {
                        console.error('Payment link generation failed:', linkError);
                    }
                }

                toast({
                    title: "Invoice created successfully!",
                    description: "Now let's set up your follow-up messages",
                });

                resetForm();
                setInternalOpen(false);

                if (onSuccess) onSuccess();
                router.push(`/invoices/${invoice.id}/setup-messages`);
            }

        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} invoice:`, error);
            toast({
                title: "Error",
                description: `Failed to ${isEditMode ? 'update' : 'create'} invoice. Please try again.`,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (hasExternalControl) {
            if (!newOpen && onClose) {
                onClose();
            }
        } else {
            setInternalOpen(newOpen);
            if (!newOpen) {
                resetForm();
            }
        }
    };

    // For edit mode, render without trigger or with custom trigger
    if (isEditMode) {
        return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                {trigger && (
                    <DialogTrigger asChild>
                        {trigger}
                    </DialogTrigger>
                )}
                <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                    <DialogHeader className="px-6 pt-6">
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5 text-primary" />
                            {modalTitle}
                        </DialogTitle>
                        <DialogDescription>
                            {modalDescription}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[calc(90vh-8rem)] px-6">
                        <div className="space-y-6 pb-6">
                            {/* Loading invoice data for edit mode */}
                            {loadingInvoice ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-center space-y-4">
                                        <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                                        <p className="text-muted-foreground">Loading invoice data...</p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Client Information */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b">
                                            <User className="h-5 w-5 text-primary" />
                                            <h3 className="font-semibold text-lg">Client Information</h3>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="modal-clientName">
                                                    <User className="h-4 w-4 inline mr-1" />
                                                    Client Name *
                                                </Label>
                                                <Input
                                                    id="modal-clientName"
                                                    name="clientName"
                                                    value={formData.clientName}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="modal-clientEmail">
                                                    <Mail className="h-4 w-4 inline mr-1" />
                                                    Client Email *
                                                </Label>
                                                <Input
                                                    id="modal-clientEmail"
                                                    name="clientEmail"
                                                    type="email"
                                                    value={formData.clientEmail}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="john@company.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Invoice Details */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b">
                                            <FileText className="h-5 w-5 text-primary" />
                                            <h3 className="font-semibold text-lg">Invoice Details</h3>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="modal-invoiceNumber">
                                                    <Hash className="h-4 w-4 inline mr-1" />
                                                    Invoice Number *
                                                </Label>
                                                <Input
                                                    id="modal-invoiceNumber"
                                                    name="invoiceNumber"
                                                    value={formData.invoiceNumber}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="INV-001"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="modal-dueDate">
                                                    <Calendar className="h-4 w-4 inline mr-1" />
                                                    Due Date *
                                                </Label>
                                                <Input
                                                    id="modal-dueDate"
                                                    name="dueDate"
                                                    type="date"
                                                    value={formData.dueDate}
                                                    onChange={handleInputChange}
                                                    required
                                                    min={isEditMode ? undefined : format(new Date(), 'yyyy-MM-dd')}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="modal-amount">
                                                    <DollarSign className="h-4 w-4 inline mr-1" />
                                                    Amount *
                                                </Label>
                                                <Input
                                                    id="modal-amount"
                                                    name="amount"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.amount}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="10000.00"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="modal-currency">Currency</Label>
                                                <select
                                                    id="modal-currency"
                                                    name="currency"
                                                    value={formData.currency}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                                                    className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm"
                                                >
                                                    <option value="INR">₹ INR</option>
                                                    <option value="USD">$ USD</option>
                                                    <option value="EUR">€ EUR</option>
                                                    <option value="GBP">£ GBP</option>
                                                    <option value="CAD">$ CAD</option>
                                                    <option value="AUD">$ AUD</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="modal-description">
                                                <FileText className="h-4 w-4 inline mr-1" />
                                                Description (Optional)
                                            </Label>
                                            <Textarea
                                                id="modal-description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                placeholder="Web development services for Project X..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    {/* Payment Method Selection */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b">
                                            <Smartphone className="h-5 w-5 text-primary" />
                                            <h3 className="font-semibold text-lg">Payment Method</h3>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {/* UPI + Razorpay Option */}
                                            <div className="p-4 border-2 border-green-200 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                                <div className="flex items-start space-x-3">
                                                    <input
                                                        type="radio"
                                                        id="upi-razorpay"
                                                        name="paymentMethod"
                                                        value="razorpay"
                                                        checked={formData.paymentProvider === 'razorpay'}
                                                        onChange={(e) => setFormData(prev => ({ 
                                                            ...prev, 
                                                            paymentProvider: e.target.value 
                                                        }))}
                                                        className="w-4 h-4 text-green-600 mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <Label htmlFor="upi-razorpay" className="flex items-center gap-2 cursor-pointer">
                                                            <div className="flex items-center gap-2">
                                                                <QrCode className="h-4 w-4 text-green-600" />
                                                                <span className="font-semibold text-green-800">UPI + Cards via Razorpay</span>
                                                                <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-medium">
                                                                    Recommended
                                                                </span>
                                                            </div>
                                                        </Label>
                                                        <div className="mt-2 space-y-1">
                                                            <div className="flex items-center gap-2 text-sm text-green-700">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                <span>Instant UPI payments (PhonePe, GPay, Paytm)</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-green-700">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                <span>Auto-detection when client pays</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-green-700">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                <span>QR code + UPI link in emails</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-green-700">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                <span>Cards & net banking backup</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Manual Payment Option */}
                                            <div className="p-4 border rounded-lg">
                                                <div className="flex items-start space-x-3">
                                                    <input
                                                        type="radio"
                                                        id="manual-payment"
                                                        name="paymentMethod"
                                                        value=""
                                                        checked={formData.paymentProvider === ''}
                                                        onChange={(e) => setFormData(prev => ({ 
                                                            ...prev, 
                                                            paymentProvider: e.target.value 
                                                        }))}
                                                        className="w-4 h-4 text-primary mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <Label htmlFor="manual-payment" className="flex items-center gap-2 cursor-pointer">
                                                            <Link className="h-4 w-4" />
                                                            <span className="font-medium">Manual Payment Link</span>
                                                        </Label>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Add your own UPI ID, bank details, or payment link. 
                                                            You&apos;ll need to manually confirm payments.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Manual Payment Link Field */}
                                        {formData.paymentProvider === '' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="modal-paymentLink">
                                                    <Link className="h-4 w-4 inline mr-1" />
                                                    Payment Link or UPI ID
                                                </Label>
                                                <Input
                                                    id="modal-paymentLink"
                                                    name="paymentLink"
                                                    type="text"
                                                    value={formData.paymentLink}
                                                    onChange={handleInputChange}
                                                    placeholder="yourname@paytm OR https://paypal.me/yourname"
                                                />
                                                <p className="text-sm text-muted-foreground">
                                                    Enter your UPI ID (like yourname@paytm) or payment link
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end space-x-3 pt-6 border-t">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleOpenChange(false)}
                                            disabled={loading}
                                            className="px-6"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            disabled={loading}
                                            className="px-6"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Update Invoice
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        );
    }

    // For create mode, render with trigger
    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children || (
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Invoice
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        {modalTitle}
                    </DialogTitle>
                    <DialogDescription>
                        {modalDescription}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-8rem)] px-6">
                    <div className="space-y-6 pb-6">
                        {/* AI Upload Section */}
                        {uploadLoading ? (
                            <div className="border rounded-lg p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="relative">
                                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                                        <Sparkles className="h-6 w-6 text-primary absolute -top-1 -right-1 animate-pulse" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="font-medium text-lg">Processing Invoice with AI</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Extracting invoice details... This may take a few seconds.
                                        </p>
                                        <div className="flex items-center justify-center space-x-1 pt-2">
                                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <h3 className="font-medium">AI Invoice Scanner</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Upload your invoice and let AI extract the details automatically
                                </p>
                                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                                    <input
                                        type="file"
                                        id="modal-invoice-upload"
                                        className="hidden"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        onChange={handleFileUpload}
                                        disabled={uploadLoading}
                                    />
                                    <label
                                        htmlFor="modal-invoice-upload"
                                        className="cursor-pointer"
                                    >
                                        <div className="flex flex-col items-center">
                                            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                            <p className="text-sm font-medium mb-1">
                                                Click to upload or drag and drop
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                PDF, PNG, JPG up to 10MB
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Manual Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Client Information */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                    <User className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-lg">Client Information</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="modal-clientName">
                                            <User className="h-4 w-4 inline mr-1" />
                                            Client Name *
                                        </Label>
                                        <Input
                                            id="modal-clientName"
                                            name="clientName"
                                            value={formData.clientName}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="modal-clientEmail">
                                            <Mail className="h-4 w-4 inline mr-1" />
                                            Client Email *
                                        </Label>
                                        <Input
                                            id="modal-clientEmail"
                                            name="clientEmail"
                                            type="email"
                                            value={formData.clientEmail}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="john@company.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Invoice Details */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-lg">Invoice Details</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="modal-invoiceNumber">
                                            <Hash className="h-4 w-4 inline mr-1" />
                                            Invoice Number *
                                        </Label>
                                        <Input
                                            id="modal-invoiceNumber"
                                            name="invoiceNumber"
                                            value={formData.invoiceNumber}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="INV-001"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="modal-dueDate">
                                            <Calendar className="h-4 w-4 inline mr-1" />
                                            Due Date *
                                        </Label>
                                        <Input
                                            id="modal-dueDate"
                                            name="dueDate"
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={handleInputChange}
                                            required
                                            min={format(new Date(), 'yyyy-MM-dd')}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="modal-amount">
                                            <DollarSign className="h-4 w-4 inline mr-1" />
                                            Amount *
                                        </Label>
                                        <Input
                                            id="modal-amount"
                                            name="amount"
                                            type="number"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="10000.00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="modal-currency">Currency</Label>
                                        <select
                                            id="modal-currency"
                                            name="currency"
                                            value={formData.currency}
                                            onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                                            className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm"
                                        >
                                            <option value="INR">₹ INR</option>
                                            <option value="USD">$ USD</option>
                                            <option value="EUR">€ EUR</option>
                                            <option value="GBP">£ GBP</option>
                                            <option value="CAD">$ CAD</option>
                                            <option value="AUD">$ AUD</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="modal-description">
                                        <FileText className="h-4 w-4 inline mr-1" />
                                        Description (Optional)
                                    </Label>
                                    <Textarea
                                        id="modal-description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Web development services for Project X..."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                    <Smartphone className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-lg">Payment Method</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    {/* UPI + Razorpay Option */}
                                    <div className="p-4 border-2 border-green-200 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                        <div className="flex items-start space-x-3">
                                            <input
                                                type="radio"
                                                id="upi-razorpay-create"
                                                name="paymentMethod"
                                                value="razorpay"
                                                checked={formData.paymentProvider === 'razorpay'}
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    paymentProvider: e.target.value 
                                                }))}
                                                className="w-4 h-4 text-green-600 mt-1"
                                            />
                                            <div className="flex-1">
                                                <Label htmlFor="upi-razorpay-create" className="flex items-center gap-2 cursor-pointer">
                                                    <div className="flex items-center gap-2">
                                                        <QrCode className="h-4 w-4 text-green-600" />
                                                        <span className="font-semibold text-green-800">UPI + Cards via Razorpay</span>
                                                        <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-medium">
                                                            Recommended
                                                        </span>
                                                    </div>
                                                </Label>
                                                <div className="mt-2 space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-green-700">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <span>Instant UPI payments (PhonePe, GPay, Paytm)</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-green-700">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <span>Auto-detection when client pays</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-green-700">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <span>QR code + UPI link in emails</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-green-700">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <span>Cards & net banking backup</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Manual Payment Option */}
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-start space-x-3">
                                            <input
                                                type="radio"
                                                id="manual-payment-create"
                                                name="paymentMethod"
                                                value=""
                                                checked={formData.paymentProvider === ''}
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    paymentProvider: e.target.value 
                                                }))}
                                                className="w-4 h-4 text-primary mt-1"
                                            />
                                            <div className="flex-1">
                                                <Label htmlFor="manual-payment-create" className="flex items-center gap-2 cursor-pointer">
                                                    <Link className="h-4 w-4" />
                                                    <span className="font-medium">Manual Payment Link</span>
                                                </Label>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Add your own UPI ID, bank details, or payment link. 
                                                    You&apos;ll need to manually confirm payments.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Manual Payment Link Field */}
                                {formData.paymentProvider === '' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="modal-paymentLink-create">
                                            <Link className="h-4 w-4 inline mr-1" />
                                            Payment Link or UPI ID
                                        </Label>
                                        <Input
                                            id="modal-paymentLink-create"
                                            name="paymentLink"
                                            type="text"
                                            value={formData.paymentLink}
                                            onChange={handleInputChange}
                                            placeholder="yourname@paytm OR https://paypal.me/yourname"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Enter your UPI ID (like yourname@paytm) or payment link
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-6 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleOpenChange(false)}
                                    disabled={loading}
                                    className="px-6"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={loading}
                                    className="px-6"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Create Invoice
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}