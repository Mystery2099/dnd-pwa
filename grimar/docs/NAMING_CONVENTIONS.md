# Naming Conventions

This document establishes consistent naming conventions for Grimar.

## File Naming

### General Rules

- Use **kebab-case** for all files: `my-file.ts`
- Svelte components use **PascalCase**: `MyComponent.svelte`
- Test files use **suffix**: `*.test.ts` or `*.spec.ts`

### Directory-Specific Patterns

| Directory | Pattern | Examples |
|-----------|---------|----------|
| `db/` | `db-*` prefix | `db-connection.ts`, `db-fts.ts`, `db-retry.ts` |
| `auth/` | `auth-*` prefix | `auth-handler.ts`, `auth-guard.ts`, `auth-service.ts` |
| `sync/` | `sync-*` prefix | `sync-cleanup.ts`, `sync-metrics.ts`, `orchestrator.ts` |
| `cache/` | `cache-*` prefix | `cache-manager.ts`, `cache-cleanup.ts` |
| `utils/` | Descriptive name | `data-loader.ts`, `monitoring.ts` |
| `services/` | Domain name | `characters/service.ts`, `dataTransformer.ts` |
| `components/ui/` | Descriptive name | `button.svelte`, `input.svelte` |
| `components/layout/` | PascalCase | `AppShell.svelte`, `GlobalHeader.svelte` |
| `features/*/components/` | PascalCase | `CompendiumDetail.svelte`, `CharacterSheet.svelte` |

### Service Layer Pattern

For service directories with multiple utilities:

```
services/
├── auth/
│   ├── auth-handler.ts    # Main handler
│   ├── auth-guard.ts      # Route guard
│   ├── auth-types.ts      # Type definitions
│   └── auth-service.ts    # Index/barrel file
```

## TypeScript Naming

### Interfaces

- Use **PascalCase**: `CompendiumItem`, `AuthUser`
- Use descriptive names that end with the entity type when applicable:
  - `CompendiumItem` (entity)
  - `CompendiumCategory` (grouping)
  - `FilterConfig` (configuration)

### Type Aliases

- Use **camelCase** for union types of literals: `compendiumTypeName`
- Use **PascalCase** for complex types: `ProviderListResponse<T>`

### Zod Schemas

- Use **Schema** suffix: `Open5eSpellSchema`
- Export inferred types without suffix: `export type Open5eSpell = z.infer<typeof Open5eSpellSchema>`

## Error Logging

All `console.error` calls must include a `[context]` prefix:

```typescript
// ✅ Correct
console.error('[auth] Failed to resolve user:', error);
console.error('[data-loader] Failed to parse compendium data:', error);

// ❌ Incorrect
console.error('Failed to parse compendium data:', error);
console.error(error);
```

**Context format:** `[module-name] message`

## Export Naming

### Barrel Files (index.ts)

Re-export with original names:

```typescript
// index.ts
export { handleAuth } from './auth-handler';
export { requireUser } from './auth-guard';
```

### Constants

Use **UPPER_SNAKE_CASE** for runtime constants:

```typescript
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;
```

## Import Conventions

### Absolute Imports

Use `$lib` alias for library code:

```typescript
import { getDb } from '$lib/server/db';
import type { CompendiumItem } from '$lib/core/types/compendium';
```

### Relative Imports

- Use relative imports for files in the same directory: `./types`
- Use `..` for parent directories: `../services/auth`
- Avoid excessive nesting (more than 3 levels)

### Named vs Default Imports

- Use named imports for utilities: `import { handleAuth } from './auth'`
- Use default imports for Svelte components: `import Button from './Button.svelte'`

## Database Schema

### Table Names

- Use **snake_case**: `compendium_items`, `users`, `characters`

### Column Names

- Use **camelCase**: `spell_level`, `challenge_rating`, `created_by`

### Index Names

- Use descriptive names: `compendium_items_external_idx`

## Route Files

SvelteKit uses specific naming:

| File | Purpose |
|------|---------|
| `+page.svelte` | Page component |
| `+page.server.ts` | Page load/actions |
| `+server.ts` | API endpoint |
| `+layout.svelte` | Layout wrapper |
| `+layout.server.ts` | Layout load |

## Component Props (Svelte 5)

```typescript
interface Props {
	title: string;
	active?: boolean;
	onclick?: () => void;
}
let { title, active = false, onclick }: Props = $props();
```

## Enums and Constants

Use object-based "const enums" for type safety:

```typescript
export const COMPENDIUM_TYPES = {
	SPELL: 'spell',
	MONSTER: 'monster',
	ITEM: 'item',
	FEAT: 'feat',
	BACKGROUND: 'background',
	RACE: 'race',
	CLASS: 'class'
} as const;

export type CompendiumType = typeof COMPENDIUM_TYPES[keyof typeof COMPENDIUM_TYPES];
```
