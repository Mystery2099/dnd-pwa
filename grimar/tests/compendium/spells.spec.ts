import { test, expect } from '../fixtures';

test.describe('Compendium Spells - Smoke Tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/compendium/spells');
		await page.waitForLoadState('domcontentloaded');
	});

	test('loads the spells page', async ({ page }) => {
		await expect(page).toHaveTitle(/Spells/i);
		await expect(page.locator('h1')).toContainText('Spells');
		await expect(page.locator('text=3 items')).toBeVisible();
	});

	test('displays spell list', async ({ page }) => {
		await expect(page.locator('a[href^="/compendium/spells/"]')).toHaveCount(3);
		await expect(page.getByRole('link', { name: /Fireball/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /Magic Missile/i })).toBeVisible();
	});

	test('opens spell detail page', async ({ page }) => {
		await page.locator('a[href="/compendium/spells/srd_fireball"]').click();
		await expect(page).toHaveURL(/\/compendium\/spells\/srd_fireball$/);
		await expect(page.locator('h1')).toContainText('Fireball');
		await expect(page.getByRole('heading', { level: 2, name: 'Description' })).toBeVisible();
	});

	test('can navigate to creatures page', async ({ page }) => {
		await page.goto('/compendium/creatures');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.locator('h1')).toContainText('Creatures');
	});
});
