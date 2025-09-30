# Vercel Configuration Migration Guide

## Overview

The repository's Vercel configuration has been updated from a backend-focused serverless deployment to an enterprise-grade Next.js frontend deployment configuration.

## What Changed

### Old Configuration (Root Level)

The previous `vercel.json` at the repository root was configured to deploy the NestJS backend as serverless functions:

```json
{
  "version": 2,
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/functions/api.ts"
    }
  ]
}
```

**Issues with old configuration:**
- Used `outputDirectory` which is not part of the official Vercel v2 schema
- Attempted to use `rootDirectory` (not shown but mentioned in context) which is not supported in vercel.json
- Was trying to deploy backend code rather than the Next.js frontend

### New Configuration (Frontend Directory)

The new configuration is located in `/frontend/` and provides enterprise-grade Next.js deployment:

#### 1. **vercel.json** - Enterprise Deployment Configuration

```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "headers": [...],  // Security and caching headers
  "rewrites": [],
  "redirects": [],
  "cleanUrls": true,
  "trailingSlash": false
}
```

**Key features:**
- ✅ Proper v2 schema compliance
- ✅ Explicit Next.js framework specification
- ✅ Enterprise security headers (HSTS, CSP, X-Frame-Options, etc.)
- ✅ Optimized caching strategies for static assets
- ✅ Clean URLs and trailing slash handling
- ✅ Ready-to-use sections for rewrites and redirects

#### 2. **next.config.js** - Next.js Configuration

```javascript
{
  reactStrictMode: true,
  poweredByHeader: false,
  images: { /* optimization settings */ },
  headers: async () => [...],  // Security headers
  compiler: { removeConsole: true },  // Production optimizations
  experimental: { optimizePackageImports: [...] }
}
```

**Key features:**
- ✅ Security hardening (no powered-by header, strict mode)
- ✅ Image optimization with AVIF/WebP support
- ✅ Production console removal
- ✅ Package import optimizations

#### 3. **package.json** - Frontend Dependencies

Self-contained frontend package with:
- Next.js 15 with App Router
- React 19
- TypeScript support
- Tailwind CSS
- Framer Motion & Lucide Icons

#### 4. **Supporting Files**

- `tsconfig.json` - TypeScript configuration
- `postcss.config.js` - Tailwind CSS processing
- `.gitignore` - Next.js build artifacts
- `README.md` - Comprehensive setup and deployment guide

## Migration Steps

### For New Vercel Projects

1. **Create Vercel Project:**
   ```bash
   cd frontend
   vercel
   ```

2. **Configure Root Directory:**
   - In Vercel Dashboard → Project Settings → General
   - Set **Root Directory** to `frontend`
   - This is crucial for Vercel to find the configuration files

3. **Set Environment Variables:**
   - Go to Settings → Environment Variables
   - Add any required environment variables for your application

4. **Deploy:**
   ```bash
   vercel --prod
   ```

### For Existing Vercel Projects

If you already have a Vercel project for this repository:

1. **Update Project Settings:**
   - Go to Vercel Dashboard → Your Project → Settings → General
   - Change **Root Directory** from empty/root to `frontend`
   - Save changes

2. **Trigger New Deployment:**
   - Push changes to your connected Git branch, or
   - Use `vercel --prod` from the frontend directory

3. **Verify Deployment:**
   - Check that the Next.js application deploys successfully
   - Verify security headers are in place (use browser dev tools or `curl -I`)

## Security Headers Explained

The configuration includes several enterprise-grade security headers:

### HSTS (HTTP Strict Transport Security)
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```
- Forces HTTPS connections for 2 years
- Applies to all subdomains
- Eligible for browser preload lists

### Content Security
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
```
- Prevents MIME type sniffing attacks
- Prevents clickjacking by disallowing iframe embedding from other origins
- Controls referrer information sent with requests

### Permissions Policy
```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```
- Restricts browser features to prevent unauthorized access
- Can be customized based on your application's needs

### X-XSS-Protection
```
X-XSS-Protection: 0
```
- Disabled as recommended by modern security practices
- Modern browsers have better built-in XSS protection

## Caching Strategy

### Static Assets (JS/CSS)
```
Cache-Control: public, max-age=31536000, immutable
```
- 1-year cache duration for hashed assets
- `immutable` flag prevents revalidation
- Perfect for versioned assets like `app-[hash].js`

### Image Optimization
```
Cache-Control: public, max-age=60
```
- 60-second cache for Next.js Image Optimizer
- Balances performance with freshness for dynamic images

## Customization

### Adding Rewrites

Edit `frontend/vercel.json`:

```json
"rewrites": [
  {
    "source": "/api/:path*",
    "destination": "https://api.yourdomain.com/:path*"
  }
]
```

### Adding Redirects

```json
"redirects": [
  {
    "source": "/old-path",
    "destination": "/new-path",
    "permanent": true
  }
]
```

### Modifying Security Headers

Edit `frontend/next.config.js` or `frontend/vercel.json` depending on your preference. Headers in `next.config.js` apply during Next.js build, while headers in `vercel.json` are applied by the Vercel platform.

## Backend Deployment

The NestJS backend deployment configuration has been removed from this Vercel setup. If you need to deploy the backend:

### Option 1: Separate Vercel Project
Create a separate Vercel project for the backend with its own configuration.

### Option 2: Traditional Server
Use Docker or traditional server deployment (see DEPLOYMENT.md).

### Option 3: Other Serverless Platforms
Deploy to AWS Lambda, Google Cloud Functions, or Azure Functions.

## Troubleshooting

### Build Fails with "Cannot find module 'next'"

**Solution:** Ensure the Root Directory is set to `frontend` in Vercel Project Settings.

### Security Headers Not Applied

**Solution:** Check that both `next.config.js` and `vercel.json` are in the `frontend` directory and verify in Vercel deployment logs.

### Images Not Loading

**Solution:** Check the `remotePatterns` configuration in `next.config.js` and add your image domains.

### Build Command Not Found

**Solution:** Verify `package.json` exists in the `frontend` directory with proper scripts.

## References

- [Vercel Configuration Documentation](https://vercel.com/docs/projects/project-configuration)
- [Next.js Configuration Documentation](https://nextjs.org/docs/app/api-reference/next-config-js)
- [Security Headers Best Practices](https://owasp.org/www-project-secure-headers/)
- [MDN HTTP Headers Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)

## Support

For issues or questions:
1. Check the [frontend/README.md](frontend/README.md) for detailed setup instructions
2. Review the [DEPLOYMENT.md](../DEPLOYMENT.md) for general deployment guidance
3. Open an issue in the GitHub repository

---

**Last Updated:** 2024
**Version:** 1.0.0
