/**
 * TanStack Query Definitions
 *
 * Reusable query configurations for compendium and character data.
 * Uses Svelte 5 reactive pattern - createQuery returns a reactive object directly.
 *
 * Server-first architecture with offline support:
 * - StaleTime: 5 minutes (network-first strategy)
 * - All queries persisted to IndexedDB
 * - Cache invalidation via SSE or version mismatch
 */

import { createQuery } from '@tanstack/svelte-query';

// ============================================================================
// Query Keys - Centralized for type safety and easy invalidation
// ============================================================================

export const queryKeys = {
	compendium: {
		all: ['compendium'] as const,
		list: (type: string) => ['compendium', 'list', type] as const,
		detail: (type: string, slug: string) => ['compendium', 'detail', type, slug] as const,
		export: ['compendium', 'export'] as const
	},
	characters: {
		all: ['characters'] as const,
		list: ['characters', 'list'] as const,
		detail: (id: string) => ['characters', 'detail', id] as const
	},
	cache: {
		version: ['cache', 'version'] as const
	}
} as const;

// ============================================================================
// API Fetch Functions
// ============================================================================

/**
 * Fetch a list of compendium items by type.
 */
export async function fetchCompendiumList(pathType: string): Promise<any> {
	// Build params from pathType
	const params = new URLSearchParams({ type: pathType });

	// Read filter params from current URL and pass to API
	// This enables filtering by monsterType, spellLevel, spellSchool, challengeRating, etc.
	if (typeof window !== 'undefined') {
		const url = new URL(window.location.href);
		const filterKeys = ['monsterType', 'spellLevel', 'spellSchool', 'challengeRating', 'search'];
		for (const key of filterKeys) {
			const value = url.searchParams.get(key);
			if (value) {
				params.set(key, value);
			}
		}

		// Also pass pagination params if present
		const page = url.searchParams.get('page');
		if (page) params.set('page', page);
		const limit = url.searchParams.get('limit');
		if (limit) params.set('limit', limit);
		const sortBy = url.searchParams.get('sortBy');
		if (sortBy) params.set('sortBy', sortBy);
		const sortOrder = url.searchParams.get('sortOrder');
		if (sortOrder) params.set('sortOrder', sortOrder);
	}

	const response = await fetch(`/api/compendium/items?${params}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${pathType}: ${response.statusText}`);
	}
	return response.json();
}

/**
 * Fetch all compendium items of a type for client-side processing.
 */
export async function fetchCompendiumAll(pathType: string): Promise<any> {
	const params = new URLSearchParams({ type: pathType, all: 'true' });
	const response = await fetch(`/api/compendium/items?${params}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch all ${pathType}: ${response.statusText}`);
	}
	return response.json();
}

/**
 * Fetch a single compendium item by type and slug.
 */
export async function fetchCompendiumDetail(type: string, slug: string): Promise<any> {
	const response = await fetch(`/api/${type}/${slug}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${type}/${slug}: ${response.statusText}`);
	}
	return response.json();
}

/**
 * Fetch all characters for the current user.
 */
export async function fetchCharacters(): Promise<any[]> {
	const response = await fetch('/api/characters');
	if (!response.ok) {
		throw new Error(`Failed to fetch characters: ${response.statusText}`);
	}
	return response.json();
}

/**
 * Fetch a single character by ID.
 */
export async function fetchCharacter(id: string): Promise<any> {
	const response = await fetch(`/api/characters/${id}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch character ${id}: ${response.statusText}`);
	}
	return response.json();
}

/**
 * Fetch the current cache version from server.
 */
export async function fetchCacheVersion(): Promise<{ version: string; timestamp: number }> {
	const response = await fetch('/api/cache/version');
	if (!response.ok) {
		throw new Error(`Failed to fetch cache version: ${response.statusText}`);
	}
	return response.json();
}

// ============================================================================
// Query Factory Functions
// ============================================================================

/**
 * Create a compendium list query.
 * Cached for offline access, refetched after 5 minutes staleTime.
 */
export function createCompendiumQuery(type: string) {
	return createQuery(() => ({
		queryKey: queryKeys.compendium.list(type),
		queryFn: () => fetchCompendiumList(type),
		staleTime: 5 * 60 * 1000 // 5 minutes
	}));
}

/**
 * Create a query for all compendium items of a type.
 * Useful for virtualization and client-side filtering.
 */
export function createCompendiumAllQuery(type: string) {
	return createQuery(() => ({
		queryKey: [...queryKeys.compendium.list(type), 'all'],
		queryFn: () => fetchCompendiumAll(type),
		staleTime: 30 * 60 * 1000 // 30 minutes (less frequent updates)
	}));
}

/**
 * Create a compendium detail query.
 * Longer staleTime for individual items.
 */
export function createCompendiumDetailQuery(type: string, slug: string) {
	return createQuery(() => ({
		queryKey: queryKeys.compendium.detail(type, slug),
		queryFn: () => fetchCompendiumDetail(type, slug),
		staleTime: 10 * 60 * 1000 // 10 minutes
	}));
}

/**
 * Create a characters list query.
 * Shorter staleTime as characters change more frequently.
 */
export function createCharactersQuery() {
	return createQuery(() => ({
		queryKey: queryKeys.characters.list,
		queryFn: fetchCharacters,
		staleTime: 2 * 60 * 1000 // 2 minutes
	}));
}

/**
 * Create a single character query.
 */
export function createCharacterQuery(id: string) {
	return createQuery(() => ({
		queryKey: queryKeys.characters.detail(id),
		queryFn: () => fetchCharacter(id),
		staleTime: 2 * 60 * 1000 // 2 minutes
	}));
}

/**
 * Create a cache version query.
 * NOT persisted - always fetches from server.
 */
export function createCacheVersionQuery() {
	return createQuery(() => ({
		queryKey: queryKeys.cache.version,
		queryFn: fetchCacheVersion,
		gcTime: 0, // Don't persist
		staleTime: 0, // Always consider stale
		retry: 1
	}));
}
