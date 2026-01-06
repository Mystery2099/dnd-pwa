# Plan: Compendium Optimization

## Phase 1: Infrastructure & Virtualization
This phase focuses on setting up the foundation for high-performance rendering. We will implement a reusable virtual list component and integrate it into the existing Compendium views.

- [x] Task: Research and select a Svelte 5 compatible virtualization strategy/library. 178aa9d
    - [x] Sub-task: Evaluate `@tanstack/svelte-virtual` and other lightweight alternatives.
    - [x] Sub-task: Create a proof-of-concept prototype to verify Svelte 5 compatibility.
- [x] Task: Create a reusable `VirtualList` component. e2249de
    - [x] Sub-task: Write unit tests for the component's interface.
    - [x] Sub-task: Implement the component with support for variable item heights (if possible/needed) or fixed heights.
- [x] Task: Refactor the 'Spells' list to use `VirtualList`. 0d3ff5c
    - [x] Sub-task: Update the data fetching hook to return the full dataset (or support infinite query if keeping pagination, but client-side filtering prefers full dataset). *Decision: Move to full dataset load + client-side filtering for offline speed.*
    - [x] Sub-task: Implement the virtualized view.
    - [x] Sub-task: Verify performance with 500+ spells.
- [x] Task: Refactor 'Monsters' and 'Items' lists to use `VirtualList`. 0d3ff5c
    - [x] Sub-task: Apply the same pattern to the other major compendium sections.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Virtualization'

## Phase 2: Advanced Search & Indexing
This phase introduces a client-side search engine to enable fast, fuzzy, full-text search across the datasets.

- [x] Task: Select and integrate a client-side search library (e.g., `flexsearch` or `fuse.js`). b9020ff
    - [x] Sub-task: Benchmark library size vs. performance for the expected dataset (approx. 2-5MB of text). *Decision: fuse.js (456 kB) over flexsearch (2.33 MB)*
- [x] Task: Implement a `SearchIndexer` service. b9020ff
    - [x] Sub-task: Create a service that accepts Compendium data and builds an index. *Note: Web worker implementation skipped per user request*
    - [x] Sub-task: Write unit tests for the indexing logic. *18 tests passing*
- [x] Task: Integrate search into CompendiumFilterStore. b9020ff
    - [x] Sub-task: Integrate SearchIndexer into existing filter store
    - [x] Sub-task: Update filter tests to use proper CompendiumItem objects
- [x] Task: Conductor - User Manual Verification 'Phase 2: Advanced Search & Indexing'

## Phase 3: Faceted Filtering & Deep Linking
This phase adds the "control panel" power: multi-select filters and URL synchronization.

- [x] Task: Implement filter logic in `useCompendiumSearch` / `CompendiumFilterStore`.
    - [x] Sub-task: update the hook to accept complex filter objects (e.g., `{ type: ['undead', 'fiend'], cr: { min: 5, max: 10 } }`).
    - [x] Sub-task: Ensure filtering happens efficiently against the indexed/cached data.
- [x] Task: Implement URL synchronization.
    - [x] Sub-task: Create a utility to serialize/deserialize filter state to URL search params.
    - [x] Sub-task: Update page `load` functions to initialize state from the URL.
    - [x] Sub-task: Update URL on filter changes without reloading the page (`replaceState`).
- [/] Task: Design and implement the `FilterPanel` component.
    - [x] Sub-task: Create a UI for multi-select groups (buttons/tags) with accessible interactions.
    - [ ] Sub-task: Refactor sidebar/filter panel styling based on critiques (reduce glow, improve contrast).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Faceted Filtering & Deep Linking' (Protocol in workflow.md)

## Phase 4: UX Refinement & "Arcane Aero" Stabilization (New)
Based on AI critiques from Jan 5, 2026. Address usability and accessibility debt.

- [ ] Task: Refactor `ThemeSwitcher.svelte`.
    - [ ] Sub-task: Remove the "Orbital Nexus" layout for desktop (Mystery Meat Navigation).
    - [ ] Sub-task: Use the grid layout with text labels for all screen sizes.
- [ ] Task: Refactor `Toggle.svelte`.
    - [ ] Sub-task: Replace the SVG shape-swapping with a standard track-and-thumb switch.
- [ ] Task: Audit and Improve Contrast & Hierarchy.
    - [ ] Sub-task: Reduce blur and glow opacity by ~50% across the app.
    - [ ] Sub-task: Implement standard focus rings for keyboard navigation.
    - [ ] Sub-task: Standardize "destructive" action buttons (Clear Cache, etc.) to look dangerous.
- [ ] Task: Optimize Settings Page Information Architecture.
    - [ ] Sub-task: Implement internal navigation (tabs or anchor links) for the long settings page.
    - [ ] Sub-task: Replace massive `SelectCard` grids with compact dropdowns for simple numeric options.