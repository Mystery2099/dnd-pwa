# Plan: Refactor Provider System & Extend Compendium Types

## Phase 1: Abstract Base Provider Class
- [x] Task: Create `BaseProvider` abstract class <!-- id: 0, commit: d54d3b6 -->
    - Create `src/lib/server/providers/base-provider.ts` defining the abstract class and common methods (`healthCheck`, `toTitleCase`, `fetchAllPagesPaginated`).
    - Write unit tests for `BaseProvider` concrete implementation to verify common logic.
- [x] Task: Refactor `Open5eProvider` to extend `BaseProvider` <!-- id: 1, commit: 93780d5 -->
    - Update `src/lib/server/providers/open5e.ts` to extend `BaseProvider` and remove duplicated logic.
    - Verify existing tests pass.
- [x] Task: Refactor `FiveEBitsProvider` to extend `BaseProvider` <!-- id: 2, commit: 9d1b045 -->
    - Update `src/lib/server/providers/5ebits.ts` to extend `BaseProvider`.
    - Verify existing tests pass.
- [x] Task: Refactor `SrdProvider` to extend `BaseProvider` <!-- id: 3, commit: 47cf614 -->
    - Update `src/lib/server/providers/srd.ts` to extend `BaseProvider`.
    - Verify existing tests pass.
- [ ] Task: Refactor `HomebrewProvider` to extend `BaseProvider`
    - Update `src/lib/server/providers/homebrew.ts` to extend `BaseProvider`.
    - Verify existing tests pass.
- [ ] Task: Conductor - User Manual Verification 'Abstract Base Provider Class' (Protocol in workflow.md)

## Phase 2: Extend Compendium Types
- [ ] Task: Update Type Definitions
    - Update `src/lib/types/compendium/index.ts` to include new fields for feats, backgrounds, races, and classes in `TransformResult`.
    - Update `src/lib/server/providers/types.ts` to add `5e-bits` to the provider union.
    - Verify no compilation errors.
- [ ] Task: Conductor - User Manual Verification 'Extend Compendium Types' (Protocol in workflow.md)

## Phase 3: Add Zod Validation
- [ ] Task: Create Zod Schemas for 5e-bits
    - Create `src/lib/server/providers/schemas/5ebits-schemas.ts` with schemas for Spells, Monsters, Classes, Races, Backgrounds, and Feats.
- [ ] Task: Integrate Zod into 5e-bits Provider
    - Update `src/lib/server/providers/5ebits.ts` to use `validateData` with the new schemas.
    - Write tests for validation failure cases.
- [ ] Task: Add Zod Validation to SRD Provider
    - Create/Update schemas for SRD content.
    - Update `src/lib/server/providers/srd.ts` to use validation.
    - Write tests.
- [ ] Task: Conductor - User Manual Verification 'Add Zod Validation' (Protocol in workflow.md)

## Phase 4: Database Schema Optimization
- [ ] Task: Create Data Loader Utility
    - Create `src/lib/server/data-loader.ts` with `loadDetails` and `loadAllDetails` functions to read from `data/` JSON files.
    - Write unit tests for file reading and parsing.
- [ ] Task: Update Database Schema
    - Update `src/lib/server/db/schema.ts` to add `jsonPath` and new type-specific columns (`class_hit_die`, `race_size`, etc.).
    - Generate migration using `drizzle-kit`.
- [ ] Task: Create Migration Script for Existing Data (If applicable)
    - Since this is a refactor, ensure we have a plan to migrate existing row data to JSON files if needed (or just re-sync). *Self-note: Re-sync is likely the strategy.*
- [ ] Task: Conductor - User Manual Verification 'Database Schema Optimization' (Protocol in workflow.md)

## Phase 5: Enable All Compendium Types
- [ ] Task: Update 5e-bits Provider Capabilities
    - Update `src/lib/server/providers/5ebits.ts` to support fetching `feat`, `background`, `race`, and `class`.
    - Update `supportedTypes` property.
- [ ] Task: Update Open5e Provider Capabilities
    - Update `src/lib/server/providers/open5e.ts` to support new types if available.
- [ ] Task: Update Provider Registry Configuration
    - Update `providers.json` to reflect new supported types for `5e-bits`.
- [ ] Task: Update Sync Orchestrator
    - Update `src/lib/server/services/sync/orchestrator.ts` to iterate over new types and handle them in the sync loop.
- [ ] Task: Conductor - User Manual Verification 'Enable All Compendium Types' (Protocol in workflow.md)

## Phase 6: Update ProviderSyncResult & Verification
- [ ] Task: Update Sync Result Interface
    - Update `ProviderSyncResult` in `src/lib/server/services/sync/types.ts` (or wherever defined) to include counts for feats, backgrounds, races, and classes.
    - Update the orchestrator to populate these fields.
- [ ] Task: Final Integration Test
    - Write an integration test that runs a full sync (mocked) and verifies all types are processed and stored correctly (jsonPath set, lightweight columns populated).
- [ ] Task: Conductor - User Manual Verification 'Update ProviderSyncResult & Verification' (Protocol in workflow.md)
