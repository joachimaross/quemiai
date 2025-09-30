# Deployment Guide

This guide covers deployment strategies for the Quemiai backend application.

> **📋 See Also:** [ROADMAP.md](ROADMAP.md) for planned enhancements to monitoring, performance, security, and architecture.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Docker Deployment](#docker-deployment)
- [Vercel Deployment](#vercel-deployment)
- [Traditional Server Deployment](#traditional-server-deployment)
- [Environment Configuration](#environment-configuration)
- [Production Checklist](#production-checklist)
- [Observability](#observability)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js >= 18 < 21
- PostgreSQL database
- Redis instance (optional but recommended)
- Environment variables configured

## Docker Deployment

### Building the Image

```bash
# Build the Docker image
docker build -t quemiai:latest .

# Or with a specific version
docker build -t quemiai:v1.0.0 .
```

### Running Locally

```bash
# Run with environment file
docker run -p 4000:4000 --env-file .env quemiai:latest

# Or with individual environment variables
docker run -p 4000:4000 \
  -e NODE_ENV=production \
  -e PORT=4000 \
  -e DATABASE_URL=your_database_url \
  quemiai:latest
```

### Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "4000:4000"
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: quemiai
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

Run with:
```bash
docker-compose up -d
```

### Pushing to Registry

```bash
# Tag the image
docker tag quemiai:latest your-registry/quemiai:latest

# Push to registry
docker push your-registry/quemiai:latest
```

## Vercel Deployment

### Setup

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

### Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Configuration

The `vercel.json` file is already configured. Make sure to set environment variables in the Vercel dashboard:

- Go to your project settings
- Navigate to "Environment Variables"
- Add all required variables from `.env.example`

### Custom Domain

1. Go to Vercel dashboard
2. Navigate to your project
3. Go to Settings → Domains
4. Add your custom domain
5. Configure DNS records as instructed

## Traditional Server Deployment

### On Ubuntu/Debian

1. Install Node.js and npm:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Clone and setup:
```bash
git clone https://github.com/joachimaross/quemiai.git
cd quemiai
npm install --ignore-scripts
npm run build
```

3. Use PM2 for process management:
```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start dist/main.js --name quemiai

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

4. Configure Nginx as reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

5. Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/quemiai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. Setup SSL with Let's Encrypt:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Environment Configuration

### Required Variables

```env
PORT=4000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secure-jwt-secret
```

### Optional Variables

```env
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FIREBASE_PROJECT_ID=...
```

### Security Best Practices

> **Note:** For comprehensive security implementation, see [ROADMAP.md - PHASE 3.5](ROADMAP.md#phase-35-advanced-security).

1. **Never commit `.env` files** to version control
2. **Use strong secrets** for JWT and other security tokens
3. **Rotate secrets regularly** in production
4. **Use secret management** services (AWS Secrets Manager, HashiCorp Vault, etc.)
5. **Enable security headers** with Helmet middleware (planned - see PHASE 3.5)
6. **Implement vulnerability scanning** with npm audit, Dependabot, and Snyk (planned - see PHASE 3.5)
7. **Use JWT refresh tokens** with proper expiration (planned - see PHASE 3.5)
8. **Implement RBAC** for role-based access control (planned - see PHASE 3.5)

## Production Checklist

### Pre-Deployment

- [ ] All tests passing (`npm run test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificates configured (if applicable)

### Deployment

- [ ] Deploy to staging first
- [ ] Run smoke tests on staging
- [ ] Monitor logs for errors
- [ ] Check health endpoint (`/health`)
- [ ] Verify WebSocket connections work
- [ ] Test critical user flows

### Post-Deployment

- [ ] Monitor application logs
- [ ] Check error rates
- [ ] Monitor response times
- [ ] Verify database connections
- [ ] Check Redis connections
- [ ] Monitor memory and CPU usage

### Monitoring Setup

> **📘 For detailed monitoring and observability implementation, see the [Observability](#observability) section and [MONITORING_GUIDE.md](MONITORING_GUIDE.md).**

Quick monitoring checklist:

1. **Application Monitoring**
   - Set up error tracking (Sentry, Rollbar)
   - Configure application performance monitoring (APM)
   - Set up log aggregation (ELK Stack, Logtail, Datadog, CloudWatch)
   - Implement Prometheus metrics (see [MONITORING_GUIDE.md](MONITORING_GUIDE.md#prometheus-metrics))
   - Configure Grafana dashboards (see [MONITORING_GUIDE.md](MONITORING_GUIDE.md#grafana-dashboards))

2. **Infrastructure Monitoring**
   - CPU and memory usage
   - Disk space
   - Network traffic
   - Database connections
   - Redis connections and cache hit rates
   - Connection pool metrics

3. **Health Checks**
   - Basic health endpoint: `/health` (status, uptime, environment)
   - Planned: `/health/ready` for readiness probes (database, Redis connectivity)
   - Planned: `/health/live` for liveness probes
   - See [MONITORING_GUIDE.md - Health Endpoints](MONITORING_GUIDE.md#health-endpoints) for details

4. **Alerts**
   - Set up alerts for:
     - High error rates
     - Slow response times
     - Service downtime
     - Resource exhaustion
   - See [MONITORING_GUIDE.md - Alerting Strategy](MONITORING_GUIDE.md#alerting-strategy) for configuration

### Scaling Strategies

> **Note:** For performance optimization and load testing, see [ROADMAP.md - PHASE 3](ROADMAP.md#phase-3-performance--reliability).

#### Horizontal Scaling

- Use load balancer (Nginx, AWS ALB)
- Run multiple instances behind load balancer
- Use sticky sessions for WebSocket connections
- Share session state via Redis

#### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries (see PHASE 3 for query optimization)
- Implement caching strategies (Redis caching - see PHASE 3)

#### Database Scaling

- Add read replicas
- Implement connection pooling (see PHASE 3 for pool monitoring)
- Use database caching (Redis)
- Consider database sharding for large scale

### Performance Testing

> **Note:** For load testing implementation, see [ROADMAP.md - Load Testing](ROADMAP.md#load-testing).

Planned performance testing infrastructure includes:
- Load testing with k6 or Artillery
- Performance baseline establishment
- Performance regression tests in CI/CD
- Automated performance reports
- See PHASE 3 for detailed implementation steps

## Rollback Strategy

### Quick Rollback

```bash
# If using Docker
docker pull your-registry/quemiai:previous-version
docker stop quemiai-current
docker run -d --name quemiai-current your-registry/quemiai:previous-version

# If using PM2
pm2 stop quemiai
cd /path/to/previous/version
pm2 start dist/main.js --name quemiai

# If using Git
git checkout previous-commit-or-tag
npm install
npm run build
pm2 restart quemiai
```

### Database Rollback

- Always backup database before migrations
- Keep migration rollback scripts ready
- Test rollback procedures in staging

## Observability

### Overview

Observability is critical for maintaining a healthy production system. It enables you to understand system behavior, detect issues early, and respond to incidents quickly.

> **📘 For comprehensive monitoring setup, see [MONITORING_GUIDE.md](MONITORING_GUIDE.md)**

The Quemiai platform implements a multi-layered observability strategy:

1. **Health Checks**: Basic and advanced health endpoints
2. **Metrics Collection**: Prometheus metrics for performance monitoring
3. **Error Tracking**: Sentry integration for error monitoring
4. **Visualization**: Grafana dashboards for metrics visualization
5. **Log Aggregation**: Centralized logging with ELK Stack, Logtail, or Datadog
6. **Distributed Tracing**: OpenTelemetry integration (planned)

### Health Monitoring

#### Basic Health Check

The application provides a basic health endpoint that returns application status:

```bash
# Check application health
curl http://your-domain.com/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600.5,
  "environment": "production"
}
```

#### Advanced Health Checks (Planned)

Future enhancements include:
- `/health/ready` - Readiness probe (database, Redis connectivity)
- `/health/live` - Liveness probe (application responsiveness)

See [MONITORING_GUIDE.md - Health Endpoints](MONITORING_GUIDE.md#health-endpoints) for details.

### Metrics and Monitoring

#### Prometheus Integration (Planned)

Prometheus metrics will be available at `/metrics` endpoint for scraping. Key metrics include:

- **HTTP Metrics**: Request rates, response times, status codes
- **WebSocket Metrics**: Active connections, message rates
- **System Metrics**: CPU, memory, event loop lag
- **Database Metrics**: Query duration, connection pool usage
- **Redis Metrics**: Operation duration, cache hit rates

See [MONITORING_GUIDE.md - Prometheus Metrics](MONITORING_GUIDE.md#prometheus-metrics) for implementation details.

#### Grafana Dashboards (Planned)

Pre-built Grafana dashboards will be available for:
- API Overview (request rates, errors, latency)
- WebSocket Metrics (connections, messages)
- System Metrics (CPU, memory, disk, network)
- Database Metrics (queries, connections)

See [MONITORING_GUIDE.md - Grafana Dashboards](MONITORING_GUIDE.md#grafana-dashboards) for setup.

### Error Tracking

#### Sentry Integration (Planned)

Sentry provides real-time error tracking and performance monitoring:

- Automatic error capture
- Stack traces and context
- Performance monitoring
- Release tracking
- User impact analysis

**Setup Steps:**
1. Create Sentry account and project
2. Configure `SENTRY_DSN` environment variable
3. Install `@sentry/node` package
4. Initialize Sentry in `main.ts`

See [MONITORING_GUIDE.md - Sentry Error Tracking](MONITORING_GUIDE.md#sentry-error-tracking) for complete setup.

### Log Aggregation

The application uses **Pino** for structured JSON logging. Choose a log aggregation solution based on your infrastructure:

#### Option 1: ELK Stack (Self-Hosted)
- Elasticsearch for log storage
- Logstash for log processing
- Kibana for visualization
- Best for: On-premise deployments

#### Option 2: Logtail (SaaS)
- Managed service
- Real-time log streaming
- Simple setup
- Best for: Quick setup, cloud deployments

#### Option 3: Datadog Logs (SaaS)
- Unified APM and logs
- Infrastructure correlation
- Advanced analytics
- Best for: Enterprise deployments

See [MONITORING_GUIDE.md - Log Aggregation](MONITORING_GUIDE.md#log-aggregation) for detailed setup instructions.

### Post-Deployment Monitoring

After deploying to production, continuously monitor:

#### Application Health
- [ ] Health endpoint responding correctly
- [ ] Error rates within acceptable limits (<0.1%)
- [ ] Response times meeting SLOs (p95 < 200ms)
- [ ] WebSocket connections stable
- [ ] Memory and CPU usage within expected ranges

#### Infrastructure Health
- [ ] Database connections healthy
- [ ] Redis connections stable
- [ ] Disk space sufficient (>20% free)
- [ ] Network latency acceptable
- [ ] SSL certificates valid

#### Logging and Alerts
- [ ] Logs being collected properly
- [ ] Log aggregation system operational
- [ ] Alert rules configured
- [ ] Alert channels working (Slack, email, PagerDuty)
- [ ] Runbooks documented for common issues

### Key Performance Indicators (KPIs)

Track these metrics continuously:

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| API Availability | >99.9% | <99% |
| API Response Time (p95) | <200ms | >500ms |
| Error Rate | <0.1% | >1% |
| WebSocket Latency | <100ms | >300ms |
| Database Query Time (p95) | <50ms | >200ms |
| Memory Usage | <80% | >90% |
| CPU Usage | <70% | >85% |

### Alerting Strategy

Configure alerts for critical metrics:

**Critical Alerts** (Immediate Response):
- Service down or unreachable
- Error rate >5%
- Database connection failures
- Memory/CPU >90%

**Warning Alerts** (Response within 30 minutes):
- Error rate >1%
- Response time p95 >500ms
- Disk space >80%
- Connection pool >80%

**Info Alerts** (Response within 24 hours):
- Unusual traffic patterns
- Slow queries detected
- Cache hit rate <70%

See [MONITORING_GUIDE.md - Alerting Strategy](MONITORING_GUIDE.md#alerting-strategy) for detailed alert configuration.

### Observability Checklist

Before considering your production deployment complete:

**Monitoring Setup:**
- [ ] Health endpoints configured and accessible
- [ ] Metrics collection setup (Prometheus or equivalent)
- [ ] Visualization dashboards created (Grafana or equivalent)
- [ ] Error tracking configured (Sentry or equivalent)
- [ ] Log aggregation implemented

**Alert Configuration:**
- [ ] Critical alerts defined
- [ ] Alert channels configured (Slack, PagerDuty, email)
- [ ] Alert escalation policies documented
- [ ] On-call rotation established

**Documentation:**
- [ ] Monitoring dashboards documented
- [ ] Alert runbooks created
- [ ] Escalation procedures defined
- [ ] Team trained on observability tools

**Testing:**
- [ ] Alert testing performed
- [ ] Dashboard validation completed
- [ ] Log query testing done
- [ ] Incident response dry-run executed

### Continuous Improvement

Regularly review and improve your observability:

- **Weekly**: Review alerts and adjust thresholds
- **Monthly**: Analyze trends and capacity planning
- **Quarterly**: Update dashboards and metrics
- **Incident Reviews**: Document learnings and improve runbooks

### Additional Resources

- [MONITORING_GUIDE.md](MONITORING_GUIDE.md) - Comprehensive monitoring setup guide
- [ROADMAP.md - PHASE 2.5](ROADMAP.md#phase-25-monitoring--observability) - Monitoring roadmap
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Sentry Documentation](https://docs.sentry.io/)

## Troubleshooting

### Application Won't Start

1. Check environment variables are set correctly
2. Verify database connection
3. Check logs: `pm2 logs quemiai` or `docker logs container-id`
4. Ensure port 4000 is not already in use

### High Memory Usage

1. Check for memory leaks
2. Monitor WebSocket connections
3. Implement connection pooling
4. Consider increasing server resources

### Database Connection Issues

1. Verify DATABASE_URL is correct
2. Check database server is accessible
3. Verify firewall rules
4. Check connection pool settings

### WebSocket Issues

1. Ensure load balancer supports WebSockets
2. Configure sticky sessions
3. Check CORS configuration
4. Verify client connection settings

## Support

For deployment issues:
1. Check the logs first
2. Consult this guide
3. Open an issue on GitHub
4. Contact the development team

---

**Remember:** Always test in staging before deploying to production!
