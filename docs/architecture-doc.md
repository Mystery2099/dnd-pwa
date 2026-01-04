# 🏗️ The Grimar Hermetica: Architecture Document

**Version:** 1.1.0
**Status:** In Development (Multi-Provider Implementation)

## 1. Executive Summary

**The Grimar Hermetica** is a self-hosted, offline-capable Progressive Web App
(PWA) designed for D&D 5e management. It features a unified "Monolith"
architecture using SvelteKit and Bun, designed to run on a low-power home server
(Mini PC).

It leverages an existing self-hosted infrastructure (Traefik + Authentik) to
offload identity management, allowing the application to focus purely on game
logic and UI.

-----

## 2. High-Level System Context

The system operates within a Docker container behind a reverse proxy.

* **User Device:** Mobile or Desktop running a browser (or installed PWA).
* **Gateway (Traefik):** Handles TLS termination and routing.
* **Identity Provider (Authentik):** Intercepts unauthenticated requests. Upon
success, forwards requests to the App with identity headers.
* **The App (SvelteKit Container):** A single container running the frontend
, backend API, and database engine.
* **Storage:** A Docker Volume mapping the SQLite database file to the host disk.

-----

## 3. Technology Stack (The "Golden Stack")

| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Framework** | **SvelteKit** | Unifies UI and API. Excellent performance. |
| **Runtime** | **Bun** | Native SQLite support, fast startup, TypeScript out of the box. |
| **Language** | **TypeScript** | Type safety for D&D rules (Spells, Stats) is critical. |
| **Database** | **SQLite (via `bun:sqlite`)** | Zero-latency, single-file storage. No separate DB container needed. |
| **ORM** | **Drizzle ORM** | Lightweight wrapper for SQL. Handles migrations (`drizzle-kit`). |
| **Styling** | **Tailwind CSS 4** | configured with the "Arcane Aero" Design System. |
| **Deployment** | **Docker** | Single image deployment using `svelte-adapter-bun`. |

-----

## 4. Application Architecture

### 4.1 Directory Structure

```text
src/
├── lib/
│   ├── core/            # Project-wide foundations
│   │   ├── client/      # Client utilities (theme store, query client)
│   │   ├── constants/   # Global constants (spell levels, schools)
│   │   ├── types/       # Global TypeScript interfaces
│   │   └── utils/       # Pure utility functions
│   ├── components/      # UI Components
│   │   ├── ui/          # Atomic primitives (Button, Input, Card, Badge)
│   │   ├── layout/      # Structural components (AppShell, GlobalHeader)
│   │   └── features/    # Feature-specific components
│   ├── features/        # Feature modules with colocated logic
│   │   ├── compendium/  # Compendium browse, detail, filtering
│   │   ├── dashboard/   # Dashboard and character grids
│   │   └── ...
│   ├── server/
│   │   ├── db/          # Database configuration and schema
│   │   ├── repositories/# Database access layer
│   │   ├── providers/   # Data Providers (Open5e, SRD, Homebrew, 5e-bits)
│   │   └── services/    # Business logic (sync, auth, characters)
│   └── assets/          # Static assets
├── routes/
│   ├── +layout.svelte   # App Shell (GlobalHeader, OfflineIndicator)
│   ├── api/             # Internal API endpoints
│   ├── compendium/      # Compendium routes
│   ├── characters/      # Character management
│   ├── settings/        # Settings page
│   └── ...
├── hooks.server.ts      # Authentication interceptor
└── app.css              # Global styles and Tailwind
```

### 4.2 Authentication Flow (Header-Based)

We utilize a **Trust-on-First-Use** model via the reverse proxy.

1. **Request:** Incoming request hits `hooks.server.ts`.
2. **Extraction:** logic checks `event.request.headers.get('X-Authentik-Username')`.
3. **Session:**

* If Header exists: `event.locals.user` is populated.
* If Header missing: Request is rejected (401) or treated as Guest.
  
4.**Trust Boundary:** We rely on Traefik middleware to strip this header from
external spoofing attempts.

### 4.3 Data Access Pattern

* **Server-Side:** Route handlers (`+page.server.ts`) access `db.select()` directly.
* **Client-Side:** The PWA hydrates from the server data.
* **Writes:** Form Actions (`actions`) are used for mutations (Creating
Characters, Casting Spells) to ensure they work even if JS is unstable.

### 4.4 Multi-Provider System

Grimar utilizes a robust **Multi-Provider System** to aggregate D&D content from various sources:

*   **Registry:** A central registry (`providers.json`) manages enabled providers (Open5e, SRD, Homebrew, 5e-bits).
*   **BaseProvider:** An abstract class ensuring consistent data fetching, transformation, and validation (via Zod) across all sources.
*   **Sync Orchestrator:** Handles concurrent synchronization, error handling, and retry logic (exponential backoff).
*   **Source Tracking:** Every compendium item is tagged with its source (`open5e`, `srd`, `homebrew`) for transparent data lineage.

-----

## 5. Database Schema (Preliminary)

We use a localized schema where the "User" is just a string reference.

**Table: `users` (Virtual)**

* *Note: We do not store passwords. We only store settings.*
* `username` (PK, Text) - From Authentik header.
* `settings` (JSON) - Theme preference, dice colors.

**Table: `characters`**

* `id` (PK, Int)
* `owner` (Text, FK -\> users.username)
* `name` (Text)
* `stats` (JSON) - Str, Dex, HP, etc.
* `spells` (JSON) - Array of prepared spell IDs.

**Table: `compendium_items`**

* *Aggregated content from all providers.*
* `id` (PK)
* `source` (Text) - Provider ID (e.g., "open5e", "homebrew")
* `type` (Text) - Entity type (Spell, Monster, Item, Feat, Class, etc.)
* `name` (Text)
* `data` (JSON) - Full definition object (validated against Zod schemas)
* `jsonPath` (Text) - Path to local JSON file for detailed data (optimization)
* `created_by` (Text, FK -> users.username, Nullable)

-----

## 6. Caching & Offline

### 6.1 Server-Side Caching

- **In-memory repository cache:** `CompendiumRepository` maintains an in-memory cache of frequently accessed items
- **Cache invalidation:** Triggered on sync completion via `/api/compendium/sync`

### 6.2 Client-Side Caching

- **TanStack Query:** Used for all server data with localStorage persistence
- **Cache key:** `grimar-query-cache`
- **Retention:** 7 days
- **Hydration:** Automatic on page load
- **Network mode:** Offline-first with background refetching

### 6.3 Service Worker Caching

Using `@vite-pwa/sveltekit`:

| Cache | Strategy | Expiration | Entries |
|-------|----------|------------|---------|
| Open5e API | StaleWhileRevalidate | 24 hours | 1000 |
| Compendium Export | StaleWhileRevalidate | 24 hours | 1 |
| Local API | NetworkFirst | 10 minutes | 100 |
| Images | CacheFirst | 7 days | 500 |
| Static (JS/CSS) | StaleWhileRevalidate | 24 hours | 100 |

### 6.4 Theme System

- **7 Themes:** Amethyst, Arcane, Nature, Fire, Ice, Void, Ocean
- **Implementation:** CSS custom properties with `themeStore.svelte.ts`
- **Persistence:** localStorage with `$state()` reactivity

---

## 7. Removed Features

### Real-Time Dice Rolling

The SSE-based dice roller was never implemented and has been removed from the roadmap.

---

## 8. Deployment Configuration

### 8.1 Dockerfile

```dockerfile
FROM oven/bun:1 AS build

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Production Runner
FROM oven/bun:1-alpine
WORKDIR /app
COPY --from=build /app/build ./
COPY --from=build /app/package.json ./

# The database lives here
VOLUME /app/data

# Environment
ENV DATABASE_URL="file:/app/data/grimar.sqlite"
ENV ORIGIN="https://grimar.yoursite.com"

EXPOSE 3000
CMD ["bun", "./index.js"]
```

### 8.2 Docker Compose (Snippet)

```yaml
  grimar:
    build: .
    volumes:
      - ./grimar-data:/app/data
    labels:
      - "traefik.http.routers.grimar.middlewares=authentik@docker"
```

-----

## 9. Next Steps (Development Order)

1. **Scaffold:** Run `bun create svelte@latest`.
2. **Design:** Install Tailwind + Copy "Arcane Aero" CSS tokens.
3. **Auth:** Implement `hooks.server.ts` to log Authentik headers.
4. **Data:** Set up Drizzle + SQLite and implement the Provider System.
5. **UI:** Build the "Compendium" page using the Glass components.