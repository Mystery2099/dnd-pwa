import { z } from 'zod';

export type FormValue = unknown;
export type FormData = Record<string, FormValue>;

export interface FieldConfig {
	name: string;
	label: string;
	type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum' | 'textarea';
	required: boolean;
	placeholder?: string;
	hint?: string;
	options?: { value: string; label: string }[];
	defaultValue?: FormValue;
	min?: number;
	max?: number;
	rows?: number;
}

export const CONTENT_TYPE_FIELDS: Record<string, FieldConfig[]> = {
	spells: [
		{ name: 'name', label: 'Name', type: 'string', required: true, placeholder: 'Fireball' },
		{
			name: 'level',
			label: 'Level',
			type: 'enum',
			required: true,
			options: [
				{ value: '0', label: 'Cantrip' },
				{ value: '1', label: '1st Level' },
				{ value: '2', label: '2nd Level' },
				{ value: '3', label: '3rd Level' },
				{ value: '4', label: '4th Level' },
				{ value: '5', label: '5th Level' },
				{ value: '6', label: '6th Level' },
				{ value: '7', label: '7th Level' },
				{ value: '8', label: '8th Level' },
				{ value: '9', label: '9th Level' }
			]
		},
		{
			name: 'school',
			label: 'School',
			type: 'enum',
			required: true,
			options: [
				{ value: 'Abjuration', label: 'Abjuration' },
				{ value: 'Conjuration', label: 'Conjuration' },
				{ value: 'Divination', label: 'Divination' },
				{ value: 'Enchantment', label: 'Enchantment' },
				{ value: 'Evocation', label: 'Evocation' },
				{ value: 'Illusion', label: 'Illusion' },
				{ value: 'Necromancy', label: 'Necromancy' },
				{ value: 'Transmutation', label: 'Transmutation' }
			]
		},
		{ name: 'casting_time', label: 'Casting Time', type: 'string', required: false, placeholder: '1 action' },
		{ name: 'range', label: 'Range', type: 'string', required: false, placeholder: '150 feet' },
		{ name: 'duration', label: 'Duration', type: 'string', required: false, placeholder: 'Instantaneous' },
		{ name: 'concentration', label: 'Concentration', type: 'boolean', required: false },
		{ name: 'ritual', label: 'Ritual', type: 'boolean', required: false },
		{ name: 'v', label: 'Verbal', type: 'boolean', required: false },
		{ name: 's', label: 'Somatic', type: 'boolean', required: false },
		{ name: 'm', label: 'Material', type: 'boolean', required: false },
		{ name: 'material', label: 'Material Components', type: 'string', required: false },
		{ name: 'description', label: 'Description', type: 'textarea', required: true, rows: 6 },
		{ name: 'higher_level', label: 'At Higher Levels', type: 'textarea', required: false, rows: 3 },
		{ name: 'classes', label: 'Classes', type: 'string', required: false, placeholder: 'Wizard, Sorcerer' }
	],
	creatures: [
		{ name: 'name', label: 'Name', type: 'string', required: true, placeholder: 'Ancient Red Dragon' },
		{
			name: 'size',
			label: 'Size',
			type: 'enum',
			required: true,
			options: [
				{ value: 'Tiny', label: 'Tiny' },
				{ value: 'Small', label: 'Small' },
				{ value: 'Medium', label: 'Medium' },
				{ value: 'Large', label: 'Large' },
				{ value: 'Huge', label: 'Huge' },
				{ value: 'Gargantuan', label: 'Gargantuan' }
			]
		},
		{
			name: 'type',
			label: 'Type',
			type: 'enum',
			required: true,
			options: [
				{ value: 'Aberration', label: 'Aberration' },
				{ value: 'Beast', label: 'Beast' },
				{ value: 'Celestial', label: 'Celestial' },
				{ value: 'Construct', label: 'Construct' },
				{ value: 'Dragon', label: 'Dragon' },
				{ value: 'Elemental', label: 'Elemental' },
				{ value: 'Fey', label: 'Fey' },
				{ value: 'Fiend', label: 'Fiend' },
				{ value: 'Giant', label: 'Giant' },
				{ value: 'Humanoid', label: 'Humanoid' },
				{ value: 'Monstrosity', label: 'Monstrosity' },
				{ value: 'Ooze', label: 'Ooze' },
				{ value: 'Plant', label: 'Plant' },
				{ value: 'Undead', label: 'Undead' }
			]
		},
		{ name: 'alignment', label: 'Alignment', type: 'string', required: false, placeholder: 'Chaotic Evil' },
		{ name: 'armor_class', label: 'Armor Class', type: 'number', required: false, placeholder: '22' },
		{ name: 'armor_desc', label: 'Armor Type', type: 'string', required: false, placeholder: 'Natural Armor' },
		{ name: 'hit_points', label: 'Hit Points', type: 'number', required: false },
		{ name: 'hit_dice', label: 'Hit Dice', type: 'string', required: false, placeholder: '26d20+182' },
		{ name: 'speed', label: 'Speed', type: 'string', required: false, placeholder: '40 ft., fly 80 ft.' },
		{ name: 'str', label: 'STR', type: 'number', required: false },
		{ name: 'dex', label: 'DEX', type: 'number', required: false },
		{ name: 'con', label: 'CON', type: 'number', required: false },
		{ name: 'int', label: 'INT', type: 'number', required: false },
		{ name: 'wis', label: 'WIS', type: 'number', required: false },
		{ name: 'cha', label: 'CHA', type: 'number', required: false },
		{ name: 'saving_throws', label: 'Saving Throws', type: 'string', required: false, placeholder: 'Dex +9, Con +14, Wis +8' },
		{ name: 'skills', label: 'Skills', type: 'string', required: false, placeholder: 'Perception +14, Stealth +9' },
		{ name: 'senses', label: 'Senses', type: 'string', required: false, placeholder: 'Blindsight 60 ft., Darkvision 120 ft.' },
		{ name: 'damage_vulnerabilities', label: 'Vulnerabilities', type: 'string', required: false },
		{ name: 'damage_resistances', label: 'Resistances', type: 'string', required: false },
		{ name: 'damage_immunities', label: 'Immunities', type: 'string', required: false },
		{ name: 'condition_immunities', label: 'Condition Immunities', type: 'string', required: false },
		{ name: 'languages', label: 'Languages', type: 'string', required: false, placeholder: 'Common, Draconic' },
		{ name: 'challenge_rating', label: 'Challenge Rating', type: 'string', required: false, placeholder: '24' },
		{ name: 'special_abilities', label: 'Special Abilities', type: 'array', required: false },
		{ name: 'actions', label: 'Actions', type: 'array', required: false },
		{ name: 'legendary_actions', label: 'Legendary Actions', type: 'array', required: false },
		{ name: 'reactions', label: 'Reactions', type: 'array', required: false }
	],
	magicitems: [
		{ name: 'name', label: 'Name', type: 'string', required: true, placeholder: 'Staff of the Magi' },
		{ name: 'type', label: 'Type', type: 'string', required: false, placeholder: 'Staff' },
		{
			name: 'rarity',
			label: 'Rarity',
			type: 'enum',
			required: false,
			options: [
				{ value: 'Common', label: 'Common' },
				{ value: 'Uncommon', label: 'Uncommon' },
				{ value: 'Rare', label: 'Rare' },
				{ value: 'Very Rare', label: 'Very Rare' },
				{ value: 'Legendary', label: 'Legendary' },
				{ value: 'Artifact', label: 'Artifact' }
			]
		},
		{ name: 'requires_attunement', label: 'Requires Attunement', type: 'boolean', required: false },
		{ name: 'attunement', label: 'Attunement Requirement', type: 'string', required: false, placeholder: 'by a spellcaster' },
		{ name: 'description', label: 'Description', type: 'textarea', required: true, rows: 6 }
	],
	feats: [
		{ name: 'name', label: 'Name', type: 'string', required: true },
		{ name: 'prerequisite', label: 'Prerequisite', type: 'string', required: false, placeholder: 'None' },
		{ name: 'description', label: 'Description', type: 'textarea', required: true, rows: 6 }
	],
	backgrounds: [
		{ name: 'name', label: 'Name', type: 'string', required: true },
		{ name: 'feature_name', label: 'Feature Name', type: 'string', required: false },
		{ name: 'feature', label: 'Feature Description', type: 'textarea', required: false, rows: 4 },
		{ name: 'description', label: 'Description', type: 'textarea', required: true, rows: 6 },
		{ name: 'skill_proficiencies', label: 'Skill Proficiencies', type: 'string', required: false, placeholder: 'Stealth, Perception' },
		{ name: 'tool_proficiencies', label: 'Tool Proficiencies', type: 'string', required: false },
		{ name: 'languages', label: 'Languages', type: 'string', required: false },
		{ name: 'equipment', label: 'Equipment', type: 'string', required: false }
	],
	species: [
		{ name: 'name', label: 'Name', type: 'string', required: true },
		{
			name: 'size',
			label: 'Size',
			type: 'enum',
			required: false,
			options: [
				{ value: 'Small', label: 'Small' },
				{ value: 'Medium', label: 'Medium' }
			]
		},
		{ name: 'speed', label: 'Speed (ft)', type: 'number', required: false, placeholder: '30' },
		{ name: 'ability_str', label: 'STR Bonus', type: 'number', required: false },
		{ name: 'ability_dex', label: 'DEX Bonus', type: 'number', required: false },
		{ name: 'ability_con', label: 'CON Bonus', type: 'number', required: false },
		{ name: 'ability_int', label: 'INT Bonus', type: 'number', required: false },
		{ name: 'ability_wis', label: 'WIS Bonus', type: 'number', required: false },
		{ name: 'ability_cha', label: 'CHA Bonus', type: 'number', required: false },
		{ name: 'darkvision', label: 'Darkvision (ft)', type: 'number', required: false, placeholder: '60' },
		{ name: 'age', label: 'Age', type: 'string', required: false },
		{ name: 'alignment', label: 'Alignment', type: 'string', required: false },
		{ name: 'size_desc', label: 'Size Description', type: 'string', required: false },
		{ name: 'languages', label: 'Languages', type: 'string', required: false },
		{ name: 'traits', label: 'Traits', type: 'array', required: false }
	],
	classes: [
		{ name: 'name', label: 'Name', type: 'string', required: true },
		{ name: 'hit_die', label: 'Hit Die', type: 'enum', required: true, options: [
			{ value: '6', label: 'd6' },
			{ value: '8', label: 'd8' },
			{ value: '10', label: 'd10' },
			{ value: '12', label: 'd12' }
		]},
		{
			name: 'primary_ability',
			label: 'Primary Ability',
			type: 'enum',
			required: false,
			options: [
				{ value: 'Strength', label: 'Strength' },
				{ value: 'Dexterity', label: 'Dexterity' },
				{ value: 'Constitution', label: 'Constitution' },
				{ value: 'Intelligence', label: 'Intelligence' },
				{ value: 'Wisdom', label: 'Wisdom' },
				{ value: 'Charisma', label: 'Charisma' }
			]
		},
		{ name: 'saving_throws', label: 'Saving Throws', type: 'string', required: false, placeholder: 'Strength, Constitution' },
		{ name: 'skill_proficiencies', label: 'Skill Proficiencies #', type: 'number', required: false },
		{ name: 'armor_proficiencies', label: 'Armor Proficiencies', type: 'string', required: false },
		{ name: 'weapon_proficiencies', label: 'Weapon Proficiencies', type: 'string', required: false },
		{ name: 'tool_proficiencies', label: 'Tool Proficiencies', type: 'string', required: false },
		{
			name: 'spellcasting_ability',
			label: 'Spellcasting Ability',
			type: 'enum',
			required: false,
			options: [
				{ value: '', label: 'None' },
				{ value: 'Intelligence', label: 'Intelligence' },
				{ value: 'Wisdom', label: 'Wisdom' },
				{ value: 'Charisma', label: 'Charisma' }
			]
		},
		{ name: 'description', label: 'Description', type: 'textarea', required: false, rows: 4 }
	]
};

export function getFieldsForType(type: string): FieldConfig[] {
	return CONTENT_TYPE_FIELDS[type] || [
		{ name: 'name', label: 'Name', type: 'string', required: true },
		{ name: 'description', label: 'Description', type: 'textarea', required: false, rows: 4 }
	];
}

function formatLabel(name: string): string {
	return name
		.replace(/([A-Z])/g, ' $1')
		.replace(/_/g, ' ')
		.replace(/^./, (s) => s.toUpperCase())
		.trim();
}