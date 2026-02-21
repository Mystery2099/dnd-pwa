/**
 * Slug utility functions for URL generation and item lookup.
 */

/**
 * Strip the source prefix from an externalId/slug.
 * Open5e items have externalId format: {source}_{item-slug}
 * e.g., "deepm_abhorrent-apparition" -> "abhorrent-apparition"
 * e.g., "srd_fireball" -> "fireball"
 */
export function stripSlugPrefix(
	externalId: string | null | undefined,
	_sourceBook?: string | null
): string | null {
	if (!externalId) return null;
	const underscoreIndex = externalId.indexOf('_');
	if (underscoreIndex === -1) return externalId;
	return externalId.slice(underscoreIndex + 1);
}

/**
 * Reconstruct the full externalId by prepending the sourceBook prefix.
 * e.g., ("abhorrent-apparition", "deepm") -> "deepm_abhorrent-apparition"
 * Special case: srd-2014 items use "srd_" prefix (not "srd-2014_")
 */
export function buildExternalId(slug: string, sourceBook: string): string {
	if (slug.startsWith(`${sourceBook}_`)) {
		return slug;
	}
	const prefix = sourceBook === 'srd-2014' ? 'srd' : sourceBook;
	return `${prefix}_${slug}`;
}
