# AGENTS.md - Development Guidelines for Agentic Coding

This file contains essential guidelines for agentic coding agents working in the Grimar repository.

## Essential Commands

**Working Directory:** All commands must run from the `grimar/` subdirectory:
```bash
cd ./grimar && bun run <command>
```

### Development
```bash
bun run dev              # Start dev server (http://localhost:5173)
bun run build            # Build for production
bun run check            # Type checking with SvelteCheck
bun run prepare          # SvelteKit sync (after config changes)
```

### Testing
```bash
bun run test             # Vitest (watch mode)
bun run test:run         # Vitest once (CI mode)
bun run test src/lib/components/ui/Button.test.ts  # Run specific test file
bun run test -- Button   # Run tests matching pattern
bun run test:e2e         # Playwright E2E tests
bun run test:all         # All tests (unit + E2E)
```

### Code Quality
```bash
bun run format           # Format with Prettier
bun run lint             # Prettier + ESLint check
```

### Database
```bash
bun run db:push          # Push schema (dev only)
bun run db:sync          # Sync compendium from providers
```

## Code Style Guidelines

### General Principles
- **Named exports only:** Use `export { MyClass }`, no default exports
- **Use `const` or `let`:** Never `var`
- **No `_` prefix/suffix:** For identifiers (including private properties)
- **Strict equality:** Use `===` and `!==`
- **Avoid `any`:** Prefer `unknown` or specific types
- **Semicolons:** Always use semicolons

### Import Organization
```typescript
// 1. External libraries (alphabetical)
import { z } from 'zod';
import { describe, it, expect } from 'vitest';

// 2. SvelteKit imports
import { enhance } from '$app/forms';
import type { PageData } from './$types';

// 3. Internal imports (grouped by path)
import { getDb } from '$lib/server/db';
import { Button } from '$lib/components/ui/Button.svelte';
```

### Svelte 5 Component Patterns
```typescript
interface Props {
    title: string;
    active?: boolean;
    onclick?: () => void;
}

let { title, active = false, onclick }: Props = $props();
let count = $state(0);
let doubled = $derived(count * 2);
```

### Error Handling & Logging
```typescript
import { createModuleLogger } from '$lib/server/logger';
const log = createModuleLogger('ModuleName');
log.info({ itemId, operation }, 'Processing item');
log.error({ error, context }, 'Operation failed');
// NEVER use console.error directly
```

### Naming Conventions
- **Classes/Interfaces/Types:** `UpperCamelCase`
- **Variables/Functions/Properties:** `lowerCamelCase`
- **Constants:** `CONSTANT_CASE`

### Data Validation
Use Zod for all external data validation before database insert.

## Critical Rules

1. Always `cd ./grimar` before any bun commands
2. Run `bun run check` before committing
3. Run `CI=true bun run test:run` before committing
4. Use `dbRetry()` wrapper for database operations
5. Use `VirtualList` for 50+ items
6. Write failing tests first (TDD), target >80% coverage
7. Use structured logging, never `console.error`

## Project Structure

- **Framework:** SvelteKit 2 + Svelte 5 (runes-based reactivity)
- **Database:** Drizzle ORM with SQLite
- **State:** TanStack Query for server state, Svelte stores for client state
- **Styling:** Tailwind v4 with 7-theme system
- **Testing:** Vitest (unit) + Playwright (E2E)

## Tool Usage Priority

1. SvelteKit: Routing, forms, actions, load functions
2. Drizzle ORM: Database operations, migrations
3. TanStack Query: Server state management, caching
4. Tailwind v4: Styling, responsive utilities
5. Zod: Schema validation, type safety
6. Winston: Structured logging with child loggers

## Commit Message Format

```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore
Example: feat(compendium): Add spell filtering by school
```
