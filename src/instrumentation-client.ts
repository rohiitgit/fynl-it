import * as Sentry from '@sentry/nextjs';

// Export router transition hook for navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

// Client-side Sentry initialization
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable Sentry in production
  enabled: process.env.NODE_ENV === 'production',

  // Performance Monitoring
  tracesSampleRate: 0.1,

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  debug: false,

  environment: process.env.NODE_ENV,

  // Ignore known browser extension errors and other noise
  ignoreErrors: [
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
  ],

  sendDefaultPii: false,

  initialScope: {
    tags: {
      app: 'nudgr',
    },
  },

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
