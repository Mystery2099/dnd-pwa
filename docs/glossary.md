# Grimar Glossary

A dictionary of terms used in the Grimar D&D 5e PWA project.

## Core Terms

### Entry
The umbrella term for any D&D 5e content item - spells, monsters, classes, items, feats, backgrounds, races, etc. Use "entry" instead of "compendium entry."

**Example:** "The fireball spell entry has a concentration property."

### Entry View
The detail panel/page displaying a single entry. Shows full information including description, statistics, and metadata.

**See also:** Entry List

### Entry List
The main page showing all entries of a particular type (spells, monsters, etc.) with filtering and virtual scrolling.

## Data Source Terms

### Source Book / Source
The publication or provider where content originates:
- **PHB** - Player's Handbook
- **SRD** - Systems Reference Document (free, OGL content)
- **XGE** - Xanathar's Guide to Everything
- **TCE** - Tasha's Cauldron of Everything
- **5ebits** - 5eBits provider (dnd5eapi.co)
- **Open5e** - Open5e provider (api.open5e.com)

### Provider
A data source that supplies entry content:
- **5ebits** - Primary provider, uses 5eBits API
- **Open5e** - Secondary provider, uses Open5e API
- **Homebrew** - User-created custom content
- **SRD** - Built-in SRD data

### External ID / Slug
The unique identifier for an entry from its source provider. Used for URL routing and lookups.

## Database Terms

### Unified Item
A standardized data structure that normalizes content from different providers into a consistent format.

### Details JSON
The `details` column in the database stores type-specific data as JSON:
- **Spell details** - Casting time, range, components, duration, concentration, ritual
- **Monster details** - Armor class, hit points, speed, abilities, actions
- **Item details** - Rarity, type, weight, value, attunement

### FTS (Full-Text Search)
SQLite FTS5 virtual table enabling fast search across entry names, summaries, and descriptions.

## URL Structure

### Type Path
The URL segment identifying entry type:
- `/spells` - Spell entries
- `/monsters` - Monster entries
- `/magicitems` - Magic item entries
- `/feats` - Feat entries
- `/backgrounds` - Background entries
- `/races** - Race entries
- `/classes** - Class entries

### Entry View URL Pattern
```
/compendium/[type]/[provider]/[sourceBook]/[slug]
```
Example: `/compendium/spells/5ebits/PHB/fireball`

## SvelteKit Terms

### Load Function
Server-side function (`+page.server.ts`) that fetches data before rendering a page.

### SSR (Server-Side Rendering)
Initial page render on the server, as opposed to client-side hydration.

### Hydration
Svelte "wakes up" server-rendered HTML on the client, adding interactivity.

### Runes
Svelte 5's reactivity system using `$state()`, `$derived()`, `$effect()`.

### Snippet
Svelte 5's named template block, used for render props (e.g., `{#snippet children(item)}`).

## Design System Terms

### Arcane Aero
The project's design system with glass morphism, Frutiger Aero aesthetics, and gem-themed spell school colors.

### Material Level
Visual hierarchy using opacity and blur:
- **Canvas** - Sidebars, large containers (`bg-gray-950/40`)
- **Card** - Content panels, spell cards (`bg-gray-800/60`)
- **Overlay** - Modals, dropdowns (`bg-gray-700/80`)

### Spell School Gems
Color coding for spell schools:
| School | Gem | Color |
|--------|-----|-------|
| Evocation | Ruby | Rose/Red |
| Abjuration | Sapphire | Sky/Blue |
| Necromancy | Emerald | Green |
| Illusion | Amethyst | Purple |
| Divination | Topaz | Amber/Yellow |
| Conjuration | Topaz | Amber |
| Transmutation | Citrine | Yellow-Orange |
| Enchantment | Aquamarine | Blue-Green |
| Divination (alt) | Diamond | Clear |
| Necromancy (alt) | Black Onyx | Black |

## Authentication Terms

### Authentik
The upstream authentication provider handling user login via reverse proxy.

### X-Authentik-Username
HTTP header containing the authenticated username, extracted in `hooks.server.ts`.

### VITE_MOCK_USER
Development environment variable bypassing auth for testing.

## State Management Terms

### TanStack Query
React Query-inspired library managing server state with caching, background refetching, and localStorage persistence.

### Query Key
Unique identifier for cached data (e.g., `['entries', 'list', 'spell']`).

### Invalidate Cache
Client-side operation clearing TanStack Query cache after data mutations.

### VirtualList / VirtualGrid
Virtualized scrolling components rendering only visible items for performance with 50+ entries.

## Sync Terms

### DataLoader
Utility that loads and validates JSON data from providers before database insert.

### Deduplication
Process ensuring entries with same `externalId` and `source` aren't duplicated.

### Cache Version
Server-Sent Events endpoint pushing version updates to invalidate client caches.

## Testing Terms

### Vitest
Unit testing framework used with happy-dom for component tests.

### Playwright
E2E testing framework for browser automation and integration tests.

### Test Fixture
Reusable test setup providing mock data or configured state.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLite file path |
| `VITE_MOCK_USER` | Dev auth bypass username |
| `ADMIN_SYNC_TOKEN` | Bearer token for admin sync |
| `NODE_ENV` | 'development' or 'production' |
| `SUPPRESS_LOGS` | Disable console logging |
