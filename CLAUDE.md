# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

**Grimar** is a self-hosted D&D 5e Progressive Web App (PWA) built as a monolith
on SvelteKit 2 + Bun. The app features an "Arcane Aero" design system (modern
Frutiger Aero with glass morphism and magical themes) and is designed for
low-power home server deployment.

**Working Directory:** All development commands should be run from `/grimar/`

### ⚠️ CRITICAL RULE - Command Execution Pattern

**When running any bun/npm commands, ALWAYS use the pattern:**

```bash
cd ./grimar && bun run <command>
```

**NEVER run bun commands from the repo root.** The package.json and all
project configuration lives in the `./grimar/` subdirectory, not the root.

✅ CORRECT: `cd ./grimar && bun run check`
❌ WRONG:   `bun run check` (will fail or use wrong config)

---

## Essential Commands

```bash
# Development
cd ./grimar && bun run dev          # Start dev server (http://localhost:5173)
cd ./grimar && bun run check        # Type checking
cd ./grimar && bun run check:watch  # Watch mode type checking

# Build & Production
cd ./grimar && bun run build        # Build for production
cd ./grimar && bun run preview      # Preview production build
cd ./grimar && bun start            # Start production server

# Database (Drizzle ORM + SQLite)
cd ./grimar && bun run db:push      # Push schema changes directly (dev)
cd ./grimar && bun run db:generate  # Generate migration files
cd ./grimar && bun run db:migrate   # Run migrations
cd ./grimar && bun run db:studio    # Open Drizzle Studio UI

# Code Quality
cd ./grimar && bun run lint         # Prettier check + ESLint
cd ./grimar && bun run format       # Format with Prettier
cd ./grimar && bun run prepare      # Sync SvelteKit (after config changes)
```

---

## Architecture: Monolith Design

The application runs as a **single-container monolith**:

```bash
┌─────────────────────────────────────┐
│  SvelteKit (Frontend + Backend)     │
│  ┌───────────────────────────────┐  │
│  │   SQLite Database (local.db)  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Why this architecture?**

- Bun's native SQLite support eliminates need for separate database container
- Zero-latency local storage perfect for home server deployment
- Single-file backup (just copy `local.db`)

---

## Authentication: Reverse Proxy Headers

Authentication is handled by an upstream reverse proxy (Authentik).
The app **does not store passwords**.

```typescript
// In hooks.server.ts - handleAuth extracts:
X-Authentik-Username header → locals.user.username
```

**Development bypass:** Set `VITE_MOCK_USER` environment variable to skip auth.

**Route protection:** Use `requireUser()` from `$lib/server/services/auth` in
server load/actions:

```typescript
export const load = async ({ locals }) => {
    const user = requireUser(locals);
    // user.username is guaranteed to exist
};
```

**User creation:** Trust-on-first-use - users are auto-created in database on
first access.

---

## Database Schema & Patterns

### Tables

| Table | Purpose |
|-------|---------|
| `users` | Username + settings JSON (minimal storage) |
| `compendium_items` | Spells, monsters, items (SRD + homebrew) |
| `characters` | User characters with stats/inventory/spells JSON |
| `compendium_cache` | Raw upstream API payloads for resync |

### Key Schema Design

```typescript
// compendium_items uses pre-processed render-ready data
details: text('details', { mode: 'json' }).notNull()
// Avoids runtime transformation - data is ready to render

// Unique constraint prevents duplicates of upstream data
externalIdx: uniqueIndex('compendium_items_external').on(table.type, table.externalId)
```

### Standard Database Access Pattern

```typescript
import { getDb } from '$lib/server/db';
import { eq, and, or } from 'drizzle-orm';
import { compendiumItems } from '$lib/server/db/schema';

export const GET = async () => {
    const db = await getDb();
    const items = await db.select()
        .from(compendiumItems)
        .where(eq(compendiumItems.type, 'spell'));
    return json(items);
};
```

---

## Svelte 5 Modern Patterns

This project uses **Svelte 5 runes** (not Svelte 4 reactivity):

```typescript
// Props destructuring with explicit interface
interface Props {
    title: string;
    active?: boolean;
    onclick?: () => void;
}
let { title, active, onclick }: Props = $props();

// Reactive state (not $:)
let count = $state(0);

// Side effects
$effect(() => {
    console.log(count);
});

// Event handlers directly bound
<button onclick={() => count++}>Increment</button>
```

---

## Design System: "Arcane Aero"

### Material Levels (z-index hierarchy)

1. **Canvas** (`bg-gray-950/40`) - Large containers, sidebars
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

### Visual Patterns

- **Glass morphism**: Semi-transparent panels with backdrop blur
- **3D depth**: Buttons appear convex, inputs appear concave
- **Noise texture**: Subtle overlay to prevent plastic look
- **Radial gradients**: Spotlight effects instead of flat colors

### Styling Utilities

```svelte
<!-- Crystal card effect -->
<div class="card-crystal bg-gray-800/60 backdrop-blur-sm border border-white/10
rounded-lg p-4">
    <!-- Content -->
</div>

<!-- Convex button -->
<button class="aero-shine bg-linear-to-br from-white/10 to-white/5 ...">
    Click me
</button>
```

---

## Service Layer Architecture

Services are organized in `/grimar/src/lib/server/services/`:

| Service | Responsibility |
|---------|----------------|
| `auth.ts` | User authentication, `requireUser()` helper |
| `compendiumSync.ts` | Sync from Open5e API to local database |
| `characters.ts` | Character CRUD operations |
| `spells.ts` | Spell-specific queries and filtering |
| `apiClient.ts` | External API communication |
| `dataTransformer.ts` | Convert Open5e format to app schema |

---

## PWA & Offline Strategy

Service worker caching configured in `vite.config.ts`:

| Cache | Strategy | Expiration | Entries |
|-------|----------|------------|---------|
| Open5e API | StaleWhileRevalidate | 24 hours | 1000 |
| Local API | NetworkFirst | 10 minutes | 100 |
| Images | CacheFirst | 7 days | 500 |
| Static (JS/CSS) | StaleWhileRevalidate | 24 hours | 100 |

**Client-side cache:** `ClientCacheManager` singleton in `/src/lib/client/
cache.ts` tracks localStorage usage with 50MB budget. Keys prefixed with `grimar-cache-`.

---

## Real-Time Dice Rolling (Future)

Multiplayer dice uses **Server-Sent Events (SVE)** over HTTP/2, requiring no
extra ports:

- `POST /api/roll` - User rolls dice
- `/api/events` - SSE endpoint pushes events to all connected clients
- Client catches event and renders visual effects (particle confetti)

---

## Project Structure

```md
grimar/
├── src/
│   ├── lib/
│   │   ├── server/
│   │   │   ├── db/              # Schema, connection, repositories
│   │   │   ├── services/        # Business logic
│   │   │   ├── cache.ts         # Server-side caching
│   │   │   └── activity.ts      # Activity monitoring
│   │   ├── components/
│   │   │   ├── layout/          # App shell (nav, shell)
│   │   │   ├── compendium/      # Compendium-specific
│   │   │   ├── dashboard/       # Dashboard components
│   │   │   ├── primitives/      # Base UI components
│   │   │   └── ui/              # General UI
│   │   ├── client/              # Client-side utilities
│   │   └── constants/           # Spell levels, schools, etc.
│   ├── routes/
│   │   ├── api/                 # API endpoints
│   │   ├── compendium/          # Compendium pages
│   │   ├── characters/          # Character management
│   │   ├── dashboard/           # Main dashboard
│   │   ├── +layout.svelte       # Root layout
│   │   └── hooks.server.ts      # Auth handler
│   └── app.d.ts                 # SvelteKit declarations
├── drizzle/                     # Migrations
├── local.db                     # SQLite database (gitignored)
└── vite.config.ts               # Vite + PWA config
```

---

## Code Style

### Prettier configuration (tabs, single quotes, no trailing commas, 100 char width)

```typescript
// Error handling pattern
export const GET = async () => {
    try {
        const db = await getDb();
        return json(result);
    } catch (error) {
        console.error('[CONTEXT] Error:', error);
        return json({ error: 'Descriptive message' }, { status: 500 });
    }
};
```

---

## Important Gotchas

0. **ALWAYS cd to grimar first**: `cd ./grimar && bun run <command>` - the app is
   in a subdirectory, not the repo root
1. **After SvelteKit config changes**: Always run `bun run prepare`
2. **Database URL**: Set `DATABASE_URL` (default: `local.db`)
3. **Development auth**: Set `VITE_MOCK_USER` to bypass reverse proxy auth
4. **Schema changes**: Use `bun run db:push` during dev, generate/migrate for production
5. **TypeScript**: Strict mode enabled - always run `bun run check` before committing
6. **Migrations**: Drizzle migrations must be applied manually in production
