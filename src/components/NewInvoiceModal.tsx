// src/components/NewInvoiceModal.tsx - Fixed race conditions + Enhanced Responsiveness
'use client'

import { useState, useEffect, useCallback, useRef } from "react";
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
    Save,
    Settings,
    ChevronDown,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/lib/hooks/use-toast";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

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

type SaveAction = 'save-only' | 'save-and-edit-followups';

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
    
    const [saving, setSaving] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [loadingInvoice, setLoadingInvoice] = useState(false);
    const [hasExistingFollowups, setHasExistingFollowups] = useState(false);
    
    // Use useRef to prevent unnecessary re-renders
    const loadedInvoiceId = useRef<string | null>(null);
    const isInitialLoad = useRef(true);
    
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
        ? 'Update your invoice details and optionally edit follow-up messages' 
        : 'Upload an invoice for AI processing or fill in the details manually';

    // Stable function to check existing follow-ups - doesn't depend on any state
    const checkExistingFollowups = useCallback(async (currentInvoiceId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            const { data: followUps, error } = await supabase
                .from('follow_ups')
                .select('id')
                .eq('invoice_id', currentInvoiceId)
                .eq('user_id', user.id)
                .limit(1);

            if (error) {
                console.error('Error checking follow-ups:', error);
                return false;
            }

            const hasFollowups = (followUps?.length || 0) > 0;
            setHasExistingFollowups(hasFollowups);
            return hasFollowups;
        } catch (error) {
            console.error('Error checking follow-ups:', error);
            return false;
        }
    }, []); // No dependencies - this function is stable

    // Load existing invoice data in edit mode - memoized to prevent unnecessary calls
    const loadInvoiceData = useCallback(async (currentInvoiceId: string) => {
        // Prevent loading the same invoice multiple times
        if (loadedInvoiceId.current === currentInvoiceId && !isInitialLoad.current) {
            return;
        }

        setLoadingInvoice(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { data: invoice, error } = await supabase
                .from('invoices')
                .select('*')
                .eq('id', currentInvoiceId)
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

                // Check for existing follow-ups
                await checkExistingFollowups(currentInvoiceId);
                
                // Mark as loaded
                loadedInvoiceId.current = currentInvoiceId;
                isInitialLoad.current = false;
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
    }, [toast, onClose, checkExistingFollowups]);

    // Effect to load invoice data when modal opens in edit mode
    useEffect(() => {
        if (isEditMode && invoiceId && open) {
            // Only load if we haven't loaded this invoice yet or if it's a different invoice
            if (loadedInvoiceId.current !== invoiceId) {
                loadInvoiceData(invoiceId);
            }
        }
        
        // Reset when modal closes
        if (!open && isEditMode) {
            loadedInvoiceId.current = null;
            isInitialLoad.current = true;
            setHasExistingFollowups(false);
        }
    }, [isEditMode, invoiceId, open, loadInvoiceData]);

    const resetForm = useCallback(() => {
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
        setHasExistingFollowups(false);
        loadedInvoiceId.current = null;
        isInitialLoad.current = true;
    }, []);

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

    const handleSaveAction = async (action: SaveAction) => {
        setSaving(true);

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

                if (action === 'save-only') {
                    toast({
                        title: "Invoice updated successfully!",
                        description: "Your changes have been saved",
                    });

                    if (onClose) onClose();
                    if (onSuccess) onSuccess();
                } else if (action === 'save-and-edit-followups') {
                    toast({
                        title: "Invoice updated!",
                        description: "Now let's review your follow-up messages",
                    });

                    if (onClose) onClose();
                    if (onSuccess) onSuccess();
                    
                    // Navigate to setup-messages page
                    router.push(`/invoices/${invoiceId}/setup-messages`);
                }

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
            setSaving(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // For create mode, always go to setup-messages
        // For edit mode, this shouldn't be called (we use the dropdown buttons instead)
        await handleSaveAction('save-and-edit-followups');
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (hasExternalControl) {
            if (!newOpen && onClose) {
                onClose();
            }
        } else {
            setInternalOpen(newOpen);
        }
        
        // Always reset form when closing, regardless of control mode
        if (!newOpen) {
            resetForm();
        }
    };

    // Create mode form content
    const createModeContent = (
        <>
            {/* AI Upload Section */}
            {uploadLoading ? (
                <div className="border rounded-lg p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
                        <div className="relative">
                            <Loader2 className="h-8 w-8 sm:h-10 lg:h-12 w-8 sm:w-10 lg:w-12 text-primary animate-spin" />
                            <Sparkles className="h-4 w-4 sm:h-5 lg:h-6 w-4 sm:w-5 lg:w-6 text-primary absolute -top-1 -right-1 animate-pulse" />
                        </div>
                        <div className="text-center space-y-1 sm:space-y-2">
                            <h3 className="font-medium text-base sm:text-lg">Processing Invoice with AI</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground px-2">
                                Extracting invoice details... This may take a few seconds.
                            </p>
                            <div className="flex items-center justify-center space-x-1 pt-2">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border rounded-lg p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h3 className="font-medium text-sm sm:text-base">AI Invoice Scanner</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                        Upload your invoice and let AI extract the details automatically
                    </p>
                    {/* Enhanced AI upload section */}
                    <div className="border-2 border-dashed border-primary/30 rounded-xl p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/50 transition-all duration-300">
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
                                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 sm:mb-4 border-2 border-primary/20">
                                    <Upload className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary" />
                                </div>
                                <p className="text-sm sm:text-base lg:text-lg font-semibold mb-1 sm:mb-2 text-primary text-center">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                                    PDF, PNG, JPG up to 10MB
                                </p>
                            </div>
                        </label>
                    </div>
                </div>
            )}
        </>
    );

    // Form fields component (shared between create and edit)
    const formFields = (
        <>
            {/* Client Information */}
            <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <h3 className="font-semibold text-base sm:text-lg">Client Information</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="modal-clientName" className="text-xs sm:text-sm">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                            Client Name *
                        </Label>
                        <Input
                            id="modal-clientName"
                            name="clientName"
                            value={formData.clientName}
                            onChange={handleInputChange}
                            required
                            placeholder="John Doe"
                            className="text-sm sm:text-base"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="modal-clientEmail" className="text-xs sm:text-sm">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
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
                            className="text-sm sm:text-base"
                        />
                    </div>
                </div>
            </div>

            {/* Invoice Details */}
            <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <h3 className="font-semibold text-base sm:text-lg">Invoice Details</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="modal-invoiceNumber" className="text-xs sm:text-sm">
                            <Hash className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                            Invoice Number *
                        </Label>
                        <Input
                            id="modal-invoiceNumber"
                            name="invoiceNumber"
                            value={formData.invoiceNumber}
                            onChange={handleInputChange}
                            required
                            placeholder="INV-001"
                            className="text-sm sm:text-base"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="modal-dueDate" className="text-xs sm:text-sm">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
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
                            className="text-sm sm:text-base"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="modal-amount" className="text-xs sm:text-sm">
                            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
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
                            className="text-sm sm:text-base"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="modal-currency" className="text-xs sm:text-sm">Currency</Label>
                        <select
                            id="modal-currency"
                            name="currency"
                            value={formData.currency}
                            onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                            className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-xs sm:text-sm"
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
                    <Label htmlFor="modal-description" className="text-xs sm:text-sm">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                        Description (Optional)
                    </Label>
                    <Textarea
                        id="modal-description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Web development services for Project X..."
                        rows={3}
                        className="text-sm sm:text-base"
                    />
                </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                    <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <h3 className="font-semibold text-base sm:text-lg">Payment Method</h3>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                    {/* UPI + Razorpay Option */}
                    <div className="p-3 sm:p-4 border-2 border-green-200 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <input
                                type="radio"
                                id={`upi-razorpay-${mode}`}
                                name="paymentMethod"
                                value="razorpay"
                                checked={formData.paymentProvider === 'razorpay'}
                                onChange={(e) => setFormData(prev => ({ 
                                    ...prev, 
                                    paymentProvider: e.target.value 
                                }))}
                                className="w-4 h-4 text-green-600 mt-1 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <Label htmlFor={`upi-razorpay-${mode}`} className="flex items-start sm:items-center gap-2 cursor-pointer">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                        <div className="flex items-center gap-2">
                                            <QrCode className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            <span className="font-semibold text-green-800 text-sm sm:text-base">UPI + Cards via Razorpay</span>
                                        </div>
                                        <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-medium w-fit">
                                            Recommended
                                        </span>
                                    </div>
                                </Label>
                                <div className="mt-2 space-y-1">
                                    <div className="flex items-start gap-2 text-xs sm:text-sm text-green-700">
                                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                                        <span>Instant UPI payments (PhonePe, GPay, Paytm)</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-xs sm:text-sm text-green-700">
                                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                                        <span>Auto-detection when client pays</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-xs sm:text-sm text-green-700">
                                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                                        <span>QR code + UPI link in emails</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-xs sm:text-sm text-green-700">
                                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                                        <span>Cards & net banking backup</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Manual Payment Option */}
                    <div className="p-3 sm:p-4 border rounded-lg">
                        <div className="flex items-start space-x-3">
                            <input
                                type="radio"
                                id={`manual-payment-${mode}`}
                                name="paymentMethod"
                                value=""
                                checked={formData.paymentProvider === ''}
                                onChange={(e) => setFormData(prev => ({ 
                                    ...prev, 
                                    paymentProvider: e.target.value 
                                }))}
                                className="w-4 h-4 text-primary mt-1 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <Label htmlFor={`manual-payment-${mode}`} className="flex items-center gap-2 cursor-pointer">
                                    <Link className="h-4 w-4 flex-shrink-0" />
                                    <span className="font-medium text-sm sm:text-base">Manual Payment Link</span>
                                </Label>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
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
                        <Label htmlFor={`modal-paymentLink-${mode}`} className="text-xs sm:text-sm">
                            <Link className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                            Payment Link or UPI ID
                        </Label>
                        <Input
                            id={`modal-paymentLink-${mode}`}
                            name="paymentLink"
                            type="text"
                            value={formData.paymentLink}
                            onChange={handleInputChange}
                            placeholder="yourname@paytm OR https://paypal.me/yourname"
                            className="text-sm sm:text-base"
                        />
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Enter your UPI ID (like yourname@paytm) or payment link
                        </p>
                    </div>
                )}
            </div>
        </>
    );

    // Edit mode action buttons with dropdown
    const editModeActions = (
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t">
            <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={saving}
                className="px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
            >
                Cancel
            </Button>

            {/* Save Options Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button disabled={saving} className="px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto order-1 sm:order-2">
                        {saving ? (
                            <>
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                                <span className="hidden sm:inline">Saving...</span>
                                <span className="sm:hidden">Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                <span className="hidden sm:inline">Save Changes</span>
                                <span className="sm:hidden">Save</span>
                                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                            </>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem
                        onClick={() => handleSaveAction('save-only')}
                        disabled={saving}
                        className="cursor-pointer"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        <div className="flex flex-col">
                            <span className="font-medium text-sm">Save Changes</span>
                            <span className="text-xs text-muted-foreground">Stay on dashboard</span>
                        </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem
                        onClick={() => handleSaveAction('save-and-edit-followups')}
                        disabled={saving}
                        className="cursor-pointer"
                    >
                        <Settings className="h-4 w-4 mr-2" />
                        <div className="flex flex-col">
                            <span className="font-medium text-sm">Save & Edit Follow-ups</span>
                            <span className="text-xs text-muted-foreground">
                                {hasExistingFollowups ? 'Modify existing messages' : 'Set up new messages'}
                            </span>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );

    // Create mode action buttons
    const createModeActions = (
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t">
            <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={saving}
                className="px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
            >
                Cancel
            </Button>
            <Button 
                type="submit" 
                disabled={saving}
                className="px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto order-1 sm:order-2"
            >
                {saving ? (
                    <>
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                        <span className="hidden sm:inline">Creating...</span>
                        <span className="sm:hidden">Creating...</span>
                    </>
                ) : (
                    <>
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        <span className="hidden sm:inline">Create Invoice</span>
                        <span className="sm:hidden">Create</span>
                    </>
                )}
            </Button>
        </div>
    );

    // For edit mode, render without trigger or with custom trigger
    if (isEditMode) {
        return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                {trigger && (
                    <DialogTrigger asChild>
                        {trigger}
                    </DialogTrigger>
                )}
                <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-0">
                    <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <Edit className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                            <span className="truncate">{modalTitle}</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            {modalDescription}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[calc(95vh-8rem)] sm:max-h-[calc(90vh-8rem)] px-4 sm:px-6">
                        <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6">
                            {/* Loading invoice data for edit mode */}
                            {loadingInvoice ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-center space-y-4">
                                        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary animate-spin mx-auto" />
                                        <p className="text-muted-foreground text-sm sm:text-base">Loading invoice data...</p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                    {/* Show follow-up status banner if applicable */}
                                    {hasExistingFollowups && (
                                        <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm sm:text-base">
                                                        Follow-up Messages Active
                                                    </h4>
                                                    <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 mt-1">
                                                        This invoice has automated follow-up messages set up. 
                                                        You can modify them after saving by choosing &quot;Save & Edit Follow-ups&quot;.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {formFields}
                                    {editModeActions}
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
                    <Button className="text-sm sm:text-base">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        <span className="hidden sm:inline">New Invoice</span>
                        <span className="sm:hidden">New</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-0">
                <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                    <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                        <span className="truncate">{modalTitle}</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                        {modalDescription}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(95vh-8rem)] sm:max-h-[calc(90vh-8rem)] px-4 sm:px-6">
                    <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6">
                        {/* AI Upload Section for create mode */}
                        {createModeContent}

                        {/* Manual Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                            {formFields}
                            {createModeActions}
                        </form>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}