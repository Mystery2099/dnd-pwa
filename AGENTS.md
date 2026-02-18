# AGENTS.md

This file provides guidance to AI coding agents working in this D&D 5e PWA repository.

## Project Overview

- **Framework**: SvelteKit 2 + Svelte 5 Runes
- **Runtime**: Bun
- **Database**: SQLite via Drizzle ORM
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Styling**: Tailwind CSS v4

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

## Essential Commands

All commands run from project root (they proxy to `grimar/` workspace):

```bash
# Development
bun run dev              # Dev server (localhost:5173)
bun run check            # TypeScript check (svelte-check)
bun run build            # Build for production
bun run start            # Production server

# Linting & Formatting
bun run format           # Format with Prettier (write)
bun run lint             # Check format + lint

# Testing
bun run test             # Watch mode
bun run test:run        # CI mode (run before commit)
bun run test -- <file>  # Run single test file
bun run test:ui         # Vitest UI mode
bun run test:e2e        # Playwright E2E tests
bun run test:all        # All tests (unit + E2E)

# Database
bun run db:push         # Push schema (dev)
bun run db:generate     # Generate migration
bun run db:migrate      # Run migrations (prod)
bun run db:studio       # Drizzle Studio UI
bun run db:sync         # Sync compendium
bun run reindex-fts     # Rebuild FTS index
```

## Code Style

### Formatting
- **Tabs** (not spaces) with **single quotes** and **no trailing commas**
- **Semicolons**: Always use semicolons
- **Strict equality**: Use `===` and `!==`

### Svelte 5
- Use `$state()`, `$derived()`, `$effect()` runes
- Use `onclick={...}` NOT `on:click={...}`
- Props interface pattern:
  ```typescript
  interface Props {
    title: string;
    active?: boolean;
    onclick?: () => void;
  }
  let { title, active = false, onclick }: Props = $props();
  ```

### Exports & Imports
- **Named exports only** (no default exports except Svelte components)
- Use barrel files (index.ts) for re-exports
- Use `$lib` alias for library code: `import { getDb } from '$lib/server/db'`
- Use relative imports for same-directory files: `./types`
- Use named imports for utilities, default for Svelte components

### Naming Conventions
- **Files**: kebab-case (`my-file.ts`), PascalCase for Svelte components (`MyComponent.svelte`)
- **Types/Interfaces**: PascalCase (`CompendiumItem`, `AuthUser`)
- **Zod schemas**: `*Schema` suffix, export inferred types without suffix
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_MAX_RETRIES`)
- **Database**: snake_case tables (`compendium_items`), camelCase columns (`spell_level`)
- **Unused variables**: Prefix with `_` (`let { _, ...rest }`)

### Directory-Specific Patterns
| Directory | Pattern | Example |
|-----------|---------|---------|
| `db/` | `db-*` prefix | `db-connection.ts` |
| `auth/` | `auth-*` prefix | `auth-handler.ts` |
| `sync/` | `sync-*` prefix | `sync-cleanup.ts` |
| Svelte components | PascalCase | `Button.svelte` |
| Test files | `*.test.ts` | `service.test.ts` |

### Error Handling
All error logging must include `[context]` prefix:
```typescript
// ✅ Correct
logger.error('[auth] Failed to resolve user:', error);

// ❌ Incorrect  
console.error('Failed to resolve user:', error);
```

### Constants & Enums
Use object-based const patterns:
```typescript
export const COMPENDIUM_TYPES = {
  SPELL: 'spell',
  MONSTER: 'monster',
} as const;
export type CompendiumType = (typeof COMPENDIUM_TYPES)[keyof typeof COMPENDIUM_TYPES];
```

## Architecture

```
grimar/
├── src/
│   ├── lib/
│   │   ├── core/         # Client: types, constants, query client
│   │   ├── server/       # Server-only: db, auth, providers, services
│   │   ├── components/   # UI: ui/, layout/, features/
│   │   └── features/     # Feature modules
│   ├── routes/           # SvelteKit pages + API
│   ├── hooks.server.ts   # Auth hook
│   └── app.css           # Design system
├── tests/                # Playwright E2E tests
└── drizzle/              # Migrations
```

### Authentication
- Header-based (Trust-on-First-Use): `X-Authentik-Username` header
- Dev mode: `VITE_MUX_USER` env var for mock auth

### Multi-Provider System
- Registry: `providers.json` enables data sources
- All provider data validated via Zod before insert
- Source tracking: items tagged with source (`open5e`, `srd`, `homebrew`)

## Testing

**Unit tests**: `*.test.ts` alongside source files in `grimar/src/`
**E2E tests**: `tests/` directory with Playwright fixtures

### Test Patterns
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ModuleName', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  
  it('should do expected behavior', () => {
    expect(true).toBe(true);
  });
});
```

### Mocking
```typescript
// Database
vi.mock('$lib/server/db', () => ({
  getDb: vi.fn().mockResolvedValue(mockDb)
}));

// SvelteKit
vi.mock('$app/stores', () => ({
  page: { get: vi.fn().mockReturnValue({ data: {} }) }
}));

// Environment
vi.mock('$app/environment', () => ({
  browser: true,
  building: false,
  dev: true
}));
```

### Coverage Expectations
| Module Type | Minimum |
|-------------|---------|
| Services | 70% |
| Providers | 85% |
| Utilities | 70% |
| Transformers | 80% |

## Commit Format

`<type>(<scope>): <description>`

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `chore`: Maintenance tasks
