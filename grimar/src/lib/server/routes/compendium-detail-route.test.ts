import { beforeEach, describe, expect, it, vi } from 'vitest';

const getItemMock = vi.fn();
const buildCompendiumDetailPayloadMock = vi.fn();
let actualBuildCompendiumDetailPayload: typeof import('$lib/server/services/compendium/detail').buildCompendiumDetailPayload;

vi.mock('$lib/server/repositories/compendium', () => ({
	getItem: getItemMock
}));

vi.mock('$lib/server/services/compendium/detail', async (importOriginal) => {
	const actual = await importOriginal<typeof import('$lib/server/services/compendium/detail')>();
	actualBuildCompendiumDetailPayload = actual.buildCompendiumDetailPayload;
	return {
		...actual,
		buildCompendiumDetailPayload: buildCompendiumDetailPayloadMock
	};
});

describe('GET /api/compendium/[type]/[slug]', () => {
	beforeEach(() => {
		getItemMock.mockReset();
		buildCompendiumDetailPayloadMock.mockReset();
	});

	it('returns the normalized detail payload for valid requests', async () => {
		const { GET } = await import('../../../routes/api/compendium/[type]/[slug]/+server');

		getItemMock.mockResolvedValueOnce({
			key: 'common',
			type: 'languages',
			name: 'Common',
			source: 'open5e',
			documentKey: null,
			documentName: null,
			gamesystemKey: null,
			gamesystemName: null,
			publisherKey: null,
			publisherName: null,
			description: null,
			data: {
				script_language: 'http://10.147.20.240:8888/v2/languages/infernal/'
			},
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy: null
		});
		buildCompendiumDetailPayloadMock.mockImplementation(actualBuildCompendiumDetailPayload);

		const response = await GET({
			params: { type: 'languages', slug: 'common' }
		} as Parameters<typeof GET>[0]);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body.detailSchemaVersion).toBe(1);
		expect(body.item.type).toBe('languages');
		expect(body.fields).toEqual([
			expect.objectContaining({
				key: 'script_language',
				value: expect.objectContaining({
					kind: 'entity',
					type: 'languages',
					key: 'infernal',
					href: '/compendium/languages/infernal'
				})
			})
		]);
		expect(Array.isArray(body.sections)).toBe(true);
	});

	it('rejects invalid compendium types', async () => {
		const { GET } = await import('../../../routes/api/compendium/[type]/[slug]/+server');

		await expect(
			GET({
				params: { type: 'not-a-type', slug: 'anything' }
			} as Parameters<typeof GET>[0])
		).rejects.toMatchObject({
			status: 400
		});
	});

	it('returns 404 when the item is missing', async () => {
		const { GET } = await import('../../../routes/api/compendium/[type]/[slug]/+server');

		getItemMock.mockResolvedValueOnce(null);

		await expect(
			GET({
				params: { type: 'languages', slug: 'missing' }
			} as Parameters<typeof GET>[0])
		).rejects.toMatchObject({
			status: 404
		});
	});

	it('returns a controlled 500 response when payload normalization fails', async () => {
		const { GET } = await import('../../../routes/api/compendium/[type]/[slug]/+server');

		getItemMock.mockResolvedValueOnce({
			key: 'common',
			type: 'languages',
			name: 'Common',
			source: 'open5e',
			documentKey: null,
			documentName: null,
			gamesystemKey: null,
			gamesystemName: null,
			publisherKey: null,
			publisherName: null,
			description: null,
			data: {},
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy: null
		});
		buildCompendiumDetailPayloadMock.mockImplementation(() => {
			throw new Error('malformed data');
		});

		const response = await GET({
			params: { type: 'languages', slug: 'common' }
		} as Parameters<typeof GET>[0]);

		expect(response.status).toBe(500);
		await expect(response.json()).resolves.toEqual({
			error: 'Failed to build compendium payload'
		});
	});
});
