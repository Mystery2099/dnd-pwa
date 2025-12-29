/**
 * Cache Entry Types
 */

export interface CacheEntry<T = unknown> {
	data: T;
	expires: number;
	ttl: number;
}

export interface CacheStats {
	used: number;
	max: number;
	percentage: number;
}

export interface CacheOptions {
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	filterLogic?: 'and' | 'or';
	offset?: number;
	limit?: number;
	search?: string;
	levels?: string;
	schools?: string;
}
