# Production Readiness Guide

This guide consolidates key information from DEPLOYMENT.md, NEXT_STEPS.md, and ROADMAP.md to help you prepare Quemiai for production deployment.

## Table of Contents
1. [Security Hardening](#security-hardening)
2. [Database Optimization](#database-optimization)
3. [Observability & Monitoring](#observability--monitoring)
4. [Infrastructure & Scaling](#infrastructure--scaling)
5. [CI/CD & Automation](#cicd--automation)
6. [Pre-Production Checklist](#pre-production-checklist)

---

## Security Hardening

### 1. Secrets Management ✅

**Implemented:**
- ✅ Pre-commit hooks for secret scanning (see `.husky/pre-commit`)
- ✅ GitHub Actions secret scanning (TruffleHog)
- ✅ `.env.example` files for all applications

**Action Required:**
```bash
# 1. Copy .env.example to .env for each app
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.local.example apps/web/.env.local

# 2. Generate strong secrets
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# 3. Update .env files with real values
# NEVER commit .env files to version control
```

**Production Secrets Management:**
- Use AWS Secrets Manager, HashiCorp Vault, or similar
- Rotate secrets regularly (every 90 days minimum)
- Use different secrets for each environment

### 2. Authentication & Authorization ✅

**Implemented:**
- ✅ JWT authentication with refresh tokens
- ✅ Centralized guards (JwtAuthGuard, RolesGuard, ResourceOwnershipGuard)
- ✅ Role-Based Access Control (RBAC)
- ✅ Resource ownership validation

**Usage Example:**
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserRole } from './guards/roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getDashboard(@CurrentUser() user: any) {
    return { message: 'Admin dashboard', user };
  }
}
```

**Action Required:**
- [ ] Add authorization tests for all protected endpoints
- [ ] Implement 2FA/MFA for admin accounts
- [ ] Add account lockout after failed login attempts
- [ ] Implement JWT refresh token rotation

### 3. Security Headers & Middleware ✅

**Implemented:**
- ✅ Helmet.js for security headers
- ✅ Rate limiting on API endpoints
- ✅ CORS configuration with environment variables
- ✅ Input validation with class-validator

**Action Required:**
- [ ] Configure rate limiting per endpoint type (stricter for auth)
- [ ] Add CSRF protection for web forms
- [ ] Implement request signing for sensitive operations

### 4. Automated Security Scanning ✅

**Implemented:**
- ✅ Dependabot for dependency updates (`.github/dependabot.yml`)
- ✅ NPM audit in CI/CD pipeline
- ✅ Snyk vulnerability scanning
- ✅ Trivy container scanning
- ✅ Secret scanning with TruffleHog

**Weekly Security Scans:**
```bash
# Run locally
npm audit --audit-level=high
npm outdated

# Check for secrets
git log -p | grep -iE "(password|secret|api[_-]?key|token)"
```

---

## Database Optimization

### 1. Connection Pooling ✅

**Implemented:**
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pooling parameters in DATABASE_URL:
  // ?connection_limit=20&pool_timeout=20&connect_timeout=10
}
```

**Recommended Settings:**
```env
# For small deployments (1-2 instances)
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20&connect_timeout=10"

# For larger deployments (3+ instances)
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20&connect_timeout=10"
```

### 2. PgBouncer Setup (Recommended for Production)

**Install PgBouncer:**
```bash
# Ubuntu/Debian
sudo apt-get install pgbouncer

# Configuration in /etc/pgbouncer/pgbouncer.ini
[databases]
quemiai = host=localhost port=5432 dbname=quemiai

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
reserve_pool_size = 5
reserve_pool_timeout = 3
```

**Update Connection String:**
```env
# Connect through PgBouncer instead of directly to PostgreSQL
DATABASE_URL="postgresql://user:pass@localhost:6432/quemiai?pgbouncer=true"
```

**Connection Limits:**
- PostgreSQL: max_connections = 100 (default)
- PgBouncer pool: 25 connections per database
- Application: 10 connections per instance
- Reserve: 5 connections for maintenance

### 3. Database Indexes & Performance

**Verify Critical Indexes:**
```sql
-- Check for missing indexes
SELECT schemaname, tablename, attname, n_distinct
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
ORDER BY n_distinct DESC;

-- Monitor slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## Observability & Monitoring

### 1. Error Tracking with Sentry ✅

**Implemented:**
- ✅ Sentry SDK integration
- ✅ Automatic error capture
- ✅ Performance monitoring
- ✅ Request/response tracking

**Configuration:**
```env
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% of transactions
```

**Usage:**
```typescript
import { Sentry } from './config/sentry';

// Manual error reporting
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { operation: 'riskyOperation' },
    extra: { userId: user.id },
  });
  throw error;
}
```

### 2. Distributed Tracing with OpenTelemetry ✅

**Implemented:**
- ✅ OpenTelemetry SDK
- ✅ Auto-instrumentation for HTTP, database, Redis
- ✅ OTLP exporter for trace data

**Configuration:**
```env
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-otel-collector:4318
OTEL_SERVICE_NAME=quemiai-backend
```

**Supported Backends:**
- Jaeger
- Zipkin
- Datadog APM
- New Relic
- AWS X-Ray

### 3. Structured Logging with Pino ✅

**Implemented:**
- ✅ JSON structured logging
- ✅ Log levels (error, warn, info, debug)
- ✅ Request/response logging
- ✅ Correlation IDs

**Configuration:**
```env
LOG_LEVEL=info  # production
LOG_LEVEL=debug # development
```

**Best Practices:**
```typescript
import logger from './config/logger';

// Structured logging
logger.info({ userId: user.id, action: 'login' }, 'User logged in');
logger.error({ err: error, userId: user.id }, 'Failed to process request');
```

### 4. Health Checks & Readiness Probes

**Action Required:**
```typescript
// Add health check endpoint
@Get('health')
async healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: await this.checkDatabase(),
    redis: await this.checkRedis(),
  };
}
```

---

## Infrastructure & Scaling

### 1. WebSocket Scaling with Redis Adapter

**For multi-instance deployments:**
```typescript
// apps/backend/src/gateways/chat.gateway.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
```

**Update main.ts:**
```typescript
const redisIoAdapter = new RedisIoAdapter(app);
await redisIoAdapter.connectToRedis();
app.useWebSocketAdapter(redisIoAdapter);
```

### 2. Load Balancer Configuration

**Sticky Sessions for WebSockets:**
```nginx
# nginx.conf
upstream backend {
    ip_hash;  # Sticky sessions based on IP
    server backend1:4000;
    server backend2:4000;
    server backend3:4000;
}

server {
    listen 80;
    server_name api.quemiai.com;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Caching Strategy

**Redis Caching:**
```typescript
import { redisClient } from './config/redis';

// Cache frequently accessed data
async getCachedUser(userId: string) {
  const cacheKey = `user:${userId}`;
  const cached = await redisClient.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  await redisClient.setEx(cacheKey, 3600, JSON.stringify(user)); // 1 hour TTL
  
  return user;
}
```

---

## CI/CD & Automation

### 1. GitHub Actions Workflows ✅

**Implemented:**
- ✅ CI pipeline with tests and linting (`.github/workflows/ci.yml`)
- ✅ Security scanning (`.github/workflows/security-scan.yml`)
- ✅ Secret scanning (`.github/workflows/secret-scan.yml`)

### 2. Automated Testing

**Action Required:**
- [ ] Increase test coverage to 80%+
- [ ] Add integration tests for critical flows
- [ ] Add E2E tests for user journeys
- [ ] Add load testing with k6 or Artillery

**Example Load Test:**
```javascript
// load-test.js (k6)
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
  },
};

export default function () {
  const res = http.get('https://api.quemiai.com/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

### 3. Deployment Automation

**Action Required:**
- [ ] Set up staging environment
- [ ] Implement blue-green deployments
- [ ] Add automated rollback on failure
- [ ] Set up database migration automation

---

## Pre-Production Checklist

### Security ✅
- [x] Pre-commit hooks for secret scanning
- [x] Automated security scanning (Dependabot, Snyk, Trivy)
- [x] JWT authentication with refresh tokens
- [x] RBAC and resource ownership guards
- [x] Helmet.js security headers
- [x] Rate limiting configured
- [ ] 2FA/MFA for admin accounts
- [ ] Security audit completed
- [ ] Penetration testing completed

### Database & Performance ✅
- [x] Connection pooling configured
- [ ] PgBouncer installed and configured
- [ ] Database indexes optimized
- [ ] Connection limits documented
- [ ] Backup strategy implemented
- [ ] Database monitoring set up

### Observability ✅
- [x] Sentry error tracking configured
- [x] OpenTelemetry tracing configured
- [x] Structured logging with Pino
- [ ] Health check endpoints implemented
- [ ] APM monitoring set up
- [ ] Log aggregation (ELK, Datadog, etc.)
- [ ] Alerting configured

### Infrastructure & Scaling
- [ ] Redis adapter for WebSockets
- [ ] Sticky sessions configured
- [ ] Load balancer set up
- [ ] Auto-scaling configured
- [ ] CDN for static assets
- [ ] Cache invalidation strategy

### Testing & Quality
- [ ] Test coverage > 80%
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Load testing completed
- [ ] Security testing completed

### Documentation ✅
- [x] API documentation complete
- [x] Deployment guide updated
- [x] CONTRIBUTING.md with conventional commits
- [x] Production readiness guide (this document)
- [ ] Runbooks for common issues
- [ ] Disaster recovery plan

### Compliance & Legal
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] GDPR compliance verified
- [ ] Data retention policy defined
- [ ] Security incident response plan

---

## Next Steps

### Immediate (Before Production)
1. Configure secrets management (AWS Secrets Manager, Vault)
2. Set up PgBouncer for database connection pooling
3. Implement Redis adapter for WebSocket scaling
4. Configure health checks and monitoring
5. Run load tests and optimize bottlenecks

### Short Term (First Month)
1. Implement 2FA/MFA for admin accounts
2. Set up blue-green deployments
3. Configure automated backups
4. Implement log aggregation
5. Set up alerting and on-call rotation

### Medium Term (3-6 Months)
1. Implement comprehensive audit logging
2. Add advanced caching strategies
3. Optimize database queries
4. Implement API versioning
5. Add feature flags for gradual rollouts

---

## Support & Resources

- **Documentation**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions
- **Roadmap**: See [ROADMAP.md](./ROADMAP.md) for future features
- **Contributing**: See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines
- **Security**: See [SECURITY.md](./SECURITY.md) for security policy

For questions or issues, please open a GitHub issue or contact the development team.

---

**Last Updated:** 2024
**Maintained by:** Quemiai Development Team
