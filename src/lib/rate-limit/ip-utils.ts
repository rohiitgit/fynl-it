/**
 * IP Address Utilities
 *
 * Handles extraction and validation of client IP addresses from requests.
 * Properly handles proxies and Vercel's forwarding headers.
 */

/**
 * Extract the real client IP address from the request
 *
 * Vercel provides these headers in order of priority:
 * 1. x-real-ip - Single IP address
 * 2. x-forwarded-for - Comma-separated list (client IP is first)
 *
 * @param request - The incoming request object
 * @returns The client's IP address, or 'unknown' if not found
 */
export function getClientIp(request: Request): string {
  // Try x-real-ip first (most reliable)
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  // Fall back to x-forwarded-for (get first IP in the list)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can be: "client, proxy1, proxy2"
    // We want the client IP (first one)
    const ips = forwardedFor.split(',')
    const clientIp = ips[0]?.trim()
    if (clientIp) {
      return clientIp
    }
  }

  // Last resort: CF-Connecting-IP (if behind Cloudflare)
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) {
    return cfIp.trim()
  }

  // If no IP found, return a placeholder
  // This should rarely happen on Vercel
  return 'unknown'
}

