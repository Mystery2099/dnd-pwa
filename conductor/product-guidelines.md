# Product Guidelines: The Grimar Hermetica

## Prose & Tone
- **Voice:** Balanced. The tone should be primarily professional and direct to ensure clarity and speed of use, but enriched with subtle thematic flourishes in headings, empty states, and major UI interactions to reinforce the "Digital Grimoire" atmosphere.
- **Terminology:** Use standard D&D 5e terminology for mechanics (e.g., "Hit Points," "Armor Class") but use thematic framing for app functions (e.g., "Compendium" instead of "Database," "Inscription" instead of "Edit").

## UX & Interaction Design
- **Complexity Management:** Use **Progressive Disclosure** to keep initial views clean, revealing complex rules and details only when requested. Supplement this with rich **Tooltips & References** that link directly to the Compendium, explaining mechanics without cluttering the interface.
- **Optimistic UI:** All interactions (e.g., updating a character sheet) should feel instantaneous to the user. Synchronization with the server happens in the background, providing a snappy, "magical" responsiveness.
- **Tactile Feedback:** Employ subtle animations and transitions to give UI elements a sense of physical weight and presence, making the interface feel like an enchanted artifact.

## Visual Identity: Arcane Aero
- **Accessibility First (High Priority):** All magical aesthetic choices (glows, glassmorphism, transparencies) must strictly adhere to WCAG accessibility standards. High contrast and text readability are non-negotiable.
- **Dynamic Theming (High Priority):** All components must be built to respond gracefully to theme changes. Gemstone colors, shadow depths, and accent hues must update dynamically, ensuring the application looks cohesive in any "magical alignment."
- **Iconography:** Use consistent, high-quality icons (e.g., Lucide Svelte) styled to resemble magical runes or inscriptions, reinforcing the visual language.

## Data & Connectivity Strategy
- **Server-Authoritative:** The server is the single source of truth for all data.
- **Offline Capability:** The application implements robust read-only caching. If the user loses internet connection, they can still view their characters and browse the Compendium.
- **Connectivity Feedback:**
    - **Unobtrusive Indicators:** Use small, elegant icons (e.g., a glowing or fading rune) to communicate connection status without distracting the user.
    - **Graceful Degradation:** Features requiring active server connection (e.g., saving changes) should be subtly dimmed or disabled with explanatory tooltips when offline.
