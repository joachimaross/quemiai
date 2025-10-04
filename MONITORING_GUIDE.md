# Monitoring Guide

This guide provides comprehensive information on monitoring, observability, and error tracking for the Quemiai platform.

## Table of Contents

- [Health Endpoints](#health-endpoints)
- [Metrics & Prometheus](#metrics--prometheus)
- [Distributed Tracing with OpenTelemetry](#distributed-tracing-with-opentelemetry)
- [Error Tracking with Sentry](#error-tracking-with-sentry)
- [Structured Logging](#structured-logging)
- [Alerting](#alerting)
- [Dashboard Setup](#dashboard-setup)

---

## Health Endpoints

The application provides three health check endpoints for different use cases:

### `/health/live`
**Liveness Probe** - Checks if the application process is running.

- **Purpose**: Used by orchestrators (Kubernetes, ECS) to determine if the container should be restarted
- **Response**: Always returns 200 OK if the process is alive
- **Use Case**: Configure as liveness probe in K8s deployment

```bash
curl http://localhost:4000/health/live
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-10-04T12:00:00.000Z",
  "uptime": 123.456
}
```

### `/health/ready`
**Readiness Probe** - Checks if the application is ready to serve traffic.

- **Purpose**: Validates all critical dependencies (Database, Redis, AI services)
- **Response**: 200 if healthy, 503 if any dependency is unavailable
- **Use Case**: Configure as readiness probe in K8s deployment; used by load balancers

```bash
curl http://localhost:4000/health/ready
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-10-04T12:00:00.000Z",
  "checks": {
    "database": {
      "status": "healthy",
      "latency": 5
    },
    "redis": {
      "status": "healthy",
      "latency": 2
    },
    "aiService": {
      "status": "healthy",
      "details": "API key configured"
    }
  },
  "statusCode": 200
}
```

### `/health`
**Detailed Health Check** - Comprehensive system information.

- **Purpose**: Provides detailed health information including system metrics
- **Response**: Full health report with dependency checks and system info
- **Use Case**: Manual checks, debugging, monitoring dashboards

```bash
curl http://localhost:4000/health
```

---

## Metrics & Prometheus

### Metrics Endpoint

Prometheus-compatible metrics are exposed at:

```bash
GET /health/metrics
```

### Available Metrics

#### Default System Metrics (prefix: `quemiai_`)
- `process_cpu_user_seconds_total` - CPU time spent in user mode
- `process_cpu_system_seconds_total` - CPU time spent in system mode
- `process_resident_memory_bytes` - Resident memory size
- `process_heap_bytes` - Heap size
- `nodejs_gc_duration_seconds` - Garbage collection duration

#### HTTP Metrics
- `quemiai_http_requests_total` - Total number of HTTP requests
  - Labels: `method`, `route`, `status_code`
- `quemiai_http_request_duration_seconds` - HTTP request duration histogram
  - Labels: `method`, `route`, `status_code`
- `quemiai_http_requests_in_progress` - Active HTTP requests
  - Labels: `method`, `route`

#### Database Metrics
- `quemiai_database_query_duration_seconds` - Database query duration
  - Labels: `operation`, `table`
- `quemiai_database_connections_active` - Active database connections

#### WebSocket Metrics
- `quemiai_websocket_connections` - Active WebSocket connections
- `quemiai_websocket_messages_total` - Total WebSocket messages
  - Labels: `type`, `direction`

#### Business Metrics
- `quemiai_active_users` - Number of currently active users
- `quemiai_api_errors_total` - Total API errors
  - Labels: `type`, `endpoint`

### Prometheus Configuration

Add this job to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'quemiai-backend'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:4000']
    metrics_path: '/health/metrics'
```

### Grafana Dashboard

Import the provided Grafana dashboard or create custom panels:

**Key Panels:**
1. Request Rate (requests/sec)
2. Request Duration (p50, p95, p99)
3. Error Rate (4xx, 5xx)
4. Active Connections
5. Database Query Performance
6. System Resources (CPU, Memory)

---

## Distributed Tracing with OpenTelemetry

OpenTelemetry provides distributed tracing to track requests across services.

### Configuration

Set these environment variables:

```env
# Enable/disable tracing
OTEL_SDK_DISABLED=false

# Service identification
OTEL_SERVICE_NAME=quemiai-backend
APP_VERSION=1.0.0

# Collector endpoint (Jaeger, Zipkin, or OTLP collector)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces

# Optional authentication
OTEL_EXPORTER_OTLP_HEADERS={"Authorization":"Bearer token"}
```

### Supported Backends

#### Jaeger (Recommended for Development)

```bash
# Run Jaeger all-in-one
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest

# Access UI at http://localhost:16686
```

#### Zipkin

```bash
docker run -d --name zipkin \
  -p 9411:9411 \
  openzipkin/zipkin:latest
```

Set `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:9411/api/v2/spans`

#### Cloud Providers
- **Google Cloud Trace**: Use Cloud Trace exporter
- **AWS X-Ray**: Use X-Ray exporter
- **Azure Monitor**: Use Azure Monitor exporter
- **Datadog**: Use Datadog exporter

### Automatic Instrumentation

OpenTelemetry automatically instruments:
- HTTP/HTTPS requests
- Database queries (Prisma)
- External API calls
- Redis operations

### Manual Instrumentation

For custom spans:

```typescript
import { createSpan } from './config/opentelemetry';

async function myOperation() {
  return createSpan('myOperation', async () => {
    // Your operation logic
    return result;
  });
}
```

---

## Error Tracking with Sentry

Sentry provides real-time error tracking and performance monitoring.

### Setup

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new Node.js project
3. Copy the DSN and add to environment:

```env
SENTRY_DSN=https://your_key@sentry.io/your_project_id
SENTRY_DEBUG=false
APP_VERSION=1.0.0
NODE_ENV=production
```

### Features Enabled

- **Automatic Error Capture**: Uncaught exceptions and unhandled rejections
- **Performance Monitoring**: Transaction traces with 10% sampling in production
- **Breadcrumbs**: Console logs and HTTP requests
- **Release Tracking**: Track errors by version
- **Environment Tagging**: Separate dev/staging/production errors

### Error Context

The application automatically adds:
- Request context (URL, method, headers)
- User context (if authenticated)
- Environment information
- Stack traces with source maps

### Manual Error Capture

```typescript
import { captureException, captureMessage, setUserContext } from './config/sentry';

// Capture exception
try {
  // risky operation
} catch (error) {
  captureException(error, { extra: { context: 'additional info' }});
}

// Capture message
captureMessage('Something interesting happened', 'info');

// Set user context
setUserContext({ id: 'user123', email: 'user@example.com' });
```

### Performance Monitoring

Sentry automatically tracks:
- HTTP request durations
- Database query performance
- External API call latency

Sample rate is configured at 10% in production to balance visibility and cost.

---

## Structured Logging

The application uses Pino for structured JSON logging with correlation IDs.

### Log Levels

- `error`: Errors that need immediate attention
- `warn`: Warning conditions
- `info`: Informational messages
- `debug`: Debug-level messages
- `verbose`: Verbose output

### Log Format

```json
{
  "level": "info",
  "time": 1633024800000,
  "msg": "HTTP request",
  "method": "GET",
  "url": "/api/users",
  "statusCode": 200,
  "duration": 45,
  "traceId": "abc123",
  "userId": "user123"
}
```

### Configuration

Set log level via environment:

```env
LOG_LEVEL=info
```

---

## Alerting

### Recommended Alerts

#### Critical Alerts (PagerDuty/Opsgenie)

1. **Application Down**
   - Condition: `/health/live` returns non-200 for 2 minutes
   - Action: Page on-call engineer

2. **High Error Rate**
   - Condition: Error rate > 5% for 5 minutes
   - Action: Page on-call engineer

3. **Database Connection Failure**
   - Condition: Database health check fails for 1 minute
   - Action: Page on-call engineer

#### Warning Alerts (Slack/Email)

1. **High Response Time**
   - Condition: P95 latency > 2 seconds for 10 minutes
   - Action: Notify team channel

2. **Memory Usage**
   - Condition: Memory usage > 80% for 10 minutes
   - Action: Notify team channel

3. **Failed Deployments**
   - Condition: Deployment health checks fail
   - Action: Notify deployment channel

### Prometheus Alerting Rules

Example `alert.rules.yml`:

```yaml
groups:
  - name: quemiai
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(quemiai_http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          
      - alert: SlowRequests
        expr: histogram_quantile(0.95, rate(quemiai_http_request_duration_seconds_bucket[5m])) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "95th percentile latency is high"
```

---

## Dashboard Setup

### Kubernetes Dashboard

```yaml
apiVersion: v1
kind: Service
metadata:
  name: quemiai-backend
  labels:
    app: quemiai-backend
spec:
  ports:
    - port: 4000
      name: http
    - port: 9090
      name: metrics
  selector:
    app: quemiai-backend

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quemiai-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: backend
          image: quemiai/backend:latest
          ports:
            - containerPort: 4000
              name: http
          livenessProbe:
            httpGet:
              path: /health/live
              port: 4000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 4000
            initialDelaySeconds: 10
            periodSeconds: 5
          env:
            - name: SENTRY_DSN
              valueFrom:
                secretKeyRef:
                  name: monitoring-secrets
                  key: sentry-dsn
```

### Docker Compose Example

```yaml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "4318:4318"
```

---

## Best Practices

1. **Set up alerts before going to production**
2. **Test health checks regularly**
3. **Monitor error budgets** (target: 99.9% uptime)
4. **Review Sentry errors daily**
5. **Use distributed tracing for debugging**
6. **Set up log aggregation** (ELK, Datadog, Logtail)
7. **Create runbooks for common incidents**
8. **Regular load testing** to validate capacity
9. **Monitor business metrics** (signups, active users)
10. **Keep dashboards simple and actionable**

---

## Troubleshooting

### Health Check Fails

1. Check individual dependency health in `/health` response
2. Verify database connectivity: `psql $DATABASE_URL`
3. Verify Redis: `redis-cli -u $REDIS_URL ping`
4. Check logs for connection errors

### Metrics Not Appearing

1. Verify Prometheus can reach `/health/metrics`
2. Check `prometheus.yml` configuration
3. Verify network policies allow scraping
4. Check Prometheus targets status

### Traces Not Showing

1. Verify `OTEL_SDK_DISABLED=false`
2. Check collector endpoint is reachable
3. Verify collector is running (Jaeger/Zipkin)
4. Check application logs for OTEL errors

### Sentry Not Reporting

1. Verify `SENTRY_DSN` is set correctly
2. Check `NODE_ENV=production` (dev errors filtered by default)
3. Verify network allows outbound to sentry.io
4. Enable `SENTRY_DEBUG=true` for diagnostics

---

## Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- [Sentry Node.js Guide](https://docs.sentry.io/platforms/node/)
- [Pino Logging](https://getpino.io/)
