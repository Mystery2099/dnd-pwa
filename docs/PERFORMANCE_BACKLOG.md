# Performance Backlog

Created: 2026-03-04
Branch: `performance-improvements`

## High Priority

- [x] Use FTS-backed compendium search in repository query paths (replace `%LIKE%` scan hot paths where possible).
- [x] Keep search fully paginated and filter-aware in `/api/compendium/items` (do not bypass page/filter logic for `search`).
- [x] Debounce non-primary text filters (for example, `source`) to reduce fetch + URL churn.

## Medium Priority

- [x] Add server-side memory caching for compendium list/detail/count queries (similar to character repository caching).
- [x] Cache or precompute compendium type counts used by `/compendium` landing page.
- [x] Replace global TanStack invalidation calls with scoped invalidation by query key family.
- [x] Precompute/memoize markdown parse + sanitize on heavy detail pages to avoid repeated render-time parsing.

## Lower Priority / UX Perception

- [x] Use TanStack prefetch for compendium detail routes (hover/viewport-driven prefetch).
- [x] Reduce global render overhead in layout (heavy visual overlays, external font loading path) for faster first paint.

## Additional Improvements Completed

- [x] Cache distinct compendium metadata lookups (`gamesystem`, `document`, `publisher`, `source`) in repository read paths.
- [x] Add API query telemetry headers (`Server-Timing`, query-duration bucket) for compendium endpoints.
- [x] Skip `COUNT(*)` for `all=true` compendium API reads to reduce DB work on full-list preloads.

## Next Candidates

- [x] Add compendium-specific DB indexes for JSON-backed filters (spell level/school, creature type/CR, subclass split).
- [ ] Preserve FTS rank ordering end-to-end in list search results.
- [x] Route-layer short TTL caching for compendium stats endpoint.
- [x] Reduce production-path console logging noise in client cache sync.
- [x] Use virtualization in compendium list/grid when item counts are high.
- [x] Add viewport/intersection-based detail prefetch in compendium listings.
