# Grimar Technology Stack

## Core Runtime & Framework
- **Runtime:** [Bun](https://bun.sh/) - High-performance JavaScript runtime with native SQLite support and fast package management.
- **Framework:** [SvelteKit](https://kit.svelte.dev/) (Svelte 5) - Optimized for building fast, reactive web applications with server-side rendering and efficient client-side navigation.
- **Language:** [TypeScript](https://www.typescriptlang.org/) - Ensuring type safety across the entire application, particularly for complex D&D data structures.

## Data Management
- **Database:** [SQLite](https://www.sqlite.org/) (via `better-sqlite3`) - Local-first, file-based database ideal for self-hosted and offline-capable applications.
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) - TypeScript-first ORM for type-safe database access and migrations.
- **Schema:** Focused on character management and SRD compendium data with JSON support for flexible content.

## Frontend & Styling
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) - Utilizing the latest CSS-first configuration and "Arcane Aero" design tokens.
- **Icons:** [Lucide-Svelte](https://lucide.dev/guide/svelte/importing-icons) - Clean, consistent SVG icons for the digital grimoire interface.
- **UI Architecture:** Component-based modular design leveraging Svelte 5 snippets and runes.

## Capabilities & Infrastructure
- **PWA:** [@vite-pwa/sveltekit](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html) - Providing service worker management for offline access and an installable app experience.
- **Authentication:** [Authentik](https://goauthentik.io/) (via Traefik headers) - Centralized identity management for self-hosted environments.
- **Deployment:** Docker - Containerized application stack with persistent volumes for SQLite and media uploads.
