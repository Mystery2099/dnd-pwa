import { describe, it, expect } from 'vitest';
import {
	CompendiumQueryParser,
	type QueryOptions
} from '$lib/server/db/repositories/CompendiumQueryParser';

describe('CompendiumQueryParser', () => {
	describe('parseQuery', () => {
		it('should return default values for empty URL', () => {
			const url = new URL('http://localhost:5173/compendium/spells');
			const result = CompendiumQueryParser.parseQuery(url);

			expect(result.limit).toBe(50);
			expect(result.offset).toBe(0);
			expect(result.search).toBeUndefined();
			expect(result.sortBy).toBe('name');
			expect(result.sortOrder).toBe('asc');
			expect(result.filterLogic).toBe('and');
		});

		it('should parse pagination parameters', () => {
			const url = new URL('http://localhost:5173/compendium/spells?limit=20&offset=40');
			const result = CompendiumQueryParser.parseQuery(url);

			expect(result.limit).toBe(20);
			expect(result.offset).toBe(40);
		});

		it('should cap limit at 100', () => {
			const url = new URL('http://localhost:5173/compendium/spells?limit=200');
			const result = CompendiumQueryParser.parseQuery(url);

			expect(result.limit).toBe(100);
		});

		it('should parse search term', () => {
			const url = new URL('http://localhost:5173/compendium/spells?search=fireball');
			const result = CompendiumQueryParser.parseQuery(url);

			expect(result.search).toBe('fireball');
		});

		it('should parse sort options', () => {
			const url = new URL(
				'http://localhost:5173/compendium/spells?sortBy=spellLevel&sortOrder=desc'
			);
			const result = CompendiumQueryParser.parseQuery(url);

			expect(result.sortBy).toBe('spellLevel');
			expect(result.sortOrder).toBe('desc');
		});

		it('should parse filter logic', () => {
			const url = new URL('http://localhost:5173/compendium/spells?logic=or');
			const result = CompendiumQueryParser.parseQuery(url);

			expect(result.filterLogic).toBe('or');
		});

		it('should parse spell levels', () => {
			const url = new URL('http://localhost:5173/compendium/spells?levels=1,2,3,Cantrip');
			const result = CompendiumQueryParser.parseQuery(url);

			expect(result.filters?.spellLevel).toEqual([1, 2, 3, 0]);
		});

		it('should handle ordinal spell levels', () => {
			const url = new URL('http://localhost:5173/compendium/spells?levels=1st,2nd,3rd');
			const result = CompendiumQueryParser.parseQuery(url);

			expect(result.filters?.spellLevel).toEqual([1, 2, 3]);
		});

		it('should parse CSV filters', () => {
			const url = new URL(
				'http://localhost:5173/compendium/spells?schools=Evocation,Abjuration&types=Dragon,Beast&sizes=Huge,Gargantuan'
			);
			const result = CompendiumQueryParser.parseQuery(url);

			expect(result.filters?.spellSchool).toEqual(['Evocation', 'Abjuration']);
			expect(result.filters?.type).toEqual(['Dragon', 'Beast']);
			expect(result.filters?.monsterSize).toEqual(['Huge', 'Gargantuan']);
		});

		it('should merge with default options', () => {
			const url = new URL('http://localhost:5173/compendium/spells');
			const defaultOptions: Partial<QueryOptions> = {
				limit: 25,
				sortBy: 'spellLevel',
				filters: {
					spellSchool: ['Evocation']
				}
			};

			const result = CompendiumQueryParser.parseQuery(url, defaultOptions);

			expect(result.limit).toBe(25);
			expect(result.sortBy).toBe('spellLevel');
			// URL params override defaults
			expect(result.filters?.spellSchool).toBeUndefined();
		});

		it('should override defaults with URL params', () => {
			const url = new URL('http://localhost:5173/compendium/spells?limit=100&sortBy=name');
			const defaultOptions: Partial<QueryOptions> = {
				limit: 25,
				sortBy: 'spellLevel'
			};

			const result = CompendiumQueryParser.parseQuery(url, defaultOptions);

			expect(result.limit).toBe(100);
			expect(result.sortBy).toBe('name');
		});
	});

	describe('toSearchParams', () => {
		it('should convert query options to URL params', () => {
			const options: QueryOptions = {
				limit: 25,
				offset: 50,
				search: 'fire',
				sortBy: 'spellLevel',
				sortOrder: 'desc',
				filterLogic: 'or',
				filters: {
					spellLevel: [1, 2],
					spellSchool: ['Evocation']
				}
			};

			const params = CompendiumQueryParser.toSearchParams(options);

			expect(params.get('limit')).toBe('25');
			expect(params.get('offset')).toBe('50');
			expect(params.get('search')).toBe('fire');
			expect(params.get('sortBy')).toBe('spellLevel');
			expect(params.get('sortOrder')).toBe('desc');
			expect(params.get('logic')).toBe('or');
			expect(params.get('levels')).toBe('1,2');
			expect(params.get('schools')).toBe('Evocation');
		});

		it('should not include defaults', () => {
			const options: QueryOptions = {
				limit: 50,
				offset: 0,
				sortBy: 'name',
				sortOrder: 'asc',
				filterLogic: 'and'
			};

			const params = CompendiumQueryParser.toSearchParams(options);

			expect(params.toString()).toBe('');
		});

		it('should handle Cantrip level', () => {
			const options: QueryOptions = {
				filters: {
					spellLevel: [0, 3]
				}
			};

			const params = CompendiumQueryParser.toSearchParams(options);

			expect(params.get('levels')).toBe('Cantrip,3');
		});

		it('should handle empty filters', () => {
			const options: QueryOptions = {
				filters: {}
			};

			const params = CompendiumQueryParser.toSearchParams(options);

			expect(params.has('levels')).toBe(false);
			expect(params.has('schools')).toBe(false);
		});
	});

	describe('createUrl', () => {
		it('should create full URL with params', () => {
			const options: QueryOptions = {
				search: 'fireball',
				limit: 20
			};

			const url = CompendiumQueryParser.createUrl(
				'http://localhost:5173/compendium/spells',
				options
			);

			// URL params order doesn't matter
			expect(url).toContain('search=fireball');
			expect(url).toContain('limit=20');
			expect(url.startsWith('http://localhost:5173/compendium/spells')).toBe(true);
		});

		it('should preserve existing URL params', () => {
			const options: QueryOptions = {
				search: 'lightning'
			};

			const url = CompendiumQueryParser.createUrl(
				'http://localhost:5173/compendium/spells?sortBy=name',
				options
			);

			expect(url).toContain('search=lightning');
			expect(url).toContain('sortBy=name');
		});
	});

	describe('areEqual', () => {
		it('should return true for equal options', () => {
			const a: QueryOptions = { limit: 50, offset: 0 };
			const b: QueryOptions = { limit: 50, offset: 0 };

			expect(CompendiumQueryParser.areEqual(a, b)).toBe(true);
		});

		it('should return false for different options', () => {
			const a: QueryOptions = { limit: 50 };
			const b: QueryOptions = { limit: 100 };

			expect(CompendiumQueryParser.areEqual(a, b)).toBe(false);
		});

		it('should compare nested filters', () => {
			const a: QueryOptions = {
				filters: { spellLevel: [1, 2] }
			};
			const b: QueryOptions = {
				filters: { spellLevel: [1, 2] }
			};
			const c: QueryOptions = {
				filters: { spellLevel: [1, 3] }
			};

			expect(CompendiumQueryParser.areEqual(a, b)).toBe(true);
			expect(CompendiumQueryParser.areEqual(a, c)).toBe(false);
		});
	});

	describe('modify', () => {
		it('should create new options with changes', () => {
			const original: QueryOptions = {
				limit: 50,
				offset: 0,
				filters: {
					spellSchool: ['Evocation']
				}
			};

			const modified = CompendiumQueryParser.modify(original, {
				limit: 100,
				filters: {
					spellLevel: [3]
				}
			});

			expect(modified.limit).toBe(100);
			expect(modified.offset).toBe(0);
			// modify replaces filters, not merges
			expect(modified.filters?.spellSchool).toBeUndefined();
			expect(modified.filters?.spellLevel).toEqual([3]);
		});

		it('should not mutate original', () => {
			const original: QueryOptions = {
				limit: 50
			};

			CompendiumQueryParser.modify(original, { limit: 100 });

			expect(original.limit).toBe(50);
		});
	});

	describe('parseSpellLevels edge cases', () => {
		it('should handle empty string', () => {
			const url = new URL('http://localhost:5173/compendium/spells?levels=');
			const result = CompendiumQueryParser.parseQuery(url);

			expect(result.filters?.spellLevel).toBeUndefined();
		});

		it('should handle invalid values', () => {
			const url = new URL('http://localhost:5173/compendium/spells?levels=invalid,1,alsoInvalid');
			const result = CompendiumQueryParser.parseQuery(url);

			expect(result.filters?.spellLevel).toEqual([1]);
		});

		it('should handle negative numbers', () => {
			const url = new URL('http://localhost:5173/compendium/spells?levels=-1,1,2');
			const result = CompendiumQueryParser.parseQuery(url);

			// Negative values are passed through (validation happens elsewhere)
			expect(result.filters?.spellLevel).toEqual([-1, 1, 2]);
		});

		it('should handle case variations of Cantrip', () => {
			const url1 = new URL('http://localhost:5173/compendium/spells?levels=Cantrip');
			const url2 = new URL('http://localhost:5173/compendium/spells?levels=cantrip');

			const result1 = CompendiumQueryParser.parseQuery(url1);
			const result2 = CompendiumQueryParser.parseQuery(url2);

			expect(result1.filters?.spellLevel).toEqual([0]);
			expect(result2.filters?.spellLevel).toEqual([0]);
		});
	});

	describe('parseCSV edge cases', () => {
		it('should trim whitespace', () => {
			const url = new URL(
				'http://localhost:5173/compendium/spells?schools=Evocation,%20Abjuration'
			);
			const result = CompendiumQueryParser.parseQuery(url);

			expect(result.filters?.spellSchool).toEqual(['Evocation', 'Abjuration']);
		});

		it('should filter empty strings', () => {
			const url = new URL('http://localhost:5173/compendium/spells?schools=Evocation,,Abjuration');
			const result = CompendiumQueryParser.parseQuery(url);

			expect(result.filters?.spellSchool).toEqual(['Evocation', 'Abjuration']);
		});
	});
});
