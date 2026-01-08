# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Rules

1. **ALWAYS `cd ./grimar`** before any bun command
2. **Prefer Serena MCP Server** for code operations (read files, search, replace) when available
3. **Prefer Context7 MCP** for library documentation before web search
2. **Context7 MCP First**: When looking up library documentation, use `mcp__plugin_context7_context7__query-docs` before web search
3. **Schema changes**: `bun run db:push` (dev) or `db:generate && db:migrate` (prod)
4. **After config changes**: run `bun run prepare`
5. **Before committing**: Run `bun run check` and `CI=true bun run test:run`
6. **Zod validation**: All provider data must be validated before database insert
7. **Cache invalidation**: Call `invalidateCache()` after data mutations
8. **VirtualList**: Use for 50+ items
9. **Database retries**: Use `getDbWithRetry()` wrapper for flaky connections
10. **Logging**: Use child loggers from `$lib/server/logger` - NEVER `console.error` directly
11. **Test location**: `*.test.ts` alongside source files (co-located)
12. **Auth**: Only `/` is public; all other routes redirect
13. **Adapter**: `svelte-adapter-bun` (not node)

## Project Overview

**Grimar** is a self-hosted D&D 5e PWA built as a monolith on SvelteKit 2 + Bun with an "Arcane Aero" design system (glass morphism, Frutiger Aero aesthetics).

### Key Technologies
- **Frontend**: Svelte 5 with Runes, SvelteKit 2
- **Backend**: SvelteKit server endpoints
- **Database**: SQLite with better-sqlite3, Drizzle ORM
- **State**: TanStack Query with localStorage persistence
- **Validation**: Zod schemas
- **Styling**: Tailwind v4 with custom design tokens

## Essential Commands

```bash
# Development
cd ./grimar && bun run dev              # Dev server (localhost:5173)
cd ./grimar && bun run check            # TypeScript check
cd ./grimar && bun run check:watch      # Watch mode

# Build & Production
cd ./grimar && bun run build            # Build for production
cd ./grimar && bun run start            # Production server

# Database
cd ./grimar && bun run db:push          # Push schema (dev)
cd ./grimar && bun run db:generate      # Generate migrations
cd ./grimar && bun run db:migrate       # Run migrations
cd ./grimar && bun run db:studio        # Drizzle Studio UI
cd ./grimar && bun run db:sync          # Sync compendium from providers

# Testing
cd ./grimar && bun run test             # Vitest (watch)
cd ./grimar && bun run test:run         # CI mode
cd ./grimar && bun run test -- <pattern>  # Match tests
cd ./grimar && bun run test:e2e         # Playwright E2E
```

## Architecture

### Monolith Design
Single-container deployment with SQLite embedded for zero-latency local storage and simple backup/restore.

### Project Structure
```
grimar/
├── src/
│   ├── lib/
│   │   ├── core/           # Constants, types, client utilities
│   │   ├── server/
│   │   │   ├── db/         # Schema, connection
│   │   │   ├── services/   # Business logic
│   │   │   ├── providers/  # Data providers (Open5e, 5ebits, SRD, Homebrew)
│   │   │   └── utils/      # Server utilities, caching, monitoring
│   │   └── components/     # UI components (ui/, layout/, features/)
│   ├── routes/             # SvelteKit routes
│   └── hooks.server.ts     # Auth hook (extracts X-Authentik-Username)
├── tests/                  # Playwright E2E tests
├── drizzle/                # Migrations
├── data/compendium/        # JSON payloads (large data)
└── vite.config.ts          # PWA + Service Worker config
```

## Svelte 5 Runes Pattern

```typescript
interface Props {
    title: string;
    active?: boolean;
}
let { title, active = false }: Props = $props();

let count = $state(0);

$effect(() => {
    console.log('count changed:', count);
});

// Event handlers use standard onclick attributes
<button onclick={() => count++}>Click</button>
```

## Client Data Fetching

**TanStack Query** with localStorage persistence:
- Cache key prefix: `grimar-query-cache`
- Retention: 7 days
- Offline-first with background refetching

```typescript
import { createQueryClient } from '$lib/core/client/query-client';
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

### Multi-Provider Compendium System
Providers in `/src/lib/server/providers/`:
- `Open5eProvider` - Primary SRD source
- `5ebits.ts`, `SRDProvider`, `HomebrewProvider`
- `providerRegistry` - Central registry

**Sync flow:** Providers → DataLoader → Deduplication → Database

## Database

### Core Tables
| Table | Purpose |
|-------|---------|
| `users` | Username + settings JSON |
| `compendium_items` | Spells, monsters, items (SRD + homebrew) |
| `characters` | User characters with stats/inventory/spells JSON |

### Standard Access Pattern
```typescript
import { getDb } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { compendiumItems } from '$lib/server/db/schema';

const db = await getDb();
const spells = await db.select().from(compendiumItems).where(eq(compendiumItems.type, 'spell'));

// With retry wrapper
import { dbRetry } from '$lib/server/db/db-retry';
const result = await dbRetry(() => db.select().from(compendiumItems));
```

### Large JSON Data
Store large payloads as files in `data/compendium/` with `jsonPath` column referencing them.

## Logging

Use **Winston** with `winston-daily-rotate-file`. Always create child loggers:

```typescript
import logger from '$lib/server/logger';

const log = logger.child({ module: 'CompendiumSync' });
log.info('Starting sync');
log.error({ error }, 'Sync failed');  // Structured logging
```

**NEVER use `console.error`** - it provides no structured context.

## Caching Strategy

### Three-Layer Caching
1. **Service Worker** (vite.config.ts) - StaleWhileRevalidate for APIs, CacheFirst for images
2. **TanStack Query** - localStorage persistence, 7-day retention
3. **Server Repository** - In-memory cache, TTL-based, invalidated on sync

### Cache Invalidation
```typescript
import { invalidateCache } from '$lib/core/client/cache-sync';
await invalidateCache();
```

## Testing

### Test Structure
- **Unit tests**: `*.test.ts` alongside source files
- **E2E tests**: `tests/` directory with Playwright

### Vitest Mocks (via vitest.config.ts aliases)
```typescript
'$app/navigation' → src/test/mocks/app-navigation.ts
'$app/state' → src/test/mocks/app-state.ts
'$env/dynamic/private' → src/test/mocks/env-dynamic-private.ts
```

## Development Workflow

**Track progress in `conductor/tracks/*/plan.md`**:
1. Mark `[~]` before starting
2. Write failing tests first (TDD)
3. Target >80% coverage
4. Commit with format: `<type>(<scope>): <description>`

## MCP Tools

### Tool Priority

1. **Serena MCP** (when activated on grimar project):
   - Use for all code operations: reading, searching, replacing
   - Preferred over standard file tools
   - Provides symbol-aware operations

2. **Context7 MCP** (for library docs):
   - Use `mcp__plugin_context7_context7__resolve-library-id()` to get library IDs
   - Use `mcp__plugin_context7_context7__query-docs()` to query documentation
   - Use this BEFORE web search for library-related questions

3. **Standard Tools** (fallback when Serena unavailable):
   - Use `view()` for reading files
   - Use `grep()` for searching code
   - Use `edit()` for modifying files

### Context7 (Library Documentation)
```typescript
// Get library ID first
mcp__plugin_context7_context7__resolve-library-id({ libraryName: 'svelte', query: '...' })
// Then query
mcp__plugin_context7_context7__query-docs({ libraryId: '/sveltejs/svelte', query: '...' })
```

### Serena MCP (Code Operations)
```typescript
// Read files
mcp_serena_read_file({ relative_path: 'src/app.css' })

// List directory
mcp_serena_list_dir({ relative_path: '.', recursive: false })

// Find files by pattern
mcp_serena_find_file({ file_mask: '*.ts', relative_path: 'src' })

// Search for patterns
mcp_serena_search_for_pattern({ substring_pattern: 'logger', relative_path: 'src' })

// Find symbols (functions, classes)
mcp_serena_find_symbol({ name_path: 'AuthService', relative_path: 'src/lib/server/services/auth' })

// Replace content (preferred for code edits)
mcp_serena_replace_content({
    relative_path: 'src/app.css',
    needle: 'old text',
    repl: 'new text',
    mode: 'literal'
})

// Replace symbol body (for functions/classes)
mcp_serena_replace_symbol_body({
    name_path: 'AuthService.login',
    relative_path: 'src/lib/server/services/auth',
    body: 'new function body'
})

// Insert before/after symbols
mcp_serena_insert_before_symbol({
    name_path: 'AuthService',
    relative_path: 'src/lib/server/services/auth',
    body: 'new code to add'
})
```

## Design System: "Arcane Aero"

### Material Levels
| Level | Class | Use Case |
|-------|-------|----------|
| Canvas | `bg-gray-950/40` | Sidebars, large containers |
| Card | `bg-gray-800/60` | Content panels, spell cards |
| Overlay | `bg-gray-700/80` | Modals, dropdowns |

### Spell School Colors
| School | Color | Gem |
|--------|-------|-----|
| Evocation | Rose/Red | Ruby |
| Abjuration | Sky/Blue | Sapphire |
| Necromancy | Emerald/Green | Emerald |
| Illusion | Purple | Amethyst |
| Divination | Amber/Yellow | Topaz |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLite path (default: `file:./local.db`) |
| `VITE_MOCK_USER` | Dev auth bypass (username) |
| `ADMIN_SYNC_TOKEN` | Admin sync bearer token |

## Gotchas

- **Adapter:** Uses `svelte-adapter-bun`, not Node adapter
- **Auth:** Only `/` route is public; all others redirect
- **Database retry:** Use `getDbWithRetry()` function (not `dbRetry()`)
- **VirtualList/VirtualGrid:** Required for 50+ items, or performance degrades
- **Svelte 5 event handlers:** Use `onclick={...}` NOT `on:click={...}`
- **Virtual components:** Use `{#snippet children(...)}` syntax, not `renderItem` prop
- **Working directory:** ALL bun commands must run from `grimar/` subdirectory
