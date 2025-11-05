/**
 * Category-Specific Loggers
 *
 * Pre-configured loggers for different parts of the application
 */

import type { Logger } from 'pino'
import { createLogger } from './config'

// Create base logger
const baseLogger = createLogger()

/**
 * Authentication & Authorization Logger
 * Use for: Sign in/out, session management, token operations, middleware auth
 */
export const authLogger: Logger = baseLogger.child({ category: 'auth' })

/**
 * Payment Processing Logger
 * Use for: Payment links, webhooks, Razorpay operations, invoice matching
 */
export const paymentLogger: Logger = baseLogger.child({ category: 'payment' })

/**
 * Email Service Logger
 * Use for: Email sending, Resend API, reminder sequences, follow-ups
 */
export const emailLogger: Logger = baseLogger.child({ category: 'email' })

/**
 * Scheduler/Cron Logger
 * Use for: Scheduled jobs, batch processing, automated tasks
 */
export const schedulerLogger: Logger = baseLogger.child({ category: 'scheduler' })

/**
 * AI/LLM Operations Logger
 * Use for: Gemini API, message generation, invoice processing, AI enhancements
 */
export const aiLogger: Logger = baseLogger.child({ category: 'ai' })

/**
 * Database Operations Logger
 * Use for: Supabase queries, database errors, data operations
 */
export const databaseLogger: Logger = baseLogger.child({ category: 'database' })

/**
 * Security Logger
 * Use for: Rate limiting, suspicious activity, webhook verification, security events
 */
export const securityLogger: Logger = baseLogger.child({ category: 'security' })

/**
 * API Route Logger
 * Use for: General API operations, request/response logging
 */
export const apiLogger: Logger = baseLogger.child({ category: 'api' })

/**
 * General Logger
 * Use for: Anything that doesn't fit other categories
 */
export const logger: Logger = baseLogger.child({ category: 'general' })

/**
 * Export base logger for custom child loggers
 */
export { baseLogger }
