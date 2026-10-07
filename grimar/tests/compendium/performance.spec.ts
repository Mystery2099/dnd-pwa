import { test, expect } from '../fixtures';

test('browsing uses compact responses without speculative detail API requests', async ({
	page
}) => {
	const detailRequests: string[] = [];
	page.on('request', (request) => {
		if (new URL(request.url()).pathname.startsWith('/api/compendium/spells/')) {
			detailRequests.push(request.url());
		}
	});
	const listResponse = page.waitForResponse((response) => {
		const url = new URL(response.url());
		return url.pathname === '/api/compendium/items' && url.searchParams.get('view') === 'summary';
	});
	await page.goto('/compendium/spells');
	const payload = await (await listResponse).json();
	expect(payload.total).toBe(3);
	expect(payload.items[0].item.data).toBeUndefined();
	expect(payload.items[0].presentation.description).toBeTruthy();
	await expect(page.locator('a[href="/compendium/spells/srd_fireball"]')).toBeVisible();
	// Give visibility observers and offline-persistence timers a chance to run.
	await page.waitForTimeout(1200);
	expect(detailRequests).toEqual([]);
	await page.locator('a[href="/compendium/spells/srd_fireball"]').hover();
	await page.locator('a[href="/compendium/spells/srd_fireball"]').click();
	await expect(page.locator('h1')).toContainText('Fireball');
	expect(detailRequests).toEqual([]);
});

test('search and filtering remain correct after switching compact result sets', async ({
	page
}) => {
	const initialList = page.waitForResponse((response) =>
		new URL(response.url()).pathname === '/api/compendium/items'
	);
	await page.goto('/compendium/spells');
	await initialList;
	await expect(page.locator('a[href="/compendium/spells/srd_magic_missile"]')).toBeVisible();
	const search = page.getByPlaceholder(/Search spells/i);
	await search.fill('fire');
	await expect(page.locator('a[href="/compendium/spells/srd_fireball"]')).toBeVisible();
	await expect(page.locator('a[href="/compendium/spells/srd_magic_missile"]')).toHaveCount(0);
	await search.fill('magic');
	await expect(page.locator('a[href="/compendium/spells/srd_magic_missile"]')).toBeVisible();
	await expect(page.locator('a[href="/compendium/spells/srd_fireball"]')).toHaveCount(0);
});

test('invalid pagination cannot trigger an unbounded list response', async ({ request }) => {
	for (const parameter of ['limit=-1', 'limit=0', 'page=-1', 'limit=2.5']) {
		const response = await request.get(`/api/compendium/items?type=spells&${parameter}`);
		expect(response.status()).toBe(400);
	}
	const response = await request.get('/api/compendium/items?type=spells&all=true');
	expect(response.status()).toBe(200);
	const payload = await response.json();
	expect(payload.total).toBe(3);
	expect(payload.items).toHaveLength(3);
	expect(payload.items[0].item.data).toBeDefined();
});
