import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listUserCharacters, loadCharacter, createUserCharacter } from './service';
import * as charactersRepo from '$lib/server/repositories/characters';

// Mock the db module
const { mockDb } = vi.hoisted(() => {
	return {
		mockDb: {
			select: vi.fn(),
			insert: vi.fn()
		}
	};
});

vi.mock('$lib/server/db', () => ({
	getDb: vi.fn().mockResolvedValue(mockDb)
}));

describe('CharactersService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listUserCharacters', () => {
		it('should return characters for a user', async () => {
			const mockCharacters = [
				{ id: 1, name: 'Gandalf', owner: 'testuser' },
				{ id: 2, name: 'Frodo', owner: 'testuser' }
			];
			vi.spyOn(charactersRepo, 'listByOwner').mockReturnValue(mockCharacters as any);

			const result = await listUserCharacters('testuser');

			expect(result).toHaveLength(2);
			expect(result[0].name).toBe('Gandalf');
		});

		it('should return empty array when user has no characters', async () => {
			vi.spyOn(charactersRepo, 'listByOwner').mockReturnValue([] as any);

			const result = await listUserCharacters('testuser');

			expect(result).toEqual([]);
		});
	});

	describe('loadCharacter', () => {
		it('should load a character by id', async () => {
			const mockCharacter = { id: 1, name: 'Gandalf', owner: 'testuser' };
			vi.spyOn(charactersRepo, 'getCharacter').mockReturnValue(mockCharacter as any);

			const result = await loadCharacter(1, 'testuser');

			expect(result).toEqual(mockCharacter);
		});

		it('should return null for non-existent character', async () => {
			vi.spyOn(charactersRepo, 'getCharacter').mockReturnValue(null);

			const result = await loadCharacter(999, 'testuser');

			expect(result).toBeNull();
		});
	});

	describe('createUserCharacter', () => {
		it('should create a new character with owner', async () => {
			const payload = { name: 'Aragorn', class: 'Ranger', level: 5 };
			const mockCreated = { id: 3, owner: 'testuser', ...payload };
			vi.spyOn(charactersRepo, 'createCharacter').mockReturnValue(mockCreated as any);

			const result = await createUserCharacter('testuser', payload);

			expect(result.name).toBe('Aragorn');
			expect(result.owner).toBe('testuser');
		});
	});
});
