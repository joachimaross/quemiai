# Quemiai Frontend

Next.js-based frontend application for the Quemiai course management platform.

## Features

- **Authentication**: Firebase authentication with email/password and Google sign-in
- **Course Management**: Full CRUD operations for courses via REST API
- **Dashboard**: Interactive course listing with add, edit, and delete functionality
- **Responsive UI**: Modern design with Tailwind CSS
- **Real-time Updates**: Live course data management

## Getting Started

### Prerequisites

- Node.js >= 18 < 21
- npm or yarn
- Running backend API (default: http://localhost:4000)
- Firebase project with authentication enabled

### Installation

```bash
# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in this directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

See `.env.local.example` for a template.

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

## Application Structure

### Pages

- **`/login`**: User authentication page with email/password and Google sign-in
- **`/dashboard`**: Course management dashboard with CRUD operations
- **`/`**: Home page
- **`/discover`**: Content discovery page
- **`/create`**: Content creation page
- **`/community`**: Community page
- **`/profile`**: User profile page

### Components

- **`Navbar`**: Application header with logout functionality
- **`CourseCard`**: Course display card with edit/delete actions
- **`FloatingDock`**: Navigation dock for quick access to pages
- **`Logo`**: Application logo component

### API Client

The `lib/apiClient.ts` provides methods to interact with the backend API:

- `getCourses()`: Fetch all courses
- `getCourse(id)`: Fetch a specific course
- `addCourse(data)`: Create a new course
- `updateCourse(id, data)`: Update an existing course
- `deleteCourse(id)`: Delete a course

### Firebase Authentication

The `lib/auth.ts` provides Firebase authentication utilities:

- `signIn(email, password)`: Email/password authentication
- `googleSignIn()`: Google OAuth authentication
- `logOut()`: Sign out current user
- `getCurrentUser(callback)`: Monitor auth state changes

## Netlify Deployment

This application is configured for Netlify deployment with enterprise-grade security and performance settings.

### Deployment Setup

The frontend is part of a monorepo and deploys automatically via the root `netlify.toml` configuration.

For detailed deployment instructions, see:
- **[NETLIFY_DEPLOYMENT.md](../../NETLIFY_DEPLOYMENT.md)** - Complete deployment guide
- **[NETLIFY_QUICKSTART.md](../../NETLIFY_QUICKSTART.md)** - Quick start guide

### Configuration Files

- **netlify.toml** (root): Main Netlify configuration with:
  - Build settings for pnpm monorepo
  - Serverless functions configuration
  - Security headers and redirects
  - Next.js plugin integration

- **public/_redirects**: URL routing rules:
  - API proxy to Netlify Functions
  - SPA fallback routing

- **public/_headers**: Security and caching headers:
  - HSTS, CSP, X-Frame-Options
  - Cache control for static assets

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
apps/web/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   ├── community/    # Community pages
│   │   ├── create/       # Create content pages
│   │   ├── discover/     # Discover pages
│   │   └── profile/      # Profile pages
│   ├── components/       # React components
│   └── lib/              # Utility functions
├── public/
│   ├── _redirects        # Netlify URL routing
│   └── _headers          # Netlify security headers
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## Environment Variables

Create a `.env.local` file in this directory for local development:

```env
# Add your environment variables here
```

For production deployment, configure environment variables in the Netlify dashboard under **Site Settings** → **Environment Variables**.

See the root `.env.example` file for all available environment variables.

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
