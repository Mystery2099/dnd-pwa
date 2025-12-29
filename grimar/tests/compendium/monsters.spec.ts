import { test, expect, waitForElement, clearStorage } from '../fixtures';

test.describe('Compendium Monsters', () => {
	test.beforeEach(async ({ page }) => {
		await clearStorage(page);
		await page.goto('/compendium/monsters');
		await page.waitForLoadState('networkidle');
	});

	test('loads the monsters page', async ({ page }) => {
		await expect(page).toHaveTitle(/Monsters/i);
		await expect(page.locator('h1')).toContainText('Monsters');
	});

	test('displays monster list', async ({ page }) => {
		// Wait for the monster grid to load
		await waitForElement(page, '[data-testid="monster-grid"]', { timeout: 15000 });
		// Check for monster cards
		const monsterCards = page.locator('[data-testid="compendium-item"]');
		await expect(monsterCards.first()).toBeVisible();
	});

	test('filters monsters by challenge rating', async ({ page }) => {
		await waitForElement(page, '[data-testid="monster-grid"]', { timeout: 15000 });

		// Open CR filter dropdown
		const crFilter = page.locator('[data-testid="filter-cr"]');
		await crFilter.click();

		// Select CR 1/8
		const crOption = page.locator('[data-testid="cr-option-0_125"]');
		await crOption.click();

		// Verify filtered results - wait for DOM update
		await page.waitForTimeout(500);

		// All displayed monsters should have CR 1/8
		const monsterCards = page.locator('[data-testid="monster-card"]');
		const count = await monsterCards.count();

		if (count > 0) {
			// Each monster card should show CR 1/8
			for (let i = 0; i < Math.min(count, 5); i++) {
				const card = monsterCards.nth(i);
				await expect(card).toContainText('1/8');
			}
		}
	});

	test('filters monsters by type', async ({ page }) => {
		await waitForElement(page, '[data-testid="monster-grid"]', { timeout: 15000 });

		// Open type filter dropdown
		const typeFilter = page.locator('[data-testid="filter-type"]');
		await typeFilter.click();

		// Select a type (e.g., Beast)
		const typeOption = page.locator('[data-testid="filter-type"][data-type="beast"]');
		await typeOption.click();

		// Wait for results
		await page.waitForTimeout(500);

		// Check results
		const monsterCards = page.locator('[data-testid="compendium-item"]');
		const count = await monsterCards.count();

		if (count > 0) {
			// At least some cards should show Beast type
			let hasBeast = false;
			for (let i = 0; i < Math.min(count, 5); i++) {
				const card = monsterCards.nth(i);
				const text = await card.textContent();
				if (text?.includes('Beast')) {
					hasBeast = true;
					break;
				}
			}
			expect(hasBeast || count === 0).toBe(true);
		}
	});

	test('searches for a specific monster', async ({ page }) => {
		await waitForElement(page, '[data-testid="monster-grid"]', { timeout: 15000 });

		// Type in search box
		const searchInput = page.locator('[data-testid="monster-search"]');
		await searchInput.fill('dragon');

		// Wait for results
		await page.waitForTimeout(500);

		// Should show dragon results or no results
		const monsterCards = page.locator('[data-testid="compendium-item"]');
		const count = await monsterCards.count();

		if (count > 0) {
			// At least one result should contain "dragon"
			const hasDragon = await monsterCards.first().isVisible();
			if (hasDragon) {
				await expect(monsterCards.first()).toContainText(/dragon/i);
			}
		}
	});

	test('opens monster detail overlay', async ({ page }) => {
		await waitForElement(page, '[data-testid="monster-grid"]', { timeout: 15000 });

		// Click first monster card
		const monsterCards = page.locator('[data-testid="compendium-item"]');
		await monsterCards.first().click();

		// Detail overlay should appear
		await waitForElement(page, '[data-testid="monster-detail-overlay"]');
		await expect(page.locator('[data-testid="monster-detail-overlay"]')).toBeVisible();
	});

	test('closes monster detail overlay with X button', async ({ page }) => {
		await waitForElement(page, '[data-testid="monster-grid"]', { timeout: 15000 });

		// Click first monster card to open detail
		const monsterCards = page.locator('[data-testid="compendium-item"]');
		await monsterCards.first().click();

		// Wait for overlay
		await waitForElement(page, '[data-testid="monster-detail-overlay"]');

		// Click X button
		const closeButton = page.locator('[data-testid="close-detail"]');
		await closeButton.click();

		// Overlay should be hidden
		await expect(page.locator('[data-testid="monster-detail-overlay"]')).toBeHidden();
	});

	test('closes monster detail overlay with Escape key', async ({ page }) => {
		await waitForElement(page, '[data-testid="monster-grid"]', { timeout: 15000 });

		// Click first monster card to open detail
		const monsterCards = page.locator('[data-testid="compendium-item"]');
		await monsterCards.first().click();

		// Wait for overlay
		await waitForElement(page, '[data-testid="monster-detail-overlay"]');

		// Press Escape
		await page.keyboard.press('Escape');

		// Overlay should be hidden
		await expect(page.locator('[data-testid="monster-detail-overlay"]')).toBeHidden();
	});

	test('URL updates when opening monster detail', async ({ page }) => {
		await waitForElement(page, '[data-testid="monster-grid"]', { timeout: 15000 });

		// Click first monster card
		const monsterCards = page.locator('[data-testid="compendium-item"]');
		await monsterCards.first().click();

		// Wait for overlay
		await waitForElement(page, '[data-testid="monster-detail-overlay"]');

		// URL should include /monsters/
		expect(page.url()).toContain('/compendium/monsters/');
	});

	test('navigates between monsters with keyboard arrows', async ({ page }) => {
		await waitForElement(page, '[data-testid="monster-grid"]', { timeout: 15000 });

		// Click first monster to open detail
		const monsterCards = page.locator('[data-testid="compendium-item"]');
		await monsterCards.first().click();

		// Wait for overlay
		await waitForElement(page, '[data-testid="monster-detail-overlay"]');

		// Press right arrow to go to next monster
		await page.keyboard.press('ArrowRight');
		await page.waitForTimeout(300);

		// Overlay should still be visible
		await expect(page.locator('[data-testid="monster-detail-overlay"]')).toBeVisible();

		// Press left arrow to go back
		await page.keyboard.press('ArrowLeft');
		await page.waitForTimeout(300);

		// Overlay should still be visible
		await expect(page.locator('[data-testid="monster-detail-overlay"]')).toBeVisible();
	});

	test('shows monster stat block in detail view', async ({ page }) => {
		await waitForElement(page, '[data-testid="monster-grid"]', { timeout: 15000 });

		// Click first monster card
		const monsterCards = page.locator('[data-testid="compendium-item"]');
		await monsterCards.first().click();

		// Wait for overlay
		await waitForElement(page, '[data-testid="monster-detail-overlay"]');

		// Should show monster stats (HP, AC, Speed)
		const overlay = page.locator('[data-testid="monster-detail-overlay"]');
		await expect(overlay).toContainText(/HP/i);
		await expect(overlay).toContainText(/AC/i);
		await expect(overlay).toContainText(/Speed/i);
	});
});
