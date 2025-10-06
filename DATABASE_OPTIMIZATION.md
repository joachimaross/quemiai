# Database Performance Optimization

## Recommended Prisma Indexes

This document outlines recommended indexes for frequently queried fields to improve database performance.

### User Table

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@index([username])
  @@index([createdAt])
}
```

**Rationale:**
- `email`: Frequently used for authentication and user lookups
- `username`: Used for profile searches and mentions
- `createdAt`: Useful for sorting users by registration date

### Post/Message Table

```prisma
model Post {
  id         String   @id @default(cuid())
  authorId   String
  content    String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  published  Boolean  @default(false)

  author User @relation(fields: [authorId], references: [id])

  @@index([authorId])
  @@index([createdAt])
  @@index([published, createdAt])
  @@index([authorId, createdAt])
}
```

**Rationale:**
- `authorId`: Essential for fetching all posts by a specific user
- `createdAt`: Used for chronological sorting in feeds
- `[published, createdAt]`: Composite index for public feed queries
- `[authorId, createdAt]`: Optimizes user timeline queries

### Chat/Conversation Table

```prisma
model Conversation {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  participants ConversationParticipant[]
  messages     Message[]

  @@index([createdAt])
  @@index([updatedAt])
}

model ConversationParticipant {
  id             String   @id @default(cuid())
  conversationId String
  userId         String
  joinedAt       DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id])
  user         User         @relation(fields: [userId], references: [id])

  @@unique([conversationId, userId])
  @@index([userId])
  @@index([conversationId])
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  senderId       String
  content        String
  createdAt      DateTime @default(now())
  read           Boolean  @default(false)

  conversation Conversation @relation(fields: [conversationId], references: [id])
  sender       User         @relation(fields: [senderId], references: [id])

  @@index([conversationId, createdAt])
  @@index([senderId])
  @@index([read])
}
```

**Rationale:**
- `conversationId`: Essential for fetching messages in a conversation
- `[conversationId, createdAt]`: Composite index for chronological message queries
- `userId`: Finds all conversations for a user
- `read`: Efficiently query unread messages

### Session Table

```prisma
model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([token])
  @@index([expiresAt])
}
```

**Rationale:**
- `userId`: Find all sessions for a user
- `token`: Quick session validation
- `expiresAt`: Efficient cleanup of expired sessions

### Best Practices

1. **Index Frequently Queried Fields**: Add indexes to fields used in WHERE, ORDER BY, and JOIN clauses
2. **Composite Indexes**: Use composite indexes for queries that filter on multiple fields
3. **Avoid Over-Indexing**: Too many indexes can slow down writes and consume storage
4. **Monitor Query Performance**: Use Prisma's query logging to identify slow queries
5. **Regular Maintenance**: Periodically review and optimize indexes based on actual usage patterns

### Enabling Query Logging

Add to your Prisma schema or datasource configuration:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
```

Or programmatically:

```typescript
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
    { level: 'error', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});
```

### Performance Monitoring

- Use `EXPLAIN ANALYZE` in PostgreSQL to understand query execution plans
- Monitor slow query logs
- Use database monitoring tools (e.g., pgAdmin, DataDog, New Relic)
- Set up alerts for queries taking longer than threshold (e.g., 100ms)

### Implementation Steps

1. Review your current Prisma schema
2. Add recommended indexes based on your query patterns
3. Run `npx prisma migrate dev --name add-performance-indexes`
4. Test query performance before and after
5. Monitor production metrics and adjust as needed
