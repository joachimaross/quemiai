# Quemiai 🧠🔥

A NestJS-based backend platform for scalable AI-driven applications. Built with TypeScript, WebSockets, and modern cloud infrastructure.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18 < 21
- npm or yarn
- PostgreSQL (for database)
- Redis (optional, for caching)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

### Development

```bash
# Run in development mode with hot reload
npm run start:dev

# Run in debug mode
npm run start:debug

# Build the project
npm run build

# Run in production mode
npm run start:prod
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 🧹 Code Quality

```bash
# Run linter
npm run lint

# Format code with Prettier
npm run format
```

## 🏗️ Tech Stack

### Backend
- **Framework:** NestJS
- **Language:** TypeScript
- **Real-time:** Socket.IO (WebSockets)
- **Testing:** Jest
- **Linting:** ESLint + Prettier
- **Logging:** Pino
- **Database:** PostgreSQL with Prisma ORM
- **Caching:** Redis
- **Cloud:** Google Cloud Platform, Firebase

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom components with Lucide icons
- **Animation:** Framer Motion

### Deployment
- **Netlify:** Recommended platform with full Next.js and serverless functions support
- **Docker:** Containerized deployment support for backend
- **Traditional Server:** PM2 + Nginx setup

## 📁 Project Structure

```
/
├── apps/
│   ├── web/             # Next.js application
│   │   ├── src/
│   │   │   ├── app/     # Next.js App Router pages
│   │   │   ├── components/ # React components
│   │   │   └── lib/     # Utility functions
│   │   ├── public/
│   │   │   ├── _redirects  # Netlify URL routing
│   │   │   └── _headers    # Netlify security headers
│   │   ├── next.config.js  # Next.js configuration
│   │   └── package.json    # Frontend dependencies
│   ├── backend/         # NestJS backend
│   │   ├── src/
│   │   │   ├── api/     # API route handlers
│   │   │   ├── config/  # Configuration files
│   │   │   ├── modules/ # Feature modules
│   │   │   ├── middleware/ # Custom middleware
│   │   │   └── services/   # Business logic services
│   │   └── package.json
├── netlify/
│   └── functions/       # Netlify serverless functions
│       ├── api.ts       # Backend API wrapper
│       └── package.json
├── netlify.toml         # Netlify deployment config
└── .env.example         # Environment variables template
```

## 🔧 Environment Variables

See `.env.example` for all required environment variables:

- **PORT:** Server port (default: 4000)
- **DATABASE_URL:** PostgreSQL connection string
- **JWT_SECRET:** Secret for JWT token generation
- **REDIS_URL:** Redis connection URL (optional)
- **Google OAuth:** GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- **Apple OAuth:** APPLE_CLIENT_ID, APPLE_TEAM_ID, etc.
- **Firebase:** FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, etc.
- **Storage:** Cloud storage credentials

## 🌟 Features

- ✅ RESTful API architecture
- ✅ Real-time WebSocket communication (Chat module)
- ✅ JWT authentication
- ✅ OAuth integration (Google, Apple)
- ✅ Firebase integration
- ✅ Structured logging with Pino
- ✅ Global error handling
- ✅ Request validation
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Swagger API documentation (configurable)
- ✅ Docker support
- ✅ CI/CD with GitHub Actions

## 🐳 Docker

Build and run with Docker:

```bash
# Build image
docker build -t quemiai .

# Run container
docker run -p 4000:4000 --env-file .env quemiai
```

## 🚀 Deployment

### Next.js Frontend on Netlify (Recommended)

The Next.js frontend application is located in the `apps/web` directory and is fully configured for Netlify deployment with enterprise-grade security, serverless functions, and performance optimization.

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and link repository
netlify login
netlify init

# Deploy to production
netlify deploy --prod
```

**✅ Netlify Configuration Includes:**
- Complete `netlify.toml` with build settings for pnpm monorepo
- Security headers via `_headers` file
- URL redirects and SPA routing via `_redirects` file
- Serverless backend functions in `netlify/functions/`
- Automatic HTTPS and global CDN
- Deploy previews for all pull requests

For detailed Netlify deployment instructions, see:
- [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md) - **Complete Netlify setup guide**
- [NETLIFY_QUICKSTART.md](NETLIFY_QUICKSTART.md) - **Quick start guide**

### NestJS Backend

#### Netlify Functions
The backend is wrapped as Netlify serverless functions in `netlify/functions/api.ts`. Deploy automatically with the frontend.

#### Docker
Use the included `Dockerfile` for containerized deployment on any platform.

```bash
docker build -t quemiai:latest .
docker run -p 4000:4000 --env-file .env quemiai:latest
```

For comprehensive deployment options, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 📋 Git Workflow

We follow a standard Git workflow:

- **main** - Production branch
- **dev** - Development/staging branch
- **feature/** - Feature branches
- **hotfix/** - Hotfix branches

See `CONTRIBUTING.md` for contribution guidelines.

## ✅ Roadmap

See our comprehensive [ROADMAP.md](ROADMAP.md) for detailed development phases and timelines.

### Completed
- [x] Base NestJS setup
- [x] Real-time chat with WebSockets
- [x] Authentication & OAuth
- [x] Logging & error handling
- [x] Docker & CI/CD setup

### In Progress / Planned
- [ ] **PHASE 2.5:** Monitoring & Observability
  - Enhanced health checks (`/health`, `/ready`)
  - Prometheus metrics integration
  - Grafana dashboard setup
  - Log aggregation (ELK, Logtail, Datadog)

- [ ] **PHASE 3:** Performance & Reliability
  - Load testing with k6/Artillery
  - Redis caching optimization
  - Database query optimization
  - Performance regression tests

- [ ] **PHASE 3.5:** Advanced Security
  - Helmet middleware configuration
  - Automated vulnerability scanning
  - JWT refresh tokens
  - RBAC implementation

- [ ] **PHASE 3.75:** Developer Experience
  - Auto-generated Swagger/OpenAPI docs
  - Enhanced GitHub Actions
  - PR preview deployments

- [ ] **PHASE 4:** Architecture Evolution
  - Monorepo split (frontend/backend)
  - Reverse proxy setup
  - Microservices preparation

- [ ] **PHASE 4+:** SaaS Product Features
  - Multi-tenancy and advanced auth
  - Enhanced messaging (typing, reactions, files, voice)
  - Enterprise features (audit logs, data export/import)
  - Billing integration (Stripe)
  - Admin dashboard

For detailed implementation plans, timelines, and actionable checklists, see [ROADMAP.md](ROADMAP.md).

## 📝 License

UNLICENSED - Private project

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📧 Support

For questions or issues, please open an issue in the GitHub repository.

---

**Built with ❤️ using NestJS**
