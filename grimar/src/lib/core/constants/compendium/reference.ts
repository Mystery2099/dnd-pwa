/**
 * Generic Reference Config
 *
 * Minimal configuration for reference data types that don't need complex UI.
 * Also exports createGenericConfig for reuse across compendium configs.
 */

import { BookOpen } from 'lucide-svelte';
import type { CompendiumTypeConfig, CompendiumTypeName } from '$lib/core/types/compendium';

export function createGenericConfig(
	type: string,
	displayName: string,
	color: string
): CompendiumTypeConfig {
	return {
		routes: {
			basePath: `/compendium/${type}`,
			dbType: type as CompendiumTypeName,
			storageKeyFilters: `${type}-filters`,
			storageKeyListUrl: `${type}-list-url`
		},
		filters: [],
		sorting: {
			default: {
				label: 'Name (A-Z)',
				value: 'name-asc',
				column: 'name',
				direction: 'asc'
			},
			options: [
				{ label: 'Name (A-Z)', value: 'name-asc', column: 'name', direction: 'asc' },
				{ label: 'Name (Z-A)', value: 'name-desc', column: 'name', direction: 'desc' }
			]
		},
		ui: {
			displayName,
			icon: BookOpen,
			categoryGradient: `from-${color}-500/20 to-${color}-600/20`,
			categoryAccent: `text-${color}-400`,
			emptyState: {
				title: `No ${displayName.toLowerCase()}s found`,
				description: 'Try adjusting your filters to find what you are looking for.'
			},
			databaseEmptyState: {
				title: `No ${displayName}s in Compendium`,
				description: `The ${displayName.toLowerCase()} database appears to be empty. Sync data from the SRD API to populate it.`,
				ctaText: `Sync ${displayName}s`,
				ctaLink: '/compendium/sync'
			}
		},
		display: {
			subtitle: () => displayName,
			tags: () => [],
			listItemAccent: () => `text-${color}-400`,
			detailAccent: () => `text-${color}-400`,
			metaDescription: () => ''
		}
	};
}

// Reference data configs (Open5e API v2 names)
export const SKILLS_CONFIG = createGenericConfig('skills', 'Skill', 'cyan');
export const LANGUAGES_CONFIG = createGenericConfig('languages', 'Language', 'yellow');
export const ALIGNMENTS_CONFIG = createGenericConfig('alignments', 'Alignment', 'violet');
export const PROFICIENCIES_CONFIG = createGenericConfig('proficiencies', 'Proficiency', 'green');
export const ABILITY_SCORES_CONFIG = createGenericConfig('abilities', 'Ability Score', 'red');
export const DAMAGE_TYPES_CONFIG = createGenericConfig('damagetypes', 'Damage Type', 'red');
export const MAGIC_SCHOOLS_CONFIG = createGenericConfig('spellschools', 'Magic School', 'purple');
export const EQUIPMENT_CONFIG = createGenericConfig('equipment', 'Equipment', 'amber');
export const WEAPON_PROPERTIES_CONFIG = createGenericConfig(
	'weaponproperties',
	'Weapon Property',
	'orange'
);
export const EQUIPMENT_CATEGORIES_CONFIG = createGenericConfig(
	'itemcategories',
	'Equipment Category',
	'amber'
);
export const VEHICLES_CONFIG = createGenericConfig('vehicles', 'Vehicle', 'slate');
export const MONSTER_TYPES_CONFIG = createGenericConfig('creaturetypes', 'Monster Type', 'zinc');
export const RULES_CONFIG = createGenericConfig('rules', 'Rule', 'gray');
export const RULE_SECTIONS_CONFIG = createGenericConfig('rulesections', 'Rule Section', 'gray');
export const FEATURES_CONFIG = createGenericConfig('features', 'Feature', 'blue');
