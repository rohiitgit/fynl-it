import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';

// Design system colors (matching your Tailwind theme)
const colors = {
  primary: '#2563eb',      // blue-600
  background: '#ffffff',   // white
  foreground: '#0f172a',   // slate-900
  muted: '#f8fafc',       // slate-50
  mutedForeground: '#64748b', // slate-500
  border: '#e2e8f0',      // slate-200
  success: '#16a34a',     // green-600
  destructive: '#dc2626', // red-600
  warning: '#ea580c',     // orange-600
} as const;

// Email template props interface
export interface EmailTemplateProps {
  clientName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  daysOverdue?: number;
  paymentLink?: string;
  userName: string;
  businessName?: string;
  customMessage?: string;
}

// Base email layout component
const EmailLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <Html>
    <Head />
    <Body style={styles.main}>
      <Container style={styles.container}>
        {/* Header */}
        <Section style={styles.header}>
          <Text style={styles.headerText}>💌 Nudgr</Text>
        </Section>
        
        {children}
        
        {/* Footer */}
        <Hr style={styles.hr} />
        <Section style={styles.footer}>
          <Text style={styles.footerText}>
            This is an automated reminder sent by Nudgr on behalf of your service provider.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Invoice reminder email template
export const InvoiceReminderEmail: React.FC<EmailTemplateProps> = ({
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  daysOverdue = 0,
  paymentLink,
  userName,
  businessName,
  customMessage,
}) => (
  <EmailLayout>
    <Section style={styles.content}>
      <Text style={styles.greeting}>Hi {clientName},</Text>
      
      {customMessage ? (
        <Text style={styles.paragraph}>{customMessage}</Text>
      ) : (
        <>
          {daysOverdue === 0 ? (
            <Text style={styles.paragraph}>
              I hope this email finds you well! I wanted to send a quick reminder that 
              invoice <strong>{invoiceNumber}</strong> for <strong>{amount}</strong> is due today ({dueDate}).
            </Text>
          ) : (
            <Text style={styles.paragraph}>
              I&apos;m writing to follow up on invoice <strong>{invoiceNumber}</strong> for <strong>{amount}</strong>, 
              which was due on {dueDate} and is now <strong>{daysOverdue} days overdue</strong>.
            </Text>
          )}
        </>
      )}

      {/* Invoice Details Card */}
      <Section style={styles.invoiceCard}>
        <Text style={styles.invoiceCardTitle}>Invoice Details</Text>
        <Text style={styles.invoiceDetail}>
          <strong>Invoice:</strong> {invoiceNumber}
        </Text>
        <Text style={styles.invoiceDetail}>
          <strong>Amount:</strong> {amount}
        </Text>
        <Text style={styles.invoiceDetail}>
          <strong>Due Date:</strong> {dueDate}
        </Text>
        {daysOverdue > 0 && (
          <Text style={{...styles.invoiceDetail, color: colors.destructive}}>
            <strong>Days Overdue:</strong> {daysOverdue}
          </Text>
        )}
      </Section>

      {paymentLink && (
        <Section style={styles.buttonSection}>
          <Button style={styles.button} href={paymentLink}>
            Pay Invoice Now
          </Button>
        </Section>
      )}

      <Text style={styles.paragraph}>
        If you&apos;ve already sent the payment, please disregard this message. 
        Otherwise, I&apos;d appreciate if you could process it at your earliest convenience.
      </Text>

      <Text style={styles.signature}>
        Best regards,<br />
        {userName}
        {businessName && (
          <>
            <br />
            <em>{businessName}</em>
          </>
        )}
      </Text>
    </Section>
  </EmailLayout>
);

// Thank you email template
export const ThankYouEmail: React.FC<EmailTemplateProps> = ({
  clientName,
  invoiceNumber,
  amount,
  userName,
  businessName,
}) => (
  <EmailLayout>
    <Section style={styles.content}>
      <Text style={styles.greeting}>Hi {clientName},</Text>
      
      <Text style={styles.paragraph}>
        Great news! I&apos;ve received your payment of <strong>{amount}</strong> for 
        invoice <strong>{invoiceNumber}</strong>. Thank you so much!
      </Text>

      <Section style={styles.successCard}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successText}>Payment Confirmed</Text>
        <Text style={styles.invoiceDetail}>
          Invoice {invoiceNumber} - {amount}
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        I really appreciate your business and look forward to working with you again.
      </Text>

      <Text style={styles.paragraph}>
        If you need anything else, please don&apos;t hesitate to reach out.
      </Text>

      <Text style={styles.signature}>
        Best regards,<br />
        {userName}
        {businessName && (
          <>
            <br />
            <em>{businessName}</em>
          </>
        )}
      </Text>
    </Section>
  </EmailLayout>
);

// Styles object using design system colors
const styles = {
  main: {
    backgroundColor: colors.muted,
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  },
  container: {
    backgroundColor: colors.background,
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    maxWidth: '600px',
  },
  header: {
    padding: '20px 40px',
    backgroundColor: colors.foreground,
    borderRadius: '8px 8px 0 0',
  },
  headerText: {
    color: colors.background,
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0',
    textAlign: 'center' as const,
  },
  content: {
    padding: '40px',
  },
  greeting: {
    fontSize: '18px',
    lineHeight: '28px',
    marginBottom: '24px',
    color: colors.foreground,
  },
  paragraph: {
    fontSize: '16px',
    lineHeight: '26px',
    marginBottom: '16px',
    color: colors.mutedForeground,
  },
  invoiceCard: {
    backgroundColor: colors.muted,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    padding: '24px',
    margin: '24px 0',
  },
  invoiceCardTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: colors.foreground,
  },
  invoiceDetail: {
    fontSize: '14px',
    lineHeight: '20px',
    marginBottom: '8px',
    color: colors.mutedForeground,
  },
  successCard: {
    backgroundColor: '#f0fdf4', // green-50
    border: '1px solid #bbf7d0', // green-200
    borderRadius: '8px',
    padding: '24px',
    margin: '24px 0',
    textAlign: 'center' as const,
  },
  successIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  successText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: '8px',
  },
  buttonSection: {
    textAlign: 'center' as const,
    margin: '32px 0',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: '6px',
    color: colors.background,
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 24px',
  },
  signature: {
    fontSize: '16px',
    lineHeight: '24px',
    marginTop: '32px',
    color: colors.foreground,
  },
  footer: {
    padding: '20px 40px',
  },
  footerText: {
    fontSize: '12px',
    lineHeight: '16px',
    color: colors.mutedForeground,
    textAlign: 'center' as const,
  },
  hr: {
    borderColor: colors.border,
    margin: '20px 0',
  },
} as const;