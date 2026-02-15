import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compendiumService } from './service';

// ============================================================================
// Mock Setup - Must be at top level and use vi.hoisted
// ============================================================================

const { mockDb } = vi.hoisted(() => {
	return {
		mockDb: {
			$count: vi.fn(),
			select: vi.fn().mockReturnThis(),
			from: vi.fn().mockReturnThis(),
			where: vi.fn().mockReturnThis(),
			orderBy: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			offset: vi.fn().mockReturnThis(),
			all: vi.fn(),
			query: {
				compendiumItems: {
					findFirst: vi.fn()
				}
			}
		}
	};
});

vi.mock('$lib/server/db', () => ({
	getDb: vi.fn().mockResolvedValue(mockDb)
}));

// Sample mock data
const mockSpellItem = {
	id: 1,
	name: 'Fireball',
	source: 'open5e',
	type: 'spell' as const,
	externalId: 'fireball',
	summary: 'A bright streak flashes from your pointing finger.',
	details: {
		desc: ['A bright streak flashes from your pointing finger...'],
		casting_time: '1 action',
		range: '150 feet',
		components: ['V', 'S', 'M'],
		material: 'A small ball of bat guano and sulfur',
		duration: 'Instantaneous',
		concentration: false,
		ritual: false,
		classes: ['Wizard', 'Sorcerer'],
		school: 'Evocation'
	},
	spellLevel: 3,
	spellSchool: 'Evocation',
	challengeRating: null,
	creatureSize: null,
	creatureType: null,
	classHitDie: null,
	raceSize: null,
	raceSpeed: null,
	backgroundFeature: null,
	backgroundSkillProficiencies: null,
	featPrerequisites: null
};

const mockCreatureItem = {
	id: 2,
	name: 'Goblin',
	source: 'open5e',
	type: 'creature' as const,
	externalId: 'goblin',
	summary: 'Small humanoid creature.',
	details: {
		desc: ['The goblin sneers at intruders.'],
		alignment: 'neutral evil',
		armor_class: 15,
		hit_points: 7,
		hit_dice: '2d6',
		speed: { walk: '30 ft.' },
		strength: 8,
		dexterity: 14,
		constitution: 12,
		intelligence: 10,
		wisdom: 8,
		charisma: 8,
		xp: 50,
		proficiencies: [],
		damage_vulnerabilities: [],
		damage_resistances: [],
		damage_immunities: [],
		condition_immunities: [],
		senses: {},
		languages: 'Common Goblin',
		special_abilities: [],
		actions: []
	},
	spellLevel: null,
	spellSchool: null,
	challengeRating: '1/4',
	creatureSize: 'Small',
	creatureType: 'humanoid',
	classHitDie: null,
	raceSize: null,
	raceSpeed: null,
	backgroundFeature: null,
	backgroundSkillProficiencies: null,
	featPrerequisites: null
};

describe('CompendiumService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockDb.$count.mockReset();
		mockDb.select.mockReset();
		mockDb.from.mockReset();
		mockDb.where.mockReset();
		mockDb.orderBy.mockReset();
		mockDb.limit.mockReset();
		mockDb.offset.mockReset();
		mockDb.all.mockReset();
		mockDb.query.compendiumItems.findFirst.mockReset();

		// Set up default mock chain to return data (simplified - no pagination)
		(mockDb.select as any).mockImplementation(() => ({
			from: () => ({
				where: () => ({
					orderBy: () => Promise.resolve([mockSpellItem])
				})
			})
		}));

		// Set up FTS mock returns
		mockDb.all.mockImplementation((query: any) => {
			// Mock FTS search results
			if (query.sql && query.sql.includes('compendium_items_fts')) {
				if (query.sql.includes('bm25')) {
					// Ranked search
					return Promise.resolve([{ rowid: 1, rank: 0.5 }]);
				} else {
					// Regular search
					return Promise.resolve([{ rowid: 1 }]);
				}
			}
			// Mock stats queries
			if (query.sql && query.sql.includes('count(*)')) {
				return Promise.resolve([{ count: 1 }]);
			}
			if (query.sql && query.sql.includes('pg_size_approx')) {
				return Promise.resolve([{ size: '1MB' }]);
			}
			return Promise.resolve([]);
		});
	});

	describe('getSpells', () => {
		it('should return spells as array without filters', async () => {
			const result = await compendiumService.getSpells();

			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('Fireball');
		});

		it('should filter by level', async () => {
			const result = await compendiumService.getSpells({ level: 3 });

			expect(result).toHaveLength(1);
			expect(result[0].level).toBe(3);
		});

		it('should filter by school', async () => {
			const result = await compendiumService.getSpells({ school: 'Evocation' });

			expect(result).toHaveLength(1);
		});

		it('should filter by search term', async () => {
			const result = await compendiumService.getSpells({ search: 'fire' });

			expect(result).toHaveLength(1);
		});
	});

	describe('getCreatures', () => {
		it('should return creatures as array without filters', async () => {
			const result = await compendiumService.getCreatures();

			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(1);
		});

		it('should filter by size', async () => {
			const result = await compendiumService.getCreatures({ size: 'Small' });

			expect(result).toHaveLength(1);
		});

		it('should filter by challenge rating', async () => {
			const result = await compendiumService.getCreatures({ cr: '1/4' });

			expect(result).toHaveLength(1);
		});
	});

	describe('getSpellById', () => {
		it('should return a spell by id', async () => {
			mockDb.query.compendiumItems.findFirst.mockResolvedValue(mockSpellItem);

			const result = await compendiumService.getSpellById(1);

			expect(result).not.toBeNull();
			expect(result?.name).toBe('Fireball');
			expect(result?.type).toBe('spell');
		});

		it('should return null for non-existent spell', async () => {
			mockDb.query.compendiumItems.findFirst.mockResolvedValue(null);

			const result = await compendiumService.getSpellById(999);

			expect(result).toBeNull();
		});
	});

	describe('getCreatureById', () => {
		it('should return a creature by id', async () => {
			mockDb.query.compendiumItems.findFirst.mockResolvedValue(mockCreatureItem);

			const result = await compendiumService.getCreatureById(2);

			expect(result).not.toBeNull();
			expect(result?.name).toBe('Goblin');
			expect(result?.type).toBe('creature');
		});

		it('should return null for non-existent creature', async () => {
			mockDb.query.compendiumItems.findFirst.mockResolvedValue(null);

			const result = await compendiumService.getCreatureById(999);

			expect(result).toBeNull();
		});
	});

	describe('getById (generic)', () => {
		it('should return a unified item by type and numeric id', async () => {
			mockDb.query.compendiumItems.findFirst.mockResolvedValue(mockSpellItem);

			const result = await compendiumService.getById('spell', 1);

			expect(result).not.toBeNull();
			expect(result?.name).toBe('Fireball');
		});

		it('should return a unified item by type and slug', async () => {
			mockDb.query.compendiumItems.findFirst.mockResolvedValue(mockSpellItem);

			const result = await compendiumService.getById('spell', 'fireball');

			expect(result).not.toBeNull();
			expect(result?.name).toBe('Fireball');
		});

		it('should return null for non-existent item', async () => {
			mockDb.query.compendiumItems.findFirst.mockResolvedValue(null);

			const result = await compendiumService.getById('spell', 999);

			expect(result).toBeNull();
		});
	});

	describe('getFeats', () => {
		it('should return feats as array', async () => {
			const result = await compendiumService.getFeats();

			expect(Array.isArray(result)).toBe(true);
		});

		it('should filter by search term', async () => {
			const result = await compendiumService.getFeats({ search: 'alert' });

			expect(Array.isArray(result)).toBe(true);
		});
	});

	describe('getBackgrounds', () => {
		it('should return backgrounds as array', async () => {
			const result = await compendiumService.getBackgrounds();

			expect(Array.isArray(result)).toBe(true);
		});
	});

	describe('getRaces', () => {
		it('should return races as array', async () => {
			const result = await compendiumService.getRaces();

			expect(Array.isArray(result)).toBe(true);
		});
	});

	describe('getClasses', () => {
		it('should return classes as array', async () => {
			const result = await compendiumService.getClasses();

			expect(Array.isArray(result)).toBe(true);
		});
	});

	describe('getItems', () => {
		it('should return items as array', async () => {
			const result = await compendiumService.getItems();

			expect(Array.isArray(result)).toBe(true);
		});

		it('should filter by rarity', async () => {
			const result = await compendiumService.getItems({ rarity: 'rare' });

			expect(Array.isArray(result)).toBe(true);
		});
	});

	describe('getByType', () => {
		it('should return items of specified type', async () => {
			const result = await compendiumService.getByType('spell');

			expect(Array.isArray(result)).toBe(true);
			expect(result[0].type).toBe('spell');
		});
	});

	describe('search', () => {
		it('should return search results', async () => {
			// Set up mock chain for search
			(mockDb.select as any).mockImplementation(() => ({
				from: () => ({
					where: () => ({
						limit: () => Promise.resolve([mockSpellItem])
					})
				})
			}));

			const result = await compendiumService.search('fire');

			expect(Array.isArray(result)).toBe(true);
		});

		it('should limit results', async () => {
			// Set up mock chain for search with limit
			(mockDb.select as any).mockImplementation(() => ({
				from: () => ({
					where: () => ({
						limit: () => Promise.resolve([mockSpellItem])
					})
				})
			}));

			const result = await compendiumService.search('fire', 'spell', 5);

			expect(Array.isArray(result)).toBe(true);
		});
	});

	describe('getNavigation', () => {
		it('should return navigation with prev/next', async () => {
			mockDb.query.compendiumItems.findFirst.mockResolvedValue(mockSpellItem);
			mockDb.$count.mockResolvedValue(10);

			// Set up mock for prev/next queries - return empty arrays
			(mockDb.select as any).mockImplementation(() => ({
				from: () => ({
					where: () => ({
						orderBy: () => ({
							limit: () => Promise.resolve([])
						})
					})
				})
			}));

			const result = await compendiumService.getNavigation('spell', 1);

			expect(result.prev).toBeNull();
			expect(result.next).toBeNull();
			// $count returns 10 for both total and itemsBefore, so currentIndex = 10 + 1 = 11
			expect(result.currentIndex).toBe(11);
			expect(result.total).toBe(10);
		});
	});
});
