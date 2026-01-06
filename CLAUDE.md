# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Rules

1. **ALWAYS `cd ./grimar`** before any bun command
2. **Context7 MCP First**: When looking up library documentation, use `mcp__plugin_context7_context7__query-docs` before web search
3. **Schema changes**: `bun run db:push` (dev) or `db:generate && db:migrate` (prod)
4. **After config changes**: run `bun run prepare`
5. **Before committing**: Run `bun run check` and `CI=true bun run test:run`
6. **Zod validation**: All provider data must be validated before database insert
7. **Cache invalidation**: Call `invalidateCache()` after data mutations
8. **VirtualList**: Use for 50+ items
9. **Database retries**: Use `dbRetry()` wrapper for flaky connections
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

## VirtualList for Large Lists

**Use for any list with 50+ items** (compendium lists, character inventories):

```svelte
<script lang="ts">
    import { VirtualList } from '$lib/components/ui/VirtualList.svelte';
    import type { Snippet } from 'svelte';

    interface Props {
        items: Array<Item>;
    }
    let { items }: Props = $props();

    let renderItem: Snippet<[Item]> = $snippet((item) => `
        <div class="p-2">{item.name}</div>
    `);
</script>

<VirtualList {items} {renderItem} itemHeight="80px" gap="gap-2" />
```

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

### Context7 (Library Documentation)
```typescript
// Get library ID first
mcp__plugin_context7_context7__resolve-library-id({ libraryName: 'svelte', query: '...' })
// Then query
mcp__plugin_context7_context7__query-docs({ libraryId: '/sveltejs/svelte', query: '...' })
```

### File Operations (Serena MCP)
```typescript
mcp__plugin_serena_serena__list_dir({ relative_path: '.', recursive: false })
mcp__plugin_serena_serena__read_file({ relative_path: 'src/app.css' })
mcp__plugin_serena_serena__find_file({ file_mask: '*.ts', relative_path: 'src' })
mcp__plugin_serena_serena__search_for_pattern({ substring_pattern: 'logger', relative_path: 'src' })
```

### File Operations (ACP - Preferred for reading/writing)
```typescript
mcp__acp__Read({ file_path: '/abs/path/to/file' })
mcp__acp__Write({ file_path: '/abs/path/to/file', content: '...' })
mcp__acp__Edit({ file_path: '/abs/path/to/file', old_string: '...', new_string: '...' })
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
