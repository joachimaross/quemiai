# Redis Caching Strategy Guide

This guide explains the caching implementation and best practices for the Quemiai platform.

## Overview

The application uses Redis for distributed caching to improve performance and reduce database load. The `CacheService` provides a comprehensive API for caching operations with support for TTL, tagging, and invalidation strategies.

## Architecture

### Cache Service Features

1. **Automatic Reconnection**: Exponential backoff strategy for resilient connections
2. **Key Prefixing**: All keys are prefixed with `quemiai:` to avoid conflicts
3. **Tag-Based Invalidation**: Group related cache entries for bulk invalidation
4. **Cache-Aside Pattern**: Automatic fetch-and-cache with `getOrSet()`
5. **Statistics**: Monitor cache usage and memory consumption

## Basic Usage

### Installation

The `CacheService` is globally available through the `CacheModule`. No additional imports needed in most cases.

### Simple Get/Set

```typescript
import { Injectable } from '@nestjs/common';
import { CacheService } from './services/cache.service';

@Injectable()
export class UserService {
  constructor(private cacheService: CacheService) {}

  async getUser(userId: string) {
    // Try cache first
    const cached = await this.cacheService.get<User>(`user:${userId}`);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const user = await this.database.findUser(userId);

    // Store in cache for 1 hour
    await this.cacheService.set(`user:${userId}`, user, { ttl: 3600 });

    return user;
  }
}
```

### Cache-Aside Pattern

The `getOrSet()` method simplifies the cache-aside pattern:

```typescript
async getUser(userId: string) {
  return this.cacheService.getOrSet(
    `user:${userId}`,
    async () => {
      return await this.database.findUser(userId);
    },
    { ttl: 3600 } // 1 hour
  );
}
```

## Advanced Features

### Tag-Based Invalidation

Group related cache entries with tags for efficient bulk invalidation:

```typescript
// Cache user profile with tags
await this.cacheService.set(
  `user:${userId}:profile`,
  userProfile,
  {
    ttl: 3600,
    tags: ['user', `user:${userId}`]
  }
);

// Cache user posts with tags
await this.cacheService.set(
  `user:${userId}:posts`,
  userPosts,
  {
    ttl: 1800,
    tags: ['posts', `user:${userId}`]
  }
);

// Later, invalidate all user data at once
await this.cacheService.invalidateByTag(`user:${userId}`);
```

### Pattern-Based Deletion

Delete multiple keys matching a pattern:

```typescript
// Delete all user-related caches
await this.cacheService.deleteByPattern('user:*');

// Delete all session caches
await this.cacheService.deleteByPattern('session:*');
```

### Counter Operations

Use Redis for atomic counters:

```typescript
// Increment view count
const viewCount = await this.cacheService.increment(`post:${postId}:views`);

// Increment by custom amount
await this.cacheService.increment(`user:${userId}:points`, 10);
```

### Cache Statistics

Monitor cache usage:

```typescript
const stats = await this.cacheService.getStats();
console.log(`Cache contains ${stats.keys} keys`);
console.log(`Memory usage: ${stats.memory}`);
```

## Caching Strategies

### 1. Cache-Aside (Lazy Loading)

**When to use**: Most read-heavy operations

```typescript
async getData(id: string) {
  return this.cacheService.getOrSet(
    `data:${id}`,
    () => this.fetchFromDatabase(id),
    { ttl: 3600 }
  );
}
```

**Pros**: 
- Only cache data that's actually requested
- Simple to implement

**Cons**: 
- Initial request is slow (cache miss)
- Risk of cache stampede

### 2. Write-Through

**When to use**: Critical data that must be immediately cached

```typescript
async updateUser(userId: string, data: UserData) {
  // Update database
  const user = await this.database.updateUser(userId, data);
  
  // Update cache
  await this.cacheService.set(`user:${userId}`, user, { ttl: 3600 });
  
  return user;
}
```

**Pros**: 
- Cache is always up-to-date
- No cache misses on reads

**Cons**: 
- Extra write latency
- May cache unused data

### 3. Write-Behind (Write-Back)

**When to use**: High-write scenarios where eventual consistency is acceptable

```typescript
async incrementViewCount(postId: string) {
  // Increment in cache immediately
  const count = await this.cacheService.increment(`post:${postId}:views`);
  
  // Schedule background job to update database
  await this.queue.add('updateViewCount', { postId, count });
  
  return count;
}
```

**Pros**: 
- Very fast writes
- Can batch database updates

**Cons**: 
- Risk of data loss if cache fails
- Complex implementation

### 4. Refresh-Ahead

**When to use**: Predictable access patterns, prevent cache expiration

```typescript
async getPopularPosts() {
  return this.cacheService.getOrSet(
    'popular:posts',
    async () => {
      const posts = await this.database.getPopularPosts();
      
      // Refresh cache proactively before expiration
      this.scheduleRefresh('popular:posts', 3000); // Refresh after 50 minutes
      
      return posts;
    },
    { ttl: 3600 } // Expire after 1 hour
  );
}
```

## TTL Guidelines

Choose appropriate TTL values based on data characteristics:

| Data Type | Suggested TTL | Reason |
|-----------|--------------|--------|
| User profile | 1 hour | Changes infrequently |
| User session | 24 hours | Long-lived sessions |
| API responses | 5-15 minutes | Balance freshness and performance |
| Search results | 5 minutes | Dynamic but cacheable |
| Configuration | 1 day | Very stable data |
| Feed/timeline | 1-2 minutes | Frequently updated |
| Analytics/stats | 15 minutes | Can tolerate staleness |
| Real-time data | Do not cache | Requires immediate consistency |

## Cache Invalidation Patterns

### Event-Driven Invalidation

```typescript
@Injectable()
export class UserService {
  async updateUserProfile(userId: string, profile: UserProfile) {
    // Update database
    await this.database.updateProfile(userId, profile);
    
    // Invalidate related caches
    await this.cacheService.invalidateByTag(`user:${userId}`);
    
    // Emit event for other services
    this.eventBus.emit('user.updated', { userId });
  }
}
```

### Time-Based Invalidation

```typescript
// Cache with automatic expiration
await this.cacheService.set(
  'trending:posts',
  trendingPosts,
  { ttl: 300 } // Auto-expire after 5 minutes
);
```

### Manual Invalidation

```typescript
// Clear specific key
await this.cacheService.delete(`user:${userId}`);

// Clear all user caches
await this.cacheService.deleteByPattern('user:*');

// Clear entire cache (use with caution!)
await this.cacheService.clear();
```

## Performance Optimization

### 1. Cache Warming

Pre-populate cache during application startup:

```typescript
@Injectable()
export class CacheWarmingService implements OnModuleInit {
  constructor(private cacheService: CacheService) {}
  
  async onModuleInit() {
    // Warm up frequently accessed data
    const popularPosts = await this.database.getPopularPosts();
    await this.cacheService.set('popular:posts', popularPosts, { ttl: 3600 });
  }
}
```

### 2. Batch Operations

Group multiple cache operations:

```typescript
async getUsersWithProfiles(userIds: string[]) {
  const promises = userIds.map(id =>
    this.cacheService.getOrSet(
      `user:${id}:profile`,
      () => this.database.getProfile(id),
      { ttl: 3600 }
    )
  );
  
  return Promise.all(promises);
}
```

### 3. Cache Stampede Prevention

Use locking to prevent multiple simultaneous cache fills:

```typescript
async getExpensiveData(key: string) {
  // Check if data is being computed
  const lockKey = `lock:${key}`;
  const isLocked = await this.cacheService.exists(lockKey);
  
  if (isLocked) {
    // Wait and retry
    await this.sleep(100);
    return this.cacheService.get(key);
  }
  
  // Acquire lock
  await this.cacheService.set(lockKey, true, { ttl: 30 });
  
  try {
    // Compute and cache
    const data = await this.expensiveOperation();
    await this.cacheService.set(key, data, { ttl: 3600 });
    return data;
  } finally {
    // Release lock
    await this.cacheService.delete(lockKey);
  }
}
```

## Monitoring & Debugging

### Health Checks

The cache service is monitored via the health endpoint:

```bash
curl http://localhost:4000/health/ready
```

Response includes Redis connectivity status.

### Cache Statistics

Get cache metrics:

```typescript
const stats = await this.cacheService.getStats();
console.log(`Keys: ${stats.keys}, Memory: ${stats.memory}`);
```

### Logging

The `CacheService` logs all errors and important events:

```
[CacheService] Redis Client Connected
[CacheService] Deleted 15 keys matching pattern user:*
[CacheService] Invalidated 8 keys with tag user:123
```

## Best Practices

### ✅ DO

1. **Use appropriate TTL values** - Balance freshness and performance
2. **Implement cache invalidation** - Keep data consistent
3. **Use tags for related data** - Simplify bulk invalidation
4. **Monitor cache hit rate** - Optimize caching strategy
5. **Handle cache failures gracefully** - Application should work without cache
6. **Use key prefixes** - Organize cache namespace
7. **Cache immutable data longer** - User IDs, product codes
8. **Implement circuit breakers** - Prevent cascading failures

### ❌ DON'T

1. **Don't cache everything** - Only cache high-value data
2. **Don't use very long TTLs** - Risk of stale data
3. **Don't cache sensitive data** - Unless encrypted
4. **Don't rely on cache for correctness** - Cache can fail
5. **Don't cache real-time data** - Use WebSocket instead
6. **Don't store large objects** - Consider compression or splitting
7. **Don't ignore memory limits** - Monitor Redis memory usage
8. **Don't use cache as primary storage** - Always persist to database

## Configuration

### Environment Variables

```env
# Redis connection
REDIS_URL=redis://localhost:6379

# Optional: Redis password
REDIS_PASSWORD=your_password

# Optional: Redis database number
REDIS_DB=0
```

### Redis Configuration

Recommended Redis configuration for production:

```conf
# Maximum memory
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence (optional)
save 900 1
save 300 10

# Replication (for HA)
replica-read-only yes
```

## Troubleshooting

### Issue: Cache Misses

**Solution**: 
- Check TTL values (may be too short)
- Verify cache warming is working
- Monitor for cache evictions

### Issue: Memory Usage High

**Solution**:
- Reduce TTL values
- Implement LRU eviction policy
- Compress large objects
- Review what's being cached

### Issue: Stale Data

**Solution**:
- Reduce TTL values
- Implement proper invalidation
- Use event-driven invalidation
- Add cache versioning

### Issue: Redis Connection Errors

**Solution**:
- Check Redis is running: `redis-cli ping`
- Verify connection string
- Check network/firewall rules
- Review Redis logs

## Advanced Topics

### Distributed Caching

For multi-instance deployments, Redis provides built-in distributed caching with:
- Consistent hashing
- Replication
- Sentinel for high availability
- Cluster mode for sharding

### Cache Compression

For large objects, consider compression:

```typescript
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

async setCached(key: string, value: any) {
  const json = JSON.stringify(value);
  const compressed = await gzipAsync(Buffer.from(json));
  await this.cacheService.set(key, compressed.toString('base64'));
}
```

### Cache Versioning

Handle schema changes with versioning:

```typescript
const CACHE_VERSION = 'v2';

async getUser(userId: string) {
  return this.cacheService.getOrSet(
    `${CACHE_VERSION}:user:${userId}`,
    () => this.database.findUser(userId),
    { ttl: 3600 }
  );
}
```

## References

- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Caching Strategies](https://docs.aws.amazon.com/AmazonElastiCache/latest/mem-ug/Strategies.html)
- [Redis Node.js Client](https://github.com/redis/node-redis)

---

**Last Updated**: October 2024
