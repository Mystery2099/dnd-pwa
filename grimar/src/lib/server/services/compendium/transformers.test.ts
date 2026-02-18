import { describe, it, expect } from 'vitest';
import {
	transformToUnifiedSpell,
	transformToUnifiedCreature,
	transformToUnifiedFeat,
	transformToUnifiedBackground,
	transformToUnifiedRace,
	transformToUnifiedClass,
	transformToUnifiedItem,
	transformToUnified
} from './transformers';

// ============================================================================
// Test Helpers
// ============================================================================

/** Create a minimal mock compendium item */
function createMockItem(overrides: Record<string, unknown> = {}) {
	const { details: overrideDetails, raceSize, raceSpeed, classHitDie, creatureSize, creatureType, challengeRating, spellLevel, spellSchool, ...restOverrides } = overrides as Record<string, unknown> & { details?: Record<string, unknown> };
	
	const mappedDetails: Record<string, unknown> = {};
	if (raceSize !== undefined) mappedDetails.size = raceSize;
	if (raceSpeed !== undefined) mappedDetails.speed = raceSpeed;
	if (classHitDie !== undefined) mappedDetails.hit_die = classHitDie;
	if (creatureSize !== undefined) mappedDetails.size = creatureSize;
	if (creatureType !== undefined) mappedDetails.type = creatureType;
	if (challengeRating !== undefined) mappedDetails.challenge_rating = challengeRating;
	if (spellLevel !== undefined) mappedDetails.level = spellLevel;
	if (spellSchool !== undefined) mappedDetails.school = spellSchool;
	
	return {
		id: 1,
		name: 'Test Item',
		source: 'test',
		type: 'spell',
		externalId: 'test-1',
		summary: 'Test summary',
		details: {
			level: 1,
			school: 'Evocation',
			challenge_rating: null,
			size: null,
			type: null,
			hit_dice: null,
			speed: null,
			feature: null,
			skill_proficiencies: null,
			prerequisites: null,
			...mappedDetails,
			...(overrideDetails || {})
		},
		...restOverrides
	};
}

// ============================================================================
// Spell Transformer Tests
// ============================================================================

describe('transformToUnifiedSpell', () => {
	it('should transform a basic spell', () => {
		const item = createMockItem({
			type: 'spell',
			name: 'Fireball',
			spellLevel: 3,
			details: {
				desc: ['A bright streak flashes from your pointing finger...'],
				school: 'Evocation', // School comes from details, not root
				casting_time: '1 action',
				range: '150 feet',
				components: ['V', 'S', 'M'],
				material: 'A small ball of bat guano and sulfur',
				duration: 'Instantaneous',
				concentration: false,
				ritual: false,
				classes: ['Wizard', 'Sorcerer'],
				higher_level: ['When you cast this spell using a spell slot of 4th level or higher...']
			}
		});

		const result = transformToUnifiedSpell(item);

		expect(result.type).toBe('spell');
		expect(result.name).toBe('Fireball');
		expect(result.level).toBe(3);
		expect(result.school).toBe('Evocation');
		expect(result.castingTime).toBe('1 action');
		expect(result.range).toBe('150 feet');
		expect(result.components).toEqual(['V', 'S', 'M']);
		expect(result.duration).toBe('Instantaneous');
		expect(result.concentration).toBe(false);
		expect(result.ritual).toBe(false);
		expect(result.classes).toEqual(['Wizard', 'Sorcerer']);
		expect(result.higherLevel).toContain('spell slot');
	});

	it('should handle cantrip (level 0)', () => {
		const item = createMockItem({
			type: 'spell',
			name: 'Prestidigitation',
			spellLevel: 0,
			spellSchool: 'Transmutation',
			details: {
				desc: ['You create a sensory effect...'],
				casting_time: '1 action',
				range: '10 feet',
				components: ['V', 'S'],
				duration: '1 hour',
				concentration: false,
				ritual: false,
				classes: ['Bard']
			}
		});

		const result = transformToUnifiedSpell(item);
		expect(result.level).toBe(0);
		expect(result.classes).toEqual(['Bard']);
	});

	it('should handle missing optional fields', () => {
		const item = createMockItem({
			type: 'spell',
			name: 'Simple Spell',
			spellLevel: 1,
			spellSchool: 'Abjuration',
			details: {}
		});

		const result = transformToUnifiedSpell(item);
		expect(result.material).toBeUndefined();
		expect(result.higherLevel).toBeUndefined();
		expect(result.classes).toEqual([]);
		expect(result.subclasses).toEqual([]); // Empty array, not undefined
	});

	it('should handle school from details.school object', () => {
		const item = createMockItem({
			type: 'spell',
			name: 'Healing Word',
			spellLevel: 1,
			spellSchool: null, // Will use details.school
			details: {
				desc: ['A creature you touch regains hit points.'],
				school: { name: 'Evocation' },
				casting_time: '1 bonus action',
				range: '60 feet',
				components: ['V'],
				duration: 'Instantaneous',
				concentration: false,
				ritual: false,
				classes: ['Cleric', 'Druid', 'Bard']
			}
		});

		const result = transformToUnifiedSpell(item);
		expect(result.school).toBe('Evocation');
	});
});

// ============================================================================
// Creature Transformer Tests
// ============================================================================

describe('transformToUnifiedCreature', () => {
	it('should transform a basic creature', () => {
		const item = createMockItem({
			type: 'creature',
			name: 'Goblin',
			creatureSize: 'Small',
			creatureType: 'humanoid',
			challengeRating: '1/4',
			details: {
				desc: ['The goblin sneers at the intruders.'],
				alignment: 'neutral evil',
				armor_class: 15,
				hit_points: 7,
				hit_dice: '2d6',
				speed: { walk: '30 ft.' },
				strength: 8,
				dexterity: 14,
				constitution: 12,
				intelligence: 10,
				wisdom: 8,
				charisma: 8,
				xp: 50,
				proficiencies: [
					{ proficiency: { name: 'Stealth' }, value: 6 },
					{ proficiency: { name: 'Perception' }, value: 2 }
				],
				damage_vulnerabilities: ['fire'],
				damage_resistances: [],
				damage_immunities: [],
				condition_immunities: [],
				senses: { passive_perception: '10' },
				languages: 'Common Goblin',
				special_abilities: [
					{ name: 'Nimble Escape', desc: 'Can take Disengage or Hide as a bonus action.' }
				],
				actions: [
					{
						name: 'Scimitar',
						desc: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target.',
						attack_bonus: 4,
						damage: { damage_dice: '1d6+2', damage_type: { name: 'slashing' } }
					}
				]
			}
		});

		const result = transformToUnifiedCreature(item);

		expect(result.type).toBe('creature');
		expect(result.name).toBe('Goblin');
		expect(result.size).toBe('Small');
		expect(result.creatureType).toBe('humanoid');
		expect(result.challengeRating).toBe('1/4');
		expect(result.armorClass).toBe(15);
		expect(result.hitPoints).toBe(7);
		expect(result.abilityScores.strength).toBe(8);
		expect(result.abilityScores.dexterity).toBe(14);
		expect(result.damageVulnerabilities).toEqual(['fire']);
		expect(result.specialAbilities[0].name).toBe('Nimble Escape');
		expect(result.actions[0].attackBonus).toBe(4);
	});

	it('should handle multiattack action', () => {
		const item = createMockItem({
			type: 'creature',
			name: 'Ancient Dragon',
			creatureSize: 'Huge',
			creatureType: 'dragon',
			challengeRating: '17',
			details: {
				desc: ['An ancient dragon.'],
				alignment: 'chaotic evil',
				armor_class: 22,
				hit_points: 546,
				hit_dice: '28d12+140',
				speed: { walk: '40 ft.', fly: '80 ft.' },
				strength: 30,
				dexterity: 14,
				constitution: 26,
				intelligence: 18,
				wisdom: 17,
				charisma: 21,
				actions: [
					{
						name: 'Multiattack',
						desc: 'Can make three attacks.',
						multiattack: { action_name: 'Bite', count: 1 }
					}
				]
			}
		});

		const result = transformToUnifiedCreature(item);
		expect(result.actions[0].multiattack).toEqual({ actionName: 'Bite', count: 1 });
	});

	it('should handle legendary actions', () => {
		const item = createMockItem({
			type: 'creature',
			name: 'Ancient White Dragon',
			creatureSize: 'Huge',
			creatureType: 'dragon',
			challengeRating: '20',
			details: {
				desc: ['An ancient dragon.'],
				alignment: 'chaotic evil',
				armor_class: 22,
				hit_points: 666,
				hit_dice: '36d12+108',
				speed: { walk: '40 ft.', fly: '80 ft.', burrow: '40 ft.' },
				strength: 26,
				dexterity: 10,
				constitution: 22,
				intelligence: 18,
				wisdom: 18,
				charisma: 20,
				actions: [{ name: 'Bite', desc: 'Attack description.' }],
				legendary_actions: [{ name: 'Wing Buffet', desc: 'Beats its wings.' }],
				reactions: [{ name: 'Tail Attack', desc: 'Reaction attack.' }]
			}
		});

		const result = transformToUnifiedCreature(item);
		expect(result.legendaryActions).toHaveLength(1);
		expect(result.legendaryActions![0].name).toBe('Wing Buffet');
		expect(result.reactions).toHaveLength(1);
		expect(result.reactions![0].name).toBe('Tail Attack');
	});
});

// ============================================================================
// Other Type Transformers
// ============================================================================

describe('transformToUnifiedFeat', () => {
	it('should transform a feat', () => {
		const item = createMockItem({
			type: 'feat',
			name: 'Great Weapon Master',
			details: {
				description: ['You can cleave through multiple enemies.'],
				prerequisites: ['Strength 13'],
				benefits: ['+10 damage when attacking with two hands']
			}
		});

		const result = transformToUnifiedFeat(item);
		expect(result.type).toBe('feat');
		expect(result.prerequisites).toEqual(['Strength 13']);
		expect(result.benefits).toContain('+10 damage when attacking with two hands');
	});

	it('should handle feat with no prerequisites', () => {
		const item = createMockItem({
			type: 'feat',
			name: 'Lucky',
			details: {
				description: ['You have extra luck points.'],
				prerequisites: null
			}
		});

		const result = transformToUnifiedFeat(item);
		expect(result.prerequisites).toEqual([]);
	});
});

describe('transformToUnifiedBackground', () => {
	it('should transform a background', () => {
		const item = createMockItem({
			type: 'background',
			name: 'Soldier',
			details: {
				description: ['You spent years as a soldier.'],
				feature: { name: 'Military Rank', description: 'You have influence among soldiers.' },
				skill_proficiencies: ['Athletics', 'Intimidation'],
				tool_proficiencies: ['Vehicles (land)'],
				languages: ['Common'],
				equipment: ['Uniform', 'Insignia of rank']
			}
		});

		const result = transformToUnifiedBackground(item);
		expect(result.type).toBe('background');
		expect(result.feature?.name).toBe('Military Rank');
		expect(result.skillProficiencies).toContain('Athletics');
	});

	it('should handle background without feature', () => {
		const item = createMockItem({
			type: 'background',
			name: 'Urchin',
			details: {
				description: ['You grew up on the streets.'],
				feature: null
			}
		});

		const result = transformToUnifiedBackground(item);
		expect(result.feature).toBeUndefined();
	});
});

describe('transformToUnifiedRace', () => {
	it('should transform a race', () => {
		const item = createMockItem({
			type: 'race',
			name: 'Mountain Dwarf',
			raceSize: 'Medium',
			raceSpeed: 25,
			details: {
				description: ['Dwarves are sturdy folk.'],
				ability_bonuses: [
					{ ability_score: { name: 'Strength' }, bonus: 2 },
					{ ability_score: { name: 'Wisdom' }, bonus: 1 }
				],
				traits: [{ name: 'Dwarven Resilience', description: 'Advantage vs poison.' }]
			}
		});

		const result = transformToUnifiedRace(item);
		expect(result.type).toBe('race');
		expect(result.size).toBe('Medium');
		expect(result.speed).toBe(25);
		expect(result.abilityBonuses).toContainEqual({ ability: 'Strength', bonus: 2 });
	});

	it('should use description as fallback trait', () => {
		const item = createMockItem({
			type: 'race',
			name: 'Simple Race',
			raceSize: 'Small',
			raceSpeed: 30,
			details: {
				description: ['This race is simple.'],
				traits: null
			}
		});

		const result = transformToUnifiedRace(item);
		expect(result.traits).toHaveLength(1);
		expect(result.traits[0].name).toBe('Description');
	});
});

describe('transformToUnifiedClass', () => {
	it('should transform a class', () => {
		const item = createMockItem({
			type: 'class',
			name: 'Fighter',
			classHitDie: 10,
			details: {
				description: ['Fighters are battle-hardened warriors.'],
				features: [{ name: 'Fighting Style', description: 'Choose a fighting style.', level: 1 }],
				armor: ['All armor', 'Shields'],
				weapons: 'Simple and martial weapons',
				tools: [],
				skill_proficiencies: ['Athletics', 'Acrobatics'],
				saving_throws: [{ name: 'Strength' }, { name: 'Constitution' }]
			}
		});

		const result = transformToUnifiedClass(item);
		expect(result.type).toBe('class');
		expect(result.hitDie).toBe(10);
		expect(result.proficiencies.armor).toContain('All armor');
		expect(result.features[0].level).toBe(1);
	});

	it('should handle class with spellcasting', () => {
		const item = createMockItem({
			type: 'class',
			name: 'Paladin',
			classHitDie: 10,
			details: {
				description: ['Paladins are holy warriors.'],
				spellcasting: {
					ability: { name: 'Charisma' },
					dc: 15,
					modifier: 7
				}
			}
		});

		const result = transformToUnifiedClass(item);
		expect(result.spellcasting).toBeDefined();
		expect(result.spellcasting?.ability).toBe('Charisma');
		expect(result.spellcasting?.dc).toBe(15);
	});
});

describe('transformToUnifiedItem', () => {
	it('should transform an item', () => {
		const item = createMockItem({
			type: 'item',
			name: 'Flame Tongue',
			details: {
				description: ['A magical sword that glows with flame.'],
				rarity: 'Rare',
				type: 'Weapon (longsword)',
				requires_attunement: true,
				attunement_requirements: 'Attuned by a bard or paladin',
				weight: 3,
				value: 5000,
				attack_bonus: 2,
				damage: '2d8 fire'
			}
		});

		const result = transformToUnifiedItem(item);
		expect(result.type).toBe('item');
		expect(result.rarity).toBe('Rare');
		expect(result.itemType).toBe('Weapon (longsword)');
		expect(result.requiresAttunement).toBe(true);
		expect(result.magicProperties?.attackBonus).toBe(2);
	});

	it('should handle armor properties', () => {
		const item = createMockItem({
			type: 'item',
			name: 'Plate Armor',
			details: {
				description: ['Heavy metal armor.'],
				rarity: 'Uncommon',
				type: 'Armor (plate)',
				requires_attunement: false,
				armor_class: 18,
				strength_requirement: 15,
				stealth_penalty: true
			}
		});

		const result = transformToUnifiedItem(item);
		expect(result.armorProperties).toBeDefined();
		expect(result.armorProperties?.class).toBe(18);
		expect(result.armorProperties?.strengthRequirement).toBe(15);
		expect(result.armorProperties?.stealthPenalty).toBe(true);
	});

	it('should handle item without magic/armor properties', () => {
		const item = createMockItem({
			type: 'item',
			name: 'Rope',
			details: {
				description: ['A 50-foot length of rope.'],
				rarity: 'Common',
				type: 'Adventuring Gear'
			}
		});

		const result = transformToUnifiedItem(item);
		expect(result.magicProperties).toBeUndefined();
		expect(result.armorProperties).toBeUndefined();
	});
});

// ============================================================================
// Dispatcher Tests
// ============================================================================

describe('transformToUnified', () => {
	it('should dispatch spell type correctly', () => {
		const item = createMockItem({ type: 'spells', name: 'Magic Missile' });
		const result = transformToUnified(item);
		expect(result.type).toBe('spell');
		expect('level' in result).toBe(true);
		expect((result as any).level).toBe(1);
	});

	it('should dispatch creature type correctly', () => {
		const item = createMockItem({ type: 'creatures', name: 'Dragon', creatureSize: 'Huge' });
		const result = transformToUnified(item);
		expect(result.type).toBe('creature');
		expect('size' in result).toBe(true);
		expect((result as any).size).toBe('Huge');
	});

	it('should dispatch feat type correctly', () => {
		const item = createMockItem({ type: 'feats', name: 'Alert' });
		const result = transformToUnified(item);
		expect(result.type).toBe('feat');
		expect('prerequisites' in result).toBe(true);
	});

	it('should dispatch background type correctly', () => {
		const item = createMockItem({ type: 'backgrounds', name: 'Noble' });
		const result = transformToUnified(item);
		expect(result.type).toBe('background');
		expect('skillProficiencies' in result).toBe(true);
	});

	it('should dispatch race type correctly', () => {
		const item = createMockItem({ type: 'species', name: 'Elf' });
		const result = transformToUnified(item);
		expect(result.type).toBe('race');
		expect('speed' in result).toBe(true);
	});

	it('should dispatch class type correctly', () => {
		const item = createMockItem({ type: 'classes', name: 'Wizard' });
		const result = transformToUnified(item);
		expect(result.type).toBe('class');
		expect('hitDie' in result).toBe(true);
	});

	it('should dispatch item type correctly', () => {
		const item = createMockItem({ type: 'magicitems', name: 'Sword' });
		const result = transformToUnified(item);
		expect(result.type).toBe('item');
		expect('rarity' in result).toBe(true);
	});

	it('should use fallback for unknown type', () => {
		const item = createMockItem({
			type: 'unknown_type' as any,
			name: 'Mystery Item',
			details: { desc: ['Unknown item type'] }
		});

		// Should not throw, should use fallback
		const result = transformToUnified(item);
		expect(result.type).toBe('item'); // Falls back to item type
		expect(result.name).toBe('Mystery Item');
	});
});
