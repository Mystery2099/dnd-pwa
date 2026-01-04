# Compendium Page Specifications

The Compendium pages have two routes: a browse index and a detail view.

## Routes

- `/compendium` - Landing page with type tabs
- `/compendium/[type]` - Browse page (spells, monsters, items)
- `/compendium/[type]/[slug]` - Detail page (e.g., `/compendium/spells/fireball`)

## 1. Browse Page (`/compendium/[type]`)

**File:** `routes/compendium/[type]/+page.svelte`

Uses a split-pane layout:

| Section | Location | Description |
|---------|----------|-------------|
| Sidebar | Left | Filters and search |
| List | Center | Results grid |
| Detail | Right (overlay) | Item details |

### Sidebar (`CompendiumSidebar.svelte`)

Located in `lib/features/compendium/components/layout/`.

- Search input (uses `Input.svelte`)
- Filter groups by type (level, school, etc.)
- Filter logic toggle (AND/OR)

### List View

- Category cards for type landing
- `CompendiumListItem` for list items
- Pagination at bottom

### Detail Panel

- Opens as overlay panel on the right
- Uses `CompendiumDetail.svelte`
- Close button dismisses overlay
- URL updates to include slug (deep linking)

## 2. Detail Page (`/compendium/[type]/[slug]`)

**File:** `routes/compendium/[type]/[slug]/+page.svelte`

Dedicated page for individual items.

### Detail Components

Located in `lib/features/compendium/components/detail/`:

- `SpellDetailContent.svelte` - Spell-specific fields
- `MonsterDetailContent.svelte` - Monster stat block
- `ItemDetailContent.svelte` - Item details
- `ClassDetailContent.svelte`, `RaceDetailContent.svelte`, etc.
- `StatBlock.svelte` - Monster stat block
- `AbilityScores.svelte` - Ability score display
- `DetailNavigation.svelte` - Previous/next navigation

### Shared Components

- `CompendiumDetail.svelte` - Wrapper container
- `Badge.svelte` - Spell school, rarity tags

## Mobile Behavior

- Detail view uses overlay panel (not full-screen modal)
- Sidebar collapses to drawer on small screens
- Compresses to single-column layout

## Removed Features

- `InputCrystal` - Doesn't exist, use `Input.svelte`
- `BookmarkToggle` - Never implemented
- `CompendiumDetailModal` - Replaced with overlay panel
- Modal pattern - Uses split-pane/overlay instead
