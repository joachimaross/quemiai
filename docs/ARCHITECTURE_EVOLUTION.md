# Architecture Evolution Plan

This document outlines the evolution of Quemiai's architecture from a monolithic application to a scalable, distributed microservices platform.

## Table of Contents

- [Current State](#current-state)
- [Target State](#target-state)
- [Evolution Phases](#evolution-phases)
- [Monorepo Split](#monorepo-split)
- [Reverse Proxy](#reverse-proxy)
- [Microservices Preparation](#microservices-preparation)
- [Migration Strategy](#migration-strategy)

## Current State

### Architecture Overview

```
┌─────────────────────────────────────────┐
│         Monolithic Application          │
├─────────────────────────────────────────┤
│  Frontend (Next.js) + Backend (NestJS) │
│                                         │
│  ├── API Routes                        │
│  ├── WebSocket (Socket.io)            │
│  ├── Authentication                     │
│  ├── Database (PostgreSQL)             │
│  └── Cache (Redis)                     │
└─────────────────────────────────────────┘
```

**Characteristics:**
- Single deployment unit
- Shared database and cache
- Tight coupling between frontend and backend
- Simple to develop and deploy
- Scaling challenges as complexity grows

**Strengths:**
- Simple deployment
- Easy local development
- Fast feature development
- No network overhead between services

**Limitations:**
- Difficult to scale independently
- Technology lock-in
- Deployment of small changes requires full app redeployment
- Larger team coordination challenges
- Single point of failure

## Target State

### Microservices Architecture

```
┌──────────────────────────────────────────────────────┐
│                  API Gateway / Proxy                  │
└────────┬──────────────────────────────────────┬──────┘
         │                                      │
    ┌────▼─────┐  ┌──────────┐  ┌──────────┐  ▼───────┐
    │ Frontend │  │   Auth   │  │   Chat   │  │ Courses│
    │ (Next.js)│  │ Service  │  │ Service  │  │ Service│
    └──────────┘  └────┬─────┘  └────┬─────┘  └───┬────┘
                       │             │            │
              ┌────────▼─────────────▼────────────▼──────┐
              │        Shared Infrastructure              │
              ├───────────────────────────────────────────┤
              │  PostgreSQL │ Redis │ Message Queue      │
              │  Object Storage │ Monitoring             │
              └───────────────────────────────────────────┘
```

**Characteristics:**
- Independent services
- Service-specific databases (database per service pattern)
- API Gateway for routing and authentication
- Event-driven communication
- Independent scaling and deployment

**Benefits:**
- Independent scaling per service
- Technology flexibility
- Isolated failures
- Team autonomy
- Easier to understand and maintain individual services

**Challenges:**
- Increased operational complexity
- Network latency between services
- Distributed data management
- Testing complexity
- Deployment orchestration

## Evolution Phases

### Phase 1: Monorepo Split (Immediate)

**Goal:** Separate frontend and backend into distinct projects while maintaining monorepo benefits.

**Changes:**
- Create separate `frontend/` and `backend/` directories
- Independent `package.json` for each
- Shared common code in `packages/` directory
- Separate build and deployment processes

**Timeline:** 2-3 weeks

### Phase 2: Reverse Proxy Setup (Short-term)

**Goal:** Implement API gateway/reverse proxy for better routing and security.

**Changes:**
- Set up Nginx or Traefik as reverse proxy
- Route `/api/*` to backend
- Route `/` to frontend
- Implement rate limiting at proxy level
- SSL termination at proxy

**Timeline:** 1-2 weeks

### Phase 3: Service Extraction (Medium-term)

**Goal:** Extract bounded contexts into independent services.

**Order of extraction:**
1. Authentication Service (stateless, well-defined)
2. Chat Service (real-time, resource-intensive)
3. Course Service (business logic, independent domain)
4. User Service (core domain)

**Timeline:** 2-3 months (iterative)

### Phase 4: Event-Driven Architecture (Long-term)

**Goal:** Implement asynchronous communication between services.

**Changes:**
- Set up message broker (RabbitMQ, Kafka)
- Event sourcing for critical domains
- CQRS for read/write separation
- Saga pattern for distributed transactions

**Timeline:** 3-4 months

## Monorepo Split

### Directory Structure

**Before:**
```
quemiai/
├── src/
│   ├── api/
│   ├── modules/
│   ├── config/
│   └── main.ts
├── frontend/
│   └── (Next.js app)
└── package.json
```

**After:**
```
quemiai/
├── backend/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── next.config.js
├── packages/
│   ├── shared/
│   │   ├── types/
│   │   ├── utils/
│   │   └── package.json
│   └── config/
│       └── eslint-config/
├── docs/
├── docker-compose.yml
└── package.json (workspace root)
```

### Workspace Configuration

**Root `package.json`:**
```json
{
  "name": "quemiai-workspace",
  "private": true,
  "workspaces": [
    "backend",
    "frontend",
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev:backend & npm run dev:frontend",
    "dev:backend": "npm run start:dev --workspace=backend",
    "dev:frontend": "npm run dev --workspace=frontend",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces"
  }
}
```

### Shared Packages

**`packages/shared/types/`:**
```typescript
// Shared TypeScript interfaces
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}
```

**`packages/shared/utils/`:**
```typescript
// Shared utility functions
export function formatDate(date: Date): string {
  return date.toISOString();
}
```

### Migration Steps

1. **Create new directory structure**
   ```bash
   mkdir -p backend frontend packages/shared
   ```

2. **Move backend code**
   ```bash
   mv src backend/
   mv tests backend/
   cp package.json backend/
   ```

3. **Update imports**
   ```typescript
   // Before
   import { User } from '../types/user';
   
   // After
   import { User } from '@quemiai/shared/types';
   ```

4. **Update deployment**
   - Separate Docker images
   - Independent CI/CD pipelines
   - Update environment variables

5. **Test thoroughly**
   ```bash
   npm run test --workspaces
   npm run build --workspaces
   ```

## Reverse Proxy

### Nginx Configuration

**`nginx.conf`:**
```nginx
upstream backend {
    server backend:4000;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name quemiai.com;

    # API requests
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health checks
    location /health {
        proxy_pass http://backend;
        access_log off;
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
}
```

### Docker Compose with Proxy

**`docker-compose.yml`:**
```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend

  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    expose:
      - "4000"

  frontend:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://nginx/api
    expose:
      - "3000"

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: quemiai
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Benefits

1. **Single Entry Point:** All traffic goes through one domain
2. **SSL Termination:** Handle HTTPS at proxy level
3. **Load Balancing:** Distribute traffic across multiple backend instances
4. **Rate Limiting:** Protect APIs from abuse
5. **Caching:** Cache static content at proxy level
6. **Security:** Hide internal service structure

## Microservices Preparation

### Service Boundaries

Identify bounded contexts using Domain-Driven Design:

**Authentication Service:**
- User registration
- Login/logout
- JWT token management
- OAuth integration
- Password reset

**Chat Service:**
- Real-time messaging
- WebSocket connections
- Message history
- Typing indicators
- Read receipts

**Course Service:**
- Course creation
- Enrollment
- Progress tracking
- Assignments
- Grades

**User Service:**
- Profile management
- User preferences
- Relationships (followers/following)
- Activity feed

### Service Template

Each service should have:

```
service-name/
├── src/
│   ├── domain/          # Domain models
│   ├── application/     # Use cases
│   ├── infrastructure/  # External services
│   └── presentation/    # Controllers
├── tests/
├── Dockerfile
├── package.json
└── README.md
```

### Inter-Service Communication

**Synchronous (REST/gRPC):**
```typescript
// Example: Auth service calling User service
const response = await this.http.get(
  'http://user-service:3001/users/123',
  {
    headers: {
      'X-Service-Token': process.env.SERVICE_TOKEN,
    },
  },
);
```

**Asynchronous (Message Queue):**
```typescript
// Example: Publishing event
await this.messageQueue.publish('user.created', {
  userId: user.id,
  email: user.email,
  timestamp: new Date(),
});

// Subscribing to events
this.messageQueue.subscribe('user.created', async (event) => {
  await this.sendWelcomeEmail(event.email);
});
```

### Data Management

**Database per Service:**
```
┌─────────────────┐    ┌─────────────────┐
│  Auth Service   │    │  Chat Service   │
├─────────────────┤    ├─────────────────┤
│   Auth DB       │    │   Chat DB       │
└─────────────────┘    └─────────────────┘
```

**Shared Database (Transition):**
```
┌─────────────────┐    ┌─────────────────┐
│  Auth Service   │    │  Chat Service   │
└────────┬────────┘    └────────┬────────┘
         │                      │
         └──────────┬───────────┘
                    │
            ┌───────▼────────┐
            │  Shared DB     │
            └────────────────┘
```

### API Gateway Pattern

**Gateway Responsibilities:**
- Request routing
- Authentication
- Rate limiting
- Request/response transformation
- Caching
- API versioning

**Example with NestJS:**
```typescript
@Controller('api/v1')
export class ApiGatewayController {
  constructor(
    private readonly authProxy: AuthProxyService,
    private readonly chatProxy: ChatProxyService,
  ) {}

  @Post('auth/login')
  async login(@Body() credentials: LoginDto) {
    return this.authProxy.login(credentials);
  }

  @Get('chat/messages')
  @UseGuards(JwtAuthGuard)
  async getMessages(@Query() query: GetMessagesDto) {
    return this.chatProxy.getMessages(query);
  }
}
```

## Migration Strategy

### Strangler Fig Pattern

Gradually replace parts of the monolith:

```
1. Identify service boundary
2. Create new service
3. Route traffic to new service
4. Remove old code from monolith
5. Repeat
```

**Phases:**

**Phase 1: Both systems run in parallel**
```
Request → Proxy → Monolith (Old Code)
              └→ New Service (New Feature)
```

**Phase 2: Gradual migration**
```
Request → Proxy → Monolith (Legacy Features)
              └→ New Service (Migrated Features)
```

**Phase 3: Complete migration**
```
Request → Proxy → New Service (All Features)
```

### Risk Mitigation

1. **Feature Flags:**
   ```typescript
   if (this.featureFlags.isEnabled('use-new-auth-service')) {
     return this.newAuthService.login(credentials);
   }
   return this.oldAuthService.login(credentials);
   ```

2. **Canary Deployments:**
   - Route 5% of traffic to new service
   - Monitor metrics
   - Gradually increase traffic
   - Rollback if issues detected

3. **Blue-Green Deployment:**
   - Deploy new version alongside old
   - Switch traffic instantly
   - Keep old version for quick rollback

4. **Database Migration:**
   - Create read replicas
   - Dual-write pattern
   - Verify data consistency
   - Switch read traffic
   - Remove old writes

### Monitoring & Observability

**Service-level metrics:**
- Request rate
- Error rate
- Latency (p50, p95, p99)
- Resource usage

**Business metrics:**
- Active users
- Feature usage
- Conversion rates

**Distributed tracing:**
- Trace requests across services
- Identify bottlenecks
- Debug failures

**Tools:**
- Prometheus + Grafana (metrics)
- Jaeger (distributed tracing)
- ELK Stack (logging)
- Sentry (error tracking)

## Best Practices

1. **Start Small:** Begin with least critical service
2. **Automate Everything:** CI/CD, testing, deployment
3. **Monitor Extensively:** Know what's happening in production
4. **Document APIs:** Use OpenAPI/Swagger
5. **Version APIs:** Support backward compatibility
6. **Test Integration:** End-to-end tests across services
7. **Plan for Failures:** Circuit breakers, retries, fallbacks
8. **Security First:** Service-to-service authentication
9. **Cost Management:** Monitor cloud costs
10. **Team Structure:** Align teams with service boundaries

## Timeline & Priorities

### Q1 2025: Foundation
- Monorepo split
- Reverse proxy setup
- Documentation
- Team training

### Q2 2025: First Service
- Extract Authentication service
- Set up API gateway
- Implement monitoring
- Load testing

### Q3 2025: Additional Services
- Extract Chat service
- Extract Course service
- Implement event bus
- Optimize performance

### Q4 2025: Full Migration
- Extract remaining services
- Database separation
- Production optimization
- Post-migration review

## Success Criteria

- [ ] Independent service deployment
- [ ] 99.9% uptime maintained
- [ ] API latency < 200ms (p95)
- [ ] Zero-downtime deployments
- [ ] Clear service ownership
- [ ] Automated testing pipeline
- [ ] Comprehensive monitoring
- [ ] Disaster recovery plan
- [ ] Cost reduction vs monolith
- [ ] Developer satisfaction improved

---

**Last Updated:** December 2024  
**Maintained by:** Quemiai Architecture Team
