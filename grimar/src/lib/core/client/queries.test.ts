import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchCompendiumList, fetchCompendiumAll, queryKeys } from './queries';

// Mock global fetch
const globalFetch = vi.fn();
global.fetch = globalFetch;

// Mock window location
const originalWindow = global.window;
const mockLocation = {
    href: 'http://localhost:3000/compendium/spells?spellLevel=2&spellSchool=evocation',
    searchParams: new URLSearchParams('spellLevel=2&spellSchool=evocation')
};

describe('queries.ts', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        // @ts-ignore
        global.window = { location: mockLocation };
    });

    afterEach(() => {
        global.window = originalWindow;
    });

    describe('queryKeys', () => {
        it('should generate correct keys', () => {
            expect(queryKeys.compendium.list('spells')).toEqual(['compendium', 'list', 'spells']);
            expect(queryKeys.compendium.detail('spells', 'fireball')).toEqual(['compendium', 'detail', 'spells', 'fireball']);
            expect(queryKeys.compendium.all).toEqual(['compendium']);
        });
    });

    describe('fetchCompendiumList', () => {
        it('should build correct URL with filters from window', async () => {
            globalFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ items: [] })
            });

            await fetchCompendiumList('spells');

            const expectedCall = globalFetch.mock.calls[0][0];
            expect(expectedCall).toContain('/api/compendium/items?');
            expect(expectedCall).toContain('type=spells');
            expect(expectedCall).toContain('spellLevel=2');
            expect(expectedCall).toContain('spellSchool=evocation');
        });

        it('should throw error on failed fetch', async () => {
            globalFetch.mockResolvedValueOnce({
                ok: false,
                statusText: 'Internal Server Error'
            });

            await expect(fetchCompendiumList('spells')).rejects.toThrow('Failed to fetch spells: Internal Server Error');
        });
    });

    describe('fetchCompendiumAll', () => {
        it('should request all items', async () => {
            globalFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ items: [] })
            });

            await fetchCompendiumAll('monsters');

            const expectedCall = globalFetch.mock.calls[0][0];
            expect(expectedCall).toContain('/api/compendium/items?');
            expect(expectedCall).toContain('type=monsters');
            expect(expectedCall).toContain('all=true');
        });
    });
});
