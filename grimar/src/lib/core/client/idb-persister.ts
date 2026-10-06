import { get, set, del } from 'idb-keyval';
import type { Persister, PersistedClient } from '@tanstack/query-persist-client-core';

export const QUERY_CACHE_KEY = 'grimar-query-cache';
const WRITE_DELAY_MS = 1000;

export function createIdbPersister(): Persister & { flush: () => Promise<void> } {
	let pending: PersistedClient | undefined;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let writes = Promise.resolve();

	function cancelTimer() {
		if (timer !== undefined) clearTimeout(timer);
		timer = undefined;
	}

	function flush(): Promise<void> {
		cancelTimer();
		const snapshot = pending;
		pending = undefined;
		if (snapshot) {
			// IndexedDB performs structured cloning; no main-thread JSON stringify is needed.
			writes = writes
				.then(() => set(QUERY_CACHE_KEY, snapshot))
				.catch((error) => {
					console.error('[QueryClient] Failed to persist offline cache:', error);
				});
		}
		return writes;
	}

	return {
		persistClient: (client) => {
			pending = client;
			// Throttle rather than debounce so continuous activity still gets saved.
			if (timer === undefined) timer = setTimeout(() => void flush(), WRITE_DELAY_MS);
		},
		restoreClient: async () => {
			const data = await get<PersistedClient | string>(QUERY_CACHE_KEY);
			if (!data) return undefined;
			try {
				// Keep caches written by previous versions readable during upgrades.
				const restored = typeof data === 'string' ? JSON.parse(data) : data;
				if (
					typeof restored.timestamp !== 'number' ||
					typeof restored.buster !== 'string' ||
					!Array.isArray(restored.clientState?.queries) ||
					!Array.isArray(restored.clientState?.mutations)
				) {
					return undefined;
				}
				return restored as PersistedClient;
			} catch {
				return undefined;
			}
		},
		removeClient: async () => {
			cancelTimer();
			pending = undefined;
			// Delete after in-flight writes to prevent a cleared cache reappearing.
			writes = writes.then(() => del(QUERY_CACHE_KEY));
			await writes;
		},
		flush
	};
}
