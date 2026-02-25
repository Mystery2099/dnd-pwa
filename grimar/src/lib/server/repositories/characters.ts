import { eq, desc, and } from 'drizzle-orm';
import type { Db } from '$lib/server/db';
import { characters } from '$lib/server/db/schema';
import { createModuleLogger } from '$lib/server/logger';
import { MemoryCache, CacheKeys, getCacheTTL } from '$lib/server/utils/cache';

const log = createModuleLogger('CharacterRepository');

export type CharacterRecord = typeof characters.$inferSelect;
export type CharacterCreateInput = Omit<CharacterRecord, 'id'>;

/**
 * Character Repository
 *
 * Handles database operations for user characters.
 * Uses MemoryCache for improved performance.
 */
export class CharacterRepository {
	private cache = MemoryCache.getInstance();

	/**
	 * List all characters for an owner with caching
	 */
	async listByOwner(db: Db, owner: string): Promise<CharacterRecord[]> {
		const cacheKey = CacheKeys.characterList(owner);
		const cached = this.cache.get<CharacterRecord[]>(cacheKey);
		if (cached) {
			log.debug({ owner, cacheKey }, 'Character list cache hit');
			return cached;
		}
		log.debug({ owner, cacheKey }, 'Character list cache miss');

		const result = await db.query.characters.findMany({
			where: eq(characters.owner, owner),
			orderBy: [desc(characters.id)]
		});

		this.cache.set(cacheKey, result, getCacheTTL('character'));
		return result;
	}

	/**
	 * Get a single character by ID with caching
	 */
	async getCharacter(db: Db, id: number, owner?: string): Promise<CharacterRecord | undefined> {
		const cacheKey = CacheKeys.characterDetail(id, owner);
		const cached = this.cache.get<CharacterRecord | undefined>(cacheKey);
		if (cached !== undefined && cached !== null) {
			log.debug({ id, owner, cacheKey }, 'Character cache hit');
			return cached;
		}
		log.debug({ id, owner, cacheKey }, 'Character cache miss');

		const condition = owner
			? and(eq(characters.id, id), eq(characters.owner, owner))
			: eq(characters.id, id);

		const result = await db.query.characters.findFirst({
			where: condition
		});

		if (result) {
			this.cache.set(cacheKey, result, getCacheTTL('character'));
		}
		return result;
	}

	/**
	 * Create a new character and invalidate cache
	 */
	async createCharacter(db: Db, input: CharacterCreateInput): Promise<CharacterRecord> {
		log.info({ owner: input.owner, name: input.name }, 'Creating character');
		const inserted = await db.insert(characters).values(input).returning();
		const character = inserted[0];
		log.debug({ id: character?.id, name: character?.name }, 'Character created');

		// Invalidate owner's character list cache
		this.invalidateOwnerCache(input.owner);
		return character;
	}

	/**
	 * Invalidate all caches for an owner's character data
	 */
	private invalidateOwnerCache(owner: string): void {
		const listKey = CacheKeys.characterList(owner);
		this.cache.delete(listKey);
		log.debug({ owner }, 'Invalidated character list cache');
	}

	/**
	 * Invalidate a specific character's cache
	 */
	async invalidateCharacter(db: Db, id: number, owner: string): Promise<void> {
		const detailKey = CacheKeys.characterDetail(id, owner);
		this.cache.delete(detailKey);
		this.invalidateOwnerCache(owner);
		log.debug({ id, owner }, 'Invalidated character caches');
	}
}

// Export singleton instance for convenience
export const characterRepository = new CharacterRepository();

// Legacy exports for backward compatibility
export async function listByOwner(db: Db, owner: string): Promise<CharacterRecord[]> {
	return characterRepository.listByOwner(db, owner);
}

export async function getCharacter(
	db: Db,
	id: number,
	owner?: string
): Promise<CharacterRecord | undefined> {
	return characterRepository.getCharacter(db, id, owner);
}

export async function createCharacter(
	db: Db,
	input: CharacterCreateInput
): Promise<CharacterRecord> {
	return characterRepository.createCharacter(db, input);
}
