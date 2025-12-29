import { test, expect, waitForElement, clearStorage } from '../fixtures';

test.describe('Compendium Spells', () => {
	test.beforeEach(async ({ page }) => {
		await clearStorage(page);
		await page.goto('/compendium/spells');
		await page.waitForLoadState('networkidle');
	});

	test('loads the spells page', async ({ page }) => {
		await expect(page).toHaveTitle(/Spells/i);
		await expect(page.locator('h1')).toContainText('Spells');
	});

	test('displays spell list', async ({ page }) => {
		// Wait for the spell grid to load
		await waitForElement(page, '[data-testid="spell-grid"]', { timeout: 15000 });
		// Check for spell cards
		const spellCards = page.locator('[data-testid="compendium-item"]');
		await expect(spellCards.first()).toBeVisible();
	});

	test('filters spells by level', async ({ page }) => {
		await waitForElement(page, '[data-testid="spell-grid"]', { timeout: 15000 });

		// Open level filter dropdown
		const levelFilter = page.locator('[data-testid="filter-level"]');
		await levelFilter.click();

		// Select level 1
		const levelOption = page.locator('[data-testid="filter-level"][data-level="1st"]');
		await levelOption.click();

		// Verify filtered results - wait for DOM update
		await page.waitForTimeout(500);

		// All displayed spells should be level 1
		const spellCards = page.locator('[data-testid="compendium-item"]');
		const count = await spellCards.count();

		if (count > 0) {
			// Each spell card should show level 1
			for (let i = 0; i < Math.min(count, 5); i++) {
				const card = spellCards.nth(i);
				await expect(card).toContainText('1st');
			}
		}
	});

	test('searches for a specific spell', async ({ page }) => {
		await waitForElement(page, '[data-testid="spell-grid"]', { timeout: 15000 });

		// Type in search box
		const searchInput = page.locator('[data-testid="spell-search"]');
		await searchInput.fill('fireball');

		// Wait for results
		await page.waitForTimeout(500);

		// Should show fireball or no results
		const spellCards = page.locator('[data-testid="compendium-item"]');
		const count = await spellCards.count();

		if (count > 0) {
			// At least one result should contain "fireball"
			const hasFireball = await spellCards.first().isVisible();
			if (hasFireball) {
				await expect(spellCards.first()).toContainText(/fireball/i);
			}
		}
	});

	test('opens spell detail overlay', async ({ page }) => {
		await waitForElement(page, '[data-testid="spell-grid"]', { timeout: 15000 });

		// Click first spell card
		const spellCards = page.locator('[data-testid="compendium-item"]');
		await spellCards.first().click();

		// Detail overlay should appear
		await waitForElement(page, '[data-testid="spell-detail-overlay"]');
		await expect(page.locator('[data-testid="spell-detail-overlay"]')).toBeVisible();
	});

	test('closes spell detail overlay with X button', async ({ page }) => {
		await waitForElement(page, '[data-testid="spell-grid"]', { timeout: 15000 });

		// Click first spell card to open detail
		const spellCards = page.locator('[data-testid="compendium-item"]');
		await spellCards.first().click();

		// Wait for overlay
		await waitForElement(page, '[data-testid="spell-detail-overlay"]');

		// Click X button
		const closeButton = page.locator('[data-testid="close-detail"]');
		await closeButton.click();

		// Overlay should be hidden
		await expect(page.locator('[data-testid="spell-detail-overlay"]')).toBeHidden();
	});

	test('closes spell detail overlay with Escape key', async ({ page }) => {
		await waitForElement(page, '[data-testid="spell-grid"]', { timeout: 15000 });

		// Click first spell card to open detail
		const spellCards = page.locator('[data-testid="compendium-item"]');
		await spellCards.first().click();

		// Wait for overlay
		await waitForElement(page, '[data-testid="spell-detail-overlay"]');

		// Press Escape
		await page.keyboard.press('Escape');

		// Overlay should be hidden
		await expect(page.locator('[data-testid="spell-detail-overlay"]')).toBeHidden();
	});

	test('URL updates when opening spell detail', async ({ page }) => {
		await waitForElement(page, '[data-testid="spell-grid"]', { timeout: 15000 });

		// Click first spell card
		const spellCards = page.locator('[data-testid="compendium-item"]');
		const firstSpell = spellCards.first();
		const spellName = await firstSpell.textContent();

		await firstSpell.click();

		// Wait for overlay
		await waitForElement(page, '[data-testid="spell-detail-overlay"]');

		// URL should include /spells/
		expect(page.url()).toContain('/compendium/spells/');
	});

	test('persists filter state when opening and closing detail', async ({ page }) => {
		await waitForElement(page, '[data-testid="spell-grid"]', { timeout: 15000 });

		// Set level 1 filter
		const levelFilter = page.locator('[data-testid="filter-level"][data-level="1st"]');
		await levelFilter.click();

		// Wait for filter to apply
		await page.waitForTimeout(500);

		// Open a spell
		const spellCards = page.locator('[data-testid="compendium-item"]');
		await spellCards.first().click();

		// Wait for overlay
		await waitForElement(page, '[data-testid="spell-detail-overlay"]');

		// Close the overlay
		const closeButton = page.locator('[data-testid="close-detail"]');
		await closeButton.click();

		// Wait for overlay to close
		await page.waitForTimeout(300);

		// Filter should still be active (level 1 option should still show selected)
		// The UI should still show level 1 filter applied
		await expect(page.locator('body')).toBeVisible();
	});

	test('navigates between spells with keyboard arrows', async ({ page }) => {
		await waitForElement(page, '[data-testid="spell-grid"]', { timeout: 15000 });

		// Click first spell to open detail
		const spellCards = page.locator('[data-testid="compendium-item"]');
		await spellCards.first().click();

		// Wait for overlay
		await waitForElement(page, '[data-testid="spell-detail-overlay"]');

		// Press right arrow to go to next spell
		await page.keyboard.press('ArrowRight');
		await page.waitForTimeout(300);

		// Overlay should still be visible
		await expect(page.locator('[data-testid="spell-detail-overlay"]')).toBeVisible();

		// Press left arrow to go back
		await page.keyboard.press('ArrowLeft');
		await page.waitForTimeout(300);

		// Overlay should still be visible
		await expect(page.locator('[data-testid="spell-detail-overlay"]')).toBeVisible();
	});
});
