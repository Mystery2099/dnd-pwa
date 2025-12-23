# Grimar Product Guidelines

## Visual Identity & Brand Tone: "Modern Arcane Aero"
Grimar is not a flat web app; it is a tactile, three-dimensional digital artifact—a "Digital Grimoire." The design fuses the glossy, optimistic depth of **Frutiger Aero** with the clarity and accessibility of modern product UI.

### 1. The Physics of Magic (Materials)
We define three core glass materials to maintain depth and hierarchy. Avoid solid, opaque backgrounds.
- **Level 1: Obsidian (Canvas):** Dark, heavy glass (90% opacity) with subtle stone noise. Used for large layout regions like sidebars and headers.
- **Level 2: Arcane Glass (Card):** The standard container (60-80% opacity) with a "horizon line" gloss reflection (Aero shine). Used for spell cards, inventory slots, and main content.
- **Level 3: Overlay Glass:** High-blur, high-transparency glass (80% opacity) with thick borders. Used for modals, dropdowns, and tooltips.

### 2. The Aurora System (Color & Light)
- **Deep Weave Background:** A dark, radial-gradient spotlight (`#2e1065` to `#0f172a`) that makes the app feel like it's lit by a magical orb.
- **Gemstone Accents:** Interactive elements use saturated "gem" tones based on spell schools:
  - 🔴 **Ruby:** Evocation/Attack
  - 🔵 **Sapphire:** Abjuration/Protection
  - 🟢 **Emerald:** Necromancy/Healing
  - 🟣 **Amethyst:** Illusion/Charm
  - 🟡 **Topaz:** Divination/Utility
- **Luminous UI:** Everything emits light. Shadows are colored (purple/blue), and active elements feature an "Arcane Glow" (outer glow + border shift).

### 3. Typography & Iconography
- **Typography:** Use **Inter** for maximum legibility. Headings feature a subtle "Holo-Glow" text shadow, while body text remains clean and high-contrast.
- **Iconography:** Use **Lucide** icons sparingly. Maintain a monochrome palette for UI icons, reserving gem accents for semantic emphasis (e.g., school badges).

## User Experience & Interaction: "The Adventurer's Prism"
The app must feel like a personal, living artifact that prioritizes speed-of-use at the table.

### 1. Tactile Interactions
- **Tactile Feedback:** Buttons are convex "Orbs" or "Lozenges" with vertical gradients. Inputs are concave "Insets" (etched into the glass).
- **Interactive Mana Gems:** Spell slots are represented by interactive crystal icons that "break" (animate) when expended and dim when empty.
- **Arcane Motion:** Motion communicates state. Use subtle scale transforms, opacity fades, and "Ether" hover fills (liquid light following the mouse).

### 2. Local-First & Offline First
- **"Digital Paper" Philosophy:** Prioritize flexibility. Allow manual overrides and non-blocking validation for character stats.
- **Instant Search:** Implement a universal Omnibar (`Cmd+K`) that searches the local SQLite database instantly.
- **Offline Reliability:** Core tasks (viewing sheets, searching the compendium) must work without a connection. Edits sync to the server when reconnected.

## Technical Design Principles
- **Strict Typing:** Leverage TypeScript for complex D&D data structures to ensure long-term maintainability.
- **Local-First Architecture:** Use Svelte 5 and SvelteKit with a focus on client-side state and efficient SQLite (Drizzle) queries.
- **Performance First:** Maintain 60 FPS interactions. Use skeleton loaders to prevent layout shift and prioritize "Stale-While-Revalidate" caching for compendium data.
- **Separation of Concerns:** Keep server-side repositories/services distinct from UI components to allow for clear testing and data transformation logic.
