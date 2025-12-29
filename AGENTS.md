# AGENTS.md

## Project Overview

**Grimar** is a self-hosted, offline-capable Progressive Web App (PWA) for D&D
 5e management.
 It's built as a monolith using SvelteKit and Bun, designed to run on a low-power
home server.
 The application features an "Arcane Aero" design system - a modern take on
 Frutiger Aero with glass morphism, gem accents, and magical visual themes.

## Essential Commands

### Development

```bash
# Start development server
bun run dev

# Install dependencies
bun install

# Type checking
bun run check

# Watch mode type checking
bun run check:watch
```

### Build & Deployment

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

### Database Operations

```bash
# Push schema changes to database
bun run db:push

# Generate migration files
bun run db:generate

# Run migrations
bun run db:migrate

# Open database studio UI
bun run db:studio
```

### Code Quality

```bash
# Check formatting and linting
bun run lint

# Format code
bun run format

# Sync SvelteKit (after config changes)
bun run prepare
```

### Docker & Deployment

```bash
# Build the application for production
bun run build

# Start production server
bun start

# Preview production build locally
bun run preview
```

## Project Structure

The codebase follows SvelteKit conventions with clear separation of concerns:

```md
grimar/
├── src/
│   ├── lib/
│   │   ├── server/          # Server-side only code
│   │   │   ├── db/          # Database connection & schema
│   │   │   ├── services/    # Business logic services
│   │   │   ├── cache/       # Caching system
│   │   │   └── auth/        # Authentication
│   │   ├── components/      # Reusable UI components
│   │   │   ├── dashboard/   # Dashboard-specific components
│   │   │   ├── compendium/  # Compendium components
│   │   │   ├── layout/      # App shell components
│   │   │   ├── primitives/  # Base UI components
│   │   │   └── ui/          # General UI components
│   │   ├── client/          # Client-side utilities
│   │   └── constants/       # Application constants
│   ├── routes/              # SvelteKit routes
│   │   ├── api/             # API endpoints
│   │   ├── compendium/      # Compendium pages
│   │   ├── characters/      # Character management
│   │   └── dashboard/       # Dashboard
│   └── hooks.server.ts      # Server-side hooks
├── drizzle/                 # Database migrations
└── docs/                    # Documentation
```

## Technology Stack

- **Framework**: SvelteKit with Svelte 5 (using modern `$state`, `$effect`, etc.)
- **Runtime**: Bun (native SQLite support, fast startup)
- **Language**: TypeScript (strict type checking)
- **Database**: SQLite with Drizzle ORM
- **Styling**: Tailwind CSS 4 with custom "Arcane Aero" design system
- **PWA**: @vite-pwa/sveltekit for offline capabilities
- **Icons**: Lucide Svelte

## Code Patterns & Conventions

### Svelte 5 Patterns

- Use `$state()` for reactive state instead of Svelte 4's `$:`
- Use `$effect()` for side effects instead of `onMount` where appropriate
- Props destructuring with TypeScript interfaces: `let { data } = $props()`
- Snippets for template composition: `{#snippet child()}...{/snippet}`
- Modern component pattern with explicit Props interface for type safety
- Event handlers directly bound to elements: `{onclick}`

Example component pattern:

```svelte
<script lang="ts">
    interface Props {
        title: string;
        active?: boolean;
        onclick?: () => void;
    }
    
    let { title, active, onclick }: Props = $props();
</script>
```

### Database Pattern

```typescript
// Standard database access pattern
import { getDb } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { compendiumItems } from '$lib/server/db/schema';

export const GET = async () => {
    const db = await getDb();
    const items = await db.select().from(compendiumItems)
        .where(eq(compendiumItems.type, 'spell'));
    return json(items);
};
```

### Component Organization

- Layout components in `/src/lib/components/layout/`
- Feature-specific components in respective directories
- Reusable primitives in `/src/lib/components/primitives/`
- General UI components in `/src/lib/components/ui/`

### Error Handling Patterns

- API endpoints use try-catch blocks with proper HTTP status codes
- Database errors return 500 status with error messages
- Console error logging with context prefixes (e.g., '[CLIENT_CACHE]')
- Graceful degradation for cache/storage operations
- Error responses include error field for frontend handling

Example pattern:

```ts
export const GET = async () => {
    try {
        const db = await getDb();
        // ... database operations
        return json(result);
    } catch (error) {
        console.error('Error checking spells:', error);
        return json({
            hasSpells: false,
            error: 'Database error'
        }, { status: 500 });
    }
};
```

### Authentication Flow

- Header-based authentication via reverse proxy (Authentik)
- `hooks.server.ts` extracts `X-Authentik-Username` header
- Users are stored as string references, not passwords
- Development bypass available via `VITE_MOCK_USER` environment variable
- Use `requireUser()` helper in server load/actions to protect routes

## Design System: "Arcane Aero"

The UI follows a "modern Arcane Aero" aesthetic - think Frutiger Aero meets
magical interface design:

### Key Visual Elements

- **Glass morphism**: Semi-transparent panels with backdrop blur
- **Gemstone accents**: Color-coded by spell school (Ruby for Evocation, Sapphire
for Protection, etc.)
- **3D depth**: Buttons appear convex, inputs appear concave
- **Noise texture**: Very subtle noise overlay to prevent plastic look
- **Gradient backgrounds**: Radial spotlights instead of flat colors

### Styling Patterns

- Use Tailwind classes extensively
- Custom utility classes for special effects (`.aero-shine`, `.card-crystal`)
- Component-level CSS in Svelte files only when necessary
- Inter font for body text, with special effects for headers

### Color Semantics

- Backgrounds: Dark gradients with purple/indigo tones
- Spell schools: Specific gem colors (see `/src/lib/constants/spells.ts`)
- Rarity expressed via border/glow intensity, not hue changes

### PWA Configuration

The application uses @vite-pwa/sveltekit with specific caching strategies:

- **Open5e API**: StaleWhileRevalidate (24 hour expiration, 1000 entries)
- **Local API endpoints**: NetworkFirst (10 minute expiration, 100 entries)
- **Images**: CacheFirst (7 day expiration, 500 entries)
- **Static resources**: StaleWhileRevalidate (24 hour expiration, 100 entries)

### Client-Side Cache

- Client cache manager tracks storage usage via `ClientCacheManager` singleton
- Monitors localStorage usage with keys prefixed with `grimar-cache-`
- Estimates total cache budget at 50MB
- Provides cleanup event system for cache invalidation
- Tracks last sync time for offline functionality

## Key Architecture Decisions

### Monolith Architecture

- Single container contains frontend, backend, and SQLite database
- No separate database container required
- Designed for low-power home server deployment

### PWA Strategy

- Service worker caches static assets and API responses
- Offline-first approach for compendium data
- Network-first for dynamic user data

### Data Sync

- Open5e API integration for SRD spell/monster data
- Local caching for offline access
- Admin sync endpoints for data updates

## Database Schema

Key tables:

- `users`: Minimal user storage (username + settings)
- `compendium_items`: Spells, monsters, items from SRD and homebrew
  - Indexed by type, name, spell level, and spell school for efficient filtering
  - Supports external ID mapping for upstream APIs
  - JSON details field stores pre-processed render-ready data
- `characters`: User-created characters with stats and inventories
- `compendium_cache`: Raw upstream payload cache for replay/resync

### Database Indexes

The schema includes optimized indexes for common query patterns:

- Type-based filtering (compendium items by type)
- Name-based searching
- Spell filtering by level and school
- User-specific content queries

## Working with This Codebase

### Adding New Features

1. Create database schema changes if needed (run `bun run db:generate`)
2. Add API endpoints in `/src/routes/api/`
3. Create UI components in appropriate directory
4. Add page routes in `/src/routes/`
5. Update type definitions in schema

### Adding New Components

- Follow the existing component structure with clear props
- Use the Arcane Aero design tokens and patterns
- Implement proper TypeScript types
- Include responsive design considerations

### Testing

- No specific test framework currently configured
- Manual testing via `bun run dev`
- Type checking via `bun run check`

### Deployment

- Uses `svelte-adapter-bun` for Bun runtime
- Runs as a single monolithic application (frontend + backend + database)
- Uses SQLite with file-based database (no separate container needed)
- Designed for low-power home server deployment
- Database file is stored locally (default: `local.db`)

## Important Gotchas

### Environment Setup

- DATABASE_URL must be set (default: `local.db`)
- VITE_MOCK_USER can be set for development bypass of authentication
- Run `bun run prepare` after SvelteKit config changes
- Drizzle migrations must be applied manually

### Development Workflow

- Always run `bun run check` before committing
- Use `bun run db:push` for schema changes during development
- Database studio accessible via `bun run db:studio`

### Code Style

- Tabs for indentation (Prettier config)
- Single quotes for strings
- No trailing commas
- 100 character line width

### Performance Considerations

- PWA caching strategies are carefully configured
- Avoid caching dynamic user-facing endpoints
- Use streaming for large data sets (see compendium pages)

## Documentation

- `docs/STYLE_GUIDE.md`: Detailed Arcane Aero design system
- `docs/COMPONENTS.md`: Complete component inventory
- `docs/ROUTES.md`: Route mapping and conventions
- `docs/architecture-doc.md`: Full system architecture
- `docs/arcane-design-sysem.md`: Design system tokens and rules

## Common Tasks

### Adding a New Compendium Type

1. Update `compendiumItems` type enum in schema
2. Create API endpoint in `/src/routes/api/[type]/+server.ts`
3. Add page in `/src/routes/compendium/[type]/`
4. Update filter constants if needed

### Database Schema Changes

1. Modify `/src/lib/server/db/schema.ts`
2. Run `bun run db:generate` to create migration
3. Run `bun run db:migrate` to apply changes
4. Update related TypeScript types

### Adding New UI Components

1. Create component in appropriate directory
2. Follow existing patterns for props and events
3. Use Arcane Aero styling (glass, gems, gradients)
4. Add to component inventory documentation
