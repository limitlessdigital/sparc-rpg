# SPARC RPG - Recommended Tech Stack

> A cohesive, synergistic stack where every piece integrates cleanly.

---

## Philosophy

1. **Supabase as the backbone** — Auth, DB, Storage, Realtime, Edge Functions
2. **TypeScript everywhere** — Frontend, backend, shared types
3. **React ecosystem** — Web + Mobile code sharing
4. **Managed services** — Minimize ops, maximize building

---

## Core Stack

### Frontend (Web)

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | Next.js 14 (App Router) | SSR, API routes, excellent DX, Vercel deploy |
| **Language** | TypeScript | Type safety, shared types with backend |
| **Styling** | TailwindCSS | Matches our design tokens, utility-first |
| **Components** | shadcn/ui | Accessible, customizable, Tailwind-native |
| **State** | Zustand | Simple, lightweight, no boilerplate |
| **Data Fetching** | TanStack Query | Caching, optimistic updates, Supabase integration |
| **Animations** | Framer Motion | Smooth, declarative, React-native compatible |
| **Forms** | React Hook Form + Zod | Validation, TypeScript schemas |
| **Component Dev** | Storybook | Design system documentation |

### Backend & Database

| Layer | Technology | Why |
|-------|------------|-----|
| **Database** | Supabase (PostgreSQL) | RLS, real-time, hosted |
| **Auth** | Supabase Auth | OAuth, JWT, integrates with RLS |
| **Storage** | Supabase Storage | Images, audio, CDN included |
| **Real-time** | Supabase Realtime | WebSockets, presence, broadcast |
| **Edge Functions** | Supabase Edge Functions (Deno) | Serverless, low latency |
| **API Layer** | tRPC | End-to-end type safety with React |

> **Note:** The existing PRDs mention FastAPI (Python). Consider migrating to Edge Functions + tRPC for full TypeScript stack, OR keep FastAPI for AI-heavy processing.

### Search

| Technology | Why |
|------------|-----|
| **Meilisearch** | Fast, typo-tolerant, self-hosted option |
| *Alternative:* Algolia | Managed, but costly at scale |

---

## Feature-Specific Stack

### Audio & Ambiance (PRD 24)

| Technology | Why |
|------------|-----|
| **Howler.js** | Cross-browser audio, sprites, spatial audio |
| **Tone.js** | Advanced audio synthesis if needed |
| **Storage** | Supabase Storage for audio files |
| **CDN** | Cloudflare for low-latency delivery |

### Voice & Video Chat (PRD 30)

| Technology | Why |
|------------|-----|
| **LiveKit** | Open source, WebRTC, excellent quality |
| *Alternative:* Daily.co | Managed, simpler but costly |
| **Features** | Screen share, recording, spatial audio |

### Mobile App (PRD 27)

| Technology | Why |
|------------|-----|
| **React Native + Expo** | Share code with web, OTA updates |
| **Expo Router** | File-based routing like Next.js |
| **React Native Reanimated** | 60fps animations |
| **Offline** | WatermelonDB for local-first sync |

### Payments & Marketplace (PRD 26)

| Technology | Why |
|------------|-----|
| **Stripe** | Payments, Connect for creator payouts |
| **Stripe Billing** | Subscriptions, usage-based |
| **Webhooks** | Supabase Edge Functions handle events |

### Integrations (PRD 28)

| Technology | Why |
|------------|-----|
| **Discord.js** | Official SDK for Discord bot |
| **Twitch API** | Extensions, EventSub webhooks |
| **Public API** | Next.js API routes + rate limiting |

### AI (PRD 06)

| Technology | Why |
|------------|-----|
| **OpenAI API** | GPT-4 for Seer assistant |
| **Vercel AI SDK** | Streaming, edge-compatible |
| *Alternative:* Anthropic Claude | Better for long context |

### Email & Notifications

| Technology | Why |
|------------|-----|
| **Resend** | Modern email API, React Email templates |
| **Expo Push** | Mobile push notifications |
| **Supabase Realtime** | In-app notifications |

### Monitoring & Analytics

| Technology | Why |
|------------|-----|
| **Sentry** | Error tracking, performance |
| **PostHog** | Product analytics, feature flags |
| **Vercel Analytics** | Web vitals, simple |

---

## Infrastructure

| Layer | Technology | Why |
|-------|------------|-----|
| **Web Hosting** | Vercel | Next.js native, edge functions |
| **Database** | Supabase Cloud | Managed Postgres |
| **CDN** | Cloudflare | Fast, DDoS protection, caching |
| **Media Processing** | Cloudflare Images / R2 | Resizing, optimization |
| **CI/CD** | GitHub Actions | Free, integrates everywhere |
| **Secrets** | Vercel / Supabase env vars | Secure, per-environment |

---

## Integration Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         SPARC RPG                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │   Next.js    │────▶│    tRPC      │────▶│   Supabase   │   │
│  │   Frontend   │     │   API Layer  │     │   Backend    │   │
│  └──────────────┘     └──────────────┘     └──────────────┘   │
│         │                    │                    │            │
│         │                    │                    │            │
│         ▼                    ▼                    ▼            │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │  React Native│     │   LiveKit    │     │   Stripe     │   │
│  │  Mobile App  │     │  Voice/Video │     │   Payments   │   │
│  └──────────────┘     └──────────────┘     └──────────────┘   │
│         │                    │                    │            │
│         │                    │                    │            │
│         ▼                    ▼                    ▼            │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │   Expo       │     │  Meilisearch │     │   OpenAI     │   │
│  │   Services   │     │    Search    │     │   AI/LLM     │   │
│  └──────────────┘     └──────────────┘     └──────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │         Cloudflare            │
              │   CDN / Edge / Protection     │
              └───────────────────────────────┘
```

---

## Shared Code Strategy

```
sparc-rpg/
├── apps/
│   ├── web/              # Next.js web app
│   ├── mobile/           # React Native + Expo
│   └── discord-bot/      # Discord.js bot
├── packages/
│   ├── ui/               # Shared React components
│   ├── api/              # tRPC routers & types
│   ├── db/               # Supabase client & schemas
│   ├── game-logic/       # Dice, combat, character logic
│   └── utils/            # Shared utilities
└── tooling/
    ├── eslint/           # Shared ESLint config
    ├── typescript/       # Shared TS config
    └── tailwind/         # Shared Tailwind config
```

> Use **Turborepo** for monorepo management.

---

## Cost Estimates (Monthly)

| Service | Free Tier | Growth | Scale |
|---------|-----------|--------|-------|
| Supabase | $0 (500MB) | $25 | $100+ |
| Vercel | $0 (hobby) | $20 | $100+ |
| LiveKit | $0 (dev) | $50 | Usage |
| Stripe | 2.9% + 30¢ | Same | Volume discounts |
| Meilisearch | Self-host | $30 cloud | $100+ |
| Cloudflare | $0 (generous) | $20 | $200+ |
| Sentry | $0 (5K errors) | $26 | $80+ |
| PostHog | $0 (1M events) | Usage | Usage |
| Resend | $0 (100/day) | $20 | Usage |

**Estimated startup cost:** ~$0-50/month (free tiers)
**Growth phase:** ~$200-400/month
**Scale:** Depends on usage

---

## Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Full-stack language | TypeScript | Type safety, code sharing |
| Backend approach | Supabase + tRPC | Less infra, full type safety |
| State management | Zustand | Simple, scalable, no boilerplate |
| Mobile framework | React Native + Expo | Code sharing with web |
| Voice/video | LiveKit | Open source, quality, features |
| Search | Meilisearch | Fast, typo-tolerant, affordable |
| Payments | Stripe | Industry standard, Connect for creators |

---

## Migration Notes

The existing PRDs reference **FastAPI (Python)**. Options:

1. **Keep FastAPI** for AI-heavy endpoints (Python ML ecosystem)
2. **Migrate to Edge Functions** for simpler endpoints
3. **Hybrid**: Edge Functions for CRUD, FastAPI for AI

Recommendation: **Hybrid approach** — Use Supabase Edge Functions for most API needs, keep a small FastAPI service for AI/ML workloads.

---

*Last updated: January 29, 2026*
