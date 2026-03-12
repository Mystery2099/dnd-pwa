# Grimar

Self-hosted, offline-capable D&D 5e reference and campaign utility built with SvelteKit, Bun, SQLite, and Tailwind CSS v4.

## Workspace

This repository uses Bun workspaces. Run commands from the repo root:

```bash
bun install
bun run dev
bun run check
bun run test:run
bun run test:e2e
bun run build
bun run start
```

The root `package.json` proxies most commands into [`grimar/`](/home/mystery/misc-projects/dnd-pwa/grimar).

## What Exists Today

- Authenticated SvelteKit app with Bun runtime and SQLite via Drizzle
- Unified compendium backed by Open5e plus user homebrew content
- Character list and CRUD API
- Offline-aware client caching, query persistence, and cache invalidation endpoints
- Theme system with 12 built-in themes plus JSON theme import/export
- Web vitals ingestion and lightweight request monitoring

## Route Map

- `/` public landing page; redirects to `/dashboard` when authenticated
- `/login` login screen
- `/dashboard` authenticated overview page
- `/characters` character management
- `/compendium` compendium landing
- `/compendium/[type]` compendium type listing
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

## Environment

Start from [`grimar/.env.example`](/home/mystery/misc-projects/dnd-pwa/grimar/.env.example).

Common variables:

- `DATABASE_URL`
- `OPEN5E_API_BASE_URL`
- `OPEN5E_SYNC_BATCH_SIZE`
- `DEV_TEST_AUTH_BYPASS`
- `VITE_MOCK_USER`
- `ADMIN_GROUPS`
- `ADMIN_SYNC_TOKEN`
- `AUTHENTIK_URL`
- `AUTHENTIK_CLIENT_ID`
- `AUTHENTIK_CLIENT_SECRET`
- `AUTHENTIK_REDIRECT_URI`
- `SESSION_ENCRYPTION_KEY`

## Documentation

- [docs/SPECIFICATIONS.md](/home/mystery/misc-projects/dnd-pwa/docs/SPECIFICATIONS.md)
- [docs/DESIGN_SYSTEM.md](/home/mystery/misc-projects/dnd-pwa/docs/DESIGN_SYSTEM.md)
- [docs/STYLE_GUIDE.md](/home/mystery/misc-projects/dnd-pwa/docs/STYLE_GUIDE.md)
- [docs/THEMING_DEV.md](/home/mystery/misc-projects/dnd-pwa/docs/THEMING_DEV.md)
- [docs/THEMING_USER.md](/home/mystery/misc-projects/dnd-pwa/docs/THEMING_USER.md)
- [docs/glossary.md](/home/mystery/misc-projects/dnd-pwa/docs/glossary.md)

## License

[MIT](/home/mystery/misc-projects/dnd-pwa/LICENSE)
