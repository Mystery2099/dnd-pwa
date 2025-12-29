import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HomebrewProvider } from './homebrew';

const mocks = vi.hoisted(() => ({
	existsSync: vi.fn(),
	readFileSync: vi.fn()
}));

vi.mock('fs', async (importOriginal) => {
	const actual = await importOriginal<typeof import('fs')>();
	return {
		...actual,
		existsSync: mocks.existsSync,
		readFileSync: mocks.readFileSync,
		default: {
			...actual.default,
			existsSync: mocks.existsSync,
			readFileSync: mocks.readFileSync
		}
	};
});

describe('HomebrewProvider', () => {
	let provider: HomebrewProvider;

	beforeEach(() => {
		provider = new HomebrewProvider('data/homebrew');
		vi.clearAllMocks();
	});

	describe('fetchList', () => {
		it('should load items from json file', async () => {
			mocks.existsSync.mockReturnValue(true);
			const mockData = [{ slug: 'fireball-hb', name: 'Fireball (HB)', level: 3 }];
			mocks.readFileSync.mockReturnValue(JSON.stringify(mockData));

			const response = await provider.fetchList('spell');

			expect(response.items).toHaveLength(1);
			expect(response.items[0]).toMatchObject({ slug: 'fireball-hb' });
			expect(mocks.existsSync).toHaveBeenCalled();
			expect(mocks.readFileSync).toHaveBeenCalled();
		});

		it('should return empty list if file not found', async () => {
			mocks.existsSync.mockReturnValue(false);

			const response = await provider.fetchList('spell');

			expect(response.items).toHaveLength(0);
		});
	});
});
