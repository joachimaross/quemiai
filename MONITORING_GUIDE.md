# Monitoring Guide

This guide provides comprehensive information on monitoring, observability, and metrics for the Quemiai platform.

## Table of Contents

- [Health Check Endpoints](#health-check-endpoints)
- [Prometheus Metrics](#prometheus-metrics)
- [Grafana Dashboards](#grafana-dashboards)
- [Log Aggregation](#log-aggregation)
- [Alerting Best Practices](#alerting-best-practices)

## Health Check Endpoints

The application provides three health check endpoints for different use cases:

### GET /health

Basic health check that returns application status and uptime.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

**Use Case:** Basic monitoring to verify the application is running.

### GET /health/live

Liveness probe for Kubernetes/Docker deployments. This is a quick check that confirms the process is responsive.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

**Use Case:** Container orchestration platforms (Kubernetes, Docker Swarm) use this to determine if the container should be restarted.

### GET /health/ready

Readiness probe that checks critical dependencies (Redis, database, etc.).

**Response (200 OK when ready):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "checks": {
    "redis": {
      "status": "ok",
      "latency": 5
    }
  }
}
```

**Response (503 Service Unavailable when not ready):**
```json
{
  "status": "error",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "checks": {
    "redis": {
      "status": "error",
      "message": "Redis client not connected"
    }
  }
}
```

**Use Case:** Container orchestration platforms use this to determine if the container should receive traffic.

### Kubernetes Configuration Example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: quemiai
spec:
  containers:
  - name: app
    image: quemiai:latest
    livenessProbe:
      httpGet:
        path: /health/live
        port: 4000
      initialDelaySeconds: 15
      periodSeconds: 20
      timeoutSeconds: 5
      failureThreshold: 3
    readinessProbe:
      httpGet:
        path: /health/ready
        port: 4000
      initialDelaySeconds: 5
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3
```

## Prometheus Metrics

The application exposes Prometheus metrics at the `/metrics` endpoint.

### Available Metrics

#### HTTP Metrics

- **http_requests_total**: Counter - Total number of HTTP requests
  - Labels: `method`, `route`, `status_code`
  
- **http_request_duration_seconds**: Histogram - Duration of HTTP requests
  - Labels: `method`, `route`, `status_code`
  - Buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5]

- **errors_total**: Counter - Total number of errors
  - Labels: `type`, `route`

#### WebSocket Metrics

- **websocket_connections_active**: Gauge - Number of active WebSocket connections

- **websocket_messages_total**: Counter - Total number of WebSocket messages
  - Labels: `type`, `event`

- **websocket_message_duration_seconds**: Histogram - Duration of WebSocket message processing
  - Labels: `event`
  - Buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]

#### Default Node.js Metrics

The application also exports default Node.js metrics including:
- CPU usage
- Memory usage (heap and RSS)
- Event loop lag
- Garbage collection statistics
- Active handles and requests

### Example Prometheus Queries

**Average request duration (p95):**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**Request rate by endpoint:**
```promql
sum(rate(http_requests_total[5m])) by (route, method)
```

**Error rate:**
```promql
sum(rate(http_requests_total{status_code=~"5.."}[5m]))
```

**Active WebSocket connections:**
```promql
websocket_connections_active
```

## Grafana Dashboards

Pre-configured Grafana dashboard templates are available in `docs/monitoring/grafana-dashboards/`:

### 1. API Overview Dashboard (`api-overview.json`)

Displays comprehensive API performance metrics:
- Request rate (requests/sec)
- Request latency percentiles (p50, p95, p99)
- Error rates (4xx and 5xx)
- Top endpoints by request count
- Status code distribution
- Slowest endpoints

### 2. WebSocket Metrics Dashboard (`websocket-metrics.json`)

Monitors real-time WebSocket performance:
- Active WebSocket connections
- Message rate by event type
- Message processing latency
- Message distribution by event

### 3. System Metrics Dashboard (`system-metrics.json`)

Tracks system resources and Node.js performance:
- CPU usage
- Memory usage (total and heap)
- Event loop lag
- Heap size utilization
- Garbage collection activity
- Active handles

### Importing Dashboards

1. **Using Grafana UI:**
   - Navigate to Dashboards → Import
   - Click "Upload JSON file"
   - Select one of the dashboard JSON files
   - Configure data source (Prometheus)
   - Click Import

2. **Using Grafana API:**
   ```bash
   curl -X POST http://localhost:3000/api/dashboards/db \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -d @docs/monitoring/grafana-dashboards/api-overview.json
   ```

### Setting Up Grafana with Docker

```yaml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana

volumes:
  grafana-storage:
```

**prometheus.yml:**
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'quemiai'
    static_configs:
      - targets: ['host.docker.internal:4000']
```

## Log Aggregation

The application uses Pino for structured JSON logging. Several log aggregation options are available:

### Option 1: ELK Stack (Elasticsearch, Logstash, Kibana)

**Benefits:**
- Self-hosted solution
- Full control over data
- Powerful search and visualization

**Setup Steps:**

1. **Install Elasticsearch:**
   ```bash
   docker run -d --name elasticsearch \
     -p 9200:9200 \
     -e "discovery.type=single-node" \
     elasticsearch:8.x
   ```

2. **Install Logstash:**
   ```bash
   docker run -d --name logstash \
     -p 5000:5000 \
     -v ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf \
     logstash:8.x
   ```

   **logstash.conf:**
   ```
   input {
     tcp {
       port => 5000
       codec => json
     }
   }

   filter {
     json {
       source => "message"
     }
   }

   output {
     elasticsearch {
       hosts => ["elasticsearch:9200"]
       index => "quemiai-logs-%{+YYYY.MM.dd}"
     }
   }
   ```

3. **Install Kibana:**
   ```bash
   docker run -d --name kibana \
     -p 5601:5601 \
     -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" \
     kibana:8.x
   ```

4. **Configure Pino transport:** Update your logger configuration to send logs to Logstash.

### Option 2: Logtail (SaaS)

**Benefits:**
- Easy setup
- Managed service
- Built-in alerting

**Setup:**

1. Sign up at [logtail.com](https://logtail.com)
2. Install the Pino transport:
   ```bash
   npm install @logtail/pino
   ```
3. Update logger configuration:
   ```typescript
   import { createPinoLogger } from '@logtail/pino';
   
   const logger = createPinoLogger(process.env.LOGTAIL_SOURCE_TOKEN);
   ```

### Option 3: Datadog Logs

**Benefits:**
- Full observability platform
- Correlates logs, metrics, and traces
- Advanced analytics

**Setup:**

1. Install Datadog agent
2. Configure log forwarding in `datadog.yaml`:
   ```yaml
   logs_enabled: true
   logs_config:
     container_collect_all: true
   ```
3. Tag your logs with `service:quemiai` for filtering

### Correlation IDs

The application should implement correlation IDs to trace requests across services. Add a middleware to generate and attach correlation IDs to all logs.

**Example implementation:**
```typescript
import { v4 as uuidv4 } from 'uuid';

export function correlationIdMiddleware(req, res, next) {
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('x-correlation-id', req.correlationId);
  
  // Add to logger context
  req.log = logger.child({ correlationId: req.correlationId });
  next();
}
```

## Alerting Best Practices

### Recommended Alerts

#### Critical Alerts (Page immediately)

1. **High Error Rate:**
   ```promql
   rate(http_requests_total{status_code=~"5.."}[5m]) > 0.01
   ```

2. **Service Down:**
   ```promql
   up{job="quemiai"} == 0
   ```

3. **High Latency:**
   ```promql
   histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
   ```

#### Warning Alerts (Investigate during business hours)

1. **Elevated Error Rate:**
   ```promql
   rate(http_requests_total{status_code=~"4.."}[5m]) > 0.05
   ```

2. **Memory Usage High:**
   ```promql
   process_resident_memory_bytes / 1024 / 1024 > 1024
   ```

3. **Event Loop Lag:**
   ```promql
   nodejs_eventloop_lag_seconds > 0.1
   ```

### Alert Configuration (Prometheus AlertManager)

**alerts.yml:**
```yaml
groups:
  - name: quemiai
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/sec"
      
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High API latency detected"
          description: "P95 latency is {{ $value }}s"
```

## Monitoring Checklist

- [ ] Health check endpoints accessible
- [ ] Prometheus scraping metrics successfully
- [ ] Grafana dashboards imported and configured
- [ ] Log aggregation sending logs
- [ ] Alerts configured in AlertManager
- [ ] On-call rotation established
- [ ] Runbooks created for common issues
- [ ] Metrics retention configured
- [ ] Backup and disaster recovery tested