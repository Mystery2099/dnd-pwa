import { test, expect } from '@playwright/test';

test.describe('Compendium API', () => {
	const headers = {
		'X-Authentik-Username': 'test-dm'
	};

	test('should return 400 if type is missing', async ({ request }) => {
		const response = await request.get('/api/compendium/items', { headers });
		expect(response.status()).toBe(400);
		const body = await response.json();
		expect(body.error).toBe('Missing type parameter');
	});

	test('should return spells list', async ({ request }) => {
		const response = await request.get('/api/compendium/items?type=spells&limit=5', { headers });
		expect(response.status()).toBe(200);
		const body = await response.json();

		expect(body.items).toBeDefined();
		expect(Array.isArray(body.items)).toBe(true);
		expect(body.pagination).toBeDefined();
		expect(body.pagination.limit).toBe(5);

		// Check first item structure (basic check)
		if (body.items.length > 0) {
			const item = body.items[0];
			expect(item.type).toBe('spell');
			expect(item.name).toBeDefined();
		}
	});

	test('should filter by level', async ({ request }) => {
		// Assuming there are level 1 spells in the seeded DB
		const response = await request.get('/api/compendium/items?type=spells&spellLevel=1&limit=5', {
			headers
		});
		expect(response.status()).toBe(200);
		const body = await response.json();

		// Verify all returned items are level 1
		for (const item of body.items) {
			expect(item.spellLevel).toBe(1);
		}
	});

	test('should filter by search term', async ({ request }) => {
		// Search for something likely to exist, e.g., "Fire"
		const response = await request.get('/api/compendium/items?type=spells&search=Fire&limit=5', {
			headers
		});
		expect(response.status()).toBe(200);
		const body = await response.json();

		// Verify items match search
		for (const item of body.items) {
			const nameMatch = item.name.toLowerCase().includes('fire');
			const descMatch = item.summary && item.summary.toLowerCase().includes('fire');
			expect(nameMatch || descMatch).toBe(true);
		}
	});

	test('should return monsters list', async ({ request }) => {
		const response = await request.get('/api/compendium/items?type=monsters&limit=5', { headers });
		expect(response.status()).toBe(200);
		const body = await response.json();

		if (body.items.length > 0) {
			expect(body.items[0].type).toBe('monster');
		}
	});
});
