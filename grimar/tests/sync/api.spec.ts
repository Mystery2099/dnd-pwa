import { test, expect } from '../fixtures';

test.describe('Authenticated App Smoke', () => {
	test('dashboard loads for an authenticated user', async ({ page }) => {
		await page.goto('/dashboard');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.locator('h1')).toContainText('Dashboard');
		await expect(page.locator('body')).toContainText('test-dm');
	});

	test('characters page loads seeded character data', async ({ page }) => {
		await page.goto('/characters');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.locator('h1')).toContainText('My Characters');
		await expect(page.locator('body')).toContainText('Playwright Ranger');
	});

	test('settings page loads for an authenticated user', async ({ page }) => {
		await page.goto('/settings');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.locator('h1')).toContainText('Settings');
	});

	test('api requests include authenticated identity in browser context', async ({ page }) => {
		await page.goto('/compendium/spells');
		const response = await page.evaluate(async () => {
			const result = await fetch('/api/characters');
			return { status: result.status, items: await result.json() };
		});
		expect(response.status).toBe(200);
		expect(Array.isArray(response.items)).toBe(true);
	});
});
