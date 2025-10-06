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

### Security Best Practices for Managing Production Secrets

#### 1. Secret Storage and Management

**Never commit secrets to version control:**
- ✅ Use `.env.example` with placeholder values for documentation
- ✅ Add `.env` and `.env.local` to `.gitignore`
- ❌ Never commit `.env` files with actual secrets
- ❌ Never hardcode API keys or passwords in source code

**Use Netlify's Environment Variables UI:**
- Store all production secrets in Netlify Dashboard → Site Settings → Environment Variables
- Use different values for Production, Deploy Previews, and Branch Deploys
- Enable "Sensitive variable" option for credentials to hide values in logs

**Secret Management Services (Recommended for Enterprise):**
- **AWS Secrets Manager**: Centralized secret management with automatic rotation
- **HashiCorp Vault**: Enterprise-grade secret management and encryption
- **Google Secret Manager**: Integrated with Google Cloud services
- **Azure Key Vault**: Microsoft's secret management solution

#### 2. Secret Rotation Procedures

**Regular Rotation Schedule:**
- **Critical secrets** (database passwords, JWT secrets): Rotate every 90 days
- **OAuth credentials**: Rotate every 6 months or immediately if compromised
- **API keys**: Rotate quarterly or when team members with access leave
- **Certificates**: Monitor expiration and renew 30 days before expiry

**Rotation Process:**
1. Generate new secret in the service (e.g., database, OAuth provider)
2. Add new secret to Netlify with temporary name (e.g., `JWT_SECRET_NEW`)
3. Update application to accept both old and new secrets during transition
4. Deploy and verify functionality
5. Replace old secret with new secret
6. Remove old secret from all systems
7. Monitor for any issues during grace period
8. Document rotation in change log

**Automated Rotation (Advanced):**
```bash
# Example: Rotate JWT secret using Netlify CLI
OLD_SECRET=$(netlify env:get JWT_SECRET)
NEW_SECRET=$(openssl rand -base64 32)
netlify env:set JWT_SECRET_NEW "$NEW_SECRET"
# Deploy with dual-secret support, then migrate
netlify env:set JWT_SECRET "$NEW_SECRET"
netlify env:unset JWT_SECRET_NEW
```

#### 3. Access Control Best Practices

**Principle of Least Privilege:**
- Grant access only to team members who need specific secrets
- Use Netlify's team and role management features
- Regularly audit who has access to production environment variables
- Remove access immediately when team members leave

**Separation of Environments:**
- Use different secrets for Development, Staging, and Production
- Never reuse production secrets in development environments
- Use Netlify's context-specific environment variables:
  ```toml
  [context.production.environment]
    API_KEY = "production-key"
  
  [context.deploy-preview.environment]
    API_KEY = "preview-key"
  ```

**Audit Logging:**
- Enable Netlify's audit log (available on Team plans and higher)
- Regularly review who accessed environment variables
- Set up alerts for unauthorized access attempts
- Maintain a log of all secret rotations

#### 4. Secure Secret Generation

**Strong Secret Generation:**
```bash
# Generate strong random secrets (32 bytes = 256 bits)
openssl rand -base64 32

# For JWT secrets (recommended minimum 256 bits)
openssl rand -hex 32

# For passwords (alphanumeric with special characters)
openssl rand -base64 24 | tr -d "=+/" | cut -c1-24
```

**Secret Requirements:**
- **JWT_SECRET**: Minimum 32 characters, use random bytes
- **Database passwords**: Minimum 16 characters, mixed case + numbers + symbols
- **API keys**: Use service-provided generation, never create manually
- **OAuth secrets**: Use provider-generated values, never modify

#### 5. Handling Secret Leaks

**If a secret is compromised:**

1. **Immediate Response:**
   - Rotate the compromised secret immediately
   - Revoke the old secret from all systems
   - Check access logs for unauthorized usage
   - Invalidate all active sessions if JWT secret was compromised

2. **Investigation:**
   - Review git history for any commits containing secrets
   - Use tools like `git-secrets` or `truffleHog` to scan repository
   - Check CI/CD logs for exposed secrets
   - Review Netlify deploy logs

3. **Remediation:**
   - Remove secrets from git history using `git filter-branch` or `BFG Repo-Cleaner`
   - Force push cleaned history (coordinate with team)
   - Notify affected users if user data may be at risk
   - Document incident and update security procedures

4. **Prevention:**
   - Install pre-commit hooks to detect secrets (e.g., `husky` + `lint-staged`)
   - Use `.gitignore` properly
   - Enable secret scanning on GitHub (Settings → Security → Secret scanning)
   - Train team on secure secret management

**Tools for Secret Detection:**
```bash
# Install git-secrets to prevent committing secrets
brew install git-secrets
git secrets --install
git secrets --register-aws

# Scan repository for leaked secrets
npx trufflehog --regex --entropy=True .
```

#### 6. Environment-Specific Configuration

**Development Environment:**
- Use `.env.local` for local secrets (never committed)
- Use test/mock credentials when possible
- Document all required variables in `.env.example`

**Staging/Preview Environment:**
- Use separate database and services from production
- Use test API keys for third-party services
- Enable verbose logging for debugging

**Production Environment:**
- Use only through Netlify's Environment Variables UI
- Enable "Sensitive variable" option for all secrets
- Restrict access to production secrets to senior team members only
- Enable two-factor authentication for all team members with production access

#### 7. Monitoring and Alerting

**Set up monitoring for:**
- Failed authentication attempts (JWT validation failures)
- Unusual API usage patterns
- Failed database connections (may indicate rotated secrets)
- Function execution errors
- Rate limit breaches

**Recommended Tools:**
- **Netlify Analytics**: Monitor site performance and traffic patterns
- **Sentry**: Error tracking and alerting
- **Datadog/New Relic**: Application performance monitoring
- **CloudWatch/Stackdriver**: Infrastructure monitoring

**Alert Configuration:**
```bash
# Example: Set up alerts for function errors
# In Netlify Dashboard → Notifications:
# - Email on deploy failure
# - Slack webhook for function errors
# - GitHub commit status for build status
```

#### 8. Compliance and Audit

**Regular Security Audits:**
- Quarterly review of all environment variables
- Annual penetration testing for production environment
- Regular dependency audits (`npm audit`, `pnpm audit`)
- OWASP Top 10 compliance checks

**Documentation:**
- Maintain a secret inventory (without actual values)
- Document who has access to what secrets
- Keep rotation history
- Document incident response procedures

**Compliance Requirements:**
- **GDPR**: Ensure personal data in databases is encrypted and access is logged
- **SOC 2**: Maintain audit logs and access controls
- **PCI DSS**: If handling payments, ensure PCI-compliant secret management
- **HIPAA**: If handling health data, use HIPAA-compliant infrastructure

#### 9. Additional Resources

**Netlify Security:**
- [Netlify Security Documentation](https://docs.netlify.com/security/)
- [Environment Variables Best Practices](https://docs.netlify.com/environment-variables/overview/)
- [Netlify Security Headers](https://docs.netlify.com/routing/headers/)

**Industry Standards:**
- [OWASP Secret Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [NIST Cryptographic Standards](https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines)
- [CIS Benchmarks for Cloud Security](https://www.cisecurity.org/cis-benchmarks/)

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

## Build Failure Notifications and Monitoring

Setting up automated notifications for build failures is crucial for maintaining a reliable deployment pipeline. This section covers various methods to get notified when builds fail.

### 1. Netlify Email Notifications

**Built-in Email Alerts:**

Netlify provides email notifications out of the box:

1. Go to **Site Settings → Build & deploy → Deploy notifications**
2. Click **Add notification**
3. Select notification types:
   - **Deploy failed**: Get notified when a deploy fails
   - **Deploy succeeded**: Get notified on successful deploys
   - **Deploy started**: Get notified when a deploy begins
4. Enter email addresses
5. Save settings

**Multiple Recipients:**
- Add multiple email addresses separated by commas
- Create distribution lists for team notifications
- Use role-based emails (e.g., `devops@company.com`)

### 2. Slack Integration

**Setup Slack Notifications:**

1. **Create Incoming Webhook in Slack:**
   ```
   - Go to your Slack workspace settings
   - Navigate to Apps → Incoming Webhooks
   - Click "Add to Slack"
   - Choose channel (e.g., #deployments)
   - Copy the webhook URL
   ```

2. **Configure in Netlify:**
   ```
   - Site Settings → Build & deploy → Deploy notifications
   - Add notification → Slack notification
   - Paste webhook URL
   - Select notification triggers:
     * Deploy failed
     * Deploy succeeded
     * Deploy started
   - Save
   ```

3. **Custom Slack Messages (Optional):**
   ```bash
   # Using Netlify Build Plugin
   # Create netlify-plugin-slack-notifications.js
   module.exports = {
     onError: async ({ utils }) => {
       await fetch(process.env.SLACK_WEBHOOK_URL, {
         method: 'POST',
         body: JSON.stringify({
           text: '🚨 Build failed!',
           attachments: [{
             color: 'danger',
             fields: [
               { title: 'Site', value: process.env.SITE_NAME },
               { title: 'Branch', value: process.env.BRANCH },
               { title: 'Deploy URL', value: process.env.DEPLOY_URL }
             ]
           }]
         })
       });
     }
   };
   ```

### 3. GitHub Integration

**GitHub Commit Status:**

Netlify automatically updates GitHub commit statuses:

✅ **Automatic Features:**
- Build status badge on commits
- PR deploy preview status
- Branch protection rules integration
- Checks API integration

**Enable Advanced GitHub Integration:**

1. **Deploy Notifications on PRs:**
   - Netlify automatically comments on PRs with deploy previews
   - Configure in Site Settings → Build & deploy → Deploy Previews

2. **GitHub Actions Integration:**
   ```yaml
   # .github/workflows/deploy-status.yml
   name: Netlify Deploy Status
   
   on:
     deployment_status
   
   jobs:
     notify:
       runs-on: ubuntu-latest
       if: github.event.deployment_status.state == 'failure'
       steps:
         - name: Notify on failure
           uses: actions/github-script@v6
           with:
             script: |
               await github.rest.issues.createComment({
                 owner: context.repo.owner,
                 repo: context.repo.repo,
                 issue_number: context.payload.number,
                 body: '🚨 Netlify deployment failed! Check the logs for details.'
               });
   ```

3. **Branch Protection Rules:**
   ```
   Settings → Branches → Branch protection rules:
   ✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   Select: "netlify/quemiai/deploy-preview"
   ```

### 4. Webhook Notifications

**Custom Webhook Integration:**

1. **Setup Custom Webhook:**
   ```
   Site Settings → Build & deploy → Deploy notifications
   → Add notification → Outgoing webhook
   ```

2. **Configure Webhook:**
   ```
   Webhook URL: https://your-api.com/webhook/netlify
   Events to send: failed, succeeded, started
   ```

3. **Webhook Payload Example:**
   ```json
   {
     "id": "deploy-id",
     "site_id": "site-id",
     "build_id": "build-id",
     "state": "error",
     "name": "quemiai",
     "url": "https://quemiai.netlify.app",
     "ssl_url": "https://quemiai.netlify.app",
     "admin_url": "https://app.netlify.com/sites/quemiai",
     "deploy_url": "https://deploy-id--quemiai.netlify.app",
     "deploy_ssl_url": "https://deploy-id--quemiai.netlify.app",
     "created_at": "2024-01-01T00:00:00.000Z",
     "updated_at": "2024-01-01T00:05:00.000Z",
     "error_message": "Build failed",
     "branch": "main",
     "commit_ref": "abc123def456",
     "review_id": null,
     "context": "production"
   }
   ```

4. **Handle Webhook in Your Application:**
   ```javascript
   // Example Express endpoint
   app.post('/webhook/netlify', (req, res) => {
     const { state, name, error_message, deploy_url } = req.body;
     
     if (state === 'error') {
       // Send alert to monitoring system
       sendAlert({
         level: 'critical',
         title: `Build failed for ${name}`,
         message: error_message,
         url: deploy_url
       });
     }
     
     res.status(200).send('OK');
   });
   ```

### 5. Third-Party Monitoring Tools

**Sentry Integration:**

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Configure in netlify.toml
[[plugins]]
  package = "@sentry/netlify-build-plugin"
  
  [plugins.inputs]
    sentryOrg = "your-org"
    sentryProject = "quemiai"
```

**Datadog Integration:**

```bash
# Add Datadog build plugin
npm install --save-dev @datadog/datadog-ci

# Configure in netlify.toml
[[plugins]]
  package = "@datadog/datadog-netlify-plugin"
  
  [plugins.inputs]
    apiKey = "${DATADOG_API_KEY}"
```

**New Relic Deployment Markers:**

```bash
# Create deployment marker on successful deploy
curl -X POST 'https://api.newrelic.com/v2/applications/${APP_ID}/deployments.json' \
  -H "X-Api-Key:${NEW_RELIC_API_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{
    "deployment": {
      "revision": "'${COMMIT_REF}'",
      "user": "Netlify"
    }
  }'
```

### 6. PagerDuty Integration

**Setup Critical Alerts:**

1. **Create PagerDuty Service:**
   - Go to PagerDuty → Services
   - Create new service for Netlify deployments
   - Get integration key

2. **Setup Webhook to PagerDuty:**
   ```bash
   # Use Netlify webhook to trigger PagerDuty
   POST https://events.pagerduty.com/v2/enqueue
   {
     "routing_key": "your-integration-key",
     "event_action": "trigger",
     "payload": {
       "summary": "Netlify deployment failed",
       "severity": "critical",
       "source": "netlify",
       "custom_details": {
         "build_id": "build-id",
         "error": "error-message"
       }
     }
   }
   ```

### 7. SMS Notifications

**Twilio Integration Example:**

```javascript
// netlify-plugin-sms-alerts.js
const twilio = require('twilio');

module.exports = {
  onError: async ({ utils }) => {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    await client.messages.create({
      body: `🚨 Netlify build failed for ${process.env.SITE_NAME}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.ALERT_PHONE_NUMBER
    });
  }
};
```

### 8. Build Status Dashboard

**Create Custom Dashboard:**

```html
<!-- build-status.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Deployment Status</title>
  <script>
    async function checkStatus() {
      const response = await fetch('https://api.netlify.com/api/v1/sites/site-id/deploys', {
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN'
        }
      });
      const deploys = await response.json();
      const latest = deploys[0];
      
      document.getElementById('status').innerHTML = `
        <div class="status ${latest.state}">
          <h2>Latest Deploy: ${latest.state}</h2>
          <p>Branch: ${latest.branch}</p>
          <p>Time: ${new Date(latest.created_at).toLocaleString()}</p>
        </div>
      `;
    }
    
    setInterval(checkStatus, 60000); // Check every minute
    checkStatus();
  </script>
</head>
<body>
  <div id="status"></div>
</body>
</html>
```

### 9. Monitoring Best Practices

**Alert Fatigue Prevention:**
- ✅ Send critical alerts (failed deploys) to urgent channels (SMS, PagerDuty)
- ✅ Send success notifications to team channels (Slack)
- ✅ Filter preview deploy failures from production alerts
- ❌ Don't send all notifications to everyone
- ❌ Don't use the same channel for all alert severities

**Alert Prioritization:**
```
Critical (Immediate Response):
- Production deploy failures
- Security vulnerabilities detected
- Database connection failures

High (Within 1 hour):
- Deploy preview failures on main PR
- Performance degradation
- Function timeout errors

Medium (Within 4 hours):
- Deploy preview failures on feature branches
- Non-critical build warnings
- Slow build times

Low (Within 24 hours):
- Successful deploys
- Dependency updates available
- Build performance metrics
```

**Response Procedures:**

1. **Immediate Actions (< 5 minutes):**
   - Check Netlify deploy logs
   - Verify if issue is isolated or widespread
   - Check status page: https://www.netlifystatus.com/

2. **Investigation (< 15 minutes):**
   - Review recent commits
   - Check for environment variable changes
   - Verify third-party service status (database, APIs)

3. **Resolution (< 30 minutes):**
   - Roll back to last successful deploy if needed
   - Fix issue and redeploy
   - Verify fix with smoke tests

4. **Post-Mortem (Within 24 hours):**
   - Document root cause
   - Update runbooks
   - Implement preventive measures

### 10. Testing Notifications

**Test Your Setup:**

```bash
# Trigger a test deploy
netlify deploy --build

# Test webhook manually
curl -X POST https://your-webhook-url \
  -H "Content-Type: application/json" \
  -d '{
    "state": "error",
    "name": "quemiai-test",
    "error_message": "Test notification"
  }'

# Test Slack webhook
curl -X POST $SLACK_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text":"Test deploy notification"}'
```

**Verification Checklist:**
- [ ] Email notifications received
- [ ] Slack messages appear in correct channel
- [ ] GitHub status updates on commits
- [ ] Webhook endpoints respond correctly
- [ ] SMS alerts sent to on-call engineer (if configured)
- [ ] PagerDuty incidents created for critical failures
- [ ] Dashboard updates with latest status

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
