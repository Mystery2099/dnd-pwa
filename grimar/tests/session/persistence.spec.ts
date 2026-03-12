import { test, expect } from '../fixtures';

test.describe('Session Persistence - Smoke Tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/compendium/spells');
		await page.waitForLoadState('domcontentloaded');
	});

	test('can navigate to and from a spell detail page', async ({ page }) => {
		await page.locator('a[href="/compendium/spells/srd_fireball"]').click();
		await expect(page).toHaveURL(/\/compendium\/spells\/srd_fireball$/);
		await page.goBack();
		await expect(page).toHaveURL(/\/compendium\/spells$/);
		await expect(page.locator('h1')).toContainText('Spells');
	});

	test('can navigate to and from a creature detail page', async ({ page }) => {
		await page.goto('/compendium/creatures');
		await page.waitForLoadState('domcontentloaded');
		await page.locator('a[href="/compendium/creatures/srd_goblin"]').click();
		await expect(page).toHaveURL(/\/compendium\/creatures\/srd_goblin$/);
		await page.goBack();
		await expect(page).toHaveURL(/\/compendium\/creatures$/);
		await expect(page.locator('h1')).toContainText('Creatures');
	});

	test('page navigation works between compendium pages', async ({ page }) => {
		await expect(page.locator('h1')).toContainText('Spells');

		await page.goto('/compendium/creatures');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.locator('h1')).toContainText('Creatures');

		await page.goto('/compendium/spells');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.locator('h1')).toContainText('Spells');
	});
});
