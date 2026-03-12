# Grimar Specifications

## Summary

Grimar is a self-hosted SvelteKit application for browsing 5e compendium data, managing homebrew content, and maintaining lightweight character records. The current implementation is a single Bun-powered web app with SQLite persistence and Open5e synchronization.

This document describes the implemented product shape, not older roadmap ideas.

## Product Scope

### Implemented

- Authentication via encrypted session cookies or reverse-proxy headers
- Role derivation from configured Authentik groups
- Unified compendium table for Open5e and homebrew content
- Type-specific compendium routes and detail APIs
- Homebrew create, edit, import, export, and delete flows
- Character storage with list and item APIs
- Offline-aware cache versioning and SSE cache events
- Theme selection with built-in and imported JSON themes
- User settings persistence
- Request logging and web vitals ingestion

### Not Implemented

- Virtual tabletop
- Dice rolling system
- Campaign management
- Character sheet route such as `/characters/[id]`
- Built-in UI for authoring custom themes from scratch
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

## Authentication Model

Authentication is handled in [`grimar/src/hooks.server.ts`](/home/mystery/misc-projects/dnd-pwa/grimar/src/hooks.server.ts) through the auth service layer.

Supported modes:

- OAuth-style encrypted session cookie flow
- Reverse proxy header flow using `X-Authentik-Username`
- Development and test bypasses when explicitly enabled

Unauthenticated users are redirected to `/login` for non-public pages.

## Offline and Cache Behavior

- Client state uses TanStack Query
- Cache version endpoints support invalidation
- SSE endpoint broadcasts cache change events
- IndexedDB and localStorage are used for offline persistence and client caches
- Settings page includes cache and offline-data clearing actions

Offline support is partial and cache-oriented. It is not a full local-first mutation system.

## Operations

Root commands proxy into the app workspace:

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

Playwright E2E runs use a dedicated seeded SQLite database created during global setup and intentionally execute with a single worker for deterministic local runs.

## Environment Variables

Documented or inferred from current code:

- `DATABASE_URL`
- `OPEN5E_API_BASE_URL`
- `OPEN5E_SYNC_BATCH_SIZE`
- `DEV_TEST_AUTH_BYPASS`
- `VITE_AUTHENTIK_URL`
- `VITE_AUTHENTIK_CLIENT_ID`
- `ADMIN_GROUPS`
- `ADMIN_SYNC_TOKEN`
- `AUTHENTIK_URL`
- `AUTHENTIK_CLIENT_ID`
- `AUTHENTIK_CLIENT_SECRET`
- `AUTHENTIK_REDIRECT_URI`
- `SESSION_ENCRYPTION_KEY`
- `NODE_ENV`

## Current Gaps

- Offline support is cache-oriented and not a full local-first sync system
- The dashboard still uses placeholder content instead of real campaign or character summaries
- Character management is limited to lightweight records and list/create flows
