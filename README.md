# Grimar

Self-hosted, offline-aware D&D 5e reference app for compendium browsing, homebrew management, lightweight character records, and theme customization. Built with SvelteKit, Bun, SQLite, and Tailwind CSS v4.

## Workspace

This repository uses a Bun workspace with a thin root package and the main application in [`grimar/`](/home/mystery/misc-projects/dnd-pwa/grimar).

Run the common app commands from the repo root:

```bash
bun install
bun run dev
bun run check
bun run test:run
bun run test:e2e
bun run build
bun run start
```

The root `package.json` proxies the common lifecycle, quality, test, and database commands into [`grimar/`](/home/mystery/misc-projects/dnd-pwa/grimar).

## What Exists Today

- Authenticated SvelteKit app with Bun runtime and SQLite via Drizzle
- Session-based Authentik OAuth plus reverse-proxy header auth support
- Unified compendium backed by Open5e plus user homebrew content
- Character list and CRUD API for lightweight records
- Offline-aware client caching, query persistence, and cache invalidation endpoints
- Theme system with 12 built-in themes plus local JSON import/export
- User settings persistence, cache clearing, and sync controls
- Web vitals ingestion and lightweight request monitoring

## Route Map

- `/` public landing page; redirects to `/dashboard` when authenticated
- `/login` login screen
- `/auth/login`, `/auth/callback`, `/auth/logout` auth flow endpoints
- `/dashboard` authenticated overview page
- `/characters` character management
- `/compendium` compendium landing
- `/compendium/[type]` compendium type listing
- `/compendium/[type]/[key]` compendium detail page
- `/homebrew` homebrew listing
- `/homebrew/new` new homebrew entry
- `/homebrew/import` homebrew import workflow
- `/homebrew/[id]/edit` edit homebrew entry
- `/settings` appearance, sync, and account settings

## API Surface

- `/api/characters` and `/api/characters/[id]`
- `/api/compendium/items`
- `/api/compendium/stats`
- `/api/compendium/[type]/[slug]`
- `/api/homebrew`
- `/api/homebrew/[id]`
- `/api/homebrew/import`
- `/api/homebrew/export`
- `/api/homebrew/export/all`
- `/api/cache/version`
- `/api/cache/events`
- `/api/cache/invalidate`
- `/api/user/settings`
- `/api/monitoring/web-vitals`

### Compendium Detail Contract

`GET /api/compendium/[type]/[slug]` returns the app-level normalized detail payload, not the raw storage row. The response is versioned with `detailSchemaVersion` so the client can rely on a stable contract as the adapter evolves.

High-level response shape:

```json
{
  "detailSchemaVersion": 1,
  "item": { "...": "base compendium item" },
  "presentation": {
    "documentLabel": "5e 2014 Rules",
    "image": { "...": "header/image presentation props" },
    "creatureHeader": { "...": "creature header presentation props" }
  },
  "fields": [
    { "key": "script_language", "label": "Script Language", "value": { "...": "normalized value" } }
  ],
  "sections": [
    { "kind": "markdown", "...": "description or higher-level text" },
    { "kind": "spell-classes", "...": "normalized spell class links" },
    { "kind": "class-features", "...": "class feature entries" },
    { "kind": "creature-encounter", "...": "combat-facing creature block" },
    { "kind": "creature-set-roster", "...": "creature set roster cards" },
    { "kind": "benefits", "...": "benefit list or grouped cards" }
  ]
}

## Common Commands

```bash
# app lifecycle
bun run dev
bun run build
bun run preview
bun run start

# quality
bun run check
bun run lint
bun run format
bun run test:run
bun run test:e2e
bun run test:all

# data
bun run db:push
bun run db:generate
bun run db:migrate
bun run db:studio
bun run db:sync
bun run reindex-fts
```

Workspace-only commands that exist in [`grimar/package.json`](/home/mystery/misc-projects/dnd-pwa/grimar/package.json) but are not proxied at the repo root:

```bash
bun run --cwd grimar db:seed
```

## Testing Notes

Unit tests run with Vitest. E2E tests run with Playwright against a dedicated seeded SQLite database created by [`grimar/scripts/setup-e2e-db.ts`](grimar/scripts/setup-e2e-db.ts).

The Playwright suite is intentionally configured to use a single worker because it shares one local dev server and one seeded database during the run. If you see `ERR_CONNECTION_REFUSED` during a customized parallel run, revert to the default `bun run test:e2e` command.

For local development and automated test flows, auth bypasses are available through `VITE_MOCK_USER` and `DEV_TEST_AUTH_BYPASS`. Those are intended for development or test use only.

## Environment

Start from [`grimar/.env.example`](/home/mystery/misc-projects/dnd-pwa/grimar/.env.example).

Common variables:

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

The checked-in `.env.example` covers the core local-dev values. `ADMIN_GROUPS`, `ADMIN_SYNC_TOKEN`, and `SESSION_ENCRYPTION_KEY` are also supported by the app and are typically added per deployment.

`SESSION_ENCRYPTION_KEY` is required in production. In development, the server falls back to a temporary key if it is unset.

## Documentation

- [docs/SPECIFICATIONS.md](/home/mystery/misc-projects/dnd-pwa/docs/SPECIFICATIONS.md)
- [docs/COMPENDIUM_API.md](/home/mystery/misc-projects/dnd-pwa/docs/COMPENDIUM_API.md)
- [docs/DESIGN_SYSTEM.md](/home/mystery/misc-projects/dnd-pwa/docs/DESIGN_SYSTEM.md)
- [docs/STYLE_GUIDE.md](/home/mystery/misc-projects/dnd-pwa/docs/STYLE_GUIDE.md)
- [docs/THEMING_DEV.md](/home/mystery/misc-projects/dnd-pwa/docs/THEMING_DEV.md)
- [docs/THEMING_USER.md](/home/mystery/misc-projects/dnd-pwa/docs/THEMING_USER.md)
- [docs/glossary.md](/home/mystery/misc-projects/dnd-pwa/docs/glossary.md)

## License

[MIT](/home/mystery/misc-projects/dnd-pwa/LICENSE)
