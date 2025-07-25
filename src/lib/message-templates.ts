// Message template types and configurations
export type MessageTone = 'friendly' | 'professional' | 'firm' | 'urgent' | 'final';
export type MessageType = 'initial' | 'reminder' | 'follow_up' | 'urgent' | 'final' | 'thank_you';

export interface MessageTemplate {
    id: string;
    type: MessageType;
    tone: MessageTone;
    dayOffset: number; // Days after due date
    subject: string;
    template: string;
    variables: string[]; // Variables that can be replaced in the template
}

export interface TemplateVariable {
    key: string;
    description: string;
    example: string;
}

// Available variables for templates
export const TEMPLATE_VARIABLES: TemplateVariable[] = [
    { key: '{clientName}', description: 'Client\'s name', example: 'John Doe' },
    { key: '{invoiceNumber}', description: 'Invoice number', example: 'INV-001' },
    { key: '{amount}', description: 'Invoice amount', example: '$1,000' },
    { key: '{dueDate}', description: 'Due date', example: 'January 15, 2024' },
    { key: '{daysOverdue}', description: 'Days overdue', example: '5' },
    { key: '{paymentLink}', description: 'Payment link', example: 'https://pay.me/...' },
    { key: '{businessName}', description: 'Your business name', example: 'Acme Design Co.' },
    { key: '{userName}', description: 'Your name', example: 'Jane Smith' },
];

// Default message templates
export const DEFAULT_TEMPLATES: MessageTemplate[] = [
    // Initial friendly reminder (on due date)
    {
        id: 'initial-friendly',
        type: 'initial',
        tone: 'friendly',
        dayOffset: 0,
        subject: 'Invoice {invoiceNumber} Due Today - {clientName}',
        template: `Hi {clientName},

I hope this email finds you well! I wanted to send a quick reminder that invoice {invoiceNumber} for {amount} is due today ({dueDate}).

{paymentLink ? 'You can make the payment here: {paymentLink}' : 'Please let me know if you need the payment details.'}

If you've already sent the payment, please disregard this message. Otherwise, I'd appreciate if you could process it at your earliest convenience.

Thanks so much!
{userName}`,
        variables: ['clientName', 'invoiceNumber', 'amount', 'dueDate', 'paymentLink', 'userName']
    },

    // Professional reminder (3 days overdue)
    {
        id: 'reminder-professional',
        type: 'reminder',
        tone: 'professional',
        dayOffset: 3,
        subject: 'Overdue: Invoice {invoiceNumber} - Action Required',
        template: `Dear {clientName},

I'm writing to follow up on invoice {invoiceNumber} for {amount}, which was due on {dueDate} and is now {daysOverdue} days overdue.

We value our business relationship and would appreciate your prompt attention to this matter. 

{paymentLink ? 'Payment link: {paymentLink}' : 'Please contact me if you need the payment information.'}

If there are any issues or concerns regarding this invoice, please let me know so we can resolve them promptly.

Best regards,
{userName}
{businessName}`,
        variables: ['clientName', 'invoiceNumber', 'amount', 'dueDate', 'daysOverdue', 'paymentLink', 'userName', 'businessName']
    },

    // Firm follow-up (7 days overdue)
    {
        id: 'followup-firm',
        type: 'follow_up',
        tone: 'firm',
        dayOffset: 7,
        subject: 'Important: Invoice {invoiceNumber} is {daysOverdue} Days Overdue',
        template: `{clientName},

This is an important notice regarding invoice {invoiceNumber} for {amount}, which is now {daysOverdue} days overdue.

Original due date: {dueDate}
Amount outstanding: {amount}
{paymentLink ? 'Payment link: {paymentLink}' : ''}

Please treat this matter with urgency. Continued delays may result in:
- Late payment fees
- Suspension of services
- Impact on future collaborations

I need to receive payment within 48 hours to avoid further action.

{userName}
{businessName}`,
        variables: ['clientName', 'invoiceNumber', 'amount', 'dueDate', 'daysOverdue', 'paymentLink', 'userName', 'businessName']
    },

    // Urgent notice (14 days overdue)
    {
        id: 'urgent-notice',
        type: 'urgent',
        tone: 'urgent',
        dayOffset: 14,
        subject: 'URGENT: Final Notice Before Escalation - Invoice {invoiceNumber}',
        template: `{clientName},

Despite multiple reminders, invoice {invoiceNumber} for {amount} remains unpaid, now {daysOverdue} days past the due date of {dueDate}.

This is a FINAL NOTICE before I escalate this matter.

ACTION REQUIRED: Pay immediately to avoid:
- Collection agency involvement
- Legal proceedings
- Damage to business relationships

{paymentLink ? 'PAYMENT LINK: {paymentLink}' : 'Contact me IMMEDIATELY for payment details.'}

You have 24 hours to respond before I proceed with formal collection procedures.

{userName}
{businessName}`,
        variables: ['clientName', 'invoiceNumber', 'amount', 'dueDate', 'daysOverdue', 'paymentLink', 'userName', 'businessName']
    },

    // Final notice (21 days overdue)
    {
        id: 'final-notice',
        type: 'final',
        tone: 'final',
        dayOffset: 21,
        subject: 'Legal Action Pending - Invoice {invoiceNumber}',
        template: `CERTIFIED NOTICE

{clientName},

This letter serves as final notice that invoice {invoiceNumber} for {amount} is severely overdue by {daysOverdue} days.

As of {dueDate}, you have failed to respond to multiple payment requests. This matter will now be forwarded to our legal department for:

1. Formal collection proceedings
2. Reporting to credit agencies
3. Legal action to recover the debt plus costs

This action will commence in 48 hours unless FULL PAYMENT is received.

No further correspondence will be entered into.

{userName}
{businessName}

Invoice: {invoiceNumber}
Amount: {amount}
Original Due: {dueDate}`,
        variables: ['clientName', 'invoiceNumber', 'amount', 'dueDate', 'daysOverdue', 'userName', 'businessName']
    },

    // Thank you message (payment received)
    {
        id: 'thank-you',
        type: 'thank_you',
        tone: 'friendly',
        dayOffset: 0,
        subject: 'Thank You! Payment Received for Invoice {invoiceNumber}',
        template: `Hi {clientName},

Great news! I've received your payment of {amount} for invoice {invoiceNumber}. Thank you so much!

I really appreciate your business and look forward to working with you again.

If you need anything else, please don't hesitate to reach out.

Best regards,
{userName}
{businessName}`,
        variables: ['clientName', 'invoiceNumber', 'amount', 'userName', 'businessName']
    }
];

// Helper function to get template by type and tone
export function getTemplateByTypeAndTone(type: MessageType, tone: MessageTone): MessageTemplate | undefined {
    return DEFAULT_TEMPLATES.find(t => t.type === type && t.tone === tone);
}

// Helper function to get templates for a timeline
export function getTemplatesForTimeline(): MessageTemplate[] {
    return DEFAULT_TEMPLATES
        .filter(t => t.type !== 'thank_you')
        .sort((a, b) => a.dayOffset - b.dayOffset);
}

// Replace variables in template
export function replaceTemplateVariables(
    template: string,
    variables: Record<string, string | undefined>
): string {
    let result = template;

    // Handle conditional content (e.g., {paymentLink ? 'text' : 'alt text'})
    result = result.replace(/\{(\w+)\s*\?\s*'([^']+)'\s*:\s*'([^']*)'\}/g, (match, varName, truePart, falsePart) => {
        return variables[varName] ? truePart : falsePart;
    });

    // Replace simple variables
    Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        result = result.replace(regex, value || '');
    });

    return result;
}