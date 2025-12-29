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

	// Spell-specific fields
	spellLevel?: number;
	spellSchool?: string;

	// Monster-specific fields
	challengeRating?: string;
	monsterSize?: string;
	monsterType?: string;

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
	monsters: number;
	items: number;
	feats: number;
	backgrounds: number;
	races: number;
	classes: number;
	totalItems: number;
	errors: string[];
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
 * Provider configuration
 */
export interface ProviderConfig {
	primaryProvider?: string;
	providers: ProviderSettings[];
	sync?: SyncConfig;
}

/**
 * Settings for a single provider
 */
export interface ProviderSettings {
	id: string;
	name: string;
	enabled: boolean;
	type: 'open5e' | '5e-bits' | 'srd' | 'homebrew' | 'custom';
	baseUrl?: string;
	supportedTypes?: CompendiumTypeName[];
	options?: Record<string, unknown>;
}

/**
 * Sync configuration
 */
export interface SyncConfig {
	maxConcurrency?: number;
	retryAttempts?: number;
	retryDelayMs?: number;
}
