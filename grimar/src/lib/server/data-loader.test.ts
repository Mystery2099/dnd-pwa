import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadDetails, loadAllDetails } from './data-loader';

const mocks = vi.hoisted(() => ({
	existsSync: vi.fn(),
	readFileSync: vi.fn(),
	readdirSync: vi.fn()
}));

vi.mock('fs', async (importOriginal) => {
	const actual = await importOriginal<typeof import('fs')>();
	return {
		...actual,
		existsSync: mocks.existsSync,
		readFileSync: mocks.readFileSync,
		readdirSync: mocks.readdirSync,
		default: {
			...actual.default,
			existsSync: mocks.existsSync,
			readFileSync: mocks.readFileSync,
			readdirSync: mocks.readdirSync
		}
	};
});

describe('DataLoader', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('loadDetails', () => {
		it('should load and parse JSON file', async () => {
			mocks.existsSync.mockReturnValue(true);
			const mockData = { name: 'Fireball', damage: '8d6' };
			mocks.readFileSync.mockReturnValue(JSON.stringify(mockData));

			const result = await loadDetails('data/compendium/spell/fireball.json');

			expect(result).toEqual(mockData);
			expect(mocks.readFileSync).toHaveBeenCalled();
		});

		it('should throw error if file not found', async () => {
			mocks.existsSync.mockReturnValue(false);

			await expect(loadDetails('nonexistent.json')).rejects.toThrow(
				'Compendium data file not found'
			);
		});

		it('should throw error on invalid JSON', async () => {
			mocks.existsSync.mockReturnValue(true);
			mocks.readFileSync.mockReturnValue('invalid json');

			await expect(loadDetails('data/invalid.json')).rejects.toThrow('Invalid JSON');
		});
	});

	describe('loadAllDetails', () => {
		it('should load all json files in type directory', async () => {
			mocks.existsSync.mockReturnValue(true);
			mocks.readdirSync.mockReturnValue(['item1.json', 'item2.json', 'other.txt']);

			mocks.readFileSync
				.mockReturnValueOnce(JSON.stringify({ id: 1 }))
				.mockReturnValueOnce(JSON.stringify({ id: 2 }));

			const results = await loadAllDetails('spell');

			expect(results.size).toBe(2);
			expect(results.get('item1')).toEqual({ id: 1 });
			expect(results.get('item2')).toEqual({ id: 2 });
		});

		it('should return empty map if directory not found', async () => {
			mocks.existsSync.mockReturnValue(false);

			const results = await loadAllDetails('monster');

			expect(results.size).toBe(0);
		});
	});
});
