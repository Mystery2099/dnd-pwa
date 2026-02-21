import type { CompendiumTypeConfig, CompendiumTypeName } from '$lib/core/types/compendium';

export type { CompendiumTypeConfig, CompendiumTypeName };

export const COMPENDIUM_TYPE_CONFIGS: Record<CompendiumTypeName, CompendiumTypeConfig> = {
	species: {
		name: 'species',
		label: 'Species',
		plural: 'Species',
		icon: '👤',
		description: 'Character races and ancestries',
		endpoint: 'species'
	},
	classes: {
		name: 'classes',
		label: 'Class',
		plural: 'Classes',
		icon: '⚔️',
		description: 'Character classes and subclasses',
		endpoint: 'classes'
	},
	classfeatures: {
		name: 'classfeatures',
		label: 'Class Feature',
		plural: 'Class Features',
		icon: '📜',
		description: 'Features gained by classes',
		endpoint: 'classfeatures'
	},
	backgrounds: {
		name: 'backgrounds',
		label: 'Background',
		plural: 'Backgrounds',
		icon: '📖',
		description: 'Character backgrounds',
		endpoint: 'backgrounds'
	},
	feats: {
		name: 'feats',
		label: 'Feat',
		plural: 'Feats',
		icon: '⭐',
		description: 'Special abilities and talents',
		endpoint: 'feats'
	},
	skills: {
		name: 'skills',
		label: 'Skill',
		plural: 'Skills',
		icon: '🎯',
		description: 'Character skills',
		endpoint: 'skills'
	},
	abilities: {
		name: 'abilities',
		label: 'Ability',
		plural: 'Abilities',
		icon: '💪',
		description: 'Ability scores and modifiers',
		endpoint: 'abilities'
	},
	spellcastingoptions: {
		name: 'spellcastingoptions',
		label: 'Spellcasting Option',
		plural: 'Spellcasting Options',
		icon: '🔮',
		description: 'Spellcasting class options',
		endpoint: 'spellcastingoptions'
	},
	speciestraits: {
		name: 'speciestraits',
		label: 'Species Trait',
		plural: 'Species Traits',
		icon: '🧬',
		description: 'Traits for species',
		endpoint: 'speciestraits'
	},
	spells: {
		name: 'spells',
		label: 'Spell',
		plural: 'Spells',
		icon: '✨',
		description: 'Magical spells of all levels',
		endpoint: 'spells'
	},
	spellschools: {
		name: 'spellschools',
		label: 'Spell School',
		plural: 'Spell Schools',
		icon: ' arcane',
		description: 'Schools of magic',
		endpoint: 'spellschools'
	},
	creatures: {
		name: 'creatures',
		label: 'Creature',
		plural: 'Creatures',
		icon: '🐉',
		description: 'Monsters and NPCs',
		endpoint: 'creatures'
	},
	creaturetypes: {
		name: 'creaturetypes',
		label: 'Creature Type',
		plural: 'Creature Types',
		icon: '🐲',
		description: 'Types of creatures',
		endpoint: 'creaturetypes'
	},
	creatureactions: {
		name: 'creatureactions',
		label: 'Creature Action',
		plural: 'Creature Actions',
		icon: '⚔️',
		description: 'Actions creatures can take',
		endpoint: 'creatureactions'
	},
	creatureactionattacks: {
		name: 'creatureactionattacks',
		label: 'Creature Attack',
		plural: 'Creature Attacks',
		icon: '🗡️',
		description: 'Attack actions for creatures',
		endpoint: 'creatureactionattacks'
	},
	creaturetraits: {
		name: 'creaturetraits',
		label: 'Creature Trait',
		plural: 'Creature Traits',
		icon: '🐾',
		description: 'Traits for creatures',
		endpoint: 'creaturetraits'
	},
	creaturesets: {
		name: 'creaturesets',
		label: 'Creature Set',
		plural: 'Creature Sets',
		icon: '👹',
		description: 'Groups of creatures',
		endpoint: 'creaturesets'
	},
	weapons: {
		name: 'weapons',
		label: 'Weapon',
		plural: 'Weapons',
		icon: '🗡️',
		description: 'Melee and ranged weapons',
		endpoint: 'weapons'
	},
	armor: {
		name: 'armor',
		label: 'Armor',
		plural: 'Armor',
		icon: '🛡️',
		description: 'Protective gear and shields',
		endpoint: 'armor'
	},
	magicitems: {
		name: 'magicitems',
		label: 'Magic Item',
		plural: 'Magic Items',
		icon: '🔮',
		description: 'Enchanted items and artifacts',
		endpoint: 'magicitems'
	},
	itemcategories: {
		name: 'itemcategories',
		label: 'Item Category',
		plural: 'Item Categories',
		icon: '📦',
		description: 'Categories of items',
		endpoint: 'itemcategories'
	},
	itemrarities: {
		name: 'itemrarities',
		label: 'Item Rarity',
		plural: 'Item Rarities',
		icon: '💎',
		description: 'Rarity levels for items',
		endpoint: 'itemrarities'
	},
	itemsets: {
		name: 'itemsets',
		label: 'Item Set',
		plural: 'Item Sets',
		icon: '🎁',
		description: 'Sets of related items',
		endpoint: 'itemsets'
	},
	weaponproperties: {
		name: 'weaponproperties',
		label: 'Weapon Property',
		plural: 'Weapon Properties',
		icon: '⚡',
		description: 'Properties of weapons',
		endpoint: 'weaponproperties'
	},
	weaponpropertyassignments: {
		name: 'weaponpropertyassignments',
		label: 'Weapon Property Assignment',
		plural: 'Weapon Property Assignments',
		icon: '📋',
		description: 'Weapon to property mappings',
		endpoint: 'weaponpropertyassignments'
	},
	backgroundbenefits: {
		name: 'backgroundbenefits',
		label: 'Background Benefit',
		plural: 'Background Benefits',
		icon: '📜',
		description: 'Benefits from backgrounds',
		endpoint: 'backgroundbenefits'
	},
	featbenefits: {
		name: 'featbenefits',
		label: 'Feat Benefit',
		plural: 'Feat Benefits',
		icon: '⭐',
		description: 'Benefits from feats',
		endpoint: 'featbenefits'
	},
	classfeatureitems: {
		name: 'classfeatureitems',
		label: 'Class Feature Item',
		plural: 'Class Feature Items',
		icon: '📜',
		description: 'Items granted by class features',
		endpoint: 'classfeatureitems'
	},
	rules: {
		name: 'rules',
		label: 'Rule',
		plural: 'Rules',
		icon: '📚',
		description: 'Game rules and mechanics',
		endpoint: 'rules'
	},
	rulesections: {
		name: 'rulesections',
		label: 'Rule Section',
		plural: 'Rule Sections',
		icon: '📑',
		description: 'Sections of rules',
		endpoint: 'rulesections'
	},
	rulesets: {
		name: 'rulesets',
		label: 'Ruleset',
		plural: 'Rulesets',
		icon: '📖',
		description: 'Collections of rules',
		endpoint: 'rulesets'
	},
	conditions: {
		name: 'conditions',
		label: 'Condition',
		plural: 'Conditions',
		icon: '🌀',
		description: 'Status conditions and effects',
		endpoint: 'conditions'
	},
	damagetypes: {
		name: 'damagetypes',
		label: 'Damage Type',
		plural: 'Damage Types',
		icon: '💥',
		description: 'Types of damage',
		endpoint: 'damagetypes'
	},
	environments: {
		name: 'environments',
		label: 'Environment',
		plural: 'Environments',
		icon: '🌍',
		description: 'Environmental conditions',
		endpoint: 'environments'
	},
	sizes: {
		name: 'sizes',
		label: 'Size',
		plural: 'Sizes',
		icon: '📏',
		description: 'Creature size categories',
		endpoint: 'sizes'
	},
	languages: {
		name: 'languages',
		label: 'Language',
		plural: 'Languages',
		icon: '🗣️',
		description: 'Languages of the world',
		endpoint: 'languages'
	},
	alignments: {
		name: 'alignments',
		label: 'Alignment',
		plural: 'Alignments',
		icon: '⚖️',
		description: 'Moral and ethical alignments',
		endpoint: 'alignments'
	},
	documents: {
		name: 'documents',
		label: 'Document',
		plural: 'Documents',
		icon: '📄',
		description: 'Source books and documents',
		endpoint: 'documents'
	},
	gamesystems: {
		name: 'gamesystems',
		label: 'Game System',
		plural: 'Game Systems',
		icon: '🎮',
		description: 'Game system editions',
		endpoint: 'gamesystems'
	},
	publishers: {
		name: 'publishers',
		label: 'Publisher',
		plural: 'Publishers',
		icon: '🏢',
		description: 'Content publishers',
		endpoint: 'publishers'
	},
	licenses: {
		name: 'licenses',
		label: 'License',
		plural: 'Licenses',
		icon: '📜',
		description: 'Content licenses',
		endpoint: 'licenses'
	},
	images: {
		name: 'images',
		label: 'Image',
		plural: 'Images',
		icon: '🖼️',
		description: 'Game images and art',
		endpoint: 'images'
	},
	services: {
		name: 'services',
		label: 'Service',
		plural: 'Services',
		icon: '🛠️',
		description: 'Available services',
		endpoint: 'services'
	}
};

export const COMPENDIUM_CATEGORIES = [
	{
		name: 'Character Options',
		description: 'Build your character',
		types: ['species', 'classes', 'backgrounds', 'feats'] as CompendiumTypeName[]
	},
	{
		name: 'Spells & Magic',
		description: 'Arcane and divine magic',
		types: ['spells', 'spellschools'] as CompendiumTypeName[]
	},
	{
		name: 'Creatures & Monsters',
		description: 'Bestiary of foes',
		types: ['creatures', 'creaturetypes'] as CompendiumTypeName[]
	},
	{
		name: 'Equipment',
		description: 'Gear and treasure',
		types: ['weapons', 'armor', 'magicitems'] as CompendiumTypeName[]
	},
	{
		name: 'Rules & Mechanics',
		description: 'Game fundamentals',
		types: ['conditions', 'damagetypes', 'skills', 'abilities', 'rules'] as CompendiumTypeName[]
	},
	{
		name: 'World Building',
		description: 'Languages, environments, and more',
		types: ['languages', 'environments', 'alignments', 'sizes'] as CompendiumTypeName[]
	}
] as const;

export const SEARCHABLE_TYPES: CompendiumTypeName[] = [
	'species',
	'classes',
	'backgrounds',
	'feats',
	'spells',
	'creatures',
	'weapons',
	'armor',
	'magicitems',
	'skills',
	'languages',
	'alignments',
	'conditions',
	'abilities',
	'damagetypes',
	'spellschools',
	'creaturetypes',
	'environments',
	'sizes',
	'rules'
];
