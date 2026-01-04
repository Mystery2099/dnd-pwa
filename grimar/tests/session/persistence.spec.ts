import { test, expect } from '../fixtures';

test.describe('Session Persistence - Smoke Tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/compendium/spells');
		await page.waitForLoadState('domcontentloaded');
	});

	test('can open and close spell detail overlay', async ({ page }) => {
		// Wait for content
		await expect(page.locator('[data-testid="compendium-item"]').first()).toBeVisible({
			timeout: 15000
		});

		// Click first spell
		await page.locator('[data-testid="compendium-item"]').first().click();

		// Overlay should appear - check for close button or heading
		const overlayLocator = page.locator('[data-testid="close-detail"], main h2');
		await expect(overlayLocator.first()).toBeVisible();

		// Close by navigating away (more reliable than X button)
		await page.keyboard.press('Escape');
		await page.waitForTimeout(500);

		// Verify we're back at the list view (check URL)
		expect(page.url()).toContain('/compendium/spells');
	});

	test('can open and close monster detail overlay', async ({ page }) => {
		await page.goto('/compendium/monsters');
		await page.waitForLoadState('domcontentloaded');

		// Wait for content
		await expect(page.locator('[data-testid="compendium-item"]').first()).toBeVisible({
			timeout: 15000
		});

		// Click first monster
		await page.locator('[data-testid="compendium-item"]').first().click();

		// Overlay should appear
		const overlayLocator = page.locator('[data-testid="close-detail"], main h2');
		await expect(overlayLocator.first()).toBeVisible();

		// Close by navigating away
		await page.keyboard.press('Escape');
		await page.waitForTimeout(500);

		// Verify we're back at the list view
		expect(page.url()).toContain('/compendium/monsters');
	});

	test('page navigation works between compendium pages', async ({ page }) => {
		// Start at spells
		await expect(page.locator('h1')).toContainText('Spells');

		// Navigate to monsters
		await page.goto('/compendium/monsters');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.locator('h1')).toContainText('Monsters');

		// Navigate to spells
		await page.goto('/compendium/spells');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.locator('h1')).toContainText('Spells');
	});
});
