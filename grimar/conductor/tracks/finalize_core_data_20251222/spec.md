# Track Spec: Finalize Core Compendium and Character Data Layer

## Goal
The primary objective of this track is to complete and stabilize the data persistence and retrieval layer for the two most critical entities in Grimar: **Compendium Items** (Spells, Monsters, etc.) and **Characters**. This ensures a solid foundation for the mobile-first UI and offline capabilities.

## Scope
- **Database Repositories (`src/lib/server/db/repositories/`):**
    - `compendium.ts`: Refactor to support robust full-text search and complex multi-faceted filtering (class, level, school).
    - `characters.ts`: Complete the full CRUD lifecycle (Create, Read, Update, Delete) with correct JSON handling for nested stats and inventory.
- **Data Services (`src/lib/server/services/`):**
    - `compendiumSync.ts`: Finalize the logic for fetching SRD data from external APIs (Open5e) and seeding the local SQLite database.
    - `srd.ts`: Ensure consistent data transformation between API responses and internal schema.
- **API & UI Wiring:**
    - Stabilize `src/routes/api/spells/` and `src/routes/api/monsters/` to use the refined repositories.
    - Connect the Compendium and Dashboard views to the live database, replacing any remaining mock data.

## Technical Requirements
- **TDD:** Every repository method must have corresponding unit tests in `src/lib/server/db/repositories/__tests__/` (or similar).
- **Type Safety:** 100% TypeScript coverage for data models and repository return types.
- **Drizzle ORM:** Utilize Drizzle's relational queries where appropriate for performance.
- **Performance:** Ensure compendium search remains sub-100ms on local SQLite.

## Design Constraints
- Any UI updates must adhere to the **Arcane Aero** design system tokens (e.g., using `surface.card` for list items).
