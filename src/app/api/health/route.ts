import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { apiLogger } from '@/lib/logger';

export const runtime = 'nodejs';

interface ServiceCheck {
  status: 'up' | 'down';
  latencyMs: number;
  error?: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: ServiceCheck;
    email: ServiceCheck;
    payments: ServiceCheck;
    cache: ServiceCheck;
  };
}

const startTime = Date.now();

async function checkDatabase(): Promise<ServiceCheck> {
  const start = Date.now();
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        error: error.message,
      };
    }

    return {
      status: 'up',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'down',
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkEmail(): Promise<ServiceCheck> {
  const start = Date.now();
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        error: 'RESEND_API_KEY not configured',
      };
    }

    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        error: `Resend API returned ${response.status}`,
      };
    }

    return {
      status: 'up',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'down',
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkPayments(): Promise<ServiceCheck> {
  const start = Date.now();
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        error: 'Razorpay credentials not configured',
      };
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/plans?count=1', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      // 404 is acceptable - means no plans exist but auth worked
      if (response.status === 401) {
        return {
          status: 'down',
          latencyMs: Date.now() - start,
          error: 'Razorpay authentication failed',
        };
      }
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        error: `Razorpay API returned ${response.status}`,
      };
    }

    return {
      status: 'up',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'down',
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkCache(): Promise<ServiceCheck> {
  const start = Date.now();
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        error: 'Redis credentials not configured',
      };
    }

    const response = await fetch(`${redisUrl}/ping`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
    });

    if (!response.ok) {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        error: `Redis returned ${response.status}`,
      };
    }

    return {
      status: 'up',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'down',
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// unhealthy = database/payments down; degraded = email/cache down; healthy = all up
function determineOverallStatus(checks: HealthResponse['checks']): HealthResponse['status'] {
  if (checks.database.status === 'down' || checks.payments.status === 'down') {
    return 'unhealthy';
  }
  if (checks.email.status === 'down' || checks.cache.status === 'down') {
    return 'degraded';
  }
  return 'healthy';
}

export async function GET(): Promise<NextResponse> {
  const requestStart = Date.now();

  try {
    const [database, email, payments, cache] = await Promise.all([
      checkDatabase(),
      checkEmail(),
      checkPayments(),
      checkCache(),
    ]);

    const checks = { database, email, payments, cache };
    const status = determineOverallStatus(checks);

    const response: HealthResponse = {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      checks,
    };

    apiLogger.info({
      action: 'health_check',
      status,
      duration: Date.now() - requestStart,
      database: database.status,
      email: email.status,
      payments: payments.status,
      cache: cache.status,
    }, 'Health check completed');

    const httpStatus = status === 'unhealthy' ? 503 : 200;

    return NextResponse.json(response, { status: httpStatus });
  } catch (error) {
    apiLogger.error({
      action: 'health_check_error',
      err: error instanceof Error ? error : new Error(String(error)),
    }, 'Health check failed');

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}
