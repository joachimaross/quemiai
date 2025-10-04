# Production Readiness Guide

This guide consolidates all production best practices, security measures, and operational requirements for deploying and maintaining Quemiai in a production environment.

## Table of Contents

1. [Security](#security)
2. [Observability & Monitoring](#observability--monitoring)
3. [Infrastructure & Deployment](#infrastructure--deployment)
4. [Database & Connection Management](#database--connection-management)
5. [WebSocket & Real-time Communication](#websocket--real-time-communication)
6. [Performance & Scalability](#performance--scalability)
7. [Error Handling & Resilience](#error-handling--resilience)
8. [Compliance & Data Protection](#compliance--data-protection)
9. [CI/CD & Automation](#cicd--automation)
10. [Incident Response](#incident-response)

---

## Security

### Environment Variables

**Critical**: Never commit secrets to version control. Use `.env.example` files as templates.

#### Backend Environment Variables

Create `apps/backend/.env` from `.env.example`:

```bash
cp apps/backend/.env.example apps/backend/.env
```

**Required Production Variables:**
- `DATABASE_URL`: PostgreSQL connection string with SSL enabled
- `JWT_SECRET`: Strong random secret (minimum 32 characters)
- `REDIS_URL`: Redis connection string
- `SENTRY_DSN`: Sentry project DSN for error tracking
- `OTEL_EXPORTER_OTLP_ENDPOINT`: OpenTelemetry collector endpoint

**Security Best Practices:**
- Use strong, randomly generated secrets
- Rotate JWT secrets periodically
- Store secrets in secure vault services (AWS Secrets Manager, Azure Key Vault, etc.)
- Use different secrets for each environment
- Enable SSL/TLS for all database connections

### Pre-commit Hooks

Pre-commit hooks automatically scan for secrets before commits:

```bash
# Install git-secrets (macOS)
brew install git-secrets

# Install git-secrets (Linux)
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
make install

# Initialize git-secrets
cd /path/to/quemiai
git secrets --install
git secrets --register-aws
```

The `.husky/pre-commit` hook runs:
- Secret scanning with git-secrets
- Linting checks
- Code quality validation

### Authentication & Authorization

#### JWT Authentication

**Configuration:**
- Token expiration: 7 days (configurable via `JWT_EXPIRES_IN`)
- Refresh tokens: Implement for enhanced security
- Token revocation: Use Redis for token blacklisting

#### Role-Based Access Control (RBAC)

Use centralized guards for authorization:

```typescript
// Protected endpoint example
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
@Get('admin/users')
async getUsers() {
  // Only accessible by admin and moderator roles
}
```

**Available Roles:**
- `user`: Standard user access
- `moderator`: Content moderation capabilities
- `admin`: Full system access

### API Security

**Implemented Protections:**
- ✅ Helmet.js for HTTP headers security
- ✅ CORS configured with environment-based origins
- ✅ Rate limiting with @nestjs/throttler
- ✅ Input validation with class-validator
- ✅ SQL injection protection via Prisma
- ✅ XSS protection via input sanitization

**Production Configuration:**

```typescript
// Rate limiting
ThrottlerModule.forRoot({
  ttl: 60,
  limit: 100, // 100 requests per minute
});
```

### Secret Scanning

**Automated Scanning:**
- Pre-commit: git-secrets
- CI/CD: Trufflehog (GitHub Actions)
- Dependency scanning: Dependabot
- Container scanning: Trivy
- Code analysis: Snyk

---

## Observability & Monitoring

### Error Tracking - Sentry

**Setup:**

1. Create a Sentry project at https://sentry.io
2. Add DSN to environment variables:

```bash
SENTRY_DSN=https://your_key@sentry.io/your_project
SENTRY_DEBUG=false
APP_VERSION=1.0.0
```

**Features:**
- Automatic error capture
- Performance monitoring
- User context tracking
- Release tracking
- Source map support

**Usage:**

```typescript
import { captureException, setUserContext } from './config/sentry';

// Capture errors
try {
  // ... code
} catch (error) {
  captureException(error, { userId: user.id });
}

// Set user context
setUserContext({ id: user.id, email: user.email });
```

### Distributed Tracing - OpenTelemetry

**Setup:**

Configure OpenTelemetry collector endpoint:

```bash
OTEL_SERVICE_NAME=quemiai-backend
OTEL_EXPORTER_OTLP_ENDPOINT=http://your-collector:4318/v1/traces
OTEL_SDK_DISABLED=false
```

**Supported Backends:**
- Jaeger
- Zipkin
- Grafana Tempo
- AWS X-Ray
- Google Cloud Trace

**Custom Spans:**

```typescript
import { createSpan } from './config/opentelemetry';

await createSpan('process-payment', async () => {
  // Your code here
});
```

### Structured Logging - Pino

**Configuration:**

```bash
LOG_LEVEL=info  # production
LOG_LEVEL=debug # development
```

**Log Levels:**
- `error`: Error conditions
- `warn`: Warning conditions
- `info`: Informational messages
- `debug`: Debug messages
- `trace`: Trace messages

**Best Practices:**
- Use structured logging with context
- Include trace IDs from OpenTelemetry
- Never log sensitive data (passwords, tokens)
- Use appropriate log levels

### Health Checks

**Endpoint:** `GET /health`

**Response:**

```json
{
  "status": "ok",
  "uptime": 12345,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

**Monitoring:**
- Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- Configure alerts for health check failures
- Monitor response times

### Metrics - Prometheus

**Available Metrics:**
- HTTP request duration
- HTTP request count
- Active connections
- Database query duration
- Cache hit/miss rates
- WebSocket connections

**Prometheus Configuration:**

```bash
PROMETHEUS_PUSH_GATEWAY=http://your-pushgateway:9091
```

---

## Infrastructure & Deployment

### Docker Deployment

**Build Image:**

```bash
docker build -t quemiai-backend:latest .
```

**Run Container:**

```bash
docker run -p 4000:4000 \
  --env-file .env \
  --name quemiai-backend \
  quemiai-backend:latest
```

**Security Features:**
- Non-root user (node)
- Multi-stage build
- Production-only dependencies
- Health checks enabled

### Kubernetes Deployment

**Recommended Resources:**

```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "500m"
```

**Required ConfigMaps:**
- Environment variables
- Application configuration

**Required Secrets:**
- Database credentials
- JWT secrets
- OAuth credentials
- API keys

### Load Balancing

**Considerations:**
- Use sticky sessions for WebSocket connections
- Enable health check probes
- Configure timeout values appropriately
- Set up SSL termination at load balancer

### SSL/TLS

**Requirements:**
- Use TLS 1.2 or higher
- Enable HSTS headers
- Use strong cipher suites
- Implement certificate pinning for mobile apps

**Certificate Management:**
- Use Let's Encrypt for automatic renewal
- Monitor certificate expiration
- Implement certificate rotation procedures

---

## Database & Connection Management

### PostgreSQL Configuration

**Connection String Format:**

```
postgresql://user:password@host:5432/database?sslmode=require
```

**SSL/TLS:**
Always use SSL in production:

```
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require&sslcert=/path/to/cert&sslkey=/path/to/key&sslrootcert=/path/to/ca
```

### Connection Pooling with Prisma

**Configuration in `schema.prisma`:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["metrics"]
}
```

**URL Parameters:**

```
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public&pool_timeout=20&connection_limit=10
```

**Parameters Explained:**
- `connection_limit`: Maximum number of connections (default: unlimited)
- `pool_timeout`: Max time to wait for a connection in seconds (default: 10)
- `connect_timeout`: Max time to wait for initial connection (default: 5)

**Recommended Settings by Environment:**

**Development:**
```
connection_limit=5
pool_timeout=10
```

**Production (single instance):**
```
connection_limit=10
pool_timeout=20
```

**Production (multi-instance):**
Calculate per instance: `total_db_connections / number_of_instances`

Example: 100 max connections, 5 instances = 20 per instance
```
connection_limit=15
pool_timeout=30
```

### Database Connection Limits

**PostgreSQL Limits:**

Check current limits:
```sql
SHOW max_connections;
```

Typical values:
- Shared hosting: 20-50 connections
- Small instance: 100 connections
- Medium instance: 200 connections
- Large instance: 500+ connections

**Formula for Connection Limit:**

```
Per-instance limit = (max_connections - reserved) / number_of_instances
```

Reserve 10-20 connections for:
- Database admin tasks
- Monitoring tools
- Manual connections

**Example Calculation:**

```
PostgreSQL max_connections: 100
Reserved connections: 20
Application instances: 4

Per-instance limit = (100 - 20) / 4 = 20 connections
Set connection_limit=15 (75% of available)
```

### PgBouncer Setup

**Why PgBouncer?**
- Connection pooling at database level
- Reduces connection overhead
- Handles connection spikes
- Supports more clients than PostgreSQL alone

**Installation:**

```bash
# Ubuntu/Debian
sudo apt-get install pgbouncer

# macOS
brew install pgbouncer
```

**Configuration (`/etc/pgbouncer/pgbouncer.ini`):**

```ini
[databases]
quemiai = host=localhost port=5432 dbname=quemiai

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 5
max_db_connections = 50
server_idle_timeout = 600
```

**Pool Modes:**
- `session`: Connection held for session duration (safest)
- `transaction`: Connection held for transaction (recommended)
- `statement`: Connection held for statement (most efficient, least compatible)

**Update Application Connection:**

```bash
# Before (direct to PostgreSQL)
DATABASE_URL=postgresql://user:pass@localhost:5432/quemiai

# After (through PgBouncer)
DATABASE_URL=postgresql://user:pass@localhost:6432/quemiai
```

**PgBouncer Monitoring:**

```sql
-- Connect to pgbouncer
psql -h localhost -p 6432 -U pgbouncer pgbouncer

-- Show pools
SHOW POOLS;

-- Show clients
SHOW CLIENTS;

-- Show servers
SHOW SERVERS;

-- Show stats
SHOW STATS;
```

**Docker PgBouncer:**

```yaml
services:
  pgbouncer:
    image: pgbouncer/pgbouncer:latest
    environment:
      - DATABASES_HOST=postgres
      - DATABASES_PORT=5432
      - DATABASES_DBNAME=quemiai
      - PGBOUNCER_POOL_MODE=transaction
      - PGBOUNCER_MAX_CLIENT_CONN=1000
      - PGBOUNCER_DEFAULT_POOL_SIZE=25
    ports:
      - "6432:5432"
```

---

## WebSocket & Real-time Communication

### Socket.IO Configuration

**Sticky Sessions Requirement:**

WebSocket connections require sticky sessions (session affinity) when running multiple instances.

**Why Sticky Sessions?**
- Socket.IO maintains stateful connections
- Same client must connect to same server instance
- Ensures message delivery and connection stability

### Load Balancer Configuration

#### Nginx

```nginx
upstream socketio {
    ip_hash;  # Sticky sessions based on IP
    server backend1:4000;
    server backend2:4000;
    server backend3:4000;
}

server {
    listen 80;
    
    location /socket.io/ {
        proxy_pass http://socketio;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }
}
```

#### AWS Application Load Balancer (ALB)

Enable sticky sessions:
1. Target Group → Attributes
2. Enable "Stickiness"
3. Duration: 1 day (86400 seconds)
4. Stickiness type: Application-based cookie

#### Google Cloud Load Balancer

```yaml
sessionAffinity: CLIENT_IP
affinityCookieTtlSec: 86400
```

### Redis Adapter for Socket.IO

**Why Redis Adapter?**
- Enables communication between multiple server instances
- Broadcasts messages across all servers
- Required for horizontal scaling

**Installation:**

```bash
npm install @socket.io/redis-adapter redis
```

**Configuration:**

```typescript
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ 
      url: process.env.REDIS_URL 
    });
    const subClient = pubClient.duplicate();

    await Promise.all([
      pubClient.connect(),
      subClient.connect()
    ]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
```

**Usage in main.ts:**

```typescript
const redisIoAdapter = new RedisIoAdapter(app);
await redisIoAdapter.connectToRedis();
app.useWebSocketAdapter(redisIoAdapter);
```

**Environment Variables:**

```bash
REDIS_URL=redis://localhost:6379
# For production with authentication
REDIS_URL=redis://:password@host:6379
# For Redis Cluster
REDIS_URL=redis://host1:6379,host2:6379,host3:6379
```

### WebSocket Testing

**Load Testing:**

```bash
# Install artillery
npm install -g artillery

# Run WebSocket load test
artillery run websocket-test.yml
```

**Test Configuration (`websocket-test.yml`):**

```yaml
config:
  target: "http://localhost:4000"
  phases:
    - duration: 60
      arrivalRate: 10
  engines:
    socketio-v3: {}

scenarios:
  - engine: socketio-v3
    flow:
      - emit:
          channel: "message"
          data: "Hello World"
      - think: 1
```

**Monitoring:**

```typescript
// Monitor connections
io.of('/').adapter.on('create-room', (room) => {
  console.log(`Room ${room} was created`);
});

io.of('/').adapter.on('join-room', (room, id) => {
  console.log(`Socket ${id} joined room ${room}`);
});
```

---

## Performance & Scalability

### Caching Strategy

**Redis Configuration:**

```typescript
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

CacheModule.register({
  store: redisStore,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  ttl: 300, // 5 minutes default
});
```

**Caching Best Practices:**
- Cache frequently accessed data
- Set appropriate TTL values
- Use cache invalidation strategies
- Monitor cache hit rates

### Database Optimization

**Indexes:**

```sql
-- Add indexes for frequently queried fields
CREATE INDEX CONCURRENTLY idx_user_email ON "User"(email);
CREATE INDEX CONCURRENTLY idx_post_created ON "Post"("createdAt" DESC);
CREATE INDEX CONCURRENTLY idx_message_conversation ON "Message"("conversationId", "createdAt" DESC);
```

**Query Optimization:**
- Use `select` to fetch only needed fields
- Implement pagination for large datasets
- Use database views for complex queries
- Monitor slow queries

### Rate Limiting

**Configuration:**

```typescript
ThrottlerModule.forRoot({
  ttl: 60,
  limit: 100, // 100 requests per minute
  ignoreUserAgents: [/googlebot/i],
});
```

**Custom Rate Limits:**

```typescript
@Throttle(10, 60) // 10 requests per minute
@Post('upload')
async uploadFile() {
  // ...
}
```

### Horizontal Scaling

**Requirements:**
- Stateless application design
- Redis for shared state
- Database connection pooling
- Load balancer with health checks

**Scaling Checklist:**
- ✅ Externalize session storage (Redis)
- ✅ Use Redis adapter for WebSocket
- ✅ Configure sticky sessions
- ✅ Set appropriate connection limits
- ✅ Implement health checks
- ✅ Use environment-specific configuration

---

## Error Handling & Resilience

### Global Exception Filter

**Implemented Features:**
- Structured error responses
- Error logging with context
- User-friendly error messages
- Security (no stack traces in production)

### Circuit Breaker Pattern

**For External Services:**

```typescript
import { CircuitBreaker } from 'circuit-breaker-js';

const breaker = new CircuitBreaker({
  timeout: 5000,
  errorThreshold: 50,
  resetTimeout: 30000,
});

await breaker.execute(() => externalApiCall());
```

### Retry Logic

**For Transient Failures:**

```typescript
import { retry } from 'async';

await retry(
  { times: 3, interval: 1000 },
  async () => {
    return await unstableOperation();
  }
);
```

---

## Compliance & Data Protection

### GDPR Compliance

**Data Protection:**
- User data encryption at rest and in transit
- Right to access (data export)
- Right to erasure (account deletion)
- Data portability
- Consent management

**Implementation:**
- Privacy policy and terms of service
- Cookie consent
- Data retention policies
- Audit logs for data access

### Data Encryption

**At Rest:**
- Database encryption (PostgreSQL)
- Encrypted file storage
- Encrypted backups

**In Transit:**
- TLS 1.2+ for all connections
- HTTPS enforcement
- Secure WebSocket connections (WSS)

---

## CI/CD & Automation

### GitHub Actions Workflows

**Implemented Workflows:**

1. **CI (`ci.yml`)**: Build, test, lint
2. **Secret Scan (`secret-scan.yml`)**: Trufflehog scanning
3. **Security Audit (`security-audit.yml`)**: Weekly npm audit
4. **Snyk Scan (`snyk-security.yml`)**: Dependency vulnerability scan
5. **Trivy Scan (`trivy-scan.yml`)**: Container security scan

### Dependabot

**Configuration:** `.github/dependabot.yml`

**Features:**
- Automatic dependency updates
- Security vulnerability alerts
- Grouped updates by scope
- Weekly schedule

**Required Secrets:**
- `SNYK_TOKEN`: Snyk API token (get from https://snyk.io)

---

## Incident Response

### Monitoring & Alerts

**Set up alerts for:**
- High error rates (> 1% of requests)
- Slow response times (> 1s p95)
- High memory usage (> 80%)
- High CPU usage (> 80%)
- Database connection pool exhaustion
- Failed health checks
- Security scan failures

### Incident Response Process

1. **Detection**: Alert triggered
2. **Triage**: Assess severity and impact
3. **Investigation**: Review logs, traces, metrics
4. **Mitigation**: Implement fix or workaround
5. **Resolution**: Deploy fix to production
6. **Post-mortem**: Document incident and learnings

### Rollback Procedure

```bash
# Kubernetes
kubectl rollout undo deployment/quemiai-backend

# Docker
docker-compose pull quemiai-backend:previous-tag
docker-compose up -d

# Vercel (frontend)
vercel rollback
```

---

## Deployment Checklist

### Pre-deployment

- [ ] All tests passing
- [ ] Security scans completed
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Backup created
- [ ] Monitoring configured
- [ ] Alerts configured
- [ ] Documentation updated

### Deployment

- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Check logs for errors
- [ ] Verify health checks
- [ ] Test critical user flows

### Post-deployment

- [ ] Monitor for 1 hour
- [ ] Check error rates
- [ ] Verify metrics
- [ ] Update status page
- [ ] Notify team

---

## Additional Resources

- [Security Best Practices](./SECURITY.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Monitoring Guide](./MONITORING_GUIDE.md)
- [API Documentation](./API_REFERENCE.md)
- [Contributing Guide](./CONTRIBUTING.md)

---

## Support

For production issues:
- Email: support@quemiai.com
- Slack: #production-support
- On-call: [PagerDuty rotation]

For security issues:
- Email: security@quemiai.com
- Report privately via GitHub Security Advisories
