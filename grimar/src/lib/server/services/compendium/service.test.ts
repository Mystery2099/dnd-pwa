import { describe, it, expect, beforeEach, vi } from 'vitest';
import { compendiumService, type CompendiumItem } from './service';

vi.mock('$lib/server/db', () => ({
	getDb: vi.fn()
}));

vi.mock('$lib/server/logger', () => ({
	createModuleLogger: () => ({
		info: vi.fn(),
		error: vi.fn(),
		warn: vi.fn()
	})
}));

const mockItems: CompendiumItem[] = [
	{
		key: 'srd-2014_fireball',
		type: 'spells',
		name: 'Fireball',
		source: 'open5e',
		documentKey: 'srd-2014',
		documentName: 'SRD 5.1',
		gamesystemKey: '5e-2014',
		gamesystemName: '5th Edition (2014)',
		publisherKey: 'wizards-of-the-coast',
		publisherName: 'Wizards of the Coast',
		description: 'A bright streak flashes from your pointing finger...',
		data: { level: 3, school: { name: 'Evocation' } }
	},
	{
		key: 'srd-2014_magic_missile',
		type: 'spells',
		name: 'Magic Missile',
		source: 'open5e',
		documentKey: 'srd-2014',
		documentName: 'SRD 5.1',
		gamesystemKey: '5e-2014',
		gamesystemName: '5th Edition (2014)',
		publisherKey: 'wizards-of-the-coast',
		publisherName: 'Wizards of the Coast',
		description: 'You create three glowing darts of magical force...',
		data: { level: 1, school: { name: 'Evocation' } }
	}
];

describe('CompendiumService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getByKey', () => {
		it('should return item by key', async () => {
			const { getDb } = await import('$lib/server/db');
			const mockDb = {
				query: {
					compendium: {
						findFirst: vi.fn().mockResolvedValue({
							key: 'srd-2014_fireball',
							type: 'spells',
							name: 'Fireball',
							source: 'open5e',
							documentKey: 'srd-2014',
							documentName: 'SRD 5.1',
							gamesystemKey: '5e-2014',
							gamesystemName: '5th Edition (2014)',
							publisherKey: 'wizards-of-the-coast',
							publisherName: 'Wizards of the Coast',
							description: 'A bright streak...',
							data: { level: 3 }
						})
					}
				}
			};
			(getDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);

			const result = await compendiumService.getByKey('srd-2014_fireball');

			expect(result).not.toBeNull();
			expect(result?.key).toBe('srd-2014_fireball');
			expect(result?.name).toBe('Fireball');
		});

		it('should return null for non-existent key', async () => {
			const { getDb } = await import('$lib/server/db');
			const mockDb = {
				query: {
					compendium: {
						findFirst: vi.fn().mockResolvedValue(null)
					}
				}
			};
			(getDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);

			const result = await compendiumService.getByKey('nonexistent');

			expect(result).toBeNull();
		});
	});

	describe('getByType', () => {
		it('should return items filtered by type', async () => {
			const { getDb } = await import('$lib/server/db');
			const mockSelect = vi.fn().mockReturnThis();
			const mockFrom = vi.fn().mockReturnThis();
			const mockWhere = vi.fn().mockReturnThis();
			const mockOrderBy = vi.fn().mockResolvedValue([
				{ key: 'srd-2014_fireball', type: 'spells', name: 'Fireball', source: 'open5e', documentKey: null, documentName: null, gamesystemKey: null, gamesystemName: null, publisherKey: null, publisherName: null, description: null, data: {} },
				{ key: 'srd-2014_magic_missile', type: 'spells', name: 'Magic Missile', source: 'open5e', documentKey: null, documentName: null, gamesystemKey: null, gamesystemName: null, publisherKey: null, publisherName: null, description: null, data: {} }
			]);

			const mockDb = {
				select: mockSelect,
				from: mockFrom,
				where: mockWhere,
				orderBy: mockOrderBy
			};
			(getDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);

			const result = await compendiumService.getByType('spells');

			expect(result).toHaveLength(2);
			expect(result[0].type).toBe('spells');
		});
	});

	describe('search', () => {
		it('should search items by name', async () => {
			const { getDb } = await import('$lib/server/db');
			const mockSelect = vi.fn().mockReturnThis();
			const mockFrom = vi.fn().mockReturnThis();
			const mockWhere = vi.fn().mockReturnThis();
			const mockLimit = vi.fn().mockReturnThis();
			const mockOrderBy = vi.fn().mockResolvedValue([
				{ key: 'srd-2014_fireball', type: 'spells', name: 'Fireball', source: 'open5e', documentKey: null, documentName: null, gamesystemKey: null, gamesystemName: null, publisherKey: null, publisherName: null, description: null, data: {} }
			]);

			const mockDb = {
				select: mockSelect,
				from: mockFrom,
				where: mockWhere,
				limit: mockLimit,
				orderBy: mockOrderBy
			};
			(getDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);

			const result = await compendiumService.search('Fire');

			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('Fireball');
		});
	});

	describe('getCount', () => {
		it('should return count of items', async () => {
			const { getDb } = await import('$lib/server/db');
			const mockDb = {
				$count: vi.fn().mockResolvedValue(42)
			};
			(getDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);

			const result = await compendiumService.getCount('spells');

			expect(result).toBe(42);
		});
	});

	describe('getTypes', () => {
		it('should return distinct types with counts', async () => {
			const { getDb } = await import('$lib/server/db');
			const mockSelect = vi.fn().mockReturnThis();
			const mockFrom = vi.fn().mockReturnThis();
			const mockGroupBy = vi.fn().mockReturnThis();
			const mockOrderBy = vi.fn().mockResolvedValue([
				{ type: 'spells', count: 100 },
				{ type: 'creatures', count: 50 }
			]);

			const mockDb = {
				select: mockSelect,
				from: mockFrom,
				groupBy: mockGroupBy,
				orderBy: mockOrderBy
			};
			(getDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);

			const result = await compendiumService.getTypes();

			expect(result).toHaveLength(2);
			expect(result[0].type).toBe('spells');
			expect(result[0].count).toBe(100);
		});
	});
});
