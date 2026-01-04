import { describe, it, expect } from 'vitest';
import { CompendiumFilterStore } from './filter.svelte';

describe('CompendiumFilterStore.apply', () => {
    const config = {
        setParams: { 'level': 'spellLevel', 'school': 'spellSchool' },
        validSortBy: ['name', 'spellLevel'],
        defaults: { sortBy: 'name', sortOrder: 'asc' }
    };

    const items = [
        { name: 'Fireball', spellLevel: 3, spellSchool: 'Evocation' },
        { name: 'Cure Wounds', spellLevel: 1, spellSchool: 'Evocation' },
        { name: 'Shield', spellLevel: 1, spellSchool: 'Abjuration' },
    ];

    it('filters by search term', () => {
        const store = new CompendiumFilterStore(config as any);
        store.setSearchTerm('fire');
        const result = store.apply(items);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Fireball');
    });

    it('filters by faceted sets (AND logic)', () => {
        const store = new CompendiumFilterStore(config as any);
        store.toggle('spellLevel', '1');
        store.toggle('spellSchool', 'Evocation');
        const result = store.apply(items);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Cure Wounds');
    });

    it('filters by faceted sets (OR logic)', () => {
        const store = new CompendiumFilterStore(config as any);
        store.toggle('spellLevel', '3');
        store.toggle('spellSchool', 'Abjuration');
        store.toggleLogic(); // set to 'or'
        const result = store.apply(items);
        expect(result).toHaveLength(2); // Fireball (Level 3) and Shield (Abjuration)
    });

    it('sorts items', () => {
        const store = new CompendiumFilterStore(config as any);
        store.setSort('spellLevel', 'asc');
        const result = store.apply(items);
        expect(result[0].spellLevel).toBe(1);
        expect(result[2].spellLevel).toBe(3);
    });
});
