/**
 * Compendium Type Configuration Schema
 *
 * This module defines the complete configuration interface for compendium types.
 * Each compendium type (spells, monsters, items, feats, etc.) should export
 * a configuration object that implements CompendiumTypeConfig.
 *
 * The configuration drives:
 * - Routing and navigation
 * - Filter sets and sort options
 * - UI styling (colors, icons, labels)
 * - List item display (subtitles, tags, accent colors)
 * - Detail page rendering (snippets, meta descriptions)
 * - Session storage persistence
 */

import type { ComponentType } from 'svelte';

export type { CompendiumFilterConfig } from './filter';
export type { CompendiumCategory, CompendiumCard } from './categories';

// Normalized types for provider data transformation
export type {
	NormalizedSpell,
	NormalizedCreature,
	NormalizedFeat,
	NormalizedBackground,
	NormalizedRace,
	NormalizedClass,
	NormalizedSubclass,
	NormalizedSubrace,
	NormalizedTrait,
	NormalizedCondition,
	NormalizedSkill,
	NormalizedLanguage,
	NormalizedAbilityScore,
	NormalizedProficiency,
	NormalizedDamageType,
	NormalizedMagicSchool,
	NormalizedEquipment,
	NormalizedRule,
	NormalizedRuleSection,
	NormalizedCompendiumItem
} from './normalized';

export { slugify, createSlug } from './normalized';

// Re-export from schema for single source of truth
export { COMPENDIUM_TYPES } from '$lib/server/db/schema';
import type {
	CompendiumType as SchemaCompendiumType,
	CompendiumItem as SchemaCompendiumItem
} from '$lib/server/db/schema';
export type CompendiumType = SchemaCompendiumType;
export type CompendiumItem = SchemaCompendiumItem;

//#region Core Types

/**
 * The database type stored in compendium_items.type
 * Derived from COMPENDIUM_TYPES array for single source of truth
 */
export type CompendiumTypeName = CompendiumType;

//#endregion

//#region Filter Configuration

/**
 * Layout options for filter group UI
 */
export type FilterLayout = 'grid' | 'list' | 'chips';

/**
 * Color mapping for filter values
 * Provides two variants:
 * - base: Basic color class (e.g., 'text-rose-400')
 * - hover: Border color on hover/active (e.g., 'group-hover:border-rose-500/50')
 */
export interface FilterColorMapping {
	base: string; // e.g., 'text-rose-400'
	hover: string; // e.g., 'group-hover:border-rose-500/50'
}

/**
 * Definition of a single filter value option
 */
export interface FilterValueOption {
	label: string;
	value: string | number;
	color?: FilterColorMapping;
	icon?: ComponentType;
	order?: number;
}

/**
 * Definition of a filter group (e.g., "Spell Level", "School")
 */
export interface FilterGroupConfig {
	title: string;
	key: string;
	urlParam: string;
	values: FilterValueOption[];
	defaultColor: FilterColorMapping;
	layout: FilterLayout;
	openByDefault?: boolean;
	showMoreLimit?: number;
}

//#endregion

//#region Sort Configuration

export interface SortOption {
	label: string;
	value: string;
	column: string;
	direction: 'asc' | 'desc';
}

//#endregion

//#region Display Configuration

export type SubtitleGenerator = (item: CompendiumItem) => string;
export type TagsGenerator = (item: CompendiumItem) => string[];
export type ListItemAccentGenerator = (item: CompendiumItem) => string;
export type CardSchoolGenerator = (item: CompendiumItem) => string | undefined;
export type DetailAccentGenerator = (item: CompendiumItem) => string;
export type MetaDescriptionGenerator = (item: CompendiumItem) => string;

export interface DisplayConfig {
	subtitle: SubtitleGenerator;
	tags: TagsGenerator;
	listItemAccent: ListItemAccentGenerator;
	cardSchool?: CardSchoolGenerator;
	detailAccent: DetailAccentGenerator;
	metaDescription: MetaDescriptionGenerator;
}

//#endregion

//#region UI Configuration

export type CompendiumIcon = ComponentType;

export interface EmptyStateConfig {
	title: string;
	description: string;
	ctaText?: string;
	ctaLink?: string;
}

export interface UIConfig {
	displayName: string;
	icon: CompendiumIcon;
	categoryGradient: string;
	categoryAccent: string;
	emptyState: EmptyStateConfig;
	databaseEmptyState: EmptyStateConfig;
}

//#endregion

//#region Route Configuration

export interface RouteConfig {
	basePath: string;
	dbType: CompendiumTypeName;
	storageKeyFilters: string;
	storageKeyListUrl: string;
}

//#endregion

//#region Main Configuration Interface

export interface CompendiumTypeConfig {
	routes: RouteConfig;
	filters: FilterGroupConfig[];
	sorting: {
		default: SortOption;
		options: SortOption[];
	};
	ui: UIConfig;
	display: DisplayConfig;
}

//#endregion
