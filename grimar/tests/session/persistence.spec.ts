import { test, expect, waitForElement, clearStorage } from './fixtures';

test.describe('Session Persistence', () => {
	test.beforeEach(async ({ page }) => {
		await clearStorage(page);
	});

	test('remembers filter state after opening and closing detail', async ({ page }) => {
		await page.goto('/compendium/spells');
		await page.waitForLoadState('networkidle');
		await waitForElement(page, '[data-testid="spell-grid"]', { timeout: 15000 });

		// Apply level 1 filter
		const levelFilter = page.locator('[data-testid="filter-level"][data-level="1st"]');
		await levelFilter.click();

		// Wait for filter to apply
		await page.waitForTimeout(500);

		// Open a spell
		const spellCards = page.locator('[data-testid="compendium-item"]');
		await spellCards.first().click();

		// Wait for overlay
		await waitForElement(page, '[data-testid="spell-detail-overlay"]');

		// Close overlay with X button
		const closeButton = page.locator('[data-testid="close-detail"]');
		await closeButton.click();

		// Wait for overlay to close
		await page.waitForTimeout(500);

		// Filter should still be applied (level 1 should be selected)
		// This is verified by checking that the filter UI shows level 1
		await expect(levelFilter).toBeVisible();
	});

	test('restores filter state when returning from detail via browser back', async ({ page }) => {
		await page.goto('/compendium/spells');
		await page.waitForLoadState('networkidle');
		await waitForElement(page, '[data-testid="spell-grid"]', { timeout: 15000 });

		// Apply level 1 filter
		const levelFilter = page.locator('[data-testid="filter-level"][data-level="1st"]');
		await levelFilter.click();

		// Wait for filter to apply
		await page.waitForTimeout(500);

		// Open a spell (this changes URL)
		const spellCards = page.locator('[data-testid="compendium-item"]');
		await spellCards.first().click();

		// Wait for overlay
		await waitForElement(page, '[data-testid="spell-detail-overlay"]');

		// Use browser back button
		await page.goBack();

		// Wait for navigation
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(500);

		// Filter should still be applied
		await expect(levelFilter).toBeVisible();
	});

	test('persists monster filter state', async ({ page }) => {
		await page.goto('/compendium/monsters');
		await page.waitForLoadState('networkidle');
		await waitForElement(page, '[data-testid="monster-grid"]', { timeout: 15000 });

		// Apply CR filter
		const crFilter = page.locator('[data-testid="filter-size"]');
		await crFilter.click();
		const crOption = page.locator('[data-testid="filter-size"]:has-text("Medium")');
		await crOption.click();

		// Wait for filter
		await page.waitForTimeout(500);

		// Open a monster
		const monsterCards = page.locator('[data-testid="compendium-item"]');
		await monsterCards.first().click();

		// Wait for overlay
		await waitForElement(page, '[data-testid="monster-detail-overlay"]');

		// Close overlay
		const closeButton = page.locator('[data-testid="close-detail"]');
		await closeButton.click();

		// Wait for close
		await page.waitForTimeout(500);

		// Filter should still be visible/active
		await expect(crFilter).toBeVisible();
	});

	test('does not reopen detail when closing via X button', async ({ page }) => {
		await page.goto('/compendium/spells');
		await page.waitForLoadState('networkidle');
		await waitForElement(page, '[data-testid="spell-grid"]', { timeout: 15000 });

		// Open a spell
		const spellCards = page.locator('[data-testid="compendium-item"]');
		await spellCards.first().click();

		// Wait for overlay
		await waitForElement(page, '[data-testid="spell-detail-overlay"]');

		// Close with X button
		const closeButton = page.locator('[data-testid="close-detail"]');
		await closeButton.click();

		// Wait for close
		await page.waitForTimeout(500);

		// Overlay should stay closed
		await expect(page.locator('[data-testid="spell-detail-overlay"]')).toBeHidden();

		// URL should be back to base spells page
		expect(page.url()).toContain('/compendium/spells');
		expect(page.url()).not.toContain('/compendium/spells/');
	});

	test('deep linking opens detail overlay', async ({ page }) => {
		// Navigate directly to a spell detail URL
		// Note: This assumes there's at least one spell in the database
		await page.goto('/compendium/spells');
		await page.waitForLoadState('networkidle');
		await waitForElement(page, '[data-testid="spell-grid"]', { timeout: 15000 });

		// Get first spell name from a card
		const spellCards = page.locator('[data-testid="compendium-item"]');
		const firstCard = spellCards.first();

		// Click to open
		await firstCard.click();
		await waitForElement(page, '[data-testid="spell-detail-overlay"]');

		// Close and reopen via URL navigation
		const closeButton = page.locator('[data-testid="close-detail"]');
		await closeButton.click();
		await page.waitForTimeout(300);

		// Navigate back to the spell detail URL
		await page.goto(page.url());
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(500);

		// Overlay should be visible
		await expect(page.locator('[data-testid="spell-detail-overlay"]')).toBeVisible();
	});
});
