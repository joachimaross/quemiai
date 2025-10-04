import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

/**
 * Initialize OpenTelemetry tracing for distributed tracing and observability
 * This should be called before any other imports to ensure proper instrumentation
 */
export function initializeOpenTelemetry() {
  const serviceName = process.env.OTEL_SERVICE_NAME || 'quemiai-backend';
  const serviceVersion = process.env.APP_VERSION || 'unknown';
  const environment = process.env.NODE_ENV || 'development';
  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';

  // Skip initialization if explicitly disabled
  if (process.env.OTEL_SDK_DISABLED === 'true') {
    console.log('⚠️  OpenTelemetry disabled via OTEL_SDK_DISABLED');
    return;
  }

  try {
    const sdk = new NodeSDK({
      resource: new Resource({
        [SEMRESATTRS_SERVICE_NAME]: serviceName,
        [SEMRESATTRS_SERVICE_VERSION]: serviceVersion,
        'deployment.environment': environment,
      }),
      traceExporter: new OTLPTraceExporter({
        url: otlpEndpoint,
        headers: {
          // Add any required headers (e.g., authentication tokens)
          ...(process.env.OTEL_EXPORTER_OTLP_HEADERS ? 
            JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS) : {}),
        },
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          // Customize instrumentation configuration
          '@opentelemetry/instrumentation-fs': {
            enabled: false, // Disable file system instrumentation to reduce noise
          },
          '@opentelemetry/instrumentation-http': {
            ignoreIncomingRequestHook: (request) => {
              // Ignore health check endpoints to reduce trace volume
              const url = request.url || '';
              return url.includes('/health');
            },
          },
        }),
      ],
    });

    // Start the SDK
    sdk.start();

    // Graceful shutdown
    process.on('SIGTERM', () => {
      sdk.shutdown()
        .then(() => console.log('OpenTelemetry SDK shut down successfully'))
        .catch((error) => console.error('Error shutting down OpenTelemetry SDK', error))
        .finally(() => process.exit(0));
    });

    console.log(`✅ OpenTelemetry initialized for service: ${serviceName}`);
    console.log(`   Export endpoint: ${otlpEndpoint}`);
  } catch (error) {
    console.error('Failed to initialize OpenTelemetry:', error);
    // Don't fail application startup if telemetry fails
  }
}

/**
 * Get the current trace context
 * Useful for adding trace IDs to logs
 */
export function getTraceContext() {
  try {
    const { trace, context } = require('@opentelemetry/api');
    const span = trace.getSpan(context.active());
    
    if (span) {
      const spanContext = span.spanContext();
      return {
        traceId: spanContext.traceId,
        spanId: spanContext.spanId,
        traceFlags: spanContext.traceFlags,
      };
    }
  } catch (error) {
    // Silently fail if OpenTelemetry is not available
  }
  
  return null;
}

/**
 * Create a custom span for manual instrumentation
 */
export function createSpan(name: string, fn: () => Promise<any>) {
  try {
    const { trace } = require('@opentelemetry/api');
    const tracer = trace.getTracer('quemiai-backend');
    
    return tracer.startActiveSpan(name, async (span) => {
      try {
        const result = await fn();
        span.end();
        return result;
      } catch (error) {
        span.recordException(error as Error);
        span.end();
        throw error;
      }
    });
  } catch (error) {
    // If OpenTelemetry is not available, just execute the function
    return fn();
  }
}
