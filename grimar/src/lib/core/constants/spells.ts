export const SPELL_LEVELS = [
	'Cantrip',
	'1st',
	'2nd',
	'3rd',
	'4th',
	'5th',
	'6th',
	'7th',
	'8th',
	'9th'
] as const;

export const SPELL_SCHOOLS = [
	'Abjuration',
	'Conjuration',
	'Divination',
	'Enchantment',
	'Evocation',
	'Illusion',
	'Necromancy',
	'Transmutation'
] as const;

// Re-export colors from centralized location
export {
	SPELL_SCHOOL_COLORS as SCHOOL_COLORS,
	SPELL_SCHOOL_TEXT_COLORS as SCHOOL_TEXT_COLORS
} from './colors';

export type SpellLevel = (typeof SPELL_LEVELS)[number];
export type SpellSchool = (typeof SPELL_SCHOOLS)[number];
