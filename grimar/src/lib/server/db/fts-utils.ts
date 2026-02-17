/**
 * FTS Utilities
 *
 * Shared utilities for full-text search extraction.
 * Used by both the server and CLI scripts.
 */

/**
 * Extract searchable strings from a value (string or array of strings)
 */
export function extractStrings(value: unknown): string[] {
	if (typeof value === 'string') return [value];
	if (Array.isArray(value)) {
		return value.flatMap((item) => (typeof item === 'string' ? item : ''));
	}
	return [];
}

/**
 * Extract description strings from action-like objects
 */
export function extractActionStrings(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value
		.flatMap((item) => {
			if (typeof item === 'object' && item && 'desc' in item) {
				const desc = (item as { desc: unknown }).desc;
				return typeof desc === 'string' ? desc : '';
			}
			return '';
		})
		.filter(Boolean);
}

/**
 * Extract searchable content from details JSON
 */
export function extractSearchableContent(details: Record<string, unknown>): string {
	const parts: string[] = [];

	// Generic description fields
	parts.push(...extractStrings(details.description));

	// Action-like fields (contain desc property)
	parts.push(
		...extractActionStrings(details.actions),
		...extractActionStrings(details.specialAbilities),
		...extractActionStrings(details.reactions),
		...extractActionStrings(details.legendaryActions),
		...extractActionStrings(details.lairActions),
		...extractActionStrings(details.regionalEffects),
		...extractActionStrings(details.mythicEncounter)
	);

	// Simple string fields
	parts.push(
		...extractStrings(details.higherLevel),
		...extractStrings(details.material),
		...extractStrings(details.properties),
		...extractStrings(details.desc),
		...extractStrings(details.subclassFlavor),
		...extractStrings(details.traits),
		...extractStrings(details.bond),
		...extractStrings(details.flaws),
		...extractStrings(details.ideals),
		...extractStrings(details.personalityTraits)
	);

	// Features and grants arrays
	if (Array.isArray(details.features)) {
		parts.push(
			...details.features.flatMap((f: unknown) =>
				extractStrings((f as { description?: unknown }).description)
			)
		);
	}
	if (Array.isArray(details.grants)) {
		parts.push(...extractStrings(details.grants));
	}

	return parts.join(' ');
}

/**
 * Build searchable content from item fields
 */
export function buildSearchableContent(
	details: Record<string, unknown>,
	content: string | null
): string {
	const searchableContent = extractSearchableContent(details);
	if (content) {
		return searchableContent + ' ' + content;
	}
	return searchableContent;
}
