import { test as base, expect, type Page } from '@playwright/test';

export { expect };

/**
 * Custom test fixtures for Grimar E2E tests
 */
const test = base.extend({
	/**
	 * Page with auth automatically configured for E2E tests
	 */
	page: [
		async ({ page }, use) => {
			// Set test user cookie before any navigation
			await page
				.context()
				.addCookies([{ name: 'test-user', value: 'test-dm', url: 'http://localhost:5173' }]);

			// Also intercept fetch requests to add auth header
			await page.addInitScript(() => {
				const originalFetch = window.fetch;
				window.fetch = function (...args) {
					const options = args[1] || {};
					options.headers = {
						...(options.headers || {}),
						'X-Authentik-Username': 'test-dm'
					};
					return originalFetch(args[0], options);
				};
			});
			await use(page);
		},
		{ scope: 'test' }
	]
});

export { test };

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
 * Note: Must be called after page is loaded (localStorage not available before)
 */
export async function clearStorage(page: Page): Promise<void> {
	try {
		await page.evaluate(() => localStorage.clear());
	} catch {
		// localStorage may not be available in some contexts
	}
	try {
		await page.evaluate(() => sessionStorage.clear());
	} catch {
		// sessionStorage may not be available in some contexts
	}
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
