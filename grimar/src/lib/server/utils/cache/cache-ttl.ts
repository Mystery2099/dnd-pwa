/**
 * Cache TTL
 *
 * Time-to-live values for different cache types.
 */

export function getCacheTTL(type: string): number {
	switch (type) {
		case 'compendium':
			return 600000; // 10 minutes
		case 'character':
			return 300000; // 5 minutes for character data
		case 'search':
			return 300000; // 5 minutes
		default:
			return 300000; // 5 minutes
	}
}
