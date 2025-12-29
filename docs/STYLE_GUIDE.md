# 💎 Arcane Aero Style Guide

**Version:** 1.0.0
**Aesthetic:** "Modern Arcane Aero." A fusion of Frutiger Aero (gloss, depth,
beveled glass) and modern product UI (clarity, restraint, accessibility).

**Relationship to Design System:**

* This guide describes the **visual skin** (shine, bevel, noise, gemstone accents).
* `docs/arcane-design-sysem.md` defines the **tokens, states, motion rules, and accessibility**.

## Consistency Contract

* If a recommendation here conflicts with semantics, motion rules, or
accessibility, the Design System wins.
* Everything in this guide should map onto Design System tokens (surfaces,
accents, states).

### Terminology Mapping (Quick Reference)

* **Arcane Glass** = Design System `surface.card`
* **Obsidian** = Design System `surface.canvas`
* **Ether** = Design System hover/selected state expression
* **Deep Weave spotlight** = Design System `bg.app`

-----

## 1\. Design Philosophy

Our UI is not "flat." It is a tactile, three-dimensional artifact made of
enchanted crystal and obsidian.

* **Tactile Depth:** Elements should look like they can be touched. Buttons
are convex (orbs), inputs are concave (insets).
* **Luminous:** Everything emits light. Shadows are colored, not black. Text
has halos.
* **Vibrant:** Avoid washed-out accent colors. Use rich purples for backgrounds
and gem tones for interactive emphasis (neutral grays are fine for typography).
* **Reflective:** Surfaces are polished glass. They have "horizon lines" (the
classic Aero gloss reflection).

### 1.1 Modern Constraints (So It Still Feels 2025)

Keep the Aero vibe, but avoid turning the UI into a neon toy.

* **Glow is an accent, not the default:** reserve strong glows for selection,
focus, or featured rarity.
* **Bevels are subtle:** prefer 1-2 inset highlights, not many layers.
* **Text glow is minimal:** the UI must remain readable; avoid heavy halos on
body text.
* **Noise is faint:** the goal is anti-plastic texture, not visible grain.
* **Prefer gradients over flat fills:** but keep them smooth and low-bandwidth.

-----

## 2\. Color Palette (The Aurora System)

We use highly saturated gradients to differentiate magical effects.

### 2.1 Backgrounds (The Deep Weave)

Instead of flat dark colors, use radial gradients to create a "spotlight" effect.

* **Void Base:** `radial-gradient(circle at 50% 0%, #2e1065, #0f172a)`
  * *Concept:* A dark room lit by a magical orb overhead.

### 2.2 Gemstone Accents (Spell Schools)

Used for borders, buttons, badges, and small highlights. These are the primary
"gem" hues.

* **Semantics:** gemstone colors represent **spell school / spell role**, not rarity.
* **Rarity:** should be expressed by **border/glow intensity** (and occasional
pulse for featured items), not by changing the hue.

* 🔴 **Ruby (Evocation/Attack):** `#f43f5e` (Rose-500)
* 🔵 **Sapphire (Protection/Abjuration):** `#0ea5e9` (Sky-500)
* 🟢 **Emerald (Healing/Necromancy):** `#10b981` (Emerald-500)
* 🟣 **Amethyst (Illusion/Charm):** `#a855f7` (Purple-500)
* 🟡 **Topaz (Divination/Legendary):** `#f59e0b` (Amber-500)

-----

## 3\. Materials (The Physics of Magic)

We define three specific "materials" that mimic physical objects.

### 3.1 Arcane Glass (The Card)

The standard container. It looks like a thick slab of glass floating in the air.

* **Transparency:** 60-80% opacity.
* **Bevels:** Top border is bright white (light source), bottom border is dark (shadow).
* **Reflection:** A subtle white gradient on the top 40% of the card.

### 3.2 Obsidian (The Sidebar)

Darker, heavier glass used for navigation and static areas.

* **Transparency:** 90% opacity (almost solid).
* **Texture:** Subtle noise to mimic stone.

### 3.3 Ether (The Hover State)

When an element is active, it fills with "liquid light."

* **Behavior:** A radial gradient that follows the mouse (if possible) or pulses
from the center.

-----

## 4\. Typography (Holographic Text)

**Font:** `Inter` or `System UI`. The font face is simple; the *styling* is complex.

### 4.1 Text Effects

Text should look like it is projected inside the glass.

* **The Holo-Glow:**

```css
text-shadow: 0 0 12px rgba(139, 92, 246, 0.6), 0 2px 4px rgba(0,0,0,0.8);
```

* **Headers:** Extra Bold, Tracking Tight. White with purple glow.
* **Data Labels:** Uppercase, tracked wide, slightly transparent (`opacity-70`).

### 4.2 Modern Readability Rules

* **Body text:** no glow (or extremely subtle); rely on contrast instead.
* **Headings:** glow allowed, but keep it low radius and low opacity.
* **Links:** clear affordance without neon (underline or subtle color shift).

-----

## 5\. Component Library (Visuals)

### 5.1 Buttons (Orbs & Lozenges)

Buttons are not rectangles. They are physical gems.

* **Shape:** Pill-shaped (`rounded-full`) or highly rounded rects (`rounded-2xl`).
* **Gradient:** Vertical gradient (Light top -\> Dark bottom) to simulate curvature.
* **Highlight:** A sharp, semi-transparent white oval at the top (the "Aero shine").

### 5.2 Inputs (Insets)

Inputs should feel carved into the glass surface.

* **Effect:** Inner Shadow (`box-shadow: inset 0 2px 4px rgba(0,0,0,0.5)`).
* **Border:** Dark on top, Light on bottom (Reverse bevel).

### 5.3 Toggles & Switches

Skeuomorphic toggles that look like physical levers or sliding crystals.

-----

## 6\. Implementation Reference (CSS)

Copy these classes into your `app.css` to instantly achieve the Arcane Aero look.

### 6.1 The "Aero" Shine (Utility Class)

Apply this to any card to give it that 2000s glossy reflection.

```css
.aero-shine {
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.05) 49%,
    rgba(255, 255, 255, 0.0) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
}
```

### 6.2 The Crystal Card (Container)

```css
.card-crystal {
  /* Base Glass */
  background-color: rgba(30, 27, 75, 0.6); /* Indigo-950 @ 60% */
  backdrop-filter: blur(12px);
  
  /* The 3D Bevel (Top Light, Bottom Shadow) */
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.4), /* Top Rim */
    inset 1px 0 0 rgba(255, 255, 255, 0.1), /* Left Rim */
    inset -1px 0 0 rgba(255, 255, 255, 0.1), /* Right Rim */
    0 4px 20px rgba(0, 0, 0, 0.5); /* Drop Shadow */
    
  border-bottom: 1px solid rgba(0, 0, 0, 0.6);
  border-radius: 16px;
}
```

### 6.3 The "Gem" Button

```css
.btn-gem {
  position: relative;
  overflow: hidden;
  border: none;
  border-radius: 9999px; /* Pill */
  
  /* The "Roundness" Gradient */
  background: linear-gradient(
    180deg, 
    #8b5cf6 0%, /* Light Purple */
    #6d28d9 100% /* Dark Purple */
  );
  
  /* 3D Depth */
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.4), /* Top Highlight */
    0 2px 4px rgba(0, 0, 0, 0.3), /* Drop Shadow */
    0 0 12px rgba(139, 92, 246, 0.5); /* Outer Glow */
    
  color: white;
  font-weight: 700;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.5); /* Engraved Text */
  transition: all 0.2s;
}

.btn-gem:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(139, 92, 246, 0.8);
}

.btn-gem:active {
  transform: translateY(1px);
  background: linear-gradient(180deg, #5b21b6 0%, #4c1d95 100%);
}
```

### 6.4 The "Engraved" Panel (For Stats)

Use this for stat blocks inside a card.

```css
.panel-inset {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); /* Bottom highlight to emphasize depth */
}
```

-----

## 7\. Imagery & Assets

### 7.1 Icons

Icons can be monochrome by default; use gem accents sparingly.

* **Style:** Use Lucide icons. Prefer monochrome (`text-gray-200/300`) for most UI.
* **Accent:** Use gem colors for school/semantic emphasis (e.g., Evocation gets
a ruby accent), not everywhere.

### 7.2 Background Noise

To prevent the glass from looking like plastic, overlay a very faint noise texture.

* **Asset:** Use a subtle transparent noise PNG over the entire `<body>`, set to
`pointer-events-none`.
* **Rule:** keep noise faint; if you can "see the noise" at a glance, it's too strong.

-----

## 9\. Motion Notes

* **Use:** shine slides, hover lift, gentle glow increases.
* **Avoid:** constant looping animations on primary UI.
* **Reduced motion:** animations should be disabled or simplified when reduced motion is enabled.

-----

## 8\. Layout Examples

### Spell List Item

A long, horizontal bar that looks like a glass slat.

* **Default:** Dark glass, text glows slightly.
* **Hover:** The "Aero Shine" gradient slides in. The left border lights up with
the School Color (e.g., Red for Evocation).

### Character HP Bar

Don't use a flat line. Use a **Glass Tube**.

* **Container:** `panel-inset` pill shape.
* **Fill:** A bright red cylinder with a white highlight running horizontally
across the top half to make it look liquid.
