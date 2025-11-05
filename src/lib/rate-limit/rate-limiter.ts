import { Ratelimit } from '@upstash/ratelimit'
import type { Duration } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import type { RateLimitConfig } from './config'
import { BYPASS_TOKEN, RATE_LIMITING_ENABLED } from './config'
import { getClientIp } from './ip-utils'
import {
  createRateLimitExceededResponse,
  createRateLimitHeaders,
} from './responses'
import { securityLogger } from '@/lib/logger'

/**
 * Result of a rate limit check
 */
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  response?: NextResponse
}

/**
 * Initialize Redis client for rate limiting
 * Uses Upstash Redis REST API
 */
let redis: Redis | null = null

function getRedisClient(): Redis | null {
  if (!RATE_LIMITING_ENABLED) {
    securityLogger.warn({
      action: 'rate_limiting_disabled',
    }, 'Rate limiting is disabled - UPSTASH_REDIS credentials not configured')
    return null
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    securityLogger.info({
      action: 'redis_client_initialized',
    }, 'Rate limiting Redis client initialized')
  }

  return redis
}

/**
 * Create a rate limiter instance for a specific configuration
 *
 * @param config - Rate limit configuration
 * @param prefix - Identifier prefix for the rate limiter
 * @returns Ratelimit instance or null if Redis is not configured
 */
function createRateLimiter(
  config: { requests: number; window: Duration },
  prefix: string
): Ratelimit | null {
  const redisClient = getRedisClient()
  if (!redisClient) {
    return null
  }

  return new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    prefix,
    analytics: true, // Enable analytics in Upstash dashboard
  })
}

/**
 * Check if request has bypass token
 *
 * @param request - Incoming request
 * @returns True if bypass token is present and valid
 */
function hasBypassToken(request: Request): boolean {
  if (!BYPASS_TOKEN) {
    return false
  }

  const bypassHeader = request.headers.get('x-rate-limit-bypass')
  return bypassHeader === BYPASS_TOKEN
}

/**
 * Check rate limit for a request
 *
 * @param request - The incoming request
 * @param userId - User ID (for authenticated requests)
 * @param config - Rate limit configuration
 * @param tierName - Name of the rate limit tier (for logging)
 * @returns RateLimitResult with success status and headers
 */
export async function checkRateLimit(
  request: Request,
  userId: string | null | undefined,
  config: RateLimitConfig,
  tierName: string = 'default'
): Promise<RateLimitResult> {
  // Check for bypass token (testing/admin)
  if (hasBypassToken(request)) {
    securityLogger.info({
      action: 'rate_limit_bypassed',
      tier: tierName,
      userId,
    }, 'Rate limit bypassed with valid bypass token')
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: Date.now() + 3600000,
    }
  }

  // If rate limiting is not enabled, allow the request
  if (!RATE_LIMITING_ENABLED) {
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now() + 3600000,
    }
  }

  // Determine which config to use (authenticated vs anonymous)
  let limitConfig: { requests: number; window: Duration } | undefined
  let identifier: string

  if (userId && config.authenticated) {
    // Authenticated user - rate limit by user ID
    limitConfig = config.authenticated
    identifier = `user:${userId}:${tierName}`
  } else if (config.anonymous) {
    // Anonymous user - rate limit by IP address
    const ip = getClientIp(request)
    limitConfig = config.anonymous
    identifier = `ip:${ip}:${tierName}`
  } else {
    // No applicable rate limit (e.g., authenticated-only route without auth)
    securityLogger.warn({
      action: 'rate_limit_config_missing',
      tier: tierName,
      userId,
    }, 'No rate limit config found for tier')
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now() + 3600000,
    }
  }

  // Create rate limiter for this configuration
  const rateLimiter = createRateLimiter(limitConfig, tierName)
  if (!rateLimiter) {
    // Redis not configured, allow request
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now() + 3600000,
    }
  }

  try {
    // Check the rate limit
    const result = await rateLimiter.limit(identifier)

    securityLogger.debug({
      action: 'rate_limit_check',
      tier: tierName,
      identifier: identifier.split(':')[0], // Only log 'user' or 'ip', not the actual value
      remaining: result.remaining,
      limit: limitConfig.requests,
      userId,
    }, 'Rate limit check performed')

    if (!result.success) {
      // Rate limit exceeded
      securityLogger.warn({
        action: 'rate_limit_exceeded',
        tier: tierName,
        identifier: identifier.split(':')[0], // Only log 'user' or 'ip'
        limit: limitConfig.requests,
        resetAt: new Date(result.reset).toISOString(),
        userId,
      }, 'Rate limit exceeded')

      return {
        success: false,
        limit: limitConfig.requests,
        remaining: result.remaining,
        reset: result.reset,
        response: createRateLimitExceededResponse(
          limitConfig.requests,
          result.reset,
          `Rate limit exceeded for ${tierName}. Please try again later.`
        ),
      }
    }

    // Rate limit check passed
    return {
      success: true,
      limit: limitConfig.requests,
      remaining: result.remaining,
      reset: result.reset,
    }
  } catch (error) {
    securityLogger.error({
      action: 'rate_limit_check_error',
      tier: tierName,
      userId,
      err: error instanceof Error ? error : new Error(String(error)),
    }, 'Rate limit check failed - allowing request')

    // On error, allow the request but log it
    // This prevents Redis issues from blocking legitimate requests
    return {
      success: true,
      limit: limitConfig.requests,
      remaining: -1, // Indicates error state
      reset: Date.now() + 3600000,
    }
  }
}

/**
 * Add rate limit headers to an existing response
 *
 * @param response - The response to add headers to
 * @param result - The rate limit check result
 * @returns Response with rate limit headers added
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  if (result.limit === 0) {
    // Rate limiting not enabled, don't add headers
    return response
  }

  const headers = createRateLimitHeaders(
    result.limit,
    result.remaining,
    result.reset
  )

  // Add headers to the response
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

/**
 * Convenience wrapper for checking rate limit and returning early if exceeded
 *
 * Usage in API routes:
 * ```typescript
 * const rateLimit = await applyRateLimit(request, userId, AI_RATE_LIMIT, 'ai')
 * if (rateLimit.response) {
 *   return rateLimit.response // Rate limit exceeded
 * }
 * ```
 *
 * @param request - The incoming request
 * @param userId - User ID (for authenticated requests)
 * @param config - Rate limit configuration
 * @param tierName - Name of the rate limit tier
 * @returns Rate limit result with response if exceeded
 */
export async function applyRateLimit(
  request: Request,
  userId: string | null | undefined,
  config: RateLimitConfig,
  tierName: string = 'default'
): Promise<RateLimitResult> {
  return checkRateLimit(request, userId, config, tierName)
}
