# Netlify Deployment Guide for Quemiai

This guide covers the complete setup and deployment of the Quemiai platform on Netlify, including the Next.js frontend and serverless backend functions.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Configuration Files](#configuration-files)
5. [Build Settings](#build-settings)
6. [Environment Variables](#environment-variables)
7. [Functions Setup](#functions-setup)
8. [Deployment Process](#deployment-process)
9. [Post-Deployment Verification](#post-deployment-verification)
10. [Troubleshooting](#troubleshooting)

## Overview

Quemiai is deployed on Netlify with the following architecture:

- **Frontend**: Next.js application (App Router) in `apps/web`
- **Backend**: Serverless functions in `netlify/functions` wrapping the NestJS Express API
- **Build System**: pnpm workspace monorepo
- **CDN**: Netlify Edge Network with global distribution

### Key Features

✅ **Next.js 15 App Router** with SSR and static generation  
✅ **Enterprise Security Headers** (HSTS, CSP, X-Frame-Options, etc.)  
✅ **Optimized Caching** for static assets and dynamic content  
✅ **Serverless Backend Functions** for API endpoints  
✅ **Automatic HTTPS** with Let's Encrypt certificates  
✅ **Deploy Previews** for all pull requests  

## Prerequisites

- Node.js >= 18.17.0
- pnpm >= 8.0.0
- Netlify account (free or paid)
- Git repository connected to Netlify

## Quick Start

### 1. Install Netlify CLI (Optional)

```bash
npm install -g netlify-cli
netlify login
```

### 2. Link Repository to Netlify

#### Option A: Through Netlify Dashboard

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git provider (GitHub, GitLab, Bitbucket)
4. Select the `joachimaross/quemiai` repository
5. Configure build settings (see below)

#### Option B: Through Netlify CLI

```bash
cd /path/to/quemiai
netlify init
```

Follow the prompts to link your repository.

### 3. Configure Build Settings

In Netlify Dashboard → Site settings → Build & deploy → Build settings:

```
Base directory: apps/web
Build command: cd ../.. && pnpm install && pnpm --filter @quemiai/web build
Publish directory: apps/web/.next
Functions directory: netlify/functions
```

### 4. Deploy

```bash
# Deploy to production
netlify deploy --prod

# Or push to your main branch (if auto-deploy is enabled)
git push origin main
```

## Configuration Files

### netlify.toml

The main Netlify configuration file at the repository root. Key sections:

```toml
[build]
  base = "apps/web"
  command = "cd ../.. && pnpm install && pnpm --filter @quemiai/web build"
  publish = ".next"
  functions = "../../netlify/functions"

[build.environment]
  NODE_VERSION = "18.17.0"
  NEXT_TELEMETRY_DISABLED = "1"
  NODE_ENV = "production"
```

**Features configured:**
- Monorepo build with pnpm workspaces
- Next.js plugin for optimized builds
- API routing to serverless functions
- Security headers
- Cache control for static assets

### _redirects

Located in `apps/web/public/_redirects`, this file defines URL routing:

```
/api/*  /.netlify/functions/:splat  200
/*      /index.html                 200
```

**Purpose:**
- Routes all `/api/*` requests to Netlify Functions
- Enables SPA routing for Next.js client-side navigation
- Preserves query parameters and path segments

### _headers

Located in `apps/web/public/_headers`, this file sets HTTP headers:

```
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**Purpose:**
- Security headers to protect against common attacks
- Cache control for optimal performance
- CORS configuration (if needed)

## Build Settings

### Monorepo Configuration

Quemiai uses a pnpm workspace monorepo structure. The build process:

1. **Install dependencies**: `pnpm install` at root level
2. **Build workspace**: `pnpm --filter @quemiai/web build`
3. **Output**: Next.js standalone build in `apps/web/.next`

### Next.js Configuration

The `apps/web/next.config.js` includes:

```javascript
{
  output: 'standalone',
  outputFileTracingRoot: require('path').join(__dirname, '..'),
  // ... security headers, image optimization, etc.
}
```

This creates a self-contained deployment with all dependencies included.

### Build Plugins

The `@netlify/plugin-nextjs` plugin is configured in `netlify.toml`:

```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

This plugin:
- Optimizes Next.js builds for Netlify
- Handles ISR (Incremental Static Regeneration)
- Configures image optimization
- Sets up middleware

## Environment Variables

### Required Variables

Add these in Netlify Dashboard → Site settings → Environment variables:

```env
# Backend API Configuration
DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://host:6379

# JWT Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=path-to-credentials.json
GCP_PROJECT_ID=your-gcp-project-id

# Frontend (must start with NEXT_PUBLIC_ to be accessible in browser)
NEXT_PUBLIC_API_URL=https://your-site.netlify.app/api
NEXT_PUBLIC_WS_URL=wss://your-backend-ws.com

# Netlify Configuration
NODE_VERSION=18.17.0
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Setting Environment Variables

#### Via Netlify Dashboard:

1. Go to Site settings → Environment variables
2. Click "Add a variable"
3. Enter key and value
4. Select scopes (Production, Deploy Previews, Branch deploys)
5. Save

#### Via Netlify CLI:

```bash
# Set a single variable
netlify env:set KEY value

# Import from .env file
netlify env:import .env
```

#### Via netlify.toml:

```toml
[context.production.environment]
  NODE_ENV = "production"
  NEXT_TELEMETRY_DISABLED = "1"
```

> ⚠️ **Security Note**: Never commit sensitive environment variables to git. Use `.env.local` for local development and Netlify Dashboard for production.

## Functions Setup

### Netlify Functions Structure

```
netlify/
└── functions/
    ├── api.ts          # Main API handler
    └── package.json    # Function dependencies
```

### API Function

The `api.ts` function wraps the existing Express API:

```typescript
import serverless from 'serverless-http';
import app from '../../apps/backend/src/functions/api';

export const handler = serverless(app);
```

### Function Configuration

In `netlify.toml`:

```toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
  external_node_modules = ["@prisma/client", "prisma"]
  
  [functions.timeouts]
    default = 26  # Free tier: 10s, Pro: 26s, Business: 60s
```

### Supported Endpoints

All backend API routes are accessible via Netlify Functions:

- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User management
- `/api/posts/*` - Post operations
- `/api/messages/*` - Messaging
- `/api/analytics/*` - Analytics
- `/api/marketplace/*` - Marketplace features
- `/api/ai/*` - AI services
- `/api/social-media/*` - Social media integrations

## Deployment Process

### Automatic Deployments

When connected to Git, Netlify automatically deploys:

- **Production deploys**: Triggered by commits to the main branch
- **Deploy Previews**: Created for all pull requests
- **Branch deploys**: Optional for other branches

### Manual Deployments

#### Via Netlify CLI:

```bash
# Deploy draft (preview)
netlify deploy

# Deploy to production
netlify deploy --prod

# Deploy with build
netlify deploy --build --prod
```

#### Via Netlify Dashboard:

1. Go to Deploys
2. Click "Trigger deploy"
3. Select "Deploy site" or "Clear cache and deploy site"

### Deployment Workflow

1. **Build starts**: Netlify clones your repository
2. **Install dependencies**: `pnpm install` runs at root
3. **Build application**: `pnpm --filter @quemiai/web build`
4. **Process functions**: Bundle serverless functions with dependencies
5. **Deploy to CDN**: Upload static assets to global edge network
6. **Activate**: Switch traffic to new deployment
7. **Rollback available**: Previous deployments remain accessible

### Build Logs

View detailed build logs:
- **Dashboard**: Deploys → Select deployment → View logs
- **CLI**: `netlify watch` for live tailing

## Post-Deployment Verification

### 1. Check Deployment Status

```bash
netlify status
```

### 2. Test Frontend

```bash
curl https://your-site.netlify.app/
```

Expected: HTML response with Next.js application

### 3. Test API Function

```bash
curl https://your-site.netlify.app/api
```

Expected: JSON response from API root

### 4. Verify Security Headers

```bash
curl -I https://your-site.netlify.app/
```

Check for:
- `strict-transport-security`
- `x-frame-options`
- `x-content-type-options`
- `referrer-policy`

### 5. Test Performance

Use [Lighthouse](https://developers.google.com/web/tools/lighthouse) or [WebPageTest](https://www.webpagetest.org/):

```bash
lighthouse https://your-site.netlify.app --view
```

Target metrics:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### 6. Verify Functions

```bash
netlify functions:list
```

### 7. Check Build Size

In Netlify Dashboard → Deploys → Select deployment → View summary

Optimize if:
- Build time > 5 minutes
- Deploy size > 100 MB
- Function size > 50 MB

## Troubleshooting

### Build Failures

#### "Cannot find module 'next'"

**Cause**: Dependencies not installed properly

**Solution**:
```bash
# Clear build cache in Netlify Dashboard
Settings → Build & deploy → Build settings → Clear build cache

# Or rebuild with fresh dependencies
netlify deploy --build --prod
```

#### "pnpm: command not found"

**Cause**: pnpm not available in build environment

**Solution**: Add to `netlify.toml`:
```toml
[build.environment]
  PNPM_FLAGS = "--version"
```

Or use npm instead:
```toml
[build]
  command = "cd ../.. && npm install && npm run build --workspace=@quemiai/web"
```

#### Build timeout

**Cause**: Build takes longer than allowed time (15 minutes free tier)

**Solutions**:
- Optimize dependencies (remove unused packages)
- Use build plugins to cache dependencies
- Upgrade to paid plan for longer build times
- Split large builds into separate deployments

### Function Errors

#### "Function exceeded timeout"

**Cause**: Function takes longer than configured timeout

**Solution**:
```toml
[functions.timeouts]
  default = 26  # Increase if on paid plan
```

#### "Module not found in function"

**Cause**: Dependency not bundled with function

**Solution**: Add to `netlify.toml`:
```toml
[functions]
  external_node_modules = ["@prisma/client", "prisma", "your-module"]
```

#### "Database connection failed"

**Cause**: Missing environment variables or incorrect connection string

**Solution**:
- Verify `DATABASE_URL` in environment variables
- Check database firewall allows Netlify IPs
- Use connection pooling (e.g., PgBouncer)

### Routing Issues

#### "404 on API routes"

**Cause**: `_redirects` file not processed

**Solution**:
- Verify `_redirects` is in `apps/web/public/`
- Check file is published (in build output)
- Review redirect syntax (no trailing slashes)

#### "SPA routes return 404"

**Cause**: Missing catch-all redirect

**Solution**: Add to `_redirects`:
```
/*  /index.html  200
```

### Performance Issues

#### "Slow page load times"

**Solutions**:
- Enable Netlify's HTTP/2 and Brotli compression
- Optimize images (use Next.js Image component)
- Implement lazy loading
- Use dynamic imports for large components
- Enable Edge functions for geo-routing

#### "High CDN bandwidth usage"

**Solutions**:
- Implement proper caching headers
- Optimize asset sizes
- Use modern image formats (AVIF, WebP)
- Implement code splitting

### Security Issues

#### "Missing security headers"

**Cause**: `_headers` file not processed or headers overridden

**Solution**:
- Verify `_headers` is in `apps/web/public/`
- Check header syntax (no tabs, proper indentation)
- Use Netlify Headers API in `netlify.toml` as backup

#### "CORS errors"

**Solution**: Add to function or `_headers`:
```
/api/*
  Access-Control-Allow-Origin: https://your-domain.com
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization
```

### Cache Issues

#### "Stale content after deployment"

**Solutions**:
- Clear CDN cache: Dashboard → Deploys → Clear cache
- Add cache busting to assets (Next.js does this automatically)
- Set proper `Cache-Control` headers

#### "API responses cached incorrectly"

**Solution**: Add to `_headers`:
```
/api/*
  Cache-Control: no-cache, no-store, must-revalidate
```

## Additional Resources

### Official Documentation

- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Deploy Previews](https://docs.netlify.com/site-deploys/deploy-previews/)

### Quemiai Documentation

- [Main README](../README.md) - Project overview
- [Deployment Guide](../DEPLOYMENT.md) - All deployment options
- [Architecture](../ARCHITECTURE.md) - System architecture
- [API Reference](../API_REFERENCE.md) - API documentation

### Community & Support

- [Netlify Community](https://answers.netlify.com/)
- [Next.js Discussions](https://github.com/vercel/next.js/discussions)
- [GitHub Issues](https://github.com/joachimaross/quemiai/issues)

## Version History

- **v1.0.0** (2024): Initial Netlify deployment configuration
  - Monorepo build support with pnpm
  - Serverless functions for backend API
  - Enterprise security headers
  - Optimized caching strategy
  - Comprehensive documentation

---

**Status**: ✅ Production Ready  
**Last Updated**: October 2024  
**Maintained by**: Quemiai Development Team
