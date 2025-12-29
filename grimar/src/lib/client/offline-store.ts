/**
 * Offline Store - IndexedDB wrapper for offline PWA functionality
 *
 * This module re-exports operations from offline-db.ts for backward compatibility.
 */

export {
	getDb,
	getItem,
	getItemsByType,
	getAllItems,
	searchItems,
	seedItems,
	getItemStats,
	getCharacters,
	getCharacter,
	saveCharacter,
	updateCharacter,
	deleteCharacter,
	queueMutation,
	getPendingMutations,
	clearMutation,
	clearAllMutations,
	getLastSync,
	setLastSync,
	needsSync,
	clearAll,
	getStorageUsage
} from './offline-db';

export type { DbItem, DbCharacter, DbMutation, DbSyncState, ItemStats } from './offline-db';
