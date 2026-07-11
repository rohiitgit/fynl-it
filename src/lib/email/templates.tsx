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
  Img,
} from '@react-email/components';

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
  upiGreen: '#00D09C',    // UPI brand color
  upiBackground: '#dcfce7', // green-100
  upiBorder: '#16a34a',   // green-600
} as const;

export interface EmailTemplateProps {
  clientName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  daysOverdue?: number;
  paymentLink?: string;
  upiLink?: string;
  qrCode?: string;
  userName: string;
  businessName?: string;
  customMessage?: string;
}

const EmailLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <Html>
    <Head />
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Text style={styles.headerText}>💌 Nudgr</Text>
        </Section>
        
        {children}
        
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

export const InvoiceReminderEmail: React.FC<EmailTemplateProps> = ({
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  daysOverdue = 0,
  paymentLink,
  upiLink,
  qrCode,
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
          ) : daysOverdue <= 3 ? (
            <Text style={styles.paragraph}>
              I&apos;m writing to follow up on invoice <strong>{invoiceNumber}</strong> for <strong>{amount}</strong>, 
              which was due on {dueDate} and is now <strong>{daysOverdue} days overdue</strong>.
            </Text>
          ) : daysOverdue <= 7 ? (
            <Text style={styles.paragraph}>
              This is an important notice regarding invoice <strong>{invoiceNumber}</strong> for <strong>{amount}</strong>, 
              which is now <strong>{daysOverdue} days overdue</strong> (due date: {dueDate}).
            </Text>
          ) : (
            <Text style={styles.paragraph}>
              <strong>URGENT:</strong> Invoice <strong>{invoiceNumber}</strong> for <strong>{amount}</strong> 
              is severely overdue by <strong>{daysOverdue} days</strong>. Original due date: {dueDate}.
            </Text>
          )}
        </>
      )}

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
          <Text style={{
            ...styles.invoiceDetail, 
            color: daysOverdue <= 3 ? colors.warning : colors.destructive,
            fontWeight: 'bold'
          }}>
            <strong>Days Overdue:</strong> {daysOverdue}
          </Text>
        )}
      </Section>

      {(upiLink || paymentLink) && (
        <Section style={styles.paymentSection}>
          <Text style={styles.paymentSectionTitle}>
            {daysOverdue <= 3 ? '💳 Quick Payment Options' : 
             daysOverdue <= 7 ? '⚡ Immediate Payment Required' :
             '🚨 URGENT: Pay Now to Avoid Escalation'}
          </Text>
          
          {(upiLink || paymentLink) && (
            <Section style={{
              ...styles.upiSection,
              backgroundColor: daysOverdue > 7 ? '#fef2f2' : styles.upiSection.backgroundColor,
              borderColor: daysOverdue > 7 ? colors.destructive : colors.upiBorder
            }}>
              <Text style={{
                ...styles.upiTitle,
                color: daysOverdue > 7 ? colors.destructive : colors.success
              }}>
                📱 <strong>Pay instantly with UPI</strong> 
                {daysOverdue === 0 && ' (Recommended)'}
                {daysOverdue > 7 && ' - IMMEDIATE ACTION REQUIRED'}
              </Text>
              <Text style={styles.upiSubtitle}>
                {daysOverdue <= 3 
                  ? 'Works with PhonePe, Google Pay, Paytm, BHIM, or any banking app'
                  : 'Instant payment - takes only 30 seconds!'
                }
              </Text>
              
              <Section style={styles.upiOptions}>
                <div style={styles.upiOption}>
                  <Text style={styles.upiOptionTitle}>On Mobile:</Text>
                  <Button 
                    style={{
                      ...styles.upiButton,
                      backgroundColor: daysOverdue > 7 ? colors.destructive : colors.upiGreen
                    }} 
                    href={upiLink || paymentLink}
                  >
                    {daysOverdue > 7 ? `PAY ${amount} NOW` : `Pay ${amount} via UPI`}
                  </Button>
                </div>
                
                {qrCode && (
                  <div style={styles.upiOption}>
                    <Text style={styles.upiOptionTitle}>On Desktop:</Text>
                    <Text style={styles.upiOptionSubtitle}>Scan QR code with your phone</Text>
                    <Img 
                      src={qrCode} 
                      width="150" 
                      height="150" 
                      alt="UPI QR Code for instant payment"
                      style={{
                        ...styles.qrCode,
                        borderColor: daysOverdue > 7 ? colors.destructive : colors.upiBorder
                      }}
                    />
                  </div>
                )}
              </Section>
              
              <Text style={{
                ...styles.upiInstructions,
                backgroundColor: daysOverdue > 7 ? '#fef2f2' : 'white'
              }}>
                💡 <strong>How it works:</strong> Tap the UPI link → Your UPI app opens → 
                Amount is pre-filled → Enter your UPI PIN → Payment complete in 30 seconds!
              </Text>
            </Section>
          )}
          
          {paymentLink && paymentLink !== upiLink && (
            <Section style={styles.alternativeSection}>
              <Hr style={styles.paymentSeparator} />
              <Text style={styles.alternativeTitle}>
                💳 Alternative: Pay with Card/Net Banking
              </Text>
              <Button style={styles.secondaryButton} href={paymentLink}>
                Pay with Card/Net Banking
              </Button>
            </Section>
          )}
        </Section>
      )}

      {daysOverdue === 0 ? (
        <Text style={styles.paragraph}>
          If you&apos;ve already sent the payment, please disregard this message. 
          Otherwise, I&apos;d appreciate if you could process it at your earliest convenience.
        </Text>
      ) : daysOverdue <= 3 ? (
        <Text style={styles.paragraph}>
          I understand things can get busy. If you&apos;ve already processed this payment, 
          please ignore this reminder. Otherwise, a quick payment would be greatly appreciated.
        </Text>
      ) : daysOverdue <= 7 ? (
        <Text style={styles.paragraph}>
          Please treat this matter with priority. If there are any issues with the invoice 
          or if you need alternative payment arrangements, please let me know immediately.
        </Text>
      ) : (
        <Text style={styles.paragraph}>
          <strong>This requires immediate attention.</strong> Please process payment within 24 hours 
          to avoid further collection activities. If there are any disputes, contact me immediately.
        </Text>
      )}

      <Text style={styles.signature}>
        {daysOverdue <= 3 ? 'Best regards' : daysOverdue <= 7 ? 'Regards' : 'Sincerely'},<br />
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
        Wonderful news! I&apos;ve received your payment of <strong>{amount}</strong> for 
        invoice <strong>{invoiceNumber}</strong>. Thank you so much!
      </Text>

      <Section style={styles.successCard}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successText}>Payment Confirmed</Text>
        <Text style={styles.successDetail}>
          Invoice {invoiceNumber} - {amount}
        </Text>
        <Text style={styles.successNote}>
          Payment processed successfully via UPI
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        I really appreciate your business and look forward to working with you again. 
        Your prompt payment helps me focus on delivering great work!
      </Text>

      <Text style={styles.paragraph}>
        If you need anything else or have any questions about future projects, 
        please don&apos;t hesitate to reach out.
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
  
  paymentSection: {
    backgroundColor: '#f8fafc',
    border: `2px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '24px',
    margin: '32px 0',
  },
  paymentSectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: '16px',
    textAlign: 'center' as const,
  },
  
  upiSection: {
    backgroundColor: colors.upiBackground,
    border: `2px solid ${colors.upiBorder}`,
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
  },
  upiTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: '8px',
    textAlign: 'center' as const,
  },
  upiSubtitle: {
    fontSize: '14px',
    color: '#166534',
    textAlign: 'center' as const,
    marginBottom: '16px',
  },
  upiOptions: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap' as const,
    gap: '16px',
    marginBottom: '16px',
  },
  upiOption: {
    textAlign: 'center' as const,
    flex: '1',
    minWidth: '200px',
  },
  upiOptionTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: '8px',
  },
  upiOptionSubtitle: {
    fontSize: '12px',
    color: '#166534',
    marginBottom: '8px',
  },
  upiButton: {
    backgroundColor: colors.upiGreen,
    borderRadius: '6px',
    color: colors.background,
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  qrCode: {
    border: `2px solid ${colors.upiBorder}`,
    borderRadius: '8px',
    padding: '8px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  upiInstructions: {
    fontSize: '12px',
    color: '#166534',
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '6px',
    border: `1px solid ${colors.upiBorder}`,
    lineHeight: '16px',
  },
  
  alternativeSection: {
    textAlign: 'center' as const,
  },
  alternativeTitle: {
    fontSize: '14px',
    color: colors.mutedForeground,
    marginBottom: '12px',
  },
  secondaryButton: {
    backgroundColor: colors.mutedForeground,
    borderRadius: '6px',
    color: colors.background,
    fontSize: '14px',
    fontWeight: 'normal',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '10px 20px',
  },
  paymentSeparator: {
    borderColor: colors.border,
    margin: '16px 0',
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
  successDetail: {
    fontSize: '16px',
    color: colors.foreground,
    marginBottom: '4px',
  },
  successNote: {
    fontSize: '12px',
    color: colors.success,
    fontStyle: 'italic',
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