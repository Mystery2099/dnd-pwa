import { test, expect } from '@playwright/test';

test.describe('Compendium API', () => {
	const headers = {
		'X-Authentik-Username': 'test-dm'
	};

	test('should return 400 if type is missing', async ({ request }) => {
		const response = await request.get('/api/compendium/items', { headers });
		expect(response.status()).toBe(400);
		const body = await response.json();
		expect(body.error).toBe('Type parameter is required');
	});

	test('should return spells list', async ({ request }) => {
		const response = await request.get('/api/compendium/items?type=spells&limit=5', { headers });
		expect(response.status()).toBe(200);
		const body = await response.json();

		expect(body.items).toBeDefined();
		expect(Array.isArray(body.items)).toBe(true);
		expect(body.page).toBe(1);
		expect(body.pageSize).toBe(5);
		expect(body.total).toBeGreaterThan(0);

		if (body.items.length > 0) {
			const item = body.items[0];
			expect(item.type).toBe('spells');
			expect(item.name).toBeDefined();
			expect(item.data).toBeDefined();
		}
	});

	test('should filter by level', async ({ request }) => {
		const response = await request.get('/api/compendium/items?type=spells&spellLevel=1&limit=5', {
			headers
		});
		expect(response.status()).toBe(200);
		const body = await response.json();
		expect(body.items.length).toBeGreaterThan(0);

		for (const item of body.items) {
			expect(item.data.level).toBe(1);
		}
	});

	test('should filter by search term', async ({ request }) => {
		const response = await request.get('/api/compendium/items?type=spells&search=Fire&limit=5', {
			headers
		});
		expect(response.status()).toBe(200);
		const body = await response.json();
		expect(body.items.length).toBeGreaterThan(0);

		for (const item of body.items) {
			const nameMatch = item.name.toLowerCase().includes('fire');
			const descMatch =
				typeof item.description === 'string' && item.description.toLowerCase().includes('fire');
			expect(nameMatch || descMatch).toBe(true);
		}
	});

	test('should return creatures list', async ({ request }) => {
		const response = await request.get('/api/compendium/items?type=creatures&limit=5', {
			headers
		});
		expect(response.status()).toBe(200);
		const body = await response.json();

		if (body.items.length > 0) {
			expect(body.items[0].type).toBe('creatures');
		}
	});

	test('should return normalized detail payload for a single item', async ({ request }) => {
		const response = await request.get('/api/compendium/languages/common', { headers });
		expect(response.status()).toBe(200);

		const body = await response.json();
		expect(body.detailSchemaVersion).toBe(1);
		expect(body.item).toBeDefined();
		expect(body.item.type).toBe('languages');
		expect(body.presentation).toBeDefined();
		expect(Array.isArray(body.fields)).toBe(true);
		expect(Array.isArray(body.sections)).toBe(true);

		const scriptLanguageField = body.fields.find(
			(field: { key: string }) => field.key === 'script_language'
		);
		if (scriptLanguageField) {
			expect(typeof scriptLanguageField.value).toBe('object');
			expect(scriptLanguageField.value.kind).toBe('entity');
			expect(scriptLanguageField.value.href).toMatch(/^\/compendium\/languages\//);
		}
	});
});
