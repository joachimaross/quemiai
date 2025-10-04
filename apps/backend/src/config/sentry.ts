import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

/**
 * Initialize Sentry for error tracking and performance monitoring
 * This should be called as early as possible in the application lifecycle
 */
export function initializeSentry() {
  const sentryDsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';
  const release = process.env.APP_VERSION || 'unknown';

  // Skip initialization if DSN is not configured
  if (!sentryDsn) {
    console.log('⚠️  Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment,
    release,
    
    // Performance monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Integrations
    integrations: [
      // Node profiling
      nodeProfilingIntegration(),
    ],
    
    // Error filtering
    beforeSend(event, hint) {
      // Don't send errors in development unless explicitly enabled
      if (environment === 'development' && !process.env.SENTRY_DEBUG) {
        return null;
      }
      
      // Filter out expected errors
      const error = hint.originalException;
      if (error instanceof Error) {
        // Don't send validation errors
        if (error.message.includes('validation')) {
          return null;
        }
        
        // Don't send 404 errors
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          return null;
        }
      }
      
      return event;
    },
    
    // Additional configuration
    maxBreadcrumbs: 50,
    attachStacktrace: true,
  });

  console.log(`✅ Sentry initialized for environment: ${environment}`);
}

/**
 * Capture an exception with Sentry
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}

/**
 * Capture a message with Sentry
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add custom tags to error reports
 */
export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    data,
    timestamp: Date.now() / 1000,
  });
}
