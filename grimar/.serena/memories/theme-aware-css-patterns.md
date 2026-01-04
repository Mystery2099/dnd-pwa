# Theme-Aware CSS Patterns for Grimar

## Core Principle

All colors must use CSS custom properties (`var(--color-*)`) or `color-mix()` expressions to ensure themability. Never use hardcoded hex, rgb, or rgba values.

## Pattern Reference

### Text Colors

```css
/* Hardcoded */
color: #f8fafc;

/* Theme-aware */
color: var(--color-text-primary);
```

### Background Colors (from theme palette)

```css
/* Hardcoded */
background-color: rgba(30, 27, 75, 0.6);

/* Theme-aware */
background-color: var(--color-bg-card);
```

### White/Black Tints (shadows, highlights)

```css
/* Hardcoded white with alpha */
rgba(255, 255, 255, 0.2)
rgba(255, 255, 255, 0.05)
rgba(255, 255, 255, 0.6)

/* Theme-aware using color-mix() */
color-mix(in srgb, var(--color-text-primary) 20%, transparent)
color-mix(in srgb, var(--color-text-primary) 5%, transparent)
color-mix(in srgb, white 60%, transparent)  /* For accent/white highlights */
```

```css
/* Hardcoded black with alpha */
rgba(0, 0, 0, 0.3)
rgba(0, 0, 0, 0.5)
rgba(0, 0, 0, 0.6)

/* Theme-aware using color-mix() */
color-mix(in srgb, black 30%, transparent)
color-mix(in srgb, black 50%, transparent)
color-mix(in srgb, black 60%, transparent)
```

### Borders

```css
/* Hardcoded */
border: 1px solid rgba(255, 255, 255, 0.1);

/* Theme-aware */
border: 1px solid var(--color-border);
```

## Common Patterns in 3D Effects

### Top Highlight Edge (light from above)

```css
inset 0 1px 0 color-mix(in srgb, var(--color-text-primary) 20%, transparent)
```

### Recessed Input Background

```css
background-color: color-mix(in srgb, black 30%, transparent);
```

### Drop Shadow for Floating

```css
box-shadow: 0 8px 40px color-mix(in srgb, black 60%, transparent);
```

### Inner Shadow for Recessed Effect

```css
box-shadow: inset 0 2px 4px color-mix(in srgb, black 50%, transparent);
```

## Anti-Patterns (Don't Use)

- `rgba(255, 255, 255, 0.X)` directly
- `rgba(0, 0, 0, 0.X)` directly
- Hardcoded hex colors (`#123456`)
- Fixed opacity values on theme colors

## Files with Theme-Aware Styles

- `grimar/src/routes/layout.css` - Base component styles (card-3d, btn-3d, etc.)
- All component `.svelte` files - Use CSS variables in class attributes

## Verification

Run `bun run check` after major changes to ensure no regressions.
