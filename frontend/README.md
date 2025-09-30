# Zeeky Social Frontend

Next.js-based frontend application for the Zeeky Social platform.

## Getting Started

### Prerequisites

- Node.js >= 18 < 21
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Vercel Deployment

This directory is configured for Vercel deployment with enterprise-grade security and performance settings.

### Deployment Setup

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   # From the repository root
   cd frontend
   vercel
   
   # Or deploy to production
   vercel --prod
   ```

4. **Configure Vercel Project Settings:**
   - In your Vercel project dashboard, go to **Settings** → **General**
   - Set **Root Directory** to `frontend`
   - This ensures Vercel uses this directory as the project root
   - Environment variables should be configured in the Vercel dashboard

### Configuration Files

- **vercel.json**: Enterprise-grade Vercel configuration with:
  - Security headers (HSTS, CSP, X-Frame-Options, etc.)
  - Caching strategies for static assets
  - Clean URLs and trailing slash handling
  - Placeholder sections for rewrites and redirects

- **next.config.js**: Next.js configuration with:
  - React Strict Mode enabled
  - Powered-by header disabled for security
  - Image optimization settings
  - Security headers
  - Console removal in production
  - Package import optimizations

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom components with Lucide icons
- **Animation:** Framer Motion

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   ├── community/    # Community pages
│   │   ├── create/       # Create content pages
│   │   ├── discover/     # Discover pages
│   │   └── profile/      # Profile pages
│   ├── components/       # React components
│   └── lib/             # Utility functions
├── next.config.js       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
├── vercel.json          # Vercel deployment configuration
└── package.json         # Dependencies and scripts
```

## Environment Variables

Create a `.env.local` file in this directory for local development:

```env
# Add your environment variables here
```

For production deployment, configure environment variables in the Vercel dashboard under **Settings** → **Environment Variables**.

## Security Features

The configuration includes several enterprise-grade security features:

- **HSTS (HTTP Strict Transport Security)**: Enforces HTTPS connections
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking attacks
- **Referrer Policy**: Controls referrer information
- **Permissions Policy**: Restricts browser features
- **Powered-by Header Removal**: Reduces information disclosure

## Performance Optimizations

- **Static Asset Caching**: Long-term caching for JS/CSS with immutable flag
- **Image Optimization**: Automatic image optimization with modern formats (AVIF, WebP)
- **Code Splitting**: Automatic code splitting with Next.js
- **Package Import Optimization**: Optimized imports for large packages

## License

UNLICENSED - Private project
