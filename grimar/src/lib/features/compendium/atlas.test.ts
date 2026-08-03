import { describe, expect, it } from 'vitest';
import {
	CHALLENGE_RATING_OPTIONS,
	DEFAULT_ATLAS_STATE,
	createAtlasHref,
	getActiveFilterLabels,
	getAtlasScopeCounts,
	getAtlasSortOptions,
	parseAtlasState,
	type AtlasState
} from './atlas';

function state(overrides: Partial<AtlasState>): AtlasState {
	return { ...DEFAULT_ATLAS_STATE, ...overrides };
}

describe('parseAtlasState', () => {
	it.each([
		['zero', '0'],
		['negative', '-1'],
		['fractional', '1.5'],
		['infinite', 'Infinity'],
		['unsafe', String(Number.MAX_SAFE_INTEGER + 1)]
	])('defaults a %s page to page one', (_label, page) => {
		expect(parseAtlasState(new URLSearchParams({ page })).page).toBe(1);
	});

	it('accepts a positive safe integer page', () => {
		expect(parseAtlasState(new URLSearchParams({ page: '42' })).page).toBe(42);
	});
});

describe('createAtlasHref', () => {
	it.each([
		[
			'selected spell type',
			state({ scope: 'all', selectedType: 'spells', spellLevel: '3', spellSchool: 'evocation' }),
			{ spellLevel: '3', spellSchool: 'evocation' }
		],
		[
			'selected creature type',
			state({
				scope: 'all',
				selectedType: 'creatures',
				creatureType: 'dragon',
				challengeRating: '10+'
			}),
			{ creatureType: 'dragon', challengeRating: '10+' }
		],
		[
			'selected item type',
			state({
				scope: 'all',
				selectedType: 'magicitems',
				itemRarity: 'rare',
				attunement: 'required'
			}),
			{ itemRarity: 'rare', attunement: 'required' }
		],
		['scope fallback', state({ scope: 'spells', spellLevel: '2' }), { spellLevel: '2' }]
	] as const)(
		'serializes filters from the effective %s context',
		(_label, atlasState, expected) => {
			const params = new URL(createAtlasHref(atlasState), 'https://example.test').searchParams;

			for (const [key, value] of Object.entries(expected)) {
				expect(params.get(key)).toBe(value);
			}
		}
	);
});

it('keeps class custom sorts available for class scope', () => {
	const options = getAtlasSortOptions(state({ scope: 'classes' }));

	expect(options.map((option) => option.value)).toEqual(
		expect.arrayContaining(['class-hit-die-asc', 'class-hit-die-desc'])
	);
});

it('uses an explicit 10+ CR value while preserving its label', () => {
	expect(CHALLENGE_RATING_OPTIONS.at(-1)).toEqual({ label: '10+', value: '10+' });
	expect(getActiveFilterLabels(state({ scope: 'monsters', challengeRating: '10+' }))).toContain(
		'CR 10+'
	);
});

it('counts only base classes in class and all scopes', () => {
	const counts = getAtlasScopeCounts({
		spells: 5,
		classes: 3,
		subclasses: 7
	});

	expect(counts.classes).toBe(3);
	expect(counts.all).toBe(8);
});
