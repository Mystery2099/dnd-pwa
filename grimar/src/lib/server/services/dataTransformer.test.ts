import { describe, it, expect } from 'vitest';
import { DataTransformer } from './dataTransformer';
import type {
	Open5eSpell,
	Open5eMonster,
	SpellItem,
	MonsterItem
} from '$lib/core/types/compendium/transformers';

describe('DataTransformer', () => {
	describe('transformSpell', () => {
		it('should transform Open5e spell data correctly', () => {
			const mockSpell: Open5eSpell = {
				index: 'fireball',
				slug: 'fireball',
				name: 'Fireball',
				desc: ['A bright streak flashes from your pointing finger.'],
				higher_level: [
					'When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.'
				],
				level: 3,
				school: { name: 'Evocation' },
				components: ['V', 'S', 'M']
			};

			const result = DataTransformer.transformSpell(mockSpell);

			expect(result.index).toBe('fireball');
			expect(result.name).toBe('Fireball');
			expect(result.summary).toBe('Level 3 Evocation spell');
			expect(result.level).toBe(3);
			expect(result.school).toBe('Evocation');
			expect(result.components).toEqual(['V', 'S', 'M']);
			expect(result.description).toHaveLength(1);
			expect(result.higher_level).toHaveLength(1);
		});

		it('should handle string desc as array', () => {
			const mockSpell: Open5eSpell = {
				index: 'mage-armor',
				slug: 'mage-armor',
				name: 'Mage Armor',
				desc: 'You touch a willing creature and protect it with magical force.',
				level: 1,
				school: { name: 'Abjuration' }
			};

			const result = DataTransformer.transformSpell(mockSpell);

			expect(result.description).toEqual([
				'You touch a willing creature and protect it with magical force.'
			]);
		});

		it('should handle optional fields gracefully', () => {
			const mockSpell: Open5eSpell = {
				index: 'prestidigitation',
				slug: 'prestidigitation',
				name: 'Prestidigitation',
				level: 0,
				school: { name: 'Transmutation' }
			};

			const result = DataTransformer.transformSpell(mockSpell);

			expect(result.components).toEqual([]);
			expect(result.classes).toEqual([]);
		});
	});

	describe('transformMonster', () => {
		it('should transform Open5e monster data correctly', () => {
			const mockMonster: Open5eMonster = {
				index: 'ancient-red-dragon',
				slug: 'ancient-red-dragon',
				name: 'Ancient Red Dragon',
				size: 'Gargantuan',
				type: 'Dragon',
				subtype: '',
				alignment: 'Chaotic Evil',
				challenge_rating: 24,
				armor_class: 22,
				armor_desc: 'natural armor',
				hit_points: 546,
				hit_dice: '28d20+196',
				speed: { walk: '40 ft.', fly: '80 ft.', swim: '40 ft.' },
				strength: 30,
				dexterity: 10,
				constitution: 28,
				intelligence: 16,
				wisdom: 13,
				charisma: 22
			};

			const result = DataTransformer.transformMonster(mockMonster);

			expect(result.index).toBe('ancient-red-dragon');
			expect(result.name).toBe('Ancient Red Dragon');
			expect(result.summary).toBe('Gargantuan Dragon, CR 24');
			expect(result.size).toBe('Gargantuan');
			expect(result.type).toBe('Dragon');
			expect(result.challenge_rating).toBe(24);
			expect(result.hit_points).toBe(546);
		});

		it('should handle array armor_class', () => {
			const mockMonster: Open5eMonster = {
				index: 'iron-golem',
				slug: 'iron-golem',
				name: 'Iron Golem',
				size: 'Large',
				type: 'Construct',
				challenge_rating: 16,
				armor_class: [{ type: 'natural', value: 20 }],
				hit_points: 210,
				hit_dice: '19d10+95'
			};

			const result = DataTransformer.transformMonster(mockMonster);

			expect(result.armor_class).toEqual([{ type: 'natural', value: 20 }]);
		});

		it('should handle optional fields gracefully', () => {
			const mockMonster: Open5eMonster = {
				index: 'rat',
				slug: 'rat',
				name: 'Rat',
				size: 'Tiny',
				type: 'Beast',
				challenge_rating: 0,
				hit_points: 1,
				hit_dice: '1d4-1'
			};

			const result = DataTransformer.transformMonster(mockMonster);

			expect(result.subtype).toBeUndefined();
			expect(result.alignment).toBeUndefined();
			expect(result.skills).toBeUndefined();
		});
	});

	describe('createSummary', () => {
		it('should create spell summary', () => {
			const spell: SpellItem = {
				index: 'fireball',
				name: 'Fireball',
				summary: 'Level 3 Evocation spell',
				level: 3,
				school: 'Evocation',
				components: [],
				casting_time: '',
				range: '',
				duration: '',
				description: [],
				higher_level: [],
				classes: []
			};

			const result = DataTransformer.createSummary('spells', spell);
			expect(result).toBe('Level 3 Evocation spell');
		});

		it('should create monster summary', () => {
			const monster: MonsterItem = {
				index: 'ancient-red-dragon',
				name: 'Ancient Red Dragon',
				summary: 'Gargantuan Dragon, CR 24',
				size: 'Gargantuan',
				type: 'Dragon',
				challenge_rating: 24,
				armor_class: 22,
				hit_points: 546
			};

			const result = DataTransformer.createSummary('monsters', monster);
			expect(result).toBe('Gargantuan Dragon, CR 24');
		});

		it('should handle unknown type', () => {
			const item = { name: 'Unknown Item' };
			const result = DataTransformer.createSummary('unknown', item as any);
			expect(result).toBe('Unknown Item');
		});

		it('should handle null/undefined values gracefully', () => {
			const spell = {
				index: 'test',
				name: 'Test',
				summary: '',
				level: null as any,
				school: null as any,
				components: [],
				casting_time: '',
				range: '',
				duration: '',
				description: [],
				higher_level: [],
				classes: []
			};

			const result = DataTransformer.createSummary('spells', spell);
			expect(result).toBe('Level 0 Unknown spell');
		});
	});
});
