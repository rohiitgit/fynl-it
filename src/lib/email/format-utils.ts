// src/lib/email/format-utils.ts
// Shared formatting utilities for email templates

import type { EmailTemplateProps } from './templates';

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Format currency amount for display
 * Uses INR locale for Indian Rupees, otherwise uses currency code as prefix
 */
export function formatAmount(amount: number, currency: string): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  }

  // For other currencies, use symbol if available, otherwise currency code
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Calculate days overdue from a due date
 */
export function calculateDaysOverdue(dueDate: Date): number {
  const today = new Date();
  const diffTime = today.getTime() - dueDate.getTime();
  return Math.max(0, Math.floor(diffTime / MILLISECONDS_PER_DAY));
}

/**
 * Format date for display in emails
 */
export function formatDueDate(dueDate: Date): string {
  return dueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Build user display name from profile fields
 */
export function buildUserName(firstName: string | null, lastName: string | null): string {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim();
}

export interface InvoiceData {
  client_name: string;
  client_email: string;
  invoice_number: string;
  amount: number;
  currency: string;
  due_date: string;
  payment_link: string | null;
}

export interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  email?: string | null;
  preferred_from_name?: string | null;
}

/**
 * Prepare template props from invoice and profile data
 * Single source of truth for template data preparation
 */
export function prepareTemplateProps(
  invoice: InvoiceData,
  profile: ProfileData,
  options?: {
    customMessage?: string;
    followUpContent?: string;
  }
): EmailTemplateProps {
  const dueDate = new Date(invoice.due_date);
  const daysOverdue = calculateDaysOverdue(dueDate);
  const formattedAmount = formatAmount(invoice.amount, invoice.currency);
  const userName = profile.preferred_from_name || buildUserName(profile.first_name, profile.last_name);

  return {
    clientName: invoice.client_name,
    invoiceNumber: invoice.invoice_number,
    amount: formattedAmount,
    dueDate: formatDueDate(dueDate),
    daysOverdue,
    paymentLink: invoice.payment_link ?? undefined,
    userName: userName || 'Your Service Provider',
    businessName: profile.business_name ?? undefined,
    customMessage: options?.customMessage || options?.followUpContent,
  };
}
