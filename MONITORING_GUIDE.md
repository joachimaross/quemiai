# Monitoring & Observability Guide

This guide covers the comprehensive monitoring, logging, and observability setup for the Quemiai platform to ensure production readiness and operational excellence.

> **📋 Related Documentation:**
> - [DEPLOYMENT.md](DEPLOYMENT.md) - General deployment guide
> - [ROADMAP.md - PHASE 2.5](ROADMAP.md#phase-25-monitoring--observability) - Monitoring roadmap

## Table of Contents

- [Overview](#overview)
- [Health Endpoints](#health-endpoints)
- [Prometheus Metrics](#prometheus-metrics)
- [Sentry Error Tracking](#sentry-error-tracking)
- [Grafana Dashboards](#grafana-dashboards)
- [Log Aggregation](#log-aggregation)
- [Observability Best Practices](#observability-best-practices)
- [Alerting Strategy](#alerting-strategy)
- [Troubleshooting](#troubleshooting)

## Overview

### Why Monitoring Matters

Effective monitoring and observability are critical for:
- **Early Detection**: Identify issues before they impact users
- **Performance Optimization**: Track and improve application performance
- **Operational Insights**: Understand system behavior and usage patterns
- **Incident Response**: Quickly diagnose and resolve production issues
- **Capacity Planning**: Make informed decisions about scaling

### Monitoring Stack

The Quemiai platform uses a comprehensive monitoring stack:

- **Health Checks**: Built-in endpoints for liveness and readiness probes
- **Metrics**: Prometheus for metrics collection and storage
- **Visualization**: Grafana for dashboards and alerting
- **Error Tracking**: Sentry for error monitoring and debugging
- **Log Aggregation**: ELK Stack, Logtail, or Datadog for centralized logging
- **Distributed Tracing**: OpenTelemetry (planned)

## Health Endpoints

### Basic Health Check

**Endpoint:** `GET /health`

**Status:** ✅ Implemented

Returns basic application health status:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600.5,
  "environment": "production"
}
```

**Usage:**
```bash
curl http://localhost:4000/health
```

### Readiness Probe

**Endpoint:** `GET /health/ready`

**Status:** 🚧 Planned (See [ROADMAP.md - Health Checks](ROADMAP.md#health-checks))

Checks if the application is ready to accept traffic:

- Database connectivity
- Redis connectivity
- Critical dependencies availability

**Expected Response (Ready):**
```json
{
  "status": "ready",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "dependencies": "ok"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Expected Response (Not Ready):**
```json
{
  "status": "not_ready",
  "checks": {
    "database": "error",
    "redis": "ok",
    "dependencies": "ok"
  },
  "errors": ["Database connection timeout"],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
HTTP Status: `503 Service Unavailable`

### Liveness Probe

**Endpoint:** `GET /health/live`

**Status:** 🚧 Planned (See [ROADMAP.md - Health Checks](ROADMAP.md#health-checks))

Quick check for application responsiveness:

```json
{
  "status": "alive",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Kubernetes/Docker Configuration

**Docker Health Check:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1
```

**Kubernetes Probes:**
```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 4000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health/ready
    port: 4000
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

## Prometheus Metrics

### Overview

Prometheus is used for metrics collection, storage, and querying.

**Status:** 🚧 Planned (See [ROADMAP.md - Prometheus Metrics](ROADMAP.md#prometheus-metrics))

### Installation

```bash
npm install @willsoto/nestjs-prometheus prom-client
```

### Metrics Endpoint

**Endpoint:** `GET /metrics`

Exposes metrics in Prometheus format for scraping.

### Available Metrics

#### Default Metrics

- `process_cpu_user_seconds_total` - CPU time in user mode
- `process_cpu_system_seconds_total` - CPU time in system mode
- `process_resident_memory_bytes` - Resident memory size
- `nodejs_eventloop_lag_seconds` - Event loop lag
- `nodejs_heap_size_total_bytes` - Total heap size
- `nodejs_heap_size_used_bytes` - Used heap size

#### Custom HTTP Metrics

- `http_request_total` - Total HTTP requests by method, endpoint, and status
- `http_request_duration_seconds` - Request duration histogram
  - Labels: `method`, `endpoint`, `status_code`
  - Buckets: 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10

#### WebSocket Metrics

- `websocket_connections_total` - Total active WebSocket connections
- `websocket_messages_sent_total` - Total messages sent
- `websocket_messages_received_total` - Total messages received
- `websocket_errors_total` - Total WebSocket errors

#### Database Metrics

- `database_query_duration_seconds` - Database query duration histogram
- `database_connections_active` - Active database connections
- `database_connections_idle` - Idle database connections

#### Redis Metrics

- `redis_operation_duration_seconds` - Redis operation duration histogram
- `redis_connections_active` - Active Redis connections

#### Error Metrics

- `errors_total` - Total errors by type and severity

### Prometheus Configuration

**prometheus.yml:**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'quemiai-backend'
    static_configs:
      - targets: ['localhost:4000']
    metrics_path: '/metrics'
```

### Running Prometheus

**Using Docker:**
```bash
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

**Access:** http://localhost:9090

## Sentry Error Tracking

### Overview

Sentry provides real-time error tracking, crash reporting, and performance monitoring.

**Status:** 🚧 Planned (See [ROADMAP.md - Error Tracking](ROADMAP.md#observability-best-practices))

### Setup

1. **Create Sentry Account:**
   - Sign up at https://sentry.io
   - Create a new project for Node.js/NestJS

2. **Install Sentry SDK:**
```bash
npm install @sentry/node @sentry/tracing
```

3. **Configure Sentry:**

```typescript
// src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // Adjust in production
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
  ],
});
```

4. **Add to Environment:**
```env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Error Tracking Features

#### Automatic Error Capture

Sentry automatically captures:
- Unhandled exceptions
- Unhandled promise rejections
- HTTP errors (4xx, 5xx)

#### Manual Error Capture

```typescript
try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      module: 'chat',
      action: 'send_message',
    },
    extra: {
      userId: user.id,
      messageId: message.id,
    },
  });
}
```

#### Performance Monitoring

```typescript
const transaction = Sentry.startTransaction({
  op: 'database.query',
  name: 'getUserById',
});

try {
  const user = await this.userRepository.findOne(id);
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

### Best Practices

- **Set Release Versions**: Tag errors with release version
- **User Context**: Attach user information to errors
- **Custom Tags**: Use tags for filtering and grouping
- **Error Sampling**: Configure sampling rates for high-traffic applications
- **Alert Rules**: Set up alerts for critical errors

### Alerting Rules

Configure Sentry alerts for:
- New error types
- Error rate spikes (e.g., >10 errors/minute)
- Critical errors in production
- Performance degradation

## Grafana Dashboards

### Overview

Grafana provides visualization and alerting for Prometheus metrics.

**Status:** 🚧 Planned (See [ROADMAP.md - Grafana Dashboard](ROADMAP.md#grafana-dashboard))

### Installation

**Using Docker:**
```bash
docker run -d \
  --name=grafana \
  -p 3000:3000 \
  grafana/grafana
```

**Using Docker Compose:**
```yaml
version: '3.8'
services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning

volumes:
  grafana-storage:
```

**Access:** http://localhost:3000 (default credentials: admin/admin)

### Data Source Configuration

1. **Add Prometheus Data Source:**
   - Navigate to Configuration → Data Sources
   - Add Prometheus
   - URL: `http://prometheus:9090` (if using Docker)
   - Save & Test

### Dashboard Templates

#### API Overview Dashboard

**Metrics:**
- Request Rate (requests/second)
- Error Rate (errors/second, % of total)
- Response Time (p50, p95, p99)
- Status Code Distribution

**Panels:**
1. Request Rate Timeline
2. Error Rate Timeline
3. Response Time Percentiles
4. Status Code Pie Chart
5. Top Endpoints by Request Count
6. Slowest Endpoints

**PromQL Queries:**
```promql
# Request Rate
rate(http_request_total[5m])

# Error Rate
rate(http_request_total{status_code=~"5.."}[5m])

# Response Time p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

#### WebSocket Metrics Dashboard

**Metrics:**
- Active Connections
- Messages Sent/Received Rate
- Connection Errors
- Message Latency

**Panels:**
1. Active Connections Timeline
2. Message Rate Timeline
3. Connection Errors Timeline
4. Message Latency Heatmap

#### System Metrics Dashboard

**Metrics:**
- CPU Usage
- Memory Usage
- Disk I/O
- Network Traffic
- Event Loop Lag

**Panels:**
1. CPU Usage Timeline
2. Memory Usage Timeline
3. Disk I/O Rate
4. Network Traffic Timeline
5. Event Loop Lag Timeline

#### Database Metrics Dashboard

**Metrics:**
- Query Duration (p50, p95, p99)
- Active Connections
- Connection Pool Usage
- Slow Queries (>1s)

**Panels:**
1. Query Duration Percentiles
2. Active Connections Timeline
3. Connection Pool Status
4. Slow Query Count

### Importing Dashboards

**Planned Deliverables:**
- `docs/monitoring/grafana-dashboards/api-overview.json`
- `docs/monitoring/grafana-dashboards/websocket-metrics.json`
- `docs/monitoring/grafana-dashboards/system-metrics.json`
- `docs/monitoring/grafana-dashboards/database-metrics.json`

**Import Steps:**
1. Navigate to Dashboards → Import
2. Upload JSON file or paste JSON
3. Select Prometheus data source
4. Click Import

### Alerting Configuration

**Alert Examples:**

1. **High Error Rate:**
```yaml
Alert: High Error Rate
Condition: rate(http_request_total{status_code=~"5.."}[5m]) > 10
For: 5m
Severity: Critical
```

2. **High Response Time:**
```yaml
Alert: Slow API Response
Condition: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
For: 10m
Severity: Warning
```

3. **Database Connection Pool Exhaustion:**
```yaml
Alert: Database Pool Full
Condition: database_connections_active / database_connections_max > 0.9
For: 5m
Severity: Critical
```

## Log Aggregation

### Overview

Centralized log aggregation enables efficient log search, analysis, and correlation across distributed systems.

**Status:** 🚧 Planned (See [ROADMAP.md - Log Aggregation](ROADMAP.md#log-aggregation))

### Current Logging Setup

The application uses **Pino** for structured JSON logging.

**Logger Configuration:**
```typescript
// src/config/logger.config.ts
import { LoggerService } from '@nestjs/common';
import * as pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});
```

### Log Aggregation Options

#### Option 1: ELK Stack (Elasticsearch, Logstash, Kibana)

**Architecture:**
```
Application (Pino) → Logstash → Elasticsearch → Kibana
```

**Installation (Docker Compose):**
```yaml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logstash/config:/usr/share/logstash/config
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    ports:
      - "5000:5000"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

volumes:
  elasticsearch-data:
```

**Logstash Configuration:**
```ruby
# logstash/pipeline/logstash.conf
input {
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  if [level] == "error" {
    mutate {
      add_tag => ["error"]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "quemiai-logs-%{+YYYY.MM.dd}"
  }
}
```

**Pino Transport Configuration:**
```typescript
import { pino } from 'pino';

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-socket',
    options: {
      address: 'localhost',
      port: 5000,
      mode: 'tcp',
    },
  },
});
```

**Kibana Configuration:**
1. Access Kibana at http://localhost:5601
2. Create index pattern: `quemiai-logs-*`
3. Set time field: `@timestamp`
4. Create visualizations and dashboards

#### Option 2: Logtail (SaaS Alternative)

**Setup:**

1. **Create Account:** https://logtail.com
2. **Get Source Token:** Create a new source for Node.js

3. **Install Logtail SDK:**
```bash
npm install @logtail/node @logtail/pino
```

4. **Configure Logger:**
```typescript
import { Logtail } from '@logtail/node';
import { PinoLogtail } from '@logtail/pino';

const logtail = new Logtail(process.env.LOGTAIL_TOKEN);

const logger = pino({
  level: 'info',
}, PinoLogtail.createWriteStream(logtail));
```

5. **Environment Variable:**
```env
LOGTAIL_TOKEN=your-logtail-source-token
```

**Features:**
- Real-time log streaming
- Powerful search and filtering
- Pre-built dashboards
- Alerting and notifications
- Log retention policies

#### Option 3: Datadog Logs

**Setup:**

1. **Install Datadog Agent:**
```bash
DD_API_KEY=your-api-key DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
```

2. **Configure Log Collection:**
```yaml
# /etc/datadog-agent/conf.d/nodejs.d/conf.yaml
logs:
  - type: file
    path: /var/log/quemiai/*.log
    service: quemiai-backend
    source: nodejs
```

3. **Pino File Output:**
```typescript
import { pino } from 'pino';

const logger = pino({
  level: 'info',
}, pino.destination('/var/log/quemiai/app.log'));
```

4. **Restart Datadog Agent:**
```bash
sudo systemctl restart datadog-agent
```

**Features:**
- APM integration
- Infrastructure metrics correlation
- Log analytics and patterns
- Advanced alerting
- Custom dashboards

### Log Structure

**Standard Log Format:**
```json
{
  "level": "info",
  "time": 1234567890123,
  "pid": 12345,
  "hostname": "server-01",
  "correlationId": "uuid-v4",
  "module": "chat",
  "action": "send_message",
  "userId": "user-123",
  "duration": 45,
  "msg": "Message sent successfully"
}
```

### Correlation IDs

**Planned Implementation:**
```typescript
// src/middleware/correlation-id.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    req.correlationId = req.headers['x-correlation-id'] || uuidv4();
    res.setHeader('x-correlation-id', req.correlationId);
    next();
  }
}
```

### Common Log Queries

**ELK/Kibana:**
```
# Find errors in last hour
level:error AND @timestamp:[now-1h TO now]

# Find slow requests (>1s)
duration:>1000

# Find logs for specific user
userId:"user-123"

# Find logs with correlation ID
correlationId:"uuid-value"
```

**Datadog:**
```
# Find errors in production
service:quemiai-backend env:production status:error

# Find slow database queries
@module:database @duration:>1000

# Find logs for specific user
@userId:user-123
```

### Log Retention Policies

**Recommended Policies:**
- **Production Logs**: 30-90 days
- **Error Logs**: 180 days
- **Audit Logs**: 1-7 years (compliance dependent)
- **Debug Logs**: 7-14 days

## Observability Best Practices

### Distributed Tracing

**Status:** 🚧 Planned (See [ROADMAP.md - Distributed Tracing](ROADMAP.md#observability-best-practices))

**OpenTelemetry Integration:**
```bash
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
```

**Configuration:**
```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: 'http://localhost:14268/api/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

### The Three Pillars

1. **Logs**: What happened?
   - Structured JSON logs with context
   - Correlation IDs for request tracing
   - Appropriate log levels

2. **Metrics**: How much and how fast?
   - Request rates and latencies
   - Error rates
   - Resource utilization

3. **Traces**: Where did time go?
   - End-to-end request flow
   - Service dependencies
   - Performance bottlenecks

### Golden Signals

Monitor these four key metrics:

1. **Latency**: Time to service requests
2. **Traffic**: Number of requests
3. **Errors**: Rate of failed requests
4. **Saturation**: Resource utilization

### Service Level Objectives (SLOs)

**Define SLOs for:**
- API Response Time: p95 < 200ms
- Error Rate: < 0.1%
- Availability: > 99.9% uptime
- WebSocket Latency: < 100ms

## Alerting Strategy

### Alert Levels

**Critical** (Immediate Response):
- Service down
- Error rate > 5%
- Database connection failures
- Memory/CPU exhaustion

**Warning** (Response within 30 minutes):
- Error rate > 1%
- p95 latency > 500ms
- Disk space > 80%
- Connection pool > 80% usage

**Info** (Response within 24 hours):
- Unusual traffic patterns
- Slow query detected
- Cache hit rate < 70%

### Alert Channels

Configure multiple notification channels:
- **Slack**: For team notifications
- **PagerDuty**: For on-call rotations
- **Email**: For non-critical alerts
- **SMS**: For critical production issues

### Alert Best Practices

1. **Avoid Alert Fatigue**: Only alert on actionable items
2. **Clear Context**: Include relevant metrics and links
3. **Escalation Policies**: Define response procedures
4. **Runbooks**: Document resolution steps
5. **Alert Grouping**: Group related alerts
6. **Silence Periods**: During maintenance windows

## Troubleshooting

### Common Issues

#### Prometheus Not Scraping

**Symptoms:**
- No metrics in Grafana
- Empty Prometheus targets

**Solutions:**
1. Check `/metrics` endpoint is accessible
2. Verify Prometheus configuration
3. Check firewall rules
4. Review Prometheus logs

#### Sentry Not Capturing Errors

**Symptoms:**
- No errors in Sentry dashboard
- Integration not working

**Solutions:**
1. Verify SENTRY_DSN is correct
2. Check network connectivity
3. Verify error sampling rate
4. Review Sentry SDK initialization

#### Logs Not Appearing

**Symptoms:**
- Missing logs in aggregation system
- Log gaps or delays

**Solutions:**
1. Verify log transport configuration
2. Check network connectivity to log aggregator
3. Review log level configuration
4. Check disk space on logger

#### High Cardinality Metrics

**Symptoms:**
- Prometheus performance issues
- High memory usage

**Solutions:**
1. Reduce label cardinality
2. Use metric relabeling
3. Increase Prometheus resources
4. Consider metric aggregation

### Getting Help

For monitoring and observability issues:

1. **Check Documentation**: Review this guide and related documentation
2. **Review Logs**: Start with application and service logs
3. **Community Support**: Consult tool-specific communities (Prometheus, Grafana, Sentry)
4. **GitHub Issues**: Report bugs or request features
5. **Professional Support**: Consider commercial support for critical systems

## Next Steps

1. **Implement Enhanced Health Checks**: Add `/health/ready` and `/health/live` endpoints
2. **Set Up Prometheus**: Install and configure metrics collection
3. **Create Grafana Dashboards**: Build visualization dashboards
4. **Configure Sentry**: Set up error tracking
5. **Choose Log Aggregation**: Select and implement log aggregation solution
6. **Define Alerts**: Create alerting rules based on SLOs
7. **Document Runbooks**: Create incident response procedures

---

**For implementation details and timelines, see [ROADMAP.md - PHASE 2.5](ROADMAP.md#phase-25-monitoring--observability)**

**Last Updated:** 2024-01-01  
**Status:** Living Document - Updated as features are implemented
