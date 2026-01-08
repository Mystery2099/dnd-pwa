import { describe, it, expect } from 'vitest';
import { CompendiumFilterStore } from './filter.svelte';

describe('CompendiumFilterStore.apply', () => {
	const config = {
		setParams: { level: 'spellLevel', school: 'spellSchool' },
		validSortBy: ['name', 'spellLevel'],
		defaults: { sortBy: 'name', sortOrder: 'asc' }
	};

	const items = [
		{
			id: 1,
			name: 'Fireball',
			type: 'spell',
			spellLevel: 3,
			spellSchool: 'Evocation',
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
			name: 'Cure Wounds',
			type: 'spell',
			spellLevel: 1,
			spellSchool: 'Evocation',
			summary: 'A creature you touch regains hit points',
			details: 'A creature you touch regains a number of hit points',
			source: 'SRD',
			externalId: 'cure-wounds',
			createdBy: null,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: 3,
			name: 'Shield',
			type: 'spell',
			spellLevel: 1,
			spellSchool: 'Abjuration',
			summary: 'An invisible barrier of magical force appears',
			details: 'An invisible barrier of magical force appears and protects you',
			source: 'SRD',
			externalId: 'shield',
			createdBy: null,
			createdAt: new Date(),
			updatedAt: new Date()
		}
	];

	it('filters by search term', () => {
		const store = new CompendiumFilterStore(config as any);
		store.setSearchTerm('bright streak');
		const result = store.apply(items);
		expect(result.length).toBeGreaterThan(0);
		expect(result[0].name).toBe('Fireball');
	});

	it('filters by faceted sets', () => {
		const store = new CompendiumFilterStore(config as any);
		store.toggle('spellLevel', '1');
		store.toggle('spellSchool', 'Evocation');
		const result = store.apply(items);
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe('Cure Wounds');
	});

	it('sorts items', () => {
		const store = new CompendiumFilterStore(config as any);
		store.setSort('spellLevel', 'asc');
		const result = store.apply(items);
		expect(result[0].spellLevel).toBe(1);
		expect(result[2].spellLevel).toBe(3);
	});
});
