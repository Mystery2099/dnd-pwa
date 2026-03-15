import { describe, expect, it } from 'vitest';
import { buildCompendiumDetailPayload } from './detail';
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
				items: [{ markdownKey: 'benefits.0.desc' }]
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
});
