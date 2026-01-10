/**
 * Compendium Configuration Helper Functions
 *
 * Shared utility functions for compendium type configurations.
 */

import type { CompendiumItem } from '$lib/core/types/compendium';
import { colorMap, getListItemColor, DEFAULT_COLOR } from '$lib/core/constants/colors';

/**
 * Extract school name from spell details
 */
export function getSpellSchool(item: CompendiumItem): string {
	const details = item.details;
	if (!details) return 'Unknown';
	const school = (details as Record<string, unknown>).school;
	if (typeof school === 'string') return school;
	if (school && typeof school === 'object' && 'name' in school) {
		return String(school.name);
	}
	return 'Unknown';
}

/**
 * Get spell level formatted as text
 */
export function getSpellLevelText(item: CompendiumItem): string {
	return item.spellLevel === 0 ? 'Cantrip' : `Level ${item.spellLevel}`;
}

// Re-export color utilities
export { colorMap, getListItemColor, DEFAULT_COLOR };
