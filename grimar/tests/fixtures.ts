import { test as base, type Page } from '@playwright/test';

/**
 * Custom test fixtures for Grimar E2E tests
 */
export const test = base.extend({
	/**
	 * Mock user for development - bypasses auth
	 */
	authenticatedPage: async ({ page }, use) => {
		await page.addInitScript(() => {
			window.localStorage.setItem('VITE_MOCK_USER', 'test-dm');
		});
		await use(page);
	},

	/**
	 * Navigate to a page and wait for content to load
	 */
	loadPage: async ({ page }, use) => {
		await use(async (url: string) => {
			await page.goto(url);
			await page.waitForLoadState('networkidle');
			// Wait for any loading states to resolve
			await page.waitForTimeout(500);
		});
	}
});

/**
 * Wait for a specific element to appear with retry logic
 */
export async function waitForElement(
	page: Page,
	selector: string,
	options?: { timeout?: number; state?: 'attached' | 'visible' }
): Promise<void> {
	await page.waitForSelector(selector, {
		timeout: options?.timeout ?? 10000,
		state: options?.state ?? 'visible'
	});
}

/**
 * Clear all localStorage data
 */
export async function clearStorage(page: Page): Promise<void> {
	await page.evaluate(() => localStorage.clear());
	await page.evaluate(() => sessionStorage.clear());
}

/**
 * Set filter state in sessionStorage (mimics filter store behavior)
 */
export async function setFilterState(
	page: Page,
	path: string,
	filters: Record<string, unknown>
): Promise<void> {
	await page.evaluate(
		([p, f]) => {
			sessionStorage.setItem(`grimar-${p}-filters`, JSON.stringify(f));
		},
		[path, filters]
	);
}
