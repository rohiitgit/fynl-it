import {
  getClientIp,
  isValidIPv4,
  isValidIPv6,
  isValidIp,
  isIpInCidr,
  isIpWhitelisted,
  anonymizeIp,
} from '@/lib/rate-limit/ip-utils'

describe('IP Utils', () => {
  describe('getClientIp', () => {
    it('should extract IP from x-real-ip header', () => {
      const request = new Request('https://example.com', {
        headers: {
          'x-real-ip': '192.168.1.100',
        },
      })
      expect(getClientIp(request)).toBe('192.168.1.100')
    })

    it('should extract first IP from x-forwarded-for', () => {
      const request = new Request('https://example.com', {
        headers: {
          'x-forwarded-for': '203.0.113.1, 198.51.100.1, 192.0.2.1',
        },
      })
      expect(getClientIp(request)).toBe('203.0.113.1')
    })

    it('should prefer x-real-ip over x-forwarded-for', () => {
      const request = new Request('https://example.com', {
        headers: {
          'x-real-ip': '192.168.1.100',
          'x-forwarded-for': '203.0.113.1, 198.51.100.1',
        },
      })
      expect(getClientIp(request)).toBe('192.168.1.100')
    })

    it('should return unknown if no IP headers present', () => {
      const request = new Request('https://example.com')
      expect(getClientIp(request)).toBe('unknown')
    })
  })

  describe('isValidIPv4', () => {
    it('should validate correct IPv4 addresses', () => {
      expect(isValidIPv4('192.168.1.1')).toBe(true)
      expect(isValidIPv4('10.0.0.1')).toBe(true)
      expect(isValidIPv4('172.16.0.1')).toBe(true)
      expect(isValidIPv4('8.8.8.8')).toBe(true)
      expect(isValidIPv4('255.255.255.255')).toBe(true)
      expect(isValidIPv4('0.0.0.0')).toBe(true)
    })

    it('should reject invalid IPv4 addresses', () => {
      expect(isValidIPv4('256.1.1.1')).toBe(false)
      expect(isValidIPv4('1.1.1')).toBe(false)
      expect(isValidIPv4('1.1.1.1.1')).toBe(false)
      expect(isValidIPv4('abc.def.ghi.jkl')).toBe(false)
      expect(isValidIPv4('192.168.1.300')).toBe(false)
    })
  })

  describe('isValidIPv6', () => {
    it('should validate correct IPv6 addresses', () => {
      expect(isValidIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true)
      expect(isValidIPv6('2001:db8:85a3::8a2e:370:7334')).toBe(true)
      expect(isValidIPv6('::1')).toBe(true)
      expect(isValidIPv6('fe80::1')).toBe(true)
    })

    it('should reject invalid IPv6 addresses', () => {
      expect(isValidIPv6('192.168.1.1')).toBe(false)
      expect(isValidIPv6('gggg::1')).toBe(false)
      expect(isValidIPv6('invalid')).toBe(false)
    })
  })

  describe('isValidIp', () => {
    it('should validate both IPv4 and IPv6', () => {
      expect(isValidIp('192.168.1.1')).toBe(true)
      expect(isValidIp('2001:db8:85a3::8a2e:370:7334')).toBe(true)
      expect(isValidIp('invalid')).toBe(false)
    })
  })

  describe('isIpInCidr', () => {
    it('should correctly check if IP is in CIDR range', () => {
      expect(isIpInCidr('192.168.1.100', '192.168.1.0/24')).toBe(true)
      expect(isIpInCidr('192.168.2.100', '192.168.1.0/24')).toBe(false)
      expect(isIpInCidr('10.0.0.50', '10.0.0.0/16')).toBe(true)
      expect(isIpInCidr('10.1.0.50', '10.0.0.0/16')).toBe(false)
    })

    it('should handle /32 CIDR (single IP)', () => {
      expect(isIpInCidr('192.168.1.1', '192.168.1.1/32')).toBe(true)
      expect(isIpInCidr('192.168.1.2', '192.168.1.1/32')).toBe(false)
    })

    it('should return false for IPv6 (not supported)', () => {
      expect(isIpInCidr('2001:db8::1', '2001:db8::/32')).toBe(false)
    })
  })

  describe('isIpWhitelisted', () => {
    it('should return true if whitelist is empty', () => {
      expect(isIpWhitelisted('192.168.1.1', [])).toBe(true)
    })

    it('should check exact IP matches', () => {
      const whitelist = ['192.168.1.1', '10.0.0.1']
      expect(isIpWhitelisted('192.168.1.1', whitelist)).toBe(true)
      expect(isIpWhitelisted('10.0.0.1', whitelist)).toBe(true)
      expect(isIpWhitelisted('192.168.1.2', whitelist)).toBe(false)
    })

    it('should check CIDR ranges', () => {
      const whitelist = ['192.168.1.0/24', '10.0.0.0/8']
      expect(isIpWhitelisted('192.168.1.100', whitelist)).toBe(true)
      expect(isIpWhitelisted('10.50.100.200', whitelist)).toBe(true)
      expect(isIpWhitelisted('172.16.0.1', whitelist)).toBe(false)
    })

    it('should handle mixed exact IPs and CIDR ranges', () => {
      const whitelist = ['192.168.1.1', '10.0.0.0/8', '172.16.0.0/16']
      expect(isIpWhitelisted('192.168.1.1', whitelist)).toBe(true)
      expect(isIpWhitelisted('10.50.100.200', whitelist)).toBe(true)
      expect(isIpWhitelisted('172.16.5.10', whitelist)).toBe(true)
      expect(isIpWhitelisted('8.8.8.8', whitelist)).toBe(false)
    })
  })

  describe('anonymizeIp', () => {
    it('should anonymize IPv4 by removing last octet', () => {
      expect(anonymizeIp('192.168.1.100')).toBe('192.168.1.0')
      expect(anonymizeIp('10.20.30.40')).toBe('10.20.30.0')
    })

    it('should anonymize IPv6 by keeping first 4 groups', () => {
      expect(anonymizeIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(
        '2001:0db8:85a3:0000::'
      )
      expect(anonymizeIp('fe80::1')).toBe('fe80::')
    })

    it('should handle unknown IP', () => {
      expect(anonymizeIp('unknown')).toBe('unknown')
    })

    it('should handle invalid IP', () => {
      expect(anonymizeIp('not-an-ip')).toBe('unknown')
    })
  })
})
