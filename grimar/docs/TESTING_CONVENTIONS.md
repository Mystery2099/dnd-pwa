# Testing Conventions

This document outlines the testing standards and patterns used in Grimar.

## Test File Location

| Test Type | Location Pattern | Example |
|-----------|-----------------|---------|
| Unit tests | `*.test.ts` alongside source files | `service.ts` → `service.test.ts` |
| Integration tests | `/tests/` directory | `/tests/compendium/spells.spec.ts` |
| E2E tests | `/tests/` directory with Playwright | `/tests/sync/api.spec.ts` |

## Test Framework

- **Unit/Integration**: Vitest with Happy-DOM
- **E2E**: Playwright

## Unit Test Patterns

### Basic Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ModuleName', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('methodName', () => {
		it('should do expected behavior', () => {
			// Test implementation
		});

		it('should handle edge case', () => {
			// Test implementation
		});
	});
});
```

### Mocking Database

Use the pattern from `base-provider.test.ts`:

```typescript
const mockDb = {
	select: vi.fn(),
	insert: vi.fn()
};

vi.mock('$lib/server/db', () => ({
	getDb: vi.fn().mockResolvedValue(mockDb)
}));
```

### Mocking SvelteKit Modules

```typescript
vi.mock('$app/environment', () => ({
	browser: true,
	building: false,
	dev: true
}));

vi.mock('$app/stores', () => ({
	page: {
		get: vi.fn().mockReturnValue({
			data: { user: { username: 'test' } }
		})
	}
}));
```

### Error Logging Tests

Verify that `console.error` includes the required `[context]` prefix:

```typescript
it('should log error with context prefix', () => {
	console.error = vi.fn();

	expect(() => {
		// Code that logs error
	}).toThrow();

	expect(console.error).toHaveBeenCalledWith(
		expect.stringContaining('[context]'),
		expect.any(Error)
	);
});
```

## E2E Test Patterns

### Using Fixtures

The project provides custom fixtures in `/tests/fixtures.ts`:

```typescript
import { test, expect } from './fixtures';

test('authenticated user can access characters', async ({ authenticatedPage }) => {
	await authenticatedPage.goto('/characters');
	await expect(authenticatedPage.locator('h1')).toHaveText('Characters');
});
```

### Environment Setup

E2E tests use `VITE_MOCK_USER` for authentication bypass:

```typescript
// In playwright.config.ts
use: {
	env: {
		VITE_MOCK_USER: 'testuser'
	}
}
```

## Coverage Expectations

| Module Type | Minimum Coverage |
|-------------|------------------|
| Services | 70% |
| Providers | 85% |
| Utilities | 70% |
| Transformers | 80% |

## Best Practices

1. **Test one thing per it()** - Each test should verify a single behavior
2. **Use descriptive names** - `should_return_null_for_non_existent_character` not `test1`
3. **Avoid implementation details** - Test behavior, not internal implementation
4. **Use data-testid** - For E2E tests, prefer `data-testid` over CSS selectors
5. **Clean up mocks** - Always use `beforeEach` or `afterEach` to reset state

## Running Tests

```bash
# Unit tests (watch mode)
bun run test

# Unit tests once (CI mode)
bun run test:run

# Unit tests with UI
bun run test:ui

# E2E tests
bun run test:e2e

# E2E tests with UI
bun run test:e2e:ui

# All tests
bun run test:all
```

## Continuous Integration

For CI, run:

```bash
CI=true bun run test:run && bun run test:e2e
```
