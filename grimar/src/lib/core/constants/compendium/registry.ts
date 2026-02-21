/**
 * Compendium Type Registry - Single Source of Truth
 *
 * This file defines all compendium types in ONE place.
 * All other mappings, configs, and UI elements are derived from this registry.
 *
 * To add a new type:
 * 1. Add entry to COMPENDIUM_TYPE_REGISTRY
 * 2. If custom config needed, create config file and reference in configSource
 * 3. If custom entry component exists, it's auto-loaded by convention
 */

import type { ComponentType } from 'svelte';
import type { CompendiumItem } from '$lib/core/types/compendium';
import {
	Flame,
	Skull,
	Shield,
	Users,
	Scroll,
	Medal,
	Trophy,
	Globe,
	Scale,
	Activity,
	Sparkles,
	Swords,
	Package,
	BookOpen,
	Star,
	Zap
} from 'lucide-svelte';

export type CategoryId = 'primary' | 'character' | 'equipment' | 'abilities' | 'rules' | 'reference';

export interface FilterOption {
	value: string;
	label: string;
	color?: { base: string };
}

export interface FilterConfig {
	urlParam: string;
	key: string;
	title: string;
	openByDefault?: boolean;
	values: FilterOption[];
}

export interface SortingOption {
	value: string;
	label: string;
}

export interface SortingConfig {
	options: SortingOption[];
	default: { value: string; direction: 'asc' | 'desc' };
}

export interface TypeRegistryEntry {
	dbType: string;
	displayName: string;
	description: string;
	icon: ComponentType;
	color: string;
	category: CategoryId;
	showOnDashboard?: boolean;
	showInSidebar?: boolean;
	aliases?: string[];
	urlPath?: string;
	entryComponent?: string;
	filters?: FilterConfig[];
	sorting?: SortingConfig;
	ui?: {
		displayName: string;
		icon: ComponentType;
		databaseEmptyState: { title: string; description: string; ctaText?: string };
		emptyState: { title: string; description: string };
	};
	display?: {
		subtitle: (item: CompendiumItem) => string;
		cardSchool?: (item: CompendiumItem) => string | undefined;
		tags: (item: CompendiumItem) => string[];
		detailAccent: (item: CompendiumItem) => string;
		metaDescription?: (item: CompendiumItem) => string;
	};
	routes?: {
		storageKeyFilters: string;
		storageKeyListUrl?: string;
	};
}

export const COMPENDIUM_TYPE_REGISTRY: Record<string, TypeRegistryEntry> = {
	spells: {
		dbType: 'spells',
		displayName: 'Spells',
		description: 'Incantations and rituals.',
		icon: Flame,
		color: 'rose',
		category: 'primary',
		showOnDashboard: true,
		showInSidebar: true
	},
	creatures: {
		dbType: 'creatures',
		displayName: 'Creatures',
		description: 'Beasts and planar entities.',
		icon: Skull,
		color: 'emerald',
		category: 'primary',
		showOnDashboard: true,
		showInSidebar: true,
		aliases: ['monsters']
	},
	classes: {
		dbType: 'classes',
		displayName: 'Classes',
		description: 'Paths of power.',
		icon: Shield,
		color: 'amber',
		category: 'character',
		showOnDashboard: true,
		showInSidebar: true,
		entryComponent: 'ClassEntryContent'
	},
	class_features: {
		dbType: 'classfeatures',
		displayName: 'Class Features',
		description: 'Class abilities and features.',
		icon: Sparkles,
		color: 'blue',
		category: 'character',
		showOnDashboard: true,
		showInSidebar: false
	},
	backgrounds: {
		dbType: 'backgrounds',
		displayName: 'Backgrounds',
		description: 'History and lore.',
		icon: Scroll,
		color: 'indigo',
		category: 'character',
		showOnDashboard: true,
		showInSidebar: true,
		entryComponent: 'BackgroundEntryContent'
	},
	feats: {
		dbType: 'feats',
		displayName: 'Feats',
		description: 'Specialized talents.',
		icon: Medal,
		color: 'yellow',
		category: 'character',
		showOnDashboard: true,
		showInSidebar: true,
		entryComponent: 'FeatEntryContent'
	},
	species: {
		dbType: 'species',
		displayName: 'Races',
		description: 'Species and lineages.',
		icon: Users,
		color: 'lime',
		category: 'character',
		showOnDashboard: true,
		showInSidebar: true,
		aliases: ['races'],
		urlPath: 'races'
	},
	magic_items: {
		dbType: 'magicitems',
		displayName: 'Magic Items',
		description: 'Enchanted objects.',
		icon: Package,
		color: 'purple',
		category: 'equipment',
		showOnDashboard: true,
		showInSidebar: true,
		urlPath: 'items'
	},
	weapons: {
		dbType: 'weapons',
		displayName: 'Weapons',
		description: 'Arms for combat.',
		icon: Swords,
		color: 'slate',
		category: 'equipment',
		showOnDashboard: true,
		showInSidebar: true
	},
	armor: {
		dbType: 'armor',
		displayName: 'Armor',
		description: 'Protective gear.',
		icon: Shield,
		color: 'cyan',
		category: 'equipment',
		showOnDashboard: true,
		showInSidebar: true
	},
	skills: {
		dbType: 'skills',
		displayName: 'Skills',
		description: 'Proficiency areas.',
		icon: Trophy,
		color: 'amber',
		category: 'abilities',
		showOnDashboard: true,
		showInSidebar: true,
		entryComponent: 'LookupEntryContent'
	},
	languages: {
		dbType: 'languages',
		displayName: 'Languages',
		description: 'Known tongues.',
		icon: Globe,
		color: 'cyan',
		category: 'abilities',
		showOnDashboard: true,
		showInSidebar: true,
		entryComponent: 'LookupEntryContent'
	},
	alignments: {
		dbType: 'alignments',
		displayName: 'Alignments',
		description: 'Moral and ethical codes.',
		icon: Scale,
		color: 'indigo',
		category: 'abilities',
		showOnDashboard: true,
		showInSidebar: true,
		entryComponent: 'LookupEntryContent'
	},
	conditions: {
		dbType: 'conditions',
		displayName: 'Conditions',
		description: 'Afflictions and states.',
		icon: Activity,
		color: 'red',
		category: 'rules',
		showOnDashboard: true,
		showInSidebar: true,
		entryComponent: 'LookupEntryContent'
	},
	damage_types: {
		dbType: 'damagetypes',
		displayName: 'Damage Types',
		description: 'Forms of harm.',
		icon: Flame,
		color: 'orange',
		category: 'rules',
		showOnDashboard: true,
		showInSidebar: false
	},
	spell_schools: {
		dbType: 'spellschools',
		displayName: 'Spell Schools',
		description: 'Schools of magic.',
		icon: Sparkles,
		color: 'violet',
		category: 'rules',
		showOnDashboard: true,
		showInSidebar: false
	},
	creature_types: {
		dbType: 'creaturetypes',
		displayName: 'Creature Types',
		description: 'Monster classifications.',
		icon: Skull,
		color: 'emerald',
		category: 'rules',
		showOnDashboard: true,
		showInSidebar: false
	},
	rules: {
		dbType: 'rules',
		displayName: 'Rules',
		description: 'Game mechanics.',
		icon: Scroll,
		color: 'gray',
		category: 'rules',
		showOnDashboard: true,
		showInSidebar: false
	},
	abilities: {
		dbType: 'abilities',
		displayName: 'Ability Scores',
		description: 'Core attributes.',
		icon: Star,
		color: 'blue',
		category: 'abilities',
		showOnDashboard: false,
		showInSidebar: false
	},
	sizes: {
		dbType: 'sizes',
		displayName: 'Sizes',
		description: 'Creature size categories.',
		icon: Activity,
		color: 'cyan',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	planes: {
		dbType: 'environments',
		displayName: 'Planes',
		description: 'Planes of existence and environments.',
		icon: Globe,
		color: 'blue',
		category: 'reference',
		showOnDashboard: true,
		showInSidebar: true
	},
	itemsets: {
		dbType: 'itemsets',
		displayName: 'Item Sets',
		description: 'Item collections.',
		icon: Package,
		color: 'amber',
		category: 'equipment',
		showOnDashboard: false,
		showInSidebar: false
	},
	itemcategories: {
		dbType: 'itemcategories',
		displayName: 'Equipment Categories',
		description: 'Item classifications.',
		icon: BookOpen,
		color: 'slate',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	documents: {
		dbType: 'documents',
		displayName: 'Documents',
		description: 'Source documents.',
		icon: BookOpen,
		color: 'gray',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	licenses: {
		dbType: 'licenses',
		displayName: 'Licenses',
		description: 'Content licenses.',
		icon: Scroll,
		color: 'blue',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	publishers: {
		dbType: 'publishers',
		displayName: 'Publishers',
		description: 'Content publishers.',
		icon: BookOpen,
		color: 'indigo',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	gamesystems: {
		dbType: 'gamesystems',
		displayName: 'Game Systems',
		description: 'Game rule systems.',
		icon: BookOpen,
		color: 'purple',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	creaturesets: {
		dbType: 'creaturesets',
		displayName: 'Creature Sets',
		description: 'Creature collections.',
		icon: Skull,
		color: 'green',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	environments: {
		dbType: 'environments',
		displayName: 'Environments',
		description: 'Planar environments.',
		icon: Globe,
		color: 'teal',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	itemrarities: {
		dbType: 'itemrarities',
		displayName: 'Item Rarities',
		description: 'Rarity tiers.',
		icon: Star,
		color: 'yellow',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	rulesections: {
		dbType: 'rulesections',
		displayName: 'Rule Sections',
		description: 'Rule sections.',
		icon: Scroll,
		color: 'gray',
		category: 'rules',
		showOnDashboard: false,
		showInSidebar: false
	},
	rulesets: {
		dbType: 'rulesets',
		displayName: 'Rule Sets',
		description: 'Rule collections.',
		icon: BookOpen,
		color: 'rose',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	images: {
		dbType: 'images',
		displayName: 'Images',
		description: 'Image assets.',
		icon: BookOpen,
		color: 'pink',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	weaponproperties: {
		dbType: 'weaponproperties',
		displayName: 'Weapon Properties',
		description: 'Weapon traits.',
		icon: Zap,
		color: 'slate',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	services: {
		dbType: 'services',
		displayName: 'Services',
		description: 'Available services.',
		icon: BookOpen,
		color: 'orange',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	classfeatureitems: {
		dbType: 'classfeatureitems',
		displayName: 'Class Feature Items',
		description: 'Feature items.',
		icon: Sparkles,
		color: 'indigo',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	creatureactions: {
		dbType: 'creatureactions',
		displayName: 'Creature Actions',
		description: 'Creature abilities.',
		icon: Zap,
		color: 'red',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	creatureactionattacks: {
		dbType: 'creatureactionattacks',
		displayName: 'Creature Attacks',
		description: 'Attack data.',
		icon: Swords,
		color: 'rose',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	creaturetraits: {
		dbType: 'creaturetraits',
		displayName: 'Creature Traits',
		description: 'Creature traits.',
		icon: Activity,
		color: 'orange',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	speciestraits: {
		dbType: 'speciestraits',
		displayName: 'Species Traits',
		description: 'Racial traits.',
		icon: Users,
		color: 'emerald',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	backgroundbenefits: {
		dbType: 'backgroundbenefits',
		displayName: 'Background Benefits',
		description: 'Background features.',
		icon: Scroll,
		color: 'cyan',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	featbenefits: {
		dbType: 'featbenefits',
		displayName: 'Feat Benefits',
		description: 'Feat features.',
		icon: Medal,
		color: 'amber',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	spellcastingoptions: {
		dbType: 'spellcastingoptions',
		displayName: 'Spellcasting Options',
		description: 'Casting options.',
		icon: Flame,
		color: 'violet',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	},
	weaponpropertyassignments: {
		dbType: 'weaponpropertyassignments',
		displayName: 'Weapon Property Assignments',
		description: 'Weapon-property links.',
		icon: Swords,
		color: 'slate',
		category: 'reference',
		showOnDashboard: false,
		showInSidebar: false
	}
} as const;

// Derived: All DB types as object with named keys (UPPER_SNAKE_CASE)
// This maintains backwards compatibility with DB_TYPES.SPELLS style access
function createDbTypes(): Record<string, string> {
	const types: Record<string, string> = {};
	for (const [registryKey, entry] of Object.entries(COMPENDIUM_TYPE_REGISTRY)) {
		const key = registryKey.toUpperCase().replace(/[^A-Z]/g, '_');
		types[key] = entry.dbType;
	}
	return types;
}
export const DB_TYPES = createDbTypes() as Record<string, DbType>;
export type DbType = string;

// Derived: PATH_TO_DB_TYPE mapping (includes aliases)
function createPathMappings() {
	const pathToDb: Record<string, DbType> = {};
	const dbToPath: Record<string, string> = {};

	for (const [registryKey, entry] of Object.entries(COMPENDIUM_TYPE_REGISTRY)) {
		const urlPath = entry.urlPath || registryKey;
		pathToDb[urlPath] = entry.dbType as DbType;
		pathToDb[registryKey] = entry.dbType as DbType;
		dbToPath[entry.dbType] = urlPath;

		if (entry.aliases) {
			for (const alias of entry.aliases) {
				pathToDb[alias] = entry.dbType as DbType;
			}
		}
	}

	return { pathToDb, dbToPath };
}

export const PATH_TO_DB_TYPE: Record<string, DbType> = createPathMappings().pathToDb;
export const DB_TYPE_TO_PATH: Record<string, string> = createPathMappings().dbToPath;

// Derived: Dashboard cards (only types with showOnDashboard)
export interface DashboardCard {
	title: string;
	description: string;
	href: string;
	icon: ComponentType;
	gradient: string;
	accent: string;
	categoryId: CategoryId;
	dbType: string;
}

export function getDashboardCards(): DashboardCard[] {
	const cards: DashboardCard[] = [];

	for (const [dbType, entry] of Object.entries(COMPENDIUM_TYPE_REGISTRY)) {
		if (!entry.showOnDashboard) continue;

		const urlPath = DB_TYPE_TO_PATH[dbType] || dbType;
		cards.push({
			title: entry.displayName,
			description: entry.description,
			href: `/compendium/${urlPath}`,
			icon: entry.icon,
			gradient: `from-${entry.color}-500/20 to-${entry.color}-600/20`,
			accent: `text-${entry.color}-400`,
			categoryId: entry.category,
			dbType
		});
	}

	return cards;
}

// Derived: Sidebar items (types with showInSidebar)
export function getSidebarItems(): Array<{ href: string; label: string; icon: ComponentType }> {
	const items: Array<{ href: string; label: string; icon: ComponentType }> = [];

	for (const [dbType, entry] of Object.entries(COMPENDIUM_TYPE_REGISTRY)) {
		if (!entry.showInSidebar) continue;

		const urlPath = DB_TYPE_TO_PATH[dbType] || dbType;
		items.push({
			href: `/compendium/${urlPath}`,
			label: entry.displayName,
			icon: entry.icon
		});
	}

	return items;
}

// Helper: Get registry entry by DB type
export function getRegistryEntry(dbType: string): TypeRegistryEntry | undefined {
	return COMPENDIUM_TYPE_REGISTRY[dbType];
}

// Helper: Get registry entry by URL path
export function getRegistryEntryByPath(path: string): TypeRegistryEntry | undefined {
	const dbType = PATH_TO_DB_TYPE[path];
	return dbType ? COMPENDIUM_TYPE_REGISTRY[dbType] : undefined;
}

// Helper: Normalize type name to DB type
export function normalizeDbType(type: string): DbType {
	if (type in COMPENDIUM_TYPE_REGISTRY) {
		return type as DbType;
	}
	if (type in PATH_TO_DB_TYPE) {
		return PATH_TO_DB_TYPE[type];
	}
	return type as DbType;
}

// Helper: Get URL path for DB type
export function getUrlPath(dbType: string): string {
	return DB_TYPE_TO_PATH[dbType] || dbType;
}
