# QUEMI 🚀

**Unified Social Media & Messaging Hub**

QUEMI is a modern social media and messaging platform that unifies feeds and DMs from Instagram, TikTok, Facebook, and X (Twitter) into one cohesive experience. Built with a mobile-first approach and powered by QuemiAi, your intelligent assistant for content creation and productivity.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-UNLICENSED-red.svg)

---

## ✨ Features

- 🔄 **Unified Feed**: View all your social media posts in one place
- 💬 **Unified Inbox**: Manage messages from multiple platforms
- 🤖 **QuemiAi Assistant**: AI-powered content creation and productivity helper
- 📱 **Cross-Platform**: Web (Next.js), iOS & Android (React Native)
- 🔒 **Secure OAuth**: Connect accounts safely
- ⚡ **Real-time Updates**: Socket.IO powered live updates
- 🎨 **Modern UI**: Tailwind CSS + Framer Motion
- 🌙 **Dark/Light Themes**: Customizable appearance

---

## 📁 Monorepo Structure

```
quemiai/
├── apps/
│   ├── web/                 # Next.js web application
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   ├── backend/             # NestJS API server
│   │   ├── src/
│   │   │   ├── modules/     # Feature modules
│   │   │   │   ├── feed/    # Unified feed service
│   │   │   │   ├── ai/      # QuemiAi service
│   │   │   │   └── integrations/
│   │   │   │       ├── instagram/
│   │   │   │       ├── tiktok/
│   │   │   │       ├── facebook/
│   │   │   │       └── x/
│   │   ├── prisma/
│   │   ├── package.json
│   │   └── ...
│   └── mobile/              # React Native (Expo) app (Coming soon)
├── packages/
│   ├── shared/              # Shared types & utilities
│   │   ├── src/
│   │   │   ├── types/       # TypeScript interfaces
│   │   │   ├── utils/       # API client, helpers
│   │   │   └── validation/  # Zod schemas
│   │   └── package.json
│   └── ui/                  # Shared React components
│       ├── src/
│       │   └── components/  # Button, Card, Input, etc.
│       └── package.json
├── infrastructure/          # Docker, K8s, Terraform (Coming soon)
├── pnpm-workspace.yaml
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: >= 18 < 21
- **pnpm**: >= 8.0.0
- **PostgreSQL**: >= 14
- **Redis**: >= 6 (optional, for caching)

### Installation

```bash
# Install pnpm globally if you haven't
npm install -g pnpm

# Clone the repository
git clone https://github.com/joachimaross/quemiai.git
cd quemiai

# Install all dependencies
pnpm install

# Set up environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.local.example apps/web/.env.local

# Run database migrations
cd apps/backend
pnpm prisma migrate dev

# Return to root
cd ../..
```

### Development

```bash
# Start all apps in development mode
pnpm dev

# Or start individually:
pnpm backend:dev  # Backend API (http://localhost:4000)
pnpm web:dev      # Web app (http://localhost:3000)
pnpm mobile:dev   # Mobile app (Coming soon)
```

### Build for Production

```bash
# Build all apps
pnpm build

# Or build individually:
pnpm --filter @quemiai/backend build
pnpm --filter @quemiai/web build
```

---

## 🏗️ Tech Stack

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Real-time**: Socket.IO
- **AI**: OpenAI API
- **Testing**: Jest

### Frontend (Web)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **UI Components**: Custom component library
- **State**: React Hooks

### Frontend (Mobile)
- **Framework**: React Native with Expo (Coming soon)
- **Navigation**: React Navigation
- **Offline**: AsyncStorage + Background Sync

### Shared Packages
- **@quemiai/shared**: Types, utilities, validation (Zod)
- **@quemiai/ui**: React component library

---

## 📚 API Reference

### Feed API

```http
GET /feed
Authorization: Bearer <token>
Query: ?limit=20

Response:
{
  "items": [
    {
      "id": "1",
      "content": "This is a post",
      "platform": "instagram",
      "user": "@user",
      "media": ["url"],
      "timestamp": "2023-01-01T00:00:00Z",
      "likes": 123,
      "comments": 45
    }
  ],
  "hasMore": true,
  "nextCursor": "20"
}
```

### QuemiAi API

```http
POST /ai/chat
Content-Type: application/json

Request:
{
  "message": "Write a caption for my beach photo",
  "context": "Instagram post about travel"
}

Response:
{
  "response": "Chasing sunsets and making memories! 🌅✨",
  "conversationId": "conv-123",
  "timestamp": "2023-01-01T00:00:00Z"
}
```

```http
POST /ai/caption
Content-Type: application/json

Request:
{
  "imageUrl": "https://example.com/image.jpg",
  "context": "Beach vacation",
  "platform": "instagram"
}

Response:
{
  "caption": "Paradise found! 🏖️",
  "hashtags": ["#beach", "#vacation", "#travel"]
}
```

---

## 🔌 Platform Integrations

### Current Status

All platform connectors are implemented with **mock/fallback adapters** for development. To integrate real APIs:

#### Instagram
- **API**: [Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)
- **File**: `apps/backend/src/modules/integrations/instagram/instagram.connector.ts`
- **Scopes**: `instagram_basic`, `instagram_content_publish`

#### TikTok
- **API**: [TikTok Developer Platform](https://developers.tiktok.com/)
- **File**: `apps/backend/src/modules/integrations/tiktok/tiktok.connector.ts`
- **Scopes**: `user.info.basic`, `video.list`

#### Facebook
- **API**: [Facebook Graph API](https://developers.facebook.com/docs/graph-api/)
- **File**: `apps/backend/src/modules/integrations/facebook/facebook.connector.ts`
- **Scopes**: `email`, `public_profile`, `user_posts`

#### X (Twitter)
- **API**: [X API v2](https://developer.twitter.com/en/docs/twitter-api)
- **File**: `apps/backend/src/modules/integrations/x/x.connector.ts`
- **Scopes**: `tweet.read`, `users.read`, `dm.read`

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run backend tests
pnpm --filter @quemiai/backend test

# Run tests with coverage
pnpm test:cov

# Run E2E tests
pnpm test:e2e
```

---

## 🔒 Environment Variables

### Backend (`apps/backend/.env`)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/quemiai

# Redis (optional)
REDIS_URL=redis://localhost:6379

# OpenAI (optional, will use mock if not provided)
OPENAI_API_KEY=sk-...

# OAuth (required for production)
INSTAGRAM_CLIENT_ID=your_client_id
INSTAGRAM_CLIENT_SECRET=your_client_secret
TIKTOK_CLIENT_ID=your_client_id
TIKTOK_CLIENT_SECRET=your_client_secret
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
X_API_KEY=your_api_key
X_API_SECRET=your_api_secret

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

### Web (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

---

## 📦 Deployment

### Web (Vercel)

```bash
cd apps/web
vercel --prod
```

**Important**: Set Root Directory to `apps/web` in Vercel Project Settings.

### Backend (Docker)

```bash
cd apps/backend
docker build -t quemiai-backend .
docker run -p 4000:4000 quemiai-backend
```

### Database Migrations

```bash
cd apps/backend
pnpm prisma migrate deploy
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

## 📄 License

UNLICENSED - Private project

---

## 🛣️ Roadmap

See [ROADMAP.md](./ROADMAP.md) for planned features and improvements.

---

## 📞 Support

For questions or issues:
- Open an issue on [GitHub](https://github.com/joachimaross/quemiai/issues)
- Review [Documentation](./docs/)
- Check [API Reference](./API_REFERENCE.md)

---

**Built with ❤️ using NestJS, Next.js, and React Native**

*QUEMI - All your social media, unified. All your creativity, amplified.* ✨
