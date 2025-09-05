# SPARC Source Tree Structure

## Project Root Structure

```
sparc/
├── .bmad-core/                 # BMAD agent configuration and templates
├── .claude/                    # Claude Code configuration
├── .git/                       # Git repository data
├── api/                        # Legacy API directory
├── archon-ui-main/            # React frontend application
├── docs/                      # Documentation and specifications
│   ├── architecture/          # Technical architecture docs
│   ├── front-end-spec.md     # UI/UX specifications
│   └── [other-specs].md      # Additional specification documents
├── PRPs/                      # Product Requirement Prompts
├── python/                    # Backend services
├── supabase/                  # Database configuration
├── CLAUDE.md                  # Development guidelines for Claude Code
├── DEPLOYMENT.md              # Deployment instructions
├── SPARC.md                   # Project overview
└── package configs...         # Various configuration files
```

## Frontend Structure (`archon-ui-main/`)

```
archon-ui-main/
├── public/                    # Static assets
├── src/                      # Source code
│   ├── components/           # Reusable React components
│   │   ├── DiceRoller.tsx   # SPARC RPG dice rolling interface
│   │   ├── CharacterSheet/  # Character management components
│   │   └── AdventureForge/  # Node-based adventure editor (planned)
│   ├── pages/               # Main application pages
│   │   ├── Dashboard/       # Main user dashboard
│   │   ├── Characters/      # Character management
│   │   ├── Adventures/      # Adventure browser/player
│   │   ├── Forge/          # Adventure creation interface
│   │   ├── Library/        # Content library
│   │   └── Profile/        # User profile and settings
│   ├── services/           # API communication layer
│   │   ├── api.ts         # Core API service with mock mode
│   │   ├── characters.ts  # Character-related API calls
│   │   ├── adventures.ts  # Adventure-related API calls
│   │   └── auth.ts        # Authentication services
│   ├── hooks/             # Custom React hooks
│   │   ├── usePolling.ts  # HTTP polling hook
│   │   ├── useDatabaseMutation.ts # Database operations
│   │   └── useProjectMutation.ts  # Project operations
│   ├── contexts/          # React context providers
│   │   ├── AuthContext.tsx # Authentication state
│   │   └── GameContext.tsx # Game state management
│   ├── styles/            # Global styles and theme
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript type definitions
├── test/                  # Test files
├── package.json          # NPM dependencies and scripts
├── vite.config.ts        # Vite build configuration
├── tailwind.config.js    # TailwindCSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Backend Structure (`python/`)

```
python/
├── src/                  # Main source code
│   ├── server/          # FastAPI application
│   │   ├── main.py      # Application entry point
│   │   ├── api_routes/  # API endpoint handlers
│   │   │   ├── sparc_adventure.py    # Adventure management
│   │   │   ├── sparc_characters_api.py # Character operations
│   │   │   ├── sparc_dice_api.py      # Dice rolling API
│   │   │   ├── sparc_sessions_api.py  # Session management
│   │   │   ├── sparc_ai_api.py        # AI integration
│   │   │   └── sparc_polling_api.py   # Polling endpoints
│   │   └── services/    # Business logic services
│   │       └── sparc/   # SPARC-specific services
│   │           ├── models.py              # Data models
│   │           ├── cached_session_service.py # Session caching
│   │           ├── dice_broadcaster.py    # Dice event broadcasting
│   │           ├── optimized_database.py  # Database optimizations
│   │           └── tutorial_service.py    # Tutorial system
│   ├── mcp/             # MCP server implementation
│   └── agents/          # PydanticAI agent implementations
├── tests/               # Test files
│   ├── test_character_creation_performance.py
│   ├── test_ai_seer_performance.py
│   └── [other-tests].py
├── api/                 # Legacy API structure
│   ├── sessions.py      # Session management
│   ├── dice.py         # Dice mechanics
│   └── characters.py   # Character operations
└── pyproject.toml      # Python dependencies (uv package manager)
```

## Documentation Structure (`docs/`)

```
docs/
├── architecture/                    # Technical specifications
│   ├── coding-standards.md         # Development standards
│   ├── tech-stack.md               # Technology choices
│   ├── source-tree.md              # This file
│   ├── adventure-forge-architecture.md # Backend architecture
│   ├── adventure-forge-prototype.md    # Interactive prototype specs
│   ├── collaboration-api-spec.md       # Real-time collaboration
│   └── component-specifications.md     # React component specs
├── front-end-spec.md               # Complete UI/UX specification
└── [other-specs].md               # Additional specifications
```

## Configuration Structure (`.bmad-core/`)

```
.bmad-core/
├── core-config.yaml    # Main configuration
├── tasks/             # Development tasks
├── templates/         # Code and document templates  
├── checklists/        # Quality assurance checklists
└── [other-resources]/ # Additional development resources
```

## Key Files & Their Purposes

### Frontend Key Files
- `archon-ui-main/src/components/DiceRoller.tsx` - Core SPARC RPG dice interface (d6 only)
- `archon-ui-main/src/services/api.ts` - API layer with mock mode for frontend-only deployment
- `archon-ui-main/vite.config.ts` - Build configuration with proxy for development
- `archon-ui-main/package.json` - Dependencies: React, TypeScript, Vite, TailwindCSS

### Backend Key Files
- `python/src/server/main.py` - FastAPI application entry point
- `python/src/server/api_routes/sparc_dice_api.py` - d6 dice rolling implementation
- `python/pyproject.toml` - Dependencies managed by uv package manager

### Configuration Files
- `CLAUDE.md` - Development guidelines and architecture overview
- `vercel.json` - Frontend deployment configuration
- `.mcp.json` - MCP (Model Context Protocol) configuration
- `core-config.yaml` - BMAD development workflow configuration

## Development Workflow Directories

### Active Development Areas
1. **Adventure Forge Implementation** - Complex node-based editor in `archon-ui-main/src/components/AdventureForge/`
2. **Real-time Collaboration** - WebSocket services in `python/src/server/services/collaboration/`
3. **Validation System** - Rule engine in `python/src/server/services/validation/`
4. **Mobile Optimization** - Touch-optimized components in frontend

### Testing Structure
- **Frontend Tests** - `archon-ui-main/test/` using Vitest
- **Backend Tests** - `python/tests/` using pytest
- **E2E Tests** - Planned Cypress integration

## Deployment Structure

### Development Mode
- Frontend: `npm run dev` on port 3737
- Backend: `uv run python -m src.server.main` on port 8181  
- MCP Server: Port 8051
- Agents Service: Port 8052

### Production Deployment
- **Frontend Only**: Vercel static deployment with mock API
- **Full Stack**: Docker Compose with all services
- **Database**: Supabase (PostgreSQL + pgvector)
- **Storage**: AWS S3 for media assets

This structure supports the SPARC RPG's core features (dice rolling, character management, adventure creation) while providing the foundation for the complex Adventure Forge node-based editor system.