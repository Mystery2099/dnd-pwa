import { test as base, expect, type Page } from '@playwright/test';

export { expect };

/**
 * Custom test fixtures for Grimar E2E tests
 */
export const test = base.extend({
	/**
	 * Mock user for development - bypasses auth by adding X-Authentik-Username header
	 * This header is what Authentik would normally set via reverse proxy
	 */
	authenticatedPage: async ({ page }, use) => {
		// Intercept fetch requests to add auth header
		await page.addInitScript(() => {
			// Override fetch to add auth header
			const originalFetch = window.fetch;
			window.fetch = function (...args) {
				const _url = args[0];
				const options = args[1] || {};

				// Add header to outgoing requests
				options.headers = {
					...(options.headers || {}),
					'X-Authentik-Username': 'test-dm'
				};

				return originalFetch(args[0], options);
			};
		});
		await use(page);
	},

	/**
	 * Navigate to a page and wait for content to load
	 */
	loadPage: async ({ page }, use) => {
		await use(async (url: string) => {
			await page.goto(url);
			await page.waitForLoadState('domcontentloaded');
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
