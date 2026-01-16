/**
 * Provider System - Type Definitions
 *
 * Core interfaces for the multi-provider compendium sync system.
 */

import type { CompendiumTypeName } from '$lib/core/types/compendium';

/**
 * Lightweight list response from a provider
 */
export interface ProviderListResponse<T = unknown> {
	items: T[];
	hasMore: boolean;
	nextUrl?: string;
}

/**
 * Options for fetching items from a provider
 */
export interface FetchOptions {
	limit?: number;
	offset?: number;
	modifiedSince?: Date;
}

/**
 * Result of transforming a provider's raw data
 * Contains normalized fields for filtering/sorting across all types
 */
export interface TransformResult {
	// Core fields
	externalId: string;
	name: string;
	summary: string;
	details: Record<string, unknown>;

	// Full cleaned/transformed payload as JSON string (Hybrid SQLite)
	jsonData?: string;

	// Source tracking
	sourceBook?: string;
	sourcePublisher?: string; // wizards-of-the-coast, kobold-press, en-publishing, etc.
	edition?: string;

	// Spell-specific fields
	spellLevel?: number;
	spellSchool?: string;

	// Creature-specific fields
	challengeRating?: string;
	creatureSize?: string;
	creatureType?: string;

	// Feat-specific fields
	featPrerequisites?: string;
	featBenefits?: string[];

	// Background-specific fields
	backgroundFeature?: string;
	backgroundSkillProficiencies?: string;

	// Race-specific fields
	raceSize?: string;
	raceSpeed?: number;
	raceAbilityScores?: Record<string, number>;

	// Class-specific fields
	classHitDie?: number;
	classProficiencies?: string[];
	classSpellcasting?: Record<string, unknown>;

	// Subclass-specific fields
	subclassName?: string;
	className?: string;
	subclassFlavor?: string;

	// Subrace-specific fields
	subraceName?: string;
	raceName?: string;

	// Trait-specific fields
	traitName?: string;
	traitRaces?: string;

	// Condition-specific fields
	conditionName?: string;

	// Feature-specific fields
	featureName?: string;
	featureLevel?: number;

	// Skill-specific fields
	skillName?: string;
	abilityScore?: string;

	// Language-specific fields
	languageName?: string;
	typicalSpeakers?: string;

	// Alignment-specific fields
	alignmentName?: string;
	alignmentAbbreviation?: string;

	// Proficiency-specific fields
	proficiencyName?: string;
	proficiencyType?: string;

	// Ability Score fields
	abilityScoreName?: string;
	abilityScoreAbbreviation?: string;

	// Damage Type fields
	damageTypeName?: string;

	// Magic School fields
	magicSchoolName?: string;

	// Equipment fields
	equipmentName?: string;
	equipmentCategory?: string;

	// Weapon Property fields
	weaponPropertyName?: string;

	// Equipment Category fields
	equipmentCategoryName?: string;

	// Vehicle fields
	vehicleName?: string;
	vehicleCategory?: string;

	// Monster Type fields
	creatureTypeName?: string;

	// Rule fields
	ruleName?: string;

	// Rule Section fields
	ruleSectionName?: string;
}

/**
 * Core provider interface
 */
export interface CompendiumProvider {
	readonly id: string;
	readonly name: string;
	readonly baseUrl: string;
	readonly supportedTypes: readonly CompendiumTypeName[];

	fetchList(type: CompendiumTypeName, options?: FetchOptions): Promise<ProviderListResponse>;

	fetchDetail?(type: CompendiumTypeName, externalId: string): Promise<Record<string, unknown>>;

	transformItem(rawItem: unknown, type: CompendiumTypeName): TransformResult;

	healthCheck(): Promise<boolean>;

	fetchAllPages?(type: CompendiumTypeName): Promise<unknown[]>;
}

/**
 * Health check result for a provider
 */
export interface ProviderHealthStatus {
	providerId: string;
	healthy: boolean;
	latency?: number;
	error?: string;
}

/**
 * Sync result for a single provider
 */
export interface ProviderSyncResult {
	providerId: string;
	spells: number;
	creatures: number;
	items: number;
	feats: number;
	backgrounds: number;
	races: number;
	classes: number;
	subclasses: number;
	subraces: number;
	traits: number;
	conditions: number;
	features: number;
	skills: number;
	languages: number;
	alignments: number;
	proficiencies: number;
	abilityScores: number;
	damageTypes: number;
	magicSchools: number;
	equipment: number;
	weaponProperties: number;
	equipmentCategories: number;
	vehicles: number;
	creatureTypes: number;
	rules: number;
	ruleSections: number;
	weapons: number;
	armor: number;
	planes: number;
	sections: number;
	totalItems: number;
	skipped: number;
	errors: string[];
}
