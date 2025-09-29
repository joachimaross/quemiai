# Jacameno: Messaging-First Social Media App

## Vision
A full-stack, messaging-first social media platform with a modern Apple/Google Messages aesthetic and a futuristic cyberpunk theme. Fast, mobile-first, and extensible.

---

## Design Goals
- **Style:** Modern, minimalist, fluid chat bubbles; dark mode, neon gradients, smooth animations.
- **UX:** Fast, responsive, accessible, mobile-first, native-feeling interactions.

## Core Features
- **Messaging:** 1-on-1/group chats, real-time, read receipts, typing, reactions, voice notes, media, search, edit/delete, push notifications.
- **Profiles & Auth:** Secure login (email, Google, Apple), user profiles, avatar, bio, followers, online status.
- **Social Feed:** Posts (text/photos/videos), likes, comments, shares, CRUD.
- **Stories/Shorts:** Story/short-form UI, audio overlay support.
- **Discovery:** Search, hashtags, trending, suggested users.
- **Business/Monetization:** Creator subscriptions, marketplace, ad system scaffolding.
- **AI Integration:** Hooks/endpoints for assistant chat, translation, recommendations (stubs/interfaces).

## Tech Stack
- **Frontend:** Next.js (App Router), TailwindCSS, Framer Motion
- **Backend:** Node.js (NestJS preferred), REST + GraphQL
- **Database:** PostgreSQL (Prisma ORM)
- **Auth:** Firebase Auth or Auth0 (configurable)
- **Real-time:** WebSockets/Socket.IO or NestJS Gateways
- **Hosting:** Vercel (frontend), Railway/Heroku (backend)

## Architecture & Folder Structure
- **Frontend (Next.js):**
  - `app/` routes: `chat`, `feed`, `stories`, `profile`, `discover`, `settings`, `auth`
  - `components/` shared UI (chat bubbles, message input, story viewer, post card)
  - `lib/` API clients, hooks (useChat, useFeed), auth helpers
  - `styles/` Tailwind config, theme (dark mode + neon gradients)
- **Backend (NestJS):**
  - `src/modules/` per domain: `auth`, `users`, `profiles`, `chat`, `feed`, `stories`, `search`, `monetization`, `ai`, `notifications`, `media`
  - `src/common/` guards, interceptors, DTOs, utilities
  - `src/database/` Prisma schema, migrations, seeds
  - `src/gateways/` WebSocket messaging gateway
  - `src/config/` env, providers (Firebase/Auth0)
- **Shared:**
  - `.env.example` with required vars (DB, auth, storage, real-time)
  - `docker-compose.yml` for local Postgres + backend
  - `README.md` with setup, scripts, and feature overview

## Non-Functional Requirements
- **Performance:** Pagination, indexing, efficient message queries.
- **Security:** Protected routes, role-based access, input validation.
- **Testing:** Unit tests for services/components; basic e2e for auth/messaging.
- **CI-ready:** Scripts for build, lint, test; sensible defaults.

## Deliverables
- Working scaffold for frontend/backend (runs locally)
- Starter UI for chat, feed, profiles, stories, discovery
- Real-time messaging end-to-end (local demo)
- Auth integration (Firebase/Auth0), minimal setup docs
- Database schema and initial migrations (Prisma)
- Theming: Dark mode, neon gradients, Framer Motion transitions
- Docs: Clear README with environment setup, commands, extension notes

---

**Focus:** Clean, well-documented code, sensible defaults, extensible, production-leaning structure.
