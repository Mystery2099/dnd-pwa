# Theme System Developer Guide

## Overview

Grimar supports:

- 12 built-in themes shipped in source
- Imported JSON themes stored in localStorage
- User-created themes in the client theme store, though the current settings UI only exposes import/export flows

## Source Files

- Schema: [`grimar/src/lib/core/types/theme.ts`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/core/types/theme.ts)
- Built-in data: [`grimar/src/lib/core/client/builtinThemes.ts`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/core/client/builtinThemes.ts)
- Registry helpers: [`grimar/src/lib/core/client/themeRegistry.ts`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/core/client/themeRegistry.ts)
- Theme store: [`grimar/src/lib/core/client/themeStore.svelte.ts`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/core/client/themeStore.svelte.ts)
- Metadata helpers: [`grimar/src/lib/core/client/themes.ts`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/core/client/themes.ts)
- Runtime CSS generation: [`grimar/src/lib/core/client/themeCSS.ts`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/core/client/themeCSS.ts)
- Static CSS variables: [`grimar/src/routes/layout.css`](/home/mystery/misc-projects/dnd-pwa/grimar/src/routes/layout.css)

## Adding a Built-in Theme

Update all of these in the same change:

1. Add the full `ThemeConfig` entry to [`builtinThemes.ts`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/core/client/builtinThemes.ts).
2. Add the metadata entry to [`themes.ts`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/core/client/themes.ts).
3. Add the CSS variable block for `[data-theme='your-id']` in [`layout.css`](/home/mystery/misc-projects/dnd-pwa/grimar/src/routes/layout.css).

If one of those is skipped, the app will drift between the selector UI, runtime store, and rendered CSS.

## Required Theme Shape

Themes are validated against `ThemeConfigSchema`. A theme includes:

- `id`, `name`, `description`, `source`
- `colors`
- `typography`
- `animation`
- `visualEffects`

The `colors` object currently includes:

- `bgCanvas`
- `bgCard`
- `bgOverlay`
- `accent`
- `accentGlow`
- `accentRgb`
- `bgOverlayRgb`
- `textPrimary`
- `textSecondary`
- `textMuted`
- `textInverted`
- `border`
- `borderHover`
- `shadow`
- `overlayLight`
- `overlayDark`
- `effectUrl`

## Runtime Behavior

- Built-in themes are static and load through CSS variable blocks.
- Imported and created themes are injected at runtime through generated CSS.
- The selected theme ID is stored in localStorage under `grimar-theme`.
- Imported themes are stored under `grimar-imported-themes`.
- User-created themes are stored under `grimar-user-created-themes`.

## Themed UI Rules

When building or revising screens:

- Prefer semantic tokens such as `--color-bg-card`, `--color-accent`, `--color-text-primary`, and gem tokens over fixed Tailwind palette classes.
- If a screen needs differentiated subtypes, derive them from theme tokens with `color-mix()` instead of hardcoding a route palette.
- Beta and prototype routes are not exempt from theme integration. They should still look native under every built-in and imported theme.

## Testing Changes

After theme changes:

```bash
bun run check
bun run test:run
```

Then verify manually:

- Theme appears in the selector
- Theme applies after reload
- Focus states remain visible
- Text contrast remains acceptable
- Non-built-in themes still inject correctly

## Current Caveats

- The settings page currently exposes import, apply, export, and delete for imported themes.
- Theme creation and editing APIs exist in the client store but are not yet surfaced in the current settings UI.
- Imported theme accessibility depends entirely on the theme author’s color choices.
