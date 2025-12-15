# 🔮 Arcane Design System

**Version:** 1.0.0
**Theme Philosophy:** "Modern Arcane Aero." A modern UI foundation (clean spacing, clarity, accessibility) with selective Frutiger Aero influences (gloss reflections, beveled glass depth, gemstone accents).

**Document Roles:**
  * This document is the **authoritative** source for tokens, states, motion rules, accessibility, and component conventions.
  * `docs/STYLE_GUIDE.MD` provides **visual recipes** (shine/noise/bevel examples) that should be applied through these tokens.

### Consistency Contract (Design System ↔ Style Guide)

  * **Single source of truth:**
    * **Tokens, semantics, component states, motion rules, accessibility:** this document
    * **Visual recipes and examples (shine/bevel/noise):** `docs/STYLE_GUIDE.MD`
  * **If they disagree:**
    * **Semantics + accessibility win** over aesthetics.
    * The Style Guide may propose a look, but it must map cleanly onto tokens and states defined here.

### Terminology Mapping

| Concept | Design System token / term | Style Guide term | Notes |
| :--- | :--- | :--- | :--- |
| **App background** | `bg.app` | Deep Weave spotlight | Radial gradient spotlight behind everything |
| **Main card surface** | `surface.card` | Arcane Glass | Primary content container (spell cards, detail panels) |
| **Navigation / shell surface** | `surface.canvas` | Obsidian | Darker/heavier regions (sidebar, header, filter rail) |
| **Overlays** | `surface.overlay` | Overlay / Modal glass | Dialogs, dropdowns, tooltips |
| **Hover fill / “liquid light”** | Hover/selected state rules | Ether | Expressed via hover/selected state + subtle gradients |
| **Gloss reflection** | Optional visual layer on surfaces | Aero shine | Implement as a pseudo-element or overlay class (Style Guide) |

-----

## 0\. Design Principles

  * **Clarity beats flair:** Spells are text-heavy; readability is non-negotiable.
  * **Depth via layers, not noise:** Use the 3 glass materials instead of inventing new surface styles.
  * **Motion communicates state:** Animations exist to confirm interactions and state changes.
  * **Consistent semantics:** Prefer named meanings (primary/secondary, canvas/card/overlay, rarity tiers) over one-off styling.
  * **Accessible by default:** Keyboard focus is always visible, and reduced-motion is respected.

### 0.1 Component Inventory (What This Design System Covers)

  * **Layout:** app shell, header, sidebar, content region
  * **Navigation:** tabs, breadcrumbs (optional), back actions
  * **Surfaces:** canvas, card, overlay
  * **Controls:** buttons, inputs, selects, toggles, chips/badges
  * **Feedback:** loading, empty, error, toast/notice (optional)
  * **Data display:** spell list rows, detail panels, stats blocks

### 0.2 Naming Conventions

  * **Tokens:** `surface.*`, `text.*`, `border.*`, `brand.*`, `bg.*`
  * **Components:** PascalCase Svelte components (e.g. `SpellCard.svelte`, `AppShell.svelte`)
  * **Variants:** use human names over numbers (e.g. `primary`, `secondary`, `ghost`, `danger`)

-----

## 1\. Core Foundations

### 1.1 Typography

We use **Inter** for its clean legibility on screens, vital for reading dense spell descriptions.

  * **Font Family:** `Inter`, `system-ui`, `sans-serif`
  * **Scale:**
      * **Display:** `text-5xl md:text-6xl` | Weight: `800` | *Application Titles*
      * **Heading 1:** `text-3xl` | Weight: `700` | *Major Section Headers*
      * **Heading 2:** `text-xl` | Weight: `600` | *Card Titles*
      * **Body:** `text-base` (16px) | Weight: `400` | *Spell Descriptions*
      * **Label:** `text-xs` | Weight: `700` | *UI Badges, Stat Labels*

### 1.1a Iconography

Icons should be used sparingly and consistently.

  * **Style:** 1 consistent icon set (recommended: Lucide)
  * **Sizing:** `size-4` (inline), `size-5` (button), `size-6` (feature)
  * **Color:** match semantic text (`text-gray-300`) unless representing rarity/semantic state
  * **Do not:** mix multiple icon families

### 1.2 Color Palette

We do not use flat colors. We use gradients, gemstone accents, and layered glass.

**Primary Brand (The Weave):**

  * **Gradient:** `bg-linear-to-r from-purple-600 via-violet-600 to-indigo-600`
  * **Glow:** `shadow-purple-500/50`

**Backgrounds (The Deep Weave):**

  * **App Background (preferred):** `radial-gradient(circle at 50% 0%, #2e1065, #0f172a)`
      * *Tailwind concept:* a dark base with a subtle top spotlight; keep it readable

**Accent System (Spell Schools):**
Use these for spell school badges, left borders, small highlights, and icons.

  * 🔴 **Evocation/Attack:** `text-rose-400` / `border-rose-500/60`
  * 🔵 **Abjuration/Protection:** `text-sky-400` / `border-sky-500/60`
  * 🟢 **Necromancy/Healing:** `text-emerald-400` / `border-emerald-500/60`
  * 🟣 **Illusion/Charm:** `text-purple-400` / `border-purple-500/60`
  * 🟡 **Divination/Utility:** `text-amber-400` / `border-amber-500/60`

**Rarity System (Structural):**
Rarity should be expressed primarily through border intensity + subtle glow, not completely different palettes.

  * ⚪ **Common:** `border-gray-500` / `text-gray-400`
  * 🟢 **Uncommon:** `border-emerald-500` / `text-emerald-400`
  * 🔵 **Rare:** `border-cyan-500` / `text-cyan-400`
  * 🟣 **Very Rare:** `border-purple-500` / `text-purple-400`
  * 🟠 **Legendary:** `border-amber-500` / `text-amber-400` (Prefer `animate-pulse-slow` for featured items)

### 1.3 Semantic Color Mapping (Tokens)

These are the “default answers” so you don’t have to invent colors each time. Prefer semantic tokens over ad-hoc colors.

| Token | Use for | Tailwind / Composition |
| :--- | :--- | :--- |
| **bg.app** | App background | `bg-[radial-gradient(circle_at_50%_0%,#2e1065,#0f172a)]` |
| **surface.canvas** | Large regions (layout shell, sidebars) | `bg-gray-950/40 border border-white/5` |
| **surface.card** | Main content cards (spell list rows/cards) | `bg-gray-800/60 border border-white/10 shadow-lg` |
| **surface.overlay** | Modals, dropdowns, popovers | `bg-gray-700/80 border border-white/20 shadow-2xl` |
| **text.primary** | Main text | `text-gray-100` |
| **text.secondary** | Less prominent text | `text-gray-300` |
| **text.muted** | Meta text, hints | `text-gray-400` |
| **text.disabled** | Disabled states | `text-gray-600` |
| **border.subtle** | Default borders on glass | `border-white/10` |
| **border.focus** | Focus outlines / rings | `focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500` |
| **brand.gradient** | Primary brand surface | `bg-linear-to-r from-purple-600 via-violet-600 to-indigo-600` |
| **brand.glow** | Brand glow shadow | `shadow-purple-500/30` |
| **accent.school.evocation** | School accent | `text-rose-400 border-rose-500/60` |
| **accent.school.abjuration** | School accent | `text-sky-400 border-sky-500/60` |
| **accent.school.necromancy** | School accent | `text-emerald-400 border-emerald-500/60` |
| **accent.school.illusion** | School accent | `text-purple-400 border-purple-500/60` |
| **accent.school.divination** | School accent | `text-amber-400 border-amber-500/60` |

#### Interaction State Color Rules

Keep states consistent across components.

  * **Hover:** Increase brightness/contrast subtly
    * `hover:bg-white/10` or `hover:border-white/20`
  * **Active/Pressed:** Scale down slightly + reduce shadow
    * `active:scale-95`
  * **Selected:** Border shifts toward brand + soft glow
    * `border-purple-400/50 shadow-[0_0_16px_rgba(139,92,246,0.25)]`
  * **Focus (keyboard):** Visible ring always
    * `focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:outline-none`

### 1.4 Layout, Spacing, and Density

Use a small set of spacing rules so the UI stays consistent.

  * **Base unit:** 4px (Tailwind spacing scale)
  * **Preferred paddings:**
    * **Cards:** `p-4` (dense) or `p-6` (comfortable)
    * **Sections:** `py-6`–`py-10`
  * **Gaps:**
    * **Inline controls:** `gap-2`
    * **Form rows / filters:** `gap-3` / `gap-4`
    * **Card grids:** `gap-4` / `gap-6`
  * **Rounded corners:**
    * **Cards/inputs/buttons:** `rounded-xl`
    * **Badges/chips:** `rounded-full`

### 1.5 Responsive Breakpoints (Guidance)

Design mobile-first; scale up for desktop.

  * **Primary breakpoints:** `sm`, `md`, `lg`
  * **Spell list:** single column on mobile; split list/detail on `md+` if desired
  * **Typography:** keep body at `text-base`; use `md:` for display sizing

### 1.6 Accessibility (Baseline)

  * **Focus:** use `focus-visible:*` rings, not just color changes.
  * **Contrast:** ensure body text remains readable on glass surfaces.
  * **Reduced motion:** non-essential animation must be disabled with `motion-reduce:*`.
  * **Hover is not a requirement:** any hover-only affordance must have a non-hover equivalent.

### 1.7 Theme Modes (Light/Dark/System)

The product supports theme switching. The design system is dark-first.

  * **Dark mode:** default; use the glass materials as defined.
  * **Light mode:** keep the same hierarchy but lighten surfaces and reduce blur intensity if readability suffers.
  * **System mode:** mirror OS preference.
  * **Rule:** theme changes should not change layout, spacing, or component behavior.

-----

## 2\. Materials (Glassmorphism)

To maintain depth, we define three specific "materials" based on hierarchy. Avoid solid opaque backgrounds.

| Material Level | Class Composition | Usage |
| :--- | :--- | :--- |
| **Level 1: Canvas** | `bg-gray-950/40 backdrop-blur-sm border border-white/5` | Large containers, Sidebars. |
| **Level 2: Card** | `bg-gray-800/60 backdrop-blur-md border border-white/10 shadow-lg` | Spell Cards, Inventory Slots. |
| **Level 3: Overlay** | `bg-gray-700/80 backdrop-blur-xl border border-white/20 shadow-2xl` | Modals, Tooltips, Dropdowns. |

### 2.1 Elevation, Shadows, and Z-Index

Keep layering predictable.

  * **Elevation:**
    * Canvas: no glow by default
    * Card: `shadow-lg`
    * Overlay: `shadow-2xl`
  * **Z-index guidance:**
    * Sticky header/filter bar: `z-10`
    * Dropdowns/tooltips: `z-20`
    * Modals: `z-30`
    * Toasts/critical overlays: `z-40`

-----

## 3\. UI Component Library

### 3.1 Buttons

Buttons should feel tactile.

  * **Primary (Cast Spell):**
    ```html
    <button class="bg-linear-to-r from-purple-600 to-indigo-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all">
      Cast Fireball
    </button>
    ```
  * **Secondary (Cancel/Back):**
    ```html
    <button class="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 py-2 px-6 rounded-xl backdrop-blur-sm transition-all">
      Cancel
    </button>
    ```

### 3.2 Inputs (The "Crystal" Look)

Inputs should look like etched glass.

  * **Base Style:**
    `bg-gray-900/50 border border-purple-500/30 text-white rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 placeholder-gray-500 backdrop-blur-sm transition-all`

### 3.3 Badges (Pills)

Used for Spell School, Level, or Components.

  * **Structure:** `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`
  * **Glass Variant:** `bg-white/10 text-white border border-white/10`

### 3.4 Copy/Paste Class Bundles

Use these bundles to keep the UI consistent without thinking too hard.

  * **Base transition (apply broadly):**
    `transition-all duration-200 ease-out motion-reduce:transition-none`

  * **App shell background:**
    `min-h-dvh bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-gray-100`

  * **Glass: Canvas (Level 1):**
    `bg-gray-950/40 backdrop-blur-sm border border-white/5`

  * **Glass: Card (Level 2):**
    `bg-gray-800/60 backdrop-blur-md border border-white/10 shadow-lg`

  * **Glass: Overlay (Level 3):**
    `bg-gray-700/80 backdrop-blur-xl border border-white/20 shadow-2xl`

  * **Arcane card hover:**
    `group hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:border-purple-400/50`

  * **Primary button (Cast Spell):**
    `bg-linear-to-r from-purple-600 to-indigo-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95`

  * **Secondary button:**
    `bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 py-2 px-6 rounded-xl backdrop-blur-sm`

  * **Input (Crystal):**
    `bg-gray-900/50 border border-purple-500/30 text-white rounded-xl placeholder-gray-500 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:outline-none focus:border-purple-500`

  * **Badge (Glass):**
    `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white border border-white/10`

### 3.5 Component States (Shared Rules)

Define state styling once and reuse it everywhere.

  * **Default:** readable text + subtle border
  * **Hover:** slight brighten + optional arcane glow for cards
  * **Active/Pressed:** `active:scale-95`
  * **Selected:** `border-purple-400/50` + soft glow
  * **Disabled:** reduce contrast and block interaction
    * `opacity-50 pointer-events-none`
  * **Error:** use a clear semantic accent (avoid making errors purple)
    * `border-red-500/40 text-red-200`

### 3.6 Loading, Empty, and Error States

These states should feel intentional and on-brand.

  * **Loading:** prefer skeletons or subtle pulse on placeholders
    * `animate-pulse motion-reduce:animate-none`
  * **Empty:** include a helpful message and a suggested next action
    * e.g., “No spells match these filters. Clear filters.”
  * **Error:** short explanation + retry affordance
    * Use error color accents (red), not brand purple

### 3.7 Content Styling (Spell Descriptions / Markdown)

Spell detail content is dense. Treat it like reading mode.

  * **Line length:** prefer readable widths on desktop (avoid ultra-wide paragraphs)
  * **Typography:** use the Tailwind typography plugin (`prose`) if helpful, but keep it themed
  * **Links:** should look clickable without being neon
  * **Code blocks:** if present, use subtle contrast (don’t break the “glass” feel)

-----

## 4\. "Fun" Interactions & Micro-Animations

### 4.0 Motion System (Rules)

Motion should feel like “arcane UI feedback,” not like a game UI. Prefer subtle transforms + opacity. Avoid animating layout where possible.

#### Timing Defaults

  * **Micro interactions (hover/press):** `150ms`–`200ms` (`duration-150` / `duration-200`)
  * **Surface transitions (expand/collapse, drawers):** `200ms`–`300ms`
  * **Modal entrance/exit:** `250ms`–`350ms`
  * **Easing:** `ease-out` for entering, `ease-in` for exiting

#### What to Animate

  * **Preferred:** `transform`, `opacity`, `filter: drop-shadow` (small)
  * **Use sparingly:** `box-shadow` (keep subtle), `backdrop-blur` (avoid animating blur strength)
  * **Avoid:** animating `height/width/top/left` unless necessary

#### Reduced Motion (Accessibility)

Always include a reduced-motion path for non-essential animation.

  * **Tailwind patterns:**
    * `motion-reduce:transition-none`
    * `motion-reduce:transform-none`
    * `motion-reduce:animate-none`

#### Motion Do/Don’t

  * **Do:** use micro-motion to confirm clicks, focus, selection.
  * **Do:** keep animations short and intentional.
  * **Don’t:** animate everything; reserve pulse/glow for rarity or key emphasis.
  * **Don’t:** rely on animation to communicate critical information.

### 4.0a Animation Usage Matrix

| UI Element | Animation | When | Notes |
| :--- | :--- | :--- | :--- |
| **Buttons** | `hover:scale-105 active:scale-95` | Always | Keep subtle; don’t stack pulse on primary buttons |
| **Cards** | Arcane glow shadow | On hover/focus | Use `group` and keep glow low-opacity |
| **Badges** | None (default) | Default | Only animate when badge represents an active filter |
| **Inputs** | Ring + border shift | On focus-visible | No “wiggle” or bouncing |
| **Modals/Overlays** | Fade + slight scale | Open/close | `opacity` + `scale-95 -> scale-100` |
| **Loading** | Slow pulse shimmer | Only while loading | Avoid infinite fast spinners |
| **Legendary rarity** | `pulse-slow` | Rare/intentional | Only on “featured” items, not every list item |

### 4.1 The "Mana Gem" (Spell Slots)

Instead of a number input for spell slots, use interactive icons.

  * **Active:** A filled, glowing icon (Lucide `Sparkles` or `Diamond`).
      * *Color:* `text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]`
  * **Empty/Spent:** A dull, grayed-out icon.
      * *Color:* `text-gray-700`
  * **Interaction:** Clicking "breaks" the gem (scales down instantly `scale-75` then back up).

### 4.2 Dice Rolls

When a critical action occurs (rolling a Nat 20 or casting a high-level spell).

  * **Library:** `canvas-confetti` (Open Source).
  * **Effect:** Burst of particles in the color of the damage type (Fire = Orange, Cold = White/Blue).

### 4.3 Hover Effects (The "Arcane Glow")

Cards should light up when touched.

  * **Utility:** `group hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:border-purple-400/50`

-----

## 5\. Implementation Guide

### 5.1 Required Libraries (Open Source)

Run this in your terminal to grab the necessary tools:

```bash
# Icons
bun add lucide-svelte

# Logic for dynamic classes
bun add clsx tailwind-merge

# Markdown Rendering
bun add marked dompurify

# Fun Stuff
bun add canvas-confetti
```

### 5.1a Notes

  * If a library is already in `package.json`, you do not need to re-install it.
  * Keep “fun” libraries optional; only add if you actually implement the interaction.

### 5.2 Tailwind Config (`tailwind.config.js`)

Copy this configuration to instantly enable your design tokens.

```javascript
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Semantic Rarity Colors
        rarity: {
          common: '#9ca3af',    // gray-400
          uncommon: '#10b981',  // emerald-500
          rare: '#06b6d4',      // cyan-500
          veryrare: '#a855f7',  // purple-500
          legendary: '#f59e0b', // amber-500
        }
      },
      backgroundImage: {
        'arcane-gradient': 'linear-gradient(to right, #8b5cf6, #7c3aed, #4f46e5)',
        'void-gradient': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [typography],
}
```

### 5.3 Global CSS (`app.css`)

Add these utilities to handle scrollbars and glass texture.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  /* Custom Scrollbar for Glass UI */
  .scrollbar-hide::-webkit-scrollbar {
      display: none;
  }
  
  .glass-scroll::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .glass-scroll::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }
  .glass-scroll::-webkit-scrollbar-thumb {
    background: rgba(139, 92, 246, 0.3);
    border-radius: 10px;
  }
  .glass-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 92, 246, 0.6);
  }
}

body {
  @apply bg-slate-900 text-gray-100 font-sans antialiased selection:bg-purple-500/30 selection:text-purple-200;
  background-image: var(--void-gradient);
  background-attachment: fixed;
}
```

### 5.4 Background Gradient Implementation (Pick One)

Use one of these approaches (don’t mix both).

  * **Approach A (Tailwind):** Apply `bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900` to the app shell.
  * **Approach B (CSS variable):** Define `--void-gradient` in `:root` and keep `background-image: var(--void-gradient)`.

-----

## 6\. Governance

This is a living document.

  * **When to update:** whenever you introduce a new reusable pattern (new surface, new button variant, new animation rule)
  * **Avoid:** adding one-off rules that only apply to a single screen
  * **Keep:** tokens and bundles small; delete outdated guidance instead of piling on exceptions

### 6.1 Change Log

  * **1.0.0:** Initial Arcane Design System