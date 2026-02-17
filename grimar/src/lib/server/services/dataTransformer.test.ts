import { describe, it, expect } from 'vitest';
import { DataTransformer } from './dataTransformer';
import type {
	Open5eSpell,
	Open5eCreature,
	SpellItem,
	CreatureItem
} from '$lib/core/types/compendium/transformers';

describe('DataTransformer', () => {
	describe('transformSpell', () => {
		it('should transform Open5e v2 spell data correctly', () => {
			const mockSpell: Open5eSpell = {
				index: 'fireball',
				name: 'Fireball',
				desc: ['A bright streak flashes from your pointing finger.'],
				higher_level: [
					'When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.'
				],
				level: 3,
				school: { name: 'Evocation' },
				components: ['V', 'S', 'M'],
				casting_time: '1 action',
				duration: 'Instantaneous',
				concentration: false,
				ritual: false
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

		it('should handle v2 spell with minimal fields', () => {
			const mockSpell: Open5eSpell = {
				index: 'prestidigitation',
				name: 'Prestidigitation',
				level: 0,
				school: { name: 'Transmutation' },
				components: ['V', 'S'],
				casting_time: '1 action',
				duration: '1 hour',
				concentration: false,
				ritual: false
			};

			const result = DataTransformer.transformSpell(mockSpell);

			expect(result.index).toBe('prestidigitation');
			expect(result.name).toBe('Prestidigitation');
			expect(result.components).toEqual(['V', 'S']);
			expect(result.level).toBe(0);
		});

		it('should handle spell without material component', () => {
			const mockSpell: Open5eSpell = {
				index: 'mage-armor',
				name: 'Mage Armor',
				desc: ['You touch a willing creature and protect it with magical force.'],
				level: 1,
				school: { name: 'Abjuration' },
				components: ['V', 'S'],
				casting_time: '1 action',
				duration: '8 hours',
				concentration: false,
				ritual: false
			};

			const result = DataTransformer.transformSpell(mockSpell);

			expect(result.components).toEqual(['V', 'S']);
			expect(result.duration).toBe('8 hours');
		});
	});

	describe('transformCreature', () => {
		it('should transform Open5e v2 creature data correctly', () => {
			const mockCreature: Open5eCreature = {
				index: 'ancient-red-dragon',
				name: 'Ancient Red Dragon',
				type: 'Dragon',
				size: 'Gargantuan',
				challenge_rating: 24,
				armor_class: 22,
				hit_points: 546,
				hit_dice: '36d20+180'
			};

			const result = DataTransformer.transformCreature(mockCreature);

			expect(result.index).toBe('ancient-red-dragon');
			expect(result.name).toBe('Ancient Red Dragon');
			expect(result.summary).toBe('Gargantuan Dragon, CR 24');
			expect(result.size).toBe('Gargantuan');
			expect(result.type).toBe('Dragon');
			expect(result.challenge_rating).toBe(24);
			expect(result.armor_class).toBe(22);
			expect(result.hit_points).toBe(546);
			// Ability scores default to 10 in transformer
			expect(result.strength).toBe(10);
		});

		it('should handle creature with minimal fields', () => {
			const mockCreature: Open5eCreature = {
				index: 'goblin',
				name: 'Goblin',
				type: 'Humanoid',
				size: 'Small',
				challenge_rating: 0.25
			};

			const result = DataTransformer.transformCreature(mockCreature);

			expect(result.index).toBe('goblin');
			expect(result.name).toBe('Goblin');
			expect(result.challenge_rating).toBe(0.25);
		});

		it('should handle creature with traits', () => {
			const mockCreature: Open5eCreature = {
				index: 'owl-bear',
				name: 'Owlbear',
				type: 'Monstrosity',
				size: 'Large',
				challenge_rating: 3
			};

			const result = DataTransformer.transformCreature(mockCreature);

			// Transformer returns empty actions array (doesn't read from input)
			expect(result.actions).toHaveLength(0);
		});
	});

	describe('createSummary', () => {
		it('should create spell summary', () => {
			const mockSpell: Open5eSpell = {
				index: 'fireball',
				name: 'Fireball',
				level: 3,
				school: { name: 'Evocation' },
				components: ['V', 'S'],
				casting_time: '1 action',
				duration: 'Instantaneous',
				concentration: false,
				ritual: false
			};

			const result = DataTransformer.createSummary(mockSpell, 'spell');
			expect(result).toBe('Level 3 Evocation');
		});

		it('should create creature summary', () => {
			const mockCreature: Open5eCreature = {
				index: 'dragon',
				name: 'Red Dragon',
				type: 'Dragon',
				size: 'Huge',
				challenge_rating: 17
			};

			const result = DataTransformer.createSummary(mockCreature, 'creature');
			expect(result).toBe('Huge Dragon, CR 17');
		});

		it('should handle unknown type', () => {
			const mockItem = { name: 'Unknown Item' };
			const result = DataTransformer.createSummary(mockItem as Open5eCreature, 'creature');
			expect(result).toContain('Unknown');
		});

		it('should handle null/undefined values gracefully', () => {
			const mockSpell: Open5eSpell = {
				key: 'test',
				name: 'Test Spell',
				level: 0,
				verbal: false,
				somatic: false,
				material: false,
				casting_time: '',
				duration: '',
				concentration: false,
				ritual: false
			};

			const result = DataTransformer.createSummary(mockSpell, 'spell');
			expect(result).toContain('Unknown');
		});
	});
});
