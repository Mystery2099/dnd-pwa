# Provider System Refactor & Extension Plan

## Overview
Refactor provider system with abstract base class, add support for all compendium types (feat, background, race, class), use Zod validation, and optimize database storage.

## Phase 1: Abstract Base Provider Class

### Create `src/lib/server/providers/base-provider.ts`
```typescript
abstract class BaseProvider implements CompendiumProvider {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly baseUrl: string;
  abstract readonly supportedTypes: readonly CompendiumTypeName[];

  // Common implementations (extracted from all providers)
  async healthCheck(): Promise<boolean> { ... }
  protected toTitleCase(str: string): string { ... }
  protected async fetchAllPagesPaginated(
    endpoint: string,
    limit?: number
  ): Promise<unknown[]> { ... }
}
```

### Update providers to extend base class
- `src/lib/server/providers/open5e.ts` - extends BaseProvider
- `src/lib/server/providers/5ebits.ts` - extends BaseProvider
- `src/lib/server/providers/srd.ts` - extends BaseProvider
- `src/lib/server/providers/homebrew.ts` - extends BaseProvider

## Phase 2: Extend Compendium Types

### Update `src/lib/types/compendium/index.ts`
Add type-specific fields to TransformResult:
```typescript
interface TransformResult {
  // ...existing fields
  // New optional fields:
  featPrerequisites?: string;
  featBenefits?: string[];
  backgroundFeature?: string;
  raceAbilityScores?: Record<string, number>;
  raceTraits?: string[];
  classHitDie?: number;
  classProficiencies?: string[];
  classSpellcasting?: Record<string, unknown>;
}
```

### Update `src/lib/server/providers/types.ts`
Add `5e-bits` to provider type union, update ProviderSettings.supportedTypes.

## Phase 3: Add Zod Validation to All Providers

### Create `src/lib/server/providers/schemas/5ebits-schemas.ts`
```typescript
export const FiveEBitsSpellSchema = z.object({...});
export const FiveEBitsMonsterSchema = z.object({...});
export const FiveEBitsClassSchema = z.object({...});
export const FiveEBitsRaceSchema = z.object({...});
export const FiveEBitsBackgroundSchema = z.object({...});
export const FiveEBitsFeatSchema = z.object({...});
```

### Update 5e-bits provider to use Zod validation
- Replace runtime type assertions with `validateData()` calls
- Add error logging for validation failures

### Update SRD provider with Zod validation
- Create SRD schemas if needed
- Apply same validation pattern

## Phase 4: Database Schema Optimization

### Move heavy JSON to external storage reference

**Option A: Single JSON file per type**
```
data/
  spells.json      # All spell details
  monsters.json    # All monster details
  classes.json     # All class details
  races.json       # All race details
  backgrounds.json # All background details
  feats.json       # All feat details
```

**Option B: One JSON file per item**
```
data/spells/
  fireball.json
  cure-wounds.json
  ...
```

### Update `src/lib/server/db/schema.ts`

```typescript
export const compendiumItems = sqliteTable('compendium_items', {
  // ...existing columns
  // Remove heavy columns, add reference:
  jsonPath: text('json_path'),  // Path to JSON file in data/
  // Keep lightweight columns for filtering:
  name: text('name').notNull(),
  type: text('type').notNull(),
  summary: text('summary'),
  // Type-specific (minimal):
  spellLevel: integer('spell_level'),
  spellSchool: text('spell_school'),
  challengeRating: text('challenge_rating'),
  monsterSize: text('monster_size'),
  monsterType: text('monster_type'),
  // Add new type columns:
  classHitDie: integer('class_hit_die'),
  raceSize: text('race_size'),
  backgroundSkillProficiencies: text('background_skill_proficiencies'),
});
```

### Create data loader utility
```typescript
// src/lib/server/data-loader.ts
export async function loadDetails(jsonPath: string): Promise<Record<string, unknown>>
export async function loadAllDetails(type: CompendiumTypeName): Promise<Map<string, Record<string, unknown>>>
```

## Phase 5: Enable All Compendium Types

### Update `src/lib/server/providers/5ebits.ts`
Add support for: `feat`, `background`, `race`, `class`

### Update `src/lib/server/providers/open5e.ts`
Add support for: `feat`, `background`, `race`, `class` (if API supports)

### Update `providers.json` with type capabilities

```json
{
  "providers": [
    {
      "id": "5e-bits",
      "name": "5e-bits",
      "enabled": true,
      "type": "5e-bits",
      "baseUrl": "https://api.5e-bits.com",
      "supportedTypes": ["spell", "monster", "feat", "background", "race", "class"]
    },
    {
      "id": "open5e",
      "name": "Open5e",
      "enabled": false,
      "type": "open5e",
      "baseUrl": "https://api.open5e.com",
      "supportedTypes": ["spell", "monster", "item", "feat", "background", "race", "class"]
    },
    {
      "id": "homebrew",
      "name": "Homebrew",
      "enabled": false,
      "type": "homebrew",
      "baseUrl": "",
      "supportedTypes": ["spell", "monster", "item"]
    }
  ]
}
```

### Update sync orchestrator for new types
```typescript
// src/lib/server/services/sync/orchestrator.ts
const TYPES_TO_SYNC = ['spell', 'monster', 'item', 'feat', 'background', 'race', 'class'];

// Add case handlers for new types in result counting
case 'feat': result.feats = itemCount; break;
case 'background': result.backgrounds = itemCount; break;
case 'race': result.races = itemCount; break;
case 'class': result.classes = itemCount; break;
```

## Phase 6: Update ProviderSyncResult

```typescript
interface ProviderSyncResult {
  providerId: string;
  spells: number;
  monsters: number;
  items: number;
  feats: number;        // NEW
  backgrounds: number;  // NEW
  races: number;        // NEW
  classes: number;      // NEW
  totalItems: number;
  errors: string[];
}
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/server/providers/base-provider.ts` | **NEW** - Abstract base class |
| `src/lib/server/providers/open5e.ts` | Extend base class, add types |
| `src/lib/server/providers/5ebits.ts` | Extend base class, add Zod, add types |
| `src/lib/server/providers/srd.ts` | Extend base class, add Zod |
| `src/lib/server/providers/homebrew.ts` | Extend base class |
| `src/lib/server/providers/types.ts` | Add 5e-bits type, extend TransformResult |
| `src/lib/server/providers/index.ts` | Export base provider |
| `src/lib/server/providers/schemas/5ebits-schemas.ts` | **NEW** - Zod schemas |
| `src/lib/server/providers/schemas/open5e-schemas.ts` | **NEW** - Zod schemas for Open5e |
| `src/lib/server/db/schema.ts` | Add jsonPath, new type columns |
| `src/lib/server/services/sync/orchestrator.ts` | Handle new types |
| `src/lib/server/data-loader.ts` | **NEW** - Load external JSON |
| `providers.json` | Define supported types per provider |
| `src/lib/types/compendium/index.ts` | Extend type definitions |
