// Mock Upstash Redis and Ratelimit for testing
// This mock simulates the Upstash Redis API behavior

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  pending: Promise<unknown>;
}

// Track rate limit state for tests
const rateLimitState: Map<string, { count: number; resetAt: number }> = new Map();

// Mock rate limit result
export const mockRateLimitResult: RateLimitResult = {
  success: true,
  limit: 10,
  remaining: 9,
  reset: Date.now() + 60000,
  pending: Promise.resolve(),
};

// Mock rate limit function
export const mockLimit = jest.fn().mockImplementation(async (identifier: string) => {
  const now = Date.now();
  const state = rateLimitState.get(identifier) || { count: 0, resetAt: now + 60000 };

  // Reset if window expired
  if (now > state.resetAt) {
    state.count = 0;
    state.resetAt = now + 60000;
  }

  state.count++;
  rateLimitState.set(identifier, state);

  const limit = 10;
  const remaining = Math.max(0, limit - state.count);

  return {
    success: state.count <= limit,
    limit,
    remaining,
    reset: state.resetAt,
    pending: Promise.resolve(),
  };
});

// Mock Redis client
class MockRedis {
  url: string;
  token: string;

  constructor(config: { url: string; token: string }) {
    this.url = config.url;
    this.token = config.token;
  }

  get = jest.fn().mockResolvedValue(null);
  set = jest.fn().mockResolvedValue('OK');
  del = jest.fn().mockResolvedValue(1);
  incr = jest.fn().mockResolvedValue(1);
  expire = jest.fn().mockResolvedValue(1);
  ping = jest.fn().mockResolvedValue('PONG');
  eval = jest.fn().mockResolvedValue(1);
}

// Mock Ratelimit class
class MockRatelimit {
  redis: MockRedis;
  limiter: {
    type: string;
    tokens: number;
    window: string;
  };
  prefix: string;
  analytics: boolean;

  constructor(config: {
    redis: MockRedis;
    limiter: ReturnType<typeof MockRatelimit.slidingWindow>;
    prefix?: string;
    analytics?: boolean;
  }) {
    this.redis = config.redis;
    this.limiter = config.limiter;
    this.prefix = config.prefix || '';
    this.analytics = config.analytics || false;
  }

  limit = mockLimit;

  static slidingWindow(tokens: number, window: string) {
    return {
      type: 'slidingWindow',
      tokens,
      window,
    };
  }

  static fixedWindow(tokens: number, window: string) {
    return {
      type: 'fixedWindow',
      tokens,
      window,
    };
  }

  static tokenBucket(tokens: number, interval: string, maxTokens: number) {
    return {
      type: 'tokenBucket',
      tokens,
      interval,
      maxTokens,
    };
  }
}

// Helper to reset all mocks and state
export const resetUpstashMocks = () => {
  mockLimit.mockClear();
  rateLimitState.clear();
};

// Helper to simulate rate limit exceeded
export const simulateRateLimitExceeded = (identifier: string) => {
  rateLimitState.set(identifier, { count: 100, resetAt: Date.now() + 60000 });
};

// Helper to clear rate limit for identifier
export const clearRateLimit = (identifier: string) => {
  rateLimitState.delete(identifier);
};

// Create mock instances
export const createMockRedis = () => new MockRedis({
  url: 'https://test-redis.upstash.io',
  token: 'test_token',
});

export const createMockRatelimit = () => new MockRatelimit({
  redis: createMockRedis(),
  limiter: MockRatelimit.slidingWindow(10, '1m'),
  prefix: 'test',
  analytics: false,
});

// Named exports matching @upstash packages
export const Redis = MockRedis;
export const Ratelimit = MockRatelimit;

// Default export
export default { Redis: MockRedis, Ratelimit: MockRatelimit };
