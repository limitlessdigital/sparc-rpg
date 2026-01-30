# SPARC RPG

A tabletop RPG platform with AI-powered game mastering.

## Quick Start

### Prerequisites

- **Node.js 20+** (check with `node -v`)
- **pnpm** (`npm install -g pnpm`)
- **Docker Desktop** (for local Supabase)
- **Supabase CLI** (`brew install supabase/tap/supabase`)

### Local Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repo-url>
   cd sparc-rpg
   pnpm install
   ```

2. **Set up local Supabase:**
   ```bash
   ./scripts/setup-local.sh
   ```
   
   This script will:
   - Verify Docker and Supabase CLI are installed
   - Start the local Supabase stack
   - Apply database migrations
   - Seed the database with sample data

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your OpenAI API key
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

5. **Open in browser:**
   - Web App: http://localhost:3000
   - Supabase Studio: http://127.0.0.1:54323

### Test Accounts

After running the setup script, these accounts are available:

| Email | Password | Role |
|-------|----------|------|
| seer@sparc.local | password123 | Seer (Game Master) |
| player1@sparc.local | password123 | Player |
| player2@sparc.local | password123 | Player |
| player3@sparc.local | password123 | Player |

### Sample Data

The seed includes:
- **7 Characters** - One for each class (Warrior, Rogue, Wizard, Cleric, Paladin, Ranger, Necromancer)
- **1 Adventure** - "The Goblin Caves" (beginner-friendly)
- **1 Session** - Ready to join with code `SPARC1`

## Project Structure

```
sparc-rpg/
├── apps/
│   └── web/              # Next.js web application
├── packages/
│   ├── api/              # tRPC API routes
│   ├── db/               # Database client & migrations
│   ├── shared/           # Shared types & utilities
│   └── ui/               # React component library
├── supabase/
│   ├── config.toml       # Supabase local config
│   ├── seed.sql          # Development seed data
│   └── migrations/       # Database migrations
└── scripts/
    └── setup-local.sh    # Local dev setup script
```

## Common Commands

```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm build            # Build all packages
pnpm typecheck        # Run TypeScript checks
pnpm lint             # Run ESLint

# Database
supabase start        # Start local Supabase
supabase stop         # Stop local Supabase
supabase status       # Check status
supabase db reset     # Reset and reseed database

# Testing
pnpm test             # Run tests
pnpm test:e2e         # Run end-to-end tests
```

## Local Services

When Supabase is running locally:

| Service | URL |
|---------|-----|
| API | http://127.0.0.1:54321 |
| Studio (Admin UI) | http://127.0.0.1:54323 |
| Inbucket (Email) | http://127.0.0.1:54324 |
| Database | postgresql://postgres:postgres@127.0.0.1:54322/postgres |

## Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Project Status](./PROJECT-STATUS.md)
- [Tech Stack](./TECH-STACK.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Build Log](./BUILD-LOG.md)

## Storage Buckets

Local development includes these storage buckets:

- **avatars** - User and character profile images (5MB max, images only)
- **covers** - Adventure cover art (10MB max, images only)
- **audio** - Voice narration and sound effects (50MB max, audio only)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm typecheck && pnpm lint`
4. Submit a pull request

## License

MIT
