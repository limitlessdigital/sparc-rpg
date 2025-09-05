# SPARC Coding Standards

## Core Principles

### Alpha Development Guidelines
- **No backwards compatibility** - remove deprecated code immediately
- **Detailed errors over graceful failures** - identify and fix issues fast
- **Break things to improve them** - alpha is for rapid iteration
- **Local-only deployment** - each user runs their own instance

### Error Handling Philosophy

**When to Fail Fast and Loud:**
- Service startup failures (credentials, database, service initialization)
- Missing configuration (environment variables, invalid settings)
- Database connection failures
- Authentication/authorization failures
- Data corruption or validation errors
- Critical dependencies unavailable
- Invalid data that would corrupt state

**When to Complete but Log Detailed Errors:**
- Batch processing (crawling, document processing)
- Background tasks (embedding generation, async jobs)
- WebSocket events
- Optional features
- External API calls (with retry + exponential backoff)

**Critical Rule: Never Accept Corrupted Data**
- Skip failed items entirely rather than storing corrupted data
- Always track and report failures clearly
- Include context, stack traces, and relevant IDs in error messages

## Code Quality Standards

### Python (Backend)
- **Python 3.12** with 120 character line length
- **Ruff** for linting (errors, warnings, unused imports, code style)
- **Mypy** for type checking
- **Pydantic** for data validation - let it raise on invalid data
- Auto-formatting on save
- Run `uv run ruff check` and `uv run mypy src/` before committing

### TypeScript/React (Frontend)
- **TypeScript** strict mode enabled
- **ESLint** for code quality
- **Vite** for build tooling
- **TailwindCSS** for styling
- Component-based architecture
- Run `npm run lint` and `npm run test` before committing

### General Guidelines
- Remove dead code immediately
- Prioritize functionality over production patterns
- Focus on user experience and feature completeness
- Use specific exception types, not generic Exception catching
- Include detailed error context for debugging
- For batch operations, report both success count and detailed failure lists

## Performance Standards
- Frontend: Maintain 60fps during interactions
- API: Sub-100ms response times for node operations
- Database: Optimize with proper indexing and query patterns
- Mobile: Touch-optimized with gesture recognition

## Security Standards
- Never expose or log secrets/keys
- Never commit secrets to repository
- Validate all user inputs
- Use proper authentication/authorization patterns
- Encrypt sensitive data at rest (AES-256)
- TLS 1.3 for all API communications