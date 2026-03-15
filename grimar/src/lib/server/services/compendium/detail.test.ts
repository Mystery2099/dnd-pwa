import { describe, expect, it } from 'vitest';
import { buildCompendiumDetailPayload, collectCompendiumMarkdownSources } from './detail';
import type { CompendiumItem } from '$lib/server/db/schema';

function createItem(overrides: Partial<CompendiumItem>): CompendiumItem {
	return {
		key: 'test-item',
		type: 'languages',
		name: 'Test Item',
		source: 'open5e',
		documentKey: null,
		documentName: null,
		gamesystemKey: null,
		gamesystemName: null,
		publisherKey: null,
		publisherName: null,
		description: null,
		data: {},
		createdAt: new Date(),
		updatedAt: new Date(),
		createdBy: null,
		...overrides
	};
}

describe('buildCompendiumDetailPayload', () => {
	it('normalizes plain Open5e URL strings into internal entity references', () => {
		const item = createItem({
			type: 'languages',
			data: {
				script_language: 'http://10.147.20.240:8888/v2/languages/infernal/'
			}
		});

		const payload = buildCompendiumDetailPayload(item);

		expect(payload.detailSchemaVersion).toBe(1);
		expect(payload.fields).toEqual([
			{
				key: 'script_language',
				label: 'Script Language',
				value: {
					kind: 'entity',
					type: 'languages',
					key: 'infernal',
					label: 'Infernal',
					href: '/compendium/languages/infernal',
					meta: undefined,
					sourceUrl: 'http://10.147.20.240:8888/v2/languages/infernal/'
				}
			}
		]);
		expect(payload.presentation.documentLabel).toBeUndefined();
	});

	it('promotes creature set rosters into a dedicated section', () => {
		const item = createItem({
			type: 'creaturesets',
			data: {
				name: 'Common Mounts',
				creatures: [
					{
						name: 'Camel',
						key: 'srd_camel',
						url: 'http://10.147.20.240:8888/v2/creatures/srd_camel/'
					}
				]
			}
		});

		const payload = buildCompendiumDetailPayload(item);

		expect(payload.detailSchemaVersion).toBe(1);
		expect(payload.fields).toEqual([]);
		expect(payload.sections).toEqual([
			{
				key: 'creatures',
				title: 'Roster',
				description: 'Creatures included in this set.',
				kind: 'creature-set-roster',
				items: [
					{
						key: 'srd_camel',
						label: 'Camel',
						href: '/compendium/creatures/srd_camel',
						type: undefined,
						size: undefined,
						documentLabel: undefined,
						environments: [],
						challengeRatingText: undefined,
						armorClass: undefined,
						hitPoints: undefined,
						speed: undefined
					}
				]
			}
		]);
	});

	it('returns curated sidebar fields instead of raw unfiltered metadata', () => {
		const item = createItem({
			type: 'languages',
			data: {
				is_exotic: true,
				is_secret: false,
				script_language: 'http://10.147.20.240:8888/v2/languages/infernal/'
			}
		});

		const payload = buildCompendiumDetailPayload(item);

		expect(payload.fields.map((field) => field.key)).toEqual([
			'is_exotic',
			'is_secret',
			'script_language'
		]);
	});

	it('promotes repeatable content arrays into structured sections', () => {
		const item = createItem({
			type: 'species',
			data: {
				traits: [
					{ name: 'Darkvision', desc: 'You can see in dim light.' },
					{ name: 'Keen Senses', desc: 'You have proficiency in Perception.' }
				],
				descriptions: [{ document: 'SRD', gamesystem: '5e', desc: 'Variant text.' }],
				benefits: [{ desc: 'Gain a minor benefit.' }]
			}
		});

		const payload = buildCompendiumDetailPayload(item);

		expect(payload.sections).toEqual([
			{
				key: 'descriptions',
				title: 'Descriptions',
				description: 'Variant text grouped by system and source document.',
				kind: 'descriptions',
				items: [{ document: 'SRD', gamesystem: '5e', markdownKey: 'descriptions.0.desc' }]
			},
			{
				key: 'benefits',
				title: 'Benefits',
				description: 'Mechanical benefits and repeatable advantages.',
				kind: 'benefits',
				layout: 'list',
				items: [{ markdownKey: 'benefits.0.desc', name: undefined }],
				groups: []
			},
			{
				key: 'traits',
				title: 'Traits',
				description: 'Species-specific traits and inherited features.',
				kind: 'traits',
				items: [
					{ name: 'Darkvision', markdownKey: 'traits.0.desc' },
					{ name: 'Keen Senses', markdownKey: 'traits.1.desc' }
				]
			}
		]);
	});

	it('groups typed background benefits into semantic sections', () => {
		const item = createItem({
			type: 'backgrounds',
			data: {
				benefits: [
					{
						name: 'Ability Score Increases',
						desc: '+1 to Wisdom and one other ability score.',
						type: 'ability_score'
					},
					{
						name: 'Skill Proficiencies',
						desc: 'Religion, and either Insight or Persuasion.',
						type: 'skill_proficiency'
					},
					{
						name: 'Equipment',
						desc: 'Holy symbol, robe, and a prayer book.',
						type: 'equipment'
					}
				]
			}
		});

		const payload = buildCompendiumDetailPayload(item);

		expect(payload.sections).toContainEqual({
			key: 'benefits',
			title: 'Background Benefits',
			description: 'Training, equipment, and story hooks granted by this background.',
			kind: 'benefits',
			layout: 'grouped',
			items: [
				{ markdownKey: 'benefits.0.desc', name: 'Ability Score Increases' },
				{ markdownKey: 'benefits.1.desc', name: 'Skill Proficiencies' },
				{ markdownKey: 'benefits.2.desc', name: 'Equipment' }
			],
			groups: [
				{
					key: 'ability_score',
					title: 'Ability Scores',
					items: [{ markdownKey: 'benefits.0.desc', name: 'Ability Score Increases' }]
				},
				{
					key: 'skill_proficiency',
					title: 'Skill Proficiencies',
					items: [{ markdownKey: 'benefits.1.desc', name: 'Skill Proficiencies' }]
				},
				{
					key: 'equipment',
					title: 'Equipment',
					items: [{ markdownKey: 'benefits.2.desc', name: 'Equipment' }]
				}
			]
		});
	});

	it('promotes description, spell classes, higher-level text, and class features into sections', () => {
		const spellItem = createItem({
			type: 'spells',
			description: 'A bright streak flashes from your pointing finger.',
			data: {
				classes: [{ key: 'wizard', name: 'Wizard' }, 'sorcerer'],
				higher_level: 'The damage increases by 1d6 for each slot level above 3rd.'
			}
		});
		const classItem = createItem({
			type: 'classes',
			data: {
				desc: 'Martial archetype text.',
				features: [
					{
						key: 'second-wind',
						name: 'Second Wind',
						desc: 'You have a limited well of stamina.',
						feature_type: 'CLASS_LEVEL_FEATURE',
						gained_at: [{ level: 1 }]
					}
				]
			}
		});

		const spellPayload = buildCompendiumDetailPayload(spellItem);
		const classPayload = buildCompendiumDetailPayload(classItem);

		expect(spellPayload.sections).toEqual([
			{
				key: 'description',
				title: 'Description',
				description: 'Core rules text and narrative summary.',
				kind: 'markdown',
				markdownKey: 'description',
				defaultOpen: true
			},
			{
				key: 'classes',
				title: 'Classes',
				description: 'Spell lists and known class access.',
				kind: 'spell-classes',
				items: [
					{ label: 'Wizard', href: '/compendium/classes/wizard' },
					{ label: 'sorcerer', href: '/compendium/classes/sorcerer' }
				]
			},
			{
				key: 'higher_level',
				title: 'At Higher Levels',
				description: 'Scaling notes when the spell is cast using stronger slots.',
				kind: 'markdown',
				markdownKey: 'higher_level'
			}
		]);
		expect(classPayload.sections).toEqual([
			{
				key: 'description',
				title: 'Description',
				description: 'Core rules text and narrative summary.',
				kind: 'markdown',
				markdownKey: 'description',
				defaultOpen: true
			},
			{
				key: 'class-features',
				title: 'Class Features',
				description: 'Expandable feature entries grouped by the class progression.',
				kind: 'class-features',
				items: [
					{
						key: 'second-wind',
						name: 'Second Wind',
						level: 1,
						markdownKey: 'features.0.desc'
					}
				],
				defaultOpen: true
			}
		]);
	});

	it('filters placeholder class table columns out of class features', () => {
		const classItem = createItem({
			type: 'classes',
			data: {
				features: [
					{
						key: 'proficiency-bonus',
						name: 'Proficiency Bonus',
						desc: '[Column data]',
						feature_type: 'PROFICIENCY_BONUS',
						gained_at: [{ level: 1 }]
					},
					{
						key: 'second-wind',
						name: 'Second Wind',
						desc: 'You have a limited well of stamina.',
						feature_type: 'CLASS_LEVEL_FEATURE',
						gained_at: [{ level: 1 }]
					}
				]
			}
		});

		const payload = buildCompendiumDetailPayload(classItem);
		const classFeaturesSection = payload.sections.find(
			(section) => section.kind === 'class-features'
		);

		expect(classFeaturesSection).toEqual({
			key: 'class-features',
			title: 'Class Features',
			description: 'Expandable feature entries grouped by the class progression.',
			kind: 'class-features',
			items: [
				{
					key: 'second-wind',
					name: 'Second Wind',
					level: 1,
					markdownKey: 'features.1.desc'
				}
			],
			defaultOpen: true
		});
	});

	it('keeps class feature markdown aligned after placeholder rows are filtered out', () => {
		const classItem = createItem({
			type: 'classes',
			data: {
				features: [
					{
						key: 'proficiency-bonus',
						name: 'Proficiency Bonus',
						desc: '[Column data]',
						feature_type: 'PROFICIENCY_BONUS',
						gained_at: [{ level: 1 }]
					},
					{
						key: 'rage',
						name: 'Rage',
						desc: 'Real rage text.',
						feature_type: 'CLASS_LEVEL_FEATURE',
						gained_at: [{ level: 1 }]
					},
					{
						key: 'rage-damage',
						name: 'Rage Damage',
						desc: '[Column data]',
						feature_type: 'CLASS_TABLE_DATA',
						gained_at: [{ level: 1 }]
					}
				]
			}
		});

		const payload = buildCompendiumDetailPayload(classItem);

		expect(collectCompendiumMarkdownSources(classItem, payload)).toEqual([
			{ key: 'features.1.desc', text: 'Real rage text.' }
		]);
	});

	it('promotes class supplemental feature tables into standalone markdown sections', () => {
		const classItem = createItem({
			type: 'classes',
			data: {
				features: [
					{
						key: 'core-traits',
						name: 'Core Barbarian Traits',
						desc: '|Primary Ability|Strength|',
						feature_type: 'CORE_TRAITS_TABLE'
					},
					{
						key: 'proficiencies',
						name: 'Proficiencies',
						desc: 'Armor, weapons, and skills.',
						feature_type: 'PROFICIENCIES'
					},
					{
						key: 'equipment',
						name: 'Starting Equipment',
						desc: 'A greataxe or another martial weapon.',
						feature_type: 'STARTING_EQUIPMENT'
					},
					{
						key: 'rage',
						name: 'Rage',
						desc: 'Real rage text.',
						feature_type: 'CLASS_LEVEL_FEATURE',
						gained_at: [{ level: 1 }]
					}
				]
			}
		});

		const payload = buildCompendiumDetailPayload(classItem);

		expect(payload.sections).toContainEqual({
			key: 'core-traits',
			title: 'Core Barbarian Traits',
			description: 'Core class table data and training summary.',
			kind: 'markdown',
			markdownKey: 'features.0.desc',
			defaultOpen: true
		});
		expect(payload.sections).toContainEqual({
			key: 'proficiencies',
			title: 'Proficiencies',
			description: 'Starting proficiencies, saves, and skill training.',
			kind: 'markdown',
			markdownKey: 'features.1.desc',
			defaultOpen: false
		});
		expect(payload.sections).toContainEqual({
			key: 'equipment',
			title: 'Starting Equipment',
			description: 'Default starting gear and equipment choices.',
			kind: 'markdown',
			markdownKey: 'features.2.desc',
			defaultOpen: false
		});
		expect(payload.sections).toContainEqual({
			key: 'class-features',
			title: 'Class Features',
			description: 'Expandable feature entries grouped by the class progression.',
			kind: 'class-features',
			items: [
				{
					key: 'rage',
					name: 'Rage',
					level: 1,
					markdownKey: 'features.3.desc'
				}
			],
			defaultOpen: true
		});
	});

	it('promotes class table data and spell slots into structured class tables', () => {
		const classItem = createItem({
			type: 'classes',
			data: {
				features: [
					{
						key: 'proficiency-bonus',
						name: 'Proficiency Bonus',
						desc: '[Column data]',
						feature_type: 'PROFICIENCY_BONUS',
						data_for_class_table: [
							{ level: 1, column_value: '+2' },
							{ level: 2, column_value: '+2' },
							{ level: 3, column_value: '+2' }
						]
					},
					{
						key: 'rages',
						name: 'Rages',
						desc: '[Column data]',
						feature_type: 'CLASS_TABLE_DATA',
						data_for_class_table: [
							{ level: 1, column_value: '2' },
							{ level: 2, column_value: '2' },
							{ level: 3, column_value: '3' }
						]
					},
					{
						key: '1st',
						name: '1st',
						desc: '[Column data]',
						feature_type: 'SPELL_SLOTS',
						data_for_class_table: [
							{ level: 1, column_value: '2' },
							{ level: 2, column_value: '3' },
							{ level: 3, column_value: '4' }
						]
					},
					{
						key: '2nd',
						name: '2nd',
						desc: '[Column data]',
						feature_type: 'SPELL_SLOTS',
						data_for_class_table: [
							{ level: 3, column_value: '2' }
						]
					}
				]
			}
		});

		const payload = buildCompendiumDetailPayload(classItem);

		expect(payload.sections).toContainEqual({
			key: 'class-progression',
			title: 'Class Progression',
			description: 'Level-based class table data such as proficiency bonus and scaling resources.',
			kind: 'class-table',
			columns: [
				{ key: 'proficiency-bonus', label: 'Proficiency Bonus' },
				{ key: 'rages', label: 'Rages' }
			],
			rows: [
				{ level: 1, values: { 'proficiency-bonus': '+2', rages: '2' } },
				{ level: 2, values: { 'proficiency-bonus': '+2', rages: '2' } },
				{ level: 3, values: { 'proficiency-bonus': '+2', rages: '3' } }
			]
		});
		expect(payload.sections).toContainEqual({
			key: 'spell-slots',
			title: 'Spell Slots',
			description: 'Spell slot progression by class level.',
			kind: 'class-table',
			columns: [
				{ key: '1st', label: '1st' },
				{ key: '2nd', label: '2nd' }
			],
			rows: [
				{ level: 1, values: { '1st': '2', '2nd': '—' } },
				{ level: 2, values: { '1st': '3', '2nd': '—' } },
				{ level: 3, values: { '1st': '4', '2nd': '2' } }
			]
		});
	});

	it('builds normalized presentation metadata for images, creatures, and conditions', () => {
		const imageItem = createItem({
			type: 'images',
			documentName: 'Fallback Document',
			data: {
				file_url: '/images/griffon.png',
				alt_text: 'A griffon in flight',
				attribution: 'Open5e',
				document: {
					display_name: 'Bestiary',
					name: 'Bestiary Source',
					permalink: 'https://example.com/bestiary',
					publisher: { name: 'Example Press' },
					gamesystem: { name: '5e' }
				}
			}
		});
		const creatureItem = createItem({
			type: 'creatures',
			data: {
				challenge_rating_text: '2',
				size: { name: 'Medium', key: 'medium', url: 'http://10.147.20.240:8888/v2/sizes/medium/' },
				type: { name: 'Humanoid', key: 'humanoid', url: 'http://10.147.20.240:8888/v2/creaturetypes/humanoid/' },
				alignment: 'neutral',
				experience_points: 450
			}
		});
		const conditionItem = createItem({
			type: 'conditions',
			documentName: 'SRD Conditions',
			data: {
				icon: {
					key: 'blinded',
					name: 'Blinded',
					file_url: '/conditions/blinded.png',
					alt_text: 'An obscured eye',
					attribution: 'Open5e'
				}
			}
		});

		expect(buildCompendiumDetailPayload(imageItem).presentation).toEqual({
			documentLabel: 'Bestiary',
			image: {
				fileUrl: '/images/griffon.png',
				assetUrl: '/api/assets/open5e/images/griffon.png',
				altText: 'A griffon in flight',
				attribution: 'Open5e',
				publisher: 'Example Press',
				gameSystem: '5e',
				permalink: 'https://example.com/bestiary'
			},
			conditionArtwork: undefined,
			creatureHeader: undefined,
			headerBadges: [
				{ label: 'Image', variant: 'solid' },
				{ label: 'Attributed', variant: 'outline' }
			]
		});

		expect(buildCompendiumDetailPayload(creatureItem).presentation).toEqual({
			documentLabel: undefined,
			image: undefined,
			conditionArtwork: undefined,
			creatureHeader: {
				challengeRatingText: '2',
				size: {
					kind: 'entity',
					type: 'sizes',
					key: 'medium',
					label: 'Medium',
					href: '/compendium/sizes/medium',
					meta: 'medium',
					sourceUrl: 'http://10.147.20.240:8888/v2/sizes/medium/'
				},
				typeValue: {
					kind: 'entity',
					type: 'creaturetypes',
					key: 'humanoid',
					label: 'Humanoid',
					href: '/compendium/creaturetypes/humanoid',
					meta: 'humanoid',
					sourceUrl: 'http://10.147.20.240:8888/v2/creaturetypes/humanoid/'
				},
				alignment: 'neutral',
				experiencePoints: 450
			},
			headerBadges: []
		});
		expect(buildCompendiumDetailPayload(conditionItem).presentation).toEqual({
			documentLabel: 'SRD Conditions',
			image: undefined,
			conditionArtwork: {
				key: 'blinded',
				name: 'Blinded',
				assetUrl: '/api/assets/open5e/conditions/blinded.png',
				altText: 'An obscured eye',
				attribution: 'Open5e',
				documentLabel: 'SRD Conditions'
			},
			creatureHeader: undefined,
			headerBadges: []
		});
	});

	it('builds normalized header badges for spell, class, and magic item detail pages', () => {
		const spellItem = createItem({
			type: 'spells',
			data: {
				level: 3,
				school: { name: 'Illusion' },
				damage_types: ['Psychic'],
				target_type: '20-foot sphere',
				concentration: true,
				ritual: true
			}
		});
		const classItem = createItem({
			type: 'classes',
			data: {
				hit_dice: 8,
				primary_abilities: ['Dexterity', 'Wisdom'],
				saving_throws: ['Dexterity', 'Intelligence']
			}
		});
		const magicItem = createItem({
			type: 'magicitems',
			data: {
				rarity: 'Rare',
				type: 'Wondrous Item',
				requires_attunement: true
			}
		});

		expect(buildCompendiumDetailPayload(spellItem).presentation.headerBadges).toEqual([
			{ label: 'Level 3', variant: 'solid' },
			{
				label: 'Illusion',
				variant: 'outline',
				icon: { family: 'spell-school', value: 'illusion' }
			},
			{
				label: 'Psychic',
				variant: 'outline',
				icon: { family: 'damage-type', value: 'psychic' }
			},
			{
				label: '20-foot sphere',
				variant: 'outline',
				icon: { family: 'aoe', value: 'sphere' }
			},
			{ label: 'Concentration', variant: 'outline' },
			{ label: 'Ritual', variant: 'outline' }
		]);
		expect(buildCompendiumDetailPayload(classItem).presentation.headerBadges).toEqual([
			{ label: 'Hit Die: d8', variant: 'solid' },
			{ label: 'Dexterity, Wisdom', variant: 'outline' },
			{ label: 'Saves: Dexterity, Intelligence', variant: 'outline' }
		]);
		expect(buildCompendiumDetailPayload(magicItem).presentation.headerBadges).toEqual([
			{ label: 'Rare', variant: 'solid' },
			{ label: 'Wondrous Item', variant: 'outline' },
			{ label: 'Requires Attunement', variant: 'outline' }
		]);
	});

	it('promotes creature encounter data into a dedicated section', () => {
		const item = createItem({
			type: 'creatures',
			data: {
				armor_class: 12,
				armor_detail: 'natural armor',
				hit_points: 19,
				hit_dice: '3d10+3',
				speed_all: { walk: 40, swim: 20, unit: 'feet' },
				ability_scores: {
					strength: 18,
					dexterity: 10,
					constitution: 12,
					intelligence: 2,
					wisdom: 11,
					charisma: 7
				},
				actions: [{ name: 'Hooves', desc: 'Melee Weapon Attack.' }],
				traits: [{ name: 'Sure-Footed', desc: 'Advantage on saves.' }]
			}
		});

		const payload = buildCompendiumDetailPayload(item);

		expect(payload.sections.at(-1)).toEqual({
			key: 'creature-encounter',
			title: 'Encounter Reference',
			kind: 'creature-encounter',
			abilityScores: [
				{ ability: 'strength', score: 18 },
				{ ability: 'dexterity', score: 10 },
				{ ability: 'constitution', score: 12 },
				{ ability: 'intelligence', score: 2 },
				{ ability: 'wisdom', score: 11 },
				{ ability: 'charisma', score: 7 }
			],
			armorClass: 12,
			armorDetail: 'natural armor',
			hitPoints: 19,
			hitDice: '3d10+3',
			speed: 'Walk 40 feet, Swim 20 feet',
			actions: [{ name: 'Hooves', markdownKey: 'actions.0.desc' }],
			traits: [{ name: 'Sure-Footed', markdownKey: 'traits.0.desc' }]
		});
	});

	it('collects markdown sources from the normalized detail payload', () => {
		const item = createItem({
			type: 'creatures',
			description: 'Creature overview.',
			data: {
				actions: [{ name: 'Bite', desc: 'A snapping bite.' }],
				traits: [{ name: 'Keen Smell', desc: 'Advantage on smell checks.' }]
			}
		});

		const payload = buildCompendiumDetailPayload(item);

		expect(collectCompendiumMarkdownSources(item, payload)).toEqual([
			{ key: 'description', text: 'Creature overview.' },
			{ key: 'actions.0.desc', text: 'A snapping bite.' },
			{ key: 'traits.0.desc', text: 'Advantage on smell checks.' }
		]);
	});
});
