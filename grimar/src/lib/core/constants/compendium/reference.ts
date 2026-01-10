/**
 * Generic Reference Config
 *
 * Minimal configuration for reference data types that don't need complex UI.
 */

import { BookOpen } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/core/types/compendium';

function createGenericConfig(type: string, displayName: string, color: string): CompendiumTypeConfig {
	return {
		routes: {
			basePath: `/compendium/${type}`,
			dbType: type as any,
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
			displayNamePlural: displayName + 's',
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

// Reference data configs
export const SKILLS_CONFIG = createGenericConfig('skill', 'Skill', 'cyan');
export const LANGUAGES_CONFIG = createGenericConfig('language', 'Language', 'yellow');
export const ALIGNMENTS_CONFIG = createGenericConfig('alignment', 'Alignment', 'violet');
export const PROFICIENCIES_CONFIG = createGenericConfig('proficiency', 'Proficiency', 'green');
export const ABILITY_SCORES_CONFIG = createGenericConfig('abilityScore', 'Ability Score', 'red');
export const DAMAGE_TYPES_CONFIG = createGenericConfig('damageType', 'Damage Type', 'red');
export const MAGIC_SCHOOLS_CONFIG = createGenericConfig('magicSchool', 'Magic School', 'purple');
export const EQUIPMENT_CONFIG = createGenericConfig('equipment', 'Equipment', 'amber');
export const WEAPON_PROPERTIES_CONFIG = createGenericConfig('weaponProperty', 'Weapon Property', 'orange');
export const EQUIPMENT_CATEGORIES_CONFIG = createGenericConfig('equipmentCategory', 'Equipment Category', 'amber');
export const VEHICLES_CONFIG = createGenericConfig('vehicle', 'Vehicle', 'slate');
export const MONSTER_TYPES_CONFIG = createGenericConfig('monsterType', 'Monster Type', 'zinc');
export const RULES_CONFIG = createGenericConfig('rule', 'Rule', 'gray');
export const RULE_SECTIONS_CONFIG = createGenericConfig('ruleSection', 'Rule Section', 'gray');
export const FEATURES_CONFIG = createGenericConfig('feature', 'Feature', 'blue');
