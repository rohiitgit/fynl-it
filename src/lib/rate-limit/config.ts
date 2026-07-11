/**
 * Rate Limiting Configuration
 *
 * Defines rate limit tiers for different API route categories.
 * Each tier specifies limits for authenticated users and anonymous (IP-based) requests.
 */

import type { Duration } from '@upstash/ratelimit'

export interface RateLimitConfig {
  /**
   * Limit for authenticated users (identified by user ID)
   */
  authenticated?: {
    requests: number
    window: Duration // e.g., '1 h', '15 m', '1 d'
  }
  /**
   * Limit for anonymous users (identified by IP address)
   */
  anonymous?: {
    requests: number
    window: Duration
  }
}

/**
 * Tier 1: AI Processing Routes (STRICT)
 *
 * Routes: /api/process-invoice, /api/enhance-message, /api/generate-message
 *
 * These routes use Google Gemini AI which has:
 * - High computational cost
 * - API quota limits
 * - Potential for abuse
 *
 * Limits:
 * - Authenticated: 10 requests per hour (reasonable for normal usage)
 * - Anonymous: 3 requests per 15 minutes (very restrictive)
 */
export const AI_RATE_LIMIT: RateLimitConfig = {
  authenticated: {
    requests: 10,
    window: '1 h',
  },
  anonymous: {
    requests: 3,
    window: '15 m',
  },
}

/**
 * Tier 2: Email Routes (MODERATE)
 *
 * Routes: /api/email/test, /api/email/send
 *
 * Email sending has:
 * - Cost per email (Resend pricing)
 * - Sender reputation impact
 * - Potential for spam abuse
 *
 * Limits:
 * - Authenticated: 5 requests per hour
 * - Anonymous: 1 request per hour (test emails only)
 */
export const EMAIL_RATE_LIMIT: RateLimitConfig = {
  authenticated: {
    requests: 5,
    window: '1 h',
  },
  anonymous: {
    requests: 1,
    window: '1 h',
  },
}

/**
 * Tier 3: Payment Routes (AUTHENTICATED ONLY)
 *
 * Routes: /api/payments/create-link
 *
 * Payment operations require:
 * - User authentication (already enforced)
 * - Protection against mass creation
 * - Financial service integrity
 *
 * Limits:
 * - Authenticated: 20 requests per hour (users may create multiple invoices)
 * - Anonymous: Not allowed (authentication required)
 */
export const PAYMENT_RATE_LIMIT: RateLimitConfig = {
  authenticated: {
    requests: 20,
    window: '1 h',
  },
  // No anonymous access - authentication is required
}

/**
 * Tier 4: Webhook Routes (SPECIAL HANDLING)
 *
 * Routes: /api/webhooks/razorpay
 *
 * Webhooks are:
 * - Public endpoints (by design)
 * - Protected by signature verification
 * - Can spike during high activity
 *
 * Limits:
 * - Per IP: 1000 requests per hour (generous for legitimate webhooks)
 * - Signature verification provides primary security
 */
export const WEBHOOK_RATE_LIMIT: RateLimitConfig = {
  anonymous: {
    requests: 1000,
    window: '1 h',
  },
}

/**
 * Rate limit bypass token (for testing/admin purposes)
 * Set via RATE_LIMIT_BYPASS_TOKEN environment variable
 */
export const BYPASS_TOKEN = process.env.RATE_LIMIT_BYPASS_TOKEN

/**
 * Check if rate limiting is enabled
 * Requires Upstash Redis credentials
 */
export const RATE_LIMITING_ENABLED =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN

