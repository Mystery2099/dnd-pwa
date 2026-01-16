/**
 * Zod Validation Schemas
 *
 * Runtime validation for API responses and data transformations.
 * Used to validate external data before processing.
 */

import { z } from 'zod';

// ============================================================================
// Open5e API v2 Schemas
// ============================================================================

export const Open5eDocumentSchema = z.object({
	name: z.string(),
	key: z.string(),
	type: z.string().optional(),
	display_name: z.string().optional(),
	publisher: z
		.object({
			name: z.string(),
			key: z.string(),
			url: z.string().optional()
		})
		.optional(),
	gamesystem: z
		.object({
			name: z.string(),
			key: z.string(),
			url: z.string().optional()
		})
		.optional(),
	permalink: z.string().optional()
});

export const Open5eSchoolSchema = z.object({
	name: z.string(),
	key: z.string(),
	url: z.string().optional()
});

export const Open5eSpellSchema = z.object({
	higher_level: z.string().optional(),
	level: z.number(),
	casting_options: z
		.array(
			z.object({
				name: z.string(),
				order: z.number().optional()
			})
		)
		.optional(),
	school: Open5eSchoolSchema.optional(),
	classes: z
		.array(
			z.object({
				name: z.string(),
				key: z.string(),
				url: z.string().optional()
			})
		)
		.optional(),
	range_unit: z.string().optional(),
	shape_size_unit: z.string().optional(),
	target_type: z.string().optional(),
	range_text: z.string().optional(),
	range: z.number().nullable().optional(),
	ritual: z.boolean(),
	casting_time: z.string(),
	reaction_condition: z.string().nullable().optional(),
	verbal: z.boolean(),
	somatic: z.boolean(),
	material: z.boolean(),
	material_specified: z.string().optional(),
	material_cost: z.string().nullable().optional(),
	material_consumed: z.boolean(),
	target_count: z.number().nullable().optional(),
	saving_throw_ability: z.string().nullable().optional(),
	attack_roll: z.boolean(),
	damage_roll: z.string().optional(),
	damage_types: z.array(z.string()).optional(),
	duration: z.string(),
	shape_type: z.string().nullable().optional(),
	shape_size: z.number().nullable().optional(),
	concentration: z.boolean()
});

export const Open5eCreatureSchema = z.object({
	url: z.string().optional(),
	document: Open5eDocumentSchema.optional(),
	key: z.string(),
	name: z.string(),
	type: z
		.object({
			name: z.string(),
			key: z.string(),
			url: z.string().optional()
		})
		.optional(),
	size: z
		.object({
			name: z.string(),
			key: z.string(),
			url: z.string().optional()
		})
		.optional(),
	challenge_rating_decimal: z.string().optional(),
	challenge_rating_text: z.string().optional(),
	proficiency_bonus: z.number().nullable().optional(),
	speed: z
		.object({
			walk: z.number().optional(),
			unit: z.string().optional(),
			swim: z.number().optional()
		})
		.optional(),
	speed_all: z.record(z.string(), z.boolean()).optional(),
	category: z.string().optional(),
	subcategory: z.string().nullable().optional(),
	alignment: z.string().optional(),
	languages: z
		.object({
			data: z.array(z.string()).optional()
		})
		.optional(),
	armor_class: z.number().optional(),
	armor_detail: z.string().optional(),
	hit_points: z.number().optional(),
	hit_dice: z.string().optional(),
	experience_points: z.number().optional(),
	ability_scores: z
		.object({
			strength: z.number().optional(),
			dexterity: z.number().optional(),
			constitution: z.number().optional(),
			intelligence: z.number().optional(),
			wisdom: z.number().optional(),
			charisma: z.number().optional()
		})
		.optional(),
	modifiers: z.record(z.string(), z.number()).optional(),
	initiative_bonus: z.number().optional(),
	saving_throws: z.record(z.string(), z.number()).optional(),
	skill_bonuses: z.record(z.string(), z.number()).optional(),
	passive_perception: z.number().optional(),
	resistances_and_immunities: z
		.object({
			damage: z.array(z.string()).optional(),
			condition: z.array(z.string()).optional()
		})
		.optional(),
	normal_sight_range: z.number().optional(),
	darkvision_range: z.number().optional(),
	blindsight_range: z.number().optional(),
	tremorsense_range: z.number().nullable().optional(),
	truesight_range: z.number().nullable().optional(),
	actions: z
		.array(
			z.object({
				name: z.string(),
				desc: z.string(),
				action_type: z.string().optional(),
				attack_bonus: z.number().optional(),
				damage: z
					.object({
						dice: z.string().optional(),
						type: z.string().optional()
					})
					.optional()
			})
		)
		.optional(),
	traits: z
		.array(
			z.object({
				name: z.string(),
				desc: z.string()
			})
		)
		.optional(),
	environments: z.array(z.string()).optional(),
	illustration: z.string().nullable().optional()
});

export const Open5eSpeciesSchema = z.object({
	url: z.string().optional(),
	document: Open5eDocumentSchema.optional(),
	key: z.string(),
	name: z.string(),
	desc: z.string().optional(),
	is_subspecies: z.boolean().optional(),
	subspecies_of: z.string().nullable().optional(),
	traits: z
		.array(
			z.object({
				name: z.string(),
				desc: z.string(),
				type: z.string().optional(),
				order: z.number().optional()
			})
		)
		.optional()
});

export const Open5eListResponseSchema = z.object({
	count: z.number().optional(),
	next: z.string().nullable(),
	previous: z.string().nullable(),
	results: z.array(z.unknown())
});

export const Open5eItemSchema = z.object({
	slug: z.string(),
	name: z.string(),
	type: z.string().optional(),
	rarity: z.string().optional(),
	description: z.string().optional()
});

// ============================================================================
// SRD GraphQL Schemas
// ============================================================================

export const SrdSpellSchema = z.object({
	index: z.string(),
	name: z.string(),
	level: z.number(),
	school: z.object({ name: z.string() }),
	classes: z.array(z.object({ name: z.string() })).optional(),
	desc: z.array(z.string()),
	higher_level: z.array(z.string()).nullable().optional(),
	range: z.string(),
	components: z.array(z.string()),
	material: z.string().nullable().optional(),
	ritual: z.boolean(),
	duration: z.string(),
	concentration: z.boolean(),
	casting_time: z.string()
});

export const SrdCreatureSummarySchema = z.object({
	index: z.string(),
	name: z.string(),
	type: z.string(),
	size: z.string(),
	challenge_rating: z.number()
});

export const SrdCreatureDetailSchema = SrdCreatureSummarySchema.extend({
	alignment: z.string().optional(),
	subtype: z.string().optional(),
	armor_class: z
		.union([z.number(), z.array(z.object({ type: z.string(), value: z.number() }))])
		.optional(),
	armor_desc: z.string().nullable().optional(),
	hit_points: z.number().optional(),
	hit_dice: z.string().optional(),
	speed: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
	strength: z.number().optional(),
	dexterity: z.number().optional(),
	constitution: z.number().optional(),
	intelligence: z.number().optional(),
	wisdom: z.number().optional(),
	charisma: z.number().optional(),
	skills: z.record(z.string(), z.number()).optional(),
	damage_vulnerabilities: z.string().optional(),
	damage_resistances: z.string().optional(),
	damage_immunities: z.string().optional(),
	condition_immunities: z.string().optional(),
	senses: z.string().optional(),
	languages: z.string().optional(),
	actions: z
		.array(
			z.object({
				name: z.string(),
				desc: z.string(),
				attack_bonus: z.number().optional(),
				damage: z
					.array(
						z.object({
							damage_type: z.object({
								index: z.string(),
								name: z.string(),
								url: z.string().optional()
							}),
							damage_dice: z.string()
						})
					)
					.optional(),
				multiattack: z
					.object({
						action_name: z.string(),
						count: z.number()
					})
					.optional(),
				multiattack_type: z.string().optional(),
				actions: z
					.array(
						z.object({
							action_name: z.string(),
							count: z.string(),
							type: z.string().optional()
						})
					)
					.optional(),
				usage: z
					.object({
						type: z.string(),
						times: z.number()
					})
					.optional()
			})
		)
		.optional(),
	special_abilities: z
		.array(
			z.object({
				name: z.string(),
				desc: z.string(),
				attack_bonus: z.number().optional(),
				damage: z
					.array(
						z.object({
							damage_type: z.object({
								index: z.string(),
								name: z.string(),
								url: z.string().optional()
							}),
							damage_dice: z.string()
						})
					)
					.optional(),
				dc: z
					.object({
						dc_type: z.object({ index: z.string(), name: z.string(), url: z.string().optional() }),
						dc_value: z.number(),
						success_type: z.string()
					})
					.optional(),
				usage: z
					.object({
						type: z.string(),
						times: z.number()
					})
					.optional()
			})
		)
		.optional(),
	legendary_actions: z
		.array(
			z.object({
				name: z.string(),
				desc: z.string(),
				attack_bonus: z.number().optional(),
				damage: z
					.array(
						z.object({
							damage_type: z.object({
								index: z.string(),
								name: z.string(),
								url: z.string().optional()
							}),
							damage_dice: z.string()
						})
					)
					.optional()
			})
		)
		.optional(),
	reactions: z
		.array(
			z.object({
				name: z.string(),
				desc: z.string(),
				damage: z
					.array(
						z.object({
							damage_type: z.object({
								index: z.string(),
								name: z.string(),
								url: z.string().optional()
							}),
							damage_dice: z.string()
						})
					)
					.optional()
			})
		)
		.optional()
});

// ============================================================================
// Homebrew Schema
// ============================================================================

export const HomebrewItemSchema = z.object({
	slug: z.string().optional(),
	index: z.string().optional(),
	id: z.string().optional(),
	name: z.string(),
	level: z.union([z.number(), z.string()]).optional(),
	school: z.union([z.string(), z.object({ name: z.string() })]).optional(),
	size: z.string().optional(),
	type: z.string().optional(),
	challenge_rating: z.union([z.number(), z.string()]).optional()
});

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Safely parse data with a Zod schema
 * Returns parsed data or throws with descriptive error
 */
export function validateData<T>(schema: z.ZodType<T>, data: unknown, context: string): T {
	const result = schema.safeParse(data);
	if (!result.success) {
		const error = result.error;
		// Note: This is a utility function that may be called from both client and server
		// For server-side validation, use logger directly in the calling code
		throw new Error(`Invalid ${context} data: ${error.message}`);
	}
	return result.data;
}

/**
 * Optional validation - returns null on failure instead of throwing
 */
export function tryValidate<T>(schema: z.ZodType<T>, data: unknown, context: string): T | null {
	const result = schema.safeParse(data);
	if (!result.success) {
		console.warn(`[validation] ${context} validation failed, using raw data`);
		return null;
	}
	return result.data;
}

// ============================================================================
// SRD Subclass Schema
// ============================================================================

export const SrdSubclassSchema = z.object({
	index: z.string(),
	name: z.string(),
	class: z.object({ index: z.string(), name: z.string() }),
	subclass_flavor: z.string().optional(),
	desc: z.array(z.string()),
	features: z
		.array(
			z.object({
				index: z.string(),
				name: z.string(),
				level: z.number(),
				url: z.string().optional()
			})
		)
		.optional()
});

// ============================================================================
// SRD Subrace Schema
// ============================================================================

export const SrdSubraceSchema = z.object({
	index: z.string(),
	name: z.string(),
	race: z.object({ index: z.string(), name: z.string() }),
	desc: z.string().optional(),
	ability_bonuses: z
		.array(
			z.object({
				ability_score: z.object({ index: z.string(), name: z.string() }),
				bonus: z.number()
			})
		)
		.optional(),
	traits: z
		.array(
			z.object({
				index: z.string(),
				name: z.string(),
				url: z.string().optional()
			})
		)
		.optional(),
	starting_proficiencies: z
		.array(
			z.object({
				index: z.string(),
				name: z.string(),
				type: z.string()
			})
		)
		.optional()
});

// ============================================================================
// SRD Trait Schema
// ============================================================================

export const SrdTraitSchema = z.object({
	index: z.string(),
	name: z.string(),
	desc: z.string().optional(),
	races: z
		.array(
			z.object({
				index: z.string(),
				name: z.string()
			})
		)
		.optional(),
	url: z.string().optional()
});

// ============================================================================
// SRD Condition Schema
// ============================================================================

export const SrdConditionSchema = z.object({
	index: z.string(),
	name: z.string(),
	desc: z.array(z.string()),
	url: z.string().optional()
});

// ============================================================================
// SRD Skill Schema
// ============================================================================

export const SrdSkillSchema = z.object({
	index: z.string(),
	name: z.string(),
	ability_score: z.object({ index: z.string(), name: z.string() }),
	desc: z.array(z.string()).optional(),
	url: z.string().optional()
});

// ============================================================================
// SRD Language Schema
// ============================================================================

export const SrdLanguageSchema = z.object({
	index: z.string(),
	name: z.string(),
	typical_speakers: z.array(z.string()).optional(),
	script: z.string().optional(),
	url: z.string().optional()
});

// ============================================================================
// SRD Ability Score Schema
// ============================================================================

export const SrdAbilityScoreSchema = z.object({
	index: z.string(),
	name: z.string(),
	abbreviation: z.string(),
	desc: z.array(z.string()).optional(),
	full_name: z.string().optional(),
	url: z.string().optional()
});

// ============================================================================
// SRD Proficiency Schema
// ============================================================================

export const SrdProficiencySchema = z.object({
	index: z.string(),
	name: z.string(),
	type: z.string(),
	url: z.string().optional()
});

// ============================================================================
// SRD Damage Type Schema
// ============================================================================

export const SrdDamageTypeSchema = z.object({
	index: z.string(),
	name: z.string(),
	desc: z.array(z.string()).optional(),
	url: z.string().optional()
});

// ============================================================================
// SRD Magic School Schema
// ============================================================================

export const SrdMagicSchoolSchema = z.object({
	index: z.string(),
	name: z.string(),
	desc: z.array(z.string()).optional(),
	url: z.string().optional()
});

// ============================================================================
// Open5e Condition Schema (includes A5e conditions)
// ============================================================================

export const Open5eConditionSchema = z.object({
	slug: z.string(),
	name: z.string(),
	description: z.array(z.string()).optional(),
	srd_version: z.string().optional()
});

// ============================================================================
// Type Exports (derived from Zod schemas)
// These are the source of truth for TypeScript types
// ============================================================================

export type Open5eSpell = z.infer<typeof Open5eSpellSchema>;
export type Open5eCreature = z.infer<typeof Open5eCreatureSchema>;
export type Open5eSpecies = z.infer<typeof Open5eSpeciesSchema>;
export type Open5eItem = z.infer<typeof Open5eItemSchema>;
export type Open5eListResponse = z.infer<typeof Open5eListResponseSchema>;
export type SrdSpell = z.infer<typeof SrdSpellSchema>;
export type SrdCreatureSummary = z.infer<typeof SrdCreatureSummarySchema>;
export type SrdCreatureDetail = z.infer<typeof SrdCreatureDetailSchema>;
export type SrdSubclass = z.infer<typeof SrdSubclassSchema>;
export type SrdSubrace = z.infer<typeof SrdSubraceSchema>;
export type SrdTrait = z.infer<typeof SrdTraitSchema>;
export type SrdCondition = z.infer<typeof SrdConditionSchema>;
export type SrdSkill = z.infer<typeof SrdSkillSchema>;
export type SrdLanguage = z.infer<typeof SrdLanguageSchema>;
export type SrdAbilityScore = z.infer<typeof SrdAbilityScoreSchema>;
export type SrdProficiency = z.infer<typeof SrdProficiencySchema>;
export type SrdDamageType = z.infer<typeof SrdDamageTypeSchema>;
export type SrdMagicSchool = z.infer<typeof SrdMagicSchoolSchema>;
export type Open5eCondition = z.infer<typeof Open5eConditionSchema>;
export type HomebrewItem = z.infer<typeof HomebrewItemSchema>;

// ============================================================================
// SRD Feature Schema (Class Features)
// ============================================================================

export const SrdFeatureSchema = z.object({
	index: z.string(),
	name: z.string(),
	level: z.number(),
	description: z.array(z.string()).optional(),
	class: z.object({ index: z.string(), name: z.string() }).optional(),
	subclass: z.object({ index: z.string(), name: z.string() }).optional(),
	feature_flags: z.array(z.string()).optional(),
	granters: z
		.array(
			z.object({
				index: z.string(),
				name: z.string(),
				type: z.string()
			})
		)
		.optional(),
	media: z
		.array(
			z.object({
				index: z.string(),
				title: z.string(),
				slug: z.string(),
				url: z.string()
			})
		)
		.optional()
});

// ============================================================================
// SRD Alignment Schema
// ============================================================================

export const SrdAlignmentSchema = z.object({
	index: z.string(),
	name: z.string(),
	abbreviation: z.string(),
	desc: z.string().optional()
});

// ============================================================================
// SRD Equipment Schema
// ============================================================================

export const SrdEquipmentSchema = z.object({
	index: z.string(),
	name: z.string(),
	equipment_category: z.object({ index: z.string(), name: z.string() }),
	cost: z.object({ quantity: z.number(), unit: z.string() }).optional(),
	weight: z.number().optional(),
	desc: z.array(z.string()).optional(),
	rarity: z.object({ name: z.string() }).optional(),
	requires_attunement: z.boolean().optional()
});

// ============================================================================
// SRD Weapon Property Schema
// ============================================================================

export const SrdWeaponPropertySchema = z.object({
	index: z.string(),
	name: z.string(),
	desc: z.array(z.string()).optional(),
	url: z.string().optional()
});

// ============================================================================
// SRD Equipment Category Schema
// ============================================================================

export const SrdEquipmentCategorySchema = z.object({
	index: z.string(),
	name: z.string(),
	url: z.string().optional()
});

// ============================================================================
// SRD Vehicle Schema
// ============================================================================

export const SrdVehicleSchema = z.object({
	index: z.string(),
	name: z.string(),
	vehicle_category: z.object({ index: z.string(), name: z.string() }),
	capacity: z.string().optional(),
	speed: z.object({ quantity: z.number(), unit: z.string() }).optional(),
	desc: z.array(z.string()).optional(),
	url: z.string().optional()
});

// ============================================================================
// SRD Monster Type Schema
// ============================================================================

export const SrdMonsterTypeSchema = z.object({
	index: z.string(),
	name: z.string(),
	desc: z.string().optional(),
	symbol: z.string().optional(),
	url: z.string().optional()
});

// ============================================================================
// SRD Rule Section Schema
// ============================================================================

export const SrdRuleSectionSchema = z.object({
	index: z.string(),
	name: z.string(),
	desc: z.string(),
	url: z.string().optional()
});

// ============================================================================
// SRD Rule Schema
// ============================================================================

export const SrdRuleSchema = z.object({
	index: z.string(),
	name: z.string(),
	subsections: z
		.array(z.object({ index: z.string(), name: z.string(), url: z.string().optional() }))
		.optional(),
	url: z.string().optional()
});

// ============================================================================
// Additional Type Exports
// ============================================================================

export type SrdFeature = z.infer<typeof SrdFeatureSchema>;
export type SrdAlignment = z.infer<typeof SrdAlignmentSchema>;
export type SrdEquipment = z.infer<typeof SrdEquipmentSchema>;
export type SrdWeaponProperty = z.infer<typeof SrdWeaponPropertySchema>;
export type SrdEquipmentCategory = z.infer<typeof SrdEquipmentCategorySchema>;
export type SrdVehicle = z.infer<typeof SrdVehicleSchema>;
export type SrdMonsterType = z.infer<typeof SrdMonsterTypeSchema>;
export type SrdRuleSection = z.infer<typeof SrdRuleSectionSchema>;
export type SrdRule = z.infer<typeof SrdRuleSchema>;

// ============================================================================
// Open5e v2 JSON Schemas (raw GitHub releases)
// Used for Hybrid SQLite approach - direct JSON ingestion
// ============================================================================

export const Open5eV2SpellSchema = z.object({
	index: z.string(),
	name: z.string(),
	level: z.number(),
	school: z.object({ name: z.string() }).optional(),
	classes: z.array(z.object({ name: z.string() })).optional(),
	desc: z.array(z.string()),
	higher_level: z.array(z.string()).nullable().optional(),
	range: z.string(),
	components: z.array(z.string()).optional(),
	material: z.string().nullable().optional(),
	ritual: z.boolean(),
	duration: z.string(),
	concentration: z.boolean(),
	casting_time: z.string()
});

export const Open5eV2CreatureSchema = z.object({
	index: z.string(),
	name: z.string(),
	size: z.string().optional(),
	type: z.string().optional(),
	subtype: z.string().nullable().optional(),
	alignment: z.string().optional(),
	challenge_rating: z.number().optional(),
	armor_class: z.number().optional(),
	hit_points: z.number().optional(),
	hit_dice: z.string().optional(),
	speed: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
	strength: z.number().optional(),
	dexterity: z.number().optional(),
	constitution: z.number().optional(),
	intelligence: z.number().optional(),
	wisdom: z.number().optional(),
	charisma: z.number().optional(),
	actions: z.array(z.object({ name: z.string(), desc: z.string() })).optional()
});

export const Open5eV2MagicItemSchema = z.object({
	index: z.string(),
	name: z.string(),
	rarity: z.object({ name: z.string() }).optional(),
	type: z.string().optional(),
	description: z.array(z.string()).optional()
});

export const Open5eV2FeatSchema = z.object({
	index: z.string(),
	name: z.string(),
	prerequisites: z.array(z.string()).optional(),
	description: z.array(z.string()).optional()
});

export const Open5eV2BackgroundSchema = z.object({
	index: z.string(),
	name: z.string(),
	feature: z.object({ name: z.string(), desc: z.string() }).optional()
});

export const Open5eV2SpeciesSchema = z.object({
	index: z.string(),
	name: z.string(),
	desc: z.string().optional(),
	traits: z.array(z.object({ name: z.string(), desc: z.string() })).optional(),
	is_subspecies: z.boolean().optional()
});

export const Open5eV2ClassSchema = z.object({
	index: z.string(),
	name: z.string(),
	hit_die: z.number()
});

// ============================================================================
// Open5e v2 Type Exports
// ============================================================================

export type Open5eV2Spell = z.infer<typeof Open5eV2SpellSchema>;
export type Open5eV2Creature = z.infer<typeof Open5eV2CreatureSchema>;
export type Open5eV2MagicItem = z.infer<typeof Open5eV2MagicItemSchema>;
export type Open5eV2Feat = z.infer<typeof Open5eV2FeatSchema>;
export type Open5eV2Background = z.infer<typeof Open5eV2BackgroundSchema>;
export type Open5eV2Species = z.infer<typeof Open5eV2SpeciesSchema>;
export type Open5eV2Class = z.infer<typeof Open5eV2ClassSchema>;
