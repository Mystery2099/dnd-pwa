# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Rules

1. **Root workspace**: Run bun commands from project root - they proxy to `grimar/` automatically
2. **Prefer Context7 MCP** for library documentation before web search
3. **Schema changes**: `bun run db:push` (dev) or `db:generate && db:migrate` (prod)
4. **After config changes**: run `bun run prepare`
5. **Before committing**: Run `bun run check` and `CI=true bun run test:run`
6. **Zod validation**: All provider data must be validated before database insert
7. **Cache invalidation**: Call `invalidateCache()` after data mutations
8. **VirtualList**: Use for 50+ items (import from `$lib/components/ui/VirtualList`)
9. **Database retries**: Use `getDbWithRetry()` wrapper for flaky connections
10. **Logging**: Use child loggers from `$lib/server/logger` - NEVER `console.error` directly
11. **Test location**: `*.test.ts` alongside source files (co-located in `grimar/src/`)
12. **Auth**: Only `/` is public; all other routes redirect to `/`
13. **Adapter**: `svelte-adapter-bun` (not node)
14. **Feature flags**: Check `providers.json` for enabled data sources
15. **Naming**: Use `_` prefix for intentionally unused variables (both args and vars)
16. **Navigation**: `svelte/no-navigation-without-resolve` is disabled - pushState is used correctly

## Code Style

- **Tabs, not spaces** with **single quotes** and **no trailing commas**
- **Named exports only** (no default exports except Svelte components)
- **Strict equality**: Use `===` and `!==`
- **Semicolons**: Always use semicolons
- **Event handlers**: Use `onclick={...}` NOT `on:click={...}` (Svelte 5)
- **Svelte 5**: Use `$state()`, `$derived()`, `$effect()` runes

## Essential Commands

All commands can be run from the project root - they automatically proxy to the `grimar/` workspace.

```bash
# Development
bun run dev              # Dev server (localhost:5173)
bun run check            # TypeScript check
bun run build            # Build for production
bun run start            # Production server
bun run format           # Format with Prettier
bun run lint             # Lint and format check

# Testing
bun run test:run         # CI mode (run before commit)
bun run test -- <pattern>  # Match tests by pattern
bun run test:ui          # Vitest UI mode
bun run test:e2e         # Playwright E2E tests
bun run test:e2e:ui      # Playwright UI mode
bun run test:e2e:debug   # Playwright debug mode
bun run test:all         # Run all tests (unit + E2E)

# Database
bun run db:push          # Push schema changes (dev only)
bun run db:generate      # Generate migration files
bun run db:migrate       # Run migrations (prod)
bun run db:studio        # Open Drizzle Studio UI
bun run db:sync          # Sync compendium from providers
bun run reindex-fts      # Rebuild full-text search index
```

## Architecture

**Grimar** - Self-hosted D&D 5e PWA (SvelteKit 2 + Svelte 5 Runes, Bun, SQLite/Drizzle, TanStack Query)

```
grimar/
├── src/
│   ├── lib/
│   │   ├── core/           # Client utilities, types, constants
│   │   │   ├── client/     # Theme store, query client, query-persist
│   │   │   ├── types/      # Global TypeScript interfaces
│   │   │   └── constants/  # Spell levels, schools, etc.
│   │   ├── server/         # Server-only code
│   │   │   ├── auth/       # Auth hook and user service
│   │   │   ├── db/         # Drizzle schema and connection
│   │   │   ├── providers/  # Data providers (Open5e, SRD, Homebrew, 5e-bits)
│   │   │   ├── repositories/# Database access layer
│   │   │   ├── services/   # Business logic (sync, auth, cache)
│   │   │   └── api/        # Internal API utilities
│   │   ├── components/     # UI Components
│   │   │   ├── ui/         # Atomic primitives (Button, Input, Card, Badge)
│   │   │   ├── layout/     # AppShell, GlobalHeader, Omnibar
│   │   │   └── features/   # Feature-specific components
│   │   └── features/       # Feature modules with colocated logic
│   ├── routes/             # SvelteKit routes (pages + API)
│   ├── hooks.server.ts     # Auth hook (header-based auth)
│   └── app.css             # Arcane Aero design system
├── tests/                  # Playwright E2E tests
├── drizzle/                # Database migrations
├── scripts/                # Sync and reindex scripts
└── data/compendium/        # Large JSON payloads
```

### Authentication (Header-Based)

The app uses **Trust-on-First-Use** via reverse proxy headers:
- `X-Authentik-Username` header from Traefik/Authentik
- Dev mode: Check `VITE_MUX_USER` env var for mock authentication
- Auto-creates user record on first visit

### Multi-Provider System

Content is aggregated from multiple sources:
- **Registry**: `providers.json` manages enabled providers
- **BaseProvider**: Abstract class ensuring consistent data fetching
- **Validation**: All provider data validated via Zod schemas before insert
- **Sync**: Concurrent sync with exponential backoff retry logic
- **Source tracking**: Every item tagged with source (`open5e`, `srd`, `homebrew`)

### Testing Strategy

- **Unit tests**: Co-located `*.test.ts` files alongside source code
- **E2E tests**: Playwright tests in `tests/` directory
- **Test environment**: Happy DOM for unit, Playwright for E2E
- **Mocking**: SvelteKit modules mocked in `src/test/mocks/`
- **Coverage**: Excludes types, constants, and test files
- **CI mode**: Use `CI=true bun run test:run` for automated testing

### Drizzle Configuration

- **Dialect**: SQLite with `bun:sqlite` driver
- **Schema location**: `src/lib/server/db/schema.ts`
- **FTS tables excluded**: Full-text search virtual tables filtered from Drizzle management
- **Migrations**: Generated in `drizzle/` directory

## More Info

See the **`docs/`** directory for detailed documentation:

| File | Purpose |
|------|---------|
| `STYLE_GUIDE.md` | "Arcane Aero" design system and visual guidelines |
| `COMPONENTS.md` | UI component inventory and patterns |
| `ROUTES.md` | Route structure and API endpoints |
| `architecture-doc.md` | Technical architecture and system design |
| `COMPENDIUM_PAGES.md` | Compendium specifications |

**Commit format**: `<type>(<scope>): <description>`

**Commit types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring without behavior change
- `perf`: Performance improvement
- `chore`: Maintenance tasks
- `misc`: Miscellaneous changes

## MCP Tools

**Context7 MCP** (for library docs):
```typescript
mcp__plugin_context7_context7__resolve-library-id({ libraryName: 'svelte', query: '...' })
mcp__plugin_context7_context7__query-docs({ libraryId: '/sveltejs/svelte', query: '...' })
```
