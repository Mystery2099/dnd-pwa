# Grimar Route Map

This document lists the SvelteKit routes in Grimar.

## Conventions

- Routes are grouped by **Public** vs **Authenticated**.
- Planned features are marked as **Planned**.
- Post-MVP/never-implemented features are marked as **Removed**.

## Public Routes

- `/`
  - **Purpose:** Landing page.
  - **Behavior:** Redirect to `/dashboard` if authenticated; otherwise show a login prompt.

- `/healthz`
  - **Purpose:** Container health check endpoint.
  - **Behavior:** Return `200` if server is running.

## Authenticated App Shell

All authenticated pages render inside an app shell layout providing:

- Global header (logo/title, omnibar, user/actions)
- Mobile navigation drawer
- Offline indicator
- Theme switching

## Authenticated Routes

- `/dashboard`
  - **Purpose:** Home for returning users.
  - **Data:** User profile + list of characters + recent activity.

- `/compendium`
  - **Purpose:** Compendium landing with type tabs.
  - **UI:** Tab navigation between spells/monsters/items.

- `/compendium/[type]`
  - **Purpose:** Type-specific browse page.
  - **Examples:** `/compendium/spells`, `/compendium/monsters`, `/compendium/items`.
  - **Features:** Search, filters, infinite scroll.

- `/compendium/[type]/[slug]`
  - **Purpose:** Dedicated entry view for items.
  - **Examples:** `/compendium/spells/fireball`, `/compendium/monsters/balrog`.
  - **Behavior:** Overlay panel with full details.

- `/characters`
  - **Purpose:** Character management.
  - **Features:** List characters, create new, view details inline.

- `/settings`
  - **Purpose:** User preferences.
  - **Features:** Theme selection, offline data management.

- `/forge`
  - **Purpose:** Character creation (planned).
  - **Status:** Route linked in nav, not yet implemented.

## Planned Routes (Not Yet Implemented)

- `/forge`
  - **Purpose:** Character creation wizard.
  - **Features:** Race/class selection, ability scores, equipment.

## Removed Routes (No Longer Planned)

- `/campaigns` - Campaign management module removed
- `/campaigns/[id]` - Removed
- `/bookmarks` - Bookmarks integrated into compendium
- `/export` - Export hub removed
- `/export/characters/[id].pdf` - PDF export removed

## Internal API Routes (Server)

These are SvelteKit `+server.ts` endpoints.

### Compendium

- `/api/compendium/sync`
  - **POST:** Trigger sync from all providers.
  - **Auth:** Authenticated users.

- `/api/compendium/export`
  - **GET:** Export compendium data as JSON.

- `/api/spells`
  - **GET:** List spells with filters.

- `/api/spells/[slug]`
  - **GET:** Get spell details by slug.

- `/api/monsters/[slug]`
  - **GET:** Get monster details by slug.

### Admin

- `/api/admin/sync`
  - **POST:** Admin-only sync with auth token.
  - **Auth:** Bearer token in `ADMIN_SYNC_TOKEN` env var.

### Removed Endpoints

- `/api/roll` - Dice roller SSE removed
- `/api/events` - SSE events removed
- `/api/admin/sync` - Deprecated (use `/api/compendium/sync`)
- `/api/uploads` - Image upload removed
- `/api/me` - Handled by auth hook
- `/api/characters` - Handled by +page.server actions
- `/api/characters/[id]` - Handled by +page.server actions
