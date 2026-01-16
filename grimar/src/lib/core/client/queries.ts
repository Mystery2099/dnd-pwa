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
import type { QueryClient } from '@tanstack/svelte-query';
import { ApiError, type ApiErrorCode } from './errors';

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
// API Fetch Wrapper with Standardized Error Handling
// ============================================================================

/**
 * Unified API fetch function with standardized error handling.
 * Throws ApiError on failure with consistent error codes.
 */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
	// Check offline status first
	if (typeof navigator !== 'undefined' && !navigator.onLine) {
		throw ApiError.offline();
	}

	try {
		const response = await fetch(url, {
			...init,
			headers: {
				'Content-Type': 'application/json',
				...init?.headers
			}
		});

		if (!response.ok) {
			const body = await response.text().catch(() => undefined);
			throw ApiError.fromResponse(response, body);
		}

		// Handle empty responses
		const contentType = response.headers.get('content-type');
		if (contentType?.includes('application/json')) {
			return response.json() as Promise<T>;
		}
		return undefined as T;
	} catch (error) {
		if (ApiError.isApiError(error)) {
			throw error;
		}
		if (error instanceof TypeError || error instanceof DOMException) {
			throw ApiError.networkError(error.message);
		}
		throw ApiError.networkError('An unexpected error occurred');
	}
}

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
	// This enables filtering by creatureType, spellLevel, spellSchool, challengeRating, etc.
	if (typeof window !== 'undefined') {
		const url = new URL(window.location.href);
		const filterKeys = ['creatureType', 'spellLevel', 'spellSchool', 'challengeRating', 'search'];
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

	return apiFetch(`/api/compendium/items?${params}`);
}

/**
 * Fetch all compendium items of a type for client-side processing.
 */
export async function fetchCompendiumAll(pathType: string): Promise<any> {
	const params = new URLSearchParams({ type: pathType, all: 'true' });
	return apiFetch(`/api/compendium/items?${params}`);
}

/**
 * Fetch a single compendium item by type and slug.
 */
export async function fetchCompendiumDetail(type: string, slug: string): Promise<any> {
	return apiFetch(`/api/compendium/${type}/${slug}`);
}

/**
 * Fetch all characters for the current user.
 */
export async function fetchCharacters(): Promise<any[]> {
	return apiFetch('/api/characters');
}

/**
 * Fetch a single character by ID.
 */
export async function fetchCharacter(id: string): Promise<any> {
	return apiFetch(`/api/characters/${id}`);
}

/**
 * Fetch the current cache version from server.
 */
export async function fetchCacheVersion(): Promise<{ version: string; timestamp: number }> {
	return apiFetch('/api/cache/version');
}

// ============================================================================
// Query Factory Functions
// ============================================================================

/**
 * Create a compendium list query.
 * Cached for offline access, refetched after 10 minutes staleTime.
 */
export function createCompendiumQuery(type: string) {
	return createQuery(() => ({
		queryKey: queryKeys.compendium.list(type),
		queryFn: () => fetchCompendiumList(type),
		staleTime: 10 * 60 * 1000, // 10 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes in cache
		networkMode: 'offlineFirst'
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
		staleTime: 30 * 60 * 1000, // 30 minutes (less frequent updates)
		gcTime: 60 * 60 * 1000, // 1 hour in cache
		networkMode: 'offlineFirst'
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
		staleTime: 30 * 60 * 1000, // 30 minutes
		gcTime: 60 * 60 * 1000, // 1 hour in cache
		networkMode: 'offlineFirst'
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
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes in cache
		networkMode: 'offlineFirst'
	}));
}

/**
 * Create a single character query.
 */
export function createCharacterQuery(id: string) {
	return createQuery(() => ({
		queryKey: queryKeys.characters.detail(id),
		queryFn: () => fetchCharacter(id),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes in cache
		networkMode: 'offlineFirst'
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

// ============================================================================
// Prefetch Helpers
// ============================================================================

/**
 * Prefetch compendium detail on hover or navigation.
 */
export function prefetchCompendiumDetail(
	queryClient: QueryClient,
	type: string,
	slug: string
): void {
	queryClient.prefetchQuery({
		queryKey: queryKeys.compendium.detail(type, slug),
		queryFn: () => fetchCompendiumDetail(type, slug),
		staleTime: 30 * 60 * 1000
	});
}

/**
 * Prefetch character detail.
 */
export function prefetchCharacter(queryClient: QueryClient, id: string): void {
	queryClient.prefetchQuery({
		queryKey: queryKeys.characters.detail(id),
		queryFn: () => fetchCharacter(id),
		staleTime: 5 * 60 * 1000
	});
}

/**
 * Prefetch characters list.
 */
export function prefetchCharacters(queryClient: QueryClient): void {
	queryClient.prefetchQuery({
		queryKey: queryKeys.characters.list,
		queryFn: fetchCharacters,
		staleTime: 2 * 60 * 1000
	});
}

// ============================================================================
// Optimistic Update Helpers
// ============================================================================

/**
 * Create an optimistic updater for a query.
 * Returns functions for applying and rolling back optimistic updates.
 */
export function createOptimisticUpdater<T>(queryClient: QueryClient, queryKey: readonly unknown[]) {
	return {
		/**
		 * Apply an optimistic update.
		 * Returns the previous value for potential rollback.
		 */
		async update(updater: (old: T | undefined) => T): Promise<T | undefined> {
			await queryClient.cancelQueries({ queryKey });
			const previous = queryClient.getQueryData<T>(queryKey);
			queryClient.setQueryData<T>(queryKey, (old) => updater(old));
			return previous;
		},

		/**
		 * Rollback to the previous value.
		 */
		rollback(previous: T | undefined): void {
			queryClient.setQueryData(queryKey, previous);
		}
	};
}

/**
 * Common optimistic update patterns for lists.
 */
export const optimisticPatterns = {
	/**
	 * Create an add-to-list optimistic update.
	 */
	addToList: <T extends { id: string | number }>(
		queryClient: QueryClient,
		queryKey: readonly [...unknown[]]
	) => {
		return {
			async apply(newItem: T): Promise<T[] | undefined> {
				await queryClient.cancelQueries({ queryKey });
				const previous = queryClient.getQueryData<T[]>(queryKey);
				queryClient.setQueryData<T[]>(queryKey, (old) => [...(old ?? []), newItem]);
				return previous;
			},
			rollback(previous: T[] | undefined): void {
				queryClient.setQueryData(queryKey, previous);
			}
		};
	},

	/**
	 * Create a remove-from-list optimistic update.
	 */
	removeFromList: <T extends { id: string | number }>(
		queryClient: QueryClient,
		queryKey: readonly [...unknown[]]
	) => {
		return {
			async apply(itemId: string | number): Promise<T[] | undefined> {
				await queryClient.cancelQueries({ queryKey });
				const previous = queryClient.getQueryData<T[]>(queryKey);
				queryClient.setQueryData<T[]>(queryKey, (old) =>
					(old ?? []).filter((item) => item.id !== itemId)
				);
				return previous;
			},
			rollback(previous: T[] | undefined): void {
				queryClient.setQueryData(queryKey, previous);
			}
		};
	},

	/**
	 * Create an update-in-list optimistic update.
	 */
	updateInList: <T extends { id: string | number }>(
		queryClient: QueryClient,
		queryKey: readonly [...unknown[]]
	) => {
		return {
			async apply(updated: T): Promise<T[] | undefined> {
				await queryClient.cancelQueries({ queryKey });
				const previous = queryClient.getQueryData<T[]>(queryKey);
				queryClient.setQueryData<T[]>(queryKey, (old) =>
					(old ?? []).map((item) => (item.id === updated.id ? updated : item))
				);
				return previous;
			},
			rollback(previous: T[] | undefined): void {
				queryClient.setQueryData(queryKey, previous);
			}
		};
	},

	/**
	 * Create an update-in-object optimistic update.
	 */
	updateObject: <T extends Record<string, unknown>>(
		queryClient: QueryClient,
		queryKey: readonly [...unknown[]]
	) => {
		return {
			async apply(updates: Partial<T>): Promise<T | undefined> {
				await queryClient.cancelQueries({ queryKey });
				const previous = queryClient.getQueryData<T>(queryKey);
				queryClient.setQueryData<T>(queryKey, (old) => (old ? { ...old, ...updates } : old));
				return previous;
			},
			rollback(previous: T | undefined): void {
				queryClient.setQueryData(queryKey, previous);
			}
		};
	}
};
