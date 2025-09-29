# Jacameno Monorepo

## Overview
A full-stack, messaging-first social media app with a modern, cyberpunk-inspired UI. Built with Next.js (frontend), NestJS (backend), Prisma (Postgres), and Turborepo for fast, parallel builds and deployments.

## Monorepo Structure
- `/frontend` — Next.js app (App Router, TailwindCSS, Framer Motion)
- `/backend` — NestJS API (REST, GraphQL, WebSockets, Prisma)
- `/prisma` — Prisma schema and migrations
- `turbo.json` — Turborepo config for parallel builds

## Local Development
1. **Install dependencies:**
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
2. **Start Postgres:**
   ```bash
   docker-compose up -d db
   ```
3. **Run migrations:**
   ```bash
   cd backend && npx prisma migrate dev --name init
   ```
4. **Start apps in parallel:**
   ```bash
   npx turbo run dev --parallel
   ```
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:3001](http://localhost:3001)


## Deployment

### Backend (Railway/Heroku)
1. Build and push your backend using Docker:
   - For Railway: Connect your repo, set build command to `npm run build` and start command to `npm run start:prod` or use the Dockerfile.
   - For Heroku: Use the Dockerfile or set build/start commands as above.
2. Set environment variables (see `.env.example`).
3. Note your backend public URL (e.g., `https://your-backend-host:4000`).

### Frontend (Vercel)
1. Set `NEXT_PUBLIC_API_URL` in Vercel project settings to your backend public URL.
2. Deploy frontend from `/frontend` directory.
3. Your frontend will now connect to the backend for real-time and API features.

### Preventing Mismatches
- Use commit SHA/version env vars to prevent frontend-backend mismatches.

## Environment Variables
See `.env.example` for all required variables.

## Features
- Real-time chat, group messaging, reactions, media, stories, feed, discovery, AI hooks, monetization stubs
- Modern UI: TikTok, Facebook, Instagram, Apple/Google Messenger inspired
- Fast, parallel builds and CI-ready

## Scripts
- `npx turbo run build` — Build all apps in parallel
- `npx turbo run dev --parallel` — Run all apps in dev mode
- `npx turbo run lint` — Lint all apps

---

For more, see `JACAMENO_PROJECT_PLAN.md`.
