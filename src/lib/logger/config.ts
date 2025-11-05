/**
 * Logger Configuration
 *
 * Main Pino logger configuration with environment-based settings
 */

import pino from 'pino'
import type { LoggerOptions } from 'pino'
import { REDACTION_PATHS } from './redact'

const isProduction = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'

// Determine log level from environment or default based on NODE_ENV
const getLogLevel = (): string => {
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL
  }

  if (isTest) return 'silent' // No logs during tests unless explicitly set
  if (isProduction) return 'info' // Info and above in production
  return 'debug' // Debug and above in development
}

/**
 * Base Pino configuration
 */
const pinoConfig: LoggerOptions = {
  level: getLogLevel(),

  // Format log level as string
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },

  // Automatically redact sensitive fields
  redact: {
    paths: REDACTION_PATHS,
    remove: true, // Remove fields completely rather than showing [Redacted]
  },

  // Add timestamp to every log
  timestamp: pino.stdTimeFunctions.isoTime,

  // Base fields for all logs (Edge Runtime compatible)
  base: {
    env: process.env.NODE_ENV || 'development',
    // Note: process.pid is not available in Edge Runtime, omitted for compatibility
  },

  // Serializers for common objects
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
}

/**
 * Development-specific configuration
 * Pretty print for better readability in terminal
 */
const devConfig: LoggerOptions = {
  ...pinoConfig,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss.l',
      ignore: 'pid,hostname',
      messageFormat: '{category} [{level}] {msg}',
      singleLine: false,
    },
  },
}

/**
 * Production-specific configuration
 * JSON output for log aggregators (Datadog, Logtail, etc.)
 */
const prodConfig: LoggerOptions = {
  ...pinoConfig,
  // No pretty printing in production - use JSON
  // This is optimal for Vercel Log Drains and log aggregation services
}

/**
 * Test-specific configuration
 * Silent unless explicitly enabled
 */
const testConfig: LoggerOptions = {
  ...pinoConfig,
  level: process.env.LOG_LEVEL || 'silent',
}

/**
 * Get the appropriate configuration based on environment
 */
export function getLoggerConfig(): LoggerOptions {
  if (isTest) return testConfig
  if (isProduction) return prodConfig
  return devConfig
}

/**
 * Create the main logger instance
 */
export function createLogger() {
  return pino(getLoggerConfig())
}
