# Product Guide: Grimar

## Initial Concept
A self-hosted, offline-capable D&D 5e Progressive Web App (PWA) that acts as a unified "Digital Grimoire". It combines a reference tool, character manager, and virtual tabletop elements into a single "Local-First" platform.

## Target Audience
- **Players:** Looking for a digital character sheet, spellbook, and tools to manage their gameplay.
- **Homebrewers:** Users who want to create, import, and share custom content (spells, items, monsters) within their server instance.
- **Dungeon Masters (Secondary):** While player-centric, DMs benefit from the compendium and shared homebrew features.

## Core Features (MVP)
1.  **Comprehensive Compendium:**
    -   Hybrid data model: Open5e (SRD) seed data + local caching + custom homebrew database.
    -   Global search (Omnibar) for instant access to rules and entities.
    -   Robust filtering and "Crystal Index" masonry grid interface.
2.  **Character Management:**
    -   "Digital Paper" philosophy: Flexible inputs, not strict validation.
    -   "Adventurer's Prism" UI: Tabbed, responsive sheet optimized for table use.
    -   Interactive elements: "Mana Gems" for spell slots, glass tube health bars.
    -   Offline-capable (Read-Only) access to sheets.
3.  **The Forge (Character Creator):**
    -   Guided template workflow for creating new characters.
    -   Support for Manual, Point Buy, and Standard Array ability generation.
4.  **Homebrew System:**
    -   Tools to create custom Spells, Items, and Monsters.
    -   **Visibility:** Homebrew content is public to the server; Character sheets are **Private-First** (private to creator).
5.  **Technical Foundation:**
    -   "Local-First" PWA architecture with offline support.
    -   Self-hosted deployment (Docker + Traefik + Authentik).

## Success Metrics (North Star)
The MVP aims for a trifecta of value:
-   **Immersion:** The "Arcane Aero" UI must feel like a magical artifact.
-   **Utility:** Lightning-fast lookups and interactions for use during live play.
-   **Portability:** A seamless experience across desktop, mobile, and offline states.

## Future Roadmap (Post-MVP)
-   Real-time features: Server-Sent Events (SSE) for dice rolls and status updates.
-   Export Hub: JSON and PDF export functionality.
-   Campaign Management: Tools for DMs to group characters and manage adventures.
