import * as Sentry from '@sentry/nextjs';

// Export onRequestError hook for capturing errors from nested React Server Components
export const onRequestError = Sentry.captureRequestError;

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side Sentry initialization
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

      // Only enable Sentry in production
      enabled: process.env.NODE_ENV === 'production',

      // Performance Monitoring
      tracesSampleRate: 0.1,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,

      // Environment tag
      environment: process.env.NODE_ENV,

      // Ignore expected errors
      ignoreErrors: [
        'Rate limit exceeded',
        'Invalid refresh token',
        'refresh_token_not_found',
      ],

      // Don't send PII
      sendDefaultPii: false,

      // Custom tags for filtering
      initialScope: {
        tags: {
          app: 'nudgr',
          runtime: 'server',
        },
      },

      // Sample only errors in production
      beforeSend(event, hint) {
        const error = hint.originalException;
        if (error instanceof Error) {
          if (error.message.includes('duplicate webhook')) {
            return null;
          }
        }
        return event;
      },
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime Sentry initialization
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

      // Only enable Sentry in production
      enabled: process.env.NODE_ENV === 'production',

      // Performance Monitoring
      tracesSampleRate: 0.1,

      debug: false,

      environment: process.env.NODE_ENV,

      sendDefaultPii: false,

      initialScope: {
        tags: {
          app: 'nudgr',
          runtime: 'edge',
        },
      },
    });
  }
}
