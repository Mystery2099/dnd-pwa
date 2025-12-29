import { z } from 'zod';

export const FiveEBitsSpellSchema = z.object({
	index: z.string(),
	name: z.string(),
	desc: z.array(z.string()),
	higher_level: z.string().nullable(),
	range: z.string(),
	components: z.array(z.string()),
	material: z.string().nullable(),
	ritual: z.boolean(),
	duration: z.string(),
	concentration: z.boolean(),
	casting_time: z.string(),
	level: z.number(),
	school: z.object({
		index: z.string(),
		name: z.string()
	}),
	classes: z.array(
		z.object({
			index: z.string(),
			name: z.string()
		})
	),
	subclasses: z
		.array(
			z.object({
				index: z.string(),
				name: z.string()
			})
		)
		.nullable()
});

export const FiveEBitsMonsterSchema = z.object({
	index: z.string(),
	name: z.string(),
	size: z.string(),
	type: z.string(),
	subtype: z.string().nullable(),
	alignment: z.string(),
	armor_class: z.array(z.object({ type: z.string(), value: z.number() })),
	hit_points: z.number(),
	hit_dice: z.string(),
	speed: z.record(z.string(), z.string()),
	strength: z.number(),
	dexterity: z.number(),
	constitution: z.number(),
	intelligence: z.number(),
	wisdom: z.number(),
	charisma: z.number(),
	proficiencies: z.array(
		z.object({
			proficiency: z.object({ index: z.string(), name: z.string() }),
			value: z.number()
		})
	),
	damage_vulnerabilities: z.array(z.string()),
	damage_resistances: z.array(z.string()),
	damage_immunities: z.array(z.string()),
	condition_immunities: z.array(z.string()),
	senses: z.record(z.string(), z.string()),
	languages: z.string(),
	challenge_rating: z.string(),
	xp: z.number(),
	special_abilities: z.array(
		z.object({
			name: z.string(),
			desc: z.string(),
			attack_bonus: z.number().optional(),
			damage: z
				.array(
					z.object({
						damage_type: z.object({ index: z.string(), name: z.string() }),
						damage_dice: z.string()
					})
				)
				.optional()
		})
	),
	actions: z.array(
		z.object({
			name: z.string(),
			desc: z.string(),
			attack_bonus: z.number().optional(),
			damage: z
				.array(
					z.object({
						damage_type: z.object({ index: z.string(), name: z.string() }),
						damage_dice: z.string()
					})
				)
				.optional(),
			multiattack: z.object({ action_name: z.string(), count: z.number() }).optional()
		})
	),
	legendary_actions: z
		.array(
			z.object({
				name: z.string(),
				desc: z.string(),
				attack_bonus: z.number().optional(),
				damage: z
					.array(
						z.object({
							damage_type: z.object({ index: z.string(), name: z.string() }),
							damage_dice: z.string()
						})
					)
					.optional()
			})
		)
		.optional(),
	reactions: z.array(z.object({ name: z.string(), desc: z.string() })).optional()
});

export const FiveEBitsFeatSchema = z.object({
	index: z.string(),
	name: z.string(),
	prerequisites: z.array(z.string()).optional(),
	description: z.array(z.string()),
	ability_score_increases: z
		.array(
			z.object({
				ability_score: z.object({ index: z.string(), name: z.string() }),
				increase: z.number()
			})
		)
		.optional()
});

export const FiveEBitsBackgroundSchema = z.object({
	index: z.string(),
	name: z.string(),
	description: z.array(z.string()),
	feature: z
		.object({
			name: z.string(),
			description: z.string()
		})
		.optional(),
	skill_proficiencies: z.array(z.string()).optional(),
	tool_proficiencies: z.array(z.string()).optional()
});

export const FiveEBitsRaceSchema = z.object({
	index: z.string(),
	name: z.string(),
	size: z.string(),
	speed: z.number(),
	ability_bonuses: z
		.array(
			z.object({
				ability_score: z.object({ index: z.string(), name: z.string() }),
				bonus: z.number()
			})
		)
		.optional(),
	traits: z.array(z.string()).optional(),
	languages: z.array(z.string()).optional(),
	subraces: z.array(z.string()).optional()
});

export const FiveEBitsClassSchema = z.object({
	index: z.string(),
	name: z.string(),
	hit_die: z.number(),
	proficiency_choices: z
		.array(
			z.object({
				type: z.string(),
				choose: z.number(),
				from: z.array(z.object({ index: z.string(), name: z.string() }))
			})
		)
		.optional(),
	proficiencies: z.array(z.object({ index: z.string(), name: z.string() })),
	saving_throws: z.array(z.object({ index: z.string(), name: z.string() })),
	spellcasting: z
		.object({
			level: z.number(),
			ability: z.object({ index: z.string(), name: z.string() }),
			dc: z.number(),
			mod: z.number()
		})
		.optional(),
	subclasses: z.array(z.string()).optional()
});
