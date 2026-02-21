# AGENTS.md - Grimar Development Guide

> Self-hosted D&D 5e Progressive Web App built with SvelteKit 2, Svelte 5 Runes, Bun, and SQLite.

## Project Overview

- **Type**: SvelteKit 2 + Svelte 5 Runes SPA/PWA
- **Runtime**: Bun
- **Database**: SQLite via Drizzle ORM
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Styling**: Tailwind CSS v4

## Essential Commands

```bash
# Development
bun run dev              # Dev server on localhost:5173

# Building
bun run build            # Production build
bun run start            # Run production build

# Testing
bun run test             # Unit tests (watch mode)
bun run test:run         # Unit tests (once, CI mode)
bun run test:ui          # Unit tests with UI
bun run test:e2e         # Playwright E2E tests
bun run test:e2e:ui      # Playwright E2E with UI
bun run test:all         # Unit + E2E tests

# Type checking & Linting
bun run check            # svelte-check (types + svelte)
bun run check:watch      # svelte-check with watch mode
bun run lint             # Prettier + ESLint check
bun run format           # Prettier format

# Database
bun run db:push          # Push schema to SQLite
bun run db:generate      # Generate Drizzle migrations
bun run db:migrate       # Run migrations
bun run db:studio        # Open Drizzle Studio
bun run db:sync          # Sync compendium data from providers
bun run reindex-fts      # Rebuild full-text search index
```

## Project Structure

```
src/
├── lib/
│   ├── core/
│   │   ├── constants/compendium/   # Compendium type configs (spells, monsters, etc.)
│   │   ├── types/compendium/       # Compendium type definitions
│   │   └── client/                 # Client-side: theme, cache, queries, offline-store
│   ├── server/
│   │   ├── db/                     # Drizzle schema, connections, FTS
│   │   ├── providers/              # Open5e, Homebrew providers + registry
│   │   ├── repositories/           # Data access: compendium, characters, users
│   │   ├── services/
│   │   │   ├── auth/               # Authentication handler + guard
│   │   │   ├── compendium/         # Compendium data service + transformers
│   │   │   ├── characters/         # Character CRUD service
│   │   │   └── sync/               # Sync orchestrator + scheduler
│   │   └── utils/                  # Data loader, cache, monitoring
│   └── components/
│       ├── ui/                     # Reusable UI components (Button, Input, etc.)
│       └── layout/                 # Layout components (AppShell, Header, Nav)
├── routes/                         # SvelteKit routes
│   ├── api/                        # API endpoints
│   ├── auth/                       # Auth callbacks
│   ├── compendium/                 # Compendium browsing
│   ├── characters/                # Character management
│   └── dashboard/                  # Dashboard page
└── test/
    ├── mocks/                      # Mock implementations for Vitest
    └── setup.ts                    # Test setup
```

## Code Patterns

### Svelte 5 Props (Runes)

```typescript
interface Props {
	title: string;
	active?: boolean;
	onclick?: () => void;
}
let { title, active = false, onclick }: Props = $props();
```

### Error Logging

All `console.error` calls MUST include a `[context]` prefix:

```typescript
// ✅ Correct
console.error('[auth] Failed to resolve user:', error);

// ❌ Incorrect
console.error('Failed to resolve user:', error);
```

### Import Conventions

- Use `$lib` alias for library code: `import { getDb } from '$lib/server/db';`
- Use named imports for utilities: `import { handleAuth } from './auth';`
- Use default imports for Svelte components: `import Button from './Button.svelte';`

### File Naming

| Directory         | Pattern          | Example                            |
| ----------------- | ---------------- | ---------------------------------- |
| `db/`             | `db-*` prefix    | `db-connection.ts`                 |
| `auth/`           | `auth-*` prefix  | `auth-handler.ts`                  |
| `sync/`           | `sync-*` prefix  | `sync-cleanup.ts`                  |
| `cache/`          | `cache-*` prefix | `cache-manager.ts`                 |
| Svelte components | PascalCase       | `Button.svelte`, `AppShell.svelte` |
| Test files        | `*.test.ts`      | `service.test.ts`                  |

### Database Schema

- Table names: `snake_case` (e.g., `compendium_items`)
- Column names: `camelCase` (e.g., `spellLevel`, `challengeRating`)

### Zod Schemas

- Use `Schema` suffix: `export const Open5eSpellSchema = z.object({...})`
- Export inferred types without suffix: `export type Open5eSpell = z.infer<typeof Open5eSpellSchema>`

### Constants

Use const objects for type-safe enums:

```typescript
export const COMPENDIUM_TYPES = {
	SPELL: 'spell',
	MONSTER: 'monster',
	ITEM: 'item'
} as const;

export type CompendiumType = (typeof COMPENDIUM_TYPES)[keyof typeof COMPENDIUM_TYPES];
```

## Testing

### Unit Tests (Vitest)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ModuleName', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should do expected behavior', () => {
		// Test implementation
	});
});
```

### Mocking SvelteKit

```typescript
vi.mock('$app/environment', () => ({
	browser: true,
	building: false,
	dev: true
}));

vi.mock('$app/stores', () => ({
	page: {
		get: vi.fn().mockReturnValue({
			data: { user: { username: 'test' } }
		})
	}
}));
```

### Mocking Database

```typescript
vi.mock('$lib/server/db', () => ({
	getDb: vi.fn().mockResolvedValue(mockDb)
}));
```

### E2E Tests (Playwright)

Use custom fixtures from `tests/fixtures.ts`:

```typescript
import { test, expect } from './fixtures';

test('authenticated user can access characters', async ({ authenticatedPage }) => {
	await authenticatedPage.goto('/characters');
	await expect(authenticatedPage.locator('h1')).toHaveText('Characters');
});
```

E2E tests use `VITE_MOCK_USER` for authentication bypass in `playwright.config.ts`.

## Multi-Provider System

The app supports multiple data providers (Open5e, Homebrew) via a provider interface:

- **Provider Interface**: `src/lib/server/providers/types.ts`
- **Implementations**: `src/lib/server/providers/open5e.ts`, `homebrew.ts`
- **Registry**: `src/lib/server/providers/registry.ts` (loads from `providers.json`)
- **Sync**: `src/lib/server/services/sync/orchestrator.ts`

## Adding New Compendium Types

1. Define config in `src/lib/core/constants/compendium/` (e.g., `vehicles.ts`)
2. Register in `src/lib/core/constants/compendium/index.ts`
3. Optionally create detail component in `src/lib/features/compendium/components/entry-content/`
4. Add CategoryCard in `src/routes/compendium/+page.svelte`

See `src/lib/core/constants/compendium/README.md` for detailed instructions.

## Environment Variables

- Copy `.env.example` to `.env` for local development
- Uses `--env-file` flag in dev: `bun --env-file .env --bun vite dev`

## Coverage Expectations

| Module Type  | Minimum |
| ------------ | ------- |
| Services     | 70%     |
| Providers    | 85%     |
| Utilities    | 70%     |
| Transformers | 80%     |

## CI Command

```bash
CI=true bun run test:run && bun run test:e2e
```

## Key Dependencies

- **TanStack Query**: Client-side data fetching/caching
- **TanStack Virtual**: Virtual scrolling for large lists
- **Tailwind CSS v4**: Styling
- **bits-ui**: UI component primitives
- **Drizzle ORM**: Database ORM
- **Winston**: Logging

## Existing Documentation

- `docs/NAMING_CONVENTIONS.md` - File and code naming rules
- `docs/TESTING_CONVENTIONS.md` - Testing patterns and coverage
- `docs/multi-provider-implementation.md` - Provider architecture
- `src/lib/core/constants/compendium/README.md` - Compendium config guide
