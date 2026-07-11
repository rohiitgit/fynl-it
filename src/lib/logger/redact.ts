/**
 * Logger Redaction Utilities
 *
 * Utilities for redacting sensitive data from logs to protect PII
 */

/**
 * Mask an email address for logging
 * Example: john.doe@example.com -> j***@example.com
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '[no-email]'

  const [localPart, domain] = email.split('@')
  if (!domain) return '[invalid-email]'

  const maskedLocal =
    localPart.length <= 2 ? '***' : localPart[0] + '***'

  return `${maskedLocal}@${domain}`
}

/**
 * Pino redaction paths for automatic redaction
 * These paths will be automatically removed from logs
 */
export const REDACTION_PATHS = [
  // Email fields
  'email',
  'user.email',
  'client.email',
  'payment.email',
  'invoice.email',
  '*.email',

  // Auth fields
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'access_token',
  'refresh_token',
  'authorization',
  'cookie',
  '*.token',

  // API keys and secrets
  'apiKey',
  'api_key',
  'secret',
  'key',
  'apiSecret',
  'webhookSecret',
  '*.secret',
  '*.key',

  // Payment details
  'cardNumber',
  'card_number',
  'cvv',
  'pin',

  // Personal info
  'phone',
  'mobile',
  'ssn',
  'pan',
]
