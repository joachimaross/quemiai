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

### Prerequisites

Before deploying to Vercel, ensure:

- [ ] Vercel account created
- [ ] Vercel CLI installed globally (`npm i -g vercel`)
- [ ] Project connected to GitHub repository
- [ ] All environment variables prepared
- [ ] Build succeeds locally (`npm run build`)
- [ ] Tests passing (`npm run test`)

### Setup

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Link your project (first time only):
```bash
vercel link
```

### Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Configuration

The `vercel.json` file configures the deployment with:

- **Builds:** Specifies the serverless function entry point
- **Routes:** Maps incoming requests to API handlers
- **Environment:** Sets production environment variables
- **Headers:** Adds security headers automatically

#### Understanding vercel.json

```json
{
  "version": 2,
  "outputDirectory": "dist",
  "builds": [
    {
      "src": "src/functions/api.ts",
      "use": "@vercel/node",
      "config": {
        "maxLambdaSize": "50mb"
      }
    }
  ],
  "routes": [
    {
      "src": "/health",
      "dest": "src/functions/api.ts",
      "methods": ["GET"]
    },
    {
      "src": "/api/(.*)",
      "dest": "src/functions/api.ts",
      "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    },
    {
      "src": "/(.*)",
      "dest": "src/functions/api.ts"
    }
  ]
}
```

### Environment Variables Setup

#### Required Variables

Set these in the Vercel dashboard (Settings → Environment Variables):

```env
# Server Configuration
PORT=4000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Authentication
JWT_SECRET=your_secure_jwt_secret_here

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Error Tracking (Sentry)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
```

#### Optional Variables

```env
# Redis
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info

# OAuth Providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
APPLE_CLIENT_ID=...
APPLE_TEAM_ID=...
APPLE_KEY_ID=...
APPLE_PRIVATE_KEY=...

# Firebase
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...

# Storage
STORAGE_ENDPOINT=...
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...

# Google Cloud
GCS_BUCKET_NAME=...
GCP_PROJECT_ID=...
GCP_LOCATION=...
```

#### Setting Environment Variables

**Via Vercel Dashboard:**
1. Go to your project at vercel.com
2. Navigate to Settings → Environment Variables
3. Add each variable with appropriate scope:
   - **Production:** For production deployments only
   - **Preview:** For preview deployments (PRs)
   - **Development:** For local development with `vercel dev`

**Via Vercel CLI:**
```bash
# Add a single variable
vercel env add SENTRY_DSN production

# Pull environment variables for local development
vercel env pull .env.local
```

### Sentry Integration Setup

Sentry provides real-time error tracking and performance monitoring.

#### 1. Create Sentry Project

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project (select Node.js/Express)
3. Copy your DSN (Data Source Name)

#### 2. Configure Sentry in Vercel

Add to Vercel environment variables:

```env
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ENVIRONMENT=production
```

#### 3. Sentry Features Enabled

The integration in `src/main.ts` provides:

- **Error Tracking:** Automatic capture of unhandled exceptions
- **Performance Monitoring:** Request tracing and performance metrics
- **Environment Tagging:** Separate tracking for dev/staging/production
- **Release Tracking:** Correlate errors with deployments

#### 4. Testing Sentry Integration

```bash
# After deployment, trigger a test error
curl https://your-app.vercel.app/api/test-error

# Check Sentry dashboard for the error
```

#### 5. Sentry Best Practices

- **Source Maps:** Upload source maps for better error tracking
- **Release Tracking:** Tag releases with version numbers
- **User Context:** Add user information to errors
- **Custom Tags:** Tag errors by feature/module
- **Alerts:** Set up alerts for critical errors

### Rate Limiting Setup

Rate limiting prevents abuse and ensures fair resource usage.

#### Configuration

Rate limiting is configured using `@nestjs/throttler` in `src/app.module.ts`.

**Environment Variables:**

```env
# Requests per IP per time window
THROTTLE_TTL=60        # Time window in seconds (default: 60)
THROTTLE_LIMIT=100     # Max requests per window (default: 100)
```

#### How It Works

- **Default:** 100 requests per minute per IP address
- **Scope:** Applied globally to all routes
- **Response:** Returns 429 (Too Many Requests) when limit exceeded

#### Customizing Rate Limits

To customize for specific routes, use the `@Throttle()` decorator:

```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  // Lower limit for auth endpoints (stricter)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @Post('login')
  async login() {
    // ...
  }

  // Higher limit for public endpoints
  @Throttle({ default: { limit: 200, ttl: 60000 } }) // 200 requests per minute
  @Get('public')
  async public() {
    // ...
  }
}
```

#### Skip Rate Limiting

To skip rate limiting for specific routes:

```typescript
import { SkipThrottle } from '@nestjs/throttler';

@Controller('webhooks')
export class WebhooksController {
  @SkipThrottle()
  @Post('stripe')
  async handleStripeWebhook() {
    // Rate limiting bypassed for webhooks
  }
}
```

#### Production Recommendations

| Endpoint Type | TTL (seconds) | Limit (requests) | Reason |
|---------------|---------------|------------------|--------|
| Authentication | 60 | 10 | Prevent brute force |
| API (General) | 60 | 100 | Fair usage |
| Public Read | 60 | 200 | Higher read capacity |
| File Upload | 300 | 5 | Resource intensive |
| Webhooks | - | Skip | External services |

### Deployment Checklist

Use this checklist for every Vercel deployment:

#### Pre-Deployment

- [ ] All tests passing (`npm run test`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code reviewed and approved
- [ ] Environment variables documented
- [ ] Database migrations prepared (if any)
- [ ] Breaking changes documented
- [ ] Dependencies up to date (security patches)

#### Deployment Steps

- [ ] Create feature branch from `dev`
- [ ] Make changes and commit
- [ ] Push to GitHub (triggers preview deployment)
- [ ] Review preview deployment
- [ ] Test all critical flows on preview
- [ ] Check Vercel deployment logs for errors
- [ ] Create pull request to `main`
- [ ] Get PR approval
- [ ] Merge to `main` (triggers production deployment)
- [ ] Monitor production deployment

#### Post-Deployment Verification

- [ ] Check Vercel deployment logs
- [ ] Verify health endpoint: `https://your-app.vercel.app/health`
- [ ] Test critical user flows
- [ ] Monitor Sentry for errors (first 10 minutes)
- [ ] Check response times in Vercel analytics
- [ ] Verify WebSocket connections (if applicable)
- [ ] Test rate limiting (make multiple requests)
- [ ] Check database connections
- [ ] Review security headers in browser DevTools

#### Rollback Plan

If issues are detected:

1. **Immediate rollback via Vercel:**
   ```bash
   vercel rollback
   ```

2. **Or redeploy previous version:**
   - Go to Vercel dashboard → Deployments
   - Find last working deployment
   - Click "Promote to Production"

3. **Or revert Git commit:**
   ```bash
   git revert HEAD
   git push origin main
   # Wait for automatic redeployment
   ```

### Custom Domain

1. Go to Vercel dashboard
2. Navigate to your project
3. Go to Settings → Domains
4. Add your custom domain
5. Configure DNS records as instructed by Vercel:
   - **A Record:** Point to Vercel's IP
   - **CNAME:** Point to `cname.vercel-dns.com`
6. Wait for DNS propagation (up to 48 hours)
7. SSL certificate is automatically provisioned

### Monitoring and Logs

#### Vercel Logs

View real-time logs:

```bash
vercel logs
```

Or in the Vercel dashboard:
- Go to your project
- Click on a deployment
- View "Build Logs" and "Function Logs"

#### Sentry Dashboard

Monitor errors at [sentry.io](https://sentry.io):
- Real-time error notifications
- Stack traces with source maps
- Performance metrics
- Release tracking
- User impact analysis

#### Vercel Analytics

Enable Vercel Analytics for:
- Page load times
- Core Web Vitals
- Geographic distribution
- Traffic patterns

### Vercel Edge Cases

#### WebSocket Support

Vercel Serverless Functions have limitations with WebSockets:

- **Duration:** Max 10 seconds for Hobby, 60 seconds for Pro
- **Alternative:** Use Vercel Edge Functions or external WebSocket service
- **Recommendation:** Deploy WebSocket server separately (e.g., Heroku, Railway)

#### Cold Starts

Serverless functions may experience cold starts:

- **Impact:** First request after inactivity may be slower
- **Mitigation:** Use Vercel's "Always-On" feature (Pro plan)
- **Alternative:** Implement keep-alive pings

#### File System

Serverless functions have read-only file systems:

- **Issue:** Cannot write to disk
- **Solution:** Use temporary `/tmp` directory (max 512MB)
- **Better:** Use external storage (S3, Google Cloud Storage)

#### Environment Variables

- **Limit:** 4KB per environment variable
- **Large secrets:** Store in secret management service
- **Automatic:** Some variables set by Vercel (VERCEL_ENV, VERCEL_URL)

### Troubleshooting Vercel Deployments

#### Build Fails

1. Check build logs in Vercel dashboard
2. Verify `package.json` build script
3. Ensure all dependencies in `package.json`
4. Check for TypeScript errors locally

#### Function Timeout

1. Increase timeout in Vercel dashboard (Pro plan)
2. Optimize slow operations
3. Use background jobs for long tasks

#### Environment Variables Not Working

1. Verify variables are set for correct environment (Production/Preview)
2. Check variable names match exactly
3. Redeploy after adding new variables

#### Rate Limiting Issues

1. Check `THROTTLE_TTL` and `THROTTLE_LIMIT` settings
2. Verify IP forwarding is correct
3. Test with `X-Forwarded-For` header

#### 404 Errors

1. Check `vercel.json` routes configuration
2. Verify function file path matches build config
3. Check output directory setting

### Performance Optimization

#### Reduce Cold Start Time

1. Minimize dependencies
2. Use dynamic imports for heavy modules
3. Optimize bundle size
4. Enable edge caching where possible

#### Caching Strategy

```typescript
// Add cache headers in response
res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
```

#### Database Connection Pooling

Use connection pooling to avoid exhausting database connections:

```typescript
// Prisma automatically pools connections
// Configure in DATABASE_URL
DATABASE_URL="postgresql://user:pass@host/db?connection_limit=5"
```

### Best Practices

1. **Environment Parity:** Keep dev/staging/prod environments similar
2. **Secrets Management:** Never commit secrets to Git
3. **Monitoring:** Set up alerts for errors and performance issues
4. **Testing:** Always test on preview before production
5. **Documentation:** Keep deployment docs up to date
6. **Rollback Plan:** Always have a rollback strategy
7. **Incremental Rollout:** Use preview deployments for testing
8. **Health Checks:** Implement comprehensive health endpoints
9. **Error Tracking:** Monitor Sentry for issues
10. **Rate Limiting:** Adjust based on usage patterns

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

> **Note:** For detailed monitoring and observability implementation, see [ROADMAP.md - PHASE 2.5](ROADMAP.md#phase-25-monitoring--observability).

1. **Application Monitoring**
   - Set up error tracking (Sentry, Rollbar)
   - Configure application performance monitoring (APM)
   - Set up log aggregation (ELK Stack, Logtail, Datadog, CloudWatch)
   - Implement Prometheus metrics (see PHASE 2.5)
   - Configure Grafana dashboards (see PHASE 2.5)

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
   - See [ROADMAP.md - Health Checks](ROADMAP.md#health-checks) for implementation details

3. **Alerts**
   - Set up alerts for:
     - High error rates
     - Slow response times
     - Service downtime
     - Resource exhaustion

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
