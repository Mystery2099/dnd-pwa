# Arcane Aero Style Guide

## Intent

The Grimar interface should feel like a polished magical instrument: dark surfaces, luminous accents, glass depth, and restrained motion. This guide covers the visual language; the design system doc covers implementation structure.

## Visual Direction

- Dark canvas with localized light rather than flat black
- Frosted or glossy panels instead of flat cards
- Accent color reserved for intent, selection, focus, and status
- Typography that feels deliberate without reducing readability

## Materials

### Arcane Glass

Use for primary content surfaces.

- Semi-transparent
- Blurred backdrop
- Subtle top highlight
- Soft edge separation

### Obsidian

Use for navigation, side panels, and denser utility surfaces.

- Darker and more opaque than Arcane Glass
- Lower visual noise than content panels
- Stable backdrop for navigation and controls

### Ether

Use for hover and selected states.

- Accent-tinted wash or glow
- Never strong enough to reduce text contrast

## Color Usage

Theme tokens, not hardcoded colors, should drive the interface.

Accent hues commonly represent:

- ruby: destructive or attack-oriented emphasis
- sapphire: information or defensive emphasis
- emerald: success or content emphasis
- amethyst: default magical accent
- topaz: highlight or premium emphasis
- pearl: neutral emphasis

Rarity or hierarchy should come from intensity, border treatment, and motion, not random hue changes.

## Typography

- Display typography can be expressive per theme
- Body typography must remain highly readable
- Body copy should not use aggressive glow
- Headings may use a subtle halo if contrast remains strong

## Components

### Buttons

- Rounded, dense, and tactile
- Gradient or shine is acceptable when it supports hierarchy
- Pressed states should visibly depress or darken

### Inputs

- Slightly inset treatment is preferred
- Border and background must remain visible on all themes
- Focus styling must be stronger than hover styling

### Cards and Lists

- Lists should read as structured data first, ornament second
- Cards may carry more atmosphere than list rows
- Avoid stacking too many decorative effects on dense data views

### Dialogs and Overlays

- Use blur and opacity to separate layers
- Keep chrome restrained so content remains dominant

## Motion

- Prefer short hover lifts, fade-ins, and accent sweeps
- Avoid continuous motion on primary controls
- Respect `prefers-reduced-motion`

## Anti-Patterns

- Flat default-gray UI that ignores theme tokens
- Permanent glow on large surfaces
- Hardcoded purple styles outside the theme layer
- Decorative effects that lower legibility
- Theme-specific component hacks instead of tokenized styling

## References

- [`layout.css`](/home/mystery/misc-projects/dnd-pwa/grimar/src/routes/layout.css)
- [`Button.svelte`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/components/ui/Button.svelte)
- [`SurfaceCard.svelte`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/components/ui/SurfaceCard.svelte)
- [`ThemeCardSelector.svelte`](/home/mystery/misc-projects/dnd-pwa/grimar/src/lib/components/ui/ThemeCardSelector.svelte)
