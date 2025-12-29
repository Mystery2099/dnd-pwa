# Specification: Finalize & Polish Theme System

## Overview
This track builds upon the initial theme implementation to fully integrate it into the Grimar modular architecture and provide a user-facing UI for theme management.

## Functional Requirements
- **Theme Logic Migration:**
    - Move `themeStore.svelte.ts` to `src/lib/core/client/` to align with the modular directory structure.
    - Update all imports (e.g., in `+layout.svelte`).
- **Theme Switcher Component:**
    - Create a `ThemeSwitcher.svelte` UI component.
    - Component should show a preview or representative icon for each available theme (Amethyst, Arcane, Nature, Fire, Ice, Void, Ocean).
- **Settings Integration:**
    - Add the `ThemeSwitcher` to the `/settings` page.
    - (Optional) Add a quick-switch toggle in the sidebar or header.
- **Visual Consistency Audit:**
    - Audit key components (`SurfaceCard`, `Button`, `Badge`) to ensure they use the semantic CSS variables (`--color-bg-card`, `--color-accent`, etc.) instead of hardcoded hex values or old Tailwind color classes.

## Non-Functional Requirements
- **No FOUC:** Maintain the inline script in `+layout.svelte` to ensure theme is applied before first paint.
- **Persistence:** Ensure theme selection is saved to `localStorage` and persists across sessions.

## Acceptance Criteria
- `themeStore.svelte.ts` is in `src/lib/core/client/`.
- User can change the theme via a UI component on the `/settings` page.
- Theme change is instant and reactive (via Svelte 5 runes).
- All core UI primitives correctly respond to theme changes.
