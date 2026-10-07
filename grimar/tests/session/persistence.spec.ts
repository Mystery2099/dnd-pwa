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

		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/settings');
		const menu = page.getByRole('button', { name: 'Open navigation' });
		await menu.click();
		const dialog = page.getByRole('dialog', { name: 'Navigation' });
		await expect(dialog).toBeVisible();
		await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
		const lockedPosition = await page.evaluate(() => scrollY);
		await page.mouse.move(385, 650);
		await page.mouse.wheel(0, 300);
		await page.waitForTimeout(200); // Wheel events are processed asynchronously.
		expect(await page.evaluate(() => scrollY)).toBe(lockedPosition);
		for (let i = 0; i < 8; i++) {
			await page.keyboard.press('Tab');
			await expect
				.poll(() => dialog.evaluate((el) => el.contains(document.activeElement)))
				.toBe(true);
		}
		await page.keyboard.press('Escape');
		await expect(dialog).toBeHidden();
		await expect(menu).toBeFocused();
		await page.mouse.move(385, 650);
		await page.mouse.wheel(0, 300);
		await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(lockedPosition);
		await menu.click();
		await dialog.getByRole('link', { name: 'Characters', exact: true }).click();
		await expect(page).toHaveURL(/\/characters$/);
		await expect(dialog).toBeHidden();
		await page.goto('/settings');
		await menu.click();
		await expect(dialog).toBeVisible();
		await page.setViewportSize({ width: 1280, height: 900 });
		await expect(dialog).toBeHidden();
		const desktopPosition = await page.evaluate(() => scrollY);
		await page.mouse.move(1275, 650);
		await page.mouse.wheel(0, 300);
		await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(desktopPosition);
	});
});
