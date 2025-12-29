/**
 * Offline Database
 *
 * IndexedDB storage for offline PWA functionality.
 * Stores compendium data (spells, monsters, items) and user characters.
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { browser } from '$app/environment';

// ============================================================================
// Types
// ============================================================================

export interface DbItem {
	type: string;
	source: string;
	externalId: string;
	name: string;
	summary: string;
	details: Record<string, unknown>;
	spellLevel?: number;
	spellSchool?: string;
	challengeRating?: string;
	monsterSize?: string;
	monsterType?: string;
	syncStatus: 'synced' | 'pending' | 'created';
	updatedAt: number;
	key?: string;
}

export interface DbCharacter {
	id?: number;
	name: string;
	portraitUrl?: string;
	stats: Record<string, unknown>;
	inventory: Array<Record<string, unknown>>;
	spells: Array<Record<string, unknown>>;
	syncStatus: 'synced' | 'pending' | 'created';
	updatedAt: number;
}

export interface DbMutation {
	id: string;
	type: 'create' | 'update' | 'delete';
	entity: 'character' | 'spell' | 'monster' | 'item';
	payload: Record<string, unknown>;
	timestamp: number;
	retries: number;
}

export interface DbSyncState {
	lastSync: number;
	checksum: string;
	itemCount: number;
}

export interface ItemStats {
	spells: number;
	monsters: number;
	items: number;
}

// ============================================================================
// Schema
// ============================================================================

interface GrimarDB extends DBSchema {
	items: {
		key: string;
		value: DbItem;
		indexes: {
			'by-type': string;
			'by-type-name': [string, string];
			'by-level': [number, string];
			'by-cr': [string, string];
		};
	};
	characters: {
		key: number;
		value: DbCharacter;
		indexes: { 'by-sync': string };
	};
	mutations: {
		key: string;
		value: DbMutation;
		indexes: { 'by-time': number };
	};
	syncState: {
		key: string;
		value: DbSyncState;
	};
}

// ============================================================================
// Database Connection
// ============================================================================

const DB_NAME = 'grimar-offline';
const DB_VERSION = 1;

// Use a single promise with proper chaining to ensure full initialization
let initializingPromise: Promise<IDBPDatabase<GrimarDB>> | null = null;
let dbInstance: IDBPDatabase<GrimarDB> | null = null;

export function getDb(): Promise<IDBPDatabase<GrimarDB>> {
	if (!browser) throw new Error('Offline DB only available in browser');

	// Return cached instance if already resolved
	if (dbInstance) {
		return Promise.resolve(dbInstance);
	}

	// If already initializing, return the same promise (ensures all callers await the same initialization)
	if (initializingPromise) {
		return initializingPromise;
	}

	// Start initialization
	initializingPromise = openDB<GrimarDB>(DB_NAME, DB_VERSION, {
		upgrade(db) {
			// Items store
			if (!db.objectStoreNames.contains('items')) {
				const items = db.createObjectStore('items', { keyPath: 'key' });
				items.createIndex('by-type', 'type');
				items.createIndex('by-type-name', ['type', 'name']);
				items.createIndex('by-level', ['spellLevel', 'type']);
				items.createIndex('by-cr', ['challengeRating', 'type']);
			}

			// Characters store
			if (!db.objectStoreNames.contains('characters')) {
				const chars = db.createObjectStore('characters', { keyPath: 'id', autoIncrement: true });
				chars.createIndex('by-sync', 'syncStatus');
			}

			// Mutations queue
			if (!db.objectStoreNames.contains('mutations')) {
				const mutations = db.createObjectStore('mutations', { keyPath: 'id' });
				mutations.createIndex('by-time', 'timestamp');
			}

			// Sync state
			if (!db.objectStoreNames.contains('syncState')) {
				db.createObjectStore('syncState');
			}
		}
	}).then((db) => {
		// Cache the instance for subsequent calls
		dbInstance = db;
		return db;
	});

	return initializingPromise;
}

// ============================================================================
// Item Operations
// ============================================================================

export async function getItem(type: string, externalId: string): Promise<DbItem | undefined> {
	const db = await getDb();
	return db.get('items', `${type}:${externalId}`);
}

export async function getItemsByType(type: string): Promise<DbItem[]> {
	const db = await getDb();
	return db.getAllFromIndex('items', 'by-type', type);
}

export async function getAllItems(): Promise<DbItem[]> {
	const db = await getDb();
	return db.getAll('items');
}

export async function searchItems(query: string, type?: string): Promise<DbItem[]> {
	const db = await getDb();
	const all = await db.getAll('items');
	const lower = query.toLowerCase();
	return all.filter((item) => {
		if (type && item.type !== type) return false;
		return item.name.toLowerCase().includes(lower) || item.summary.toLowerCase().includes(lower);
	});
}

export async function seedItems(items: DbItem[]): Promise<void> {
	const db = await getDb();
	const tx = db.transaction('items', 'readwrite');
	const store = tx.objectStore('items');

	await store.clear();

	for (const item of items) {
		await store.put({
			...item,
			key: `${item.type}:${item.externalId}`,
			syncStatus: 'synced',
			updatedAt: Date.now()
		} as DbItem);
	}

	await tx.done;
}

export async function getItemStats(): Promise<ItemStats> {
	const db = await getDb();
	const spells = await db.count('items', IDBKeyRange.only('spell'));
	const monsters = await db.count('items', IDBKeyRange.only('monster'));
	const items = await db.count('items', IDBKeyRange.only('item'));
	return { spells, monsters, items };
}

// ============================================================================
// Character Operations
// ============================================================================

export async function getCharacters(): Promise<DbCharacter[]> {
	const db = await getDb();
	return db.getAll('characters');
}

export async function getCharacter(id: number): Promise<DbCharacter | undefined> {
	const db = await getDb();
	return db.get('characters', id);
}

export async function saveCharacter(char: Omit<DbCharacter, 'id' | 'updatedAt'>): Promise<number> {
	const db = await getDb();
	const id = await db.add('characters', { ...char, updatedAt: Date.now() });
	return id as number;
}

export async function updateCharacter(id: number, updates: Partial<DbCharacter>): Promise<void> {
	const db = await getDb();
	const existing = await db.get('characters', id);
	if (!existing) throw new Error(`Character ${id} not found`);
	await db.put('characters', { ...existing, ...updates, updatedAt: Date.now() });
}

export async function deleteCharacter(id: number): Promise<void> {
	const db = await getDb();
	await db.delete('characters', id);
}

// ============================================================================
// Mutation Queue
// ============================================================================

export async function queueMutation(
	mutation: Omit<DbMutation, 'timestamp' | 'retries'>
): Promise<void> {
	const db = await getDb();
	await db.put('mutations', { ...mutation, timestamp: Date.now(), retries: 0 });
}

export async function getPendingMutations(): Promise<DbMutation[]> {
	const db = await getDb();
	return db.getAllFromIndex('mutations', 'by-time');
}

export async function clearMutation(id: string): Promise<void> {
	const db = await getDb();
	await db.delete('mutations', id);
}

export async function clearAllMutations(): Promise<void> {
	const db = await getDb();
	await db.clear('mutations');
}

// ============================================================================
// Sync State
// ============================================================================

export async function getLastSync(): Promise<number | null> {
	const db = await getDb();
	const state = await db.get('syncState', 'items');
	return state?.lastSync ?? null;
}

export async function setLastSync(
	lastSync: number,
	checksum: string,
	itemCount: number
): Promise<void> {
	const db = await getDb();
	await db.put('syncState', { lastSync, checksum, itemCount }, 'items');
}

export async function needsSync(): Promise<boolean> {
	const db = await getDb();
	const state = await db.get('syncState', 'items');
	const pending = await db.count('mutations');
	return pending > 0 || !state;
}

// ============================================================================
// Utilities
// ============================================================================

export async function clearAll(): Promise<void> {
	const db = await getDb();
	await db.clear('items');
	await db.clear('characters');
	await db.clear('mutations');
	await db.delete('syncState', 'items');
}

export async function getStorageUsage(): Promise<{ usage: number; quota: number } | null> {
	if (!navigator.storage?.estimate) return null;
	const est = await navigator.storage.estimate();
	return { usage: est.usage ?? 0, quota: est.quota ?? 0 };
}
