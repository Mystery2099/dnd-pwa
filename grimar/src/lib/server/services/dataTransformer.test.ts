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
		it('should transform Open5e v2 spell data correctly', () => {
			const mockSpell: Open5eSpell = {
				key: 'fireball',
				name: 'Fireball',
				desc: 'A bright streak flashes from your pointing finger.',
				higher_level:
					'When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.',
				level: 3,
				school: { name: 'Evocation', key: 'evocation' },
				verbal: true,
				somatic: true,
				material: true,
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
				key: 'prestidigitation',
				name: 'Prestidigitation',
				level: 0,
				school: { name: 'Transmutation', key: 'transmutation' },
				verbal: true,
				somatic: true,
				material: false,
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
				key: 'mage-armor',
				name: 'Mage Armor',
				desc: 'You touch a willing creature and protect it with magical force.',
				level: 1,
				school: { name: 'Abjuration', key: 'abjuration' },
				verbal: true,
				somatic: true,
				material: false,
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

	describe('transformMonster', () => {
		it('should transform Open5e v2 creature data correctly', () => {
			const mockCreature: Open5eMonster = {
				key: 'ancient-red-dragon',
				name: 'Ancient Red Dragon',
				type: { name: 'Dragon', key: 'dragon' },
				size: { name: 'Gargantuan', key: 'gargantuan' },
				challenge_rating_text: '24',
				challenge_rating_decimal: '24.000',
				armor_class: 22,
				hit_points: 546,
				hit_dice: '36d20+180',
				ability_scores: {
					strength: 30,
					dexterity: 10,
					constitution: 26,
					intelligence: 16,
					wisdom: 13,
					charisma: 22
				},
				actions: [
					{
						name: 'Bite',
						desc: 'The dragon makes one bite attack.',
						attack_bonus: 15,
						damage: { dice: '2d10+8', type: 'piercing' }
					}
				]
			};

			const result = DataTransformer.transformMonster(mockCreature);

			expect(result.index).toBe('ancient-red-dragon');
			expect(result.name).toBe('Ancient Red Dragon');
			expect(result.summary).toBe('Gargantuan Dragon, CR 24');
			expect(result.size).toBe('Gargantuan');
			expect(result.type).toBe('Dragon');
			expect(result.challenge_rating).toBe(24);
			expect(result.armor_class).toBe(22);
			expect(result.hit_points).toBe(546);
			expect(result.strength).toBe(30);
		});

		it('should handle creature with minimal fields', () => {
			const mockCreature: Open5eMonster = {
				key: 'goblin',
				name: 'Goblin',
				type: { name: 'Humanoid', key: 'humanoid' },
				size: { name: 'Small', key: 'small' },
				challenge_rating_text: '1/4',
				challenge_rating_decimal: '0.250'
			};

			const result = DataTransformer.transformMonster(mockCreature);

			expect(result.index).toBe('goblin');
			expect(result.name).toBe('Goblin');
			expect(result.challenge_rating).toBe(0.25);
		});

		it('should handle creature with traits', () => {
			const mockCreature: Open5eMonster = {
				key: 'owl-bear',
				name: 'Owlbear',
				type: { name: 'Monstrosity', key: 'monstrosity' },
				size: { name: 'Large', key: 'large' },
				challenge_rating_text: '3',
				traits: [
					{
						name: 'Keen Senses',
						desc: 'The owlbear has advantage on Perception checks.'
					}
				]
			};

			const result = DataTransformer.transformMonster(mockCreature);

			expect(result.special_abilities).toHaveLength(1);
			expect(result.special_abilities?.[0].name).toBe('Keen Senses');
		});
	});

	describe('createSummary', () => {
		it('should create spell summary', () => {
			const mockSpell: Open5eSpell = {
				key: 'fireball',
				name: 'Fireball',
				level: 3,
				school: { name: 'Evocation', key: 'evocation' },
				verbal: true,
				somatic: true,
				material: true,
				casting_time: '1 action',
				duration: 'Instantaneous',
				concentration: false,
				ritual: false
			};

			const result = DataTransformer.createSummary(mockSpell, 'spell');
			expect(result).toBe('Level 3 Evocation spell');
		});

		it('should create monster summary', () => {
			const mockCreature: Open5eMonster = {
				key: 'dragon',
				name: 'Red Dragon',
				type: { name: 'Dragon', key: 'dragon' },
				size: { name: 'Huge', key: 'huge' },
				challenge_rating_text: '17'
			};

			const result = DataTransformer.createSummary(mockCreature, 'monster');
			expect(result).toBe('Huge Dragon, CR 17');
		});

		it('should handle unknown type', () => {
			const mockItem = { name: 'Unknown Item' };
			const result = DataTransformer.createSummary(mockItem as Open5eMonster, 'monster');
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
