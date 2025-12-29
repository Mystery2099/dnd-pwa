/**
 * Unified Color Constants
 *
 * Centralized color mappings for compendium types (spells, monsters, items).
 * Consolidates previously scattered color definitions.
 */

// ============================================================================
// Spell School Colors
// ============================================================================

export const SPELL_SCHOOL_COLORS = {
	Evocation: 'text-rose-400 group-hover:border-rose-500/50',
	Abjuration: 'text-sky-400 group-hover:border-sky-500/50',
	Necromancy: 'text-emerald-400 group-hover:border-emerald-500/50',
	Illusion: 'text-purple-400 group-hover:border-purple-500/50',
	Divination: 'text-amber-400 group-hover:border-amber-500/50',
	Enchantment: 'text-pink-400 group-hover:border-pink-500/50',
	Conjuration: 'text-orange-400 group-hover:border-orange-500/50',
	Transmutation: 'text-teal-400 group-hover:border-teal-500/50',
	default: 'text-gray-400 group-hover:border-gray-500/50'
} as const;

export const SPELL_SCHOOL_TEXT_COLORS = {
	Evocation: 'text-rose-400',
	Abjuration: 'text-sky-400',
	Necromancy: 'text-emerald-400',
	Illusion: 'text-purple-400',
	Divination: 'text-amber-400',
	Enchantment: 'text-pink-400',
	Conjuration: 'text-orange-400',
	Transmutation: 'text-teal-400',
	default: 'text-purple-400'
} as const;

// ============================================================================
// Monster Type Colors
// ============================================================================

export const MONSTER_TYPE_COLORS = {
	Dragon: 'text-rose-400 group-hover:border-rose-500/50',
	Undead: 'text-emerald-400 group-hover:border-emerald-500/50',
	Fiend: 'text-red-400 group-hover:border-red-500/50',
	Celestial: 'text-amber-400 group-hover:border-amber-500/50',
	Fey: 'text-pink-400 group-hover:border-pink-500/50',
	Aberration: 'text-purple-400 group-hover:border-purple-500/50',
	Elemental: 'text-cyan-400 group-hover:border-cyan-500/50',
	Beast: 'text-orange-400 group-hover:border-orange-500/50',
	Monstrosity: 'text-teal-400 group-hover:border-teal-500/50',
	Construct: 'text-gray-400 group-hover:border-gray-500/50',
	Giant: 'text-stone-400 group-hover:border-stone-500/50',
	Humanoid: 'text-slate-400 group-hover:border-slate-500/50',
	Ooze: 'text-lime-400 group-hover:border-lime-500/50',
	Plant: 'text-green-400 group-hover:border-green-500/50',
	default: 'text-gray-400 group-hover:border-gray-500/50'
} as const;

export const MONSTER_TYPE_TEXT_COLORS = {
	Dragon: 'text-rose-400',
	Undead: 'text-emerald-400',
	Fiend: 'text-red-400',
	Celestial: 'text-amber-400',
	Fey: 'text-pink-400',
	Aberration: 'text-purple-400',
	Elemental: 'text-cyan-400',
	Beast: 'text-orange-400',
	Monstrosity: 'text-teal-400',
	Construct: 'text-gray-400',
	Giant: 'text-stone-400',
	Humanoid: 'text-slate-400',
	Ooze: 'text-lime-400',
	Plant: 'text-green-400',
	default: 'text-gray-400'
} as const;

// ============================================================================
// Default Colors
// ============================================================================

export const DEFAULT_COLOR = 'text-gray-400 group-hover:border-gray-500/50';
export const DEFAULT_TEXT_COLOR = 'text-gray-400';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a color mapping object for filter values
 */
export function colorMap(colorName: string): { base: string; hover: string } {
	const colorMap: Record<string, { base: string; hover: string }> = {
		purple: { base: 'text-purple-400', hover: 'group-hover:border-purple-500/50' },
		rose: { base: 'text-rose-400', hover: 'group-hover:border-rose-500/50' },
		sky: { base: 'text-sky-400', hover: 'group-hover:border-sky-500/50' },
		emerald: { base: 'text-emerald-400', hover: 'group-hover:border-emerald-500/50' },
		amber: { base: 'text-amber-400', hover: 'group-hover:border-amber-500/50' },
		pink: { base: 'text-pink-400', hover: 'group-hover:border-pink-500/50' },
		orange: { base: 'text-orange-400', hover: 'group-hover:border-orange-500/50' },
		teal: { base: 'text-teal-400', hover: 'group-hover:border-teal-500/50' },
		red: { base: 'text-red-400', hover: 'group-hover:border-red-500/50' },
		cyan: { base: 'text-cyan-400', hover: 'group-hover:border-cyan-500/50' },
		gray: { base: 'text-gray-400', hover: 'group-hover:border-gray-500/50' },
		lime: { base: 'text-lime-400', hover: 'group-hover:border-lime-500/50' },
		green: { base: 'text-green-400', hover: 'group-hover:border-green-500/50' },
		stone: { base: 'text-stone-400', hover: 'group-hover:border-stone-500/50' },
		slate: { base: 'text-slate-400', hover: 'group-hover:border-slate-500/50' }
	};
	return colorMap[colorName] || colorMap.gray;
}

/**
 * Get list item color from a color mapping object
 */
export function getListItemColor(value: string, colorMap: Record<string, string>): string {
	return colorMap[value] || DEFAULT_COLOR;
}
