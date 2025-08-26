"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  TestTube,
  Loader2,
  User
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";

export default function EmailSettings() {
  const [fromName, setFromName] = useState("Your Business Name");
  const [replyEmail, setReplyEmail] = useState("");
  const [signature, setSignature] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSaveSettings = async () => {
    if (!fromName || !replyEmail) {
      error("Missing Information", "Please fill in your business name and reply email");
      return;
    }

    // TODO: Save to your backend/database
    success("Settings Saved", "Your email preferences have been updated!");
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      error("Email Required", "Please enter an email address for testing");
      return;
    }

    setLoading(true);
    try {
      // TODO: Send test email via your backend API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      success("Test Email Sent", "Check your inbox - reminder preview sent!");
    } catch {
      error("Failed to Send", "Could not send test email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Personalization */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Email Personalization</CardTitle>
              <CardDescription className="text-base">
                Customize how your payment reminders appear to clients
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-name">Business/Your Name</Label>
              <Input
                id="from-name"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="e.g., Sarah&apos;s Design Studio"
              />
              <p className="text-sm text-muted-foreground">
                This appears as the sender name in emails
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reply-email">Reply Email</Label>
              <Input
                id="reply-email"
                type="email"
                value={replyEmail}
                onChange={(e) => setReplyEmail(e.target.value)}
                placeholder="sarah@designstudio.com"
              />
              <p className="text-sm text-muted-foreground">
                Where clients can reply to your reminders
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">Email Signature (Optional)</Label>
            <Textarea
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Best regards,&#10;Sarah Johnson&#10;Design Studio&#10;+1 (555) 123-4567"
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Added to the end of all reminder emails
            </p>
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            Save Email Settings
          </Button>
        </CardContent>
      </Card>

      {/* Test Email */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <CardTitle>Test Your Reminders</CardTitle>
          </div>
          <CardDescription>
            Send yourself a sample reminder to see how it looks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="test-email" className="sr-only">
                Your Email
              </Label>
              <Input
                id="test-email"
                type="email"
                placeholder="your-email@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleTestEmail}
              disabled={loading || !testEmail}
              size="default"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-green-600" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Test
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            You will receive a sample reminder email using your current settings
          </p>
        </CardContent>
      </Card>

      {/* Email Templates Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Your Email Templates</CardTitle>
          </div>
          <CardDescription>
            Professional templates that adapt to your tone settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Payment Reminders</h4>
              <p className="text-sm text-muted-foreground">
                Gentle → Professional → Firm progression that automatically adjusts based on how overdue the invoice is
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Thank You Messages</h4>
              <p className="text-sm text-muted-foreground">
                Automatically sent when you mark invoices as paid - builds client relationships
              </p>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Template Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Mobile-friendly design that looks great everywhere</li>
              <li>• Automatically includes client name, invoice details, and amount</li>
              <li>• Clear payment buttons and links</li>
              <li>• Professional but friendly tone</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}