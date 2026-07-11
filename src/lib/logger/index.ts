/**
 * Structured Logging with Pino
 *
 * Main entry point for logging throughout the application
 *
 * Usage:
 * ```typescript
 * import { logger, paymentLogger } from '@/lib/logger'
 *
 * // General logging
 * logger.info({ action: 'user_action', userId: '123' }, 'User performed action')
 *
 * // Category-specific logging
 * paymentLogger.info({
 *   action: 'payment_captured',
 *   paymentId: 'pay_123',
 *   amount: 1000,
 * }, 'Payment captured successfully')
 *
 * // Error logging
 * logger.error({ err, action: 'operation_failed' }, 'Operation failed')
 * ```
 */

// Export category-specific loggers
export {
  logger,
  authLogger,
  paymentLogger,
  emailLogger,
  schedulerLogger,
  aiLogger,
  databaseLogger,
  securityLogger,
  apiLogger,
  baseLogger,
} from './categories'

// Export types
export type { LogLevel, LogCategory, LogContext, ErrorContext } from './types'

// Export redaction utilities (for manual use when needed)
export { maskEmail } from './redact'

// Export logger configuration (for testing or custom loggers)
export { createLogger, getLoggerConfig } from './config'
