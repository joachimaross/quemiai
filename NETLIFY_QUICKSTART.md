# Quick Start: Deploy Quemiai to Netlify

This is a quick reference guide for deploying Quemiai to Netlify. For detailed information, see [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md).

## Prerequisites

- Node.js >= 18.17.0
- pnpm >= 8.0.0 (installed automatically by monorepo)
- Netlify account ([sign up free](https://app.netlify.com/signup))
- Git repository connected to GitHub/GitLab/Bitbucket

## Method 1: Deploy via Netlify Dashboard (Recommended)

### Step 1: Connect Repository

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider and authorize Netlify
4. Select the `joachimaross/quemiai` repository

### Step 2: Configure Build Settings

Use these **exact settings** in the import wizard:

```
Base directory:        apps/web
Build command:         cd ../.. && pnpm install && pnpm --filter @quemiai/web build
Publish directory:     apps/web/.next
Functions directory:   netlify/functions
```

### Step 3: Add Environment Variables

Click "Add environment variables" and add the following (minimum required):

```env
NODE_VERSION=18.17.0
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Add your database, JWT, OAuth, and Firebase credentials
# See .env.example for complete list
```

### Step 4: Deploy

1. Click "Deploy site"
2. Wait for build to complete (~3-5 minutes)
3. Your site will be live at `https://random-name-123456.netlify.app`

### Step 5: Configure Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS configuration instructions

## Method 2: Deploy via Netlify CLI

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login

```bash
netlify login
```

This opens your browser to authenticate with Netlify.

### Step 3: Initialize Site

```bash
cd /path/to/quemiai
netlify init
```

Follow the prompts:
- **Create & configure a new site** (or link existing)
- **Team**: Choose your team
- **Site name**: Enter a unique name or use auto-generated
- **Build command**: `cd ../.. && pnpm install && pnpm --filter @quemiai/web build`
- **Publish directory**: `apps/web/.next`

### Step 4: Add Environment Variables

```bash
# Option A: Via CLI
netlify env:set DATABASE_URL "postgresql://..."
netlify env:set JWT_SECRET "your-secret"
# ... add more variables

# Option B: Import from file
netlify env:import .env
```

### Step 5: Deploy

```bash
# Deploy draft (preview)
netlify deploy

# If it looks good, deploy to production
netlify deploy --prod
```

## Method 3: Deploy via Git Push (Continuous Deployment)

### Step 1: Complete Method 1 or 2 Setup

Set up your site once using Method 1 or 2.

### Step 2: Enable Automatic Deploys

In Netlify Dashboard → Site settings → Build & deploy:

- **Production branch**: `main` (or your default branch)
- **Deploy Previews**: Enable for pull requests
- **Branch deploys**: Enable for all branches (optional)

### Step 3: Push to Deploy

```bash
# Make changes to your code
git add .
git commit -m "Your changes"
git push origin main

# Netlify automatically builds and deploys!
```

## Verify Deployment

### 1. Check Build Status

In Netlify Dashboard → Deploys, verify:
- ✅ Build succeeded
- ✅ Functions deployed (1 function: `api`)
- ✅ Site published

### 2. Test Frontend

```bash
curl https://your-site.netlify.app
```

Expected: HTML response with Next.js application

### 3. Test API

```bash
curl https://your-site.netlify.app/api
```

Expected: JSON response from backend API

### 4. Test Security Headers

```bash
curl -I https://your-site.netlify.app
```

Verify these headers are present:
- `strict-transport-security`
- `x-frame-options: SAMEORIGIN`
- `x-content-type-options: nosniff`

## Troubleshooting

### Build Fails: "Cannot find module 'next'"

**Fix**: Clear cache and rebuild
```bash
netlify deploy --build --prod
```

### Build Fails: "pnpm: command not found"

**Fix**: Netlify should auto-detect pnpm. If not, add to `netlify.toml`:
```toml
[build.environment]
  PNPM_FLAGS = "--version"
```

### Functions Not Deploying

**Fix**: Verify `netlify.toml` has correct functions path:
```toml
[build]
  functions = "../../netlify/functions"
```

### Environment Variables Not Working

**Fix**: Check variable scope in Netlify Dashboard:
- **Production**: Available only on main branch
- **Deploy Previews**: Available on PR builds
- **Branch deploys**: Available on other branches

### Site Shows 404

**Fix**: Verify publish directory in build settings:
- Should be: `apps/web/.next`
- Not: `.next` or `apps/web`

## Next Steps

1. **Configure Environment Variables**: Add all required variables from `.env.example`
2. **Set Up Database**: Configure DATABASE_URL with connection pooling
3. **Enable Deploy Previews**: Test changes before merging to production
4. **Add Custom Domain**: Configure your domain and SSL certificate
5. **Monitor Performance**: Use Netlify Analytics or integrate monitoring tools

## Resources

- **Full Guide**: [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md)
- **Environment Variables**: [.env.example](.env.example)
- **Repository Structure**: [README.md](README.md)
- **Netlify Docs**: https://docs.netlify.com
- **Next.js on Netlify**: https://docs.netlify.com/integrations/frameworks/next-js/

## Support

- **Issues**: [GitHub Issues](https://github.com/joachimaross/quemiai/issues)
- **Netlify Support**: [Support Forums](https://answers.netlify.com)

---

**Need help?** Check [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md) for detailed troubleshooting and advanced configuration.
