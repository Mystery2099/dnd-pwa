# Product Guidelines: Grimar

## Visual Identity: "Arcane Aero"
Grimar's visual language is "Modern Arcane Aero"—a fusion of 2000s glassmorphism (gloss, depth, bevels) and modern clarity (restraint, accessibility).

### 1. The Hierarchy of Depth (Priority #1)
The interface must establish a clear 3D hierarchy using the three-tier material system:
-   **Canvas (Level 1):** Large, stable regions (sidebars, background frame). Minimal blur, subtle noise.
-   **Card (Level 2):** Main content "shards" (character sheets, spell cards). Medium blur, "Aero shine," beveled edges.
-   **Overlay (Level 3):** Modals, tooltips, dropdowns. High blur, high contrast, strong shadow.

### 2. Light and Reflection (Priority #2)
Surfaces should look like physical glass:
-   **Aero Shine:** A subtle, horizontal gloss line across the top 40% of cards and buttons.
-   **Bevels:** Top borders are highlights (white/transparent); bottom borders are shadows (black/transparent).
-   **Luminous Accents:** Use gemstone colors (Ruby, Amethyst, etc.) for borders and highlights to signal role and state.

### 3. Color and Saturation (Priority #3)
-   **The Deep Weave:** Use radial gradients for backgrounds to create a "spotlight" effect.
-   **Gemstone Palette:** Highly saturated hues for specific semantic roles (e.g., Red for Evocation/Attack).

## Tone and Voice: "The Helpful Familiar"
Grimar is a clean, modern assistant with a touch of magical whimsy.

### 1. Clarity First
-   Prioritize clear, technical language for game rules and system messages.
-   Avoid excessive high-fantasy jargon that obscures utility (e.g., use "Select a Class" instead of "Discern thy destiny").

### 2. Enchanted Personality
-   Sprinkle magical flavor into non-critical UI areas (e.g., "Conjuring your character..." during loading, or "The spellbook is currently empty" in empty states).
-   Use light magical puns or whimsical phrasing sparingly to build character.

### 3. Error Handling
-   Errors should be helpful and non-blocking.
-   Tone should be apologetic but magical (e.g., "A stray mana surge prevented the save. Let's try again.").

## Motion and Interaction: "Tactile Magic"
The UI must feel like a physical, enchanted artifact.

### 1. Tactile Response
-   **Hover Lift:** Cards and buttons should lift (translateY) and increase in glow on hover.
-   **Press:** Active states should feel "pressed" into the surface (scale down, inset shadow).
-   **Material Physics:** Interaction should mimic physical objects (e.g., mana gems "break" when spent, tubes "fill" with liquid).

### 2. Snappy Transitions
-   Motion should be fast and intentional (150ms–300ms).
-   Respect the `prefers-reduced-motion` system preference by simplifying or removing non-essential animations.
