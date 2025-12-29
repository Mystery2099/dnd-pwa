# Plan: Finalize & Polish Theme System

## Phase 1: Logic Migration & Component Creation
- [x] Task: Move Theme Store [4097975]
    - Move `grimar/src/lib/client/themeStore.svelte.ts` to `grimar/src/lib/core/client/themeStore.svelte.ts`.
    - Update imports in `grimar/src/routes/+layout.svelte`.
- [ ] Task: Create ThemeSwitcher Component
    - Create `grimar/src/lib/components/ui/ThemeSwitcher.svelte`.
    - Implement a grid or list of theme options with visual previews.
    - Connect to `themeStore`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Logic Migration & Component Creation' (Protocol in workflow.md)

## Phase 2: Integration & Verification
- [ ] Task: Integrate into Settings Page
    - Update `grimar/src/routes/settings/+page.svelte` (create if missing) to include `ThemeSwitcher`.
- [ ] Task: Visual Audit & Polish
    - Manually review `Button.svelte`, `SurfaceCard.svelte`, `Badge.svelte`.
    - Ensure they use semantic variables (`var(--color-accent)`) where appropriate.
    - Verify 3D/Glass effects look good on all themes (especially Light/Dark extremes like 'Void' vs 'Ice').
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Integration & Verification' (Protocol in workflow.md)
