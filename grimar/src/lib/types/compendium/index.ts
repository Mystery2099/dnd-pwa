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

//#region Core Types

/**
 * The database type stored in compendium_items.type
 */
export type CompendiumTypeName =
	| 'spell'
	| 'monster'
	| 'item'
	| 'feat'
	| 'background'
	| 'race'
	| 'class';

/**
 * Raw compendium item from database
 * This represents a row from compendium_items table
 */
export interface CompendiumItem {
	id: number;
	source: string;
	type: string;
	externalId: string | null;
	name: string;
	summary: string | null;
	details: Record<string, unknown>;
	// Spell-specific columns
	spellLevel: number | null;
	spellSchool: string | null;
	// Monster-specific columns
	challengeRating: string | null;
	monsterSize: string | null;
	monsterType: string | null;
	// Feat-specific columns
	featPrerequisites?: string | null;
	featBenefits?: string[] | null;
	// Background-specific columns
	backgroundFeature?: string | null;
	backgroundSkillProficiencies?: string | null;
	// Race-specific columns
	raceSize?: string | null;
	raceSpeed?: number | null;
	// Class-specific columns
	classHitDie?: number | null;
	createdBy: string | null;
}

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

/**
 * Helper function to create color mapping from a single color name
 */
export function colorMap(color: string): FilterColorMapping {
	return {
		base: `text-${color}-400`,
		hover: `group-hover:border-${color}-500/50`
	};
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
export type DetailAccentGenerator = (item: CompendiumItem) => string;
export type MetaDescriptionGenerator = (item: CompendiumItem) => string;

export interface DisplayConfig {
	subtitle: SubtitleGenerator;
	tags: TagsGenerator;
	listItemAccent: ListItemAccentGenerator;
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
	displayNamePlural: string;
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
