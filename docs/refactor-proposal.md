# Architecture Proposal: Grimar Codebase Refactor

## 1. Motivation
The current codebase has grown organically, leading to some "mega-services" (like the sync orchestrator) and "fat components" (like the compendium list page). This refactor aims to improve maintainability and scalability by introducing clear boundaries and separating concerns.

## 2. Proposed Directory Structure

```text
src/lib/
├── core/                # Project-wide foundations (stateless)
│   ├── constants/       # Global constants (colors, types)
│   ├── types/           # Global TypeScript interfaces/types
│   └── utils/           # Pure utility functions
│
├── components/          # UI Components
│   ├── ui/              # Atomic Primitives (Button, Input, Card, Badge)
│   ├── layout/          # Structural components (AppShell, GlobalHeader)
│   └── shared/          # Reusable domain-agnostic components
│
├── features/            # Feature-specific logic & components
│   ├── compendium/      # Compendium list, detail, filtering logic
│   │   ├── components/
│   │   ├── stores/
│   │   └── types.ts
│   ├── characters/      # Character sheet, creator logic
│   │   ├── components/
│   │   └── types.ts
│   └── dashboard/
│
├── server/              # Server-side only logic
│   ├── db/              # Database connection and Drizzle schema
│   ├── repositories/    # Database access layer (Users, Characters, Compendium)
│   ├── providers/       # External data source implementations
│   └── services/        # Orchestration and business logic
```

## 3. Key Design Patterns

### 3.1 Service Layer
Move complex orchestration logic (like `syncAllProviders`) into dedicated service classes/functions in `src/lib/server/services/`. This keeps route handlers and providers focused.

### 3.2 Repository Pattern
Decouple the application from the database schema by using repositories.
Example: `CharacterRepository.getById(id)` instead of writing Drizzle queries directly in routes.

### 3.3 Atomic Primitives
Consolidate all "Arcane Aero" styled elements into `src/lib/components/ui/`. Components like `Button`, `InputCrystal`, and `SurfaceCard` should be the building blocks for all features.

### 3.4 Feature-Based Svelte Stores
Move client-side logic (filtering, UI state) into Svelte stores or runes within the feature's directory (`src/lib/features/<name>/stores/`).

## 4. Migration Plan

1.  **Phase 1:** Reorganize `src/lib/core` and `src/lib/components/ui`.
2.  **Phase 2:** Implement `src/lib/server/repositories` for existing tables.
3.  **Phase 3:** Refactor `sync/orchestrator.ts` into smaller services.
4.  **Phase 4:** Decompose Compendium components into `src/lib/features/compendium/`.
