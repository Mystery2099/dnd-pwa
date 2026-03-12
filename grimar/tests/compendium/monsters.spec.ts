import { test, expect } from '../fixtures';

test.describe('Compendium Creatures - Smoke Tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/compendium/creatures');
		await page.waitForLoadState('domcontentloaded');
	});

	test('loads the creatures page', async ({ page }) => {
		await expect(page).toHaveTitle(/Creatures/i);
		await expect(page.locator('h1')).toContainText('Creatures');
	});

	test('displays creature list', async ({ page }) => {
		await expect(page.getByRole('link', { name: /Goblin/i })).toBeVisible({ timeout: 15000 });
		await expect(page.getByRole('link', { name: /Ancient Red Dragon/i })).toBeVisible({
			timeout: 15000
		});
	});

	test('opens creature detail page', async ({ page }) => {
		await page.locator('a[href="/compendium/creatures/srd_goblin"]').click();
		await expect(page).toHaveURL(/\/compendium\/creatures\/srd_goblin$/);
		await expect(page.locator('h1')).toContainText('Goblin');
		await expect(page.locator('text=CR 1/4')).toBeVisible();
	});

	test('can navigate to spells page', async ({ page }) => {
		await page.goto('/compendium/spells');
		await page.waitForLoadState('domcontentloaded');
		await expect(page.locator('h1')).toContainText('Spells');
	});
});
