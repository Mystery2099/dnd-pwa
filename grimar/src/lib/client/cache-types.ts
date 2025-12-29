/**
 * Client Cache Types
 */

export interface CacheStats {
	total: number;
	used: number;
	available: number;
	percentage: number;
	compressionRatio: number;
}
