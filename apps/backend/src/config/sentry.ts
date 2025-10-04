import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export function initializeSentry() {
  if (!process.env.SENTRY_DSN) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    
    // Profiling
    profilesSampleRate: 0.1,
    
    integrations: [
      // Add profiling integration
      new ProfilingIntegration(),
      // Add other integrations
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: undefined }),
    ],

    // Don't capture errors in development
    enabled: process.env.NODE_ENV === 'production' || process.env.SENTRY_DSN !== undefined,

    // Performance monitoring
    beforeSend(event, hint) {
      // Filter out certain errors if needed
      if (event.exception) {
        const error = hint.originalException;
        if (error && typeof error === 'object' && 'statusCode' in error) {
          const statusCode = (error as any).statusCode;
          // Don't send 4xx errors to Sentry
          if (statusCode >= 400 && statusCode < 500) {
            return null;
          }
        }
      }
      return event;
    },
  });

  console.log('Sentry error tracking initialized');
}

export { Sentry };
