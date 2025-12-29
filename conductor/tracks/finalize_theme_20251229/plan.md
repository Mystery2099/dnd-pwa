# Plan: Finalize & Polish Theme System

## Phase 1: Logic Migration & Component Creation [checkpoint: c978569]
- [x] Task: Move Theme Store [4097975]
    - Move `grimar/src/lib/client/themeStore.svelte.ts` to `grimar/src/lib/core/client/themeStore.svelte.ts`.
    - Update imports in `grimar/src/routes/+layout.svelte`.
- [x] Task: Create ThemeSwitcher Component [3579d79]
    - Create `grimar/src/lib/components/ui/ThemeSwitcher.svelte`.
    - Implement a grid or list of theme options with visual previews.
    - Connect to `themeStore`.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Logic Migration & Component Creation' (Protocol in workflow.md)

## Phase 2: Integration & Verification
- [x] Task: Integrate into Settings Page [bad8ab5]
- [~] Task: Visual Audit & Polish
