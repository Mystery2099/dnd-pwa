/**
 * Open5e Provider
 *
 * Adapter for Open5e GitHub releases (Hybrid SQLite approach).
 * Fetches raw JSON directly from GitHub for all publishers/sources.
 */

import { BaseProvider } from './base-provider';
import type { ProviderListResponse, TransformResult } from './types';
import type { CompendiumTypeName } from '$lib/core/types/compendium';
import { z } from 'zod';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('Open5eProvider');

// GitHub configuration
const OPEN5E_RAW_BASE = 'https://raw.githubusercontent.com/open5e/open5e-api';
const OPEN5E_API_BASE = 'https://api.github.com/repos/open5e/open5e-api';
const VERSION = 'v1.12.0';

// Publishers and their sources (from data/v2/)
const PUBLISHERS = {
	'en-publishing': ['a5e-ag', 'a5e-ddg', 'a5e-gpg', 'a5e-mm'],
	'green-ronin': ['tdcs'],
	'kobold-press': [
		'bfrd',
		'ccdx',
		'deepm',
		'deepmx',
		'kp',
		'tob',
		'tob-2023',
		'tob2',
		'tob3',
		'toh',
		'vom',
		'wz'
	],
	open5e: ['core', 'elderberry-inn-icons', 'open5e', 'open5e-2024'],
	somanyrobots: ['spells-that-dont-suck'],
	'wizards-of-the-coast': ['srd-2014', 'srd-2024']
} as const;

// Type mapping: compendium type (Open5e v2) -> v2 JSON filename
const TYPE_FILES: Record<CompendiumTypeName, string> = {
	spells: 'Spell.json',
	creatures: 'Creature.json',
	magicitems: 'Item.json',
	itemsets: 'ItemSet.json',
	itemcategories: 'ItemCategory.json',
	documents: 'Document.json',
	licenses: 'License.json',
	publishers: 'Publisher.json',
	weapons: 'Weapon.json',
	armor: 'Armor.json',
	gamesystems: 'GameSystem.json',
	backgrounds: 'Background.json',
	feats: 'Feat.json',
	species: 'Species.json',
	creaturetypes: 'CreatureType.json',
	creaturesets: 'CreatureSet.json',
	damagetypes: 'DamageType.json',
	languages: 'Language.json',
	alignments: 'Alignment.json',
	conditions: 'Condition.json',
	spellschools: 'SpellSchool.json',
	classes: 'CharacterClass.json',
	sizes: 'Size.json',
	itemrarities: 'ItemRarity.json',
	environments: 'Environment.json',
	abilities: 'Ability.json',
	skills: 'Skill.json',
	rules: 'Rule.json',
	rulesections: 'RuleSection.json',
	rulesets: 'RuleSet.json',
	images: 'Image.json',
	weaponproperties: 'WeaponProperty.json',
	services: 'Service.json'
};

// ============================================================================
// Zod Schemas for v2 API format
// ============================================================================

export const Open5eDocumentSchema = z.object({
	fields: z.object({
		name: z.string(),
		display_name: z.string().nullable().optional(),
		publisher: z.string(),
		gamesystem: z.string().optional(),
		desc: z.string().optional()
	}),
	model: z.string(),
	pk: z.string()
});

export const Open5eSpellSchema = z.object({
	fields: z.object({
		name: z.string(),
		desc: z.array(z.string()).optional(),
		higher_level: z.array(z.string()).optional(),
		level: z.number(),
		school: z.string().optional(),
		classes: z.array(z.string()).optional(),
		range: z.string().optional(),
		range_text: z.string().optional(),
		components: z.array(z.string()).optional(),
		material: z.string().optional(),
		ritual: z.boolean(),
		duration: z.string().optional(),
		concentration: z.boolean(),
		casting_time: z.string().optional()
	}),
	model: z.string(),
	pk: z.string(),
	document: z.string()
});

export const Open5eCreatureSchema = z.object({
	fields: z.object({
		name: z.string(),
		size: z.string().optional(),
		type: z.string().optional(),
		subtype: z.string().optional(),
		challenge_rating: z.union([z.number(), z.string()]).optional(),
		armor_class: z.number().optional(),
		hit_points: z.number().optional(),
		speed: z.record(z.string(), z.union([z.string(), z.number()])).optional()
	}),
	model: z.string(),
	pk: z.string(),
	document: z.string()
});

export const Open5eItemSchema = z.object({
	fields: z.object({
		name: z.string(),
		rarity: z.string().optional(),
		type: z.string().optional(),
		desc: z.array(z.string()).optional()
	}),
	model: z.string(),
	pk: z.string(),
	document: z.string()
});

export const Open5eFeatSchema = z.object({
	fields: z.object({
		name: z.string(),
		prerequisites: z.array(z.string()).optional(),
		description: z.array(z.string()).optional()
	}),
	model: z.string(),
	pk: z.string(),
	document: z.string()
});

export const Open5eBackgroundSchema = z.object({
	fields: z.object({
		name: z.string(),
		feature: z.object({ name: z.string() }).optional()
	}),
	model: z.string(),
	pk: z.string(),
	document: z.string()
});

export const Open5eSpeciesSchema = z.object({
	fields: z.object({
		name: z.string(),
		desc: z.string().optional(),
		traits: z.array(z.object({ name: z.string() })).optional()
	}),
	model: z.string(),
	pk: z.string(),
	document: z.string()
});

export const Open5eCharacterClassSchema = z.object({
	fields: z.object({
		name: z.string(),
		hit_die: z.number().optional()
	}),
	model: z.string(),
	pk: z.string(),
	document: z.string()
});

export const Open5eGenericSchema = z.object({
	fields: z.record(z.string(), z.any()),
	model: z.string(),
	pk: z.string(),
	document: z.string()
});

// ============================================================================
// Type exports
// ============================================================================

export type Open5eDocument = z.infer<typeof Open5eDocumentSchema>;
export type Open5eSpell = z.infer<typeof Open5eSpellSchema>;
export type Open5eCreature = z.infer<typeof Open5eCreatureSchema>;
export type Open5eItem = z.infer<typeof Open5eItemSchema>;
export type Open5eFeat = z.infer<typeof Open5eFeatSchema>;
export type Open5eBackground = z.infer<typeof Open5eBackgroundSchema>;
export type Open5eSpecies = z.infer<typeof Open5eSpeciesSchema>;
export type Open5eCharacterClass = z.infer<typeof Open5eCharacterClassSchema>;
export type Open5eGeneric = z.infer<typeof Open5eGenericSchema>;

// ============================================================================
// Provider Implementation
// ============================================================================

interface SourceInfo {
	publisher: string;
	source: string;
	displayName: string;
	gamesystem?: string;
}

export class Open5eProvider extends BaseProvider {
	readonly id = 'open5e';
	readonly name = 'Open5e';
	readonly baseUrl: string;

	private sources: Map<string, SourceInfo> = new Map();
	private sourcesLoaded = false;

	private static readonly DEFAULT_TYPES = [
		'spells',
		'creatures',
		'magicitems',
		'feats',
		'backgrounds',
		'species',
		'classes'
	] as const satisfies readonly CompendiumTypeName[];

	constructor(baseUrl: string = OPEN5E_RAW_BASE, supportedTypes?: readonly CompendiumTypeName[]) {
		super(supportedTypes ?? Open5eProvider.DEFAULT_TYPES);
		this.baseUrl = baseUrl;
	}

	/**
	 * Load all sources from GitHub
	 * Fetches Document.json for each publisher/source to get metadata
	 */
	async loadSources(): Promise<void> {
		if (this.sourcesLoaded) return;

		log.info('Loading sources from GitHub...');

		for (const [publisher, sources] of Object.entries(PUBLISHERS)) {
			for (const source of sources) {
				try {
					const url = `${this.baseUrl}/${VERSION}/data/v2/${publisher}/${source}/Document.json`;
					const response = await fetch(url);

					if (!response.ok) {
						log.warn({ url, status: response.status }, 'Failed to fetch Document.json');
						continue;
					}

					const data = await response.json();

					// Handle array response - Document.json returns arrays
					const docs = Array.isArray(data) ? data : [data];

					for (const d of docs) {
						// Parse each document individually
						const parsed = Open5eDocumentSchema.parse(d);
						const sourceInfo: SourceInfo = {
							publisher,
							source: parsed.pk,
							displayName: parsed.fields.display_name || parsed.fields.name,
							gamesystem: parsed.fields.gamesystem
						};
						this.sources.set(parsed.pk, sourceInfo);
					}

					log.debug({ publisher, source, docCount: docs.length }, 'Loaded source');
				} catch (error) {
					log.warn({ publisher, source, error }, 'Failed to load source');
				}
			}
		}

		this.sourcesLoaded = true;
		log.info({ sourceCount: this.sources.size }, 'Sources loaded');
	}

	async fetchList(type: CompendiumTypeName): Promise<ProviderListResponse> {
		await this.loadSources();
		const fileName = TYPE_FILES[type];
		if (!fileName) {
			return { items: [], hasMore: false };
		}

		// Collect sources that have this type file
		const sources: SourceInfo[] = [];
		for (const sourceInfo of this.sources.values()) {
			try {
				const url = `${this.baseUrl}/${VERSION}/data/v2/${sourceInfo.publisher}/${sourceInfo.source}/${fileName}`;
				const response = await fetch(url, { method: 'HEAD' });
				if (response.ok) {
					sources.push(sourceInfo);
				}
			} catch {
				// Source doesn't have this type
			}
		}

		if (sources.length === 0) {
			return { items: [], hasMore: false };
		}

		const allItems: unknown[] = [];

		for (const sourceInfo of sources) {
			try {
				const url = `${this.baseUrl}/${VERSION}/data/v2/${sourceInfo.publisher}/${sourceInfo.source}/${fileName}`;
				const response = await fetch(url);

				if (!response.ok) {
					log.warn({ url, status: response.status }, 'Failed to fetch type file');
					continue;
				}

				const data = await response.json();
				const items = Array.isArray(data) ? data : [data];

				// Tag items with source info
				for (const item of items) {
					(item as Record<string, unknown>)._sourceInfo = sourceInfo;
				}

				allItems.push(...items);
			} catch (error) {
				log.warn({ source: sourceInfo.source, type, error }, 'Failed to fetch type');
			}
		}

		return {
			items: allItems,
			hasMore: false
		};
	}

	async fetchAllPages(type: CompendiumTypeName): Promise<unknown[]> {
		const response = await this.fetchList(type);
		return response.items;
	}

	async fetchDetail(
		type: CompendiumTypeName,
		externalId: string
	): Promise<Record<string, unknown>> {
		const allItems = await this.fetchAllPages(type);
		const item = allItems.find((i) => {
			const raw = i as Record<string, unknown>;
			return raw.pk === externalId;
		});

		if (!item) {
			throw new Error(`Item not found: ${externalId}`);
		}

		return item as Record<string, unknown>;
	}

	transformItem(rawItem: unknown, type: CompendiumTypeName): TransformResult {
		const raw = rawItem as Record<string, unknown>;
		const sourceInfo = raw._sourceInfo as SourceInfo | undefined;
		const sourceBook = sourceInfo?.source || 'unknown';
		const sourcePublisher = sourceInfo?.publisher || 'unknown';
		const edition = this.extractEdition(sourceInfo?.gamesystem);

		// Build jsonData from fields
		const fields = raw.fields as Record<string, unknown>;
		const jsonData = JSON.stringify(fields);

		const result = this.transformFields(raw, type, sourceBook, sourcePublisher, edition);

		return {
			...result,
			jsonData,
			sourceBook,
			sourcePublisher
		};
	}

	private extractEdition(gamesystem?: string): string | undefined {
		if (!gamesystem) return undefined;
		if (gamesystem.includes('2024')) return '2024';
		if (gamesystem.includes('2014')) return '2014';
		return undefined;
	}

	private transformFields(
		raw: Record<string, unknown>,
		type: CompendiumTypeName,
		sourceBook: string,
		sourcePublisher: string,
		edition?: string
	): TransformResult {
		const fields = raw.fields as Record<string, unknown>;
		const pk = raw.pk as string;

		switch (type) {
			case 'spells':
				return this.transformSpell(fields, pk, sourceBook, edition);
			case 'creatures':
				return this.transformCreature(fields, pk, sourceBook);
			case 'magicitems':
				return this.transformItemRecord(fields, pk, sourceBook);
			case 'feats':
				return this.transformFeat(fields, pk, sourceBook);
			case 'backgrounds':
				return this.transformBackground(fields, pk, sourceBook);
			case 'species':
				return this.transformSpecies(fields, pk, sourceBook);
			case 'classes':
				return this.transformClass(fields, pk, sourceBook);
			default:
				return this.transformGeneric(fields, pk, sourceBook);
		}
	}

	private transformSpell(
		fields: Record<string, unknown>,
		externalId: string,
		sourceBook: string,
		edition?: string
	): TransformResult {
		const name = String(fields.name || 'Unknown');
		const level = Number(fields.level) || 0;
		const school = String(fields.school || 'Unknown');
		const summary = level === 0 ? `Cantrip ${school}` : `Level ${level} ${school}`;

		return {
			externalId,
			name,
			summary,
			details: fields,
			spellLevel: level,
			spellSchool: school,
			sourceBook,
			edition
		};
	}

	private transformCreature(
		fields: Record<string, unknown>,
		externalId: string,
		sourceBook: string
	): TransformResult {
		const name = String(fields.name || 'Unknown');
		const size = String(fields.size || 'Medium');
		const typeName = String(fields.type || 'Unknown');
		const cr = String(fields.challenge_rating || 'Unknown');
		const summary = `${size} ${typeName}, CR ${cr}`;

		return {
			externalId,
			name,
			summary,
			details: fields,
			challengeRating: cr,
			creatureSize: size,
			creatureType: typeName,
			sourceBook
		};
	}

	private transformItemRecord(
		fields: Record<string, unknown>,
		externalId: string,
		sourceBook: string
	): TransformResult {
		const name = String(fields.name || 'Unknown');
		const rarity = String(fields.rarity || 'Unknown');
		const itemType = String(fields.type || 'Item');
		const summary = `${rarity} ${itemType}`;

		return {
			externalId,
			name,
			summary,
			details: fields,
			sourceBook
		};
	}

	private transformFeat(
		fields: Record<string, unknown>,
		externalId: string,
		sourceBook: string
	): TransformResult {
		const name = String(fields.name || 'Unknown');
		const prereqs = fields.prerequisites as string[] | undefined;
		const summary = prereqs?.length ? `Prerequisite: ${prereqs.join(', ')}` : 'Feat';

		return {
			externalId,
			name,
			summary,
			details: fields,
			featPrerequisites: prereqs?.join(', ') || '',
			sourceBook
		};
	}

	private transformBackground(
		fields: Record<string, unknown>,
		externalId: string,
		sourceBook: string
	): TransformResult {
		const name = String(fields.name || 'Unknown');
		const feature = fields.feature as { name?: string } | undefined;
		const summary = feature?.name ? `Feature: ${feature.name}` : 'Background';

		return {
			externalId,
			name,
			summary,
			details: fields,
			backgroundFeature: feature?.name || '',
			sourceBook
		};
	}

	private transformSpecies(
		fields: Record<string, unknown>,
		externalId: string,
		sourceBook: string
	): TransformResult {
		const name = String(fields.name || 'Unknown');
		const summary = name;

		return {
			externalId,
			name,
			summary,
			details: fields,
			sourceBook
		};
	}

	private transformClass(
		fields: Record<string, unknown>,
		externalId: string,
		sourceBook: string
	): TransformResult {
		const name = String(fields.name || 'Unknown');
		const hitDie = Number(fields.hit_die) || 8;
		const summary = `Hit Die: d${hitDie}`;

		return {
			externalId,
			name,
			summary,
			details: fields,
			classHitDie: hitDie,
			sourceBook
		};
	}

	private transformGeneric(
		fields: Record<string, unknown>,
		externalId: string,
		sourceBook: string
	): TransformResult {
		const name = String(fields.name || 'Unknown');

		return {
			externalId,
			name,
			summary: name,
			details: fields,
			sourceBook
		};
	}

	protected getEndpoint(type: CompendiumTypeName): string {
		const fileName = TYPE_FILES[type];
		return `${this.baseUrl}/${VERSION}/data/v2/{publisher}/{source}/${fileName}`;
	}
}
