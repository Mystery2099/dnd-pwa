# Tech Stack: The Grimar Hermetica

## Runtime & Package Management
- **Bun:** Used for high-performance execution and as the primary package manager.

## Core Frameworks
- **Svelte 5 & SvelteKit:** The foundation for the reactive frontend and integrated backend API routes.
- **TypeScript:** Ensuring type safety and better maintainability across the codebase.

## Data Management
- **SQLite:** Lightweight, server-side storage as the single source of truth.
- **Drizzle ORM:** TypeScript-first ORM for type-safe database interactions and migrations.
- **Better-SQLite3:** The high-performance driver for SQLite on the server.
- **Zod:** Comprehensive data validation for both API boundaries and internal logic.
- **TanStack Query (Svelte Query):** Handling asynchronous data fetching, state management, and read-only caching for offline access.

## Styling & UI
- **Tailwind CSS (v4):** Utility-first styling with modern, built-in features for theming.
- **Lucide Svelte:** Consistent and high-quality iconography.
- **Vite PWA:** Powering the Progressive Web App capabilities and offline service worker.

## Quality Assurance
- **Vitest:** Unit and integration testing for business logic and components.
- **Playwright:** End-to-end testing for critical user paths and PWA functionality.
- **Prettier & ESLint:** Ensuring consistent code style and preventing common errors.
