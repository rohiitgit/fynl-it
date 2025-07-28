'use client'

import { useState } from "react";
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
    Sparkles
} from "lucide-react";
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
    onSuccess?: () => void;
}

export default function NewInvoiceModal({ onSuccess }: NewInvoiceModalProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [formData, setFormData] = useState<InvoiceFormData>({
        clientName: "",
        clientEmail: "",
        invoiceNumber: "",
        amount: "",
        currency: "USD",
        dueDate: "",
        paymentLink: "",
        description: "",
        paymentProvider: ""
    });

    const resetForm = () => {
        setFormData({
            clientName: "",
            clientEmail: "",
            invoiceNumber: "",
            amount: "",
            currency: "USD",
            dueDate: "",
            paymentLink: "",
            description: "",
            paymentProvider: "",

        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

        // Set loading state immediately when file is selected
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
                        currency: data.currency || "USD",
                        dueDate: data.dueDate || "",
                        paymentLink: data.paymentLink || "",
                        description: data.description || "",
                        paymentProvider: ""
                    });

                    toast({
                        title: "Invoice processed!",
                        description: "Please review and confirm the extracted details",
                    });

                    // Small delay to ensure smooth transition
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

            const { data: invoice, error } = await supabase
                .from('invoices')
                .insert({
                    user_id: user.id,
                    client_name: formData.clientName,
                    client_email: formData.clientEmail,
                    invoice_number: formData.invoiceNumber,
                    amount: parseFloat(formData.amount),
                    currency: formData.currency,
                    due_date: formData.dueDate,
                    payment_link: formData.paymentLink,
                    description: formData.description,
                    status: 'pending',
                    payment_provider: formData.paymentProvider || null
                })
                .select()
                .single();

            if (error) throw error;

            toast({
                title: "Invoice created!",
                description: "Now let's set up your follow-up messages",
            });

            resetForm();
            setOpen(false);

            if (onSuccess) {
                onSuccess();
            }

            router.push(`/invoices/${invoice.id}/setup-messages`);
        } catch (error) {
            console.error('Error creating invoice:', error);
            toast({
                title: "Error",
                description: "Failed to create invoice. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Invoice
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] p-0">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                        Upload an invoice or fill in the details manually
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-8rem)] px-6">
                    <div className="space-y-6 pb-6">
                        {/* Upload Section */}
                        {uploadLoading ? (
                            <div className="border rounded-lg p-8 bg-card">
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
                            <div className="border rounded-lg p-4 bg-card">
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
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Client Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="modal-clientName">
                                        <User className="h-4 w-4 inline mr-1" />
                                        Client Name
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
                                        Client Email
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

                            {/* Invoice Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="modal-invoiceNumber">
                                        <Hash className="h-4 w-4 inline mr-1" />
                                        Invoice Number
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
                                        Due Date
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

                            {/* Payment Information */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="modal-amount">
                                        <DollarSign className="h-4 w-4 inline mr-1" />
                                        Amount
                                    </Label>
                                    <Input
                                        id="modal-amount"
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="1000.00"
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
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                        <option value="INR">INR</option>
                                        <option value="CAD">CAD</option>
                                        <option value="AUD">AUD</option>
                                    </select>
                                </div>
                            </div>

                            {/* Payment Link */}
                            <div className="space-y-2">
                                <Label htmlFor="modal-paymentLink">
                                    <Link className="h-4 w-4 inline mr-1" />
                                    Payment Link (Optional)
                                </Label>
                                <Input
                                    id="modal-paymentLink"
                                    name="paymentLink"
                                    type="url"
                                    value={formData.paymentLink}
                                    onChange={handleInputChange}
                                    placeholder="https://paypal.me/yourname"
                                />
                            </div>
                            {/* Payment Provider Field - ADD THIS */}
<div className="space-y-2">
    <Label htmlFor="modal-paymentProvider">
        <Link className="h-4 w-4 inline mr-1" />
        Payment Provider (Optional)
    </Label>
    <select
        id="modal-paymentProvider"
        name="paymentProvider"
        value={formData.paymentProvider}
        onChange={(e) => setFormData(prev => ({ ...prev, paymentProvider: e.target.value }))}
        className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm"
    >
        <option value="">Select Provider</option>
        <option value="razorpay">Razorpay</option>
        <option value="stripe">Stripe</option>
        <option value="paypal">PayPal</option>
        <option value="upi">UPI</option>
        <option value="other">Other</option>
    </select>
    <p className="text-sm text-muted-foreground">
        Helps us auto-detect payments from this provider
    </p>
</div>

                            {/* Description */}
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

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Invoice'
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