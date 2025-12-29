# Plan: Codebase Refactoring & Modularity

## Phase 1: Analysis & Architecture Proposal
- [x] Task: Conduct Codebase Audit [1da38b0]
    - Analyze current `src/lib` structure and component dependencies.
    - Identify largest files and most coupled modules.
- [x] Task: Draft Architecture Proposal [4a79e4a]
    - Define proposed directory structure (e.g., Feature-based vs. Layer-based).
    - Select design patterns (Service Layer, Repository, Atomic Design components).
    - Create a `docs/refactor-proposal.md` for review.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Analysis & Architecture Proposal' (Protocol in workflow.md) [checkpoint: 36610bf]

## Phase 2: Structural Reorganization
- [x] Task: Implement New Directory Structure [f8b77a0]
    - Create new folders in `src/lib` based on the approved proposal.
    - Move files to new locations (using git mv to preserve history).
    - Update import paths throughout the application.
- [x] Task: Update Configuration & Documentation [101b8dd]
    - Update `tsconfig.json` paths if necessary.
    - Update `architecture-doc.md` to reflect the new structure.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Structural Reorganization' (Protocol in workflow.md) [checkpoint: 5b4839e]

## Phase 3: Backend Layer Refactoring
- [x] Task: Extract Service Layer [83f85f8]
    - Identify logic in `+page.server.ts` / `+server.ts` files.
    - Move logic to `src/lib/server/services/`.
    - Create distinct services (e.g., `CharacterService`, `CompendiumService`, `AuthService`).
- [x] Task: Centralize Type Definitions [f8b77a0]
    - Audit `src/types` or `app.d.ts`.
    - Consolidate scattered interfaces into a cohesive Type domain.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Backend Layer Refactoring' (Protocol in workflow.md) [checkpoint: 7788d75]

## Phase 4: Frontend Component Decomposition
- [x] Task: Audit & Refactor Major Components [b47a7dc]
    - Identify "Mega Components" (e.g., Compendium Views).
    - Break them down into smaller, focused components.
    - Ensure props and events are strictly typed.
- [x] Task: Standardize UI Primitives [d0aa75a]
    - Ensure all core UI elements (Buttons, Inputs, Cards) are in `src/lib/components/ui`.
    - Enforce usage of these primitives over raw HTML/Tailwind classes.
- [x] Task: Conductor - User Manual Verification 'Phase 4: Frontend Component Decomposition' (Protocol in workflow.md) [checkpoint: d0aa75a]

## Phase 5: Verification & Cleanup
- [~] Task: Run Full Regression Test
    - Manually verify key flows (Login, Browse Compendium, Create Character).
    - Run automated tests (if any).
- [ ] Task: Final Polish
    - Remove unused files and dead code.
    - Ensure linting and formatting rules are applied project-wide.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Verification & Cleanup' (Protocol in workflow.md)
