import {
	COMPENDIUM_TYPE_CONFIGS,
	SEARCHABLE_TYPES,
	type CompendiumTypeName
} from '$lib/core/constants/compendium';

export type AtlasScopeId =
	| 'all'
	| 'spells'
	| 'monsters'
	| 'items'
	| 'classes'
	| 'species'
	| 'feats'
	| 'backgrounds';

export type AtlasSortId =
	| 'relevance'
	| 'name'
	| 'updated'
	| 'spell-level-asc'
	| 'spell-level-desc'
	| 'creature-cr-asc'
	| 'creature-cr-desc'
	| 'creature-size-asc'
	| 'creature-size-desc'
	| 'item-rarity-asc'
	| 'item-rarity-desc'
	| 'item-cost-asc'
	| 'item-cost-desc'
	| 'class-hit-die-asc'
	| 'class-hit-die-desc';
export type AtlasSortOption = {
	label: string;
	value: AtlasSortId;
};

export type AtlasItemKind = 'all' | 'gear' | 'magic' | 'weapon' | 'armor';

export type AtlasAttunementFilter = 'all' | 'required' | 'not-required';

export type AtlasState = {
	scope: AtlasScopeId;
	selectedType: 'all' | CompendiumTypeName;
	search: string;
	sort: AtlasSortId;
	page: number;
	spellLevel: string;
	spellSchool: string;
	creatureType: string;
	challengeRating: string;
	itemKind: AtlasItemKind;
	itemRarity: string;
	attunement: AtlasAttunementFilter;
};

export type AtlasBadgeTone = 'amber' | 'violet' | 'teal' | 'ember' | 'slate';

export type AtlasBadge = {
	label: string;
	tone?: AtlasBadgeTone;
};

export type AtlasItem = {
	key: string;
	type: CompendiumTypeName;
	name: string;
	href: string;
	description?: string;
	documentLabel?: string;
	typeLabel: string;
	badges: AtlasBadge[];
};

export type AtlasScopeDefinition = {
	id: AtlasScopeId;
	label: string;
	description: string;
	types: CompendiumTypeName[];
};

export const ATLAS_PAGE_SIZE = 24;

export const ATLAS_SCOPE_DEFINITIONS: AtlasScopeDefinition[] = [
	{
		id: 'all',
		label: 'All',
		description: 'Survey the whole archive from one search surface.',
		types: ['spells', 'creatures', 'items', 'magicitems', 'weapons', 'armor', 'classes', 'species', 'feats', 'backgrounds']
	},
	{
		id: 'spells',
		label: 'Spells',
		description: 'Arcana, rituals, cantrips, and high-circle workings.',
		types: ['spells']
	},
	{
		id: 'monsters',
		label: 'Monsters',
		description: 'Creature dossiers, encounter threats, and legendary horrors.',
		types: ['creatures']
	},
	{
		id: 'items',
		label: 'Items',
		description: 'Mundane gear, weapons, armor, and relics.',
		types: ['items', 'magicitems', 'weapons', 'armor']
	},
	{
		id: 'classes',
		label: 'Classes',
		description: 'Core class primers without subclass overflow.',
		types: ['classes']
	},
	{
		id: 'species',
		label: 'Races',
		description: 'Ancestries, species records, and people of the world.',
		types: ['species']
	},
	{
		id: 'feats',
		label: 'Feats',
		description: 'Training milestones, talents, and combat edges.',
		types: ['feats']
	},
	{
		id: 'backgrounds',
		label: 'Backgrounds',
		description: 'Starting histories, proficiencies, and origin kits.',
		types: ['backgrounds']
	}
];

export const ATLAS_SCOPE_LOOKUP = Object.fromEntries(
	ATLAS_SCOPE_DEFINITIONS.map((scope) => [scope.id, scope])
) as Record<AtlasScopeId, AtlasScopeDefinition>;

export const BASE_ATLAS_SORT_OPTIONS: AtlasSortOption[] = [
	{ label: 'Best Match', value: 'relevance' },
	{ label: 'A to Z', value: 'name' },
	{ label: 'Recently Updated', value: 'updated' }
];

const SPELL_SORT_OPTIONS: AtlasSortOption[] = [
	{ label: 'Level: Low to High', value: 'spell-level-asc' },
	{ label: 'Level: High to Low', value: 'spell-level-desc' }
];

const CREATURE_SORT_OPTIONS: AtlasSortOption[] = [
	{ label: 'CR: Low to High', value: 'creature-cr-asc' },
	{ label: 'CR: High to Low', value: 'creature-cr-desc' },
	{ label: 'Size: Small to Large', value: 'creature-size-asc' },
	{ label: 'Size: Large to Small', value: 'creature-size-desc' }
];

const ITEM_SORT_OPTIONS: AtlasSortOption[] = [
	{ label: 'Rarity: Common to Legendary', value: 'item-rarity-asc' },
	{ label: 'Rarity: Legendary to Common', value: 'item-rarity-desc' },
	{ label: 'Cost: Low to High', value: 'item-cost-asc' },
	{ label: 'Cost: High to Low', value: 'item-cost-desc' }
];

const CLASS_SORT_OPTIONS: AtlasSortOption[] = [
	{ label: 'Hit Die: Low to High', value: 'class-hit-die-asc' },
	{ label: 'Hit Die: High to Low', value: 'class-hit-die-desc' }
];

export const SPELL_LEVEL_OPTIONS = [
	{ label: 'Any Level', value: 'all' },
	{ label: 'Cantrip', value: '0' },
	{ label: '1st Level', value: '1' },
	{ label: '2nd Level', value: '2' },
	{ label: '3rd Level', value: '3' },
	{ label: '4th Level', value: '4' },
	{ label: '5th Level', value: '5' },
	{ label: '6th Level', value: '6' },
	{ label: '7th Level', value: '7' },
	{ label: '8th Level', value: '8' },
	{ label: '9th Level', value: '9' }
] as const;

export const SPELL_SCHOOL_OPTIONS = [
	{ label: 'Any School', value: 'all' },
	{ label: 'Abjuration', value: 'abjuration' },
	{ label: 'Conjuration', value: 'conjuration' },
	{ label: 'Divination', value: 'divination' },
	{ label: 'Enchantment', value: 'enchantment' },
	{ label: 'Evocation', value: 'evocation' },
	{ label: 'Illusion', value: 'illusion' },
	{ label: 'Necromancy', value: 'necromancy' },
	{ label: 'Transmutation', value: 'transmutation' }
] as const;

export const CREATURE_TYPE_OPTIONS = [
	{ label: 'Any Type', value: 'all' },
	{ label: 'Aberration', value: 'aberration' },
	{ label: 'Beast', value: 'beast' },
	{ label: 'Celestial', value: 'celestial' },
	{ label: 'Construct', value: 'construct' },
	{ label: 'Dragon', value: 'dragon' },
	{ label: 'Elemental', value: 'elemental' },
	{ label: 'Fey', value: 'fey' },
	{ label: 'Fiend', value: 'fiend' },
	{ label: 'Giant', value: 'giant' },
	{ label: 'Humanoid', value: 'humanoid' },
	{ label: 'Monstrosity', value: 'monstrosity' },
	{ label: 'Ooze', value: 'ooze' },
	{ label: 'Plant', value: 'plant' },
	{ label: 'Undead', value: 'undead' }
] as const;

export const CHALLENGE_RATING_OPTIONS = [
	{ label: 'Any CR', value: 'all' },
	{ label: '0', value: '0' },
	{ label: '1/8', value: '0.125' },
	{ label: '1/4', value: '0.25' },
	{ label: '1/2', value: '0.5' },
	{ label: '1', value: '1' },
	{ label: '2', value: '2' },
	{ label: '3', value: '3' },
	{ label: '4', value: '4' },
	{ label: '5', value: '5' },
	{ label: '6', value: '6' },
	{ label: '7', value: '7' },
	{ label: '8', value: '8' },
	{ label: '9', value: '9' },
	{ label: '10+', value: '10' }
] as const;

export const ITEM_KIND_OPTIONS = [
	{ label: 'Any Item', value: 'all' },
	{ label: 'Gear', value: 'gear' },
	{ label: 'Magic', value: 'magic' },
	{ label: 'Weapons', value: 'weapon' },
	{ label: 'Armor', value: 'armor' }
] as const;

export const ITEM_RARITY_OPTIONS = [
	{ label: 'Any Rarity', value: 'all' },
	{ label: 'Common', value: 'common' },
	{ label: 'Uncommon', value: 'uncommon' },
	{ label: 'Rare', value: 'rare' },
	{ label: 'Very Rare', value: 'very rare' },
	{ label: 'Legendary', value: 'legendary' },
	{ label: 'Artifact', value: 'artifact' }
] as const;

export const ATTUNEMENT_OPTIONS = [
	{ label: 'Any Attunement', value: 'all' },
	{ label: 'Requires Attunement', value: 'required' },
	{ label: 'No Attunement', value: 'not-required' }
] as const;

export const DEFAULT_ATLAS_STATE: AtlasState = {
	scope: 'all',
	selectedType: 'all',
	search: '',
	sort: 'relevance',
	page: 1,
	spellLevel: 'all',
	spellSchool: 'all',
	creatureType: 'all',
	challengeRating: 'all',
	itemKind: 'all',
	itemRarity: 'all',
	attunement: 'all'
};

export function parseAtlasState(params: URLSearchParams): AtlasState {
	const scope = params.get('scope');
	const sort = params.get('sort');
	const pageValue = Number(params.get('page') ?? '1');
	const selectedType = params.get('type');
	const itemKind = params.get('itemKind');
	const attunement = params.get('attunement');

	const state: AtlasState = {
		scope: isAtlasScopeId(scope) ? scope : DEFAULT_ATLAS_STATE.scope,
		selectedType: isCompendiumTypeName(selectedType) ? selectedType : 'all',
		search: params.get('search')?.trim() ?? DEFAULT_ATLAS_STATE.search,
		sort: isAtlasSortId(sort) ? sort : DEFAULT_ATLAS_STATE.sort,
		page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : DEFAULT_ATLAS_STATE.page,
		spellLevel: params.get('spellLevel') ?? DEFAULT_ATLAS_STATE.spellLevel,
		spellSchool: params.get('spellSchool') ?? DEFAULT_ATLAS_STATE.spellSchool,
		creatureType: params.get('creatureType') ?? DEFAULT_ATLAS_STATE.creatureType,
		challengeRating: params.get('challengeRating') ?? DEFAULT_ATLAS_STATE.challengeRating,
		itemKind: isAtlasItemKind(itemKind) ? itemKind : DEFAULT_ATLAS_STATE.itemKind,
		itemRarity: params.get('itemRarity') ?? DEFAULT_ATLAS_STATE.itemRarity,
		attunement: isAtlasAttunementFilter(attunement)
			? attunement
			: DEFAULT_ATLAS_STATE.attunement
	};

	return normalizeAtlasState(state);
}

export function createAtlasHref(state: AtlasState): string {
	const params = new URLSearchParams();

	if (state.scope !== DEFAULT_ATLAS_STATE.scope) params.set('scope', state.scope);
	if (state.selectedType !== 'all') params.set('type', state.selectedType);
	if (state.search) params.set('search', state.search);
	if (state.sort !== DEFAULT_ATLAS_STATE.sort) params.set('sort', state.sort);
	if (state.page > 1) params.set('page', String(state.page));
	if (state.scope === 'spells' && state.spellLevel !== 'all') {
		params.set('spellLevel', state.spellLevel);
	}
	if (state.scope === 'spells' && state.spellSchool !== 'all') {
		params.set('spellSchool', state.spellSchool);
	}
	if (state.scope === 'monsters' && state.creatureType !== 'all') {
		params.set('creatureType', state.creatureType);
	}
	if (state.scope === 'monsters' && state.challengeRating !== 'all') {
		params.set('challengeRating', state.challengeRating);
	}
	if (state.scope === 'items' && state.itemKind !== 'all') {
		params.set('itemKind', state.itemKind);
	}
	if (state.scope === 'items' && state.itemRarity !== 'all') {
		params.set('itemRarity', state.itemRarity);
	}
	if (state.scope === 'items' && state.attunement !== 'all') {
		params.set('attunement', state.attunement);
	}

	const query = params.toString();
	return query ? `/beta/compendium?${query}` : '/beta/compendium';
}

export function getAtlasScopeCounts(
	counts: Record<string, number>
): Record<AtlasScopeId, number> {
	return ATLAS_SCOPE_DEFINITIONS.reduce(
		(accumulator, scope) => {
			accumulator[scope.id] = scope.types.reduce((total, type) => {
				if (scope.id === 'classes' && type === 'classes') {
					return total + Number(counts.classes ?? 0);
				}
				return total + Number(counts[type] ?? 0);
			}, 0);
			return accumulator;
		},
		{} as Record<AtlasScopeId, number>
	);
}

export function getAtlasScopeDefinition(scope: AtlasScopeId): AtlasScopeDefinition {
	return ATLAS_SCOPE_LOOKUP[scope];
}

export function getTypeLabel(type: CompendiumTypeName): string {
	return COMPENDIUM_TYPE_CONFIGS[type]?.label ?? type;
}

export function getBadgeClasses(tone: AtlasBadgeTone = 'slate'): string {
	return {
		amber:
			'border-[color-mix(in_srgb,var(--color-gem-topaz)_36%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-gem-topaz)_12%,transparent)] text-[color-mix(in_srgb,var(--color-text-primary)_92%,var(--color-gem-topaz))]',
		violet:
			'border-[color-mix(in_srgb,var(--color-gem-amethyst)_36%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-gem-amethyst)_12%,transparent)] text-[color-mix(in_srgb,var(--color-text-primary)_92%,var(--color-gem-amethyst))]',
		teal:
			'border-[color-mix(in_srgb,var(--color-gem-sapphire)_32%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-gem-sapphire)_10%,transparent)] text-[color-mix(in_srgb,var(--color-text-primary)_92%,var(--color-gem-sapphire))]',
		ember:
			'border-[color-mix(in_srgb,var(--color-gem-ruby)_34%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-gem-ruby)_11%,transparent)] text-[color-mix(in_srgb,var(--color-text-primary)_92%,var(--color-gem-ruby))]',
		slate:
			'border-white/10 bg-white/5 text-[color-mix(in_srgb,var(--color-text-primary)_90%,var(--color-text-secondary))]'
	}[tone];
}

export function getTypeAccentClasses(type: CompendiumTypeName): string {
	const typeAccentClasses: Partial<Record<CompendiumTypeName, string>> = {
		spells: 'text-[color-mix(in_srgb,var(--color-text-primary)_88%,var(--color-gem-amethyst))]',
		creatures: 'text-[color-mix(in_srgb,var(--color-text-primary)_88%,var(--color-gem-ruby))]',
		items: 'text-[color-mix(in_srgb,var(--color-text-primary)_88%,var(--color-gem-topaz))]',
		magicitems: 'text-[color-mix(in_srgb,var(--color-text-primary)_88%,var(--color-gem-sapphire))]',
		weapons: 'text-[color-mix(in_srgb,var(--color-text-primary)_84%,var(--color-gem-ruby))]',
		armor: 'text-[color-mix(in_srgb,var(--color-text-primary)_84%,var(--color-gem-sapphire))]',
		classes: 'text-[color-mix(in_srgb,var(--color-text-primary)_88%,var(--color-gem-emerald))]',
		species: 'text-[color-mix(in_srgb,var(--color-text-primary)_88%,var(--color-gem-sapphire))]',
		feats: 'text-[color-mix(in_srgb,var(--color-text-primary)_88%,var(--color-gem-topaz))]',
		backgrounds: 'text-[color-mix(in_srgb,var(--color-text-primary)_88%,var(--color-gem-ruby))]'
	};

	return typeAccentClasses[type] ?? 'text-[var(--color-text-secondary)]';
}

export function getActiveFilterLabels(state: AtlasState): string[] {
	const labels: string[] = [];

	if (state.search) labels.push(`Search: ${state.search}`);
	const filterContext = getAtlasFilterContext(state);
	if (filterContext === 'spells' && state.spellLevel !== 'all') labels.push(`Level ${state.spellLevel}`);
	if (filterContext === 'spells' && state.spellSchool !== 'all') labels.push(capitalize(state.spellSchool));
	if (filterContext === 'monsters' && state.creatureType !== 'all') {
		labels.push(capitalize(state.creatureType));
	}
	if (filterContext === 'monsters' && state.challengeRating !== 'all') {
		labels.push(`CR ${state.challengeRating}`);
	}
	if (filterContext === 'items' && state.itemKind !== 'all') labels.push(capitalize(state.itemKind));
	if (filterContext === 'items' && state.itemRarity !== 'all') {
		labels.push(capitalize(state.itemRarity));
	}
	if (filterContext === 'items' && state.attunement !== 'all') {
		labels.push(state.attunement === 'required' ? 'Attunement' : 'No Attunement');
	}

	return labels;
}

export function getAtlasSortOptions(state: AtlasState): AtlasSortOption[] {
	const filterContext = getAtlasFilterContext(state);
	const options = [...BASE_ATLAS_SORT_OPTIONS];

	if (filterContext === 'spells') {
		options.push(...SPELL_SORT_OPTIONS);
	}

	if (filterContext === 'monsters') {
		options.push(...CREATURE_SORT_OPTIONS);
	}

	if (filterContext === 'items') {
		options.push(...ITEM_SORT_OPTIONS);
	}

	if (state.selectedType === 'classes') {
		options.push(...CLASS_SORT_OPTIONS);
	}

	return options;
}

export function normalizeAtlasState(state: AtlasState): AtlasState {
	const allowedSorts = new Set(getAtlasSortOptions(state).map((option) => option.value));
	if (allowedSorts.has(state.sort)) {
		return state;
	}

	return {
		...state,
		sort: DEFAULT_ATLAS_STATE.sort
	};
}

function isAtlasScopeId(value: string | null): value is AtlasScopeId {
	return Boolean(value && value in ATLAS_SCOPE_LOOKUP);
}

function isCompendiumTypeName(value: string | null): value is CompendiumTypeName {
	return Boolean(value && SEARCHABLE_TYPES.includes(value as CompendiumTypeName));
}

function isAtlasSortId(value: string | null): value is AtlasSortId {
	return (
		value === 'relevance' ||
		value === 'name' ||
		value === 'updated' ||
		value === 'spell-level-asc' ||
		value === 'spell-level-desc' ||
		value === 'creature-cr-asc' ||
		value === 'creature-cr-desc' ||
		value === 'creature-size-asc' ||
		value === 'creature-size-desc' ||
		value === 'item-rarity-asc' ||
		value === 'item-rarity-desc' ||
		value === 'item-cost-asc' ||
		value === 'item-cost-desc' ||
		value === 'class-hit-die-asc' ||
		value === 'class-hit-die-desc'
	);
}

function isAtlasItemKind(value: string | null): value is AtlasItemKind {
	return value === 'all' || value === 'gear' || value === 'magic' || value === 'weapon' || value === 'armor';
}

function isAtlasAttunementFilter(value: string | null): value is AtlasAttunementFilter {
	return value === 'all' || value === 'required' || value === 'not-required';
}

function capitalize(value: string): string {
	return value
		.split(' ')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

export function getAtlasFilterContext(state: AtlasState): 'spells' | 'monsters' | 'items' | null {
	if (state.selectedType === 'spells') return 'spells';
	if (state.selectedType === 'creatures') return 'monsters';
	if (
		state.selectedType === 'items' ||
		state.selectedType === 'magicitems' ||
		state.selectedType === 'weapons' ||
		state.selectedType === 'armor'
	) {
		return 'items';
	}
	if (state.scope === 'spells') return 'spells';
	if (state.scope === 'monsters') return 'monsters';
	if (state.scope === 'items') return 'items';
	return null;
}
