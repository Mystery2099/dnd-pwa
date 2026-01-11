/**
 * Normalized Compendium Types
 *
 * Type definitions for normalized data structures used across all providers.
 * These types define the canonical shape for compendium items after transformation
 * from provider-specific formats (Open5e, SRD, homebrew).
 *
 * The normalization process:
 * 1. Raw data is fetched from providers
 * 2. Provider-specific fields are mapped to normalized fields
 * 3. Data is validated and cleaned
 * 4. Items are deduplicated by source + externalId
 * 5. Normalized items are inserted into the database
 *
 * @module normalized
 */

import type { Open5eSpell, Open5eCreature as Open5eMonster, Open5eItem } from './schemas';
import type {
	SrdSpell,
	SrdMonsterDetail,
	SrdCondition,
	SrdSkill,
	SrdLanguage,
	SrdAbilityScore,
	SrdProficiency,
	SrdDamageType,
	SrdMagicSchool,
	SrdEquipment,
	SrdSubclass,
	SrdSubrace,
	SrdTrait,
	SrdRuleSection,
	SrdRule
} from './schemas';

// ============================================================================
// Slug Utilities
// ============================================================================

/**
 * Generate a URL-friendly slug from a string
 * Converts to lowercase, replaces spaces with hyphens, removes special chars
 */
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^\w\-]+/g, '')
		.replace(/\-\-+/g, '-')
		.replace(/^-+/, '')
		.replace(/-+$/, '');
}

/**
 * Create a unique slug from a name, ensuring uniqueness
 */
export function createSlug(name: string, suffix?: string): string {
	let slug = slugify(name);
	if (suffix) {
		slug = `${slug}-${suffix}`;
	}
	return slug;
}

// ============================================================================
// Base Normalized Types
// ============================================================================

/**
 * Base interface for all normalized compendium items
 */
export interface BaseNormalizedItem {
	/** Unique identifier from the source provider */
	externalId: string;
	/** Display name */
	name: string;
	/** URL-friendly identifier */
	slug: string;
	/** Brief description for list views */
	summary: string;
	/** Full description as array of paragraphs */
	description: string[];
	/** Data source (e.g., 'open5e', 'srd', 'homebrew') */
	source: string;
	/** Edition: 2014 | 2024 | null */
	edition: '2014' | '2024' | null;
	/** Source book (e.g., 'PHB', 'XGE') */
	sourceBook: string | null;
}

// ============================================================================
// Spell
// ============================================================================

export interface NormalizedSpell extends BaseNormalizedItem {
	type: 'spell';
	/** Spell level (0 = cantrip, 1-9 = spell levels) */
	spellLevel: number;
	/** School name (e.g., 'Evocation', 'Necromancy') */
	spellSchool: string;
	/** Casting time (e.g., '1 action', '10 minutes') */
	castingTime: string;
	/** Range (e.g., '120 feet', 'Self', 'Touch') */
	range: string;
	/** Components required (e.g., ['V', 'S', 'M']) */
	components: string[];
	/** Material component description if applicable */
	material: string | null;
	/** Duration (e.g., 'Concentration, up to 1 hour') */
	duration: string;
	/** Whether concentration is required */
	concentration: boolean;
	/** Whether this can be cast as a ritual */
	ritual: boolean;
	/** Higher level description */
	higherLevel: string | null;
	/** Spell classes that have this spell */
	classes: string[];
	/** Spell subclasses (e.g., 'Eldritch Knight') */
	subclasses: string[];
}

/**
 * Normalize an Open5e v2 spell to the canonical format
 */
export function normalizeOpen5eSpell(spell: Open5eSpell, source: string): NormalizedSpell {
	const desc = spell.desc ? [spell.desc] : [];
	const higherLevel = spell.higher_level || null;

	// V2 uses boolean flags for components
	const components: string[] = [];
	if (spell.verbal) components.push('V');
	if (spell.somatic) components.push('S');
	if (spell.material) components.push('M');

	const schoolName =
		typeof spell.school === 'string' ? spell.school : spell.school?.name || 'Unknown';

	// V2 uses classes array instead of dnd_class string
	const classes = spell.classes?.map((c) => c.name) || [];

	return {
		type: 'spell',
		externalId: spell.key,
		name: spell.name,
		slug: spell.key,
		summary: desc[0] || '',
		description: desc,
		source,
		edition: null,
		sourceBook: null,
		spellLevel: spell.level,
		spellSchool: schoolName,
		castingTime: spell.casting_time || '1 action',
		range: spell.range_text || 'Self',
		components,
		material: spell.material_specified || null,
		duration: spell.duration || 'Instantaneous',
		concentration: Boolean(spell.concentration),
		ritual: Boolean(spell.ritual),
		higherLevel,
		classes,
		subclasses: []
	};
}

/**
 * Normalize an SRD spell to the canonical format
 */
export function normalizeSrdSpell(spell: SrdSpell, source: string): NormalizedSpell {
	return {
		type: 'spell',
		externalId: spell.index,
		name: spell.name,
		slug: spell.index,
		summary: spell.desc[0] || '',
		description: spell.desc,
		source,
		edition: '2014',
		sourceBook: 'SRD',
		spellLevel: spell.level,
		spellSchool: spell.school.name,
		castingTime: spell.casting_time,
		range: spell.range,
		components: spell.components,
		material: spell.material || null,
		duration: spell.duration,
		concentration: spell.concentration,
		ritual: spell.ritual,
		higherLevel: spell.higher_level?.join('\n') || null,
		classes: spell.classes?.map((c) => c.name) || [],
		subclasses: []
	};
}

// ============================================================================
// Monster
// ============================================================================

export interface NormalizedMonster extends BaseNormalizedItem {
	type: 'monster';
	/** Size category */
	monsterSize: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
	/** Monster type (e.g., 'humanoid', 'dragon') */
	monsterType: string;
	/** Optional subtype */
	subtype: string | null;
	/** Alignment (e.g., 'lawful evil') */
	alignment: string | null;
	/** Armor class */
	armorClass: number;
	/** Hit points */
	hitPoints: number;
	/** Hit dice expression */
	hitDice: string;
	/** Challenge rating (can be fraction like '1/4') */
	challengeRating: string;
	/** XP based on CR */
	xp: number;
}

/**
 * Normalize an Open5e v2 creature to the canonical format
 */
export function normalizeOpen5eMonster(monster: Open5eMonster, source: string): NormalizedMonster {
	const cr = monster.challenge_rating_text || monster.challenge_rating_decimal || '0';

	// V2 uses nested objects for type and size
	const sizeName =
		typeof monster.size === 'string' ? monster.size : (monster.size?.name ?? 'Medium');
	const typeName =
		typeof monster.type === 'string' ? monster.type : (monster.type?.name ?? 'Unknown');

	return {
		type: 'monster',
		externalId: monster.key,
		name: monster.name,
		slug: monster.key,
		summary: `${sizeName} ${typeName}`,
		description: [],
		source,
		edition: null,
		sourceBook: null,
		monsterSize: normalizeSize(sizeName),
		monsterType: typeName,
		subtype: null,
		alignment: monster.alignment || null,
		armorClass: monster.armor_class || 10,
		hitPoints: monster.hit_points ?? 0,
		hitDice: monster.hit_dice || '1d8',
		challengeRating: cr,
		xp: crToXp(cr)
	};
}

/**
 * Normalize an SRD monster to the canonical format
 */
export function normalizeSrdMonster(monster: SrdMonsterDetail, source: string): NormalizedMonster {
	const cr = monster.challenge_rating ?? 0;
	const crString = typeof cr === 'number' ? String(cr) : cr || '0';

	return {
		type: 'monster',
		externalId: monster.index,
		name: monster.name,
		slug: monster.index,
		summary: `${monster.size} ${monster.type}`,
		description: [],
		source,
		edition: '2014',
		sourceBook: 'SRD',
		monsterSize: normalizeSize(monster.size),
		monsterType: monster.type,
		subtype: monster.subtype || null,
		alignment: monster.alignment || null,
		armorClass: Array.isArray(monster.armor_class)
			? monster.armor_class[0]?.value || 10
			: monster.armor_class || 10,
		hitPoints: monster.hit_points || 10,
		hitDice: monster.hit_dice || '1d8',
		challengeRating: crString,
		xp: crToXp(crString)
	};
}

// ============================================================================
// Feat
// ============================================================================

export interface NormalizedFeat extends BaseNormalizedItem {
	type: 'feat';
	/** Prerequisites for taking this feat */
	featPrerequisites: string | null;
	/** Benefits/description as array */
	featBenefits: string[];
}

/**
 * Normalize a feat from any source
 */
export function normalizeFeat(
	name: string,
	description: string | string[],
	prerequisites: string | null,
	source: string,
	externalId: string
): NormalizedFeat {
	const desc = Array.isArray(description) ? description : description ? [description] : [];

	return {
		type: 'feat',
		externalId,
		name,
		slug: externalId,
		summary: desc[0] || '',
		description: desc,
		source,
		edition: null,
		sourceBook: null,
		featPrerequisites: prerequisites,
		featBenefits: desc
	};
}

// ============================================================================
// Background
// ============================================================================

export interface NormalizedBackground extends BaseNormalizedItem {
	type: 'background';
	/** Feature provided by this background */
	backgroundFeature: string | null;
	/** Skill proficiencies gained */
	backgroundSkillProficiencies: string | null;
}

/**
 * Normalize a background from any source
 */
export function normalizeBackground(
	name: string,
	description: string | string[],
	feature: string | null,
	skillProficiencies: string | null,
	source: string,
	externalId: string
): NormalizedBackground {
	const desc = Array.isArray(description) ? description : description ? [description] : [];

	return {
		type: 'background',
		externalId,
		name,
		slug: externalId,
		summary: desc[0] || '',
		description: desc,
		source,
		edition: null,
		sourceBook: null,
		backgroundFeature: feature,
		backgroundSkillProficiencies: skillProficiencies
	};
}

// ============================================================================
// Race
// ============================================================================

export interface NormalizedRace extends BaseNormalizedItem {
	type: 'race';
	/** Size category */
	raceSize: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
	/** Speed in feet */
	raceSpeed: number;
}

/**
 * Normalize a race from any source
 */
export function normalizeRace(
	name: string,
	description: string | string[],
	size: string,
	speed: number,
	source: string,
	externalId: string
): NormalizedRace {
	const desc = Array.isArray(description) ? description : description ? [description] : [];

	return {
		type: 'race',
		externalId,
		name,
		slug: externalId,
		summary: `${size} creature`,
		description: desc,
		source,
		edition: null,
		sourceBook: null,
		raceSize: normalizeSize(size),
		raceSpeed: speed
	};
}

// ============================================================================
// Class
// ============================================================================

export interface NormalizedClass extends BaseNormalizedItem {
	type: 'class';
	/** Hit die size (e.g., 8, 10, 12) */
	classHitDie: number;
}

/**
 * Normalize a class from any source
 */
export function normalizeClass(
	name: string,
	description: string | string[],
	hitDie: number,
	source: string,
	externalId: string
): NormalizedClass {
	const desc = Array.isArray(description) ? description : description ? [description] : [];

	return {
		type: 'class',
		externalId,
		name,
		slug: externalId,
		summary: `Hit die: d${hitDie}`,
		description: desc,
		source,
		edition: null,
		sourceBook: null,
		classHitDie: hitDie
	};
}

// ============================================================================
// Subclass
// ============================================================================

export interface NormalizedSubclass extends BaseNormalizedItem {
	type: 'subclass';
	/** Parent class name */
	className: string;
	/** Subclass flavor text */
	subclassFlavor: string | null;
}

/**
 * Normalize a subclass from any source
 */
export function normalizeSubclass(
	name: string,
	description: string | string[],
	className: string,
	flavor: string | null,
	source: string,
	externalId: string
): NormalizedSubclass {
	const desc = Array.isArray(description) ? description : description ? [description] : [];

	return {
		type: 'subclass',
		externalId,
		name,
		slug: externalId,
		summary: `${className} - ${name}`,
		description: desc,
		source,
		edition: null,
		sourceBook: null,
		className,
		subclassFlavor: flavor
	};
}

// ============================================================================
// Subrace
// ============================================================================

export interface NormalizedSubrace extends BaseNormalizedItem {
	type: 'subrace';
	/** Parent race name */
	raceName: string;
}

/**
 * Normalize a subrace from any source
 */
export function normalizeSubrace(
	name: string,
	description: string | string[],
	raceName: string,
	source: string,
	externalId: string
): NormalizedSubrace {
	const desc = Array.isArray(description) ? description : description ? [description] : [];

	return {
		type: 'subrace',
		externalId,
		name,
		slug: externalId,
		summary: `Subrace of ${raceName}`,
		description: desc,
		source,
		edition: null,
		sourceBook: null,
		raceName
	};
}

// ============================================================================
// Trait
// ============================================================================

export interface NormalizedTrait extends BaseNormalizedItem {
	type: 'trait';
	/** Name of the trait */
	traitName: string;
	/** Races that have this trait */
	traitRaces: string | null;
}

/**
 * Normalize a trait from any source
 */
export function normalizeTrait(
	name: string,
	description: string | string[],
	races: string | null,
	source: string,
	externalId: string
): NormalizedTrait {
	const desc = Array.isArray(description) ? description : description ? [description] : [];

	return {
		type: 'trait',
		externalId,
		name,
		slug: externalId,
		summary: desc[0] || '',
		description: desc,
		source,
		edition: null,
		sourceBook: null,
		traitName: name,
		traitRaces: races
	};
}

// ============================================================================
// Condition
// ============================================================================

export interface NormalizedCondition extends BaseNormalizedItem {
	type: 'condition';
	/** Condition name */
	conditionName: string;
}

/**
 * Normalize a condition from any source
 */
export function normalizeCondition(
	name: string,
	description: string | string[],
	source: string,
	externalId: string
): NormalizedCondition {
	const desc = Array.isArray(description) ? description : description ? [description] : [];

	return {
		type: 'condition',
		externalId,
		name,
		slug: externalId,
		summary: name,
		description: desc,
		source,
		edition: null,
		sourceBook: null,
		conditionName: name
	};
}

// ============================================================================
// Skill
// ============================================================================

export interface NormalizedSkill extends BaseNormalizedItem {
	type: 'skill';
	/** Associated ability score */
	abilityScore: string;
}

/**
 * Normalize a skill from any source
 */
export function normalizeSkill(
	name: string,
	description: string | string[],
	abilityScore: string,
	source: string,
	externalId: string
): NormalizedSkill {
	const desc = Array.isArray(description) ? description : description ? [description] : [];

	return {
		type: 'skill',
		externalId,
		name,
		slug: externalId,
		summary: `${name} (${abilityScore})`,
		description: desc,
		source,
		edition: null,
		sourceBook: null,
		abilityScore
	};
}

// ============================================================================
// Language
// ============================================================================

export interface NormalizedLanguage extends BaseNormalizedItem {
	type: 'language';
	/** Typical speakers */
	typicalSpeakers: string | null;
}

/**
 * Normalize a language from any source
 */
export function normalizeLanguage(
	name: string,
	description: string | string[],
	speakers: string | null,
	source: string,
	externalId: string
): NormalizedLanguage {
	const desc = Array.isArray(description) ? description : description ? [description] : [];

	return {
		type: 'language',
		externalId,
		name,
		slug: externalId,
		summary: speakers || '',
		description: desc,
		source,
		edition: null,
		sourceBook: null,
		typicalSpeakers: speakers
	};
}

// ============================================================================
// Ability Score
// ============================================================================

export interface NormalizedAbilityScore extends BaseNormalizedItem {
	type: 'abilityScore';
	/** Abbreviation (STR, DEX, etc.) */
	abilityScoreAbbreviation: string;
}

/**
 * Normalize an ability score from any source
 */
export function normalizeAbilityScore(
	name: string,
	abbreviation: string,
	description: string | string[],
	source: string,
	externalId: string
): NormalizedAbilityScore {
	const desc = Array.isArray(description) ? description : description ? [description] : [];

	return {
		type: 'abilityScore',
		externalId,
		name,
		slug: externalId,
		summary: abbreviation,
		description: desc,
		source,
		edition: null,
		sourceBook: null,
		abilityScoreAbbreviation: abbreviation
	};
}

// ============================================================================
// Proficiency
// ============================================================================

export interface NormalizedProficiency extends BaseNormalizedItem {
	type: 'proficiency';
	/** Type of proficiency */
	proficiencyType: string;
}

/**
 * Normalize a proficiency from any source
 */
export function normalizeProficiency(
	name: string,
	proficiencyType: string,
	description: string | string[],
	source: string,
	externalId: string
): NormalizedProficiency {
	const desc = Array.isArray(description) ? description : description ? [description] : [];

	return {
		type: 'proficiency',
		externalId,
		name,
		slug: externalId,
		summary: proficiencyType,
		description: desc,
		source,
		edition: null,
		sourceBook: null,
		proficiencyType
	};
}

// ============================================================================
// Damage Type
// ============================================================================

export interface NormalizedDamageType extends BaseNormalizedItem {
	type: 'damageType';
	/** Damage type name */
	damageTypeName: string;
}

/**
 * Normalize a damage type from any source
 */
export function normalizeDamageType(
	name: string,
	description: string | string[],
	source: string,
	externalId: string
): NormalizedDamageType {
	const desc = Array.isArray(description) ? description : description ? [description] : [];

	return {
		type: 'damageType',
		externalId,
		name,
		slug: externalId,
		summary: name,
		description: desc,
		source,
		edition: null,
		sourceBook: null,
		damageTypeName: name
	};
}

// ============================================================================
// Magic School
// ============================================================================

export interface NormalizedMagicSchool extends BaseNormalizedItem {
	type: 'magicSchool';
	/** Magic school name */
	magicSchoolName: string;
}

/**
 * Normalize a magic school from any source
 */
export function normalizeMagicSchool(
	name: string,
	description: string | string[],
	source: string,
	externalId: string
): NormalizedMagicSchool {
	const desc = Array.isArray(description) ? description : description ? [description] : [];

	return {
		type: 'magicSchool',
		externalId,
		name,
		slug: externalId,
		summary: name,
		description: desc,
		source,
		edition: null,
		sourceBook: null,
		magicSchoolName: name
	};
}

// ============================================================================
// Equipment
// ============================================================================

export interface NormalizedEquipment extends BaseNormalizedItem {
	type: 'equipment';
	/** Equipment category */
	equipmentCategory: string | null;
}

/**
 * Normalize equipment from any source
 */
export function normalizeEquipment(
	name: string,
	description: string | string[],
	category: string | null,
	source: string,
	externalId: string
): NormalizedEquipment {
	const desc = Array.isArray(description) ? description : description ? [description] : [];

	return {
		type: 'equipment',
		externalId,
		name,
		slug: externalId,
		summary: category || '',
		description: desc,
		source,
		edition: null,
		sourceBook: null,
		equipmentCategory: category
	};
}

// ============================================================================
// Rule
// ============================================================================

export interface NormalizedRule extends BaseNormalizedItem {
	type: 'rule';
	/** Rule name */
	ruleName: string;
}

/**
 * Normalize a rule from any source
 */
export function normalizeRule(
	name: string,
	description: string | string[],
	source: string,
	externalId: string
): NormalizedRule {
	const desc = Array.isArray(description) ? description : description ? [description] : [];

	return {
		type: 'rule',
		externalId,
		name,
		slug: externalId,
		summary: desc[0] || '',
		description: desc,
		source,
		edition: null,
		sourceBook: null,
		ruleName: name
	};
}

// ============================================================================
// Rule Section
// ============================================================================

export interface NormalizedRuleSection extends BaseNormalizedItem {
	type: 'ruleSection';
	/** Rule section name */
	ruleSectionName: string;
}

/**
 * Normalize a rule section from any source
 */
export function normalizeRuleSection(
	name: string,
	description: string,
	source: string,
	externalId: string
): NormalizedRuleSection {
	return {
		type: 'ruleSection',
		externalId,
		name,
		slug: externalId,
		summary: description.slice(0, 100),
		description: [description],
		source,
		edition: null,
		sourceBook: null,
		ruleSectionName: name
	};
}

// ============================================================================
// Union Type
// ============================================================================

export type NormalizedCompendiumItem =
	| NormalizedSpell
	| NormalizedMonster
	| NormalizedFeat
	| NormalizedBackground
	| NormalizedRace
	| NormalizedClass
	| NormalizedSubclass
	| NormalizedSubrace
	| NormalizedTrait
	| NormalizedCondition
	| NormalizedSkill
	| NormalizedLanguage
	| NormalizedAbilityScore
	| NormalizedProficiency
	| NormalizedDamageType
	| NormalizedMagicSchool
	| NormalizedEquipment
	| NormalizedRule
	| NormalizedRuleSection;

// ============================================================================
// Helper Utilities
// ============================================================================

/**
 * Normalize size string to canonical form
 */
function normalizeSize(
	size: string
): 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan' {
	const normalized = size.charAt(0).toUpperCase() + size.slice(1).toLowerCase();
	const validSizes = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'] as const;
	return validSizes.includes(normalized as (typeof validSizes)[number])
		? (normalized as (typeof validSizes)[number])
		: 'Medium';
}

/**
 * Convert challenge rating to XP
 */
function crToXp(cr: string): number {
	const crMap: Record<string, number> = {
		'0': 0,
		'1/8': 25,
		'1/4': 50,
		'1/2': 100,
		'1': 200,
		'2': 450,
		'3': 700,
		'4': 1100,
		'5': 1800,
		'6': 2500,
		'7': 3300,
		'8': 5100,
		'9': 7200,
		'10': 10000,
		'11': 11500,
		'12': 13000,
		'13': 15000,
		'14': 18000,
		'15': 20000,
		'16': 22000,
		'17': 25000,
		'18': 33000,
		'19': 41000,
		'20': 50000,
		'21': 62000,
		'22': 75000,
		'23': 90000,
		'24': 105000,
		'25': 125000,
		'26': 155000,
		'27': 195000,
		'28': 245000,
		'29': 305000,
		'30': 400000
	};
	return crMap[cr] || Math.floor((Number(cr) || 0) * 200);
}

/**
 * Check if a normalized item is a specific type
 */
export function isNormalizedSpell(item: NormalizedCompendiumItem): item is NormalizedSpell {
	return item.type === 'spell';
}

export function isNormalizedMonster(item: NormalizedCompendiumItem): item is NormalizedMonster {
	return item.type === 'monster';
}

export function isNormalizedFeat(item: NormalizedCompendiumItem): item is NormalizedFeat {
	return item.type === 'feat';
}

export function isNormalizedBackground(
	item: NormalizedCompendiumItem
): item is NormalizedBackground {
	return item.type === 'background';
}

export function isNormalizedRace(item: NormalizedCompendiumItem): item is NormalizedRace {
	return item.type === 'race';
}

export function isNormalizedClass(item: NormalizedCompendiumItem): item is NormalizedClass {
	return item.type === 'class';
}
