import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

let sdk: NodeSDK | null = null;

export function initializeOpenTelemetry() {
  // Skip if already initialized
  if (sdk) {
    return;
  }

  // Skip if not configured
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    console.warn('OpenTelemetry not configured. Distributed tracing disabled.');
    return;
  }

  const serviceName = process.env.OTEL_SERVICE_NAME || 'quemiai-backend';

  // Configure the trace exporter
  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  });

  // Create the SDK
  sdk = new NodeSDK({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: serviceName,
    }),
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable specific instrumentations if needed
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
      }),
    ],
  });

  // Start the SDK
  sdk.start();

  console.log('OpenTelemetry distributed tracing initialized');

  // Gracefully shut down the SDK on process exit
  process.on('SIGTERM', () => {
    sdk
      ?.shutdown()
      .then(() => console.log('OpenTelemetry SDK shut down successfully'))
      .catch((error) => console.error('Error shutting down OpenTelemetry SDK', error))
      .finally(() => process.exit(0));
  });
}

export function getOpenTelemetrySDK() {
  return sdk;
}
