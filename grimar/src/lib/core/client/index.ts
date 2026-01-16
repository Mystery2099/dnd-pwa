/**
 * Core Client Module Barrel Export
 *
 * Re-exports all data fetching, caching, and state management utilities.
 */

// Query Client
export {
	queryClient,
	setQueryClient,
	createQueryClient,
	initializePersistence,
	clearQueryCache
} from './query-client';

// Queries
export {
	queryKeys,
	createCompendiumQuery,
	createCompendiumAllQuery,
	createCompendiumDetailQuery,
	createCharactersQuery,
	createCharacterQuery,
	createCacheVersionQuery,
	apiFetch,
	prefetchCompendiumDetail,
	prefetchCharacter,
	prefetchCharacters,
	createOptimisticUpdater,
	optimisticPatterns
} from './queries';

// Mutations
export {
	mutationKeys,
	createCharacterMutation,
	updateCharacterMutation,
	deleteCharacterMutation,
	getMutationStatus
} from './mutations';

// Reactivity
export {
	createQueryState,
	createLoadingState,
	createErrorState,
	createAsyncState,
	createDebouncedSearch,
	type QueryState,
	type LoadingState,
	type ErrorState,
	type AsyncState
} from './reactivity';

// Errors
export { ApiError, type ApiErrorCode, isRetryableError, getErrorMessage } from './errors';

// Mutation Queue
export {
	mutationQueue,
	queueMutation,
	syncQueue,
	removeMutation,
	clearQueue,
	getQueueStatus,
	type QueuedMutation
} from './mutation-queue';

// Offline Store
export { offlineStore, formatLastOnline } from './offline-store';

// Cache Sync
export { cacheSync, startCacheSync } from './cache-sync';

// Cache Version
export { getCachedVersion, setCachedVersion } from './cache-version';
