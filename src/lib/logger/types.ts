/**
 * Logger Types
 *
 * Type definitions for structured logging with Pino
 */

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export type LogCategory =
  | 'auth'
  | 'payment'
  | 'email'
  | 'scheduler'
  | 'ai'
  | 'database'
  | 'security'
  | 'api'
  | 'general'

export interface LogContext {
  /**
   * Unique identifier for request tracing
   */
  requestId?: string

  /**
   * User ID (Supabase UUID)
   */
  userId?: string

  /**
   * Invoice ID
   */
  invoiceId?: string

  /**
   * Payment ID (Razorpay payment ID)
   */
  paymentId?: string

  /**
   * Email/Follow-up ID
   */
  emailId?: string

  /**
   * Action being performed
   */
  action?: string

  /**
   * Duration in milliseconds (for timing operations)
   */
  duration?: number

  /**
   * HTTP status code
   */
  statusCode?: number

  /**
   * Any additional metadata
   */
  [key: string]: unknown
}

export interface ErrorContext {
  name: string
  message: string
  stack?: string
  code?: string
  statusCode?: number
}
