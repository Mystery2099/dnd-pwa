/**
 * Transformers: Database Record → Unified Types
 *
 * These functions transform raw database records (from compendium_items table)
 * into the unified type structures defined in unified.ts.
 *
 * They handle:
 * - Provider-specific field naming (desc vs description, higher_level vs higherLevel)
 * - Data type normalization (string | string[] → always string[])
 * - Default values for missing fields
 * - Complex object transformations
 */

import type {
	UnifiedSpell,
	UnifiedCreature,
	UnifiedFeat,
	UnifiedBackground,
	UnifiedRace,
	UnifiedClass,
	UnifiedItem,
	UnifiedCondition,
	UnifiedLanguage,
	UnifiedSkill,
	UnifiedAbilityScore,
	CreatureAction,
	CreatureSpecialAbility
} from '$lib/core/types/compendium/unified';
import { compendiumItems } from '$lib/server/db/schema';
import logger from '$lib/server/logger';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Normalize a value to always be an array of strings.
 * Handles: string, string[], null, undefined
 */
function toStringArray(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.map((v) => String(v));
	}
	if (typeof value === 'string') {
		return value ? [value] : [];
	}
	if (value === null || value === undefined) {
		return [];
	}
	return [String(value)];
}

/**
 * Safely get a string value, defaulting to empty string.
 */
function toString(value: unknown): string {
	if (typeof value === 'string') return value;
	if (value === null || value === undefined) return '';
	return String(value);
}

/**
 * Safely get a number value, defaulting to 0.
 */
function toNumber(value: unknown): number {
	if (typeof value === 'number') return value;
	if (value === null || value === undefined) return 0;
	const parsed = parseFloat(String(value));
	return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Normalize school field: { name: string } | string → string
 */
function toSchoolName(school: unknown): string {
	if (typeof school === 'string') return school;
	if (school && typeof school === 'object' && 'name' in school) {
		return String((school as { name: unknown }).name);
	}
	return 'Unknown';
}

/**
 * Normalize a name field that might be in different formats
 */
function toName(obj: unknown): string {
	if (!obj) return '';
	if (typeof obj === 'string') return obj;
	if (typeof obj === 'object' && 'name' in obj) {
		return String((obj as { name: unknown }).name);
	}
	return '';
}

// ============================================================================
// Spell Transformer
// ============================================================================

export function transformToUnifiedSpell(item: typeof compendiumItems.$inferSelect): UnifiedSpell {
	const details = (item.details ?? {}) as Record<string, unknown>;
	const summary = toString(details.summary) || item.summary || '';

	return {
		id: item.id,
		name: item.name,
		summary: summary,
		source: item.source,
		description: toStringArray(details.desc),
		slug: item.externalId ?? String(item.id),
		type: 'spell',
	level: toNumber(details.level) ?? 0,
		school: toSchoolName(details.school),
		castingTime: toString(details.casting_time),
		range: toString(details.range),
		components: toStringArray(details.components),
		material: toString(details.material) || undefined,
		duration: toString(details.duration),
		concentration: Boolean(details.concentration),
		ritual: Boolean(details.ritual),
		higherLevel: details.higher_level
			? toStringArray(details.higher_level).join('\n\n')
			: undefined,
		classes: toClassNamesArray(details.classes),
		subclasses: toClassNamesArray(details.subclasses)
	};
}

/**
 * Extract class names from various formats.
 */
function toClassNamesArray(classes: unknown): string[] {
	if (!classes) return [];
	const arr = Array.isArray(classes) ? classes : [classes];
	return arr.map(toName).filter(Boolean);
}

// ============================================================================
// Creature Transformer
// ============================================================================

export function transformToUnifiedCreature(
	item: typeof compendiumItems.$inferSelect
): UnifiedCreature {
	const details = (item.details ?? {}) as Record<string, unknown>;
	const summary = toString(details.summary) || item.summary || '';

	return {
		id: item.id,
		name: item.name,
		summary: summary,
		source: item.source,
		description: toStringArray(details.desc),
		slug: item.externalId ?? String(item.id),
		type: 'creature',
		size: toCreatureSize(details.size),
		creatureType: toString(details.type) || 'Unknown',
		subtype: toString(details.subtype) || undefined,
		alignment: toString(details.alignment) || 'Unaligned',
		armorClass: toArmorClass(details.armor_class),
		hitPoints: toNumber(details.hit_points),
		hitDice: toString(details.hit_dice),
		speed: toSpeed(details.speed),
		abilityScores: {
			strength: toNumber(details.strength),
			dexterity: toNumber(details.dexterity),
			constitution: toNumber(details.constitution),
			intelligence: toNumber(details.intelligence),
			wisdom: toNumber(details.wisdom),
			charisma: toNumber(details.charisma)
		},
		challengeRating: toString(details.challenge_rating) || '0',
		xp: toNumber(details.xp),
		proficiencies: toProficiencies(details.proficiencies),
		damageVulnerabilities: toStringArray(details.damage_vulnerabilities),
		damageResistances: toStringArray(details.damage_resistances),
		damageImmunities: toStringArray(details.damage_immunities),
		conditionImmunities: toStringArray(details.condition_immunities),
		senses: toSenses(details.senses),
		languages: toString(details.languages),
		specialAbilities: toSpecialAbilities(details.special_abilities),
		actions: toActions(details.actions),
		legendaryActions: details.legendary_actions ? toActions(details.legendary_actions) : undefined,
		reactions: toReactions(details.reactions)
	};
}

function toCreatureSize(size: unknown): UnifiedCreature['size'] {
	const s = toString(size).toLowerCase();
	switch (s) {
		case 'tiny':
			return 'Tiny';
		case 'small':
			return 'Small';
		case 'medium':
			return 'Medium';
		case 'large':
			return 'Large';
		case 'huge':
			return 'Huge';
		case 'gargantuan':
			return 'Gargantuan';
		default:
			return 'Medium';
	}
}

function toArmorClass(ac: unknown): number {
	if (typeof ac === 'number') return ac;
	if (Array.isArray(ac)) {
		// armor_class can be [{ type: 'natural', value: 16 }, ...]
		const first = ac[0];
		if (first && typeof first === 'object' && 'value' in first) {
			return toNumber((first as { value: unknown }).value);
		}
	}
	return 10;
}

function toSpeed(speed: unknown): UnifiedCreature['speed'] {
	if (typeof speed === 'object' && speed !== null) {
		const result: Record<string, string> = {};
		for (const [key, value] of Object.entries(speed as Record<string, unknown>)) {
			if (value) result[key] = toString(value);
		}
		return result;
	}
	return { walk: '30 ft.' };
}

function toProficiencies(profs: unknown): UnifiedCreature['proficiencies'] {
	if (!profs || !Array.isArray(profs)) return [];
	return profs
		.map((p: unknown) => {
			if (typeof p === 'object' && p !== null && 'proficiency' in p && 'value' in p) {
				const prof = p as { proficiency: { name?: string }; value: unknown };
				return {
					name: toName(prof.proficiency),
					value: toNumber(prof.value)
				};
			}
			return { name: '', value: 0 };
		})
		.filter((p) => p.name);
}

function toSenses(senses: unknown): Record<string, string> {
	if (typeof senses === 'object' && senses !== null) {
		const result: Record<string, string> = {};
		for (const [key, value] of Object.entries(senses as Record<string, unknown>)) {
			result[key] = toString(value);
		}
		return result;
	}
	return {};
}

function toSpecialAbilities(ab: unknown): CreatureSpecialAbility[] {
	if (!ab || !Array.isArray(ab)) return [];
	return ab
		.map((a: unknown): CreatureSpecialAbility | null => {
			if (typeof a !== 'object' || a === null) {
				return null;
			}
			const ability = a as Record<string, unknown>;
			const name = toString(ability.name);
			const desc = toString(ability.desc);
			if (!name || !desc) return null;
			return {
				name,
				description: desc,
				attackBonus: ability.attack_bonus ? toNumber(ability.attack_bonus) : undefined,
				damage: ability.damage ? toDamageArray(ability.damage) : undefined
			};
		})
		.filter((a): a is CreatureSpecialAbility => a !== null);
}

function toActions(actions: unknown): CreatureAction[] {
	if (!actions || !Array.isArray(actions)) return [];
	return actions
		.map((a: unknown): CreatureAction | null => {
			if (typeof a !== 'object' || a === null) {
				return null;
			}
			const action = a as Record<string, unknown>;
			const name = toString(action.name);
			const desc = toString(action.desc);
			if (!name || !desc) return null;
			return {
				name,
				description: desc,
				attackBonus: action.attack_bonus ? toNumber(action.attack_bonus) : undefined,
				damage: action.damage ? toDamage(action.damage) : undefined,
				multiattack: action.multiattack
					? {
							actionName: toString((action.multiattack as Record<string, unknown>).action_name),
							count: toNumber((action.multiattack as Record<string, unknown>).count)
						}
					: undefined
			};
		})
		.filter((a): a is CreatureAction => a !== null);
}

function toDamage(damage: unknown): { dice: string; type: string } {
	if (typeof damage !== 'object' || damage === null) {
		return { dice: '', type: '' };
	}
	const d = damage as Record<string, unknown>;
	return {
		dice: toString(d.damage_dice),
		type: toName(d.damage_type)
	};
}

function toDamageArray(damage: unknown): Array<{ dice: string; type: string }> {
	if (!damage) return [];
	if (Array.isArray(damage)) {
		return damage.map((d) => toDamage(d));
	}
	return [toDamage(damage)];
}

function toReactions(reactions: unknown): Array<{ name: string; description: string }> | undefined {
	if (!reactions || !Array.isArray(reactions)) return undefined;
	return reactions
		.map((r: unknown): { name: string; description: string } | null => {
			if (typeof r !== 'object' || r === null) return null;
			const reaction = r as Record<string, unknown>;
			const name = toString(reaction.name);
			const desc = toString(reaction.desc);
			if (!name || !desc) return null;
			return { name, description: desc };
		})
		.filter((r): r is { name: string; description: string } => r !== null);
}

// ============================================================================
// Feat Transformer
// ============================================================================

export function transformToUnifiedFeat(item: typeof compendiumItems.$inferSelect): UnifiedFeat {
	const details = (item.details ?? {}) as Record<string, unknown>;
	const summary = toString(details.summary) || item.summary || '';

	return {
		id: item.id,
		name: item.name,
		summary: summary,
		source: item.source,
		description: toStringArray(details.description),
		slug: item.externalId ?? String(item.id),
		type: 'feat',
		prerequisites: toStringArray(details.prerequisites),
		benefits: toStringArray(details.benefits)
	};
}

// ============================================================================
// Background Transformer
// ============================================================================

export function transformToUnifiedBackground(
	item: typeof compendiumItems.$inferSelect
): UnifiedBackground {
	const details = (item.details ?? {}) as Record<string, unknown>;
	const summary = toString(details.summary) || item.summary || '';

	const feature = details.feature;
	const featureObj =
		feature && typeof feature === 'object'
			? {
					name: toString((feature as Record<string, unknown>).name),
					description: toString((feature as Record<string, unknown>).description)
				}
			: undefined;

	return {
		id: item.id,
		name: item.name,
		summary: summary,
		source: item.source,
		description: toStringArray(details.description),
		slug: item.externalId ?? String(item.id),
		type: 'background',
		feature: featureObj,
		skillProficiencies: toStringArray(details.skill_proficiencies),
		toolProficiencies: toStringArray(details.tool_proficiencies),
		languages: toString(details.languages),
		equipment: toStringArray(details.equipment)
	};
}

// ============================================================================
// Race Transformer
// ============================================================================

export function transformToUnifiedRace(item: typeof compendiumItems.$inferSelect): UnifiedRace {
	const details = (item.details ?? {}) as Record<string, unknown>;
	const summary = toString(details.summary) || item.summary || '';

	// Parse ability bonuses
	const bonuses: Array<{ ability: string; bonus: number }> = [];
	if (details.ability_bonuses && Array.isArray(details.ability_bonuses)) {
		for (const bonus of details.ability_bonuses) {
			if (typeof bonus === 'object' && bonus !== null) {
				const b = bonus as Record<string, unknown>;
				const ability = toName(b.ability_score);
				if (ability) {
					bonuses.push({ ability, bonus: toNumber(b.bonus) });
				}
			}
		}
	}

	// Parse traits
	const traits: Array<{ name: string; description: string }> = [];
	if (details.traits && Array.isArray(details.traits)) {
		for (const trait of details.traits) {
			if (typeof trait === 'object' && trait !== null) {
				const t = trait as Record<string, unknown>;
				traits.push({
					name: toString(t.name),
					description: toString(t.description)
				});
			}
		}
	}

	// If no traits, use description as main trait
	if (traits.length === 0) {
		const desc = toStringArray(details.description);
		if (desc.length > 0) {
			traits.push({ name: 'Description', description: desc.join('\n\n') });
		}
	}

	return {
		id: item.id,
		name: item.name,
		summary: summary,
		source: item.source,
		description: toStringArray(details.description),
		slug: item.externalId ?? String(item.id),
		type: 'race',
		size: toCreatureSize(details.size),
		speed: toNumber(details.speed) || 30,
		abilityBonuses: bonuses,
		traits: traits,
		proficiencies: {
			skills: toStringArray(details.skill_proficiencies),
			languages: toStringArray(details.languages)
		},
		age: toString(details.age),
		alignment: toString(details.alignment),
		sizeDescription: toString(details.size_description)
	};
}

// ============================================================================
// Class Transformer
// ============================================================================

export function transformToUnifiedClass(item: typeof compendiumItems.$inferSelect): UnifiedClass {
	const details = (item.details ?? {}) as Record<string, unknown>;
	const summary = toString(details.summary) || item.summary || '';

	// Parse features
	const features: Array<{ name: string; description: string; level: number }> = [];
	if (details.features && Array.isArray(details.features)) {
		for (const feature of details.features) {
			if (typeof feature === 'object' && feature !== null) {
				const f = feature as Record<string, unknown>;
				features.push({
					name: toString(f.name),
					description: toString(f.description),
					level: toNumber(f.level)
				});
			}
		}
	}

	// Parse proficiencies
	const proficiencies = {
		armor: toStringArray(details.armor),
		weapons: toString(details.weapons),
		tools: toStringArray(details.tools),
		skills: toStringArray(details.skill_proficiencies),
		savingThrows: toClassNamesArray(details.saving_throws)
	};

	// Parse spellcasting
	let spellcasting;
	if (details.spellcasting && typeof details.spellcasting === 'object') {
		const sc = details.spellcasting as Record<string, unknown>;
		spellcasting = {
			ability: toName(sc.ability),
			dc: toNumber(sc.dc),
			modifier: toNumber(sc.modifier)
		};
	}

	// Parse subclasses
	let subclasses;
	if (details.subclasses && Array.isArray(details.subclasses)) {
		subclasses = details.subclasses
			.map((s: unknown): { name: string; description: string } | null => {
				if (typeof s === 'object' && s !== null) {
					const name = toName(s);
					const desc = toString((s as Record<string, unknown>).description);
					if (name && desc) return { name, description: desc };
				}
				return null;
			})
			.filter((s): s is { name: string; description: string } => s !== null);
	}

	return {
		id: item.id,
		name: item.name,
		summary: summary,
		source: item.source,
		description: toStringArray(details.description),
		slug: item.externalId ?? String(item.id),
		type: 'class',
		hitDie: toNumber(details.hit_die) ?? 8,
		proficiencies,
		spellcasting,
		features,
		subclasses
	};
}

// ============================================================================
// Item Transformer
// ============================================================================

export function transformToUnifiedItem(item: typeof compendiumItems.$inferSelect): UnifiedItem {
	const details = (item.details ?? {}) as Record<string, unknown>;
	const summary = toString(details.summary) || item.summary || '';

	return {
		id: item.id,
		name: item.name,
		summary: summary,
		source: item.source,
		description: toStringArray(details.description),
		slug: item.externalId ?? String(item.id),
		type: 'item',
		rarity: toString(details.rarity) || 'Common',
		itemType: toString(details.type) || 'Unknown',
		requiresAttunement: Boolean(details.requires_attunement || details.attunement),
		attunementRequirements: toString(details.attunement_requirements || details.attunement),
		weight: toNumber(details.weight),
		value: toNumber(details.value),
		magicProperties: details.attack_bonus
			? {
					attackBonus: toNumber(details.attack_bonus),
					damage: toString(details.damage)
				}
			: undefined,
		armorProperties:
			details.armor_class || details.armor_class !== undefined
				? {
						class: toNumber(details.armor_class),
						strengthRequirement: toNumber(details.strength_requirement),
						stealthPenalty: Boolean(details.stealth_penalty)
					}
				: undefined
	};
}

// ============================================================================
// Dispatcher
// ============================================================================

/**
 * Transform a database record to the appropriate unified type based on its type field.
 */
export function transformToUnified(
	item: typeof compendiumItems.$inferSelect
):
	| UnifiedSpell
	| UnifiedCreature
	| UnifiedFeat
	| UnifiedBackground
	| UnifiedRace
	| UnifiedClass
	| UnifiedItem
	| UnifiedCondition
	| UnifiedLanguage
	| UnifiedSkill
	| UnifiedAbilityScore {
	switch (item.type) {
		case 'spells':
			return transformToUnifiedSpell(item);
		case 'creatures':
			return transformToUnifiedCreature(item);
		case 'feats':
			return transformToUnifiedFeat(item);
		case 'backgrounds':
			return transformToUnifiedBackground(item);
		case 'species':
			return transformToUnifiedRace(item);
		case 'classes':
			return transformToUnifiedClass(item);
		case 'magicitems':
			return transformToUnifiedItem(item);
		case 'conditions':
		case 'languages':
		case 'alignments':
		case 'skills':
			return {
				id: item.id,
				name: item.name,
				type: item.type as any,
				summary: item.summary || '',
				description: [] as string[],
				source: item.source,
				slug: item.name.toLowerCase().replace(/\s+/g, '-'),
				details: item.details as Record<string, unknown> | undefined
			};
		default:
			return {
				id: item.id,
				name: item.name,
				summary: item.summary || '',
				source: item.source,
				description: toStringArray(item.details),
				slug: item.externalId ?? String(item.id),
				type: 'item',
				rarity: 'Unknown',
				itemType: 'Unknown',
				requiresAttunement: false
			} as UnifiedItem;
	}
}

/**
 * Logger instance for transformer warnings
 */
function logwarn() {
	return logger.child({ module: 'CompendiumTransformer' });
}
