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

/**
 * Validate if a string is a valid IPv4 address
 *
 * @param ip - The IP address to validate
 * @returns True if valid IPv4, false otherwise
 */
export function isValidIPv4(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (!ipv4Regex.test(ip)) {
    return false
  }

  const parts = ip.split('.')
  return parts.every((part) => {
    const num = parseInt(part, 10)
    return num >= 0 && num <= 255
  })
}

/**
 * Validate if a string is a valid IPv6 address
 *
 * @param ip - The IP address to validate
 * @returns True if valid IPv6, false otherwise
 */
export function isValidIPv6(ip: string): boolean {
  // Simplified IPv6 validation
  const ipv6Regex = /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i
  const ipv6CompressedRegex = /^([\da-f]{1,4}:)*:([\da-f]{1,4}:)*[\da-f]{1,4}$/i
  return ipv6Regex.test(ip) || ipv6CompressedRegex.test(ip)
}

/**
 * Check if an IP address is valid (IPv4 or IPv6)
 *
 * @param ip - The IP address to validate
 * @returns True if valid IP address, false otherwise
 */
export function isValidIp(ip: string): boolean {
  return isValidIPv4(ip) || isValidIPv6(ip)
}

/**
 * Check if an IP is in a CIDR range
 * Useful for IP whitelisting (e.g., Razorpay webhooks, Vercel cron)
 *
 * @param ip - The IP address to check
 * @param cidr - The CIDR range (e.g., "192.168.1.0/24")
 * @returns True if IP is in the CIDR range
 */
export function isIpInCidr(ip: string, cidr: string): boolean {
  // Only support IPv4 for now
  if (!isValidIPv4(ip)) {
    return false
  }

  const [range, bits = '32'] = cidr.split('/')
  const mask = ~(2 ** (32 - parseInt(bits, 10)) - 1)

  const ipNum = ipToNumber(ip)
  const rangeNum = ipToNumber(range)

  return (ipNum & mask) === (rangeNum & mask)
}

/**
 * Convert IPv4 address to number for comparison
 *
 * @param ip - The IPv4 address
 * @returns Numeric representation of the IP
 */
function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => {
    return (acc << 8) + parseInt(octet, 10)
  }, 0)
}

/**
 * Check if IP is whitelisted for a specific service
 *
 * @param ip - The IP address to check
 * @param whitelist - Array of IPs or CIDR ranges
 * @returns True if IP is whitelisted
 */
export function isIpWhitelisted(ip: string, whitelist: string[]): boolean {
  if (whitelist.length === 0) {
    return true // No whitelist means all IPs allowed
  }

  return whitelist.some((entry) => {
    if (entry.includes('/')) {
      // CIDR range
      return isIpInCidr(ip, entry)
    } else {
      // Exact IP match
      return ip === entry
    }
  })
}

/**
 * Anonymize IP address for logging (GDPR compliance)
 * Removes the last octet of IPv4 or last 4 groups of IPv6
 *
 * @param ip - The IP address to anonymize
 * @returns Anonymized IP address
 */
export function anonymizeIp(ip: string): string {
  if (ip === 'unknown') {
    return 'unknown'
  }

  if (isValidIPv4(ip)) {
    const parts = ip.split('.')
    parts[3] = '0'
    return parts.join('.')
  }

  if (isValidIPv6(ip)) {
    const parts = ip.split(':')
    return parts.slice(0, 4).join(':') + '::'
  }

  return 'unknown'
}
