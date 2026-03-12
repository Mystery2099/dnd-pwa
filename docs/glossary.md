# Grimar Glossary

## Core Terms

### Compendium item

A normalized record in the unified `compendium` table. Each item belongs to a `type` and `source` and stores the original payload in `data`.

### Homebrew

User-authored content stored alongside upstream compendium content with source `homebrew`.

### Character

A lightweight player record stored in the `characters` table. The current app exposes character listing and CRUD APIs, not a full sheet route.

### Theme

A validated configuration object that controls CSS variables, typography, animation timing, and visual effects.

## Data Terms

### Open5e

The external provider used for synchronized compendium data.

### Source

The origin of a compendium item. Current source values are `open5e` and `homebrew`.

### Type

The content category for a compendium item, such as `spells`, `creatures`, `items`, or `classes`.

### Key

The provider-level identifier for a compendium item. In the database, `(type, key)` forms the primary key.

### FTS

SQLite full-text search infrastructure used to support fast compendium search.

### Sync metadata

Tracking data for provider synchronization, stored in the `sync_metadata` table.

## Auth Terms

### Authentik

The upstream identity provider used by the login flow and reverse-proxy integration.

### `X-Authentik-Username`

Proxy header used to identify an authenticated user.

### Session cookie

Encrypted cookie used by the app’s session-based auth flow.

### `DEV_TEST_AUTH_BYPASS`

Explicit development/test flag that allows bypass auth behavior when combined with test headers or cookies.

### `VITE_MOCK_USER`

A development-only client/server convenience variable still referenced in parts of the login and auth utility flow.

## Frontend Terms

### App shell

The persistent layout frame that wraps authenticated routes.

### Surface card

Reusable panel component for most primary content blocks.

### Theme card selector

UI used on the settings page to switch among available themes.

### Virtual list / virtual grid

Components that render only visible rows or tiles to keep large datasets performant.

## Cache Terms

### Cache version

Versioned state used to notify clients that cached data should be refreshed.

### SSE

Server-sent events, used here for cache event streaming.

### Offline data

Browser-stored application data in localStorage and IndexedDB used for caching and persistence.

## Route Terms

### Dashboard

Authenticated overview page at `/dashboard`.

### Characters

Character management page at `/characters`.

### Compendium

Browsing interface for synced and homebrew content under `/compendium`.

### Settings

Configuration page for appearance, sync behavior, account state, and local data management.
