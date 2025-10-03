# Migration Guide: Strategic Improvements

This guide walks you through migrating your Quemiai instance to include all the new strategic improvements.

## Prerequisites

- Running Quemiai backend instance
- PostgreSQL database access
- Redis instance (optional but recommended)
- Node.js 18+ and npm

## Step-by-Step Migration

### Step 1: Backup Your Database

**Important**: Always backup before running migrations!

```bash
# PostgreSQL backup
pg_dump -U your_user -d quemiai > backup_$(date +%Y%m%d).sql

# Or using Prisma
npx prisma db pull
```

### Step 2: Pull Latest Code

```bash
git pull origin main
npm install
```

### Step 3: Update Environment Variables

Add these to your `.env` file:

```env
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/quemiai"

# Optional but recommended for caching
REDIS_URL="redis://localhost:6379"

# Optional for Redis configuration
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
```

### Step 4: Generate and Run Database Migrations

```bash
# Generate Prisma client with new models
npx prisma generate

# Create a migration (development)
npx prisma migrate dev --name add_strategic_improvements

# Or apply migrations (production)
npx prisma migrate deploy
```

### Step 5: Verify Database Schema

Check that all new tables were created:

```sql
-- Check for new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'Story', 
  'StoryReaction', 
  'StoryReply',
  'PostAnalytics',
  'UserAnalytics',
  'AnalyticsEvent',
  'UserSettings',
  'Group',
  'GroupMember',
  'Badge',
  'UserBadge',
  'Leaderboard',
  'Report',
  'FriendSuggestion'
);
```

### Step 6: Seed Initial Data (Optional)

Create badges for the gamification system:

```bash
# Create a seed script or use Prisma Studio
npx prisma studio
```

Example badges to create:

```typescript
// In Prisma Studio or a seed script
const badges = [
  {
    name: "First Post",
    description: "Created your first post",
    category: "milestone",
    rarity: "common"
  },
  {
    name: "Popular Creator",
    description: "Got 1000 likes",
    category: "achievement",
    rarity: "rare"
  },
  {
    name: "Community Leader",
    description: "Created a group with 100+ members",
    category: "community",
    rarity: "epic"
  },
  {
    name: "Early Adopter",
    description: "One of the first 100 users",
    category: "special",
    rarity: "legendary"
  }
];
```

### Step 7: Test the API

```bash
# Start the application
npm run start:dev

# Test health check
curl http://localhost:3000/health

# Test new endpoints
curl http://localhost:3000/stories
curl http://localhost:3000/analytics/posts/test-id
curl http://localhost:3000/social/badges
```

### Step 8: Configure Redis (Optional)

If you have Redis available:

```bash
# Install Redis (Ubuntu/Debian)
sudo apt-get install redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:latest

# Test connection
redis-cli ping
# Should return: PONG
```

The application will work without Redis, but caching will be disabled.

### Step 9: Update Frontend Configuration

If using the frontend, update API endpoints:

```typescript
// frontend/src/lib/apiClient.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Add new endpoint helpers
export const api = {
  stories: {
    getAll: () => fetch(`${API_BASE_URL}/stories`),
    create: (data) => fetch(`${API_BASE_URL}/stories`, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    // ... more endpoints
  },
  analytics: {
    getPostAnalytics: (postId) => 
      fetch(`${API_BASE_URL}/analytics/posts/${postId}`),
    // ... more endpoints
  },
  // ... other modules
};
```

## Data Migration Scripts

### Migrate Existing User Data to Settings

```typescript
// scripts/migrate-user-settings.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateUserSettings() {
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        // Default settings will be applied
      },
    });
  }
  
  console.log(`Migrated settings for ${users.length} users`);
}

migrateUserSettings()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run it:
```bash
npx ts-node scripts/migrate-user-settings.ts
```

### Calculate Initial Analytics

```typescript
// scripts/calculate-initial-analytics.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function calculateInitialAnalytics() {
  const posts = await prisma.post.findMany();
  
  for (const post of posts) {
    const likesCount = await prisma.like.count({
      where: { postId: post.id },
    });
    
    const commentsCount = await prisma.comment.count({
      where: { postId: post.id },
    });
    
    await prisma.postAnalytics.upsert({
      where: { postId: post.id },
      update: {
        likes: likesCount,
        comments: commentsCount,
      },
      create: {
        postId: post.id,
        likes: likesCount,
        comments: commentsCount,
      },
    });
  }
  
  console.log(`Calculated analytics for ${posts.length} posts`);
}

calculateInitialAnalytics()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Rollback Procedure

If you need to rollback:

### Option 1: Database Restore
```bash
# Restore from backup
psql -U your_user -d quemiai < backup_YYYYMMDD.sql
```

### Option 2: Migration Rollback
```bash
# View migration history
npx prisma migrate status

# Rollback to previous migration
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

### Option 3: Code Rollback
```bash
# Revert to previous commit
git log --oneline  # Find commit before changes
git revert COMMIT_HASH

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

## Monitoring After Migration

### Check Application Logs

```bash
# If using PM2
pm2 logs quemiai

# Docker logs
docker logs -f container_name

# Or standard output
npm run start:prod
```

### Monitor Database Performance

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check for missing indexes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1;
```

### Monitor Redis (if configured)

```bash
# Check Redis stats
redis-cli info stats

# Monitor commands in real-time
redis-cli monitor

# Check memory usage
redis-cli info memory
```

## Performance Optimization

### After Migration Indexes

```sql
-- Add additional indexes if needed
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_story_expires 
  ON "Story" ("expiresAt") WHERE "expiresAt" > NOW();

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_event_date 
  ON "AnalyticsEvent" ("createdAt") WHERE "createdAt" > NOW() - INTERVAL '30 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_report_pending 
  ON "Report" ("status") WHERE "status" = 'pending';
```

### Configure Connection Pooling

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add connection pool settings
  // ?pool_timeout=20&connection_limit=10
}
```

## Troubleshooting

### Issue: Migration Fails

**Problem**: Migration errors out

**Solution**:
```bash
# Check Prisma status
npx prisma migrate status

# Resolve migration issues
npx prisma migrate resolve --applied MIGRATION_NAME

# Or reset (CAUTION: loses data)
npx prisma migrate reset
```

### Issue: Redis Connection Failed

**Problem**: Application can't connect to Redis

**Solution**: 
The application is designed to work without Redis. Check logs:
- `Redis URL not configured. Caching will be disabled.` - This is OK
- If Redis is configured but failing, verify connection string

### Issue: Slow Queries

**Problem**: New tables causing slow queries

**Solution**:
```sql
-- Analyze tables
ANALYZE "Story";
ANALYZE "PostAnalytics";
ANALYZE "Report";

-- Rebuild indexes
REINDEX TABLE "Story";
```

### Issue: Missing Dependencies

**Problem**: Build fails with missing modules

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
```

## Post-Migration Checklist

- [ ] Database backup completed
- [ ] All migrations applied successfully
- [ ] New tables visible in database
- [ ] Application starts without errors
- [ ] Test endpoints respond correctly
- [ ] Redis connection confirmed (if configured)
- [ ] User settings created for existing users
- [ ] Initial analytics calculated
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team notified of changes

## Support

If you encounter issues during migration:

1. Check application logs for errors
2. Verify database connection and migrations
3. Review this guide's troubleshooting section
4. Check `AUDIT_ACTION_ITEMS.md` for known issues
5. Consult `STRATEGIC_IMPROVEMENTS.md` for feature details

## Next Steps

After successful migration:

1. **Frontend Development**: Implement UI components for new features
2. **Testing**: Add integration tests for new endpoints
3. **Monitoring**: Set up alerts for new metrics
4. **Documentation**: Update API documentation
5. **User Training**: Prepare guides for new features

---

**Last Updated**: 2025-01-03
**Version**: 1.0.0
**Status**: Production Ready
