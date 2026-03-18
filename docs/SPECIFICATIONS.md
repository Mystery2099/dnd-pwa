# Grimar Specifications

## Summary

Grimar is a self-hosted SvelteKit application for browsing 5e compendium data, managing homebrew content, maintaining lightweight character records, and customizing the client theme. The current implementation is a Bun-powered web app with SQLite persistence, Open5e synchronization, and offline-oriented client caching.

This document describes the implemented product shape, not older roadmap ideas.

Related implementation docs:

- [COMPENDIUM_API.md](./COMPENDIUM_API.md)

## Product Scope

### Implemented

- Authentication via encrypted session cookies or reverse-proxy headers
- Role derivation from configured Authentik groups
- Unified compendium table for Open5e and homebrew content
- Type-specific compendium routes and detail APIs
- Homebrew create, edit, import, export, and delete flows
- Character storage with list and item APIs
- Offline-aware cache versioning and SSE cache events
- Theme selection with built-in themes and local JSON theme import/export
- User settings persistence
- Request logging and web vitals ingestion

### Not Implemented

- Virtual tabletop
- Dice rolling system
- Campaign management
- Character sheet route such as `/characters/[id]`
- Built-in server-backed theme sharing or sync between devices
- File-uploaded character portraits

## Application Structure

### Public Routes

- `/`
- `/login`
- `/auth/login`
- `/auth/callback`
- `/auth/logout`

### Authenticated Routes

- `/dashboard`
- `/characters`
- `/compendium`
- `/compendium/[type]`
- `/compendium/[type]/[key]`
- `/homebrew`
- `/homebrew/new`
- `/homebrew/import`
- `/homebrew/[id]/edit`
- `/settings`

### API Routes

- Character API: `/api/characters`, `/api/characters/[id]`
- Compendium API: `/api/compendium/items`, `/api/compendium/stats`, `/api/compendium/[type]/[slug]`
- Homebrew API: `/api/homebrew`, `/api/homebrew/[id]`, `/api/homebrew/import`, `/api/homebrew/export`, `/api/homebrew/export/all`
- Cache API: `/api/cache/version`, `/api/cache/events`, `/api/cache/invalidate`
- User settings API: `/api/user/settings`
- Monitoring API: `/api/monitoring/web-vitals`

## Technical Architecture

### Runtime and Framework

- Bun runtime
- SvelteKit 2
- Svelte 5 runes
- Vite 7
- Vite PWA integration

### Storage

- SQLite database
- Drizzle ORM
- Main tables: `users`, `compendium`, `characters`, `sync_metadata`

### Data Model

The compendium uses a single normalized table keyed by `(type, key)` and stores the original upstream payload in `data`. Indexed columns support filtering by source, publisher, document, and name.

Characters are intentionally lightweight:

- `id`
- `owner`
- `name`
- `portraitUrl`
- `stats`
- `inventory`
- `spells`

### Providers

- `open5e`
- `homebrew`

Open5e synchronization is handled by Bun scripts and stored in SQLite. Homebrew content is written directly into the same unified compendium model.

### Compendium Detail Adapter

The compendium detail route and API no longer expose raw provider JSON as the primary rendering contract. Instead, a server-side adapter builds a normalized detail payload with:

- `detailSchemaVersion` for explicit contract versioning
- `presentation` for header and media-oriented props
- `fields` for curated sidebar/reference metadata
- `sections` for structured content blocks such as markdown sections, spell classes, class features, creature encounters, and creature set rosters
- section kinds can also express type-specific presentation intent, such as grouped background benefit cards versus plain benefit lists

Markdown rendering for detail pages is also driven from this normalized detail payload, so section structure and markdown-key discovery live in one server-side place rather than being duplicated in the page loader.

## Authentication Model

Authentication is handled in [`grimar/src/hooks.server.ts`](/home/mystery/misc-projects/dnd-pwa/grimar/src/hooks.server.ts) through the auth service layer.

Supported modes:

- OAuth-style encrypted session cookie flow
- Reverse proxy header flow using `X-Authentik-Username`
- Development mock-user bypass using `VITE_MOCK_USER`
- Explicit test bypass using `DEV_TEST_AUTH_BYPASS` plus a test cookie or proxy header

Unauthenticated users are redirected to `/login` for non-public pages.

## Offline and Cache Behavior

- Client state uses TanStack Query
- Cache version endpoints support invalidation
- SSE endpoint broadcasts cache change events
- IndexedDB and localStorage are used for offline persistence and client caches
- Imported themes are stored in browser storage on the current device
- Settings page includes cache and offline-data clearing actions

Offline support is partial and cache-oriented. It is not a full local-first mutation system.

## Operations

Repo-root commands proxy into the app workspace:

```bash
bun run dev
bun run check
bun run lint
bun run test:run
bun run test:e2e
bun run build
bun run start
bun run db:sync
bun run reindex-fts
```

Workspace-only commands are available in [`grimar/package.json`](/home/mystery/misc-projects/dnd-pwa/grimar/package.json):

```bash
bun run --cwd grimar db:seed
```

Playwright E2E runs use a dedicated seeded SQLite database created during global setup and intentionally execute with a single worker for deterministic local runs.

## Environment Variables

Documented or inferred from current code:

- `DATABASE_URL`
- `NODE_ENV`
- `VITE_MOCK_USER`
- `OPEN5E_API_BASE_URL`
- `OPEN5E_SYNC_BATCH_SIZE`
- `DEV_TEST_AUTH_BYPASS`
- `ADMIN_GROUPS`
- `ADMIN_SYNC_TOKEN`
- `AUTHENTIK_URL`
- `AUTHENTIK_CLIENT_ID`
- `AUTHENTIK_CLIENT_SECRET`
- `AUTHENTIK_REDIRECT_URI`
- `SESSION_ENCRYPTION_KEY`

The checked-in `.env.example` focuses on local development. `ADMIN_GROUPS`, `ADMIN_SYNC_TOKEN`, and `SESSION_ENCRYPTION_KEY` are supported in code but expected to be provided by the deployment environment when needed.

## Current Gaps

- Offline support is cache-oriented and not a full local-first sync system
- The dashboard still uses placeholder content instead of real campaign or character summaries
- Character management is limited to lightweight records and list/create flows
- Imported themes are device-local rather than synced through the server
- The normalized compendium detail contract is internal to the app and versioned, but it is not yet documented as a public external API with migration guarantees beyond in-repo consumers
