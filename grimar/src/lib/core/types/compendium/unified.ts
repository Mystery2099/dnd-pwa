/**
 * Unified Compendium Types
 *
 * These interfaces provide a consistent data structure for all compendium types,
 * regardless of the source provider (Open5e, SRD, homebrew).
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
	/** Data source (e.g., 'open5e', 'srd', 'homebrew') */
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
	| 'creature'
	| 'feat'
	| 'background'
	| 'race'
	| 'class'
	| 'item'
	| 'subclass'
	| 'subrace'
	| 'trait'
	| 'condition'
	| 'skill'
	| 'language'
	| 'abilityScore'
	| 'proficiency'
	| 'damageType'
	| 'magicSchool'
	| 'equipment'
	| 'weapon'
	| 'armor'
	| 'tool'
	| 'vehicle';

// ============================================================================
// Type Guard Factory
// ============================================================================

/**
 * Factory function for creating type guard functions.
 * Generates a type guard that checks if an item matches the given type.
 */
function createTypeGuard<T extends UnifiedCompendiumItem>(type: T['type']) {
	return (item: UnifiedCompendiumItem): item is T => item.type === type;
}

// ============================================================================
// Type Guards
// ============================================================================

export const isSpell = createTypeGuard<UnifiedSpell>('spell');
export const isCreature = createTypeGuard<UnifiedCreature>('creature');
export const isFeat = createTypeGuard<UnifiedFeat>('feat');
export const isBackground = createTypeGuard<UnifiedBackground>('background');
export const isRace = createTypeGuard<UnifiedRace>('race');
export const isClass = createTypeGuard<UnifiedClass>('class');
export const isItem = createTypeGuard<UnifiedItem>('item');
export const isSubclass = createTypeGuard<UnifiedSubclass>('subclass');
export const isSubrace = createTypeGuard<UnifiedSubrace>('subrace');
export const isTrait = createTypeGuard<UnifiedTrait>('trait');
export const isCondition = createTypeGuard<UnifiedCondition>('condition');
export const isSkill = createTypeGuard<UnifiedSkill>('skill');

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
// Creature
// ============================================================================

export interface AbilityScore {
	score: number;
	modifier?: number;
}

export interface CreatureAction {
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

export interface CreatureSpecialAbility {
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

export interface UnifiedCreature extends BaseCompendiumItem {
	type: 'creature';
	/** Size category */
	size: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
	/** Creature type (e.g., 'humanoid', 'dragon', 'undead') */
	creatureType: string;
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
	specialAbilities: CreatureSpecialAbility[];
	/** Actions */
	actions: CreatureAction[];
	/** Legendary actions (optional) */
	legendaryActions?: CreatureAction[];
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
// Subclass
// ============================================================================

export interface SubclassFeature {
	name: string;
	description: string;
	level: number;
}

export interface UnifiedSubclass extends BaseCompendiumItem {
	type: 'subclass';
	/** Parent class name (e.g., 'Cleric', 'Fighter') */
	className: string;
	/** Flavor text or thematic description */
	subclassFlavor?: string;
	/** Description paragraphs */
	description: string[];
	/** Features gained at each level */
	features: SubclassFeature[];
}

// ============================================================================
// Subrace
// ============================================================================

export interface UnifiedSubrace extends BaseCompendiumItem {
	type: 'subrace';
	/** Parent race name (e.g., 'Elf', 'Dwarf') */
	raceName: string;
	/** Ability score changes */
	abilityBonuses: RaceAbilityBonus[];
	/** Traits specific to this subrace */
	traits: RaceTrait[];
	/** Starting proficiencies */
	proficiencies?: {
		skills?: string[];
		languages?: string[];
	};
	/** Language options */
	languages?: string[];
}

// ============================================================================
// Trait
// ============================================================================

export interface UnifiedTrait extends BaseCompendiumItem {
	type: 'trait';
	/** Races that have this trait */
	races: Array<{
		name: string;
		index: string;
	}>;
	/** Trait description */
	description: string[];
	/** Optional URL to source */
	url?: string;
}

// ============================================================================
// Condition
// ============================================================================

export interface UnifiedCondition {
	type: 'condition';
	/** Database ID */
	id?: number;
	/** Display name */
	name: string;
	/** Summary is typically the name */
	summary: string;
	/** Description of the condition */
	description: string[];
	/** Data source */
	source?: string;
	/** URL-friendly identifier */
	slug: string;
	/** Raw JSON data from provider */
	details?: Record<string, unknown>;
}

// ============================================================================
// Skill
// ============================================================================

export interface UnifiedSkill {
	type: 'skill';
	/** Database ID */
	id?: number;
	/** Display name */
	name: string;
	/** Summary is the name */
	summary: string;
	/** Associated ability score (e.g., 'DEX', 'WIS') */
	abilityScore: string;
	/** Description of what the skill covers */
	description?: string;
	/** Data source */
	source: string;
	/** URL-friendly identifier */
	slug: string;
	/** Raw JSON data from provider */
	details?: Record<string, unknown>;
}

// ============================================================================
// Language
// ============================================================================

export interface UnifiedLanguage extends BaseCompendiumItem {
	type: 'language';
	/** Typical speakers */
	speakers: string[];
	/** Script if applicable */
	script?: string;
	/** Whether it's an exotic language */
	exotic: boolean;
}

// ============================================================================
// Ability Score
// ============================================================================

export interface UnifiedAbilityScore {
	type: 'abilityScore';
	/** Database ID */
	id?: number;
	/** Display name */
	name: string;
	/** Summary is the name */
	summary: string;
	/** Abbreviation (STR, DEX, etc.) */
	abbreviation: string;
	/** Full name */
	fullName?: string;
	/** Description */
	description?: string;
	/** Data source */
	source: string;
	/** URL-friendly identifier */
	slug: string;
	/** Raw JSON data from provider */
	details?: Record<string, unknown>;
}

// ============================================================================
// Proficiency
// ============================================================================

export interface UnifiedProficiency {
	type: 'proficiency';
	/** Database ID */
	id?: number;
	/** Display name */
	name: string;
	/** Summary is the name */
	summary: string;
	/** Type of proficiency (e.g., 'Armor', 'Weapon', 'Skill') */
	proficiencyType: string;
	/** Relevant category */
	category?: string;
	/** Data source */
	source: string;
	/** URL-friendly identifier */
	slug: string;
	/** Raw JSON data from provider */
	details?: Record<string, unknown>;
}

// ============================================================================
// Damage Type
// ============================================================================

export interface UnifiedDamageType {
	type: 'damageType';
	/** Database ID */
	id?: number;
	/** Display name */
	name: string;
	/** Summary is the name */
	summary: string;
	/** Description of damage type */
	description?: string;
	/** Data source */
	source: string;
	/** URL-friendly identifier */
	slug: string;
	/** Raw JSON data from provider */
	details?: Record<string, unknown>;
}

// ============================================================================
// Magic School
// ============================================================================

export interface UnifiedMagicSchool {
	type: 'magicSchool';
	/** Database ID */
	id?: number;
	/** Display name */
	name: string;
	/** Summary is the name */
	summary: string;
	/** Description of the school */
	description?: string;
	/** Data source */
	source: string;
	/** URL-friendly identifier */
	slug: string;
	/** Raw JSON data from provider */
	details?: Record<string, unknown>;
}

// ============================================================================
// Equipment (generic - weapons, armor, tools, vehicles)
// Uses discriminated union pattern instead of inheritance
// ============================================================================

export interface BaseEquipment {
	/** Database ID */
	id?: number;
	/** Display name */
	name: string;
	/** Summary */
	summary: string;
	/** Equipment category */
	category: string;
	/** Rarity if magical */
	rarity?: string;
	/** Whether attunement is required */
	requiresAttunement: boolean;
	/** Weight in lbs */
	weight?: number;
	/** Value in gold pieces */
	value?: number;
	/** Description */
	description?: string;
	/** Data source */
	source: string;
	/** URL-friendly identifier */
	slug: string;
	/** Raw JSON data from provider */
	details?: Record<string, unknown>;
}

export interface UnifiedEquipment extends BaseEquipment {
	type: 'equipment';
}

export interface UnifiedWeapon {
	type: 'weapon';
	/** Database ID */
	id?: number;
	/** Display name */
	name: string;
	/** Summary */
	summary: string;
	/** Equipment category */
	category: string;
	/** Rarity if magical */
	rarity?: string;
	/** Whether attunement is required */
	requiresAttunement: boolean;
	/** Weight in lbs */
	weight?: number;
	/** Value in gold pieces */
	value?: number;
	/** Description */
	description?: string;
	/** Data source */
	source: string;
	/** URL-friendly identifier */
	slug: string;
	/** Weapon category (simple, martial) */
	weaponCategory: string;
	/** Damage dice (e.g., '1d8') */
	damageDice: string;
	/** Damage type (e.g., 'slashing') */
	damageType: string;
	/** Range properties */
	range?: {
		normal: number;
		long?: number;
	};
	/** Weapon properties */
	properties: string[];
	/** Raw JSON data from provider */
	details?: Record<string, unknown>;
}

export interface UnifiedArmor {
	type: 'armor';
	/** Database ID */
	id?: number;
	/** Display name */
	name: string;
	/** Summary */
	summary: string;
	/** Equipment category */
	category: string;
	/** Rarity if magical */
	rarity?: string;
	/** Whether attunement is required */
	requiresAttunement: boolean;
	/** Weight in lbs */
	weight?: number;
	/** Value in gold pieces */
	value?: number;
	/** Description */
	description?: string;
	/** Data source */
	source: string;
	/** URL-friendly identifier */
	slug: string;
	/** Armor category (light, medium, heavy) */
	armorCategory: string;
	/** Armor class */
	armorClass: number;
	/** Whether dex mod is added */
	addsDexModifier: boolean;
	/** Max dex bonus if limited */
	maxDexBonus?: number;
	/** Strength requirement */
	strengthRequirement?: number;
	/** Stealth penalty */
	stealthPenalty: boolean;
	/** Raw JSON data from provider */
	details?: Record<string, unknown>;
}

export interface UnifiedTool {
	type: 'tool';
	/** Database ID */
	id?: number;
	/** Display name */
	name: string;
	/** Summary */
	summary: string;
	/** Equipment category */
	category: string;
	/** Rarity if magical */
	rarity?: string;
	/** Whether attunement is required */
	requiresAttunement: boolean;
	/** Weight in lbs */
	weight?: number;
	/** Value in gold pieces */
	value?: number;
	/** Description */
	description?: string;
	/** Data source */
	source: string;
	/** URL-friendly identifier */
	slug: string;
	/** Tool category (instrument, artisan's tool, gaming set) */
	toolCategory: string;
	/** Raw JSON data from provider */
	details?: Record<string, unknown>;
}

export interface UnifiedVehicle {
	type: 'vehicle';
	/** Database ID */
	id?: number;
	/** Display name */
	name: string;
	/** Summary */
	summary: string;
	/** Equipment category */
	category: string;
	/** Rarity if magical */
	rarity?: string;
	/** Whether attunement is required */
	requiresAttunement: boolean;
	/** Weight in lbs */
	weight?: number;
	/** Value in gold pieces */
	value?: number;
	/** Description */
	description?: string;
	/** Data source */
	source: string;
	/** URL-friendly identifier */
	slug: string;
	/** Vehicle type (land, water, air) */
	vehicleType: string;
	/** Speed in feet */
	speed?: number;
	/** Capacity */
	capacity?: string;
	/** Raw JSON data from provider */
	details?: Record<string, unknown>;
}

// ============================================================================
// Union Type
// ============================================================================

export type UnifiedCompendiumItem =
	| UnifiedSpell
	| UnifiedCreature
	| UnifiedFeat
	| UnifiedBackground
	| UnifiedRace
	| UnifiedClass
	| UnifiedItem
	| UnifiedSubclass
	| UnifiedSubrace
	| UnifiedTrait
	| UnifiedCondition
	| UnifiedSkill
	| UnifiedLanguage
	| UnifiedAbilityScore
	| UnifiedProficiency
	| UnifiedDamageType
	| UnifiedMagicSchool
	| UnifiedEquipment
	| UnifiedWeapon
	| UnifiedArmor
	| UnifiedTool
	| UnifiedVehicle;

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

export interface CreatureFilters {
	size?: string;
	type?: string;
	cr?: string;
	search?: string;
}

export interface CompendiumFilters {
	spell?: SpellFilters;
	creature?: CreatureFilters;
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
