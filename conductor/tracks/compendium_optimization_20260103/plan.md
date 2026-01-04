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
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Virtualization' (Protocol in workflow.md)

## Phase 2: Advanced Search & Indexing
This phase introduces a client-side search engine to enable fast, fuzzy, full-text search across the datasets.

- [ ] Task: Select and integrate a client-side search library (e.g., `flexsearch` or `fuse.js`).
    - [ ] Sub-task: Benchmark library size vs. performance for the expected dataset (approx. 2-5MB of text).
- [ ] Task: Implement a `SearchIndexer` service.
    - [ ] Sub-task: Create a service that accepts Compendium data and builds an index in a web worker (to avoid blocking the main thread).
    - [ ] Sub-task: Write unit tests for the indexing logic.
- [ ] Task: Create a `useCompendiumSearch` hook.
    - [ ] Sub-task: Implement the hook to interface with the worker/indexer.
    - [ ] Sub-task: Add debouncing and state management for search queries.
- [ ] Task: Integrate search into the UI.
    - [ ] Sub-task: Replace the simple text filter with the new search hook in all Compendium views.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Advanced Search & Indexing' (Protocol in workflow.md)

## Phase 3: Faceted Filtering & Deep Linking
This phase adds the "control panel" power: multi-select filters and URL synchronization.

- [ ] Task: Design and implement the `FilterPanel` component.
    - [ ] Sub-task: Create a UI for multi-select groups (checkboxes, tags) with accessible interactions.
    - [ ] Sub-task: Implement "Arcane Aero" styling for the panel (glassmorphism, collapsible sections).
- [ ] Task: Implement filter logic in `useCompendiumSearch`.
    - [ ] Sub-task: update the hook to accept complex filter objects (e.g., `{ type: ['undead', 'fiend'], cr: { min: 5, max: 10 } }`).
    - [ ] Sub-task: Ensure filtering happens efficiently against the indexed/cached data.
- [ ] Task: Implement URL synchronization.
    - [ ] Sub-task: Create a utility to serialize/deserialize filter state to URL search params.
    - [ ] Sub-task: Update page `load` functions to initialize state from the URL.
    - [ ] Sub-task: Update URL on filter changes without reloading the page (`replaceState`).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Faceted Filtering & Deep Linking' (Protocol in workflow.md)
