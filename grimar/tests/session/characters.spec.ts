import { test, expect } from '../fixtures';

test('character lifecycle preserves changes, rejects stale saves, and scopes sheets to their owner', async ({
	page
}) => {
	await page.goto('/characters/new');
	await page.getByLabel('Character name', { exact: true }).fill('Browser adventurer');
	await page.getByRole('button', { name: 'Create Character', exact: true }).click();
	await expect(page).toHaveURL(/\/characters\/\d+$/);
	const url = page.url();
	await page.getByLabel('Strength', { exact: true }).fill('18');
	await page.getByLabel('Maximum HP', { exact: true }).fill('30');
	await page.getByLabel('Current HP', { exact: true }).fill('20');
	await page.getByLabel('Temporary HP', { exact: true }).fill('5');
	await page.getByLabel('Amount', { exact: true }).fill('8');
	await page.getByRole('button', { name: 'Damage', exact: true }).click();
	await expect(page.getByLabel('Current HP', { exact: true })).toHaveValue('17');
	await page.getByLabel('Acrobatics', { exact: true }).selectOption('2');
	await page.getByLabel('Notes', { exact: true }).fill('Keep this adventure journal.');
	const stalePayload = await page.locator('input[name="payload"]').inputValue();
	const oldRevision = await page.locator('input[name="revision"]').first().inputValue();
	await page.getByRole('button', { name: 'Save character', exact: true }).click();
	await expect(page.getByText('Character saved.', { exact: true })).toBeVisible();
	const stale = await page.request.post(`${url}?/save`, {
		form: { payload: stalePayload, revision: oldRevision },
		headers: { Origin: 'http://localhost:5173', 'x-sveltekit-action': 'true' }
	});
	expect(await stale.json()).toMatchObject({ type: 'failure', status: 409 });
	await page.reload();
	await expect(page.getByLabel('Notes', { exact: true })).toHaveValue(
		'Keep this adventure journal.'
	);
	await expect(page.getByLabel('Current HP', { exact: true })).toHaveValue('17');
	await expect(page.getByLabel('Strength', { exact: true })).toHaveValue('18');
	await expect(page.getByLabel('Acrobatics', { exact: true })).toHaveValue('2');
	await page.setViewportSize({ width: 390, height: 844 });
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
	await page.getByRole('button', { name: 'Roll dice', exact: true }).click();
	await expect(page.locator('ol[aria-live="polite"] li')).toHaveCount(1);
	await page.screenshot({ path: '/tmp/grimar-character-mobile.png', fullPage: true });
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.screenshot({ path: '/tmp/grimar-character-desktop.png', fullPage: true });
	await page.getByLabel('Notes', { exact: true }).fill('Offline draft stays here.');
	await page.context().setOffline(true);
	await page.getByRole('button', { name: 'Save character', exact: true }).click();
	await expect(page.getByRole('alert')).toContainText('Could not save');
	await expect(page.getByLabel('Notes', { exact: true })).toHaveValue('Offline draft stays here.');
	await page.context().setOffline(false);
	await page.getByRole('button', { name: 'Save character', exact: true }).click();
	await expect(page.getByText('All changes saved.', { exact: true })).toBeVisible();
	const other = await page.request.get(url, {
		headers: { 'X-Authentik-Username': 'other-player' }
	});
	expect(other.status()).toBe(404);
	const otherSave = await page.request.post(`${url}?/save`, {
		form: { payload: stalePayload, revision: '1' },
		headers: {
			Origin: 'http://localhost:5173',
			'X-Authentik-Username': 'other-player',
			'x-sveltekit-action': 'true'
		}
	});
	expect(otherSave.status()).toBe(404);
	await page.getByRole('button', { name: 'Delete character', exact: true }).click();
	await page.getByRole('button', { name: 'Confirm deletion', exact: true }).click();
	await expect(page).toHaveURL(/\/characters$/);
	await expect(page.getByText('Browser adventurer', { exact: true })).toHaveCount(0);
});
