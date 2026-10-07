import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PersistedClient } from '@tanstack/query-persist-client-core';
import { createIdbPersister, QUERY_CACHE_KEY } from './idb-persister';

const storage = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn(), del: vi.fn() }));
vi.mock('idb-keyval', () => storage);

function snapshot(timestamp: number): PersistedClient {
	return { timestamp, buster: 'v2', clientState: { queries: [], mutations: [] } };
}

describe('IndexedDB query persistence', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.resetAllMocks();
		storage.set.mockResolvedValue(undefined);
		storage.del.mockResolvedValue(undefined);
	});
	afterEach(() => vi.useRealTimers());

	it('coalesces bursts and saves the latest snapshot as structured data', async () => {
		const persister = createIdbPersister();
		persister.persistClient(snapshot(1));
		persister.persistClient(snapshot(2));
		expect(storage.set).not.toHaveBeenCalled();
		await vi.advanceTimersByTimeAsync(1000);
		expect(storage.set).toHaveBeenCalledExactlyOnceWith(QUERY_CACHE_KEY, snapshot(2));
	});

	it('restores both legacy JSON and structured snapshots', async () => {
		const persister = createIdbPersister();
		storage.get.mockResolvedValueOnce(JSON.stringify(snapshot(1)));
		expect(await persister.restoreClient()).toEqual(snapshot(1));
		storage.get.mockResolvedValueOnce(snapshot(2));
		expect(await persister.restoreClient()).toEqual(snapshot(2));
		storage.get.mockResolvedValueOnce('{broken');
		expect(await persister.restoreClient()).toBeUndefined();
		storage.get.mockResolvedValueOnce({ timestamp: 1 });
		expect(await persister.restoreClient()).toBeUndefined();
	});

	it('does not resurrect a cleared cache from a pending write', async () => {
		const persister = createIdbPersister();
		persister.persistClient(snapshot(1));
		await persister.removeClient();
		await vi.advanceTimersByTimeAsync(2000);
		expect(storage.set).not.toHaveBeenCalled();
		expect(storage.del).toHaveBeenCalledWith(QUERY_CACHE_KEY);
	});

	it('flushes before the timer when the document is hidden', async () => {
		const persister = createIdbPersister();
		persister.persistClient(snapshot(1));
		await persister.flush();
		await vi.advanceTimersByTimeAsync(2000);
		expect(storage.set).toHaveBeenCalledExactlyOnceWith(QUERY_CACHE_KEY, snapshot(1));
	});

	it('orders removal after an in-flight write', async () => {
		let finishWrite!: () => void;
		storage.set.mockImplementation(
			() =>
				new Promise<void>((resolve) => {
					finishWrite = resolve;
				})
		);
		const persister = createIdbPersister();
		persister.persistClient(snapshot(1));
		const write = persister.flush();
		await Promise.resolve();
		const removal = persister.removeClient();
		expect(storage.del).not.toHaveBeenCalled();
		finishWrite();
		await write;
		await removal;
		expect(storage.del).toHaveBeenCalledOnce();
	});
});
