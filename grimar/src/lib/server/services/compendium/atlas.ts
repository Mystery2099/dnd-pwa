import { and, desc, inArray, like, or, sql, type SQL } from 'drizzle-orm';
import { COMPENDIUM_TYPE_CONFIGS, type CompendiumTypeName } from '$lib/core/constants/compendium';
import {
	ATLAS_PAGE_SIZE,
	getAtlasFilterContext,
	getAtlasScopeCounts,
	getAtlasScopeDefinition,
	getTypeLabel,
	type AtlasSortId,
	type AtlasBadge,
	type AtlasItem,
	type AtlasScopeId,
	type AtlasState
} from '$lib/features/compendium/atlas';
import { compendium, type CompendiumItem as DbCompendiumItem, type CompendiumType } from '$lib/server/db/schema';
import { getDb } from '$lib/server/db';
import { buildCompendiumListItem } from './list';
import { getPaginatedItems, getTypeCounts } from '$lib/server/repositories/compendium';

type AtlasQueryResult = {
	items: AtlasItem[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

export type AtlasPagePayload = AtlasQueryResult & {
	counts: Record<string, number>;
	scopeCounts: Record<AtlasScopeId, number>;
	scopeMeta: ReturnType<typeof getAtlasScopeDefinition>;
	state: AtlasState;
};

export async function getAtlasPagePayload(state: AtlasState): Promise<AtlasPagePayload> {
	const counts = await getTypeCounts();
	const scopeMeta = getAtlasScopeDefinition(state.scope);
	const scopeCounts = getAtlasScopeCounts(counts);
	const queryResult = await getAtlasItems(state);

	return {
		...queryResult,
		counts,
		scopeCounts,
		scopeMeta,
		state
	};
}

async function getAtlasItems(state: AtlasState): Promise<AtlasQueryResult> {
	if (usesCustomSort(state)) {
		return getMergedAtlasItems(state);
	}

	if (state.selectedType !== 'all') {
		return getSingleTypeAtlasItems(state, state.selectedType);
	}

	if (state.scope === 'spells') {
		const result = await getPaginatedItems('spells', {
			page: state.page,
			pageSize: ATLAS_PAGE_SIZE,
			filters: {
				search: state.search || undefined,
				sortBy: state.sort === 'updated' ? 'updated_at' : 'name',
				sortOrder: state.sort === 'updated' ? 'desc' : 'asc',
				spellLevel: state.spellLevel === 'all' ? undefined : Number(state.spellLevel),
				spellSchool: state.spellSchool === 'all' ? undefined : state.spellSchool
			}
		});

		return mapRepositoryResult(result.items, state.page, result.total);
	}

	if (state.scope === 'monsters') {
		const result = await getPaginatedItems('creatures', {
			page: state.page,
			pageSize: ATLAS_PAGE_SIZE,
			filters: {
				search: state.search || undefined,
				sortBy: state.sort === 'updated' ? 'updated_at' : 'name',
				sortOrder: state.sort === 'updated' ? 'desc' : 'asc',
				creatureType: state.creatureType === 'all' ? undefined : state.creatureType,
				challengeRating:
					state.challengeRating === 'all' ? undefined : Number(state.challengeRating)
			}
		});

		return mapRepositoryResult(result.items, state.page, result.total);
	}

	if (state.scope === 'classes') {
		const result = await getPaginatedItems('classes', {
			page: state.page,
			pageSize: ATLAS_PAGE_SIZE,
			filters: {
				search: state.search || undefined,
				sortBy: state.sort === 'updated' ? 'updated_at' : 'name',
				sortOrder: state.sort === 'updated' ? 'desc' : 'asc',
				includeSubclasses: false
			}
		});

		return mapRepositoryResult(result.items, state.page, result.total);
	}

	if (state.scope === 'species' || state.scope === 'feats' || state.scope === 'backgrounds') {
		const typeMap: Record<'species' | 'feats' | 'backgrounds', CompendiumType> = {
			species: 'species',
			feats: 'feats',
			backgrounds: 'backgrounds'
		};
		const type = typeMap[state.scope];
		const result = await getPaginatedItems(type, {
			page: state.page,
			pageSize: ATLAS_PAGE_SIZE,
			filters: {
				search: state.search || undefined,
				sortBy: state.sort === 'updated' ? 'updated_at' : 'name',
				sortOrder: state.sort === 'updated' ? 'desc' : 'asc'
			}
		});

		return mapRepositoryResult(result.items, state.page, result.total);
	}

	return getMergedAtlasItems(state);
}

async function getSingleTypeAtlasItems(
	state: AtlasState,
	type: CompendiumTypeName
): Promise<AtlasQueryResult> {
	if (type === 'items' || type === 'magicitems' || type === 'weapons' || type === 'armor') {
		return getMergedAtlasItems(state);
	}

	if (usesCustomSort(state)) {
		return getMergedAtlasItems(state);
	}

	if (type === 'subclasses') {
		const result = await getPaginatedItems('classes', {
			page: state.page,
			pageSize: ATLAS_PAGE_SIZE,
			filters: {
				search: state.search || undefined,
				sortBy: state.sort === 'updated' ? 'updated_at' : 'name',
				sortOrder: state.sort === 'updated' ? 'desc' : 'asc',
				onlySubclasses: true
			}
		});

		return mapRepositoryResult(result.items, state.page, result.total);
	}

	const filterContext = getAtlasFilterContext(state);
	const result = await getPaginatedItems(type as CompendiumType, {
		page: state.page,
		pageSize: ATLAS_PAGE_SIZE,
		filters: {
			search: state.search || undefined,
			sortBy: state.sort === 'updated' ? 'updated_at' : 'name',
			sortOrder: state.sort === 'updated' ? 'desc' : 'asc',
			includeSubclasses: type === 'classes' ? false : undefined,
			creatureType:
				filterContext === 'monsters' && state.creatureType !== 'all'
					? state.creatureType
					: undefined,
			challengeRating:
				filterContext === 'monsters' && state.challengeRating !== 'all'
					? Number(state.challengeRating)
					: undefined,
			spellLevel:
				filterContext === 'spells' && state.spellLevel !== 'all'
					? Number(state.spellLevel)
					: undefined,
			spellSchool:
				filterContext === 'spells' && state.spellSchool !== 'all'
					? state.spellSchool
					: undefined
		}
	});

	return mapRepositoryResult(result.items, state.page, result.total);
}

async function getMergedAtlasItems(state: AtlasState): Promise<AtlasQueryResult> {
	const db = await getDb();
	const scopeTypes = getScopeTypes(state);
	const page = state.page;
	const offset = (page - 1) * ATLAS_PAGE_SIZE;
	const whereClause = buildMergedWhereClause(state, scopeTypes);

	const total = Number(
		(
			await db
				.select({ count: sql<number>`count(*)` })
				.from(compendium)
				.where(whereClause)
		)[0]?.count ?? 0
	);

	const rows = await db
		.select()
		.from(compendium)
		.where(whereClause)
		.orderBy(...buildOrderByClauses(state))
		.limit(ATLAS_PAGE_SIZE)
		.offset(offset);

	return mapRepositoryResult(rows, page, total);
}

function mapRepositoryResult(items: DbCompendiumItem[], page: number, total: number): AtlasQueryResult {
	return {
		items: items.map(buildAtlasItem),
		total,
		page,
		pageSize: ATLAS_PAGE_SIZE,
		totalPages: Math.max(1, Math.ceil(total / ATLAS_PAGE_SIZE))
	};
}

function getScopeTypes(state: AtlasState): CompendiumType[] {
	if (state.selectedType !== 'all') {
		return [state.selectedType as CompendiumType];
	}

	if (state.scope !== 'items') {
		return getAtlasScopeDefinition(state.scope).types as CompendiumType[];
	}

	if (state.itemKind === 'gear') return ['items', 'magicitems'];
	if (state.itemKind === 'magic') return ['magicitems'];
	if (state.itemKind === 'weapon') return ['weapons'];
	if (state.itemKind === 'armor') return ['armor'];

	return ['items', 'magicitems', 'weapons', 'armor'];
}

function buildMergedWhereClause(state: AtlasState, types: CompendiumType[]): SQL<unknown> {
	let whereClause: SQL<unknown> = inArray(compendium.type, types);
	const filterContext = getAtlasFilterContext(state);

	if (state.scope === 'all') {
		whereClause = and(
			whereClause,
			or(
				sql`${compendium.type} <> 'classes'`,
				sql`json_extract(${compendium.data}, '$.subclass_of') IS NULL`
			)
		)!;
	}

	if (state.search) {
		const term = `%${state.search}%`;
		whereClause = and(
			whereClause,
			or(like(compendium.name, term), like(compendium.description, term))
		)!;
	}

	if (filterContext === 'items' && state.itemRarity !== 'all') {
		whereClause = and(
			whereClause,
			sql`LOWER(COALESCE(json_extract(${compendium.data}, '$.rarity'), '')) = LOWER(${state.itemRarity})`
		)!;
	}

	if (filterContext === 'items' && state.attunement !== 'all') {
		const expected = state.attunement === 'required' ? 1 : 0;
		whereClause = and(
			whereClause,
			sql`COALESCE(json_extract(${compendium.data}, '$.requires_attunement'), 0) = ${expected}`
		)!;
	}

	return whereClause;
}

function buildOrderByClauses(state: AtlasState) {
	const customSortClauses = getCustomSortClauses(state);
	if (customSortClauses) {
		return customSortClauses;
	}

	if (state.sort === 'updated') {
		return [desc(compendium.updatedAt), compendium.name];
	}

	if (state.search && state.sort === 'relevance') {
		const exact = state.search.toLowerCase();
		const startsWith = `${exact}%`;
		const contains = `%${exact}%`;

		return [
			sql<number>`CASE
				WHEN LOWER(${compendium.name}) = ${exact} THEN 0
				WHEN LOWER(${compendium.name}) LIKE ${startsWith} THEN 1
				WHEN LOWER(${compendium.name}) LIKE ${contains} THEN 2
				WHEN LOWER(COALESCE(${compendium.description}, '')) LIKE ${contains} THEN 3
				ELSE 4
			END`,
			compendium.name
		];
	}

	return [compendium.name];
}

function usesCustomSort(state: AtlasState): boolean {
	return getCustomSortClauses(state) !== null;
}

function getCustomSortClauses(state: AtlasState) {
	switch (state.sort) {
		case 'spell-level-asc':
			return [
				sql<number>`COALESCE(CAST(json_extract(${compendium.data}, '$.level') AS INTEGER), 999) ASC`,
				compendium.name
			];
		case 'spell-level-desc':
			return [
				sql<number>`COALESCE(CAST(json_extract(${compendium.data}, '$.level') AS INTEGER), -1) DESC`,
				compendium.name
			];
		case 'creature-cr-asc':
			return [
				sql<number>`COALESCE(CAST(json_extract(${compendium.data}, '$.challenge_rating_decimal') AS REAL), 999) ASC`,
				compendium.name
			];
		case 'creature-cr-desc':
			return [
				sql<number>`COALESCE(CAST(json_extract(${compendium.data}, '$.challenge_rating_decimal') AS REAL), -1) DESC`,
				compendium.name
			];
		case 'creature-size-asc':
			return [creatureSizeOrderClause('ASC'), compendium.name];
		case 'creature-size-desc':
			return [creatureSizeOrderClause('DESC'), compendium.name];
		case 'item-rarity-asc':
			return [itemRarityOrderClause('ASC'), compendium.name];
		case 'item-rarity-desc':
			return [itemRarityOrderClause('DESC'), compendium.name];
		case 'item-cost-asc':
			return [
				sql<number>`COALESCE(CAST(json_extract(${compendium.data}, '$.cost') AS REAL), 999999) ASC`,
				compendium.name
			];
		case 'item-cost-desc':
			return [
				sql<number>`COALESCE(CAST(json_extract(${compendium.data}, '$.cost') AS REAL), -1) DESC`,
				compendium.name
			];
		case 'class-hit-die-asc':
			return [
				sql<number>`COALESCE(CAST(json_extract(${compendium.data}, '$.hit_dice') AS INTEGER), 999) ASC`,
				compendium.name
			];
		case 'class-hit-die-desc':
			return [
				sql<number>`COALESCE(CAST(json_extract(${compendium.data}, '$.hit_dice') AS INTEGER), -1) DESC`,
				compendium.name
			];
		default:
			return null;
	}
}

function creatureSizeOrderClause(direction: 'ASC' | 'DESC') {
	const clause = sql<number>`CASE LOWER(COALESCE(
		json_extract(${compendium.data}, '$.size.key'),
		json_extract(${compendium.data}, '$.size.name'),
		json_extract(${compendium.data}, '$.size')
	))
		WHEN 'tiny' THEN 0
		WHEN 'small' THEN 1
		WHEN 'medium' THEN 2
		WHEN 'large' THEN 3
		WHEN 'huge' THEN 4
		WHEN 'gargantuan' THEN 5
		ELSE 999
	END`;

	return direction === 'ASC' ? sql`${clause} ASC` : sql`${clause} DESC`;
}

function itemRarityOrderClause(direction: 'ASC' | 'DESC') {
	const clause = sql<number>`CASE LOWER(COALESCE(json_extract(${compendium.data}, '$.rarity'), ''))
		WHEN 'common' THEN 0
		WHEN 'uncommon' THEN 1
		WHEN 'rare' THEN 2
		WHEN 'very rare' THEN 3
		WHEN 'legendary' THEN 4
		WHEN 'artifact' THEN 5
		ELSE 999
	END`;

	return direction === 'ASC' ? sql`${clause} ASC` : sql`${clause} DESC`;
}

function buildAtlasItem(item: DbCompendiumItem): AtlasItem {
	const normalized = buildCompendiumListItem(item);
	const data = (item.data ?? {}) as Record<string, unknown>;

	return {
		key: item.key,
		type: item.type as CompendiumTypeName,
		name: item.name,
		href: `/compendium/${item.type}/${item.key}`,
		description: normalized.presentation.description ?? undefined,
		documentLabel: normalized.presentation.documentLabel ?? undefined,
		typeLabel: getTypeLabel(item.type as CompendiumTypeName),
		badges: buildAtlasBadges(item, data)
	};
}

function buildAtlasBadges(item: DbCompendiumItem, data: Record<string, unknown>): AtlasBadge[] {
	if (item.type === 'spells') {
		const badges: AtlasBadge[] = [];
		const level = readNumber(data.level);
		const school = readLabel(data.school);
		const classes = Array.isArray(data.classes)
			? data.classes
					.map((entry) => readLabel(entry))
					.filter((value): value is string => Boolean(value))
			: [];

		if (level !== undefined) {
			badges.push({ label: level === 0 ? 'Cantrip' : `${ordinal(level)} Level`, tone: 'amber' });
		}
		if (school) badges.push({ label: school, tone: 'violet' });
		if (classes[0]) badges.push({ label: classes[0], tone: 'teal' });
		return badges.slice(0, 3);
	}

	if (item.type === 'creatures') {
		const challengeRating = readText(data.challenge_rating_text);
		const creatureType = readLabel(data.type);
		const size = readLabel(data.size);
		return compactBadges([
			challengeRating ? { label: `CR ${challengeRating}`, tone: 'ember' } : null,
			creatureType ? { label: creatureType, tone: 'amber' } : null,
			size ? { label: size, tone: 'slate' } : null
		]);
	}

	if (item.type === 'items' || item.type === 'magicitems') {
		const rarity = readText(data.rarity);
		const category = readLabel(data.category);
		const attunement = data.requires_attunement === true ? 'Attunement' : null;
		const kind = item.type === 'magicitems' || data.is_magic_item === true ? 'Magic Item' : 'Item';
		return compactBadges([
			{ label: rarity ?? kind, tone: item.type === 'magicitems' ? 'violet' : 'amber' },
			category ? { label: category, tone: 'slate' } : null,
			attunement ? { label: attunement, tone: 'teal' } : null
		]);
	}

	if (item.type === 'weapons') {
		const category = readText(data.category);
		const damage = [readText(data.damage_dice), readText(data.damage_type)].filter(Boolean).join(' ');
		return compactBadges([
			{ label: category ? capitalize(category) : 'Weapon', tone: 'ember' },
			damage ? { label: damage, tone: 'slate' } : null
		]);
	}

	if (item.type === 'armor') {
		const category = readText(data.category);
		const armorClass = readText(data.ac_display);
		return compactBadges([
			{ label: category ? capitalize(category) : 'Armor', tone: 'teal' },
			armorClass ? { label: `AC ${armorClass}`, tone: 'slate' } : null
		]);
	}

	if (item.type === 'classes') {
		const hitDie = readNumber(data.hit_dice);
		const casterType = readText(data.caster_type);
		const primaryAbilities = Array.isArray(data.primary_abilities)
			? data.primary_abilities
					.map((entry) => readText(entry))
					.filter((value): value is string => Boolean(value))
			: [];
		return compactBadges([
			hitDie !== undefined ? { label: `d${hitDie} Hit Die`, tone: 'teal' } : null,
			casterType ? { label: capitalize(casterType.replaceAll('_', ' ')), tone: 'amber' } : null,
			primaryAbilities[0] ? { label: capitalize(primaryAbilities[0]), tone: 'slate' } : null
		]);
	}

	if (item.type === 'species') {
		const traits = Array.isArray(data.traits)
			? data.traits
					.map((entry) => (entry && typeof entry === 'object' ? readText(entry.name) : undefined))
					.filter((value): value is string => Boolean(value))
			: [];
		return compactBadges([
			data.is_subspecies === true ? { label: 'Subspecies', tone: 'teal' } : { label: 'Species', tone: 'amber' },
			traits[0] ? { label: traits[0], tone: 'slate' } : null,
			traits[1] ? { label: traits[1], tone: 'slate' } : null
		]);
	}

	if (item.type === 'feats') {
		const featType = readText(data.type);
		const prerequisite = readText(data.prerequisite);
		const benefits = Array.isArray(data.benefits) ? data.benefits.length : 0;
		return compactBadges([
			featType ? { label: featType, tone: 'amber' } : { label: 'Feat', tone: 'amber' },
			prerequisite ? { label: 'Prerequisite', tone: 'violet' } : null,
			benefits > 0 ? { label: `${benefits} Benefit${benefits === 1 ? '' : 's'}`, tone: 'slate' } : null
		]);
	}

	if (item.type === 'backgrounds') {
		const benefits = Array.isArray(data.benefits)
			? data.benefits
					.map((entry) => (entry && typeof entry === 'object' ? readText(entry.name) : undefined))
					.filter((value): value is string => Boolean(value))
			: [];
		return compactBadges([
			{ label: 'Background', tone: 'amber' },
			benefits[0] ? { label: benefits[0], tone: 'slate' } : null,
			benefits[1] ? { label: benefits[1], tone: 'slate' } : null
		]);
	}

	return [{ label: COMPENDIUM_TYPE_CONFIGS[item.type as CompendiumTypeName]?.label ?? item.type, tone: 'slate' }];
}

function readLabel(value: unknown): string | undefined {
	if (typeof value === 'string' && value.trim()) return value.trim();
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		const record = value as Record<string, unknown>;
		if (typeof record.name === 'string' && record.name.trim()) return record.name.trim();
	}
	return undefined;
}

function readText(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readNumber(value: unknown): number | undefined {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
		return Number(value);
	}
	return undefined;
}

function compactBadges(badges: Array<AtlasBadge | null>): AtlasBadge[] {
	return badges.filter((value): value is AtlasBadge => value !== null);
}

function ordinal(value: number): string {
	if (value === 1) return '1st';
	if (value === 2) return '2nd';
	if (value === 3) return '3rd';
	return `${value}th`;
}

function capitalize(value: string): string {
	return value
		.split(' ')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}
