# Log Aggregation Guide

This guide provides detailed instructions for setting up log aggregation for the Quemiai platform.

## Overview

The Quemiai platform uses [Pino](https://getpino.io/) for structured JSON logging. This guide covers three popular log aggregation solutions:

1. **ELK Stack** - Self-hosted, open-source
2. **Logtail** - Managed SaaS solution
3. **Datadog** - Enterprise observability platform

## Current Logging Setup

The application uses Pino with the following configuration:

```typescript
// src/config/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
  base: {
    pid: process.pid,
    environment: process.env.NODE_ENV,
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});
```

## ELK Stack Setup

### Architecture

```
Application (Pino) → Filebeat → Logstash → Elasticsearch ← Kibana
```

### Step 1: Install Elasticsearch

Using Docker:

```bash
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -v elasticsearch-data:/usr/share/elasticsearch/data \
  elasticsearch:8.11.0
```

Verify installation:
```bash
curl http://localhost:9200
```

### Step 2: Install Kibana

Using Docker:

```bash
docker run -d \
  --name kibana \
  -p 5601:5601 \
  -e "ELASTICSEARCH_HOSTS=http://host.docker.internal:9200" \
  kibana:8.11.0
```

Access Kibana at: http://localhost:5601

### Step 3: Install Logstash

Create `logstash.conf`:

```conf
input {
  tcp {
    port => 5000
    codec => json_lines
  }
  file {
    path => "/var/log/quemiai/*.log"
    start_position => "beginning"
    codec => json
  }
}

filter {
  # Parse JSON logs
  if [msg] {
    mutate {
      rename => { "msg" => "message" }
    }
  }
  
  # Parse timestamps
  date {
    match => [ "time", "ISO8601" ]
    target => "@timestamp"
  }
  
  # Add custom fields
  mutate {
    add_field => {
      "[@metadata][index]" => "quemiai-logs-%{+YYYY.MM.dd}"
    }
  }
}

output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "%{[@metadata][index]}"
  }
  
  # For debugging
  stdout {
    codec => rubydebug
  }
}
```

Run Logstash:

```bash
docker run -d \
  --name logstash \
  -p 5000:5000 \
  -v $(pwd)/logstash.conf:/usr/share/logstash/pipeline/logstash.conf \
  logstash:8.11.0
```

### Step 4: Configure Application Logging

Update `src/config/logger.ts` for production:

```typescript
import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
  base: {
    pid: process.pid,
    environment: process.env.NODE_ENV,
    service: 'quemiai-api',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
```

For log forwarding to Logstash, pipe logs:

```bash
node dist/main.js | nc localhost 5000
```

Or use Filebeat (recommended for production).

### Step 5: Configure Kibana Index Pattern

1. Open Kibana at http://localhost:5601
2. Go to Management → Stack Management → Index Patterns
3. Create index pattern: `quemiai-logs-*`
4. Select `@timestamp` as the time field
5. Click "Create index pattern"

### Step 6: Create Kibana Dashboards

**Useful Searches:**

- All errors: `level:50 OR level:60`
- Specific route errors: `req.url:"/api/users" AND level:50`
- Slow requests: `responseTime:>1000`

**Sample Dashboard Visualizations:**

1. **Log Level Distribution** (Pie Chart)
   - Aggregation: Terms
   - Field: level.keyword

2. **Error Rate Over Time** (Line Chart)
   - X-axis: Date Histogram (@timestamp)
   - Y-axis: Count
   - Filter: level >= 50

3. **Top Error Messages** (Data Table)
   - Aggregation: Terms
   - Field: msg.keyword
   - Filter: level >= 50

### Log Retention

Configure index lifecycle management:

```bash
PUT _ilm/policy/quemiai-logs-policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "50GB",
            "max_age": "7d"
          }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

## Logtail Setup (SaaS)

### Step 1: Sign Up and Get Source Token

1. Sign up at https://logtail.com
2. Create a new source
3. Copy your source token

### Step 2: Install Logtail Pino Transport

```bash
npm install @logtail/pino
```

### Step 3: Configure Logger

Update `src/config/logger.ts`:

```typescript
import pino from 'pino';
import { createWriteStream } from '@logtail/pino';

const stream = createWriteStream(process.env.LOGTAIL_SOURCE_TOKEN);

const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    base: {
      environment: process.env.NODE_ENV,
      service: 'quemiai-api',
    },
  },
  stream
);

export default logger;
```

### Step 4: Set Environment Variable

```bash
LOGTAIL_SOURCE_TOKEN=your_source_token_here
```

### Step 5: View Logs

Logs will automatically appear in your Logtail dashboard at https://logtail.com/app/sources

### Features

- **Live Tail**: Real-time log streaming
- **Search**: Full-text search with filters
- **Alerts**: Set up alerts based on log patterns
- **Retention**: Configurable (14-90 days depending on plan)

### Sample Queries

```
level:error
correlationId:"abc-123"
req.method:POST AND responseTime:>1000
```

## Datadog Logs Setup

### Step 1: Install Datadog Agent

**Using Docker:**

```bash
docker run -d \
  --name dd-agent \
  -e DD_API_KEY=<YOUR_API_KEY> \
  -e DD_LOGS_ENABLED=true \
  -e DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL=true \
  -e DD_SITE="datadoghq.com" \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /proc/:/host/proc/:ro \
  -v /sys/fs/cgroup/:/host/sys/fs/cgroup:ro \
  -v /opt/datadog-agent/run:/opt/datadog-agent/run:rw \
  datadog/agent:latest
```

**Native Installation (Ubuntu):**

```bash
DD_API_KEY=<YOUR_API_KEY> DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script_agent7.sh)"
```

### Step 2: Configure Log Collection

Edit `/etc/datadog-agent/conf.d/nodejs.d/conf.yaml`:

```yaml
logs:
  - type: file
    path: /var/log/quemiai/*.log
    service: quemiai-api
    source: nodejs
    sourcecategory: sourcecode
    tags:
      - env:production
```

Or use Docker labels:

```yaml
version: '3'
services:
  app:
    image: quemiai:latest
    labels:
      com.datadoghq.ad.logs: '[{"source": "nodejs", "service": "quemiai-api"}]'
```

### Step 3: Configure Application Logger

Update logger to output in JSON format (already configured):

```typescript
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: 'quemiai-api',
    environment: process.env.NODE_ENV,
  },
});
```

### Step 4: View Logs in Datadog

1. Navigate to https://app.datadoghq.com/logs
2. Filter by `service:quemiai-api`
3. Create log pipelines for parsing and enrichment

### Step 5: Create Log-Based Metrics

Convert logs to metrics for better alerting:

1. Go to Logs → Generate Metrics
2. Define metric from log pattern
3. Example: Count of 5xx errors

### Sample Queries

```
service:quemiai-api status:error
@http.status_code:>=500
@correlationId:abc-123
```

### Integration with APM

Datadog automatically correlates logs with traces when using `dd-trace`:

```bash
npm install dd-trace
```

```typescript
// At the top of main.ts
import tracer from 'dd-trace';
tracer.init({
  service: 'quemiai-api',
  env: process.env.NODE_ENV,
});
```

## Correlation IDs

### Implementation

Create middleware to add correlation IDs:

```typescript
// src/middleware/correlation-id.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
    
    req['correlationId'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    
    next();
  }
}
```

Register in `app.module.ts`:

```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware)
      .forRoutes('*');
  }
}
```

### Usage in Logs

Update logger calls to include correlation ID:

```typescript
logger.info({ correlationId: req['correlationId'] }, 'Processing request');
```

### Tracing Across Services

When making HTTP requests to other services, propagate the correlation ID:

```typescript
axios.get('https://api.example.com', {
  headers: {
    'x-correlation-id': req['correlationId'],
  },
});
```

## Log Levels

Use appropriate log levels:

- **trace (10)**: Very detailed, typically disabled in production
- **debug (20)**: Detailed information for debugging
- **info (30)**: General informational messages
- **warn (40)**: Warning messages, potential issues
- **error (50)**: Error messages, handled errors
- **fatal (60)**: Fatal errors, unrecoverable

Example:

```typescript
logger.trace('Detailed debugging info');
logger.debug('Debug information');
logger.info('User logged in');
logger.warn('Rate limit approaching');
logger.error({ err: error }, 'Failed to process request');
logger.fatal('Database connection lost');
```

## Environment-Specific Configuration

```typescript
const LOG_LEVELS = {
  development: 'debug',
  staging: 'info',
  production: 'warn',
};

const logger = pino({
  level: process.env.LOG_LEVEL || LOG_LEVELS[process.env.NODE_ENV] || 'info',
});
```

## Best Practices

1. **Always log in JSON format** for easy parsing
2. **Include context** in logs (userId, correlationId, etc.)
3. **Use structured logging** instead of string concatenation
4. **Avoid logging sensitive data** (passwords, tokens, PII)
5. **Set appropriate log retention** based on compliance requirements
6. **Monitor log volume** to control costs
7. **Use log sampling** for high-volume endpoints
8. **Create alerts** for critical log patterns
9. **Document log schemas** for consistent formatting
10. **Implement log rotation** for file-based logging

## Common Log Queries

### Find Failed Requests
```
level:error AND req.url:*
```

### Find Slow Queries
```
responseTime:>1000
```

### Find Specific User Activity
```
userId:"123" AND msg:*
```

### Find All 5xx Errors
```
res.statusCode:>=500
```

## Troubleshooting

### Logs Not Appearing in Elasticsearch

1. Check Logstash is running: `docker ps | grep logstash`
2. Check Logstash logs: `docker logs logstash`
3. Verify connectivity: `telnet localhost 5000`
4. Check Elasticsearch indices: `curl localhost:9200/_cat/indices`

### High Log Volume

1. Increase log level to `warn` or `error`
2. Implement log sampling for high-frequency endpoints
3. Configure log filtering in Logstash
4. Set up log archival and deletion policies

### Missing Correlation IDs

1. Ensure middleware is registered for all routes
2. Check middleware order in app configuration
3. Verify header propagation in HTTP clients

## Monitoring Log System Health

Set up alerts for:

- Log ingestion rate drops suddenly
- Error log rate spikes
- Disk space on log storage
- Elasticsearch cluster health
- Logstash processing lag

---

**Next Steps:**
1. Choose a log aggregation solution
2. Set up the infrastructure
3. Configure the application logger
4. Create useful dashboards
5. Set up critical alerts
6. Document common queries for your team
