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
export type { CompendiumType } from './unified';

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

// All valid compendium type names as a tuple for runtime checks
// Aligned with Open5e API v2 endpoints
export const COMPENDIUM_TYPES = [
	'spells',
	'creatures',
	'magicitems',
	'itemsets',
	'itemcategories',
	'documents',
	'licenses',
	'publishers',
	'weapons',
	'armor',
	'gamesystems',
	'backgrounds',
	'feats',
	'species',
	'creaturetypes',
	'creaturesets',
	'damagetypes',
	'languages',
	'alignments',
	'conditions',
	'spellschools',
	'classes',
	'sizes',
	'itemrarities',
	'environments',
	'abilities',
	'skills',
	'rules',
	'rulesections',
	'rulesets',
	'images',
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
	'weaponpropertyassignments'
] as const;

//#region Core Types

/**
 * The database type stored in compendium_items.type
 * Aligned with Open5e API v2 endpoint names
 */
export type CompendiumTypeName =
	| 'spells'
	| 'creatures'
	| 'magicitems'
	| 'itemsets'
	| 'itemcategories'
	| 'documents'
	| 'licenses'
	| 'publishers'
	| 'weapons'
	| 'armor'
	| 'gamesystems'
	| 'backgrounds'
	| 'feats'
	| 'species'
	| 'creaturetypes'
	| 'creaturesets'
	| 'damagetypes'
	| 'languages'
	| 'alignments'
	| 'conditions'
	| 'spellschools'
	| 'classes'
	| 'sizes'
	| 'itemrarities'
	| 'environments'
	| 'abilities'
	| 'skills'
	| 'rules'
	| 'rulesections'
	| 'rulesets'
	| 'images'
	| 'weaponproperties'
	| 'services'
	| 'classfeatures'
	| 'classfeatureitems'
	| 'creatureactions'
	| 'creatureactionattacks'
	| 'creaturetraits'
	| 'speciestraits'
	| 'backgroundbenefits'
	| 'featbenefits'
	| 'spellcastingoptions'
	| 'weaponpropertyassignments';

/**
 * Raw compendium item from database
 * This represents a row from compendium_items table
 */
export interface CompendiumItem {
	id: number;
	source: string;
	sourceBook: string | null;
	type: string;
	externalId: string | null;
	name: string;
	summary: string | null;
	details: Record<string, unknown>;
	// Spell-specific columns
	spellLevel: number | null;
	spellSchool: string | null;
	// Creature-specific columns
	challengeRating: string | null;
	creatureSize: string | null;
	creatureType: string | null;
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
	// Subclass-specific columns
	subclassName?: string | null;
	className?: string | null;
	subclassFlavor?: string | null;
	// Subrace-specific columns
	subraceName?: string | null;
	raceName?: string | null;
	// Trait-specific columns
	traitName?: string | null;
	traitRaces?: string | null;
	// Condition-specific columns
	conditionName?: string | null;
	// Feature-specific columns
	featureName?: string | null;
	featureLevel?: number | null;
	// Skill-specific columns
	skillName?: string | null;
	abilityScore?: string | null;
	// Language-specific columns
	languageName?: string | null;
	typicalSpeakers?: string | null;
	// Alignment-specific columns
	alignmentName?: string | null;
	alignmentAbbreviation?: string | null;
	// Proficiency-specific columns
	proficiencyName?: string | null;
	proficiencyType?: string | null;
	// Ability Score columns
	abilityScoreName?: string | null;
	abilityScoreAbbreviation?: string | null;
	// Damage Type columns
	damageTypeName?: string | null;
	// Magic School columns
	magicSchoolName?: string | null;
	// Equipment columns
	equipmentName?: string | null;
	equipmentCategory?: string | null;
	// Weapon Property columns
	weaponPropertyName?: string | null;
	// Equipment Category columns
	equipmentCategoryName?: string | null;
	// Vehicle columns
	vehicleName?: string | null;
	vehicleCategory?: string | null;
	// Creature Type columns
	creatureTypeName?: string | null;
	// Rule columns
	ruleName?: string | null;
	// Rule Section columns
	ruleSectionName?: string | null;
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
