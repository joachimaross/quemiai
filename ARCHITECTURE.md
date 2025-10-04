# QUEMI Platform - Architecture & Implementation Guide

## Overview

QUEMI is a unified social media and messaging platform that aggregates feeds and direct messages from Instagram, TikTok, Facebook, and X (Twitter) into a single, cohesive experience. Built with a monorepo architecture using modern TypeScript across all platforms.

---

## Architecture

### Monorepo Structure

```
quemiai/
├── apps/
│   ├── web/                    # Next.js 15 web application
│   ├── backend/                # NestJS API server
│   └── mobile/                 # React Native (Expo) app
├── packages/
│   ├── shared/                 # Shared types & utilities
│   └── ui/                     # Shared React components
└── infrastructure/             # Docker, K8s, CI/CD configs
```

### Technology Stack

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Caching**: Redis 6+
- **Real-time**: Socket.IO
- **AI**: OpenAI API (with mock fallback)
- **Testing**: Jest, Supertest

#### Frontend (Web)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State**: React Hooks
- **Testing**: Playwright

#### Frontend (Mobile)
- **Framework**: React Native with Expo ~50.0
- **Navigation**: React Navigation v6
- **Offline**: AsyncStorage + Background Sync
- **Notifications**: expo-notifications
- **Camera**: expo-camera
- **Testing**: Jest + React Native Testing Library

#### Shared Packages
- **@quemiai/shared**: TypeScript types, API client, Zod schemas
- **@quemiai/ui**: React component library (Button, Card, Input, Avatar)

---

## Key Features

### 1. Unified Feed Service

**Location**: `apps/backend/src/modules/feed/`

Aggregates posts from multiple social media platforms into a single, chronologically sorted feed.

**Components**:
- `feed.service.ts` - Orchestrates fetching from multiple platforms
- `feed.controller.ts` - REST API endpoint
- `feed.module.ts` - NestJS module configuration

**Platform Connectors**:
- `integrations/instagram/instagram.connector.ts`
- `integrations/tiktok/tiktok.connector.ts`
- `integrations/facebook/facebook.connector.ts`
- `integrations/x/x.connector.ts`

**API Endpoint**:
```http
GET /feed?limit=20
Response: {
  items: FeedItem[],
  hasMore: boolean,
  nextCursor?: string
}
```

**Implementation Status**: ✅ Mock connectors implemented. Real API integration requires OAuth tokens and platform credentials.

### 2. QuemiAi Assistant

**Location**: `apps/backend/src/modules/ai/`

AI-powered assistant for content creation, caption generation, and user support.

**Components**:
- `ai.service.ts` - OpenAI integration with mock fallback
- `ai.controller.ts` - REST API endpoints
- `ai.module.ts` - NestJS module

**Personality**:
- Name: QuemiAi
- Traits: Helpful, creative, friendly
- Capabilities: Caption generation, content ideas, mood detection, productivity tips

**API Endpoints**:
```http
POST /ai/chat
Body: { message: string, context?: string, conversationId?: string }

POST /ai/caption
Body: { imageUrl?: string, context?: string, platform?: string }
```

**Implementation Status**: ✅ OpenAI integration with graceful fallback to mock responses

### 3. Database Schema

**Location**: `apps/backend/prisma/schema.prisma`

**Key Models**:
- `User` - User accounts
- `SocialMediaConnection` - OAuth connections to platforms
- `ExternalPost` - Cached posts from external platforms
- `Conversation`, `Message` - Messaging system
- `AiConversation`, `AiMessage` - QuemiAi chat history
- `Post`, `Comment`, `Like` - User-generated content
- `Story`, `StoryReaction`, `StoryReply` - Stories feature
- `UserSettings` - User preferences
- `Group`, `GroupMember` - Community features
- Analytics models (PostAnalytics, UserAnalytics, AnalyticsEvent)

### 4. Authentication

**Current Status**: Infrastructure in place, OAuth implementation pending

**Planned OAuth Providers**:
- Google
- Apple
- Facebook

**JWT Configuration**:
- Access tokens with 7-day expiry
- Refresh token rotation
- Secure HTTP-only cookies

### 5. Real-time Features

**Socket.IO Integration**:
- Live feed updates
- Real-time messaging
- Typing indicators
- Online status

**Events**:
- `feed:new-post` - New post in feed
- `message:received` - New message
- `typing:start`, `typing:stop` - Typing indicators

---

## Development Workflow

### Initial Setup

```bash
# Install pnpm globally
npm install -g pnpm

# Clone repository
git clone https://github.com/joachimaross/quemiai.git
cd quemiai

# Install all dependencies
pnpm install

# Setup environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.local.example apps/web/.env.local

# Run database migrations
cd apps/backend
pnpm prisma migrate dev
cd ../..
```

### Running Development Servers

```bash
# All services
pnpm dev

# Individual services
pnpm backend:dev  # http://localhost:4000
pnpm web:dev      # http://localhost:3000
pnpm mobile:dev   # Expo DevTools
```

### Building for Production

```bash
# All apps
pnpm build

# Individual apps
pnpm --filter @quemiai/backend build
pnpm --filter @quemiai/web build
```

### Testing

```bash
# Run all tests
pnpm test

# Test coverage
pnpm test:cov

# E2E tests
pnpm test:e2e
```

---

## Deployment

### Docker Deployment

```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down
```

### Web (Netlify)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod
```

**Configuration**: Deployment is configured via `netlify.toml` at repository root.

See [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md) for detailed deployment instructions.

### Backend (Production Server)

```bash
cd apps/backend
pnpm build
pnpm prisma migrate deploy
NODE_ENV=production pnpm start:prod
```

### Mobile (App Stores)

```bash
cd apps/mobile

# iOS
expo build:ios

# Android
expo build:android
```

---

## Platform Integration Guide

### Instagram Integration

**API**: [Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)

**Required Steps**:
1. Create Facebook App
2. Add Instagram Graph API product
3. Configure OAuth redirect URIs
4. Request permissions: `instagram_basic`, `instagram_content_publish`
5. Update `.env` with client ID and secret
6. Implement real API calls in `instagram.connector.ts`

**Scopes**:
- `instagram_basic` - Basic profile info
- `instagram_content_publish` - Post content
- `instagram_manage_messages` - Read/send DMs

### TikTok Integration

**API**: [TikTok Developer Platform](https://developers.tiktok.com/)

**Required Steps**:
1. Register on TikTok Developer Portal
2. Create app and get credentials
3. Configure callback URLs
4. Request permissions: `user.info.basic`, `video.list`
5. Update `.env` with client credentials
6. Implement real API calls in `tiktok.connector.ts`

### Facebook Integration

**API**: [Facebook Graph API](https://developers.facebook.com/docs/graph-api/)

**Required Steps**:
1. Create Facebook App
2. Add Facebook Login product
3. Configure OAuth settings
4. Request permissions: `email`, `public_profile`, `user_posts`
5. Update `.env` with app credentials
6. Implement real API calls in `facebook.connector.ts`

### X (Twitter) Integration

**API**: [X API v2](https://developer.twitter.com/en/docs/twitter-api)

**Required Steps**:
1. Apply for X Developer Account
2. Create project and app
3. Enable OAuth 2.0
4. Request scopes: `tweet.read`, `users.read`, `dm.read`
5. Update `.env` with API keys
6. Implement real API calls in `x.connector.ts`

---

## Environment Variables

### Backend

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/quemiai

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI (optional)
OPENAI_API_KEY=sk-...

# JWT
JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=7d

# OAuth - Instagram
INSTAGRAM_CLIENT_ID=your_client_id
INSTAGRAM_CLIENT_SECRET=your_client_secret
INSTAGRAM_REDIRECT_URI=http://localhost:4000/auth/instagram/callback

# OAuth - TikTok
TIKTOK_CLIENT_ID=your_client_id
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_REDIRECT_URI=http://localhost:4000/auth/tiktok/callback

# OAuth - Facebook
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:4000/auth/facebook/callback

# OAuth - X
X_API_KEY=your_api_key
X_API_SECRET=your_api_secret
X_BEARER_TOKEN=your_bearer_token
X_REDIRECT_URI=http://localhost:4000/auth/x/callback
```

### Web

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### Mobile

```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

---

## API Reference

### Feed API

```http
GET /feed?limit=20&cursor=abc123
Authorization: Bearer <token>

Response 200:
{
  "items": [
    {
      "id": "1",
      "content": "Post content",
      "platform": "instagram",
      "user": "@username",
      "media": ["url1", "url2"],
      "timestamp": "2024-01-01T00:00:00Z",
      "likes": 123,
      "comments": 45,
      "shares": 12
    }
  ],
  "hasMore": true,
  "nextCursor": "xyz789"
}
```

### QuemiAi API

```http
POST /ai/chat
Content-Type: application/json
Authorization: Bearer <token>

Request:
{
  "message": "Write a caption for my beach photo",
  "context": "Travel photography",
  "conversationId": "conv-123"
}

Response 200:
{
  "response": "Chasing sunsets and making memories! 🌅✨",
  "conversationId": "conv-123",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

```http
POST /ai/caption
Content-Type: application/json
Authorization: Bearer <token>

Request:
{
  "imageUrl": "https://example.com/image.jpg",
  "context": "Beach vacation",
  "platform": "instagram"
}

Response 200:
{
  "caption": "Paradise found! 🏖️",
  "hashtags": ["#beach", "#vacation", "#travel", "#paradise"]
}
```

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow coding standards (ESLint + Prettier)
4. Write tests for new features
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open Pull Request

---

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Run migrations
cd apps/backend
pnpm prisma migrate dev
```

### Build Errors

```bash
# Clean all node_modules
pnpm clean

# Reinstall dependencies
pnpm install

# Rebuild
pnpm build
```

### Port Conflicts

```bash
# Check if ports are in use
lsof -i :3000  # Web
lsof -i :4000  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
```

---

## Performance Optimization

### Backend
- Redis caching for frequently accessed data
- Database query optimization with indexes
- Pagination for large datasets
- Rate limiting per IP/user

### Web
- Next.js Image optimization
- Static page generation where possible
- Code splitting and lazy loading
- Service Worker for PWA

### Mobile
- AsyncStorage for offline data
- Image caching
- Lazy loading of feed items
- Background sync for messages

---

## Security Best Practices

1. **Authentication**: JWT tokens with short expiry
2. **Authorization**: Role-based access control
3. **Data Validation**: Zod schemas for all inputs
4. **SQL Injection**: Prisma ORM protects against this
5. **XSS Protection**: Content Security Policy headers
6. **Rate Limiting**: Throttling on all public endpoints
7. **Secrets**: Never commit to repository, use env vars
8. **HTTPS**: Required in production

---

## License

UNLICENSED - Private Project

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/joachimaross/quemiai/issues
- Documentation: /docs
- API Reference: /API_REFERENCE.md

---

**Last Updated**: January 2024
**Maintained By**: QUEMI Development Team
