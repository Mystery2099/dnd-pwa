/**
 * Normalized Database Schema
 *
 * This schema improves upon the original by:
 * 1. Normalizing type-specific data into dedicated tables
 * 2. Adding proper foreign key relationships
 * 3. Creating lookup tables for standard D&D values
 * 4. Improving indexing for common query patterns
 *
 * The base compendium_items table stores core searchable data,
 * while type-specific tables store normalized attributes.
 */

import { integer, sqliteTable, text, uniqueIndex, index, real } from 'drizzle-orm/sqlite-core';

// ============================================================================
// Users Table
// ============================================================================

export const users = sqliteTable('users', {
	username: text('username').primaryKey(),
	settings: text('settings', { mode: 'json' })
		.notNull()
		.$defaultFn(() => ({}))
});

// ============================================================================
// Base Compendium Items Table
// ============================================================================

export type CompendiumItem = typeof compendiumItems.$inferSelect;
export type NewCompendiumItem = typeof compendiumItems.$inferInsert;

export const compendiumItems = sqliteTable(
	'compendium_items',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		// Source of the data (e.g., open5e, homebrew, github)
		source: text('source').notNull(),
		// Domain type: spell | creature | item | race | class | feat | background | subclass | subrace | feature | condition | rule | etc.
		type: text('type').notNull(),
		// Stable external identifier (e.g., open5e index, github slug)
		externalId: text('external_id'),
		name: text('name').notNull(),
		summary: text('summary'),
		// Searchable text content
		content: text('content'),
		// Render-ready payload for list/detail views (type-specific data)
		details: text('details', { mode: 'json' }).notNull(),
		// Full cleaned/transformed payload as JSON string
		jsonData: text('json_data'),
		// Edition: 2014 (5e 2014) | 2024 (5e 2024) | null (mixed/unknown)
		edition: text('edition'),
		// Source book: SRD | PHB | XGE | TCoE | VGM | etc.
		sourceBook: text('source_book'),
		// Publisher: wizards-of-the-coast, kobold-press, en-publishing, etc.
		sourcePublisher: text('source_publisher'),
		// Data version from the import (e.g., 4.3.0)
		dataVersion: text('data_version'),
		// Timestamps
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		createdBy: text('created_by').references(() => users.username)
	},
	(table) => ({
		externalIdx: uniqueIndex('compendium_items_external').on(
			table.type,
			table.source,
			table.externalId
		),
		typeIdx: index('compendium_items_type_idx').on(table.type),
		nameIdx: index('compendium_items_name_idx').on(table.name),
		typeNameIdx: index('compendium_items_type_name_idx').on(table.type, table.name),
		sourceIdx: index('compendium_items_source_idx').on(table.source),
		createdByIdx: index('compendium_items_created_by_idx').on(table.createdBy),
		editionIdx: index('compendium_items_edition_idx').on(table.edition),
		sourceBookIdx: index('compendium_items_source_book_idx').on(table.sourceBook),
		sourcePublisherIdx: index('compendium_items_source_publisher_idx').on(table.sourcePublisher),
		dataVersionIdx: index('compendium_items_data_version_idx').on(table.dataVersion),
		// Composite for common query patterns
		typeSourceIdx: index('compendium_items_type_source_idx').on(table.type, table.source),
		typeEditionIdx: index('compendium_items_type_edition_idx').on(table.type, table.edition)
	})
);

// ============================================================================
// Spell Metadata Table (One-to-One with compendium_items where type='spell')
// ============================================================================

export type SpellMetadata = typeof spellMetadata.$inferSelect;
export type NewSpellMetadata = typeof spellMetadata.$inferInsert;

export const spellMetadata = sqliteTable(
	'spell_metadata',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		// Foreign key to compendium_items
		itemId: integer('item_id')
			.notNull()
			.references(() => compendiumItems.id, { onDelete: 'cascade' }),
		// Spell-specific fields (normalized from details JSON)
		spellLevel: integer('spell_level').notNull(),
		spellSchool: text('spell_school').notNull(),
		// Casting time (e.g., "1 action", "1 bonus action", "1 minute")
		castingTime: text('casting_time'),
		// Spell range (e.g., "60 feet", "Self", "120 feet")
		spellRange: text('spell_range'),
		// Components (V, S, M stored as JSON array)
		components: text('components', { mode: 'json' }),
		// Material components (specific materials needed)
		material: text('material'),
		// Duration (e.g., "Instantaneous", "1 minute", "Up to 1 hour")
		duration: text('duration'),
		// Does it require concentration?
		concentration: integer('concentration', { mode: 'boolean' }).notNull().default(false),
		// Is it a ritual?
		ritual: integer('ritual', { mode: 'boolean' }).notNull().default(false),
		// Spell level as ordinal (0 = cantrip)
		spellLevelOrdinal: text('spell_level_ordinal'),
		// Damage type (for offensive spells)
		damageType: text('damage_type'),
		// School abbreviation for display (e.g., "EV", "NE", "EN")
		schoolAbbrev: text('school_abbrev')
	},
	(table) => ({
		itemIdIdx: uniqueIndex('spell_metadata_item_id_idx').on(table.itemId),
		spellLevelIdx: index('spell_metadata_level_idx').on(table.spellLevel),
		spellSchoolIdx: index('spell_metadata_school_idx').on(table.spellSchool),
		concentrationIdx: index('spell_metadata_concentration_idx').on(table.concentration),
		ritualIdx: index('spell_metadata_ritual_idx').on(table.ritual),
		damageTypeIdx: index('spell_metadata_damage_type_idx').on(table.damageType)
	})
);

// ============================================================================
// Creature Metadata Table (One-to-One with compendium_items where type='creature')
// ============================================================================

export type CreatureMetadata = typeof creatureMetadata.$inferSelect;
export type NewCreatureMetadata = typeof creatureMetadata.$inferInsert;

export const creatureMetadata = sqliteTable(
	'creature_metadata',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		itemId: integer('item_id')
			.notNull()
			.references(() => compendiumItems.id, { onDelete: 'cascade' }),
		// Challenge Rating (e.g., "0", "1/8", "1/4", "1/2", "1", "2", etc.)
		challengeRating: text('challenge_rating'),
		// Numeric CR for sorting (0, 0.125, 0.25, 0.5, 1, 2, etc.)
		challengeRatingNumeric: real('challenge_rating_numeric'),
		// Size (Tiny, Small, Medium, Large, Huge, Gargantuan)
		creatureSize: text('creature_size'),
		// Type (aberration, beast, celestial, construct, dragon, elemental, fey, fiend, giant, humanoid, monstrosity, ooze, plant, undead)
		creatureType: text('creature_type'),
		// Alignment (e.g., "chaotic evil", "neutral", "unaligned")
		alignment: text('alignment'),
		// Armor Class
		armorClass: integer('armor_class'),
		// Armor Type (e.g., "natural armor", "plate", "leather")
		armorType: text('armor_type'),
		// Hit Points (average)
		hitPoints: integer('hit_points'),
		// Hit Points Dice (e.g., "12d10+24")
		hitPointsDice: text('hit_points_dice'),
		// Speed (e.g., "30 ft., swim 30 ft.")
		speed: text('speed'),
		// Abilities (STR, DEX, CON, INT, WIS, CHA)
		strength: integer('strength'),
		dexterity: integer('dexterity'),
		constitution: integer('constitution'),
		intelligence: integer('intelligence'),
		wisdom: integer('wisdom'),
		charisma: integer('charisma'),
		// Saving Throws (JSON array)
		savingThrows: text('saving_throws', { mode: 'json' }),
		// Skills (JSON array)
		skills: text('skills', { mode: 'json' }),
		// Damage Resistances
		damageResistances: text('damage_resistances'),
		// Damage Immunities
		damageImmunities: text('damage_immunities'),
		// Condition Immunities
		conditionImmunities: text('condition_immunities'),
		// Senses (e.g., "blindsight 60 ft., passive Perception 14")
		senses: text('senses'),
		// Languages
		languages: text('languages'),
		// Challenge Rating XP
		challengeXp: integer('challenge_xp'),
		// Is legenday?
		isLegendary: integer('is_legendary', { mode: 'boolean' }).notNull().default(false),
		// Is boss/monster?
		isBoss: integer('is_boss', { mode: 'boolean' }).notNull().default(false)
	},
	(table) => ({
		itemIdIdx: uniqueIndex('creature_metadata_item_id_idx').on(table.itemId),
		crIdx: index('creature_metadata_cr_idx').on(table.challengeRating),
		crNumericIdx: index('creature_metadata_cr_numeric_idx').on(table.challengeRatingNumeric),
		sizeIdx: index('creature_metadata_size_idx').on(table.creatureSize),
		typeIdx: index('creature_metadata_type_idx').on(table.creatureType),
		alignmentIdx: index('creature_metadata_alignment_idx').on(table.alignment),
		acIdx: index('creature_metadata_ac_idx').on(table.armorClass),
		hpIdx: index('creature_metadata_hp_idx').on(table.hitPoints),
		isLegendaryIdx: index('creature_metadata_legendary_idx').on(table.isLegendary)
	})
);

// ============================================================================
// Race Metadata Table (One-to-One with compendium_items where type='race')
// ============================================================================

export type RaceMetadata = typeof raceMetadata.$inferSelect;
export type NewRaceMetadata = typeof raceMetadata.$inferInsert;

export const raceMetadata = sqliteTable(
	'race_metadata',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		itemId: integer('item_id')
			.notNull()
			.references(() => compendiumItems.id, { onDelete: 'cascade' }),
		// Size category
		raceSize: text('race_size'),
		// Speed in feet
		raceSpeed: integer('race_speed'),
		// Ability score increases (JSON object)
		abilityScoreIncreases: text('ability_score_increases', { mode: 'json' }),
		// Age description
		age: text('age'),
		// Alignment description
		alignment: text('alignment'),
		// Size description
		sizeDescription: text('size_description'),
		// Speed description
		speedDescription: text('speed_description'),
		// Languages
		languages: text('languages'),
		// Language description
		languageDescription: text('language_description'),
		// Trait count (number of racial traits)
		traitCount: integer('trait_count')
	},
	(table) => ({
		itemIdIdx: uniqueIndex('race_metadata_item_id_idx').on(table.itemId),
		sizeIdx: index('race_metadata_size_idx').on(table.raceSize),
		speedIdx: index('race_metadata_speed_idx').on(table.raceSpeed)
	})
);

// ============================================================================
// Class Metadata Table (One-to-One with compendium_items where type='class')
// ============================================================================

export type ClassMetadata = typeof classMetadata.$inferSelect;
export type NewClassMetadata = typeof classMetadata.$inferInsert;

export const classMetadata = sqliteTable(
	'class_metadata',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		itemId: integer('item_id')
			.notNull()
			.references(() => compendiumItems.id, { onDelete: 'cascade' }),
		// Hit Die (e.g., d6, d8, d10, d12)
		classHitDie: text('class_hit_die'),
		// Hit Die as number for sorting (6, 8, 10, 12)
		classHitDieNumber: integer('class_hit_die_number'),
		// Primary ability (e.g., "Charisma", "Wisdom")
		primaryAbility: text('primary_ability'),
		// Saving throws (JSON array)
		savingThrows: text('saving_throws', { mode: 'json' }),
		// Armor proficiencies (JSON array)
		armorProficiencies: text('armor_proficiencies', { mode: 'json' }),
		// Weapon proficiencies (JSON array)
		weaponProficiencies: text('weapon_proficiencies', { mode: 'json' }),
		// Tool proficiencies (JSON array)
		toolProficiencies: text('tool_proficiencies', { mode: 'json' }),
		// Skill choices (number of skills to choose)
		skillCount: integer('skill_count'),
		// Available skills to choose from (JSON array)
		skillChoices: text('skill_choices', { mode: 'json' }),
		// Does the class cast spells?
		spellcasting: integer('spellcasting', { mode: 'boolean' }).notNull().default(false),
		// Spellcasting ability (if applicable)
		spellcastingAbility: text('spellcasting_ability'),
		// Subclass name (if this is a subclass)
		subclassName: text('subclass_name'),
		// Parent class name (for subclasses)
		parentClassName: text('parent_class_name'),
		// Class level at which subclass is chosen
		subclassLevel: integer('subclass_level'),
		// Flavor text (e.g., "Oath of Devotion")
		subclassFlavor: text('subclass_flavor')
	},
	(table) => ({
		itemIdIdx: uniqueIndex('class_metadata_item_id_idx').on(table.itemId),
		hitDieIdx: index('class_metadata_hit_die_idx').on(table.classHitDieNumber),
		primaryAbilityIdx: index('class_metadata_primary_ability_idx').on(table.primaryAbility),
		spellcastingIdx: index('class_metadata_spellcasting_idx').on(table.spellcasting),
		parentClassIdx: index('class_metadata_parent_class_idx').on(table.parentClassName)
	})
);

// ============================================================================
// Item Metadata Table (One-to-One with compendium_items where type='item')
// ============================================================================

export type ItemMetadata = typeof itemMetadata.$inferSelect;
export type NewItemMetadata = typeof itemMetadata.$inferInsert;

export const itemMetadata = sqliteTable(
	'item_metadata',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		itemId: integer('item_id')
			.notNull()
			.references(() => compendiumItems.id, { onDelete: 'cascade' }),
		// Rarity (common, uncommon, rare, very rare, legendary, artifact)
		rarity: text('rarity'),
		// Requires attunement?
		attunement: text('attunement'),
		// Item type (weapon, armor, potion, ring, wand, wondrous item, etc.)
		itemType: text('item_type'),
		// Weapon category (martial, simple)
		weaponCategory: text('weapon_category'),
		// Armor category (light, medium, heavy, shield)
		armorCategory: text('armor_category'),
		// Damage (e.g., "1d8 slashing")
		damage: text('damage'),
		// Damage type (slashing, piercing, bludgeoning, etc.)
		damageType: text('damage_type'),
		// Properties (JSON array - e.g., "finesse", "versatile", "ammunition")
		properties: text('properties', { mode: 'json' }),
		// Armor Class (for armor)
		armorClass: integer('armor_class'),
		// Strength requirement
		strengthRequirement: integer('strength_requirement'),
		// Stealth disadvantage
		stealthDisadvantage: integer('stealth_disadvantage', { mode: 'boolean' }).notNull().default(false),
		// Weight in pounds
		weight: real('weight'),
		// Value in gold pieces
		value: integer('value'),
		// Currency (gp, sp, cp)
		currency: text('currency')
	},
	(table) => ({
		itemIdIdx: uniqueIndex('item_metadata_item_id_idx').on(table.itemId),
		rarityIdx: index('item_metadata_rarity_idx').on(table.rarity),
		itemTypeIdx: index('item_metadata_type_idx').on(table.itemType),
		weaponCategoryIdx: index('item_metadata_weapon_category_idx').on(table.weaponCategory),
		armorCategoryIdx: index('item_metadata_armor_category_idx').on(table.armorCategory),
		damageTypeIdx: index('item_metadata_damage_type_idx').on(table.damageType),
		weightIdx: index('item_metadata_weight_idx').on(table.weight),
		valueIdx: index('item_metadata_value_idx').on(table.value)
	})
);

// ============================================================================
// Feat Metadata Table
// ============================================================================

export type FeatMetadata = typeof featMetadata.$inferSelect;
export type NewFeatMetadata = typeof featMetadata.$inferInsert;

export const featMetadata = sqliteTable(
	'feat_metadata',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		itemId: integer('item_id')
			.notNull()
			.references(() => compendiumItems.id, { onDelete: 'cascade' }),
		// Prerequisites (text description)
		featPrerequisites: text('feat_prerequisites'),
		// Prerequisites as structured data (JSON array)
		prerequisites: text('prerequisites', { mode: 'json' }),
		// Benefits as JSON array
		benefits: text('benefits', { mode: 'json' }),
		// Level acquired
		levelAcquired: integer('level_acquired')
	},
	(table) => ({
		itemIdIdx: uniqueIndex('feat_metadata_item_id_idx').on(table.itemId),
		prereqIdx: index('feat_metadata_prereq_idx').on(table.featPrerequisites),
		levelIdx: index('feat_metadata_level_idx').on(table.levelAcquired)
	})
);

// ============================================================================
// Background Metadata Table
// ============================================================================

export type BackgroundMetadata = typeof backgroundMetadata.$inferSelect;
export type NewBackgroundMetadata = typeof backgroundMetadata.$inferInsert;

export const backgroundMetadata = sqliteTable(
	'background_metadata',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		itemId: integer('item_id')
			.notNull()
			.references(() => compendiumItems.id, { onDelete: 'cascade' }),
		// Skill proficiencies (JSON array)
		skillProficiencies: text('skill_proficiencies', { mode: 'json' }),
		// Tool proficiencies (JSON array)
		toolProficiencies: text('tool_proficiencies', { mode: 'json' }),
		// Languages (JSON array)
		languages: text('languages', { mode: 'json' }),
		// Equipment (JSON array)
		equipment: text('equipment', { mode: 'json' }),
		// Starting gold
		startingGold: integer('starting_gold'),
		// Feature name
		backgroundFeature: text('background_feature'),
		// Feature description
		featureDescription: text('feature_description'),
		// Personality traits (JSON array)
		personalityTraits: text('personality_traits', { mode: 'json' }),
		// Ideals (JSON array)
		ideals: text('ideals', { mode: 'json' }),
		// Bonds (JSON array)
		bonds: text('bonds', { mode: 'json' }),
		// Flaws (JSON array)
		flaws: text('flaws', { mode: 'json' })
	},
	(table) => ({
		itemIdIdx: uniqueIndex('background_metadata_item_id_idx').on(table.itemId),
		skillProfIdx: index('background_metadata_skill_idx').on(table.skillProficiencies),
		featureIdx: index('background_metadata_feature_idx').on(table.backgroundFeature)
	})
);

// ============================================================================
// Condition Metadata Table
// ============================================================================

export type ConditionMetadata = typeof conditionMetadata.$inferSelect;
export type NewConditionMetadata = typeof conditionMetadata.$inferInsert;

export const conditionMetadata = sqliteTable(
	'condition_metadata',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		itemId: integer('item_id')
			.notNull()
			.references(() => compendiumItems.id, { onDelete: 'cascade' }),
		// Condition name (for searching)
		conditionName: text('condition_name'),
		// Description
		description: text('description'),
		// Full text
		fullText: text('full_text')
	},
	(table) => ({
		itemIdIdx: uniqueIndex('condition_metadata_item_id_idx').on(table.itemId),
		nameIdx: index('condition_metadata_name_idx').on(table.conditionName)
	})
);

// ============================================================================
// Reference Tables (Lookup Tables for Standard D&D Values)
// ============================================================================

export const creatureTypes = sqliteTable('creature_types', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	description: text('description'),
	sourceBook: text('source_book')
});

export const spellSchools = sqliteTable('spell_schools', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	abbreviation: text('abbreviation'),
	description: text('description')
});

export const damageTypes = sqliteTable('damage_types', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	description: text('description')
});

export const skills = sqliteTable('skills', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	ability: text('ability').notNull(), // STR, DEX, CON, INT, WIS, CHA
	description: text('description')
});

export const abilities = sqliteTable('abilities', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(), // Strength, Dexterity, etc.
	abbreviation: text('abbreviation').notNull() // STR, DEX, etc.
});

export const alignments = sqliteTable('alignments', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	abbreviation: text('abbreviation')
});

export const sizes = sqliteTable('sizes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(), // Tiny, Small, Medium, Large, Huge, Gargantuan
	abbreviation: text('abbreviation'),
	spaceFeet: integer('space_feet') // Space in feet (e.g., 5 for Medium)
});

// ============================================================================
// Characters Table
// ============================================================================

export const characters = sqliteTable(
	'characters',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		owner: text('owner')
			.notNull()
			.references(() => users.username),
		name: text('name').notNull(),
		portraitUrl: text('portrait_url'),
		stats: text('stats', { mode: 'json' })
			.notNull()
			.$defaultFn(() => ({})),
		inventory: text('inventory', { mode: 'json' })
			.notNull()
			.$defaultFn(() => []),
		spells: text('spells', { mode: 'json' })
			.notNull()
			.$defaultFn(() => [])
	},
	(table) => ({
		ownerIdx: index('characters_owner_idx').on(table.owner),
		nameIdx: index('characters_name_idx').on(table.name)
	})
);

// ============================================================================
// Raw Cache Table
// ============================================================================

export const compendiumCache = sqliteTable(
	'compendium_cache',
	{
		id: text('id').primaryKey(),
		type: text('type').notNull(),
		data: text('data', { mode: 'json' }).notNull()
	},
	(table) => ({
		typeIdx: index('compendium_cache_type_idx').on(table.type)
	})
);

// ============================================================================
// Sync Metadata Table
// ============================================================================

export const syncMetadata = sqliteTable(
	'sync_metadata',
	{
		providerId: text('provider_id').primaryKey(),
		lastSyncAt: integer('last_sync_at'), // Unix timestamp in milliseconds
		lastSyncType: text('last_sync_type'), // 'full' | 'incremental'
		itemsSynced: integer('items_synced').default(0)
	},
	(table) => ({
		providerIdIdx: index('sync_metadata_provider_id_idx').on(table.providerId)
	})
);

// ============================================================================
// Enums (for TypeScript - actual values stored as text in SQLite)
// ============================================================================

export const SPELL_LEVELS = {
	CANTRIP: 0,
	LEVEL_1: 1,
	LEVEL_2: 2,
	LEVEL_3: 3,
	LEVEL_4: 4,
	LEVEL_5: 5,
	LEVEL_6: 6,
	LEVEL_7: 7,
	LEVEL_8: 8,
	LEVEL_9: 9,
} as const;

export const CREATURE_SIZES = {
	TINY: 'Tiny',
	SMALL: 'Small',
	MEDIUM: 'Medium',
	LARGE: 'Large',
	HUGE: 'Huge',
	GARGANTUAN: 'Gargantuan',
} as const;

export const ITEM_RARITIES = {
	COMMON: 'common',
	UNCOMMON: 'uncommon',
	RARE: 'rare',
	VERY_RARE: 'very rare',
	LEGENDARY: 'legendary',
	ARTIFACT: 'artifact',
} as const;

export type SpellLevel = (typeof SPELL_LEVELS)[keyof typeof SPELL_LEVELS];
export type CreatureSize = (typeof CREATURE_SIZES)[keyof typeof CREATURE_SIZES];
export type ItemRarity = (typeof ITEM_RARITIES)[keyof typeof ITEM_RARITIES];
