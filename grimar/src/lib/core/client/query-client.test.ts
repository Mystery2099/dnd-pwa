import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { QueryClient } from '@tanstack/svelte-query';

const mocks = vi.hoisted(() => ({
	persistQueryClient: vi.fn(),
	idbGet: vi.fn(),
	idbSet: vi.fn(),
	idbDel: vi.fn(),
	idbClear: vi.fn(),
	getCachedVersion: vi.fn(),
	setCachedVersion: vi.fn(),
	userSettingsStore: { data: { offlineEnabled: true } },
	fetch: vi.fn()
}));

vi.mock('@tanstack/svelte-query-persist-client', () => ({
	persistQueryClient: mocks.persistQueryClient
}));

vi.mock('idb-keyval', () => ({
	get: mocks.idbGet,
	set: mocks.idbSet,
	del: mocks.idbDel,
	clear: mocks.idbClear
}));

vi.mock('./cache-version', () => ({
	getCachedVersion: mocks.getCachedVersion,
	setCachedVersion: mocks.setCachedVersion
}));

vi.mock('./userSettingsStore.svelte', () => ({
	userSettingsStore: mocks.userSettingsStore
}));

vi.mock('./settingsStore.svelte', () => ({
	settingsStore: { data: {} }
}));

async function loadModule() {
	vi.resetModules();
	return import('./query-client');
}

describe('query-client persistence', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.userSettingsStore.data.offlineEnabled = true;
		mocks.fetch.mockReset();
		global.fetch = mocks.fetch as unknown as typeof fetch;
	});

	it('invalidates queries when cache version mismatches server version', async () => {
		const { initializePersistence } = await loadModule();
		const invalidateQueries = vi.fn().mockResolvedValue(undefined);
		const queryClient = { invalidateQueries } as Pick<QueryClient, 'invalidateQueries'>;

		mocks.fetch.mockResolvedValue({
			ok: true,
			json: async () => ({ version: 'server-v2', timestamp: 123 })
		});
		mocks.getCachedVersion.mockResolvedValue({ version: 'server-v1', timestamp: 100 });

		await initializePersistence(queryClient as QueryClient);

		expect(mocks.persistQueryClient).toHaveBeenCalledTimes(1);
		expect(mocks.setCachedVersion).toHaveBeenCalledWith('server-v2', 123);
		expect(invalidateQueries).toHaveBeenCalledTimes(2);
		expect(invalidateQueries).toHaveBeenNthCalledWith(1, {
			queryKey: ['compendium']
		});
		expect(invalidateQueries).toHaveBeenNthCalledWith(2, {
			queryKey: ['cache', 'version']
		});
	});

	it('persister restore safely handles malformed persisted cache data', async () => {
		const { initializePersistence } = await loadModule();

		mocks.fetch.mockResolvedValue({
			ok: true,
			json: async () => ({ version: 'same', timestamp: 123 })
		});
		mocks.getCachedVersion.mockResolvedValue({ version: 'same', timestamp: 123 });
		mocks.idbGet.mockResolvedValue('{ this is not valid JSON');

		await initializePersistence({ invalidateQueries: vi.fn() } as Pick<
			QueryClient,
			'invalidateQueries'
		> as QueryClient);

		const persistArgs = mocks.persistQueryClient.mock.calls[0]?.[0];
		expect(persistArgs).toBeDefined();
		const restored = await persistArgs.persister.restoreClient();
		expect(restored).toBeUndefined();
	});
});
