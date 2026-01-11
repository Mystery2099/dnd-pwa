# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Rules

1. **ALWAYS `cd ./grimar`** before any bun command
2. **Prefer Serena MCP Server** for code operations when activated on grimar project
3. **Prefer Context7 MCP** for library documentation before web search
4. **Schema changes**: `bun run db:push` (dev) or `db:generate && db:migrate` (prod)
5. **After config changes**: run `bun run prepare`
6. **Before committing**: Run `bun run check` and `CI=true bun run test:run`
7. **Zod validation**: All provider data must be validated before database insert
8. **Cache invalidation**: Call `invalidateCache()` after data mutations
9. **VirtualList**: Use for 50+ items
10. **Database retries**: Use `getDbWithRetry()` wrapper for flaky connections
11. **Logging**: Use child loggers from `$lib/server/logger` - NEVER `console.error` directly
12. **Test location**: `*.test.ts` alongside source files (co-located)
13. **Auth**: Only `/` is public; all other routes redirect
14. **Adapter**: `svelte-adapter-bun` (not node)

## Code Style

- **Tabs, not spaces** with **single quotes** and **no trailing commas**
- **Named exports only** (no default exports except Svelte components)
- **Strict equality**: Use `===` and `!==`
- **Semicolons**: Always use semicolons
- **Event handlers**: Use `onclick={...}` NOT `on:click={...}` (Svelte 5)

## Essential Commands

```bash
# Development
cd ./grimar && bun run dev              # Dev server (localhost:5173)
cd ./grimar && bun run check            # TypeScript check
cd ./grimar && bun run build            # Build for production
cd ./grimar && bun run start            # Production server

# Testing
cd ./grimar && bun run test:run         # CI mode (run before commit)
cd ./grimar && bun run test -- <pattern>  # Match tests
cd ./grimar && bun run test:e2e         # Playwright E2E

# Database
cd ./grimar && bun run db:push          # Push schema (dev)
cd ./grimar && bun run db:generate      # Generate migrations
cd ./grimar && bun run db:migrate       # Run migrations
cd ./grimar && bun run db:studio        # Drizzle Studio UI
cd ./grimar && bun run db:sync          # Sync compendium from providers
```

## Architecture

**Grimar** - Self-hosted D&D 5e PWA (SvelteKit 2 + Svelte 5 Runes, Bun, SQLite/Drizzle, TanStack Query)

```
grimar/
├── src/
│   ├── lib/
│   │   ├── core/           # Client utilities, types, constants
│   │   ├── server/         # db/, services/, providers/, auth/
│   │   └── components/     # ui/, layout/, features/
│   ├── routes/             # SvelteKit routes
│   └── hooks.server.ts     # Auth hook
├── tests/                  # Playwright E2E
├── drizzle/                # Migrations
└── data/compendium/        # Large JSON payloads
```

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

## MCP Tools

**Serena MCP** (when activated):
```typescript
mcp__serena__read_file({ relative_path: 'src/app.css' })
mcp__serena__find_symbol({ name_path: 'AuthService', relative_path: 'src/lib/server/services/auth' })
mcp__serena__replace_symbol_body({ name_path: 'AuthService.login', body: '...' })
mcp__serena__insert_after_symbol({ name_path: 'AuthService', body: '...' })
```

**Context7 MCP** (for library docs):
```typescript
mcp__plugin_context7_context7__resolve-library-id({ libraryName: 'svelte', query: '...' })
mcp__plugin_context7_context7__query-docs({ libraryId: '/sveltejs/svelte', query: '...' })
```
