# Grimar Design System Documentation

**Version:** 1.0.0
**Last Updated:** February 2026

---

## 1. Overview

Grimar is a self-hosted, offline-capable D&D 5e PWA built with a distinctive **"Modern Arcane Aero"** aesthetic. This design system documentation covers the visual language, architecture, and implementation patterns used throughout the application.

### 1.1 Design Philosophy

The UI is designed as a **tactile, three-dimensional artifact** made of enchanted crystal and obsidian. Key principles:

- **Tactile Depth:** Elements should look and feel touchable. Buttons are convex orbs, inputs are concave insets.
- **Luminous:** Everything emits light. Shadows are colored, not black. Text has subtle halos.
- **Vibrant:** Rich color palettes with gem tones for interactive emphasis.
- **Reflective:** Polished glass surfaces with "horizon line" Aero gloss reflections.

### 1.2 Modern Constraints

While embracing the Aero aesthetic, the design avoids becoming dated:

- Glow is an accent, not the default
- Bevels are subtle (1-2 inset highlights)
- Text glow is minimal for readability
- Noise is faint (anti-plastic texture, not visible grain)
- Gradients over flat fills, kept smooth and low-bandwidth

---

## 2. Technology Stack

### 2.1 Core Technologies

| Layer | Technology |
|-------|------------|
| Framework | SvelteKit 2.x + Svelte 5 Runes |
| Styling | Tailwind CSS v4 |
| Component Primitives | bits-ui (headless components) |
| State Management | TanStack Query + Svelte 5 Runes |
| PWA | @vite-pwa/sveltekit |
| Database | SQLite + Drizzle ORM |
| Testing | Vitest + Playwright |
| Runtime | Bun |

### 2.2 CSS Architecture

The design system is implemented in a single CSS file (`layout.css`) with:

- Tailwind CSS v4 with `@theme` block for custom tokens
- CSS custom properties for theming
- Component classes in `@layer components`
- Utility classes in `@layer utilities`

---

## 3. Theming System

### 3.1 Architecture

Three-layer architecture:

1. **Theme Config** (`theme.ts`) - Zod schemas for validation
2. **Theme Registry** (`themeRegistry.ts`, `builtinThemes.ts`) - Theme data storage
3. **Theme CSS** (`layout.css`) - Visual application via CSS custom properties

### 3.2 Theme Application

Themes are applied via `data-theme` attribute on `<html>`:

```html
<html data-theme="amethyst">
```

### 3.3 Built-in Themes (13 Total)

| Theme | Description | Accent Color | Display Font |
|-------|-------------|--------------|--------------|
| **Amethyst** | Deep mystical purple (default) | `#a855f7` | Quicksand |
| **Arcane** | Gold runes on dark leather | `#fbbf24` | Cinzel |
| **Nature** | Bioluminescence in the dark | `#4ade80` | DM Serif Display |
| **Fire** | Magma flowing over stone | `#f97316` | Teko |
| **Ice** | Deep freeze crystalline | `#67e8f9` | Outfit |
| **Void** | Cosmic emptiness | `#c084fc` | Space Grotesk |
| **Ocean** | Mariana Trench depths | `#14b8a6` | Montserrat |
| **Beach** | Sand & ocean waves | `#22d3ee` | Bebas Neue |
| **Necropolis** | Bone & spirit | `#84cc16` | Crimson Text |
| **Charmed** | Rose quartz & love potion | `#f472b6` | Quicksand |
| **Divine** | Celestial bronze | `#facc15` | Cinzel |
| **Underdark** | Deep slate & spore | `#818cf8` | Uncial Antiqua |

### 3.4 Theme Variables

Each theme defines these CSS custom properties:

```css
/* Core Colors */
--theme-bg-canvas: /* Main background */
--theme-bg-card: /* Card backgrounds */
--theme-bg-overlay: /* Modal/dropdown backgrounds */
--theme-accent: /* Primary accent */
--theme-accent-glow: /* Glow effects */
--theme-accent-rgb: /* RGB values for transparency */

/* Text Colors */
--theme-text-primary: /* Main text */
--theme-text-secondary: /* Secondary text */
--theme-text-muted: /* Muted/disabled text */

/* Borders */
--theme-border: /* Default borders */
--theme-border-hover: /* Hover state borders */

/* Typography */
--theme-font-display: /* Heading font */
--theme-font-body: /* Body font */

/* Animation */
--theme-ease-smooth: /* Easing function */
--theme-duration-fast: /* Fast duration */
--theme-duration-slow: /* Slow duration */

/* Visual Effects */
--theme-noise-opacity: /* Noise texture intensity */
--theme-border-separator: /* Separator line style */
```

---

## 4. Materials (The Physics of Magic)

The design system defines three core materials:

### 4.1 Arcane Glass

Standard container material. Looks like thick glass floating in air.

```css
.card-crystal {
  background-color: var(--color-bg-card);  /* 60-80% opacity */
  backdrop-filter: blur(12px);
  
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--color-text-primary) 20%, transparent),
    inset 1px 0 0 color-mix(in srgb, var(--color-text-primary) 8%, transparent),
    inset -1px 0 0 color-mix(in srgb, var(--color-text-primary) 8%, transparent),
    0 8px 32px color-mix(in srgb, black 60%, transparent);
}
```

**Characteristics:**
- 60-80% opacity
- Top border is bright white (light source)
- Bottom border is dark (shadow)
- Subtle white gradient on top 40%

### 4.2 Obsidian

Darker, heavier glass for navigation and static areas.

```css
.panel-3d {
  background-color: var(--color-bg-card);
  backdrop-filter: blur(16px);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--color-text-primary) 20%, transparent),
    0 8px 40px color-mix(in srgb, black 60%, transparent);
}
```

**Characteristics:**
- 90% opacity (almost solid)
- Subtle noise texture to mimic stone

### 4.3 Ether

Active/hover state material. "Liquid light" effect.

```css
.list-row:hover {
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
}
```

---

## 5. Color System

### 5.1 Gemstone Accents

Used for spell schools and semantic meaning (not rarity):

| Gem | Color | Usage |
|-----|-------|-------|
| 🔴 **Ruby** | `#f472b6` | Evocation/Attack |
| 🔵 **Sapphire** | `#38bdf8` | Protection/Abjuration |
| 🟢 **Emerald** | `#4ade80` | Healing/Necromancy |
| 🟣 **Amethyst** | `#c084fc` | Illusion/Charm |
| 🟡 **Topaz** | `#fbbf24` | Divination/Legendary |
| ⚪ **Pearl** | `#f8fafc` | Neutral/White |

### 5.2 Semantic Color Tokens

```css
--color-gem-ruby: var(--theme-gem-ruby, #f472b6);
--color-gem-sapphire: var(--theme-gem-sapphire, #38bdf8);
--color-gem-emerald: var(--theme-gem-emerald, #4ade80);
--color-gem-amethyst: var(--theme-gem-amethyst, #c084fc);
--color-gem-topaz: var(--theme-gem-topaz, #fbbf24);
--color-gem-pearl: var(--theme-gem-pearl, #f8fafc);
```

### 5.3 Rarity Expression

Rarity is expressed by **border/glow intensity**, not color:

```css
/* Common - subtle */
.list-item { border: 1px solid var(--color-border); }

/* Rare - glowing */
.btn-gem { box-shadow: 0 0 12px var(--color-accent-glow); }

/* Featured - pulsing */
.featured { animation: var(--animate-pulse-slow); }
```

---

## 6. Typography

### 6.1 Font Stack

Primary fonts are defined per-theme, with fallbacks:

```css
--font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
--font-display: var(--theme-font-display);
--font-body: var(--theme-font-body);
```

### 6.2 Holo-Glow Effect

Text appears projected inside glass:

```css
.text-holo {
  text-shadow:
    0 0 12px var(--color-accent-glow),
    0 2px 4px color-mix(in srgb, black 80%, transparent);
}
```

### 6.3 Typographic Hierarchy

| Element | Style | Treatment |
|---------|-------|-----------|
| H1-H6 | Bold, tight tracking | White with optional purple glow |
| Data Labels | Uppercase, wide tracking | `opacity: 0.7` |
| Body Text | Regular weight | No glow (rely on contrast) |
| Links | Underlined or color shift | Subtle affordance |

---

## 7. Component Patterns

### 7.1 Buttons

**Gem Button** (`btn-gem`): Pill-shaped with vertical gradient:

```css
.btn-gem {
  border-radius: 9999px;
  background: linear-gradient(180deg, var(--color-accent) 0%, 
    color-mix(in srgb, var(--color-accent) 70%, black) 100%);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--color-text-inverted) 40%, transparent),
    0 2px 4px color-mix(in srgb, black 30%, transparent),
    0 0 12px var(--color-accent-glow);
}
```

**3D Button** (`btn-3d`): Rectangular with beveled edges:

```css
.btn-3d {
  border-radius: 8px;
  background: linear-gradient(180deg,
    color-mix(in srgb, var(--color-text-primary) 12%, var(--color-bg-card)) 0%,
    color-mix(in srgb, var(--color-text-primary) 5%, var(--color-bg-card)) 100%);
}
```

### 7.2 Cards

**Crystal Card** (`card-crystal`): Primary container:

```css
.card-crystal {
  border-radius: 16px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-card);
  backdrop-filter: blur(12px);
}
```

**3D Card** (`card-3d`): Simpler variant:

```css
.card-3d {
  border-radius: 12px;
  background-color: var(--color-bg-card);
  backdrop-filter: blur(8px);
}
```

### 7.3 Inputs

**Crystal Input** (`input-crystal`): Carved into glass surface:

```css
.input-crystal {
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: color-mix(in srgb, black 40%, transparent);
  box-shadow:
    inset 0 2px 4px color-mix(in srgb, black 50%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--color-text-primary) 5%, transparent);
}
```

**Recessed Input** (`input-recessed`): Deeper inset:

```css
.input-recessed {
  border-radius: 8px;
  background-color: color-mix(in srgb, black 30%, transparent);
  box-shadow: inset 0 2px 4px color-mix(in srgb, black 50%, transparent);
}
```

### 7.4 Panels

**Inset Panel** (`panel-inset`): Engraved area for stat blocks:

```css
.panel-inset {
  border-radius: 12px;
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, black 20%, transparent);
  box-shadow: inset 0 2px 4px color-mix(in srgb, black 40%, transparent);
}
```

### 7.5 List Patterns

**List Row** (`list-row`): Interactive list item:

```css
.list-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  transition: all 200ms;
}

.list-row:hover {
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
}
```

**List Item** (`list-item`): Card-style clickable item:

```css
.list-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
}
```

### 7.6 Toggle

Skeuomorphic toggle with glow:

```css
.toggle-thumb {
  background: var(--theme-accent);
  box-shadow: 0 0 10px var(--theme-accent-glow);
}

.toggle-track.toggle-checked {
  background: rgba(var(--theme-accent-rgb), 0.4);
  border-color: var(--theme-accent);
}
```

---

## 8. Animation System

### 8.1 Keyframes

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| `shimmer` | 3s linear infinite | Linear | Aero shine sweep |
| `float` | 6s ease-in-out infinite | Smooth | Floating elements |
| `slide-up-fade` | 0.5s | `cubic-bezier(0.16, 1, 0.3, 1)` | Enter animations |
| `pulse-glow` | 3s infinite | `cubic-bezier(0.4, 0, 0.6, 1)` | Featured items |
| `arcane-particles` | 15s infinite | Ease-in-out | Background particles |
| `arcane-materialize` | 0.6s | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Panel appearance |
| `rune-activate` | 0.3s ease-out | Standard | Toggle activation |
| `energy-flow` | 1.5s linear infinite | Linear | Rotating energy |
| `aura-pulse` | 2s infinite | Ease-in-out | Selected items |

### 8.2 Transition Patterns

```css
/* Standard transition */
transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);

/* Hover lift */
transform: translateY(-2px);

/* Active press */
transform: translateY(1px);
```

### 8.3 Reduced Motion

All animations should respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Visual Effects

### 9.1 Noise Texture

Applied via `::before` pseudo-element on `body`:

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,...");
}
```

### 9.2 Aero Shine

Glossy reflection effect:

```css
.aero-shine {
  background: linear-gradient(
    to right,
    color-mix(in srgb, var(--color-text-primary) 0%, transparent) 0%,
    color-mix(in srgb, var(--color-text-primary) 10%, transparent) 50%,
    color-mix(in srgb, var(--color-text-primary) 0%, transparent) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 3s linear infinite;
}
```

### 9.3 Background Gradient

Canvas background with radial gradient:

```css
body {
  background: radial-gradient(
    circle at 50% 0%,
    var(--theme-bg-card),
    var(--theme-bg-canvas)
  );
}
```

---

## 10. Settings Panel Components

### 10.1 Arcane Panel

Mystical panel for settings sections:

```css
.arcane-panel {
  border-radius: 16px;
  border: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-bg-card) 80%, transparent);
  backdrop-filter: blur(16px);
  animation: arcane-materialize 0.6s forwards;
}

.arcane-panel::before {
  /* Gradient line at top */
  background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
}

.arcane-panel::after {
  /* Corner decoration */
  border-top: 2px solid color-mix(in srgb, var(--color-accent) 50%, transparent);
  border-right: 2px solid color-mix(in srgb, var(--color-accent) 50%, transparent);
}
```

### 10.2 Runic Row

Settings row with icon and hover glow:

```css
.runic-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}

.runic-row:hover .runic-label {
  color: var(--color-accent);
}

.runic-row:hover .runic-indicator {
  text-shadow: 0 0 8px var(--color-accent-glow);
}
```

### 10.3 Runic Seal Toggle

Mystical toggle button:

```css
.runic-seal {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  border: 2px solid var(--color-border);
  background: color-mix(in srgb, black 30%, transparent);
}

.runic-seal[data-state='checked'] {
  background: color-mix(in srgb, var(--color-accent) 20%, transparent);
  border-color: var(--color-accent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--color-accent) 30%, transparent);
}
```

### 10.4 Runestone Card

Selectable option card:

```css
.runestone {
  border-radius: 12px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  border: 1px solid var(--color-border);
  background: linear-gradient(145deg,
    color-mix(in srgb, var(--color-bg-card) 80%, transparent) 0%,
    color-mix(in srgb, black 20%, transparent) 100%);
}

.runestone[data-state='selected'] {
  border-color: var(--color-accent);
  background: linear-gradient(145deg,
    color-mix(in srgb, var(--color-accent) 12%, transparent) 0%,
    color-mix(in srgb, var(--color-accent) 5%, transparent) 100%);
}
```

### 10.5 Theme Nexus

Circular theme selector visualization:

```css
.theme-nexus {
  width: 280px;
  height: 280px;
  position: relative;
}

.theme-nexus-center {
  /* Central glowing orb */
  width: 80px;
  height: 80px;
  border-radius: 9999px;
  border: 2px solid var(--color-accent);
  box-shadow: 0 0 24px color-mix(in srgb, var(--color-accent) 30%, transparent);
}

.theme-nexus-orb {
  /* Orbiting theme buttons */
  width: 48px;
  height: 48px;
  border-radius: 9999px;
}
```

---

## 11. Responsive Design

### 11.1 Breakpoints

Uses Tailwind's default breakpoints:

| Breakpoint | Width |
|------------|-------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

### 11.2 Settings Layout

```css
.settings-container {
  display: grid;
  grid-template-columns: 240px 1fr;
  max-width: 1200px;
  gap: 2rem;
}

@media (max-width: 1024px) {
  .settings-container {
    grid-template-columns: 1fr;
  }
  
  .settings-nav {
    flex-direction: row;
    overflow-x: auto;
  }
}

@media (max-width: 640px) {
  .settings-nav-item .nav-label {
    display: none; /* Icon-only navigation */
  }
}
```

---

## 12. Accessibility

### 12.1 Color Contrast

- Text colors meet WCAG AA contrast ratios
- Muted text is used decorative purposes only
- Interactive elements have clear focus states

### 12.2 Focus Indicators

```css
.input-crystal:focus {
  outline: none;
  box-shadow:
    inset 0 2px 4px color-mix(in srgb, black 50%, transparent),
    inset 0 0 0 2px var(--color-accent);
}
```

### 12.3 Reduced Motion

All animations respect `prefers-reduced-motion` media query.

---

## 13. File Structure

```
grimar/src/
├── routes/
│   ├── layout.css          # Main design system CSS
│   └── +layout.svelte      # Root layout with theme script
├── lib/
│   ├── components/
│   │   ├── layout/         # AppShell, GlobalHeader, Navigation
│   │   └── ui/             # SurfaceCard, Button, Toggle, etc.
│   └── core/
│       ├── client/
│       │   ├── themeStore.svelte.ts   # Theme state management
│       │   ├── builtinThemes.ts       # Built-in theme definitions
│       │   └── themeRegistry.ts       # Theme CRUD operations
│       └── types/
│           └── theme.ts               # Zod schemas for themes
```

---

## 14. Related Documentation

- [STYLE_GUIDE.md](./STYLE_GUIDE.md) - Visual styling guide for the Arcane Aero aesthetic
- [THEMING_DEV.md](./THEMING_DEV.md) - Developer guide for adding new themes
- [THEMING_USER.md](./THEMING_USER.md) - User guide for theme management