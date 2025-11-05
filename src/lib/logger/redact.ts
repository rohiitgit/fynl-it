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
 * Mask a UPI VPA (Virtual Payment Address)
 * Example: user@paytm -> u***@paytm
 */
export function maskUPI(vpa: string | null | undefined): string {
  if (!vpa) return '[no-vpa]'

  const [localPart, provider] = vpa.split('@')
  if (!provider) return '[invalid-vpa]'

  const maskedLocal =
    localPart.length <= 2 ? '***' : localPart[0] + '***'

  return `${maskedLocal}@${provider}`
}

/**
 * Mask a phone number
 * Example: +919876543210 -> +91***3210
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '[no-phone]'

  if (phone.length <= 6) return '***'

  const lastFour = phone.slice(-4)
  const prefix = phone.slice(0, 3)

  return `${prefix}***${lastFour}`
}

/**
 * Mask a name
 * Example: John Doe -> J*** D***
 */
export function maskName(name: string | null | undefined): string {
  if (!name) return '[no-name]'

  return name
    .split(' ')
    .map((part) => (part.length > 0 ? part[0] + '***' : ''))
    .join(' ')
}

/**
 * Hash a value for logging (deterministic for correlation)
 * Uses simple hash - not cryptographically secure
 */
export function hashValue(value: string | null | undefined): string {
  if (!value) return '[no-value]'

  let hash = 0
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36).padStart(8, '0')
}

/**
 * Redact sensitive fields from an object
 * Returns a new object with sensitive fields masked
 */
export function redactSensitiveData<T extends Record<string, unknown>>(
  data: T,
  sensitiveFields: string[] = ['email', 'phone', 'name', 'password', 'token', 'secret', 'key']
): T {
  const redacted = { ...data }

  for (const field of sensitiveFields) {
    if (field in redacted && typeof redacted[field] === 'string') {
      const value = redacted[field] as string

      if (field === 'email') {
        (redacted as Record<string, unknown>)[field] = maskEmail(value)
      } else if (field === 'phone') {
        (redacted as Record<string, unknown>)[field] = maskPhone(value)
      } else if (field === 'name') {
        (redacted as Record<string, unknown>)[field] = maskName(value)
      } else {
        (redacted as Record<string, unknown>)[field] = '[REDACTED]'
      }
    }
  }

  return redacted
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
