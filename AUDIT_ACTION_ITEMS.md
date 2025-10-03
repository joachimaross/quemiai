# Audit Action Items & Implementation Roadmap

This document outlines actionable items identified during the comprehensive repository audit, prioritized by urgency and impact.

---

## ✅ Completed Items

### Critical (Fixed)
- [x] **Remove compiled .js files from src/** - 42 files removed, .gitignore updated
- [x] **Add Helmet security middleware** - Added to main.ts
- [x] **Add rate limiting (Throttler)** - Configured in app.module.ts
- [x] **Environment-based CORS** - Updated to use FRONTEND_URL env variable
- [x] **Remove deprecated @types/next** - Uninstalled from package.json

---

## 🔴 High Priority (Do This Week)

### Testing Improvements
**Target: Increase coverage from 47.31% to 60%+**

#### 1. Add API Tests for Low-Coverage Modules

**src/api/users.ts (Current: 11.96% → Target: 80%)**
```typescript
// Create: src/api/__tests__/users.test.ts
describe('Users API', () => {
  describe('GET /users', () => {
    it('should list users with pagination');
    it('should filter users by query');
    it('should handle empty results');
  });
  
  describe('GET /users/:id', () => {
    it('should get user by id');
    it('should return 404 for non-existent user');
  });
  
  describe('PUT /users/:id', () => {
    it('should update user profile');
    it('should validate update data');
    it('should reject unauthorized updates');
  });
  
  describe('DELETE /users/:id', () => {
    it('should delete user');
    it('should require authentication');
  });
});
```

**src/api/marketplace.ts (Current: 20.45% → Target: 80%)**
```typescript
// Create: src/api/__tests__/marketplace.test.ts
describe('Marketplace API', () => {
  describe('POST /marketplace/listings', () => {
    it('should create new listing');
    it('should validate listing data');
  });
  
  describe('GET /marketplace/listings', () => {
    it('should list available items');
    it('should filter by category');
    it('should paginate results');
  });
  
  describe('PUT /marketplace/listings/:id', () => {
    it('should update listing');
    it('should reject unauthorized updates');
  });
  
  describe('POST /marketplace/purchase', () => {
    it('should process purchase');
    it('should handle payment validation');
    it('should update inventory');
  });
});
```

**src/api/ai.ts (Current: 24.61% → Target: 70%)**
```typescript
// Create: src/api/__tests__/ai.test.ts
describe('AI API', () => {
  beforeEach(() => {
    // Mock external AI service calls
  });
  
  describe('POST /ai/generate', () => {
    it('should generate AI content');
    it('should handle API errors gracefully');
    it('should validate input parameters');
  });
  
  describe('POST /ai/analyze', () => {
    it('should analyze content');
    it('should return structured results');
  });
});
```

**Estimated Effort:** 2-3 days
**Impact:** High - Core API coverage

---

### Dependency Updates

#### 2. Update Patch Versions
```bash
npm update @prisma/client prisma typescript redis @sentry/node
```

**Files affected:**
- package.json
- package-lock.json

**Estimated Effort:** 30 minutes
**Impact:** Low risk, keeps dependencies current

---

### Documentation Updates

#### 3. Update README.md with Security Changes
Add section documenting:
- Rate limiting (10 req/min)
- Helmet security headers
- FRONTEND_URL environment variable

**File:** README.md

**Estimated Effort:** 15 minutes
**Impact:** Improves onboarding

---

## 🟡 Medium Priority (Do This Month)

### Security Enhancements

#### 4. Add Sentry for Error Monitoring
```bash
npm install @sentry/node @sentry/tracing
```

**Implementation:**
```typescript
// src/main.ts
import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
}
```

**Files to update:**
- src/main.ts
- .env.example (add SENTRY_DSN)

**Estimated Effort:** 1 hour
**Impact:** Production error tracking

---

#### 5. Replace fluent-ffmpeg (Deprecated)

**Current:** fluent-ffmpeg@2.1.3 (no longer supported)

**Options:**
1. **Direct ffmpeg wrapper** - Custom implementation
2. **ffmpeg-static + custom wrapper** - More control
3. **Evaluate if video processing is actively used**

**Research Questions:**
- Is video transcoding actively used in production?
- What features are critical?
- Can we use cloud-based transcoding (AWS MediaConvert, GCP Transcoder)?

**Action:**
1. Audit video processing usage in codebase
2. If critical: Implement alternative
3. If unused: Remove dependency

**Estimated Effort:** 4-8 hours
**Impact:** Remove deprecated dependency

---

### Performance Optimizations

#### 6. Implement Request Compression
```typescript
// src/main.ts
import compression from 'compression';

app.use(compression({
  threshold: 1024, // Only compress responses > 1KB
}));
```

**Dependencies:**
```bash
npm install compression
npm install --save-dev @types/compression
```

**Estimated Effort:** 30 minutes
**Impact:** Reduce bandwidth usage 30-70%

---

#### 7. Implement Redis Caching Strategy

**Files to create:**
- src/services/cache.service.ts
- src/config/redis.config.ts

**Example implementation:**
```typescript
// src/services/cache.service.ts
import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class CacheService {
  private client: ReturnType<typeof createClient>;

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.client.setEx(key, ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
```

**Use cases:**
- Cache expensive database queries
- Cache API responses
- Session storage
- Rate limiting counters

**Estimated Effort:** 4 hours
**Impact:** Significant performance improvement

---

#### 8. Add Database Indexes

**Action:** Audit Prisma schema for missing indexes

**Common patterns to index:**
- Foreign keys
- Frequently queried fields (email, username)
- Fields used in WHERE clauses
- Fields used in ORDER BY

**Example:**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  createdAt DateTime @default(now())
  
  @@index([createdAt])
  @@index([email])
}
```

**Estimated Effort:** 2-3 hours
**Impact:** Query performance improvement

---

### Testing Enhancements

#### 9. Add Service Layer Tests

**src/services/ai.ts (Current: 21.95% → Target: 70%)**
**src/services/video.ts (Current: 37.5% → Target: 70%)**
**src/services/storage.ts (Current: 62.5% → Target: 80%)**

**Files to create:**
- src/services/__tests__/ai.service.test.ts
- src/services/__tests__/video.service.test.ts
- src/services/__tests__/storage.service.test.ts

**Estimated Effort:** 2-3 days
**Impact:** Increase overall coverage to 60-65%

---

#### 10. Add Middleware Tests

**src/middleware/firebaseAuth.ts (Current: 15.38% → Target: 70%)**

**File to create:**
- src/middleware/__tests__/firebaseAuth.test.ts

**Test cases:**
```typescript
describe('Firebase Auth Middleware', () => {
  it('should validate valid Firebase token');
  it('should reject invalid token');
  it('should reject expired token');
  it('should handle missing token');
  it('should extract user from token');
});
```

**Estimated Effort:** 2-3 hours
**Impact:** Critical auth path coverage

---

## 🟢 Low Priority (Do This Quarter)

### Advanced Features

#### 11. Implement Background Job Processing

**Use case:** Video transcoding, email sending, heavy computations

**Technology:** Bull or BullMQ with Redis

```bash
npm install @nestjs/bull bull
npm install --save-dev @types/bull
```

**Implementation:**
```typescript
// src/modules/jobs/jobs.module.ts
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: 'video-processing',
    }),
  ],
})
export class JobsModule {}
```

**Estimated Effort:** 1-2 days
**Impact:** Enable async processing

---

#### 12. Add Swagger/OpenAPI Documentation

**Current status:** Configured but not enabled

```typescript
// src/main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Quemiai API')
  .setDescription('API documentation for Quemiai backend')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**Estimated Effort:** 1 day (initial setup) + ongoing maintenance
**Impact:** Improved developer experience

---

#### 13. Add E2E Tests

**Framework:** Supertest (already in devDependencies)

**Files to create:**
- test/users.e2e-spec.ts
- test/marketplace.e2e-spec.ts
- test/auth.e2e-spec.ts

**Example:**
```typescript
// test/users.e2e-spec.ts
describe('Users (e2e)', () => {
  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('users');
        expect(Array.isArray(res.body.users)).toBe(true);
      });
  });
});
```

**Estimated Effort:** 3-4 days
**Impact:** End-to-end coverage confidence

---

#### 14. Implement RBAC (Role-Based Access Control)

**Use case:** Admin, User, Moderator roles

**Implementation approach:**
1. Add roles to User model
2. Create Guard for role checking
3. Add decorators for route protection

```typescript
// src/auth/roles.decorator.ts
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// src/auth/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => request.user?.roles?.includes(role));
  }
}
```

**Estimated Effort:** 2-3 days
**Impact:** Fine-grained access control

---

#### 15. Set Up Load Testing

**Follow guide:** load_testing_guidance.md

**Tools:** k6 or Artillery

**Test scenarios:**
1. Baseline: 10 VUs for 1 minute
2. Stress: Ramp up to 100 VUs
3. Spike: Sudden traffic increase
4. Endurance: 50 VUs for 30 minutes

**Estimated Effort:** 1-2 days
**Impact:** Understand system limits

---

## 📊 Progress Tracking

### Coverage Goals

| Metric | Current | Week 1 | Week 2 | Week 4 | Target |
|--------|---------|--------|--------|--------|--------|
| Statements | 47.31% | 55% | 63% | 70% | 75% |
| Branches | 22.67% | 35% | 50% | 60% | 65% |
| Functions | 27.72% | 40% | 55% | 65% | 70% |
| Lines | 45.24% | 53% | 61% | 68% | 75% |

### Implementation Timeline

**Week 1 (High Priority):**
- [ ] Add users.ts API tests
- [ ] Add marketplace.ts API tests
- [ ] Update patch versions
- [ ] Update documentation

**Week 2 (High + Medium):**
- [ ] Add ai.ts API tests
- [ ] Implement request compression
- [ ] Add Sentry integration
- [ ] Start service layer tests

**Week 3 (Medium Priority):**
- [ ] Complete service layer tests
- [ ] Add middleware tests
- [ ] Implement Redis caching strategy
- [ ] Audit and add database indexes

**Week 4 (Medium + Low Priority):**
- [ ] Research fluent-ffmpeg replacement
- [ ] Consider background job processing
- [ ] Enable Swagger documentation
- [ ] Plan E2E testing approach

**Month 2-3 (Low Priority):**
- [ ] Implement background jobs
- [ ] Add E2E tests
- [ ] Implement RBAC
- [ ] Conduct load testing

---

## 🎯 Success Metrics

### Immediate (Week 1)
- [ ] Test coverage > 55%
- [ ] All high-priority items addressed
- [ ] Zero security vulnerabilities maintained
- [ ] All builds passing

### Short-term (Month 1)
- [ ] Test coverage > 70%
- [ ] Redis caching implemented
- [ ] Sentry monitoring active
- [ ] Performance optimizations complete

### Long-term (Quarter 1)
- [ ] Test coverage > 75%
- [ ] Background job processing implemented
- [ ] E2E test suite established
- [ ] Load testing results documented
- [ ] RBAC implemented

---

## 📝 Notes

- All changes should be made in feature branches
- Each major change should have associated tests
- Update documentation alongside code changes
- Run `npm run test:cov` before committing
- Monitor production metrics after each deployment

---

**Last Updated:** 2024
**Next Review:** After Week 1 implementation
