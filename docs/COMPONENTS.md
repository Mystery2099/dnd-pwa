# Grimar Component Inventory

This document lists the reusable UI components in Grimar.

## Principles

- Prefer **composition** over "mega components".
- Keep "Arcane Aero" styling centralized in primitives.
- Components grouped by responsibility:
  - **Primitives** - Base UI elements
  - **Layout** - App shell and navigation
  - **Feature UI** - Dashboard, compendium components
  - **Feedback** - Loading, empty, error states

## UI Primitives

Located in `src/lib/components/ui/`.

- `Button` - Variants: primary, secondary, ghost, danger
- `Input` - Inset/etched style text input
- `Select` - Dropdown for filters
- `Badge` - Used for spell school, rarity, tags
- `SurfaceCard` - Arcane Glass material surface
- `ThemeSwitcher` - Theme selection dropdown
- `OfflineIndicator` - Shows online/offline status

## Layout Components

Located in `src/lib/components/layout/`.

- `AppShell` - Wraps all authenticated routes
- `GlobalHeader` - Logo/title, omnibar, action cluster
- `Omnibar` - Command palette / global search (`Cmd+K`)
- `PrimaryNav` - Desktop navigation links
- `MobileNavDrawer` - Drawer overlay for mobile nav

## Dashboard Components

Located in `src/lib/features/dashboard/components/`.

- `CharacterCard` - Crystal card with portrait, name, class/level
- `CharacterGrid` - Responsive grid of CharacterCard
- `DashboardActions` - "Create Character" CTA

## Compendium Components

Located in `src/lib/features/compendium/components/`.

### Layout
- `CompendiumShell` - Layout for sidebar + grid
- `CompendiumSidebar` - Filter groups and toggles
- `FilterGroup` - Labeled group for filters

### Detail
- `CompendiumDetail` - Full entry detail view
- `SpellDetailContent` - Spell-specific detail rendering
- `MonsterDetailContent` - Monster-specific detail rendering
- `ItemDetailContent` - Item-specific detail rendering
- `ClassDetailContent`, `RaceDetailContent`, `FeatDetailContent`, `BackgroundDetailContent`
- `StatBlock` - Monster stat block
- `AbilityScores` - Ability scores display
- `DetailNavigation` - Previous/next navigation

### List
- `CompendiumListItem` - List item for browse view
- `CategoryCard` - Category card for compendium landing
- `Pagination` - Page navigation

### UI
- `CompendiumLoading` - Loading skeleton
- `CompendiumError` - Error display with retry
- `FilterLogicToggle` - AND/OR filter logic toggle

## Removed Components (No Longer Planned)

These were documented but never implemented:

- `SurfaceCanvas`, `SurfaceOverlay` - Use SurfaceCard with modifiers
- `Textarea` - Not implemented
- `Toggle`, `Tabs`, `Chip`, `Divider` - Not implemented
- `IconButton`, `UserMenu` - Not implemented
- `BookmarkToggle` - Not implemented
- `CompendiumDetailModal` - Replaced with split detail page
- `CompendiumTabs`, `CompendiumGrid`, `CompendiumCard` - Reorganized

## Character Sheet Components (Planned)

Not yet implemented:

- `CharacterHeader`, `PortraitUploader`, `CharacterTabs`
- `VitalsPanel`, `AbilityScoresGrid`, `SkillsList`
- `ResourcesPanel`, `SpellSlots`, `AttacksList`
- `InventoryPanel`, `EncumbranceBar`, `NotesEditor`

## Forge (Character Creator) - Planned

Route exists but not implemented:

- `ForgeWizard`, `ForgeStepBasics`, `ForgeStepTemplates`
- `ForgeStepAbilityScores`, `ForgeReview`

## Dice Roller - Removed

Never implemented:

- `DiceTray`, `DiceInput`, `DiceResult`

## Export - Removed

Never implemented:

- `ExportHub`, `ExportButton`, `PdfExportStatus`

## Feedback Components - Removed

Never implemented:

- `LoadingSpinner`, `SkeletonCard`, `EmptyState`, `ErrorPanel`, `Toast`
