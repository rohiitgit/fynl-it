// src/components/ManualEmailTrigger.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Send, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Clock 
} from "lucide-react";
import { useEmail } from "@/lib/hooks/use-email";
import { format } from "date-fns";

interface ManualEmailTriggerProps {
  followUpId: string;
  messageType: string;
  subject: string;
  scheduledDate: Date;
  clientEmail: string;
  isOverdue?: boolean;
}

export default function ManualEmailTrigger({
  followUpId,
  messageType,
  subject,
  scheduledDate,
  clientEmail,
  isOverdue = false,
}: ManualEmailTriggerProps) {
  const [open, setOpen] = useState(false);
  const { sendReminder, loading } = useEmail();

  const handleSendNow = async () => {
    const result = await sendReminder(followUpId);
    if (result.success) {
      setOpen(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'initial':
        return 'bg-blue-100 text-blue-800';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800';
      case 'follow_up':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'final':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Send Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Email Reminder</DialogTitle>
          <DialogDescription>
            This will immediately send the following email to your client
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Email Preview */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge className={getTypeColor(messageType)}>
                {messageType.charAt(0).toUpperCase() + messageType.slice(1)}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive">
                  <Clock className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">To:</p>
              <p className="font-medium">{clientEmail}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Subject:</p>
              <p className="font-medium">{subject}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Originally scheduled for:</p>
              <p className="text-sm">{format(scheduledDate, "PPP 'at' p")}</p>
            </div>
          </div>

          {/* Warning for early sends */}
          {!isOverdue && new Date() < scheduledDate && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This email is scheduled for {format(scheduledDate, "MMM d")}. 
                Sending early may affect the timing of your follow-up sequence.
              </AlertDescription>
            </Alert>
          )}

          {/* Success message for overdue */}
          {isOverdue && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                This reminder is overdue and ready to send immediately.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendNow}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}