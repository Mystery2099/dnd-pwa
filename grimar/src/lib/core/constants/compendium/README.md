# Compendium Development Guide

This directory contains the configurations that drive the generic compendium system. The system is designed to be **configuration-first**, meaning you can add support for a new D&D entity type (e.g., "Vehicles" or "Deities") primarily by defining a JSON-like configuration object.

## How to Add a New Compendium Type

### 1. Define the Configuration

Create a new file in this directory (e.g., `src/lib/constants/compendium/vehicles.ts`). Use the `CompendiumTypeConfig` interface.

```typescript
import { Car } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/types/compendium';

export const VEHICLES_CONFIG: CompendiumTypeConfig = {
    routes: {
        basePath: '/compendium/vehicles',
        dbType: 'vehicle', // Must match the 'type' column in the database
        storageKeyFilters: 'vehicle-filters',
        storageKeyListUrl: 'vehicle-list-url'
    },
    filters: [
        {
            title: 'Speed',
            key: 'speed',
            urlParam: 'speed',
            values: [{ label: 'Fast', value: 'fast' }],
            layout: 'chips'
        }
    ],
    sorting: {
        default: { label: 'Name', value: 'name-asc', column: 'name', direction: 'asc' },
        options: [...]
    },
    ui: {
        displayName: 'Vehicle',
        displayNamePlural: 'Vehicles',
        icon: Car,
        categoryAccent: 'text-amber-400',
        categoryGradient: 'from-amber-500/20 to-orange-500/20',
        emptyState: { ... },
        databaseEmptyState: { ... }
    },
    display: {
        subtitle: (item) => `${item.details.speed} speed`,
        tags: (item) => [item.details.type],
        listItemAccent: () => 'hover:border-amber-500/50',
        detailAccent: () => 'text-amber-400',
        metaDescription: (item) => `${item.name} is a vehicle...`
    }
};
```

### 2. Register the Configuration

Add your new configuration to the registry in `src/lib/constants/compendium/index.ts`.

```typescript
// 1. Import your config
import { VEHICLES_CONFIG } from './vehicles';

// 2. Add to CONFIG_MAP
const CONFIG_MAP: Record<CompendiumTypeName, CompendiumTypeConfig> = {
    ...,
    vehicle: VEHICLES_CONFIG
};

// 3. Add to PATH_TO_TYPE (maps URL segment to DB type)
const PATH_TO_TYPE: Record<string, CompendiumTypeName> = {
    ...,
    vehicles: 'vehicle'
};
```

### 3. (Optional) Create a Detail Component

If the new type requires a special layout (beyond the default JSON preview), create a new component in `src/lib/components/compendium/detail/`.

Then, update the component switchers in:

- `src/routes/compendium/[type]/+page.svelte` (The detail overlay)
- `src/routes/compendium/[type]/[slug]/+page.svelte` (The full detail page)

```svelte
{#if dbType === 'vehicle'}
    <VehicleDetailContent item={selectedItem} />
{:else ...}
```

### 4. Update the Dashboard

Finally, add a `CategoryCard` for your new type in `src/routes/compendium/+page.svelte`.

```svelte
<CategoryCard
	title="Vehicles"
	description="Mounts and machines."
	href="/compendium/vehicles"
	icon={Car}
	gradient="from-amber-500/20 to-orange-500/20"
	accent="text-amber-400"
/>
```

## Key Concepts

- **Generic Routing:** The routes `[type]` and `[type]/[slug]` handle data
fetching, filtering, and state management automatically using the registry.
- **Shallow Routing:** Clicking a list item uses `pushState` to open an overlay
without a full page reload, while maintaining a shareable URL.
- **External Storage:** Detailed JSON payloads are stored in
`data/compendium/[type]/[id].json` to keep the SQLite database fast and small.
Only metadata needed for filtering/sorting is kept in DB columns.
