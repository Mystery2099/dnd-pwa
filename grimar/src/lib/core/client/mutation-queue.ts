/**
 * Offline Mutation Queue
 *
 * Queues mutations when offline and syncs when back online.
 * Uses idb-keyval for persistent storage of pending mutations.
 */

import { browser } from '$app/environment';
import { get, set, clear } from 'idb-keyval';
import { ApiError, isRetryableError } from './errors';

// Mutation queue key
const MUTATION_QUEUE_KEY = 'mutation-queue';
const MUTATION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface QueuedMutation<T = unknown> {
	id: string;
	type: 'create' | 'update' | 'delete';
	endpoint: string;
	payload: T;
	timestamp: number;
	retries: number;
	lastError?: string;
}

class MutationQueueState {
	pending: QueuedMutation[] = [];
	syncing = false;
	online = true;

	constructor() {
		if (browser) {
			this.online = navigator.onLine;
			this.loadQueue();
			this.setupListeners();
		}
	}

	private async loadQueue(): Promise<void> {
		const stored = await get<QueuedMutation[]>(MUTATION_QUEUE_KEY);
		if (stored) {
			const now = Date.now();
			this.pending = stored.filter((m) => now - m.timestamp < MUTATION_MAX_AGE);
		}
	}

	private setupListeners(): void {
		window.addEventListener('online', () => {
			this.online = true;
			this.sync();
		});

		window.addEventListener('offline', () => {
			this.online = false;
		});
	}

	async save(): Promise<void> {
		await set(MUTATION_QUEUE_KEY, this.pending);
	}

	async sync(): Promise<void> {
		if (!browser || this.syncing || !this.online) return;

		this.syncing = true;

		try {
			const failed: QueuedMutation[] = [];

			for (const mutation of this.pending) {
				try {
					await executeMutation(mutation);
				} catch (error) {
					mutation.retries++;
					mutation.lastError = ApiError.isApiError(error) ? error.message : 'Unknown error';

					// Only retry if error is retryable
					if (isRetryableError(error) && mutation.retries < 3) {
						failed.push(mutation);
					} else {
						failed.push(mutation);
					}
				}
			}

			this.pending = failed;
			await this.save();
		} finally {
			this.syncing = false;
		}
	}
}

export const mutationQueue = new MutationQueueState();

/**
 * Execute a single mutation against the server.
 */
async function executeMutation<T>(mutation: QueuedMutation<T>): Promise<void> {
	try {
		const response = await fetch(mutation.endpoint, {
			method: mutation.type === 'delete' ? 'DELETE' : mutation.type === 'create' ? 'POST' : 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(mutation.payload)
		});

		if (!response.ok) {
			const text = await response.text().catch(() => undefined);
			throw ApiError.fromResponse(response, text);
		}
	} catch (error) {
		// Convert to ApiError if not already
		if (!ApiError.isApiError(error)) {
			if (error instanceof TypeError || error instanceof DOMException) {
				throw ApiError.networkError(error.message);
			}
			throw ApiError.networkError('Mutation failed');
		}
		throw error;
	}
}

/**
 * Add a mutation to the queue.
 */
export async function queueMutation<T>(
	type: QueuedMutation['type'],
	endpoint: string,
	payload: T
): Promise<string> {
	if (!browser) return '';

	const mutation: QueuedMutation<T> = {
		id: crypto.randomUUID(),
		type,
		endpoint,
		payload,
		timestamp: Date.now(),
		retries: 0
	};

	mutationQueue.pending.push(mutation);
	await mutationQueue.save();

	// Try to sync immediately if online
	if (mutationQueue.online) {
		mutationQueue.sync();
	}

	return mutation.id;
}

/**
 * Sync the queue with the server.
 */
export async function syncQueue(): Promise<void> {
	await mutationQueue.sync();
}

/**
 * Remove a specific mutation from the queue.
 */
export async function removeMutation(id: string): Promise<void> {
	mutationQueue.pending = mutationQueue.pending.filter((m) => m.id !== id);
	await mutationQueue.save();
}

/**
 * Clear all queued mutations.
 */
export async function clearQueue(): Promise<void> {
	mutationQueue.pending = [];
	await clear();
}

/**
 * Get queue status.
 */
export function getQueueStatus(): {
	pending: number;
	syncing: boolean;
	online: boolean;
} {
	return {
		pending: mutationQueue.pending.length,
		syncing: mutationQueue.syncing,
		online: mutationQueue.online
	};
}
