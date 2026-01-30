# Overnight Build Plan

> Ross is sleeping. J is building. Let's make magic happen.

---

## Strategy

1. **Foundation First** — Get the monorepo, types, and database right
2. **Validate Everything** — Each step has a checkpoint
3. **Document All Decisions** — Ross can review in the morning
4. **Stop on Blockers** — Don't break things, flag issues

---

## Build Order

### Hour 1-2: Project Setup
- [ ] Initialize Turborepo monorepo
- [ ] Setup TypeScript, ESLint, Prettier
- [ ] Create package structure (apps/, packages/)
- [ ] Configure Tailwind with design tokens

### Hour 2-3: Database
- [ ] Create Supabase project (or use existing)
- [ ] Write and run migrations for core tables
- [ ] Setup RLS policies
- [ ] Generate TypeScript types from schema

### Hour 3-4: Auth & API
- [ ] Configure Supabase Auth
- [ ] Create tRPC router structure
- [ ] Implement auth procedures
- [ ] Test auth flow

### Hour 4-5: Shared Packages
- [ ] @sparc/db - Database client
- [ ] @sparc/ui - Core components (Button, Card, Input)
- [ ] @sparc/game-logic - Dice, character rules

### Hour 5-6: Web App Shell
- [ ] Next.js app with routing
- [ ] Layout with navigation
- [ ] Auth pages (login, register)
- [ ] Dashboard shell

### Hour 6+: Core Features
- [ ] Character creation wizard
- [ ] Session browser
- [ ] Dice roller component
- [ ] Basic Seer dashboard

---

## Validation Gates

Before moving to next phase:

1. **Project Setup** → `pnpm build` passes, no TS errors
2. **Database** → Can query all tables, RLS blocks unauthorized
3. **Auth** → Can sign up, login, logout, refresh token
4. **Packages** → All tests pass, types export correctly
5. **Web App** → All routes render, no console errors
6. **Features** → E2E smoke tests pass

---

## If Something Breaks

1. Log the error in BUILD-LOG.md
2. Create a GitHub issue with details
3. Tag it as `overnight-blocker`
4. Move to next independent task
5. Review with Ross in morning

---

## Builder Agents

| Agent | Task | Timeout |
|-------|------|---------|
| Builder-1 | Monorepo + TypeScript setup | 30m |
| Builder-2 | Database migrations + types | 30m |
| Builder-3 | UI component library | 45m |
| Builder-4 | Web app foundation | 45m |

---

## Success Criteria

Ross wakes up to:
- ✅ Working monorepo with proper structure
- ✅ Database schema deployed
- ✅ Auth working
- ✅ Basic UI components in Storybook
- ✅ Web app running locally
- ✅ Clear log of what was done

---

*Let's build something great.* 🚀
