/**
 * Reactivity Utilities for Svelte 5 Runes
 *
 * Provides rune-based wrappers for query and mutation states.
 */

import type { QueryObserverResult } from '@tanstack/svelte-query';
import { ApiError } from './errors';

// ============================================================================
// Query State Types
// ============================================================================

export interface QueryState<TData> {
	data: TData | null;
	isLoading: boolean;
	isError: boolean;
	error: ApiError | null;
	isSuccess: boolean;
	isFetching: boolean;
	isPending: boolean;
	fetchStatus: 'idle' | 'pending' | 'streaming';
}

/**
 * Create a reactive query state from TanStack Query result.
 * Updates automatically when the query result changes.
 */
export function createQueryState<TData>(
	result: QueryObserverResult<TData, ApiError>
): QueryState<TData> {
	const state = $state<QueryState<TData>>({
		data: result.data ?? null,
		isLoading: result.isLoading,
		isError: result.isError,
		error: result.error,
		isSuccess: result.isSuccess,
		isFetching: result.isFetching,
		isPending: result.isPending,
		fetchStatus: result.isFetching ? 'streaming' : result.isPending ? 'pending' : 'idle'
	});

	$effect(() => {
		state.data = result.data ?? null;
		state.isLoading = result.isLoading;
		state.isError = result.isError;
		state.error = result.error;
		state.isSuccess = result.isSuccess;
		state.isFetching = result.isFetching;
		state.isPending = result.isPending;
		state.fetchStatus = result.isFetching ? 'streaming' : result.isPending ? 'pending' : 'idle';
	});

	return state;
}

// ============================================================================
// Loading State
// ============================================================================

export interface LoadingState {
	isLoading: boolean;
	progress: number;
	count: number;
}

/**
 * Create a reusable loading state with counter support.
 * Use increment() before async work, decrement() after.
 */
export function createLoadingState(initialCount = 0): LoadingState & {
	increment: (progress?: number) => void;
	decrement: () => void;
	setProgress: (progress: number) => void;
	start: (initialProgress?: number) => void;
	stop: () => void;
	reset: () => void;
	withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
} {
	let pending = $state(initialCount);
	let progress = $state(0);

	return {
		get isLoading() {
			return pending > 0;
		},
		get progress() {
			return progress;
		},
		get count() {
			return pending;
		},

		increment(p = 0) {
			pending++;
			if (p > 0) progress = p;
		},

		decrement() {
			if (pending > 0) pending--;
		},

		setProgress(p: number) {
			progress = p;
		},

		start(initialProgress = 0) {
			pending = 1;
			progress = initialProgress;
		},

		stop() {
			pending = 0;
			progress = 100;
		},

		reset() {
			pending = 0;
			progress = 0;
		},

		async withLoading<T>(fn: () => Promise<T>): Promise<T> {
			this.increment();
			try {
				return await fn();
			} finally {
				this.decrement();
			}
		}
	};
}

// ============================================================================
// Error State
// ============================================================================

export interface ErrorState {
	error: ApiError | null;
	isError: boolean;
	message: string;
	code: string | null;
	status: number;
}

/**
 * Create a reactive error state.
 */
export function createErrorState(initialError: ApiError | null = null): ErrorState & {
	setError: (error: ApiError | null) => void;
	clear: () => void;
	fromUnknown: (error: unknown) => void;
} {
	let error = $state<ApiError | null>(initialError);

	return {
		get isError() {
			return error !== null;
		},
		get error() {
			return error;
		},
		get message() {
			return error?.message ?? '';
		},
		get code() {
			return error?.code ?? null;
		},
		get status() {
			return error?.status ?? 0;
		},

		setError(e: ApiError | null) {
			error = e;
		},

		clear() {
			error = null;
		},

		fromUnknown(err: unknown) {
			if (ApiError.isApiError(err)) {
				error = err;
			} else if (err instanceof Error) {
				error = new ApiError(err.message, 'UNKNOWN', 0);
			} else {
				error = new ApiError('An unknown error occurred', 'UNKNOWN', 0);
			}
		}
	};
}

// ============================================================================
// Async State
// ============================================================================

export interface AsyncState<T> {
	data: T | null;
	isLoading: boolean;
	isError: boolean;
	error: ApiError | null;
	isSuccess: boolean;
	isPending: boolean;
}

/**
 * Create an async state manager for manual data fetching.
 */
export function createAsyncState<T>(): AsyncState<T> & {
	setData: (data: T | null) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: ApiError | null) => void;
	execute: (fn: () => Promise<T>) => Promise<T | null>;
	reset: () => void;
} {
	let data = $state<T | null>(null);
	let isLoading = $state(false);
	let isError = $state(false);
	let error = $state<ApiError | null>(null);

	return {
		get data() {
			return data;
		},
		get isLoading() {
			return isLoading;
		},
		get isError() {
			return isError;
		},
		get error() {
			return error;
		},
		get isSuccess() {
			return data !== null && !isError && !isLoading;
		},
		get isPending() {
			return isLoading;
		},

		setData(d: T | null) {
			data = d;
		},

		setLoading(loading: boolean) {
			isLoading = loading;
		},

		setError(err: ApiError | null) {
			error = err;
			isError = err !== null;
		},

		async execute(fn: () => Promise<T>): Promise<T | null> {
			isLoading = true;
			isError = false;
			error = null;

			try {
				const result = await fn();
				data = result;
				return result;
			} catch (err) {
				if (ApiError.isApiError(err)) {
					error = err;
				} else if (err instanceof Error) {
					error = new ApiError(err.message, 'UNKNOWN', 0);
				}
				isError = true;
				return null;
			} finally {
				isLoading = false;
			}
		},

		reset() {
			data = null;
			isLoading = false;
			isError = false;
			error = null;
		}
	};
}

// ============================================================================
// Debounced Search
// ============================================================================

/**
 * Create a debounced search state.
 */
export function createDebouncedSearch(
	onSearch: (query: string) => void,
	delay = 300
): {
	query: string;
	setQuery: (q: string) => void;
	clear: () => void;
} {
	let query = $state('');
	let timeout: ReturnType<typeof setTimeout> | null = null;

	const scheduleSearch = (q: string) => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => {
			onSearch(q);
		}, delay);
	};

	return {
		get query() {
			return query;
		},
		setQuery(q: string) {
			query = q;
			scheduleSearch(q);
		},
		clear() {
			query = '';
			if (timeout) clearTimeout(timeout);
		}
	};
}
