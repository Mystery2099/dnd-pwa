# Grimar Design System

## Purpose

Grimar uses a themeable fantasy UI system built on CSS custom properties, Tailwind CSS v4 utilities, and reusable Svelte components. The system aims for glassy, tactile panels without sacrificing legibility.

## Core Principles

- Dense but readable surfaces
- Strong theming through tokens instead of one-off colors
- Consistent component states for hover, focus, selection, and disabled behavior
- Low-friction support for built-in and runtime-injected themes

## Technology

- Tailwind CSS v4
- CSS custom properties in [`grimar/src/routes/layout.css`](/home/mystery/misc-projects/dnd-pwa/grimar/src/routes/layout.css)
- Svelte component primitives in [`grimar/src/lib/components/ui`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/components/ui)
- Theme registry and theme store in [`grimar/src/lib/core/client`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/core/client)

## Theme Architecture

The theme system has four practical layers:

1. Theme schema in [`theme.ts`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/core/types/theme.ts)
2. Built-in theme definitions in [`builtinThemes.ts`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/core/client/builtinThemes.ts)
3. Theme metadata helpers in [`themes.ts`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/core/client/themes.ts)
4. CSS variable application in [`layout.css`](/home/mystery/misc-projects/dnd-pwa/grimar/src/routes/layout.css) and runtime CSS injection via [`themeCSS.ts`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/core/client/themeCSS.ts)

Themes are applied with `data-theme` on `<html>`.

## Built-in Themes

Current built-ins:

- `amethyst`
- `arcane`
- `nature`
- `fire`
- `ice`
- `ocean`
- `void`
- `beach`
- `necropolis`
- `charmed`
- `divine`
- `underdark`

Keep [`builtinThemes.ts`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/core/client/builtinThemes.ts), [`themes.ts`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/core/client/themes.ts), and the corresponding CSS variable blocks in [`layout.css`](/home/mystery/misc-projects/dnd-pwa/grimar/src/routes/layout.css) aligned.

## Token Groups

Each theme defines tokens for:

- Canvas, card, and overlay backgrounds
- Accent color, glow, and RGB helpers
- Primary, secondary, muted, and inverted text
- Border, border-hover, shadow, and overlay helpers
- Display and body typography
- Motion easing and durations
- Visual effects such as noise opacity and separator treatment

## Component Layers

The UI is organized around a few repeated surface patterns:

- App shell and navigation
- Cards and panels
- Form controls
- Selection controls
- Dialogs, sheets, and overlays
- Virtualized list and grid components
- Data-dense atlas and compendium browsing surfaces

Representative files:

- [`AppShell.svelte`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/components/layout/AppShell.svelte)
- [`GlobalHeader.svelte`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/components/layout/GlobalHeader.svelte)
- [`SurfaceCard.svelte`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/components/ui/SurfaceCard.svelte)
- [`Button.svelte`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/components/ui/Button.svelte)
- [`ThemeCardSelector.svelte`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/components/ui/ThemeCardSelector.svelte)
- [`VirtualList.svelte`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/components/ui/VirtualList.svelte)
- [`+page.svelte`](/home/mystery/misc-projects/dnd-pwa/grimar/src/routes/beta/compendium/+page.svelte)
- [`atlas.ts`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/features/compendium/atlas.ts)

## Compendium Atlas Pattern

The beta compendium route at [`/beta/compendium`](/home/mystery/misc-projects/dnd-pwa/grimar/src/routes/beta/compendium/+page.svelte) establishes the preferred pattern for dense browse views:

- One route with search, sort, scope chips, and contextual filters above the result set
- Shared page chrome and surface treatments taken from existing shell and card patterns
- Type-level emphasis expressed through semantic token mixes, not route-local hardcoded palettes
- Cards optimized for triage first, ornament second

This pattern should be reused for future search-heavy screens before inventing a new layout model.

## Interaction Rules

- Focus states must remain visible regardless of theme
- Accent glow is a highlight, not a permanent background treatment
- Motion should degrade cleanly for reduced-motion users
- Panels should preserve hierarchy through opacity, blur, and border separation rather than arbitrary color changes
- Experimental or beta pages must still render through theme tokens so every built-in and imported theme remains coherent

## Accessibility Notes

The codebase includes focus styling, toggle components, dialog primitives, and reduced-motion handling. Theme authors still need to validate contrast; the system enables accessibility but does not guarantee it automatically for imported themes.

## Related Docs

- [STYLE_GUIDE.md](/home/mystery/misc-projects/dnd-pwa/docs/STYLE_GUIDE.md)
- [THEMING_DEV.md](/home/mystery/misc-projects/dnd-pwa/docs/THEMING_DEV.md)
- [THEMING_USER.md](/home/mystery/misc-projects/dnd-pwa/docs/THEMING_USER.md)
