import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const storage = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn(), del: vi.fn() }));
vi.mock('idb-keyval', () => storage);

beforeEach(() => {
	vi.resetModules();
	vi.resetAllMocks();
	storage.get.mockResolvedValue(undefined);
	storage.set.mockResolvedValue(undefined);
	storage.del.mockResolvedValue(undefined);
	// Each imported singleton owns its network listeners for this test only.
	vi.spyOn(window, 'addEventListener').mockImplementation(() => {});
});
afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

async function prepare() {
	const queue = await import('./mutation-queue');
	await queue.mutationQueue.ready();
	queue.mutationQueue.online = false;
	await queue.queueMutation('create', '/api/homebrew', { name: 'First' });
	const second = await queue.queueMutation('create', '/api/homebrew', { name: 'Second' });
	let finish!: (response: Response) => void;
	const fetch = vi.fn().mockImplementationOnce(() => new Promise<Response>((r) => (finish = r)));
	vi.stubGlobal('fetch', fetch);
	queue.mutationQueue.online = true;
	const syncing = queue.syncQueue();
	await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
	return { queue, second, finish, fetch, syncing };
}

it('clearing during an in-flight failure prevents retries and remaining requests', async () => {
	const { queue, finish, fetch, syncing } = await prepare();
	await queue.clearQueue();
	finish(new Response('Unavailable', { status: 503 }));
	await syncing;
	expect(fetch).toHaveBeenCalledTimes(1);
	expect(queue.getQueueStatus().pending).toBe(0);
	expect(storage.set).toHaveBeenLastCalledWith('mutation-queue', []);
});

it('respects queue edits and retains failed work for a later sync', async () => {
	const { queue, second, finish, fetch, syncing } = await prepare();
	await queue.removeMutation(second);
	await queue.queueMutation('create', '/api/homebrew', { name: 'Third' });
	fetch.mockResolvedValue(new Response(null, { status: 201 }));
	finish(new Response('Unavailable', { status: 503 }));
	await syncing;
	expect(fetch).toHaveBeenCalledTimes(2);
	expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ name: 'Third' });
	expect(queue.getQueueStatus().pending).toBe(1);
	expect(queue.mutationQueue.pending[0].retries).toBe(1);
	expect(storage.set).toHaveBeenLastCalledWith('mutation-queue', queue.mutationQueue.pending);
	await queue.syncQueue();
	expect(fetch).toHaveBeenCalledTimes(3);
	expect(JSON.parse(fetch.mock.calls[2][1].body)).toEqual({ name: 'First' });
	expect(queue.getQueueStatus().pending).toBe(0);
});
