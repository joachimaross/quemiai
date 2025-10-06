#!/bin/bash

# Netlify Configuration Validation Script
# This script validates that all Netlify deployment files are properly configured

set -e  # Exit on error

echo "🔍 Validating Netlify Configuration for Quemiai..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running from repository root
if [ ! -f "netlify.toml" ]; then
    echo -e "${RED}❌ Error: netlify.toml not found. Please run this script from the repository root.${NC}"
    exit 1
fi

echo "✅ Repository root detected"
echo ""

# 1. Check required files exist
echo "📁 Checking required files..."
FILES=(
    "netlify.toml"
    "apps/web/public/_redirects"
    "apps/web/public/_headers"
    "netlify/functions/api.ts"
    "netlify/functions/package.json"
    ".env.example"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file (missing)"
        exit 1
    fi
done
echo ""

# 2. Validate netlify.toml syntax
echo "🔧 Validating netlify.toml..."
if grep -q "base = \"apps/web\"" netlify.toml; then
    echo -e "  ${GREEN}✓${NC} Base directory configured correctly"
else
    echo -e "  ${RED}✗${NC} Base directory not configured"
    exit 1
fi

if grep -q "publish = \".next\"" netlify.toml; then
    echo -e "  ${GREEN}✓${NC} Publish directory configured"
else
    echo -e "  ${RED}✗${NC} Publish directory not configured"
    exit 1
fi

if grep -q "functions = \"../../netlify/functions\"" netlify.toml; then
    echo -e "  ${GREEN}✓${NC} Functions directory configured"
else
    echo -e "  ${RED}✗${NC} Functions directory not configured"
    exit 1
fi
echo ""

# 3. Check _redirects file
echo "🔀 Validating _redirects..."
if grep -q "/api/\*" apps/web/public/_redirects; then
    echo -e "  ${GREEN}✓${NC} API proxy redirect configured"
else
    echo -e "  ${YELLOW}⚠${NC}  API proxy redirect not found"
fi

if grep -q "/\*.*200" apps/web/public/_redirects; then
    echo -e "  ${GREEN}✓${NC} SPA fallback configured"
else
    echo -e "  ${RED}✗${NC} SPA fallback not configured"
    exit 1
fi
echo ""

# 4. Check _headers file
echo "🔒 Validating _headers (security)..."
HEADERS=(
    "X-Frame-Options"
    "X-Content-Type-Options"
    "Strict-Transport-Security"
    "Referrer-Policy"
)

for header in "${HEADERS[@]}"; do
    if grep -q "$header" apps/web/public/_headers; then
        echo -e "  ${GREEN}✓${NC} $header configured"
    else
        echo -e "  ${YELLOW}⚠${NC}  $header not found"
    fi
done
echo ""

# 5. Check pnpm workspace
echo "📦 Checking pnpm workspace..."
if [ -f "pnpm-workspace.yaml" ]; then
    echo -e "  ${GREEN}✓${NC} pnpm-workspace.yaml exists"
else
    echo -e "  ${RED}✗${NC} pnpm-workspace.yaml not found"
    exit 1
fi

if [ -f "pnpm-lock.yaml" ]; then
    echo -e "  ${GREEN}✓${NC} pnpm-lock.yaml exists"
else
    echo -e "  ${YELLOW}⚠${NC}  pnpm-lock.yaml not found (will be created on install)"
fi
echo ""

# 6. Check Next.js configuration
echo "⚙️  Checking Next.js configuration..."
if [ -f "apps/web/next.config.js" ]; then
    echo -e "  ${GREEN}✓${NC} next.config.js exists"
    
    if grep -q "output: 'standalone'" apps/web/next.config.js; then
        echo -e "  ${GREEN}✓${NC} Standalone output configured"
    else
        echo -e "  ${YELLOW}⚠${NC}  Standalone output not configured (optional)"
    fi
else
    echo -e "  ${RED}✗${NC} next.config.js not found"
    exit 1
fi
echo ""

# 7. Check Netlify function
echo "⚡ Checking Netlify function..."
if grep -q "export const handler" netlify/functions/api.ts; then
    echo -e "  ${GREEN}✓${NC} Handler export found"
else
    echo -e "  ${RED}✗${NC} Handler export not found"
    exit 1
fi

if grep -q "serverless-http" netlify/functions/api.ts; then
    echo -e "  ${GREEN}✓${NC} serverless-http wrapper configured"
else
    echo -e "  ${YELLOW}⚠${NC}  serverless-http not found"
fi
echo ""

# 8. Environment variables check
echo "🔐 Checking environment configuration..."
if [ -f ".env.example" ]; then
    echo -e "  ${GREEN}✓${NC} .env.example present"
    
    # Count required variables
    VAR_COUNT=$(grep -c "^[A-Z]" .env.example || true)
    echo -e "  ${GREEN}ℹ${NC}  $VAR_COUNT environment variables documented"
else
    echo -e "  ${YELLOW}⚠${NC}  .env.example not found"
fi

if [ -f ".env" ]; then
    echo -e "  ${YELLOW}⚠${NC}  .env file found (should not be committed)"
else
    echo -e "  ${GREEN}✓${NC} No .env file (good - use .env.example as template)"
fi
echo ""

# 9. Git configuration
echo "📝 Checking Git configuration..."
if grep -q ".netlify" .gitignore; then
    echo -e "  ${GREEN}✓${NC} .netlify directory ignored"
else
    echo -e "  ${YELLOW}⚠${NC}  .netlify not in .gitignore"
fi

if grep -q ".next/" .gitignore; then
    echo -e "  ${GREEN}✓${NC} .next build directory ignored"
else
    echo -e "  ${YELLOW}⚠${NC}  .next not in .gitignore"
fi
echo ""

# 10. Validate function package.json dependencies
echo "📦 Validating function dependencies..."
if [ -f "netlify/functions/package.json" ]; then
    if grep -q "serverless-http" netlify/functions/package.json; then
        echo -e "  ${GREEN}✓${NC} serverless-http dependency found"
    else
        echo -e "  ${YELLOW}⚠${NC}  serverless-http not in dependencies"
    fi
    
    # Check if package.json is valid JSON
    if node -e "JSON.parse(require('fs').readFileSync('netlify/functions/package.json', 'utf8'))" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} package.json is valid JSON"
    else
        echo -e "  ${RED}✗${NC} package.json is invalid JSON"
        exit 1
    fi
fi
echo ""

# 11. Validate build command syntax
echo "🔨 Validating build command..."
BUILD_CMD=$(grep "command = " netlify.toml | head -1)
if [ -n "$BUILD_CMD" ]; then
    echo -e "  ${GREEN}✓${NC} Build command found"
    
    # Check for pnpm usage
    if echo "$BUILD_CMD" | grep -q "pnpm"; then
        echo -e "  ${GREEN}✓${NC} Using pnpm package manager"
    else
        echo -e "  ${YELLOW}⚠${NC}  Not using pnpm (recommended for this project)"
    fi
else
    echo -e "  ${RED}✗${NC} Build command not found in netlify.toml"
    exit 1
fi
echo ""

# 12. Validate redirect patterns
echo "🔄 Validating redirect patterns..."
REDIRECT_COUNT=$(grep -c "/.netlify/functions" apps/web/public/_redirects || true)
if [ "$REDIRECT_COUNT" -gt 0 ]; then
    echo -e "  ${GREEN}✓${NC} Function redirects configured ($REDIRECT_COUNT rules)"
    
    # Check for duplicate redirects (excluding comments and empty lines)
    DUPLICATE_COUNT=$(grep -v "^#" apps/web/public/_redirects | grep -v "^$" | sort | uniq -d | wc -l)
    if [ "$DUPLICATE_COUNT" -eq 0 ]; then
        echo -e "  ${GREEN}✓${NC} No duplicate redirect rules"
    else
        echo -e "  ${YELLOW}⚠${NC}  Found $DUPLICATE_COUNT duplicate redirect rules"
    fi
else
    echo -e "  ${YELLOW}⚠${NC}  No function redirects found"
fi
echo ""

# 13. Validate cache header values
echo "💾 Validating cache headers..."
if grep -q "Cache-Control" apps/web/public/_headers; then
    echo -e "  ${GREEN}✓${NC} Cache-Control headers configured"
    
    # Check for immutable directive on static assets
    if grep -q "immutable" apps/web/public/_headers; then
        echo -e "  ${GREEN}✓${NC} Immutable caching for static assets"
    else
        echo -e "  ${YELLOW}⚠${NC}  Consider adding immutable caching for static assets"
    fi
    
    # Check for API no-cache directive
    if grep -A 3 "/api/\*" apps/web/public/_headers | grep -q "no-cache"; then
        echo -e "  ${GREEN}✓${NC} API responses set to no-cache"
    else
        echo -e "  ${YELLOW}⚠${NC}  API responses should be set to no-cache"
    fi
else
    echo -e "  ${YELLOW}⚠${NC}  No Cache-Control headers found"
fi
echo ""

# 14. Check for Next.js plugin configuration
echo "🔌 Validating Next.js plugin..."
if grep -q "@netlify/plugin-nextjs" netlify.toml; then
    echo -e "  ${GREEN}✓${NC} Next.js plugin configured"
else
    echo -e "  ${YELLOW}⚠${NC}  @netlify/plugin-nextjs not configured (recommended)"
fi
echo ""

# 15. Validate environment variable references
echo "🔑 Validating environment variable configuration..."
if [ -f ".env.example" ]; then
    # Check for sensitive variable patterns in .env.example
    if grep -q "your-secret\|your-key\|your-password\|example" .env.example; then
        echo -e "  ${GREEN}✓${NC} .env.example uses placeholder values (good practice)"
    fi
    
    # Check for NEXT_PUBLIC_ prefix on frontend variables
    if grep -q "NEXT_PUBLIC_" .env.example; then
        echo -e "  ${GREEN}✓${NC} Frontend variables properly prefixed with NEXT_PUBLIC_"
    fi
    
    # Check for common required variables
    REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET" "NODE_ENV")
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$var=" .env.example; then
            echo -e "  ${GREEN}✓${NC} $var documented"
        else
            echo -e "  ${YELLOW}⚠${NC}  $var not documented (may be needed)"
        fi
    done
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Netlify configuration validation complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Next steps:"
echo "  1. Review .env.example and set up environment variables in Netlify"
echo "  2. Connect repository to Netlify (see NETLIFY_QUICKSTART.md)"
echo "  3. Configure build settings in Netlify Dashboard"
echo "  4. Deploy to Netlify"
echo ""
echo "📖 Documentation:"
echo "  - Quick Start: NETLIFY_QUICKSTART.md"
echo "  - Full Guide: NETLIFY_DEPLOYMENT.md"
echo "  - Environment Variables: .env.example"
echo ""
