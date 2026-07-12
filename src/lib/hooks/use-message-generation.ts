import { useState } from 'react';
import { MessageTemplate, MessageTone, replaceTemplateVariables } from '@/lib/message-templates';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

// The AI routes require a Supabase Bearer token; resolve it per call.
async function getAuthHeaders(): Promise<Record<string, string>> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('You need to be signed in to use AI messages');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

interface InvoiceData {
    clientName: string;
    clientEmail: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    dueDate: string;
    paymentLink?: string;
    description?: string;
}

interface UserData {
    userName: string;
    businessName?: string;
}

interface GeneratedMessage {
    subject: string;
    content: string;
    scheduledDate: Date;
    template: MessageTemplate;
}

export function useMessageGeneration() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateMessagesFromTemplates = (
        templates: MessageTemplate[],
        invoiceData: InvoiceData,
        userData: UserData
    ): GeneratedMessage[] => {
        const dueDate = new Date(invoiceData.dueDate);

        return templates.map(template => {
            // Calculate scheduled date
            const scheduledDate = new Date(dueDate);
            scheduledDate.setDate(scheduledDate.getDate() + template.dayOffset);

            // Calculate days overdue for the template
            const daysOverdue = template.dayOffset;

            // Prepare variables
            const variables: Record<string, string> = {
                clientName: invoiceData.clientName,
                invoiceNumber: invoiceData.invoiceNumber,
                amount: `${invoiceData.currency === 'USD' ? '$' : invoiceData.currency} ${invoiceData.amount.toFixed(2)}`,
                dueDate: format(dueDate, 'MMMM d, yyyy'),
                daysOverdue: daysOverdue.toString(),
                paymentLink: invoiceData.paymentLink || '',
                userName: userData.userName,
                businessName: userData.businessName || '',
            };

            // Replace variables in template
            const subject = replaceTemplateVariables(template.subject, variables);
            const content = replaceTemplateVariables(template.template, variables);

            return {
                subject,
                content,
                scheduledDate,
                template
            };
        });
    };

    const enhanceMessageWithAI = async (
        message: GeneratedMessage,
        tone: MessageTone,
        invoiceData: InvoiceData,
        customInstructions?: string
    ): Promise<GeneratedMessage> => {
        setLoading(true);
        setError(null);

        try {
            const prompt = `
        You are helping a freelancer write a payment reminder email. 
        
        Original message:
        Subject: ${message.subject}
        Content: ${message.content}
        
        Invoice context:
        - Client: ${invoiceData.clientName}
        - Amount: ${invoiceData.currency} ${invoiceData.amount}
        - Due date: ${invoiceData.dueDate}
        - Description: ${invoiceData.description || 'N/A'}
        
        Task: Rewrite this message with the following requirements:
        1. Tone: ${tone} (${getToneDescription(tone)})
        2. Keep it concise but effective
        3. Maintain professionalism
        4. Include all key information (invoice number, amount, due date)
        ${customInstructions ? `5. Additional instructions: ${customInstructions}` : ''}
        
        Return the response in this exact JSON format:
        {
          "subject": "enhanced subject line",
          "content": "enhanced email content"
        }
        
        Make the message feel natural and human, not like a template.
      `;

            const response = await fetch('/api/enhance-message', {
                method: 'POST',
                headers: await getAuthHeaders(),
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) throw new Error('Failed to enhance message');

            const data = await response.json();

            return {
                ...message,
                subject: data.subject,
                content: data.content
            };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to enhance message');
            return message; // Return original if enhancement fails
        } finally {
            setLoading(false);
        }
    };

    const generateCustomMessage = async (
        invoiceData: InvoiceData,
        userData: UserData,
        tone: MessageTone,
        context: string
    ): Promise<GeneratedMessage | null> => {
        setLoading(true);
        setError(null);

        try {
            const prompt = `
        Generate a payment reminder email for a freelancer.
        
        Context: ${context}
        
        Invoice details:
        - Client: ${invoiceData.clientName}
        - Invoice: ${invoiceData.invoiceNumber}
        - Amount: ${invoiceData.currency} ${invoiceData.amount}
        - Due date: ${invoiceData.dueDate}
        - Description: ${invoiceData.description || 'N/A'}
        ${invoiceData.paymentLink ? `- Payment link: Available` : ''}
        
        Sender details:
        - Name: ${userData.userName}
        ${userData.businessName ? `- Business: ${userData.businessName}` : ''}
        
        Requirements:
        1. Tone: ${tone} (${getToneDescription(tone)})
        2. Be concise and effective
        3. Include all invoice details naturally
        4. Sound human and personalized
        
        Return in this exact JSON format:
        {
          "subject": "email subject",
          "content": "email body content"
        }
      `;

            const response = await fetch('/api/generate-message', {
                method: 'POST',
                headers: await getAuthHeaders(),
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) throw new Error('Failed to generate message');

            const data = await response.json();

            return {
                subject: data.subject,
                content: data.content,
                scheduledDate: new Date(),
                template: {
                    id: 'custom',
                    type: 'reminder',
                    tone,
                    dayOffset: 0,
                    subject: data.subject,
                    template: data.content,
                    variables: []
                }
            };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate message');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        generateMessagesFromTemplates,
        enhanceMessageWithAI,
        generateCustomMessage,
        loading,
        error
    };
}

// Helper function to describe tone
function getToneDescription(tone: MessageTone): string {
    const descriptions: Record<MessageTone, string> = {
        friendly: 'warm, casual, and understanding',
        professional: 'formal, courteous, and business-like',
        firm: 'direct, serious, and assertive without being rude',
        urgent: 'emphasizing immediate action needed',
        final: 'last warning before escalation, very serious'
    };
    return descriptions[tone];
}