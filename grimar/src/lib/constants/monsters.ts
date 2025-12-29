// Monster types from Open5e API
export const MONSTER_TYPES = [
	'Aberration',
	'Beast',
	'Celestial',
	'Construct',
	'Dragon',
	'Elemental',
	'Fey',
	'Fiend',
	'Giant',
	'Humanoid',
	'Monstrosity',
	'Ooze',
	'Plant',
	'Undead'
] as const;

// Monster sizes
export const MONSTER_SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'] as const;

// Re-export colors from centralized location
export {
	MONSTER_TYPE_COLORS as TYPE_COLORS,
	MONSTER_TYPE_TEXT_COLORS as TYPE_TEXT_COLORS
} from './colors';

export type MonsterType = (typeof MONSTER_TYPES)[number];
export type MonsterSize = (typeof MONSTER_SIZES)[number];
