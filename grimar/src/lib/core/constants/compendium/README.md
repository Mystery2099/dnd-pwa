# Compendium Development Guide

This directory contains the configurations that drive the generic compendium system. The system is **registry-first**, meaning you can add support for a new D&D entity type (e.g., "Vehicles" or "Deities") by adding a single entry to the registry.

## How to Add a New Compendium Type

### 1. Add Entry to Registry

Edit `registry.ts` and add a new entry to `COMPENDIUM_TYPE_REGISTRY`:

```typescript
vehicles: {
	dbType: 'vehicles',
	displayName: 'Vehicles',
	description: 'Mounts and machines for travel',
	icon: Car,
	color: 'amber',
	category: 'equipment',
	showOnDashboard: true,
	showInSidebar: true,
	aliases: ['vehicle'],
	urlPath: 'vehicles',
	configSource: 'vehicles',
	entryComponent: 'vehicles',
},
```

That's it! The system will auto-generate:
- PATH_TO_DB_TYPE mapping
- DB_TYPE_TO_PATH mapping
- Default config (via `createGenericConfig`)
- Dashboard card
- Sidebar entry

### 2. (Optional) Custom Configuration

For types needing custom filters, sorting, or display logic:

1. Create `src/lib/core/constants/compendium/vehicles.ts` with `VEHICLES_CONFIG`
2. Set `configSource: 'vehicles'` in registry entry
3. Import and register in `index.ts`:

```typescript
import { VEHICLES_CONFIG } from './vehicles';

CONFIG_MAP.vehicles = VEHICLES_CONFIG;
```

### 3. (Optional) Custom Detail Component

For types needing special layouts:

1. Create `src/lib/features/compendium/components/entry-content/VehiclesEntryContent.svelte`
2. The component name must follow pattern: `{dbType}EntryContent.svelte`
3. Register in `EntryContentRenderer.svelte`:

```typescript
import VehiclesEntryContent from './VehiclesEntryContent.svelte';

const COMPONENT_MAP: ComponentMap = {
	...,
	vehicles: VehiclesEntryContent,
};
```

## Architecture Overview

```
registry.ts          ← Single source of truth
    ↓
┌───────────────────────────────────────────┐
│ Auto-generates:                           │
│ • DB_TYPES enum                           │
│ • PATH_TO_DB_TYPE / DB_TYPE_TO_PATH       │
│ • getDashboardCards()                     │
│ • getSidebarItems()                       │
└───────────────────────────────────────────┘
    ↓
index.ts              ← Config registration (auto + custom)
    ↓
categories.ts         ← Dashboard cards (auto-generated)
    ↓
EntryContentRenderer  ← Component map (convention-based)
```

## Key Concepts

- **Registry-First:** Define once in `COMPENDIUM_TYPE_REGISTRY`, everything else derives from it
- **Convention over Configuration:** Default configs and components work for simple types
- **Generic Routing:** Routes `[type]` and `[type]/[slug]` handle fetching, filtering, state automatically
- **Shallow Routing:** List items use `pushState` for overlay without full page reload
- **External Storage:** Detailed JSON payloads in `data/compendium/[type]/[id].json`

## Files Reference

| File | Purpose |
|------|---------|
| `registry.ts` | Single source of truth for all compendium types |
| `index.ts` | Config registration, exports `getCompendiumConfig()` |
| `categories.ts` | Dashboard categories and auto-generated cards |
| `type-mappings.ts` | Re-exports from registry + filter utilities |
| `spells.ts`, `creatures.ts` | Custom configs for complex types |
