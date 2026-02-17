# Theme System - Developer Guide

This document explains how to add new built-in global themes to the Grimar D&D PWA.

## Architecture Overview

The theme system has three layers:

1. **Theme Config** (`theme.ts`) - Zod schemas defining valid theme structures
2. **Theme Registry** (`themeRegistry.ts`, `builtinThemes.ts`) - Theme data storage
3. **Theme CSS** (`layout.css`, `themeCSS.ts`) - Visual application via CSS custom properties

**How it works:**
- Built-in themes have pre-defined CSS in `layout.css` for instant loading
- User-created/imported themes are injected via JavaScript at runtime
- Theme is applied via `data-theme` attribute on `<html>` element

## Adding a New Built-in Theme

### Step 1: Add Theme to `builtinThemes.ts`

Add a new entry to the `BUILTIN_THEMES` array following this structure:

```typescript
{
  id: 'theme-id',
  name: 'Theme Name',
  description: 'Short description',
  source: 'builtin',
  icon: Sparkles,  // Lucide icon component
  colors: {
    bgCanvas: '#000000',
    bgCard: 'rgba(0, 0, 0, 0.5)',
    bgOverlay: 'rgba(0, 0, 0, 0.7)',
    accent: '#ffffff',
    accentGlow: 'rgba(255, 255, 255, 0.5)',
    accentRgb: '255, 255, 255',
    bgOverlayRgb: '0, 0, 0',
    textPrimary: '#ffffff',
    textSecondary: '#cccccc',
    textMuted: '#888888',
    textInverted: '#000000',
    border: 'rgba(255, 255, 255, 0.15)',
    borderHover: 'rgba(255, 255, 255, 0.3)',
    shadow: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(255, 255, 255, 0.1)',
    overlayDark: 'rgba(0, 0, 0, 0.3)',
    effectUrl: ''
  },
  typography: {
    display: 'Font Name, serif',
    body: 'Font Name, sans-serif'
  },
  animation: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    duration: { fast: 150, slow: 300 }
  },
  visualEffects: {
    noiseOpacity: 0.03,
    borderSeparator: 'none'
  }
}
```

### Step 2: Add CSS Variables to `layout.css`

Copy an existing theme block and update values:

```css
/* Theme Name - Description */
[data-theme='theme-id'] {
  --theme-bg-canvas: #000000;
  --theme-bg-card: rgba(0, 0, 0, 0.5);
  --theme-bg-overlay: rgba(0, 0, 0, 0.7);
  --theme-accent: #ffffff;
  --theme-accent-glow: rgba(255, 255, 255, 0.5);
  --theme-accent-rgb: 255, 255, 255;
  --theme-bg-overlay-rgb: 0, 0, 0;
  --theme-gem-ruby: #f472b6;
  --theme-gem-sapphire: #38bdf8;
  --theme-gem-emerald: #4ade80;
  --theme-gem-amethyst: #c084fc;
  --theme-gem-topaz: #fbbf24;
  --theme-text-primary: #ffffff;
  --theme-text-secondary: #cccccc;
  --theme-text-muted: #888888;
  --theme-text-inverted: #000000;
  --theme-shadow: rgba(0, 0, 0, 0.5);
  --theme-overlay-light: rgba(255, 255, 255, 0.1);
  --theme-overlay-dark: rgba(0, 0, 0, 0.3);
  --theme-border: rgba(255, 255, 255, 0.15);
  --theme-border-hover: rgba(255, 255, 255, 0.3);
  --theme-effect-url: '';

  /* Typography */
  --theme-font-display: 'Font Name', serif;
  --theme-font-body: 'Font Name', sans-serif;

  /* Animation */
  --theme-ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --theme-duration-fast: 150ms;
  --theme-duration-slow: 300ms;

  /* Visual Effects */
  --theme-noise-opacity: 0.03;
  --theme-border-separator: none;
}
```

### Step 3: Add Theme Metadata to `themes.ts`

Add to `THEMES` array:

```typescript
{ id: 'theme-id', name: 'Theme Name', description: 'Description', icon: Sparkles }
```

Add to `THEME_GRADIENTS`:

```typescript
themeId: 'from-color-500/20 to-color-500/20'
```

Add to `getThemeAccentClass`:

```typescript
themeId: 'text-color-400'
```

## Theme Color Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `bgCanvas` | Main background | `#0f172a` |
| `bgCard` | Card backgrounds (supports alpha) | `rgba(30, 27, 75, 0.6)` |
| `bgOverlay` | Modal/dropdown backgrounds | `rgba(49, 46, 129, 0.8)` |
| `accent` | Primary accent color | `#a855f7` |
| `accentGlow` | Glow effects | `rgba(168, 85, 247, 0.5)` |
| `accentRgb` | RGB for effects | `168, 85, 247` |
| `textPrimary` | Main text | `#f8fafc` |
| `textSecondary` | Secondary text | `#94a3b8` |
| `textMuted` | Muted/disabled text | `#64748b` |
| `border` | Default borders | `rgba(255, 255, 255, 0.15)` |
| `borderHover` | Hover state borders | `rgba(255, 255, 255, 0.3)` |

## Animation Easing Reference

| Style | Value |
|-------|-------|
| Standard | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Bouncy | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Elastic | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` |

## File Locations

- `grimar/src/lib/core/types/theme.ts` - Zod schemas
- `grimar/src/lib/core/client/builtinThemes.ts` - Built-in theme data
- `grimar/src/lib/core/client/themes.ts` - Theme metadata and helpers
- `grimar/src/lib/core/client/themeRegistry.ts` - Theme management functions
- `grimar/src/routes/layout.css` - CSS custom properties
