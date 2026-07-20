import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core';
import { DEFAULT_ATLAS_STATE, type AtlasState } from '$lib/features/compendium/atlas';

const { getPaginatedItemsMock, getTypeCountsMock } = vi.hoisted(() => ({
	getPaginatedItemsMock: vi.fn(),
	getTypeCountsMock: vi.fn()
}));

vi.mock('$lib/server/repositories/compendium', () => ({
	getPaginatedItems: getPaginatedItemsMock,
	getTypeCounts: getTypeCountsMock
}));

function state(overrides: Partial<AtlasState>): AtlasState {
	return { ...DEFAULT_ATLAS_STATE, ...overrides };
}

describe('atlas repository queries', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getTypeCountsMock.mockResolvedValue({});
		getPaginatedItemsMock.mockResolvedValue({ items: [], total: 0 });
	});

	it.each([
		['spells', state({ scope: 'spells', search: 'fire' }), 'spells'],
		['monsters', state({ scope: 'monsters', search: 'dragon' }), 'creatures'],
		['classes', state({ scope: 'classes', search: 'wizard' }), 'classes']
	] as const)(
		'retains repository relevance ordering for scoped %s searches',
		async (_label, atlasState, type) => {
			const { getAtlasPagePayload } = await import('./atlas');

			await getAtlasPagePayload(atlasState);

			expect(getPaginatedItemsMock).toHaveBeenCalledWith(
				type,
				expect.objectContaining({
					filters: expect.objectContaining({
						search: atlasState.search,
						sortBy: 'name',
						sortOrder: 'asc'
					})
				})
			);
		}
	);
});

describe('merged atlas query filters', () => {
	const dialect = new SQLiteSyncDialect();

	it.each([
		[
			'spell level and school',
			state({
				scope: 'spells',
				spellLevel: '3',
				spellSchool: 'evocation',
				sort: 'spell-level-asc'
			}),
			['$.level', '$.school.key', '$.school.name'],
			[3, 'evocation']
		],
		[
			'creature type and exact CR',
			state({
				scope: 'monsters',
				creatureType: 'dragon',
				challengeRating: '9',
				sort: 'creature-cr-desc'
			}),
			['$.type.key', '$.challenge_rating_decimal'],
			['dragon', 9]
		],
		[
			'creature CR 10+',
			state({ scope: 'monsters', challengeRating: '10+', sort: 'creature-cr-asc' }),
			['$.challenge_rating_decimal', '>='],
			[10]
		]
	] as const)('applies %s', async (_label, atlasState, expectedSql, expectedParams) => {
		const { buildMergedWhereClause, getScopeTypes } = await import('./atlas');
		const query = dialect.sqlToQuery(buildMergedWhereClause(atlasState, getScopeTypes(atlasState)));

		for (const fragment of expectedSql) {
			expect(query.sql).toContain(fragment);
		}
		for (const value of expectedParams) {
			expect(query.params).toContain(value);
		}
	});
});

it('does not include all magic items in Gear', async () => {
	const { getScopeTypes } = await import('./atlas');

	expect(getScopeTypes(state({ scope: 'items', itemKind: 'gear' }))).toEqual(['items']);
});
