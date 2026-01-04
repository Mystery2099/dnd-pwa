import { describe, it, expect, beforeEach } from 'vitest';
import { SearchIndexer } from './SearchIndexer';
import type { CompendiumItem } from '$lib/core/types/compendium/item';

describe('SearchIndexer', () => {
	let indexer: SearchIndexer<CompendiumItem>;
	let mockItems: CompendiumItem[];

	beforeEach(() => {
		indexer = new SearchIndexer<CompendiumItem>();

		mockItems = [
			{
				id: 1,
				name: 'Fireball',
				type: 'spell',
				summary: 'A bright streak flashes from your pointing finger',
				details: 'A bright streak flashes from your pointing finger to a point you choose',
				source: 'SRD',
				externalId: 'fireball',
				createdBy: null,
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				id: 2,
				name: 'Fire Bolt',
				type: 'spell',
				summary: 'You hurl a mote of fire',
				details: 'You hurl a mote of fire at a creature or object within range',
				source: 'SRD',
				externalId: 'fire-bolt',
				createdBy: null,
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				id: 3,
				name: 'Ice Storm',
				type: 'spell',
				summary: 'A hail of rock-hard ice pounds to the ground',
				details: 'A hail of rock-hard ice pounds to the ground in a 20-foot-radius',
				source: 'SRD',
				externalId: 'ice-storm',
				createdBy: null,
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				id: 4,
				name: 'Magic Missile',
				type: 'spell',
				summary: 'You create three glowing darts of magical force',
				details: 'You create three glowing darts of magical force that strike targets',
				source: 'SRD',
				externalId: 'magic-missile',
				createdBy: null,
				createdAt: new Date(),
				updatedAt: new Date()
			}
		];
	});

	describe('buildIndex', () => {
		it('should build index from items', () => {
			indexer.buildIndex(mockItems);
			expect(indexer.isIndexed()).toBe(true);
		});

		it('should store items for retrieval', () => {
			indexer.buildIndex(mockItems);
			expect(indexer.getAll()).toEqual(mockItems);
		});
	});

	describe('search', () => {
		beforeEach(() => {
			indexer.buildIndex(mockItems);
		});

		it('should return all items when query is empty', () => {
			const results = indexer.search('');
			expect(results).toEqual(mockItems);
		});

		it('should return all items when query is whitespace', () => {
			const results = indexer.search('   ');
			expect(results).toEqual(mockItems);
		});

		it('should find exact matches', () => {
			const results = indexer.search('Fireball');
			expect(results.length).toBeGreaterThan(0);
			expect(results[0].name).toBe('Fireball');
		});

		it('should find partial matches', () => {
			const results = indexer.search('Fire');
			expect(results.length).toBeGreaterThanOrEqual(2);
			const names = results.map((r) => r.name);
			expect(names).toContain('Fireball');
			expect(names).toContain('Fire Bolt');
		});

		it('should handle fuzzy matching for typos', () => {
			const results = indexer.search('Firebll'); // Missing 'a'
			expect(results.length).toBeGreaterThan(0);
			expect(results[0].name).toBe('Fireball');
		});

		it('should search in summary field', () => {
			const results = indexer.search('hurl');
			expect(results.length).toBeGreaterThan(0);
			expect(results[0].name).toBe('Fire Bolt');
		});

		it('should search in details field', () => {
			const results = indexer.search('20-foot-radius');
			expect(results.length).toBeGreaterThan(0);
			expect(results[0].name).toBe('Ice Storm');
		});

		it('should return results sorted by relevance', () => {
			const results = indexer.search('fire');
			// Exact name matches should rank higher than summary/details matches
			expect(results[0].name).toMatch(/Fire/i);
		});

		it('should handle case-insensitive search', () => {
			const results = indexer.search('FIREBALL');
			expect(results.length).toBeGreaterThan(0);
			expect(results[0].name).toBe('Fireball');
		});

		it('should return empty array when no matches found', () => {
			const results = indexer.search('xyzabc123');
			expect(results).toEqual([]);
		});
	});

	describe('getAll', () => {
		it('should return all items', () => {
			indexer.buildIndex(mockItems);
			expect(indexer.getAll()).toEqual(mockItems);
		});

		it('should return empty array when no index built', () => {
			expect(indexer.getAll()).toEqual([]);
		});
	});

	describe('isIndexed', () => {
		it('should return false when no index built', () => {
			expect(indexer.isIndexed()).toBe(false);
		});

		it('should return true after building index', () => {
			indexer.buildIndex(mockItems);
			expect(indexer.isIndexed()).toBe(true);
		});

		it('should return false after clearing index', () => {
			indexer.buildIndex(mockItems);
			indexer.clear();
			expect(indexer.isIndexed()).toBe(false);
		});
	});

	describe('clear', () => {
		it('should clear the index', () => {
			indexer.buildIndex(mockItems);
			indexer.clear();
			expect(indexer.isIndexed()).toBe(false);
			expect(indexer.getAll()).toEqual([]);
		});
	});
});

