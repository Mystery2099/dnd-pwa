# Grimar Component Inventory

This document lists the reusable UI components and feature components we expect
to build.

## Principles

- Prefer **composition** over “mega components”.
- Keep “Arcane Aero” styling centralized in a small set of primitives.
- Components are grouped by responsibility:
  - **Primitives** (buttons, inputs, surfaces)
  - **Layout** (shell, header, navigation)
  - **Feature UI** (dashboard, compendium, character sheet)
  - **Feedback** (loading/empty/error)

## UI Primitives (Design System)

These should live under `src/lib/components/ui/` (or similar).

- `SurfaceCanvas`
  - Obsidian material surface (`surface.canvas`).

- `SurfaceCard`
  - Arcane Glass material surface (`surface.card`).

- `SurfaceOverlay`
  - Overlay material surface (`surface.overlay`).

- `Button`
  - Variants: `primary`, `secondary`, `ghost`, `danger`.

- `IconButton`
  - For toolbar actions.

- `Input`
  - Inset/etched style.

- `Textarea`
  - For notes / long-form input.

- `Select`
  - For filter dropdowns.

- `Toggle`
  - Skeuomorphic switch.

- `Tabs`
  - Used for Compendium and Character Sheet.

- `Badge`
  - Used for spell school, rarity, tags.

- `Chip`
  - Used for filter chips.

- `Divider`
  - Subtle line divider for panels.

## Layout Components (App Shell)

These should live under `src/lib/components/layout/`.

- `AppShell`
  - Wraps all authenticated routes.

- `GlobalHeader`
  - Logo/title, omnibar, action cluster.

- `Omnibar`
  - Command palette / global search UI (`Cmd+K`).

- `PrimaryNav`
  - Desktop navigation links.

- `MobileNavDrawer`
  - Drawer overlay for navigation.

- `UserMenu`
  - Username display + settings/logout (logout is proxy-managed).

## Feedback Components

- `LoadingSpinner` (optional)
- `SkeletonCard`
  - Dashboard and list placeholders.
- `EmptyState`
  - Message + suggested CTA.
- `ErrorPanel`
  - Non-blocking error with retry.
- `Toast` / `Toaster` (optional)

## Dashboard Components

- `CharacterCard` (Crystal Card)
  - Portrait, name, class/level.

- `CharacterGrid`
  - Responsive grid of `CharacterCard`.

- `DashboardActions`
  - “Create Character” CTA, optional export/import entry points.

## Compendium Components

- `CompendiumShell`
  - Layout for sidebar + grid.

- `CompendiumSidebar`
  - Filter groups and toggles.

- `FilterGroup`
  - Labeled group for a set of filters.

- `CompendiumTabs`
  - Spells | Items | Monsters.

- `CompendiumGrid`
  - Grid/masonry list.

- `CompendiumCard`
  - Base card shared by spell/item/monster.

- `BookmarkToggle`
  - Star toggle used on cards and details.

- `CompendiumDetailModal`
  - Overlay showing full compendium entry.

## Character Sheet Components

- `CharacterHeader`
  - Portrait, name, class/level, rest controls.

- `PortraitUploader`
  - File input + preview.

- `CharacterTabs`
  - Stats | Combat & Spells | Inventory | Notes.

- `VitalsPanel`
  - HP, AC, speed, initiative.

- `AbilityScoresGrid`
  - Six ability tiles.

- `SkillsList`
  - Clickable skills.

- `ResourcesPanel`
  - Spell slots (Mana Gems), conditions.

- `SpellSlots`
  - Mana Gem row/cluster.

- `AttacksList`
  - Weapon/attack rows.

- `InventoryPanel`
  - Equipped + full inventory.

- `EncumbranceBar`
  - Glass tube bar.

- `NotesEditor`
  - Markdown editor/viewer.

## Forge (Character Creator) Components

- `ForgeWizard`
  - Stepper container.

- `ForgeStepBasics`
  - Name + portrait.

- `ForgeStepTemplates`
  - Race/class templates.

- `ForgeStepAbilityScores`
  - Manual, Point Buy, Standard Array.

- `ForgeReview`
  - Summary before creation.

## Dice Roller Components (MVP-light)

- `DiceTray`
  - Sidebar drawer for manual rolls.

- `DiceInput`
  - `/r 2d20 + 5` parsing input.

- `DiceResult`
  - Result visualization.

## Export Components (Post-MVP)

- `ExportHub`
- `ExportButton`
- `PdfExportStatus`

## PWA / Offline

- `OfflineBadge`
  - Indicates offline/read-only state.

- `SyncStatus`
  - Shows SRD sync status.
