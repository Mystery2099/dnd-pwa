# Specification: Compendium Optimization

## 1. Overview
This track focuses on overhauling the Compendium's discovery and performance capabilities. The goal is to provide a seamless, high-performance experience for users browsing thousands of spells, monsters, and items, regardless of their device or network speed. This involves implementing advanced search (full-text, fuzzy), multi-select filtering, and UI virtualization to handle large lists efficiently.

## 2. Goals
- **High Performance:** Ensure list rendering and scrolling remain 60fps even with 10,000+ items.
- **Advanced Discovery:** Allow users to find content instantly using complex queries (e.g., "Level 3 Evocation Wizard Spells" or "CR 5-10 Undead").
- **Maintainability:** Refactor the underlying data fetching and state management to be cleaner and more testable.
- **Offline Reliability:** Ensure all search and filter operations work identically offline via the cache.

## 3. Key Features
- **Virtualization:** Implement virtual scrolling for all major compendium lists (Spells, Monsters, Items) to minimize DOM nodes.
- **Advanced Search Engine:**
    - Full-text search across name, description, and tags.
    - Fuzzy matching for handling typos.
- **Faceted Filtering:**
    - Multi-select filters for all major properties (Class, School, Level, Type, CR, Rarity, etc.).
    - Dynamic filter counts (showing how many items match each filter).
- **URL Synchronization:** Deep-linking support where search queries and active filters are reflected in the URL for easy sharing.

## 4. Technical Approach
- **Frontend:**
    - Use `@tanstack/svelte-virtual` (or similar Svelte 5 compatible library) for virtualization.
    - Implement a client-side search index (e.g., `flexsearch` or a custom lightweight optimized solution) that is populated from the SQLite/local cache.
    - Use Zod schemas to validate search parameters and filter states.
- **State Management:**
    - Refactor TanStack Query hooks to support complex filtering parameters.
    - Persist filter preferences where appropriate using `localStorage` or URL state.
- **Testing:**
    - Unit tests for the search algorithm and filter logic.
    - Integration tests for the virtualization component (verifying only visible items are rendered).
    - End-to-end tests for deep-linking and search flows.

## 5. Success Criteria
- [ ] Compendium lists render instantly (<100ms) regardless of dataset size.
- [ ] Scrolling is smooth on mobile devices.
- [ ] Users can filter by multiple criteria simultaneously (AND/OR logic as defined).
- [ ] Search results are accurate and resilient to minor typos.
- [ ] Refreshing the page with active filters restores the exact same view.
