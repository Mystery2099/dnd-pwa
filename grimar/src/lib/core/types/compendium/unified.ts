/**
 * Unified Compendium Types
 *
 * These interfaces provide a consistent data structure for all compendium types,
 * regardless of the source provider (Open5e, 5e-bits, SRD, homebrew).
 *
 * The service layer transforms raw database records into these unified types,
 * handling provider-specific field naming and data structure differences.
 */

// ============================================================================
// Base Types
// ============================================================================

export interface BaseCompendiumItem {
	/** Database ID */
	id: number;
	/** Display name */
	name: string;
	/** Brief description for list views */
	summary: string;
	/** Data source (e.g., 'open5e', '5e-bits', 'homebrew') */
	source: string;
	/** Full description as array of paragraphs (always array, never string) */
	description: string[];
	/** URL-friendly identifier */
	slug: string;
	/** Raw JSON data from provider (for backward compatibility) */
	details?: Record<string, unknown>;
}

export type CompendiumType =
	| 'spell'
	| 'monster'
	| 'feat'
	| 'background'
	| 'race'
	| 'class'
	| 'item';

export function isSpell(item: UnifiedCompendiumItem): item is UnifiedSpell {
	return item.type === 'spell';
}

export function isMonster(item: UnifiedCompendiumItem): item is UnifiedMonster {
	return item.type === 'monster';
}

export function isFeat(item: UnifiedCompendiumItem): item is UnifiedFeat {
	return item.type === 'feat';
}

export function isBackground(item: UnifiedCompendiumItem): item is UnifiedBackground {
	return item.type === 'background';
}

export function isRace(item: UnifiedCompendiumItem): item is UnifiedRace {
	return item.type === 'race';
}

export function isClass(item: UnifiedCompendiumItem): item is UnifiedClass {
	return item.type === 'class';
}

export function isItem(item: UnifiedCompendiumItem): item is UnifiedItem {
	return item.type === 'item';
}

// ============================================================================
// Spell
// ============================================================================

export interface UnifiedSpell extends BaseCompendiumItem {
	type: 'spell';
	/** Spell level (0 = cantrip, 1-9 = spell levels) */
	level: number;
	/** School name (e.g., 'Evocation', 'Necromancy') */
	school: string;
	/** Casting time (e.g., '1 action', '1 bonus action', '10 minutes') */
	castingTime: string;
	/** Range (e.g., '120 feet', 'Self', 'Touch') */
	range: string;
	/** Components required (e.g., ['V', 'S', 'M']) */
	components: string[];
	/** Material component description if applicable */
	material?: string;
	/** Duration (e.g., 'Concentration, up to 1 hour', 'Instantaneous') */
	duration: string;
	/** Whether concentration is required */
	concentration: boolean;
	/** Whether this can be cast as a ritual */
	ritual: boolean;
	/** Higher level description, if applicable */
	higherLevel?: string;
	/** Spell classes that have this spell */
	classes: string[];
	/** Spell subclasses (e.g., 'Eldritch Knight', 'Arcane Trickster') */
	subclasses?: string[];
}

// ============================================================================
// Monster
// ============================================================================

export interface AbilityScore {
	score: number;
	modifier?: number;
}

export interface MonsterAction {
	name: string;
	description: string;
	/** Optional attack bonus */
	attackBonus?: number;
	/** Optional damage info (can be single object or array) */
	damage?:
		| {
				dice: string;
				type: string;
		  }
		| Array<{
				dice: string;
				type: string;
		  }>;
	/** Optional multiattack configuration */
	multiattack?: {
		actionName: string;
		count: number;
	};
}

export interface MonsterSpecialAbility {
	name: string;
	description: string;
	/** Optional attack bonus for the ability */
	attackBonus?: number;
	/** Optional damage from the ability */
	damage?: Array<{
		dice: string;
		type: string;
	}>;
}

export interface UnifiedMonster extends BaseCompendiumItem {
	type: 'monster';
	/** Size category */
	size: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
	/** Monster type (e.g., 'humanoid', 'dragon', 'undead') */
	monsterType: string;
	/** Optional subtype (e.g., 'goblinoid', 'shapechanger') */
	subtype?: string;
	/** Alignment (e.g., 'lawful evil', 'unaligned') */
	alignment: string;
	/** Armor class */
	armorClass: number;
	/** Hit points */
	hitPoints: number;
	/** Hit dice expression (e.g., '12d8+24') */
	hitDice: string;
	/** Movement speeds */
	speed: {
		walk?: string;
		burrow?: string;
		climb?: string;
		fly?: string;
		swim?: string;
		[key: string]: string | undefined;
	};
	/** Ability scores */
	abilityScores: {
		strength: number;
		dexterity: number;
		constitution: number;
		intelligence: number;
		wisdom: number;
		charisma: number;
	};
	/** Challenge rating (e.g., '1/4', '5', '20') */
	challengeRating: string;
	/** Experience points */
	xp: number;
	/** Proficiencies (e.g., { name: 'Perception', value: 6 }) */
	proficiencies: Array<{
		name: string;
		value: number;
	}>;
	/** Damage vulnerabilities */
	damageVulnerabilities: string[];
	/** Damage resistances */
	damageResistances: string[];
	/** Damage immunities */
	damageImmunities: string[];
	/** Condition immunities */
	conditionImmunities: string[];
	/** Senses (e.g., 'passive Perception 12') */
	senses: Record<string, string>;
	/** Languages spoken */
	languages: string;
	/** Special abilities (not actions) */
	specialAbilities: MonsterSpecialAbility[];
	/** Actions */
	actions: MonsterAction[];
	/** Legendary actions (optional) */
	legendaryActions?: MonsterAction[];
	/** Reactions (optional) */
	reactions?: Array<{
		name: string;
		description: string;
	}>;
}

// ============================================================================
// Feat
// ============================================================================

export interface UnifiedFeat extends BaseCompendiumItem {
	type: 'feat';
	/** Prerequisites for taking this feat */
	prerequisites: string[];
	/** Benefits/description of the feat */
	benefits?: string[];
}

// ============================================================================
// Background
// ============================================================================

export interface UnifiedBackground extends BaseCompendiumItem {
	type: 'background';
	/** Feature provided by this background */
	feature?: {
		name: string;
		description: string;
	};
	/** Skill proficiencies gained */
	skillProficiencies: string[];
	/** Tool proficiencies gained */
	toolProficiencies: string[];
	/** Languages known */
	languages?: string;
	/** Equipment granted */
	equipment?: string[];
}

// ============================================================================
// Race
// ============================================================================

export interface RaceAbilityBonus {
	ability: string; // 'strength', 'dexterity', etc.
	bonus: number;
}

export interface RaceTrait {
	name: string;
	description: string;
}

export interface UnifiedRace extends BaseCompendiumItem {
	type: 'race';
	/** Size category */
	size: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
	/** Speed in feet */
	speed: number;
	/** Ability score increases */
	abilityBonuses: RaceAbilityBonus[];
	/** Racial traits */
	traits: RaceTrait[];
	/** Starting proficiencies */
	proficiencies?: {
		skills?: string[];
		languages?: string[];
	};
	/** Age information */
	age?: string;
	/** Alignment tendencies */
	alignment?: string;
	/** Size description */
	sizeDescription?: string;
}

// ============================================================================
// Class
// ============================================================================

export interface ClassFeature {
	name: string;
	description: string;
	level: number;
}

export interface UnifiedClass extends BaseCompendiumItem {
	type: 'class';
	/** Hit die size (e.g., 8, 10, 12) */
	hitDie: number;
	/** Proficiencies granted */
	proficiencies: {
		armor?: string[];
		weapons?: string;
		tools?: string[];
		skills?: string[];
		savingThrows?: string[];
	};
	/** Spellcasting ability */
	spellcasting?: {
		ability: string;
		dc: number;
		modifier: number;
	};
	/** Class features by level */
	features: ClassFeature[];
	/** Subclasses (e.g., Barbarian has no subclasses) */
	subclasses?: Array<{
		name: string;
		description: string;
	}>;
}

// ============================================================================
// Item
// ============================================================================

export interface UnifiedItem extends BaseCompendiumItem {
	type: 'item';
	/** Item rarity (e.g., 'common', 'rare', 'legendary') */
	rarity: string;
	/** Item type (e.g., 'weapon', 'armor', 'wondrous item') */
	itemType: string;
	/** Whether it requires attunement */
	requiresAttunement: boolean;
	/** Optional attunement requirements */
	attunementRequirements?: string;
	/** Weight in lbs */
	weight?: number;
	/** Value in gold pieces */
	value?: number;
	/** Magical properties for weapons */
	magicProperties?: {
		attackBonus?: number;
		damage?: string;
	};
	/** Armor properties */
	armorProperties?: {
		class: number;
		strengthRequirement?: number;
		stealthPenalty?: boolean;
	};
}

// ============================================================================
// Union Type
// ============================================================================

export type UnifiedCompendiumItem =
	| UnifiedSpell
	| UnifiedMonster
	| UnifiedFeat
	| UnifiedBackground
	| UnifiedRace
	| UnifiedClass
	| UnifiedItem;

// ============================================================================
// Filter Types
// ============================================================================

export interface SpellFilters {
	level?: number;
	school?: string;
	search?: string;
	classes?: string[];
	concentration?: boolean;
	ritual?: boolean;
}

export interface MonsterFilters {
	size?: string;
	type?: string;
	cr?: string;
	search?: string;
}

export interface CompendiumFilters {
	spell?: SpellFilters;
	monster?: MonsterFilters;
}

// ============================================================================
// Navigation
// ============================================================================

export interface NavigationResult {
	prev: UnifiedCompendiumItem | null;
	next: UnifiedCompendiumItem | null;
	currentIndex: number;
	total: number;
}

// ============================================================================
// Pagination
// ============================================================================

export interface PaginatedUnifiedResult<T> {
	items: T[];
	pagination: {
		page: number;
		limit: number;
		totalCount: number;
		totalPages: number;
	};
	hasAnyItems: boolean;
}
