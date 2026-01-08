# AGENTS.md - Development Guidelines for Agentic Coding

This file contains essential guidelines for agentic coding agents working in the Grimar repository.

## Tool Usage Preferences

**When working in this codebase, prioritize these tools:**

1. **Serena MCP Server** (when activated on grimar project):
   - Use `mcp_serena_read_file()` for reading files
   - Use `mcp_serena_find_symbol()` for finding code definitions
   - Use `mcp_serena_search_for_pattern()` for searching code
   - Use `mcp_serena_replace_content()` for code replacements
   - Use `mcp_serena_replace_symbol_body()` for modifying functions/classes
   - Use `mcp_serena_insert_before_symbol()` / `mcp_serena_insert_after_symbol()` for adding code

2. **Context7 MCP** (for library documentation):
   - Use `mcp__plugin_context7_context7__resolve-library-id()` to get library IDs
   - Use `mcp__plugin_context7_context7__query-docs()` to query documentation
   - Use this before web search for library-related questions

3. **Standard Tools** (fallback when Serena unavailable):
   - Use `view()` for reading files
   - Use `grep()` for searching code
   - Use `edit()` for modifying files

**Note:** Serena MCP requires project activation. If not activated, fall back to standard tools.

## Essential Commands

**Working Directory:** All commands must run from the `grimar/` subdirectory:
```bash
cd ./grimar && bun run <command>
```

### Development
```bash
bun run dev              # Start dev server (http://localhost:5173)
bun run build            # Build for production
bun run check            # Type checking with SvelteCheck
bun run check:watch      # Type checking in watch mode
bun run prepare          # SvelteKit sync (after config changes)
bun run start            # Production server
```

### Testing
```bash
bun run test             # Vitest (watch mode)
bun run test:run         # Vitest once (CI mode)
bun run test:ui          # Vitest with UI
bun run test src/lib/components/ui/Button.test.ts  # Run specific test file
bun run test -- Button   # Run tests matching pattern
bun run test:e2e         # Playwright E2E tests
bun run test:e2e:ui      # Playwright with UI
bun run test:e2e:debug   # Playwright debug mode
bun run test:all         # All tests (unit + E2E)
```

### Code Quality
```bash
bun run format           # Format with Prettier
bun run lint             # Prettier + ESLint check
```

### Database
```bash
bun run db:push          # Push schema (dev only)
bun run db:generate      # Generate migration files
bun run db:migrate       # Run database migrations
bun run db:studio        # Open Drizzle Studio
bun run db:sync          # Sync compendium from providers
```

## Code Style Guidelines

### Formatting Rules (Prettier)
- **Tabs, not spaces:** Use tab indentation
- **Single quotes:** Always use `'single quotes'`, not `"double"`
- **No trailing commas:** Omit trailing commas
- **Line width:** 100 characters max

### General Principles
- **Named exports only:** Use `export { MyClass }`, no default exports (except Svelte components)
- **Use `const` or `let`:** Never `var`
- **No `_` prefix/suffix:** For identifiers (including private properties)
- **Strict equality:** Use `===` and `!==`
- **Avoid `any`:** Prefer `unknown` or specific types (ESLint allows as warning for complex API responses)
- **Semicolons:** Always use semicolons

### Import Organization
```typescript
// 1. External libraries (alphabetical)
import { z } from 'zod';
import { describe, it, expect } from 'vitest';

// 2. SvelteKit imports
import { enhance } from '$app/forms';
import type { PageData } from './$types';

// 3. Internal imports (grouped by path)
import { getDb } from '$lib/server/db';
import { Button } from '$lib/components/ui/Button.svelte';
```

### Svelte 5 Component Patterns
```typescript
interface Props {
    title: string;
    active?: boolean;
    onclick?: () => void;
}

let { title, active = false, onclick }: Props = $props();
let count = $state(0);
let doubled = $derived(count * 2);

$effect(() => {
    console.log('count changed:', count);
});
```

**Event handlers:** Use standard HTML attributes (`onclick`, `onkeydown`, etc.) NOT Svelte's `on:click` syntax.

**Snippets:** Svelte 5 uses snippets for render props:
```svelte
<script lang="ts">
    import type { Snippet } from 'svelte';
    interface Props {
        items: Array<Item>;
        renderItem: Snippet<[Item]>;
    }
    let { items, renderItem }: Props = $props();
</script>

{#each items as item}
    {@render renderItem(item)}
{/each}
```

**Component Snippets (VirtualList/VirtualGrid pattern):**
```svelte
<VirtualList {items}>
    {#snippet children(item: ItemType, index: number)}
        <div>{item.name}</div>
    {/snippet}
</VirtualList>
```
Note: Virtual components use the `children` prop with `{#snippet children(...)}` syntax.

### Error Handling & Logging
```typescript
import { createModuleLogger } from '$lib/server/logger';
const log = createModuleLogger('ModuleName');
log.info({ itemId, operation }, 'Processing item');
log.error({ error, context }, 'Operation failed');
// NEVER use console.error directly
```

**Logger patterns:** The wrapper supports both argument orders:
- `log.info('message', {meta})` - Winston native order
- `log.info({meta}, 'message')` - Project convention

### Naming Conventions
- **Classes/Interfaces/Types:** `UpperCamelCase`
- **Variables/Functions/Properties:** `lowerCamelCase`
- **Constants:** `CONSTANT_CASE`
- **Files:** kebab-case for TS files, PascalCase for Svelte components
- **Test files:** `*.test.ts` alongside source files (co-located)

### Data Validation
Use Zod for all external data validation before database insert. Schemas in `src/lib/server/providers/schemas/`.

## Testing Guidelines

### Test Configuration
- **Environment:** happy-dom (configured in vitest.config.ts)
- **Globals:** Enabled (no need to import `describe`, `it`, `expect`)
- **Coverage:** Exclude types, constants, and test files from coverage
- **Setup:** Use `src/test/setup.ts` for common mocks (SvelteKit, browser APIs)
- **Coverage targets:** Services 70%, Providers 85%, Utilities 70%, Transformers 80%

### Test Patterns
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('FeatureName', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should do something', () => {
        expect(result).toBe(expected);
    });
});
```

### Mocking Patterns
```typescript
// Mock SvelteKit modules
vi.mock('$app/navigation', () => ({
    goto: vi.fn()
}));

// Mock database
const mockDb = {
    select: vi.fn(),
    insert: vi.fn()
};
vi.mock('$lib/server/db', () => ({
    getDb: vi.fn().mockResolvedValue(mockDb)
}));
```

### E2E Testing
E2E tests use Playwright with custom fixtures in `tests/fixtures.ts`:
- Use `authenticatedPage` for authenticated pages
- Set `VITE_MOCK_USER` env var for dev authentication bypass
- Prefer `data-testid` over CSS selectors

## Critical Rules

1. **ALWAYS `cd ./grimar`** before any bun commands
2. Run `bun run check` before committing
3. Run `CI=true bun run test:run` before committing
4. Use `getDbWithRetry()` wrapper for database operations with exponential backoff (100ms, 200ms, 400ms)
5. Use `VirtualList` (list view) or `VirtualGrid` (grid view) for 50+ items to prevent performance issues
6. Write failing tests first (TDD), target >80% coverage
7. Use structured logging via `createModuleLogger()`, NEVER `console.error` directly
8. Import SvelteKit modules using path aliases (`$app/*`, `$lib/*`)
9. After schema changes: `bun run db:push` (dev) or `db:generate && db:migrate` (prod)
10. After config changes: run `bun run prepare`
11. Call `invalidateCache()` after data mutations (client-side)
12. All provider data must be validated with Zod before database insert
13. Use `onclick={...}` for events, NOT `on:click={...}` (Svelte 5 syntax)
14. Test files must be co-located alongside source files as `*.test.ts`

## Project Structure

```
grimar/
├── src/
│   ├── lib/
│   │   ├── core/           # Constants, types, client utilities
│   │   │   ├── constants/   # Compendium type constants, colors
│   │   │   ├── types/      # TypeScript definitions
│   │   │   ├── client/     # TanStack Query, cache sync, stores
│   │   │   └── utils/      # Keyboard nav, source badges
│   │   ├── server/
│   │   │   ├── db/         # Schema, connection, FTS, retry wrapper
│   │   │   ├── auth/       # Session management
│   │   │   ├── services/    # Business logic (auth, characters, sync)
│   │   │   ├── providers/   # Data providers (Open5e, 5ebits, SRD, Homebrew)
│   │   │   ├── repositories/# Data access layer
│   │   │   └── utils/      # Monitoring, caching, data loading
│   │   ├── components/
│   │   │   ├── ui/         # Reusable UI components (Button, Input, VirtualList, VirtualGrid)
│   │   │   ├── layout/     # Layout components (AppShell, Omnibar, Nav)
│   │   │   └── features/   # Feature-specific components
│   ├── routes/             # SvelteKit routes
│   └── hooks.server.ts     # Auth hook + request logging
├── tests/                  # Playwright E2E tests
├── drizzle/                # Migrations
├── data/compendium/        # JSON payloads (large data files)
└── vite.config.ts          # PWA + Service Worker config
```

### Key Directories
- **`src/lib/core/`**: Shared code used on both client and server
- **`src/lib/server/`**: Server-only code (database, auth, providers)
- **`src/lib/components/`**: Reusable UI components
- **`src/lib/features/`**: Feature-specific components and stores
- **`tests/`**: E2E tests with Playwright
- **`data/compendium/`**: Large JSON payloads referenced by database `jsonPath` column
- **`src/test/`**: Mocks and setup for Vitest (SvelteKit, browser APIs)
- **Unit tests:** Co-located alongside source files as `*.test.ts`

## Tech Stack

- **Framework:** SvelteKit 2 + Svelte 5 (runes-based reactivity)
- **Runtime:** Bun (not Node.js)
- **Adapter:** `svelte-adapter-bun`
- **Database:** SQLite with better-sqlite3, Drizzle ORM
- **State Management:**
  - TanStack Query for server state with localStorage persistence
  - Svelte stores for client state
- **Validation:** Zod schemas
- **Styling:** Tailwind v4 with custom design tokens (Arcane Aero theme system)
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Logging:** Winston with daily-rotate-file
- **PWA:** @vite-pwa/sveltekit with service worker caching

## Tool Usage Priority

1. **SvelteKit:** Routing, forms, actions, load functions
2. **Drizzle ORM:** Database operations, migrations, FTS search
3. **TanStack Query:** Server state management, caching, persistence
4. **Tailwind v4:** Styling, responsive utilities, theming system
5. **Zod:** Schema validation, type safety
6. **Winston:** Structured logging with child loggers
7. **@tanstack/svelte-virtual:** Virtual scrolling for large lists (VirtualList, VirtualGrid)

## Client Data Fetching

**TanStack Query** with localStorage persistence:
- Cache key prefix: `grimar-query-cache`
- Retention: 7 days
- Offline-first with background refetching
- SSE (Server-Sent Events) for cache invalidation

```typescript
import { createQueryClient } from '$lib/core/client/query-client';
```

### Query Configuration
- **Stale time:** 5 minutes (network-first strategy)
- **Cache time:** 7 days (gcTime)
- **Retry:** 3 attempts with exponential backoff
- **Refetch on window focus:** Only when online
- **Refetch on reconnect:** Disabled (SSE handles it)

### Query Keys Pattern
Centralized in `queries.ts`:
```typescript
export const queryKeys = {
    compendium: {
        all: ['compendium'] as const,
        list: (type: string) => ['compendium', 'list', type] as const,
        detail: (type: string, slug: string) => ['compendium', 'detail', type, slug] as const
    }
} as const;
```

## VirtualList and VirtualGrid for Large Lists

**Use for any list with 50+ items** (compendium lists, character inventories):

### VirtualList (List View)

```svelte
<script lang="ts">
    import { VirtualList } from '$lib/components/ui/VirtualList.svelte';

    interface Props {
        items: Array<Item>;
    }
    let { items }: Props = $props();
</script>

<VirtualList {items} estimateSize={72} overscan={10}>
    {#snippet children(item: Item, index: number)}
        <div class="p-2">{item.name}</div>
    {/snippet}
</VirtualList>
```

**Parameters:**
- `items`: Array of items to render
- `children`: Snippet for rendering each item (signature: `(item, index)`)
- `estimateSize`: Estimated height in pixels (default: 72)
- `overscan`: Number of extra items to render (default: 10)
- `class`: Optional CSS classes for container

### VirtualGrid (Grid View)

```svelte
<script lang="ts">
    import { VirtualGrid } from '$lib/components/ui/VirtualGrid.svelte';

    interface Props {
        items: Array<Item>;
    }
    let { items }: Props = $props();
</script>

<VirtualGrid {items} minCardWidth={220} gap={16}>
    {#snippet children(item: Item, index: number)}
        <div class="card">{item.name}</div>
    {/snippet}
</VirtualGrid>
```

**Parameters:**
- `items`: Array of items to render
- `children`: Snippet for rendering each item (signature: `(item, index)`)
- `estimateRowHeight`: Estimated row height in pixels (default: 155)
- `overscan`: Number of extra rows to render (default: 5)
- `minCardWidth`: Minimum card width for desktop (default: 220)
- `mobileMinCardWidth`: Minimum card width for mobile < 640px (default: 150)
- `tabletMinCardWidth`: Minimum card width for tablet 640-1024px (default: 190)
- `gap`: Gap between cards in pixels (default: 16)
- `class`: Optional CSS classes for container

**Key Differences:**
- `VirtualList`: Renders single column, uses `estimateSize` for item height
- `VirtualGrid`: Renders responsive grid, uses `estimateRowHeight` for row height
- Both use `{#snippet children(...)}` syntax for item rendering

## Backend Patterns

### Authentication (Reverse Proxy)
Auth handled upstream (Authentik via Traefik). App never sees passwords.

```typescript
// hooks.server.ts extracts: X-Authentik-Username → locals.user.username
// Dev bypass: Set VITE_MOCK_USER env var

import { requireUser } from '$lib/server/services/auth';
export const load = async ({ locals }) => {
    const user = requireUser(locals); // Throws if unauthenticated
};
```

**Route protection:** Only `/` is public; all other routes require authentication.

### Database Access

```typescript
import { getDb } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { compendiumItems } from '$lib/server/db/schema';

const db = await getDb();
const spells = await db.select().from(compendiumItems).where(eq(compendiumItems.type, 'spell'));

// With retry wrapper (for flaky connections)
import { getDbWithRetry } from '$lib/server/db/db-retry';
const db = await getDbWithRetry(); // Exponential backoff: 100ms, 200ms, 400ms
```

### Large JSON Data Handling
Store large payloads as files in `data/compendium/` with `jsonPath` column in database referencing them. This prevents bloating the database with massive JSON strings.

### Multi-Provider Compendium System

Providers in `/src/lib/server/providers/`:
- `Open5eProvider` - API-based provider (api.open5e.com)
- `5ebitsProvider` - API-based provider (dnd5eapi.co)
- `SRDProvider` - SRD data provider
- `HomebrewProvider` - File-based user content
- `providerRegistry` - Central registry (singleton pattern)

**Sync flow:** Providers → DataLoader → Deduplication → Database

Configuration loaded from `providers.json` in project root:
```json
{
    "primaryProvider": "5e-bits",
    "providers": [
        {
            "id": "5e-bits",
            "name": "5e-bits",
            "enabled": true,
            "type": "5e-bits",
            "baseUrl": "https://www.dnd5eapi.co/api/2014",
            "supportedTypes": ["spell", "monster", "feat", "background", "race", "class"]
        }
    ],
    "sync": {
        "maxConcurrency": 3,
        "retryAttempts": 3,
        "retryDelayMs": 1000
    }
}
```

### Data Validation (Zod)
All external data validated before database insert:

```typescript
// Schemas in src/lib/server/providers/schemas/
const SpellSchema = z.object({
    name: z.string().min(1),
    level: z.number().int().min(0).max(9),
    school: z.string()
});
const validated = SpellSchema.parse(rawData);
```

## Caching Strategy

### Three-Layer Caching
1. **Service Worker** (vite.config.ts) - StaleWhileRevalidate for APIs, CacheFirst for images
2. **TanStack Query** - localStorage persistence, 7-day retention
3. **Server Repository** - In-memory cache, TTL-based, invalidated on sync

### Service Worker Cache Rules
- **Open5e API:** StaleWhileRevalidate, 24h maxAge
- **Compendium export:** CacheFirst, 24h maxAge
- **SSE endpoint:** NetworkOnly (never cache)
- **Cache version:** NetworkFirst, 1 min maxAge
- **API routes:** NetworkFirst, 10 min maxAge
- **Images:** CacheFirst, 7 days maxAge
- **Static resources (JS/CSS):** StaleWhileRevalidate, 24h maxAge

### Cache Invalidation
```typescript
import { invalidateCache } from '$lib/core/client/cache-sync';
await invalidateCache();
```

SSE endpoint `/api/cache/events` pushes version updates to connected clients.

## Design System: "Arcane Aero"

### Material Levels (CSS Custom Properties)
| Level | Token | Use Case |
|-------|--------|----------|
| Canvas | `surface.canvas` | Sidebars, large containers |
| Card | `surface.card` | Content panels, spell cards |
| Overlay | `surface.overlay` | Modals, dropdowns |
| Background | `bg.app` | Radial gradient spotlight behind everything |

### Spell School Colors (Gem Theme)
| School | Gem Color | CSS Variable |
|--------|-----------|--------------|
| Evocation | Rose/Red (Ruby) | `--color-gem-ruby` |
| Abjuration | Sky/Blue (Sapphire) | `--color-gem-sapphire` |
| Necromancy | Emerald/Green | `--color-gem-emerald` |
| Illusion | Purple (Amethyst) | `--color-gem-amethyst` |
| Divination | Amber/Yellow (Topaz) | `--color-gem-topaz` |

### Theme System
- **Default:** Amethyst (mystical purple)
- **Implementation:** CSS custom properties in `src/routes/layout.css`
- **7 available themes:** amethyst, ruby, sapphire, emerald, topaz, obsidian, diamond
- **Theme switching:** Via `themeStore.svelte.ts`

### Design Philosophy
- **Tactile Depth:** Elements should look touchable (convex buttons, concave inputs)
- **Luminous:** Colored shadows, text halos
- **Vibrant:** Rich purples for backgrounds, gem tones for accents
- **Reflective:** Polished glass with "horizon lines" (Aero gloss)
- **Modern Constraints:** Glow as accent (not default), subtle bevels, faint noise

## Logging

Use **Winston** with `winston-daily-rotate-file`. Always create child loggers:

```typescript
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('ModuleName');
log.info({ itemId }, 'Processing item');
log.error({ error, context }, 'Operation failed');  // Structured logging
```

**Critical:** NEVER use `console.error` directly - it provides no structured context.

**Logger features:**
- Daily rotating log files (14-day retention, 20MB max size)
- JSON format in production, colored output in development
- Child loggers include module context automatically
- Automatic error serialization with stack traces
- Supports both `log.info('msg', {meta})` and `log.info({meta}, 'msg')` patterns

## Database

### Core Tables
| Table | Purpose |
|-------|---------|
| `users` | Username + settings JSON |
| `compendium_items` | Spells, monsters, items (SRD + homebrew) |
| `characters` | User characters with stats/inventory/spells JSON |

### Large JSON Data
Store large payloads as files in `data/compendium/` with `jsonPath` column referencing them.

### FTS Search
Full-text search enabled via `db-fts.ts` using SQLite FTS5 virtual tables.

### Connection Retry
Use `getDbWithRetry()` for database connections with exponential backoff:
- Attempt 1: 100ms delay
- Attempt 2: 200ms delay
- Attempt 3: 400ms delay

## File Naming Conventions

| Directory | Pattern | Examples |
|-----------|----------|-----------|
| `db/` | `db-*` prefix | `db-connection.ts`, `db-fts.ts`, `db-retry.ts` |
| `auth/` | `auth-*` prefix | `auth-handler.ts`, `auth-guard.ts` |
| `sync/` | `sync-*` prefix | `sync-cleanup.ts`, `sync-metrics.ts` |
| `cache/` | `cache-*` prefix | `cache-manager.ts`, `cache-cleanup.ts` |
| `services/` | Domain name | `characters/service.ts`, `dataTransformer.ts` |
| `components/ui/` | Descriptive name | `Button.svelte`, `Input.svelte` |
| `components/layout/` | PascalCase | `AppShell.svelte`, `GlobalHeader.svelte` |
| `features/*/components/` | PascalCase | `CompendiumDetail.svelte` |

See `docs/NAMING_CONVENTIONS.md` for complete conventions.

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `DATABASE_URL` | SQLite path | `file:./local.db` |
| `VITE_MOCK_USER` | Dev auth bypass (username) | (none) |
| `ADMIN_SYNC_TOKEN` | Admin sync bearer token | (none) |

Use `.env` file locally, never commit `.env`.

## Development Workflow

**Track progress in `conductor/tracks/*/plan.md`:**
1. Mark `[~]` before starting task
2. Write failing tests first (TDD)
3. Target >80% coverage
4. Commit with format: `<type>(<scope>): <description>`

## Commit Message Format

```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore
Example: feat(compendium): Add spell filtering by school
```

## Additional Resources

- **`CLAUDE.md`** - Additional guidance for Claude Code (includes MCP tool usage)
- **`docs/NAMING_CONVENTIONS.md`** - Detailed naming conventions
- **`docs/TESTING_CONVENTIONS.md`** - Testing standards and patterns
- **`docs/multi-provider-implementation.md`** - Multi-provider architecture docs
- **`../docs/arcane-design-sysem.md`** - Design system documentation (tokens, states, motion rules)
- **`../docs/STYLE_GUIDE.md`** - Visual recipes and implementation examples (shine, bevel, noise)

## Common Patterns

### Service Layer Pattern
```typescript
// services/auth/
// ├── auth-handler.ts    # Main handler
// ├── auth-guard.ts      # Route guard
// ├── auth-types.ts      # Type definitions
// └── index.ts          # Barrel file (re-exports)
```

### Barrel Files (index.ts)
```typescript
export { handleAuth } from './auth-handler';
export { requireUser } from './auth-guard';
export type { AuthUser } from './auth-types';
```

### Constants (Object-based Enums)
```typescript
export const COMPENDIUM_TYPES = {
    SPELL: 'spell',
    MONSTER: 'monster',
    ITEM: 'item'
} as const;

export type CompendiumType = (typeof COMPENDIUM_TYPES)[keyof typeof COMPENDIUM_TYPES];
```

### Error Context Prefix
```typescript
console.error('[auth] Failed to resolve user:', error);
console.error('[data-loader] Failed to parse compendium data:', error);
```

## Gotchas

- **Adapter:** Uses `svelte-adapter-bun`, not Node adapter
- **Auth:** Only `/` route is public; all others redirect
- **Database retry:** Use `getDbWithRetry()` function (not `dbRetry()`)
- **VirtualList/VirtualGrid:** Required for 50+ items, or performance degrades
- **Svelte 5 event handlers:** Use `onclick={...}` NOT `on:click={...}`
- **Zod schemas:** Required for ALL provider data before database insert
- **Cache invalidation:** Must call `invalidateCache()` after mutations
- **Working directory:** ALL bun commands must run from `grimar/` subdirectory
- **Logger wrapper:** Supports both argument orders (`log.info({meta}, 'msg')` or `log.info('msg', {meta})`)
- **Large JSON:** Store as files in `data/compendium/`, not in database
- **Snippets:** Use `{@render snippetName(args)}` syntax in Svelte 5
- **Virtual components (VirtualList/VirtualGrid):** Use `{#snippet children(...)}` syntax, not `renderItem` prop
