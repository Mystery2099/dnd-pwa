# Grimar Route Map

This document lists the SvelteKit routes Grimar will implement.

## Conventions

- Routes are grouped by **Public** vs **Authenticated**.
- MVP routes are prioritized.
- Some features (e.g. PDFs, dice SSE) are listed as **Post-MVP**.

## Public Routes

- `/`
  - **Purpose:** Landing page.
  - **Behavior:** Redirect to `/dashboard` if authenticated; otherwise show a login prompt.

- `/healthz` (optional)
  - **Purpose:** Container health check endpoint.
  - **Behavior:** Return `200` if server is running.

## Authenticated App Shell

All authenticated pages should render inside an app shell layout providing:

- Global header (logo/title, omnibar, user/actions)
- Mobile navigation drawer

## Authenticated Routes (MVP)

- `/dashboard`
  - **Purpose:** Home for returning users.
  - **Data:** User profile + list of characters.

- `/compendium`
  - **Purpose:** Browse spells/items/monsters.
  - **UI:** Tabs or segmented control for type.

- `/compendium/[type]` (optional)
  - **Purpose:** Type-specific index page.
  - **Examples:** `/compendium/spells`, `/compendium/items`, `/compendium/monsters`.

- `/compendium/[type]/[id]` (optional)
  - **Purpose:** Dedicated detail route if we choose route-based details instead of modals.

- `/characters/[id]`
  - **Purpose:** Character sheet.
  - **Data:** Character record by `id`.

- `/forge`
  - **Purpose:** Create a new character.

- `/settings`
  - **Purpose:** User preferences and admin utilities.

## Authenticated Routes (Post-MVP / Planned)

- `/export`
  - **Purpose:** Export hub (JSON + PDF).

- `/export/characters/[id].pdf`
  - **Purpose:** Render/download PDF for a character.

- `/bookmarks`
  - **Purpose:** Dedicated bookmark view (optional; MVP may use compendium toggle only).

- `/campaigns`
  - **Purpose:** Campaign list (optional module).

- `/campaigns/[id]`
  - **Purpose:** Campaign detail (future).

## Internal API Routes (Server)

These are SvelteKit `+server.ts` endpoints.

### MVP

- `/api/me`
  - **Purpose:** Return the current user.

- `/api/characters`
  - **GET:** List current user’s characters.
  - **POST:** Create character (if not using form actions).

- `/api/characters/[id]`
  - **GET:** Character details.
  - **PATCH/PUT:** Update character.

- `/api/compendium`
  - **GET:** Query compendium items with filters.

- `/api/compendium/[id]`
  - **GET:** Compendium item details.

- `/api/uploads`
  - **POST:** Upload portrait image.

### Post-MVP

- `/api/open5e/sync`
  - **POST:** Refresh SRD cache.

- `/api/roll`
  - **POST:** Roll dice (server-authoritative) (optional).

- `/api/events`
  - **GET:** SSE stream for realtime events (dice, etc.).

## Error / Utility Pages

- `/(error)` (optional group)
  - `/(error)/unauthorized` (optional)
  - `/(error)/not-found` (optional)

Notes:
- SvelteKit already provides default 404 handling; custom pages are optional.
