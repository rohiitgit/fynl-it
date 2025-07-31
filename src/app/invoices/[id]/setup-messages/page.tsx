// src/app/invoices/[id]/setup-messages/page.tsx - Enhanced with edit support
"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  Settings,
  Eye,
  Edit,
  Send,
  CheckCircle,
  Sparkles,
  Loader2,
  AlertCircle,
  MessageCircle,
  Timer,
  Target,
  RefreshCw,
  Trash2,
  Save,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/lib/hooks/use-toast";
import { Tables } from "@/types/supabase";
import {
  DEFAULT_TEMPLATES,
  getTemplatesForTimeline,
  replaceTemplateVariables,
  MessageTone,
} from "@/lib/message-templates";
import { useMessageGeneration } from "@/lib/hooks/use-message-generation";
import { format, addDays } from "date-fns";

type Invoice = Tables<"invoices">;
type FollowUp = Tables<"follow_ups">;

interface GeneratedMessage {
  id: string;
  type: string;
  tone: MessageTone;
  dayOffset: number;
  subject: string;
  content: string;
  scheduledDate: Date;
  enabled: boolean;
  existingFollowUpId?: string; // For tracking existing follow-ups
  isModified?: boolean; // Track if message was changed
}

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
}

const getToneColor = (tone: MessageTone): string => {
  const colors: Record<MessageTone, string> = {
    friendly: "bg-green-100 text-green-800 border-green-200",
    professional: "bg-blue-100 text-blue-800 border-blue-200",
    firm: "bg-orange-100 text-orange-800 border-orange-200",
    urgent: "bg-red-100 text-red-800 border-red-200",
    final: "bg-purple-100 text-purple-800 border-purple-200",
  };
  return colors[tone];
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "initial":
      return <MessageCircle className="h-4 w-4" />;
    case "reminder":
      return <Timer className="h-4 w-4" />;
    case "follow_up":
      return <Target className="h-4 w-4" />;
    case "urgent":
      return <AlertCircle className="h-4 w-4" />;
    case "final":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Mail className="h-4 w-4" />;
  }
};

export default function SetupMessagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { id } = use(params);
  const { enhanceMessageWithAI, error: aiError } = useMessageGeneration();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<GeneratedMessage[]>([]);
  const [existingFollowUps, setExistingFollowUps] = useState<FollowUp[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingMessage, setEditingMessage] = useState<GeneratedMessage | null>(null);
  const [previewMessage, setPreviewMessage] = useState<GeneratedMessage | null>(null);
  const [enhancingId, setEnhancingId] = useState<string | null>(null);

  // Load invoice, user data, and existing follow-ups
  const loadData = useCallback(async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      // Load invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (invoiceError || !invoiceData) {
        toast({
          title: "Error",
          description: "Invoice not found",
        });
        router.push("/dashboard");
        return;
      }

      // Load user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name, business_name")
        .eq("user_id", user.id)
        .single();

      // Check for existing follow-ups
      const { data: existingData, error: existingError } = await supabase
        .from("follow_ups")
        .select("*")
        .eq("invoice_id", id)
        .eq("user_id", user.id)
        .order("scheduled_for", { ascending: true });

      if (existingError) {
        console.error("Error loading existing follow-ups:", existingError);
      }

      setInvoice(invoiceData);
      setUserProfile(profileData);
      setExistingFollowUps(existingData || []);

      // Determine if we're in edit mode (has existing follow-ups)
      const hasExisting = (existingData || []).length > 0;
      setIsEditMode(hasExisting);

      // Generate messages based on mode
      if (hasExisting) {
        generateMessagesFromExisting(invoiceData, profileData, existingData || []);
      } else {
        generateInitialMessages(invoiceData, profileData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load invoice data",
      });
    } finally {
      setLoading(false);
    }
  }, [id, router, toast]);

  // Generate messages from existing follow-ups (edit mode)
  const generateMessagesFromExisting = (
    invoiceData: Invoice,
    profileData: UserProfile | null,
    existingData: FollowUp[]
  ) => {
    const dueDate = new Date(invoiceData.due_date);

    const existingMessages: GeneratedMessage[] = existingData.map((followUp, index) => {
      const scheduledDate = new Date(followUp.scheduled_for);
      const diffTime = scheduledDate.getTime() - dueDate.getTime();
      const dayOffset = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Try to match with default templates to get type and tone
      const matchingTemplate = DEFAULT_TEMPLATES.find(
        (template) => template.dayOffset === dayOffset
      ) || DEFAULT_TEMPLATES[0];

      return {
        id: `existing-${index}`,
        type: followUp.email_type,
        tone: (matchingTemplate.tone || 'professional') as MessageTone,
        dayOffset,
        subject: followUp.subject,
        content: followUp.content,
        scheduledDate,
        enabled: followUp.status === 'scheduled',
        existingFollowUpId: followUp.id,
        isModified: false,
      };
    });

    setMessages(existingMessages);
  };

  // Generate initial messages from templates (create mode)
  const generateInitialMessages = (
    invoiceData: Invoice,
    profileData: UserProfile | null,
  ) => {
    const templates = getTemplatesForTimeline();
    const dueDate = new Date(invoiceData.due_date);

    const userName =
      profileData?.first_name && profileData?.last_name
        ? `${profileData.first_name} ${profileData.last_name}`
        : "Your Name";

    const variables = {
      clientName: invoiceData.client_name,
      invoiceNumber: invoiceData.invoice_number,
      amount: `${invoiceData.currency === "USD" ? "$" : invoiceData.currency} ${invoiceData.amount.toFixed(2)}`,
      dueDate: format(dueDate, "MMMM d, yyyy"),
      paymentLink: invoiceData.payment_link || "",
      userName: userName,
      businessName: profileData?.business_name || "",
    };

    const generatedMessages: GeneratedMessage[] = templates.map(
      (template, index) => {
        const scheduledDate = addDays(dueDate, template.dayOffset);

        // Calculate days overdue for this message
        const daysOverdue = Math.max(0, template.dayOffset);
        const messageVariables = {
          ...variables,
          daysOverdue: daysOverdue.toString(),
        };

        return {
          id: `msg-${index}`,
          type: template.type,
          tone: template.tone,
          dayOffset: template.dayOffset,
          subject: replaceTemplateVariables(template.subject, messageVariables),
          content: replaceTemplateVariables(
            template.template,
            messageVariables,
          ),
          scheduledDate,
          enabled: true,
          isModified: false,
        };
      },
    );

    setMessages(generatedMessages);
  };

  // Reset to default templates
  const handleResetToDefaults = () => {
    if (invoice && userProfile) {
      generateInitialMessages(invoice, userProfile);
      toast({
        title: "Reset to defaults",
        description: "Messages have been reset to default templates",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEditMessage = (message: GeneratedMessage) => {
    setEditingMessage({ ...message, isModified: true });
  };

  const handleSaveEdit = () => {
    if (!editingMessage) return;

    setMessages((prev) =>
      prev.map((msg) => 
        msg.id === editingMessage.id 
          ? { ...editingMessage, isModified: true }
          : msg
      ),
    );
    setEditingMessage(null);

    toast({
      title: "Message updated",
      description: "Your changes have been saved",
    });
  };

  const handleEnhanceWithAI = async (message: GeneratedMessage) => {
    if (!invoice || !userProfile) return;

    setEnhancingId(message.id);
    try {
      const enhanced = await enhanceMessageWithAI(
        {
          subject: message.subject,
          content: message.content,
          scheduledDate: message.scheduledDate,
          template: DEFAULT_TEMPLATES.find((t) => t.type === message.type)!,
        },
        message.tone,
        {
          clientName: invoice.client_name,
          clientEmail: invoice.client_email,
          invoiceNumber: invoice.invoice_number,
          amount: invoice.amount,
          currency: invoice.currency,
          dueDate: invoice.due_date,
          paymentLink: invoice.payment_link || undefined,
          description: invoice.description || undefined,
        },
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id
            ? { 
                ...msg, 
                subject: enhanced.subject, 
                content: enhanced.content,
                isModified: true 
              }
            : msg,
        ),
      );

      toast({
        title: "Message enhanced!",
        description: "AI has improved your message",
      });
    } catch (err) {
      console.error("Enhancement failed:", err);
      toast({
        title: "Enhancement failed",
        description: "Could not enhance message with AI",
      });
    } finally {
      setEnhancingId(null);
    }
  };

  const toggleMessageEnabled = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId 
          ? { ...msg, enabled: !msg.enabled, isModified: true }
          : msg,
      ),
    );
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    toast({
      title: "Message deleted",
      description: "The message has been removed from the sequence",
    });
  };

  const handleActivateSequence = async () => {
    if (!invoice) return;

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const enabledMessages = messages.filter((msg) => msg.enabled);

      if (isEditMode) {
        // Update existing follow-ups
        for (const message of enabledMessages) {
          if (message.existingFollowUpId) {
            // Update existing follow-up
            const { error } = await supabase
              .from("follow_ups")
              .update({
                subject: message.subject,
                content: message.content,
                scheduled_for: message.scheduledDate.toISOString(),
                email_type: message.type,
                status: message.enabled ? 'scheduled' : 'cancelled',
              })
              .eq("id", message.existingFollowUpId);

            if (error) throw error;
          } else {
            // Create new follow-up (for added messages)
            const { error } = await supabase
              .from("follow_ups")
              .insert({
                invoice_id: invoice.id,
                user_id: user.id,
                email_type: message.type,
                subject: message.subject,
                content: message.content,
                scheduled_for: message.scheduledDate.toISOString(),
                status: "scheduled",
              });

            if (error) throw error;
          }
        }

        // Handle deleted messages (existing follow-ups not in current messages)
        const currentExistingIds = enabledMessages
          .map(msg => msg.existingFollowUpId)
          .filter(Boolean);
        
        const deletedFollowUpIds = existingFollowUps
          .filter(fu => !currentExistingIds.includes(fu.id))
          .map(fu => fu.id);

        if (deletedFollowUpIds.length > 0) {
          const { error } = await supabase
            .from("follow_ups")
            .update({ status: 'cancelled' })
            .in("id", deletedFollowUpIds);

          if (error) throw error;
        }

        toast({
          title: "Follow-up sequence updated!",
          description: `${enabledMessages.length} messages updated`,
        });
      } else {
        // Create new follow-ups
        const followUps = enabledMessages.map((msg) => ({
          invoice_id: invoice.id,
          user_id: user.id,
          email_type: msg.type,
          subject: msg.subject,
          content: msg.content,
          scheduled_for: msg.scheduledDate.toISOString(),
          status: "scheduled",
        }));

        const { error } = await supabase.from("follow_ups").insert(followUps);

        if (error) throw error;

        toast({
          title: "Follow-up sequence activated!",
          description: `${enabledMessages.length} messages scheduled`,
        });
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving follow-ups:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'activate'} follow-up sequence`,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Loading invoice details</h3>
            <p className="text-muted-foreground">
              Preparing your message setup...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Invoice Not Found
                </h3>
                <p className="text-muted-foreground text-sm">
                  The invoice you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
                </p>
              </div>
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const enabledCount = messages.filter((m) => m.enabled).length;
  const modifiedCount = messages.filter((m) => m.isModified).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="hover:bg-accent/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="text-sm font-medium text-muted-foreground">
              {isEditMode ? 'Edit Messages' : 'Setup Messages'} • Invoice {invoice.invoice_number}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Invoice Summary */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-card to-card/50">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {isEditMode ? 'Edit Follow-up Messages' : 'Setup Follow-up Messages'}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {isEditMode ? 'Modify automated reminders for' : 'Configure automated reminders for'}{" "}
                      <span className="font-medium">{invoice.client_name}</span>
                    </CardDescription>
                  </div>
                </div>
                {isEditMode && (
                  <div className="ml-13 mt-2">
                    <Badge variant="secondary" className="gap-1">
                      <Edit className="h-3 w-3" />
                      Editing existing sequence
                    </Badge>
                  </div>
                )}
              </div>
              <Badge
                variant="outline"
                className="text-lg px-4 py-2 font-semibold"
              >
                {invoice.currency} {invoice.amount.toFixed(2)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Client
                </div>
                <div className="font-semibold">{invoice.client_name}</div>
                <div className="text-sm text-muted-foreground">
                  {invoice.client_email}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Due Date
                </div>
                <div className="font-semibold">
                  {format(new Date(invoice.due_date), "MMMM d, yyyy")}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(invoice.due_date), "EEEE")}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Invoice Number
                </div>
                <div className="font-semibold">{invoice.invoice_number}</div>
                <div className="text-sm text-muted-foreground">
                  {invoice.description ? "With description" : "Basic invoice"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Payment Link
                </div>
                <div className="font-semibold">
                  {invoice.payment_link ? "Included" : "Not provided"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {invoice.payment_link
                    ? "Auto-included in messages"
                    : "Manual payment"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Message Timeline */}
          <div className="xl:col-span-3">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Timer className="h-5 w-5 text-primary" />
                      Follow-up Timeline
                    </CardTitle>
                    <CardDescription>
                      {enabledCount} of {messages.length} messages enabled
                      {modifiedCount > 0 && ` • ${modifiedCount} modified`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-1">
                      {enabledCount} Active
                    </Badge>
                    {isEditMode && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetToDefaults}
                        className="gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Reset to Defaults
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <div key={message.id} className="relative">
                      {/* Timeline connector */}
                      {index < messages.length - 1 && (
                        <div className="absolute left-8 top-20 w-0.5 h-12 bg-gradient-to-b from-border to-transparent" />
                      )}

                      <div
                        className={`group relative rounded-xl border transition-all duration-300 ${
                          message.enabled
                            ? "bg-card hover:shadow-md border-border/50"
                            : "bg-muted/30 border-muted hover:bg-muted/50"
                        } ${
                          message.isModified 
                            ? "ring-2 ring-blue-200 dark:ring-blue-800" 
                            : ""
                        }`}
                      >
                        {message.isModified && (
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}

                        <div className="p-6">
                          <div className="flex items-start gap-4">
                            {/* Timeline indicator */}
                            <div
                              className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all ${
                                message.enabled
                                  ? "bg-primary border-primary text-primary-foreground shadow-lg"
                                  : "bg-muted border-muted-foreground/30 text-muted-foreground"
                              }`}
                            >
                              {message.dayOffset === 0 ? (
                                <Calendar className="h-6 w-6" />
                              ) : (
                                getTypeIcon(message.type)
                              )}
                            </div>

                            {/* Message content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-lg capitalize">
                                      {message.type.replace("_", " ")}
                                    </h3>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${getToneColor(message.tone)}`}
                                    >
                                      {message.tone}
                                    </Badge>
                                    {message.existingFollowUpId && (
                                      <Badge variant="secondary" className="text-xs">
                                        Existing
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3" />
                                      {message.dayOffset === 0
                                        ? "Sent on due date"
                                        : `Sent ${message.dayOffset} days after due date`}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-3 w-3" />
                                      {format(
                                        message.scheduledDate,
                                        "MMMM d, yyyy • EEEE",
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPreviewMessage(message)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditMessage(message)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEnhanceWithAI(message)}
                                    disabled={enhancingId === message.id}
                                    className="h-8 w-8 p-0"
                                  >
                                    {enhancingId === message.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Sparkles className="h-4 w-4" />
                                    )}
                                  </Button>
                                  {isEditMode && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteMessage(message.id)}
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant={
                                      message.enabled ? "default" : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                      toggleMessageEnabled(message.id)
                                    }
                                    className="h-8 w-8 p-0"
                                  >
                                    {message.enabled ? (
                                      <CheckCircle className="h-4 w-4" />
                                    ) : (
                                      <Settings className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {/* Message preview */}
                              <div className="space-y-3">
                                <div>
                                  <div className="text-sm font-medium text-muted-foreground mb-1">
                                    Subject
                                  </div>
                                  <div className="font-medium text-sm bg-muted/50 rounded-md px-3 py-2 border">
                                    &quot;{message.subject}&quot;
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-muted-foreground mb-1">
                                    Preview
                                  </div>
                                  <div className="text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2 border">
                                    {message.content.substring(0, 150)}
                                    {message.content.length > 150 && "..."}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Panel */}
          <div className="space-y-6">
            {/* Primary Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
                <CardDescription>
                  {isEditMode ? 'Update your follow-up sequence' : 'Manage your follow-up sequence'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full h-12 text-base font-medium"
                  onClick={handleActivateSequence}
                  disabled={saving || enabledCount === 0}
                  size="lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Activating...'}
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      {isEditMode ? 'Update Sequence' : 'Activate Sequence'}
                    </>
                  )}
                </Button>

                {enabledCount === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Enable at least one message to {isEditMode ? 'update' : 'activate'}
                  </p>
                )}

                {modifiedCount > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Edit className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          {modifiedCount} message(s) modified
                        </p>
                        <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                          Don&apos;t forget to save your changes
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule Summary */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Schedule Summary</CardTitle>
                <CardDescription>When messages will be sent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {messages.filter((m) => m.enabled).length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                        <Timer className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No messages enabled
                      </p>
                    </div>
                  ) : (
                    messages
                      .filter((m) => m.enabled)
                      .map((message, index) => (
                        <div
                          key={message.id}
                          className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-sm font-medium capitalize">
                                {message.type.replace("_", " ")}
                                {message.isModified && (
                                  <span className="text-xs text-blue-600 ml-2">•</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {message.tone}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {format(message.scheduledDate, "MMM d")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {message.dayOffset === 0
                                ? "Due date"
                                : `+${message.dayOffset}d`}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p>
                    Use the <Sparkles className="h-3 w-3 inline mx-1" /> AI
                    enhance button to improve message tone
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p>
                    Preview messages before {isEditMode ? 'updating' : 'activating'} to ensure they sound
                    right
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p>
                    Disable unnecessary messages to avoid over-communication
                  </p>
                </div>
                {isEditMode && (
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <p>
                      Use &quot;Reset to Defaults&quot; to start fresh with template messages
                    </p>
                  </div>
                )}
                {aiError && (
                  <div className="flex gap-2 mt-4 p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-red-800 dark:text-red-200 text-xs">
                      AI Enhancement Error: {aiError}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Message Dialog */}
      {editingMessage && (
        <Dialog
          open={!!editingMessage}
          onOpenChange={() => setEditingMessage(null)}
        >
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" />
                Edit Message
              </DialogTitle>
              <DialogDescription>
                Customize this {editingMessage.type.replace("_", " ")} message
                for {invoice.client_name}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6 py-4">
                {/* Message Info */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${getToneColor(editingMessage.tone)}`}
                  >
                    {getTypeIcon(editingMessage.type)}
                  </div>
                  <div>
                    <div className="font-medium capitalize">
                      {editingMessage.type.replace("_", " ")} •{" "}
                      {editingMessage.tone}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Scheduled for{" "}
                      {format(editingMessage.scheduledDate, "MMMM d, yyyy")}
                    </div>
                  </div>
                </div>

                {/* Subject Line */}
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-subject"
                    className="text-base font-medium"
                  >
                    Subject Line
                  </Label>
                  <Input
                    id="edit-subject"
                    value={editingMessage.subject}
                    onChange={(e) =>
                      setEditingMessage((prev) =>
                        prev ? { ...prev, subject: e.target.value } : null,
                      )
                    }
                    className="text-base"
                    placeholder="Enter email subject..."
                  />
                  <p className="text-sm text-muted-foreground">
                    Keep it clear and professional. This appears in the
                    recipient&apos;s inbox.
                  </p>
                </div>

                {/* Message Content */}
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-content"
                    className="text-base font-medium"
                  >
                    Message Content
                  </Label>
                  <Textarea
                    id="edit-content"
                    value={editingMessage.content}
                    onChange={(e) =>
                      setEditingMessage((prev) =>
                        prev ? { ...prev, content: e.target.value } : null,
                      )
                    }
                    rows={12}
                    className="text-base leading-relaxed"
                    placeholder="Enter your message content..."
                  />
                  <p className="text-sm text-muted-foreground">
                    Write as if you&apos;re speaking directly to{" "}
                    {invoice.client_name}. Be professional but human.
                  </p>
                </div>

                {/* Variables Helper */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Available Variables
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-800 dark:text-blue-200">
                    <div>
                      <code>{`{clientName}`}</code> → {invoice.client_name}
                    </div>
                    <div>
                      <code>{`{amount}`}</code> → {invoice.currency}{" "}
                      {invoice.amount.toFixed(2)}
                    </div>
                    <div>
                      <code>{`{invoiceNumber}`}</code> →{" "}
                      {invoice.invoice_number}
                    </div>
                    <div>
                      <code>{`{dueDate}`}</code> →{" "}
                      {format(new Date(invoice.due_date), "MMMM d, yyyy")}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setEditingMessage(null)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="px-6">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Preview Message Dialog */}
      {previewMessage && (
        <Dialog
          open={!!previewMessage}
          onOpenChange={() => setPreviewMessage(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Message Preview
              </DialogTitle>
              <DialogDescription>
                {previewMessage.type.replace("_", " ")} • Scheduled for{" "}
                {format(previewMessage.scheduledDate, "MMMM d, yyyy")}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 py-4">
                {/* Email Header Mockup */}
                <div className="border rounded-lg overflow-hidden bg-card">
                  <div className="bg-muted/50 px-4 py-3 border-b text-sm">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">From:</span>
                        <span>
                          {userProfile?.first_name && userProfile?.last_name
                            ? `${userProfile.first_name} ${userProfile.last_name}`
                            : "Your Name"}{" "}
                          &lt;your-email@domain.com&gt;
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">To:</span>
                        <span>
                          {invoice.client_name} &lt;{invoice.client_email}&gt;
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Date:</span>
                        <span>
                          {format(
                            previewMessage.scheduledDate,
                            "MMMM d, yyyy • h:mm a",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="px-4 py-3 border-b bg-primary/5">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Subject
                    </div>
                    <div className="text-lg font-semibold">
                      {previewMessage.subject}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="px-4 py-6">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-base leading-relaxed">
                        {previewMessage.content}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${getToneColor(previewMessage.tone)}`}
                        >
                          {getTypeIcon(previewMessage.type)}
                        </div>
                        <div className="font-medium capitalize">
                          {previewMessage.type.replace("_", " ")}
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {previewMessage.tone} tone
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="font-medium">
                          {format(previewMessage.scheduledDate, "MMM d, yyyy")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {previewMessage.dayOffset === 0
                            ? "Due date"
                            : `${previewMessage.dayOffset} days overdue`}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="font-medium">
                          {previewMessage.enabled ? "Enabled" : "Disabled"}
                          {previewMessage.isModified && (
                            <span className="text-blue-600 ml-1">•</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {previewMessage.enabled ? "Will be sent" : "Skipped"}
                          {previewMessage.isModified && " • Modified"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleEditMessage(previewMessage)}
                className="px-6"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Message
              </Button>
              <Button
                variant="outline"
                onClick={() => setPreviewMessage(null)}
                className="px-6"
              >
                Close Preview
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}