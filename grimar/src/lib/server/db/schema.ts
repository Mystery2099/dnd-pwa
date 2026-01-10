import { integer, sqliteTable, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	username: text('username').primaryKey(),
	settings: text('settings', { mode: 'json' })
		.notNull()
		.$defaultFn(() => ({}))
});

export const compendiumItems = sqliteTable(
	'compendium_items',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		// Source of the data (e.g., open5e, homebrew, github)
		source: text('source').notNull(),
		// Domain type: spell | monster | item | etc.
		type: text('type').notNull(),
		// Stable external identifier (e.g., open5e index, github slug)
		externalId: text('external_id'),
		name: text('name').notNull(),
		summary: text('summary'),
		// Denormalized searchable content extracted from details JSON
		content: text('content'),
		// Render-ready payload for list/detail views
		details: text('details', { mode: 'json' }).notNull(),
		// External JSON path (Option B: file-per-item)
		jsonPath: text('json_path'),
		// Edition: 2014 (5e 2014) | 2024 (5e 2024) | null (mixed/unknown)
		edition: text('edition'),
		// Source book: SRD | PHB | XGE | TCoE | VGM | etc.
		sourceBook: text('source_book'),
		// Data version from the import (e.g., 4.3.0)
		dataVersion: text('data_version'),
		// Spell sorting columns
		spellLevel: integer('spell_level'),
		spellSchool: text('spell_school'),
		// Monster sorting columns
		challengeRating: text('challenge_rating'),
		monsterSize: text('monster_size'),
		monsterType: text('monster_type'),
		// New type-specific columns for filtering/sorting
		classHitDie: integer('class_hit_die'),
		raceSize: text('race_size'),
		raceSpeed: integer('race_speed'),
		backgroundFeature: text('background_feature'),
		backgroundSkillProficiencies: text('background_skill_proficiencies'),
		featPrerequisites: text('feat_prerequisites'),
		// Subclass-specific columns
		subclassName: text('subclass_name'),
		className: text('class_name'),
		subclassFlavor: text('subclass_flavor'),
		// Subrace-specific columns
		subraceName: text('subrace_name'),
		raceName: text('race_name'),
		// Trait-specific columns
		traitName: text('trait_name'),
		traitRaces: text('trait_races'),
		// Condition-specific columns
		conditionName: text('condition_name'),
		// Feature-specific columns
		featureName: text('feature_name'),
		featureLevel: integer('feature_level'),
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
		createdByIdx: index('compendium_items_created_by_idx').on(table.createdBy),
		spellLevelIdx: index('compendium_items_spell_level_idx').on(table.spellLevel),
		spellSchoolIdx: index('compendium_items_spell_school_idx').on(table.spellSchool),
		typeLevelSchoolIdx: index('compendium_items_type_level_school_idx').on(
			table.type,
			table.spellLevel,
			table.spellSchool
		),
		// Monster sorting indexes
		challengeRatingIdx: index('compendium_items_challenge_rating_idx').on(table.challengeRating),
		monsterSizeIdx: index('compendium_items_monster_size_idx').on(table.monsterSize),
		monsterTypeIdx: index('compendium_items_monster_type_idx').on(table.monsterType),
		// New type-specific indexes
		classHitDieIdx: index('compendium_items_class_hit_die_idx').on(table.classHitDie),
		raceSizeIdx: index('compendium_items_race_size_idx').on(table.raceSize),
		backgroundFeatureIdx: index('compendium_items_background_feature_idx').on(
			table.backgroundFeature
		),
		featPrerequisitesIdx: index('compendium_items_feat_prerequisites_idx').on(
			table.featPrerequisites
		),
		// Edition/source indexes
		editionIdx: index('compendium_items_edition_idx').on(table.edition),
		sourceBookIdx: index('compendium_items_source_book_idx').on(table.sourceBook),
		dataVersionIdx: index('compendium_items_data_version_idx').on(table.dataVersion)
	})
);

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

// Raw cache of upstream payloads to support replay/resync
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

// Sync metadata for tracking per-provider sync state (enables incremental syncs)
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
