/**
 * Compendium Filter Configuration
 *
 * Shared filter configuration interface used by both server (constants)
 * and client (stores) code.
 */

export interface CompendiumFilterConfig {
	// Maps URL parameter name to internal state key
	// Example: { 'levels': 'level', 'schools': 'school' }
	setParams: Record<string, string>;
	// Valid sortBy options for validation (optional)
	validSortBy?: string[];
	// Default sort values (optional)
	defaults?: {
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
	};
}
