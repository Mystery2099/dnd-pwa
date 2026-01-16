/**
 * TanStack Mutation Factories with Offline Queue Integration
 *
 * Provides createMutation wrappers that automatically queue failed mutations
 * for offline retry via the mutationQueue.
 */

import { createMutation } from '@tanstack/svelte-query';
import type { QueryClient } from '@tanstack/svelte-query';
import { queryKeys, apiFetch, optimisticPatterns } from './queries';
import { queueMutation } from './mutation-queue';
import { ApiError } from './errors';

// ============================================================================
// Mutation Keys
// ============================================================================

export const mutationKeys = {
	characters: {
		all: ['characters'] as const,
		create: ['characters', 'create'] as const,
		update: (id: string) => ['characters', 'update', id] as const,
		delete: (id: string) => ['characters', 'delete', id] as const
	}
} as const;

// ============================================================================
// Character Mutations
// ============================================================================

/**
 * Create a character mutation with offline queue support.
 */
export function createCharacterMutation(queryClient: QueryClient) {
	return createMutation(() => ({
		mutationKey: mutationKeys.characters.create,
		mutationFn: async (data: { name: string; class?: string }) => {
			return apiFetch<{ id: string }>('/api/characters', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.characters.all });
		},
		onError: async (error, variables) => {
			// Queue for offline retry if network error
			if (
				ApiError.isApiError(error) &&
				(error.code === 'OFFLINE' || error.code === 'NETWORK_ERROR')
			) {
				await queueMutation('create', '/api/characters', variables);
			}
		}
	}));
}

/**
 * Update character mutation with optimistic update.
 */
export function updateCharacterMutation(queryClient: QueryClient, id: string) {
	const listKey = queryKeys.characters.list;
	const detailKey = queryKeys.characters.detail(id);
	const listUpdater = optimisticPatterns.updateObject(queryClient, detailKey);

	return createMutation(() => ({
		mutationKey: mutationKeys.characters.update(id),
		mutationFn: async (data: Partial<{ name: string; class: string }>) => {
			return apiFetch(`/api/characters/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});
		},
		onMutate: async (newData) => {
			// Optimistic update for detail view
			await listUpdater.apply(newData);
			return { previous: undefined }; // Not used for object updates
		},
		onError: async (error, _variables, _context) => {
			// Rollback on error
			listUpdater.rollback(undefined);
			// Queue for offline retry
			if (
				ApiError.isApiError(error) &&
				(error.code === 'OFFLINE' || error.code === 'NETWORK_ERROR')
			) {
				await queueMutation('update', `/api/characters/${id}`, _variables);
			}
		},
		onSettled: async () => {
			// Refetch to ensure consistency
			await queryClient.invalidateQueries({ queryKey: detailKey });
		}
	}));
}

/**
 * Delete character mutation with optimistic removal.
 */
export function deleteCharacterMutation(queryClient: QueryClient, id: string) {
	const listKey = queryKeys.characters.list;
	const listUpdater = optimisticPatterns.removeFromList(queryClient, listKey);

	return createMutation(() => ({
		mutationKey: mutationKeys.characters.delete(id),
		mutationFn: async () => {
			return apiFetch(`/api/characters/${id}`, { method: 'DELETE' });
		},
		onMutate: async () => {
			// Optimistic removal from list
			await listUpdater.apply(id);
			return { previous: undefined };
		},
		onError: async (error, _variables, _context) => {
			// Rollback on error - we need to refetch since we don't have the old list
			await queryClient.invalidateQueries({ queryKey: listKey });
			// Queue for offline retry
			if (
				ApiError.isApiError(error) &&
				(error.code === 'OFFLINE' || error.code === 'NETWORK_ERROR')
			) {
				await queueMutation('delete', `/api/characters/${id}`, { id });
			}
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.characters.all });
		}
	}));
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get mutation status as a reactive object.
 */
export function getMutationStatus<T>(mutation: ReturnType<typeof createMutation>) {
	return {
		get isIdle() {
			return mutation.isIdle;
		},
		get isPending() {
			return mutation.isPending;
		},
		get isSuccess() {
			return mutation.isSuccess;
		},
		get isError() {
			return mutation.isError;
		},
		get error() {
			return mutation.error;
		},
		get data() {
			return mutation.data;
		},
		get variables() {
			return mutation.variables;
		},
		get isPaused() {
			return mutation.isPaused;
		},
		get failureCount() {
			return mutation.failureCount;
		},
		mutate: (variables: T) => mutation.mutate(variables),
		mutateAsync: (variables: T) => mutation.mutateAsync(variables),
		reset: () => mutation.reset()
	};
}
