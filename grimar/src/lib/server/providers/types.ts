/**
 * Provider System - Type Definitions
 * 
 * Simplified for new schema alignment with Open5e API v2.
 */

import type { CompendiumType } from '$lib/server/db/schema';

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
 * Directly maps to compendium table schema
 */
export interface TransformResult {
	key: string;
	type: CompendiumType;
	name: string;
	source: 'open5e' | 'homebrew';
	documentKey?: string | null;
	documentName?: string | null;
	gamesystemKey?: string | null;
	gamesystemName?: string | null;
	publisherKey?: string | null;
	publisherName?: string | null;
	description?: string | null;
	data: Record<string, unknown>;
}

/**
 * Core provider interface
 */
export interface CompendiumProvider {
	readonly id: string;
	readonly name: string;
	readonly baseUrl: string;
	readonly supportedTypes: readonly CompendiumType[];

	fetchList(type: CompendiumType, options?: FetchOptions): Promise<ProviderListResponse>;

	fetchDetail?(type: CompendiumType, key: string): Promise<Record<string, unknown>>;

	transformItem(rawItem: unknown, type: CompendiumType): TransformResult;

	healthCheck(): Promise<boolean>;

	fetchAllPages?(type: CompendiumType): Promise<unknown[]>;
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
	counts: Record<string, number>;
	totalItems: number;
	skipped: number;
	errors: string[];
}
