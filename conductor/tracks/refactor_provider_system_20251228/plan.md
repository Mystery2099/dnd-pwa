# Plan: Refactor Provider System & Extend Compendium Types

## Phase 1: Abstract Base Provider Class [checkpoint: 6bd803f]
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
- [x] Task: Refactor `HomebrewProvider` to extend `BaseProvider` <!-- id: 4, commit: 3fdc271 -->
    - Update `src/lib/server/providers/homebrew.ts` to extend `BaseProvider`.
    - Verify existing tests pass.
- [ ] Task: Conductor - User Manual Verification 'Abstract Base Provider Class' (Protocol in workflow.md)

## Phase 2: Extend Compendium Types [checkpoint: 110a3ea]
- [x] Task: Update Type Definitions <!-- id: 5, commit: 3a4ee2a -->
    - Update `src/lib/types/compendium/index.ts` to include new fields for feats, backgrounds, races, and classes in `TransformResult`.
    - Update `src/lib/server/providers/types.ts` to add `5e-bits` to the provider union.
    - Verify no compilation errors.
- [ ] Task: Conductor - User Manual Verification 'Extend Compendium Types' (Protocol in workflow.md)

## Phase 3: Add Zod Validation [checkpoint: f97d311]
- [x] Task: Create Zod Schemas for 5e-bits <!-- id: 6, commit: 3dd2826 -->
    - Create `src/lib/server/providers/schemas/5ebits-schemas.ts` with schemas for Spells, Monsters, Classes, Races, Backgrounds, and Feats.
- [x] Task: Integrate Zod into 5e-bits Provider <!-- id: 7, commit: 5c9151c -->
    - Update `src/lib/server/providers/5ebits.ts` to use `validateData` with the new schemas.
    - Write tests for validation failure cases.
- [x] Task: Add Zod Validation to SRD Provider <!-- id: 8, commit: d72b4df -->
    - Create/Update schemas for SRD content.
    - Update `src/lib/server/providers/srd.ts` to use validation.
    - Write tests.
- [ ] Task: Conductor - User Manual Verification 'Add Zod Validation' (Protocol in workflow.md)

## Phase 4: Database Schema Optimization [checkpoint: 896e7b2]
- [x] Task: Create Data Loader Utility <!-- id: 9, commit: d63db7e -->
    - Create `src/lib/server/data-loader.ts` with `loadDetails` and `loadAllDetails` functions to read from `data/` JSON files.
    - Write unit tests for file reading and parsing.
- [x] Task: Update Database Schema <!-- id: 10, commit: b609c00 -->
    - Update `src/lib/server/db/schema.ts` to add `jsonPath` and new type-specific columns (`class_hit_die`, `race_size`, etc.).
    - Generate migration using `drizzle-kit`.
- [x] Task: Create Migration Script for Existing Data (If applicable) <!-- id: 11, commit: 7d9201c -->
    - Since this is a refactor, ensure we have a plan to migrate existing row data to JSON files if needed (or just re-sync). *Self-note: Re-sync is likely the strategy.*
- [ ] Task: Conductor - User Manual Verification 'Database Schema Optimization' (Protocol in workflow.md)

## Phase 5: Enable All Compendium Types [checkpoint: 580e140]
- [x] Task: Update 5e-bits Provider Capabilities <!-- id: 12, commit: e5f6492 -->
    - Update `src/lib/server/providers/5ebits.ts` to support fetching `feat`, `background`, `race`, and `class`.
    - Update `supportedTypes` property.
- [x] Task: Update Open5e Provider Capabilities <!-- id: 13, commit: 3991bd6 -->
    - Update `src/lib/server/providers/open5e.ts` to support new types if available.
    - Update `supportedTypes` property.
- [x] Task: Update Provider Registry Configuration <!-- id: 14, commit: 567bce7 -->
    - Update `providers.json` to reflect new supported types for `5e-bits`.
- [x] Task: Update Sync Orchestrator <!-- id: 15, commit: c4864b3 -->
    - Update `src/lib/server/services/sync/orchestrator.ts` to iterate over new types and handle them in the sync loop.
- [x] Task: Conductor - User Manual Verification 'Enable All Compendium Types' (Protocol in workflow.md) <!-- id: 16, commit: 580e140 -->

## Phase 6: Update ProviderSyncResult & Verification
- [x] Task: Update Sync Result Interface <!-- id: 17, commit: c4864b3 -->
    - Update `ProviderSyncResult` in `src/lib/server/providers/types.ts` (or wherever defined) to include counts for feats, backgrounds, races, and classes.
    - Update the orchestrator to populate these fields.
- [x] Task: Final Integration Test <!-- id: 18, commit: 9939bf1 -->
    - Write an integration test that runs a full sync (mocked) and verifies all types are processed and stored correctly (jsonPath set, lightweight columns populated).
- [x] Task: Conductor - User Manual Verification 'Update ProviderSyncResult & Verification' (Protocol in workflow.md) <!-- id: 19, commit: 9939bf1 -->
