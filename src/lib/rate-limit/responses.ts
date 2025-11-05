import { NextResponse } from 'next/server'

/**
 * Rate Limit Response Utilities
 *
 * Provides standardized responses for rate limit scenarios with proper headers.
 */

export type RateLimitHeaders = {
  'X-RateLimit-Limit': string
  'X-RateLimit-Remaining': string
  'X-RateLimit-Reset': string
  'Retry-After'?: string
}

/**
 * Create standardized headers for rate limit responses
 *
 * @param limit - Maximum number of requests allowed in the window
 * @param remaining - Number of requests remaining
 * @param reset - Unix timestamp when the rate limit resets
 * @returns Headers object
 */
export function createRateLimitHeaders(
  limit: number,
  remaining: number,
  reset: number
): RateLimitHeaders {
  const headers: RateLimitHeaders = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, remaining).toString(),
    'X-RateLimit-Reset': reset.toString(),
  }

  // Add Retry-After header if rate limit is exceeded
  if (remaining < 0) {
    const retryAfterSeconds = Math.max(0, Math.ceil((reset - Date.now()) / 1000))
    headers['Retry-After'] = retryAfterSeconds.toString()
  }

  return headers
}

/**
 * Create a 429 Too Many Requests response
 *
 * @param limit - Maximum number of requests allowed
 * @param reset - Unix timestamp when the rate limit resets
 * @param message - Optional custom error message
 * @returns NextResponse with 429 status and rate limit headers
 */
export function createRateLimitExceededResponse(
  limit: number,
  reset: number,
  message?: string
): NextResponse {
  const retryAfterSeconds = Math.max(0, Math.ceil((reset - Date.now()) / 1000))

  const headers = createRateLimitHeaders(limit, 0, reset)

  const errorMessage =
    message ||
    `Rate limit exceeded. Please try again in ${formatRetryAfter(retryAfterSeconds)}.`

  // Convert headers to Record<string, string> by filtering out undefined values
  const headersRecord: Record<string, string> = Object.entries(headers)
    .filter(([, value]) => value !== undefined)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

  return NextResponse.json(
    {
      error: 'Too Many Requests',
      message: errorMessage,
      retryAfter: retryAfterSeconds,
      resetAt: new Date(reset).toISOString(),
    },
    {
      status: 429,
      headers: headersRecord,
    }
  )
}

/**
 * Create a successful response with rate limit headers
 *
 * @param data - Response data
 * @param limit - Maximum number of requests allowed
 * @param remaining - Number of requests remaining
 * @param reset - Unix timestamp when the rate limit resets
 * @returns NextResponse with rate limit headers
 */
export function createSuccessResponseWithRateLimit(
  data: unknown,
  limit: number,
  remaining: number,
  reset: number
): NextResponse {
  const headers = createRateLimitHeaders(limit, remaining, reset)

  // Convert headers to Record<string, string> by filtering out undefined values
  const headersRecord: Record<string, string> = Object.entries(headers)
    .filter(([, value]) => value !== undefined)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

  return NextResponse.json(data, {
    status: 200,
    headers: headersRecord,
  })
}

/**
 * Format retry-after seconds into human-readable string
 *
 * @param seconds - Number of seconds
 * @returns Human-readable string (e.g., "2 minutes", "30 seconds")
 */
function formatRetryAfter(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`
  }

  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }

  const hours = Math.ceil(minutes / 60)
  return `${hours} hour${hours !== 1 ? 's' : ''}`
}

/**
 * Create an authentication required response
 *
 * @returns NextResponse with 401 status
 */
export function createAuthRequiredResponse(): NextResponse {
  return NextResponse.json(
    {
      error: 'Authentication Required',
      message: 'This endpoint requires authentication. Please provide a valid access token.',
    },
    {
      status: 401,
    }
  )
}

/**
 * Create a rate limiting disabled response (fallback when Redis is not configured)
 *
 * @param data - Response data
 * @returns NextResponse without rate limit headers
 */
export function createResponseWithoutRateLimit(data: unknown): NextResponse {
  return NextResponse.json(data, {
    status: 200,
  })
}
