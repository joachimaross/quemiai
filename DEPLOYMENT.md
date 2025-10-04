# Deployment Guide

This guide covers deployment strategies for the Quemiai platform, including both the NestJS backend and Next.js frontend applications.

> **📋 See Also:** [ROADMAP.md](ROADMAP.md) for planned enhancements to monitoring, performance, security, and architecture.
> 
> **📂 Frontend Documentation:** See [frontend/README.md](frontend/README.md) for detailed Next.js frontend setup and deployment instructions.
>
> **🔧 Vercel Troubleshooting:** See [VERCEL_TROUBLESHOOTING.md](VERCEL_TROUBLESHOOTING.md) for comprehensive Vercel deployment troubleshooting and configuration guide.

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

### Frontend Deployment (Next.js)

The frontend application is located in the `/frontend` directory and is configured for Vercel deployment with enterprise-grade security and performance settings.

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the frontend directory:
```bash
cd frontend
vercel

# Or deploy to production
vercel --prod
```

### Configuration

The frontend has been configured with:

- **vercel.json**: Enterprise-grade configuration including:
  - Security headers (HSTS, X-Frame-Options, CSP, etc.)
  - Caching strategies for static assets
  - Clean URLs and trailing slash handling
  - Placeholder sections for rewrites and redirects

- **next.config.js**: Next.js configuration with:
  - React Strict Mode
  - Security headers
  - Image optimization
  - Production optimizations

### Vercel Project Settings

**Important**: When setting up your Vercel project:

1. In the Vercel dashboard, go to your project **Settings** → **General**
2. Set **Root Directory** to `frontend`
3. The **Build Command** and **Install Command** will be read from `vercel.json`
4. Add environment variables in **Settings** → **Environment Variables**

### Backend Deployment (Optional)

For deploying the NestJS backend to Vercel as serverless functions, you would need a separate configuration. The current setup is optimized for the Next.js frontend.

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

> **Note:** For comprehensive security implementation, see [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md).

1. **Never commit `.env` files** to version control (✅ Pre-commit hooks configured)
2. **Use strong secrets** for JWT and other security tokens
3. **Rotate secrets regularly** in production (every 90 days minimum)
4. **Use secret management** services (AWS Secrets Manager, HashiCorp Vault, etc.)
5. **Enable security headers** with Helmet middleware (✅ Implemented)
6. **Implement vulnerability scanning** with npm audit, Dependabot, and Snyk (✅ Implemented)
7. **Use JWT refresh tokens** with proper expiration (✅ Supported)
8. **Implement RBAC** for role-based access control (✅ Implemented)

## Database Connection Management

### Connection Pooling Configuration

The application uses Prisma with PostgreSQL connection pooling. Configure in your `DATABASE_URL`:

```env
# Recommended for production
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20&connect_timeout=10"
```

**Connection Parameters:**
- `connection_limit`: Maximum connections per application instance (default: 20)
- `pool_timeout`: Max seconds to wait for connection from pool (default: 20)
- `connect_timeout`: Max seconds to wait for initial connection (default: 10)

### Recommended Connection Limits

**Small Deployments (1-2 instances):**
```env
DATABASE_URL="...?connection_limit=20&pool_timeout=20"
```

**Medium Deployments (3-5 instances):**
```env
DATABASE_URL="...?connection_limit=15&pool_timeout=20"
```

**Large Deployments (6+ instances):**
```env
DATABASE_URL="...?connection_limit=10&pool_timeout=20"
```

**Formula:** Total connections = `connection_limit × number_of_instances`

**PostgreSQL Default:** `max_connections = 100`

Reserve 10-20 connections for maintenance, monitoring, and emergency access.

### PgBouncer Setup (Recommended for Production)

PgBouncer is a lightweight connection pooler for PostgreSQL that significantly reduces connection overhead.

**Installation:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install pgbouncer

# macOS
brew install pgbouncer

# Docker
docker run -d --name pgbouncer \
  -p 6432:6432 \
  -v $(pwd)/pgbouncer.ini:/etc/pgbouncer/pgbouncer.ini \
  edoburu/pgbouncer
```

**Configuration (`/etc/pgbouncer/pgbouncer.ini`):**
```ini
[databases]
quemiai = host=localhost port=5432 dbname=quemiai

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt

# Pool configuration
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 3

# Connection lifetime
server_lifetime = 3600
server_idle_timeout = 600
server_connect_timeout = 15

# Logging
log_connections = 1
log_disconnections = 1
log_pooler_errors = 1
```

**User Authentication (`/etc/pgbouncer/userlist.txt`):**
```
"postgres" "md5<hashed_password>"
```

Generate hashed password:
```bash
echo -n "passwordpostgres" | md5sum | awk '{print "md5"$1}'
```

**Update Connection String:**
```env
# Connect through PgBouncer (port 6432) instead of direct PostgreSQL (port 5432)
DATABASE_URL="postgresql://user:pass@localhost:6432/quemiai?pgbouncer=true"
```

**Start PgBouncer:**
```bash
sudo systemctl start pgbouncer
sudo systemctl enable pgbouncer
sudo systemctl status pgbouncer
```

**Monitoring PgBouncer:**
```bash
# Connect to PgBouncer admin console
psql -h localhost -p 6432 -U postgres pgbouncer

# Show pools
SHOW POOLS;

# Show stats
SHOW STATS;

# Show servers
SHOW SERVERS;
```

### Database Connection Best Practices

1. **Use connection pooling** via Prisma or PgBouncer
2. **Set appropriate connection limits** based on instance count
3. **Monitor connection usage** with `SHOW STATS` in PostgreSQL/PgBouncer
4. **Use read replicas** for read-heavy workloads
5. **Implement connection retry logic** with exponential backoff
6. **Close connections properly** in application shutdown handlers

## WebSocket Scaling & Real-Time Communication

### Single Instance Setup

For development or small deployments, Socket.IO works out-of-the-box with no additional configuration.

### Multi-Instance Setup with Redis Adapter

When running multiple application instances behind a load balancer, use the Redis adapter to share WebSocket state.

**Install Dependencies:**
```bash
npm install @socket.io/redis-adapter redis
```

**Create Redis Adapter (`apps/backend/src/adapters/redis-io.adapter.ts`):**
```typescript
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ 
      url: process.env.REDIS_URL || 'redis://localhost:6379' 
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
    console.log('Redis adapter for Socket.IO connected');
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
```

**Update `main.ts`:**
```typescript
import { RedisIoAdapter } from './adapters/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure Redis adapter for WebSockets
  if (process.env.REDIS_URL) {
    const redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
    console.log('WebSocket scaling enabled with Redis adapter');
  }

  await app.listen(3000);
}
```

**Environment Configuration:**
```env
REDIS_URL=redis://localhost:6379
```

### Load Balancer Configuration

#### Sticky Sessions (IP Hash)

**Nginx Configuration:**
```nginx
upstream backend {
    ip_hash;  # Ensures same client always connects to same instance
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket specific timeouts
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

**AWS Application Load Balancer:**
```bash
# Enable sticky sessions via AWS CLI
aws elbv2 modify-target-group-attributes \
  --target-group-arn arn:aws:elasticloadbalancing:... \
  --attributes Key=stickiness.enabled,Value=true \
               Key=stickiness.type,Value=lb_cookie \
               Key=stickiness.lb_cookie.duration_seconds,Value=86400
```

#### Redis Adapter (Recommended)

With Redis adapter, sticky sessions are not required. Clients can connect to any instance:

```nginx
upstream backend {
    least_conn;  # Distribute load evenly
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

### Testing Multi-Instance WebSocket Setup

**Test Script (`test-websocket.js`):**
```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:4000', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  socket.emit('message', { text: 'Hello from test client!' });
});

socket.on('message', (data) => {
  console.log('Received:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

**Load Test:**
```bash
# Install k6 for load testing
brew install k6  # macOS
# or download from https://k6.io/

# Run WebSocket load test
k6 run websocket-load-test.js
```

**Load Test Script (`websocket-load-test.js`):**
```javascript
import ws from 'k6/ws';
import { check } from 'k6';

export const options = {
  vus: 100,  // 100 concurrent connections
  duration: '60s',
};

export default function () {
  const url = 'ws://localhost:4000';
  
  const response = ws.connect(url, {}, function (socket) {
    socket.on('open', () => {
      console.log('Connected');
      socket.send(JSON.stringify({ type: 'ping' }));
    });

    socket.on('message', (data) => {
      console.log('Message received:', data);
    });

    socket.on('close', () => {
      console.log('Disconnected');
    });

    socket.setTimeout(() => {
      socket.close();
    }, 30000);
  });

  check(response, { 'status is 101': (r) => r && r.status === 101 });
}
```

### WebSocket Monitoring

**Monitor Redis Pub/Sub:**
```bash
redis-cli
> PUBSUB CHANNELS
> PUBSUB NUMSUB socket.io#/#
> MONITOR
```

**Monitor Active Connections:**
```typescript
// Add to your gateway
@WebSocketGateway()
export class ChatGateway {
  private connectedClients = new Map<string, Socket>();

  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client);
    console.log(`Client connected: ${client.id} (Total: ${this.connectedClients.size})`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    console.log(`Client disconnected: ${client.id} (Total: ${this.connectedClients.size})`);
  }

  @Get('stats')
  getStats() {
    return {
      connectedClients: this.connectedClients.size,
      uptime: process.uptime(),
    };
  }
}
```

### WebSocket Best Practices

1. **Use Redis adapter** for multi-instance deployments
2. **Implement heartbeat/ping** to detect disconnected clients
3. **Add connection limits** per user to prevent abuse
4. **Use rooms** to organize clients by channel/conversation
5. **Implement exponential backoff** for reconnection logic
6. **Log connection events** for monitoring
7. **Set appropriate timeouts** in load balancer configuration

### Security Best Practices

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
