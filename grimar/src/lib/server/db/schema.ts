/**
 * Simplified Compendium Schema
 *
 * Aligned with Open5e API v2 structure:
 * - Uses API 'key' as primary key (e.g., 'srd-2014_fireball', 'homebrew_custom_spell')
 * - Stores full JSON response in 'data' column
 * - Extracts common indexed fields for fast filtering
 * - Single table for all compendium types (no metadata tables)
 */

import { integer, sqliteTable, text, index, primaryKey } from 'drizzle-orm/sqlite-core';

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
// Compendium Table (Single unified table)
// ============================================================================

export type CompendiumItem = typeof compendium.$inferSelect;
export type NewCompendiumItem = typeof compendium.$inferInsert;

export const compendium = sqliteTable(
	'compendium',
	{
		key: text('key').notNull(),
		type: text('type').notNull(),
		name: text('name').notNull(),
		source: text('source').notNull(),
		documentKey: text('document_key'),
		documentName: text('document_name'),
		gamesystemKey: text('gamesystem_key'),
		gamesystemName: text('gamesystem_name'),
		publisherKey: text('publisher_key'),
		publisherName: text('publisher_name'),
		description: text('description'),
		data: text('data', { mode: 'json' }).notNull().$type<Record<string, unknown>>(),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		createdBy: text('created_by').references(() => users.username)
	},
	(table) => ({
		pk: primaryKey({ columns: [table.type, table.key] }),
		typeIdx: index('compendium_type_idx').on(table.type),
		typeNameIdx: index('compendium_type_name_idx').on(table.type, table.name),
		sourceIdx: index('compendium_source_idx').on(table.source),
		documentIdx: index('compendium_document_idx').on(table.documentKey),
		gamesystemIdx: index('compendium_gamesystem_idx').on(table.gamesystemKey),
		publisherIdx: index('compendium_publisher_idx').on(table.publisherKey),
		nameIdx: index('compendium_name_idx').on(table.name)
	})
);

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
// Sync Metadata Table
// ============================================================================

export const syncMetadata = sqliteTable('sync_metadata', {
	providerId: text('provider_id').primaryKey(),
	lastSyncAt: integer('last_sync_at', { mode: 'timestamp' }),
	itemCount: integer('item_count').default(0)
});

// ============================================================================
// Compendium Types (matches Open5e API v2 endpoints)
// ============================================================================

export const COMPENDIUM_TYPES = [
	'spells',
	'creatures',
	'species',
	'items',
	'magicitems',
	'classes',
	'weapons',
	'armor',
	'backgrounds',
	'feats',
	'rules',
	'damagetypes',
	'spellschools',
	'creaturetypes',
	'environments',
	'skills',
	'languages',
	'alignments',
	'conditions',
	'abilities',
	'sizes',
	'itemcategories',
	'itemrarities',
	'documents',
	'gamesystems',
	'publishers',
	'licenses',
	'images',
	'itemsets',
	'rulesections',
	'rulesets',
	'weaponproperties',
	'services',
	'classfeatures',
	'classfeatureitems',
	'creatureactions',
	'creatureactionattacks',
	'creaturetraits',
	'speciestraits',
	'backgroundbenefits',
	'featbenefits',
	'spellcastingoptions',
	'weaponpropertyassignments',
	'creaturesets'
] as const;

export type CompendiumType = (typeof COMPENDIUM_TYPES)[number];

// ============================================================================
// Source Types
// ============================================================================

export const SOURCE_TYPES = {
	OPEN5E: 'open5e',
	HOMEBREW: 'homebrew'
} as const;

export type SourceType = (typeof SOURCE_TYPES)[keyof typeof SOURCE_TYPES];
