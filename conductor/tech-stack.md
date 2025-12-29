# Tech Stack: Grimar

## Core Frameworks
- **Frontend:** [SvelteKit 5](https://svelte.dev/docs/kit/introduction) (using TypeScript)
- **Runtime:** [Bun](https://bun.sh/) (for high performance and native SQLite support)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) (implementing the "Arcane Aero" design system)

## Data Management
- **Database:** [SQLite](https://www.sqlite.org/index.html) (Local-first, zero-latency)
- **Library:** `better-sqlite3`
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) (Type-safe SQL with automated migrations)
- **Persistence:** Docker Volumes for SQLite file and image uploads.

## PWA & Offline
- **PWA Plugin:** `@vite-pwa/sveltekit`
- **Strategy:** Stale-While-Revalidate for compendium data; Network-only for user-sensitive writes.
- **Client DB:** IndexedDB (via `idb`) for client-side caching of offline data.

## Infrastructure & Security
- **Reverse Proxy:** [Traefik](https://traefik.io/) (Handles TLS and request routing)
- **Identity Provider:** [Authentik](https://goauthentik.io/) (External OIDC/LDAP management)
- **Auth Strategy:** Header-based identity (`X-Authentik-Username`) via SvelteKit hooks.
- **Containerization:** Docker (Single-container monolith).

## Key Libraries
- `lucide-svelte`: Iconography
- `zod`: Schema validation
- `nanoid`: Unique ID generation
- `svelte-markdown`: Markdown rendering for notes and descriptions
