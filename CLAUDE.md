# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Critical Rules](#critical-rules)
3. [Library Usage Guidelines](#library-usage-guidelines)
4. [Project Overview](#project-overview)
5. [Essential Commands](#essential-commands)
6. [Architecture](#architecture)
7. [Development Workflow](#development-workflow)
8. [Code Style & Standards](#code-style--standards)
9. [Testing](#testing)
10. [Database](#database)
11. [Frontend Patterns](#frontend-patterns)
12. [Backend Patterns](#backend-patterns)
13. [Caching Strategy](#caching-strategy)
14. [Error Handling](#error-handling)
15. [Design System](#design-system)
16. [Project Management](#project-management)
17. [Documentation](#documentation)

---

## Quick Start

### Working Directory
All development commands must run from the `grimar/` subdirectory:

```bash
cd ./grimar && bun run <command>
```

### First Time Setup
```bash
cd ./grimar
bun install
bun run db:push
bun run dev
```

---

## Critical Rules

### ⚠️ ALWAYS FOLLOW THESE RULES

1. **Context7 MCP First**: When looking up documentation for any library or technology, ALWAYS use the Context7 MCP (`mcp__plugin_context7_context7__query-docs`) as your first option. This ensures you get accurate, version-specific information. Do not search the web or use external resources until after you've tried Context7.

2. **Working Directory**: Always `cd ./grimar` before running any bun commands
3. **Package Location**: The `package.json` is in the `grimar/` subdirectory, NOT the repo root
4. **Config Changes**: After modifying SvelteKit config, run `bun run prepare`
5. **Schema Changes**: 
   - Development: `bun run db:push`
   - Production: `bun run db:generate && bun run db:migrate`
6. **TypeScript**: Run `bun run check` before committing
7. **Tests**: Run `CI=true bun run test:run` before committing
8. **Zod Validation**: All provider data must be validated before database insert
9. **Cache Invalidation**: Call `invalidateCache()` after any data mutation
10. **VirtualList**: Use for 50+ items, not for small lists
11. **Database Retries**: Use `dbRetry()` wrapper for flaky connections

---

## Library Usage Guidelines

### 🚨 PRINCIPLE: Use Existing Libraries First

**ALWAYS check if functionality already exists in project dependencies before implementing from scratch.**

#### Priority Order for Implementation:
1. **Svelte/SvelteKit built-in features** - Use native Svelte 5 runes, SvelteKit load functions, form actions
2. **Project's UI Components** - Check `src/lib/components/ui/` for existing components
3. **Tailwind CSS v4** - Use utility classes and design tokens before custom CSS
4. **TanStack Query** - For data fetching, caching, and state management
5. **Drizzle ORM** - For database operations and queries
6. **Zod** - For runtime data validation and type safety
7. **Other Dependencies** - Check package.json for relevant libraries

#### Specific Guidelines:

**For Svelte/SvelteKit:**
- Use `$state()` instead of `let` for reactive state
- Use `$props()` for component props (Svelte 5)
- Use `$effect()` instead of `onMount` when possible
- Use SvelteKit form actions for form handling
- Use SvelteKit load functions for data loading
- Use SvelteKit's built-in navigation (`goto`) instead of custom routing

**For Tailwind CSS v4:**
- Use existing design tokens from CSS custom properties
- Check `app.css` for available utility classes
- Use Tailwind's `@theme` directive for custom styles
- Prefer utility classes over custom CSS components
- Use responsive prefixes (`sm:`, `md:`, `lg:`) for responsive design

**For UI Components:**
- Check `src/lib/components/ui/` for existing components before creating new ones
- Follow the established component patterns:
  - Atomic components for basic UI elements
  - Layout components for structural elements
  - Feature components for complex functionality

**For Data Management:**
- Use TanStack Query for server state
- Use localStorage persistence already configured
- Follow existing query key patterns
- Use the query client from `$lib/core/client/query-client`

**For Data Validation:**
- Use Zod schemas for all external data
- Define schemas in `src/lib/server/providers/schemas/`
- Validate on provider fetch before database insert
- Transform to unified types after validation

**For Database Operations:**
- Use Drizzle ORM with the existing schema
- Follow the service layer pattern in `$lib/server/services/`
- Use the established database connection pattern from `$lib/server/db`
- Wrap flaky operations with `dbRetry()` for automatic retries

**When to Create Custom Solutions:**
Only implement from scratch when:
1. No existing library provides the required functionality
2. The existing implementation doesn't meet specific performance requirements
3. Custom implementation provides significant architectural benefits

---

## Project Overview

**Grimar** is a self-hosted D&D 5e Progressive Web App (PWA) built as a monolith on SvelteKit 2 + Bun with an "Arcane Aero" design system (glass morphism, Frutiger Aero aesthetics). Designed for low-power home server deployment.

### Key Technologies
- **Frontend**: Svelte 5 with Runes, SvelteKit 2
- **Backend**: SvelteKit server endpoints
- **Database**: SQLite with better-sqlite3
- **ORM**: Drizzle ORM
- **Validation**: Zod schemas for type safety
- **State Management**: TanStack Query with localStorage persistence
- **Virtualization**: TanStack Virtual for large lists
- **Styling**: Tailwind v4 with custom design system
- **Testing**: Vitest + Playwright
- **Deployment**: Single container with Bun runtime

---

## Essential Commands

### Development
```bash
cd ./grimar && bun run dev          # Dev server (http://localhost:5173)
cd ./grimar && bun run check        # Type checking
cd ./grimar && bun run check:watch  # Watch mode
```

### Build & Production
```bash
cd ./grimar && bun run build        # Build for production
cd ./grimar && bun run preview      # Preview build
cd ./grimar && bun run start        # Production server
```

### Database Operations
```bash
cd ./grimar && bun run db:push      # Push schema (dev only)
cd ./grimar && bun run db:generate  # Generate migrations
cd ./grimar && bun run db:migrate   # Run migrations
cd ./grimar && bun run db:studio    # Drizzle Studio UI
cd ./grimar && bun run db:sync      # Sync compendium from providers
cd ./grimar && bun ./scripts/sync.ts  # Run sync directly
```

### Code Quality
```bash
cd ./grimar && bun run lint         # Prettier + ESLint
cd ./grimar && bun run format       # Format with Prettier
cd ./grimar && bun run prepare      # SvelteKit sync (after config changes)
```

### Testing
```bash
cd ./grimar && bun run test         # Vitest (watch mode)
cd ./grimar && bun run test:ui      # Vitest with UI
cd ./grimar && bun run test:run     # Vitest once (CI mode)
cd ./grimar && bun run test:e2e     # Playwright E2E tests
cd ./grimar && bun run test:e2e:ui  # Playwright with UI
cd ./grimar && bun run test:e2e:debug  # Playwright debug mode
cd ./grimar && bun run test:all         # All tests
cd ./grimar && bun run test -- name     # Run matching tests
```

---

## Architecture

### Monolith Design
Single-container deployment with SQLite embedded:

```
┌─────────────────────────────────────┐
│  SvelteKit (Frontend + Backend)     │
│  ┌───────────────────────────────┐  │
│  │   SQLite (better-sqlite3)      │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Why this approach:**
- `better-sqlite3` with synchronous mode for zero-latency local storage
- Single-file backup and deployment simplicity
- Reduced operational complexity for home server deployment

### Project Structure
```
grimar/
├── src/
│   ├── lib/
│   │   ├── core/           # Constants, types, utils
│   │   │   └── client/     # Theme store, query client, cache sync
│   │   ├── server/
│   │   │   ├── db/         # Schema, connection
│   │   │   ├── services/   # Business logic
│   │   │   ├── providers/  # Data providers
│   │   │   └── utils/      # Server utilities, caching
│   │   └── components/     # UI components
│   ├── routes/             # SvelteKit routes
│   └── hooks.server.ts     # Auth hook
├── tests/                  # Playwright E2E
├── drizzle/                # Migrations
├── data/compendium/        # JSON payloads
└── vite.config.ts          # PWA config
```

---

## Development Workflow

### The Plan is the Source of Truth
Work tracked in `conductor/tracks/*/plan.md`

### Test-Driven Development
1. Write failing tests before implementation
2. Target >80% coverage for all modules
3. Run tests before committing: `cd ./grimar && CI=true bun run test:run`

### Commit Message Format
```
<type>(<scope): <description>

Types: feat, fix, docs, style, refactor, test, chore
Example: feat(compendium): Add spell filtering by school
```

---

## Code Style & Standards

### General Principles
- **Prefer existing library features**: If functionality exists in Svelte, SvelteKit, TanStack Query, Drizzle, Zod, or any other project dependency, use it before implementing from scratch.
- **Named exports only**: Use `export { MyClass }`, **no default exports**
- **Use `const` or `let`**: **never `var`**
- **No `_` prefix/suffix**: For identifiers (including private properties)
- **Use strict equality**: `===` and `!==` for equality checks
- **Avoid `any`**: Prefer `unknown` or specific types

### Prettier Configuration
- Tabs for indentation
- Single quotes for strings
- No trailing commas
- 100 character line width

### Error Logging
```typescript
console.error('[CONTEXT] Error:', error)
```

---

## Testing

### Test Location
- **Unit tests**: `*.test.ts` alongside source files (co-located)
- **Integration tests**: `tests/` directory
- **E2E tests**: `tests/` directory with Playwright

### Key Testing Patterns

**Vitest Configuration:**
- Environment: `happy-dom` for component tests
- Mocks: Located in `src/test/mocks/` for SvelteKit internals
- Coverage: Target >80%, exclude constants and types

**Common Mocks:**
```typescript
// SvelteKit modules are mocked in vitest.config.ts aliases
'$app/navigation' → src/test/mocks/app-navigation.ts
'$app/state' → src/test/mocks/app-state.ts
'$env/dynamic/private' → src/test/mocks/env-dynamic-private.ts
'bun:sqlite' → src/test/mocks/bun-sqlite.ts
```

**Test Structure Pattern:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('FeatureName', () => {
    beforeEach(() => {
        // Setup
    });

    it('should do something', () => {
        // Arrange & Act & Assert
        expect(result).toBe(expected);
    });
});
```

### Running Specific Tests
```bash
# Run tests matching a pattern
cd ./grimar && bun run test -- spell

# Run a specific test file
cd ./grimar && bun run test src/lib/features/compendium/stores/filter.test.ts
```

---

## Database

### Core Tables
| Table | Purpose |
|-------|---------|
| `users` | Username + settings JSON |
| `compendium_items` | Spells, monsters, items (SRD + homebrew) |
| `compendium_cache` | Raw cache of upstream payloads |
| `characters` | User characters with stats/inventory/spells JSON |

### Key Patterns
```typescript
// Pre-processed render-ready data
details: text('details', { mode: 'json' }).notNull()

// Prevent upstream duplicates
externalIdx: uniqueIndex('compendium_items_external').on(table.type, table.externalId)

// Large payloads stored as files, not in DB
jsonPath: text('json_path')  // Path to data/compendium/
```

### Indexed Columns
`type`, `name`, `(type, name)`, `spellLevel`, `spellSchool`, `(type, level, school)`, `createdBy`, `challengeRating`, `monsterSize`, `monsterType`

### Standard Access Pattern
```typescript
import { getDb } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { compendiumItems } from '$lib/server/db/schema';

export const GET = async () => {
    const db = await getDb();
    return json(await db.select().from(compendiumItems).where(eq(compendiumItems.type, 'spell')));
};
```

### Database Retry Wrapper
```typescript
import { dbRetry } from '$lib/server/db/db-retry';

const result = await dbRetry(() => 
    db.select().from(compendiumItems)
);
```

---

## Frontend Patterns

### Svelte 5 Runes Pattern
```typescript
interface Props {
    title: string;
    active?: boolean;
    onclick?: () => void;
}
let { title, active = false, onclick }: Props = $props();

let count = $state(0);

$effect(() => {
    console.log('count changed:', count);
});

<button onclick={() => count++}>Click</button>
```

### Client Data Fetching
**TanStack Query** with localStorage persistence (`@tanstack/query-sync-storage-persister`):
- Cache key prefix: `grimar-query-cache`
- Retention: 7 days
- Offline-first with background refetching

```typescript
import { createQueryClient } from '$lib/core/client/query-client';
// Automatic hydration from localStorage on page load
```

### VirtualList for Large Datasets

**Use VirtualList for any list with 50+ items.**

**Pattern:**
```svelte
<script lang="ts">
    import { VirtualList } from '$lib/components/ui/VirtualList.svelte';
    import type { Snippet } from 'svelte';

    interface Props {
        items: Array<Item>;
    }
    let { items }: Props = $props();

    // Render snippet for each item
    let renderItem: Snippet<[Item]> = $snippet(`
        <div class="p-2">
            {@let item = item}
            {item.name}
        </div>
    `);
</script>

<VirtualList 
    items={items}
    {renderItem}
    itemHeight="80px"
    gap="gap-2"
/>
```

**When to use:**
- Compendium lists (spells, monsters, items)
- Character inventories
- Any scrollable list with dynamic data

**When NOT to use:**
- Small lists (< 20 items)
- Static content
- Non-scrollable containers

### Component Architecture
```
src/lib/components/
├── ui/           # Atomic components (Button, Badge, Card, VirtualList, Select)
├── layout/       # Structural (AppShell, GlobalHeader, PrimaryNav)
└── features/     # Feature-scoped (CompendiumDetail, CharacterSheet)
```

### 7-Theme System
Themes: Amethyst, Arcane, Nature, Fire, Ice, Void, Ocean

**Implementation:** CSS custom properties + Tailwind v4 `@theme`

```typescript
import { themeStore } from '$lib/core/client/themeStore';

themeStore.setTheme('nature'); // Persists to localStorage
```

---

## Backend Patterns

### Authentication: Reverse Proxy Headers
Auth handled upstream (Authentik via Traefik). App **never sees passwords**.

```typescript
// hooks.server.ts extracts:
X-Authentik-Username → locals.user.username
```

**Development bypass:** Set `VITE_MOCK_USER` env var.

**Route protection:**
```typescript
import { requireUser } from '$lib/server/services/auth';

export const load = async ({ locals }) => {
    const user = requireUser(locals); // Throws if unauthenticated
};
```

**User creation:** Trust-on-first-use - auto-created on first access.

### Data Validation with Zod

**All external data must be validated through Zod schemas.**

**Pattern:**
1. Define schemas in `src/lib/server/providers/schemas/`
2. Validate on provider fetch
3. Transform to unified types
4. Store in database

**Example:**
```typescript
import { z } from 'zod';

// Schema definition
const SpellSchema = z.object({
    name: z.string().min(1),
    level: z.number().int().min(0).max(9),
    school: z.string()
});

// Validation
const validated = SpellSchema.parse(rawData);
```

### Data Loading & Sync
**Sync flow:** Providers → DataLoader → Deduplication → Database

Key files:
- `data-loader.ts` - Batch processing with exponential backoff
- `deduplicate.ts` - Prevent upstream duplicates
- `sync/orchestrator.ts` - Multi-provider coordination

### Service Layer
Located in `/src/lib/server/services/`:

| Service | Responsibility |
|---------|----------------|
| `auth/` | Auth handler, guard, header extraction |
| `multiProviderSync.ts` | Multi-source sync orchestration |
| `compendium/` | Query services |
| `characters/` | CRUD operations |
| `sync/` | Sync state management |
| `srd/` | SRD import |

### Multi-Provider Compendium System
Providers in `/src/lib/server/providers/`:

- `BaseProvider` - Abstract base with common logic
- `Open5eProvider` - Open5e API (primary SRD)
- `5ebits.ts` - 5e-bits API
- `SRDProvider` - Direct SRD data
- `HomebrewProvider` - Local homebrew content
- `providerRegistry` - Central registry
- `providers/schemas/` - Type-safe Zod schemas

**Patterns:**
- `fetchList()`, `fetchAllPages()`, `fetchDetail()` per provider
- `transformItem()` converts to unified schema
- Health checks and retry with exponential backoff
- Source tracking on all items for data lineage

---

## Caching Strategy

### Multi-Layer Caching

The application uses a sophisticated three-layer caching strategy for optimal performance and offline support.

**Layer 1: Service Worker (vite.config.ts)**
- Open5e API: StaleWhileRevalidate, 24h, 1000 entries
- Compendium export: CacheFirst, 24h, 1 entry
- Local API: NetworkFirst, 10min, 100 entries
- SSE endpoint: NetworkOnly (never cache)
- Cache version: NetworkFirst, 1min, 5 entries
- Images: CacheFirst, 7 days, 500 entries
- Static (JS/CSS): StaleWhileRevalidate, 24h, 100 entries

**Layer 2: TanStack Query (Client)**
- Cache key: `grimar-query-cache`
- Persistence: localStorage with 7-day retention
- Hydration: Automatic on page load
- Network mode: Offline-first with background refetching
- Invalidation: Manual via `queryClient.invalidateQueries()`

**Layer 3: Server Repository Cache**
- In-memory cache in `CompendiumRepository`
- TTL-based expiration (configurable)
- Invalidated on sync completion
- Reduces database queries for frequently accessed items

**Cache Coordination:**
```typescript
// Client cache invalidation after sync
import { invalidateCache } from '$lib/core/client/cache-sync';

// Called after /api/compendium/sync completes
await invalidateCache();
```

**Cache Versioning:**
- Server maintains version counter in database
- Client checks version on app load
- Full cache invalidation when version mismatch detected
- Endpoint: `/api/cache/version`

---

## Error Handling

### Retry Logic

**Exponential backoff for external API calls:**
- Located in `src/lib/server/utils/data-loader.ts`
- Pattern: 3 retries with 100ms × 2^n backoff
- Jitter: ±25% randomization to prevent thundering herd
- Maximum delay: 8 seconds

```typescript
// Example retry pattern
async function fetchWithRetry(url: string) {
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            return await fetch(url);
        } catch (error) {
            lastError = error;
            const delay = 100 * Math.pow(2, attempt);
            await sleep(delay + Math.random() * 50);
        }
    }
    throw lastError;
}
```

### Database Retry Wrapper

```typescript
import { dbRetry } from '$lib/server/db/db-retry';

// Wraps database operations with automatic retry
const result = await dbRetry(() => 
    db.select().from(compendiumItems)
);
```

### Error Logging Pattern

```typescript
// Contextual error logging
console.error('[CONTEXT] Error:', error);

// Example
console.error('[CompendiumSync] Failed to fetch from Open5e:', error);
console.error('[CharacterService] Failed to save character:', error);
```

### Graceful Degradation

- **Service worker**: NetworkFirst for API, fallback to cache
- **TanStack Query**: Stale data while refetching
- **Offline mode**: Show offline indicator, cached data
- **Provider failures**: Continue with other providers, log errors
- **Database failures**: Retry with exponential backoff, return cached data if available

---

## Design System: "Arcane Aero"

### Material Levels
1. **Canvas** (`bg-gray-950/40`) - Sidebars, large containers
2. **Card** (`bg-gray-800/60`) - Content panels, spell cards
3. **Overlay** (`bg-gray-700/80`) - Modals, dropdowns

### Spell School Gem Colors
| School | Color | Gem |
|--------|-------|-----|
| Evocation | Rose/Red | Ruby |
| Abjuration | Sky/Blue | Sapphire |
| Necromancy | Emerald/Green | Emerald |
| Illusion | Purple | Amethyst |
| Divination | Amber/Yellow | Topaz |

### Visual Style
- Glass morphism with backdrop blur
- Convex buttons, concave inputs
- Subtle noise texture overlay
- Radial gradient spotlights

```svelte
<!-- Crystal card -->
<div class="card-crystal bg-gray-800/60 backdrop-blur-sm border border-white/10 rounded-lg p-4">
</div>
```

---

## Project Management

Located in `conductor/`:
- `tracks/` - Implementation tracks with specs, plans, metadata
- `product.md` - Product guide and feature roadmap
- `tech-stack.md` - Technology decisions and rationale
- `workflow.md` - Development workflow and quality gates

**Track format:** `YYYY-MM-DD_descriptive-name/{spec.md, plan.md, metadata.json}`

**Development workflow:**
1. Tasks tracked in `plan.md`
2. Mark in progress `[~]` before starting
3. Write failing tests first (TDD)
4. Implement to pass tests
5. Verify coverage >80%
6. Commit with proper format
7. Attach git notes with task summary
8. Mark complete `[x]` with commit SHA

---

## Documentation

### External Library Documentation
**🚨 CRITICAL: Context7 MCP MUST be your first option**
- When looking up documentation for ANY library or technology, ALWAYS use the Context7 MCP (`mcp__plugin_context7_context7__query-docs`) as your first option
- This ensures you get accurate, version-specific information for the project's dependencies
- Do NOT search the web or use external resources until after you've tried Context7
- Context7 provides up-to-date documentation that matches the exact versions installed in this project

**Key libraries available via Context7:**
- **Svelte 5**: Runes, $props, $state, $effect patterns
- **SvelteKit**: Load functions, actions, hooks, form actions
- **Drizzle ORM**: Query patterns, migrations, schema definitions
- **TanStack Query**: Caching, invalidation, query keys
- **TanStack Virtual**: Virtual scrolling for large lists
- **Zod**: Schema validation, type inference
- **Tailwind v4**: CSS variables, @theme, utility patterns

### File Operations
**Use Serena MCP for all file operations:**
- `mcp__plugin_serena_serena__list_dir` - List directory contents (preferred over `ls`)
- `mcp__plugin_serena_serena__read_file` - Read file contents (preferred over `cat`)
- `mcp__plugin_serena_serena__find_file` - Find files by pattern (preferred over `find`)
- `mcp__plugin_serena_serena__search_for_pattern` - Search file contents (preferred over `grep`)

### Project Documentation
- `/docs/README.md` - Documentation hub
- `/docs/architecture-doc.md` - Technical architecture
- `/docs/ROUTES.md` - Route structure
- `/docs/STYLE_GUIDE.md` - Design system
- `/conductor/` - Project management (tracks, specs)

---

## PWA & Offline

### Service Worker Configuration (`vite.config.ts`)
| Cache | Strategy | Expiration |
|-------|----------|------------|
| Open5e API | StaleWhileRevalidate | 24h, 1000 entries |
| Local API | NetworkFirst | 10min, 100 entries |
| Images | CacheFirst | 7 days, 500 entries |
| Static | StaleWhileRevalidate | 24h, 100 entries |

**Client cache:** TanStack Query with localStorage (`grimar-query-cache`), 7-day retention, offline-first.

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLite path (default: `file:./local.db`) |
| `VITE_MOCK_USER` | Dev auth bypass |
| `ADMIN_SYNC_TOKEN` | Admin sync bearer token |

---

## Important Gotchas

1. **Context7 MCP First**: When looking up documentation for any library or technology, ALWAYS use the Context7 MCP (`mcp__plugin_context7_context7__query-docs`) as your first option. This ensures you get accurate, version-specific information. Do not search the web or use external resources until after you've tried Context7.
2. **ALWAYS `cd ./grimar`** before any bun command
3. **After config changes:** run `bun run prepare`
4. **Schema changes:** `db:push` for dev, generate/migrate for prod
5. **TypeScript:** Run `bun run check` before committing
6. **Migrations:** Manual apply in production
7. **Test location:** `*.test.ts` alongside source files
8. **CI mode:** `CI=true bun run test:run`
9. **Large JSON:** Store in `data/compendium/` with `jsonPath`
10. **Adapter:** `svelte-adapter-bun` (not node)
11. **Auth redirect:** Only `/` is public; all others redirect
12. **Test mocks**: Always use the mocked SvelteKit modules from vitest.config.ts
13. **Zod validation**: All provider data must be validated before database insert
14. **Cache invalidation**: Call `invalidateCache()` after any data mutation
15. **VirtualList**: Use for 50+ items, not for small lists
16. **Database retries**: Use `dbRetry()` wrapper for flaky connections
