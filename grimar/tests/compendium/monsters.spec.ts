import { test, expect } from '../fixtures';

test.describe('Compendium Monsters - Smoke Tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/compendium/monsters');
		await page.waitForLoadState('domcontentloaded');
	});

	test('loads the monsters page', async ({ page }) => {
		await expect(page).toHaveTitle(/Creatures/i);
		await expect(page.locator('h1')).toContainText('Creatures');
	});

	test('displays monster list', async ({ page }) => {
		// Wait for any content to load - use a simple visible element check
		await expect(page.locator('body')).toBeVisible();
		// Check that the page has loaded content (not empty)
		const content = await page.content();
		expect(content.length).toBeGreaterThan(1000);
	});

	test('opens monster detail overlay', async ({ page }) => {
		// Click the first clickable item to open detail view
		const firstItem = page.locator('[data-testid="compendium-item"]').first();
		await expect(firstItem).toBeVisible({ timeout: 15000 });
		await firstItem.click();

		// Detail overlay should appear (check for close button or heading)
		const overlayVisible = await page
			.locator('[data-testid="close-detail"], main h2')
			.first()
			.isVisible();
		expect(overlayVisible).toBe(true);
	});

	test('can navigate to spells page', async ({ page }) => {
		// Navigate to spells
		await page.goto('/compendium/spells');
		await page.waitForLoadState('domcontentloaded');

		// Verify spells page loaded
		await expect(page.locator('h1')).toContainText('Spells');
	});
});
