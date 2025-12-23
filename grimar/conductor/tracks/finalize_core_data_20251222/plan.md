# Track Plan: Finalize Core Compendium and Character Data Layer

## Phase 1: Repository Refinement
Focus on making the database access layer robust, type-safe, and fully tested.

- [ ] Task: Compendium Repository - Implement robust search and multi-faceted filtering.
- [ ] Task: Characters Repository - Implement full CRUD operations (Create, Read, Update, Delete).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Repository Refinement' (Protocol in workflow.md)

## Phase 2: API & Services Integration
Stabilize the background services and API endpoints that feed the UI.

- [ ] Task: Compendium Sync Service - Finalize SRD data seeding and caching logic.
- [ ] Task: API Routes - Refactor Spell and Monster [slug] routes to use repositories.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: API & Services Integration' (Protocol in workflow.md)

## Phase 3: Basic UI Wiring
Connect the existing UI components to the real data layer.

- [ ] Task: Compendium View Integration - Connect grid and filters to the Compendium repository.
- [ ] Task: Dashboard Integration - Display real user characters in the crystal card grid.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Basic UI Wiring' (Protocol in workflow.md)
