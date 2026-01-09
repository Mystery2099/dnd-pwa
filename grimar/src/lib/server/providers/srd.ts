/**
 * SRD Provider
 *
 * Adapter for the D&D 5e SRD API (https://www.dnd5eapi.co)
 * Wraps the existing srd.ts client to implement the provider interface.
 */

import { BaseProvider } from './base-provider';
import {
	getSpells as getSpellsApi,
	getSpellDetail,
	getMonsters as getMonstersApi,
	getMonsterDetail,
	getMonstersWithDetails,
	getSubclasses as getSubclassesApi,
	getSubclassDetail,
	getSubraces as getSubracesApi,
	getSubraceDetail,
	getTraits as getTraitsApi,
	getTraitDetail,
	getConditions as getConditionsApi,
	getConditionDetail,
	getFeatures as getFeaturesApi,
	getFeatureDetail,
	getSkills as getSkillsApi,
	getSkillDetail,
	getLanguages as getLanguagesApi,
	getLanguageDetail,
	getAlignments as getAlignmentsApi,
	getAlignmentDetail,
	getProficiencies as getProficienciesApi,
	getProficiencyDetail,
	getAbilityScores as getAbilityScoresApi,
	getAbilityScoreDetail,
	getDamageTypes as getDamageTypesApi,
	getDamageTypeDetail,
	getMagicSchools as getMagicSchoolsApi,
	getMagicSchoolDetail,
	getEquipment as getEquipmentApi,
	getEquipmentDetail,
	getWeaponProperties as getWeaponPropertiesApi,
	getWeaponPropertyDetail,
	getEquipmentCategories as getEquipmentCategoriesApi,
	getEquipmentCategoryDetail,
	getVehicles as getVehiclesApi,
	getVehicleDetail,
	getMonsterTypes as getMonsterTypesApi,
	getMonsterTypeDetail,
	getRuleSections as getRuleSectionsApi,
	getRuleSectionDetail,
	getRules as getRulesApi,
	getRuleDetail,
	type SrdSpell,
	type SrdMonsterSummary
} from '$lib/server/services/compendium/srd';
import type { FetchOptions, ProviderListResponse, TransformResult } from './types';
import type { CompendiumTypeName } from '$lib/core/types/compendium';
import {
	SrdSpellSchema,
	SrdMonsterDetailSchema,
	SrdSubclassSchema,
	SrdSubraceSchema,
	SrdTraitSchema,
	SrdConditionSchema,
	SrdFeatureSchema,
	SrdSkillSchema,
	SrdLanguageSchema,
	SrdAlignmentSchema,
	SrdProficiencySchema,
	SrdAbilityScoreSchema,
	SrdDamageTypeSchema,
	SrdMagicSchoolSchema,
	SrdEquipmentSchema,
	SrdWeaponPropertySchema,
	SrdEquipmentCategorySchema,
	SrdVehicleSchema,
	SrdMonsterTypeSchema,
	SrdRuleSectionSchema,
	SrdRuleSchema,
	validateData,
	tryValidate
} from '$lib/core/types/compendium/schemas';
import { z } from 'zod';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('SrdProvider');

/**
 * SRD Provider Implementation
 * Uses GraphQL for efficient list fetching
 */
export class SrdProvider extends BaseProvider {
	readonly id = 'srd';
	readonly name = 'D&D 5e SRD';
	readonly baseUrl = 'https://www.dnd5eapi.co/api';

	private static readonly DEFAULT_TYPES = [
		'spell',
		'monster',
		'subclass',
		'subrace',
		'trait',
		'condition',
		'feature',
		'skill',
		'language',
		'alignment',
		'proficiency',
		'abilityScore',
		'damageType',
		'magicSchool',
		'equipment',
		'weaponProperty',
		'equipmentCategory',
		'vehicle',
		'monsterType',
		'ruleSection',
		'rule'
	] as const satisfies readonly CompendiumTypeName[];

	constructor(supportedTypes?: readonly CompendiumTypeName[]) {
		super(supportedTypes ?? SrdProvider.DEFAULT_TYPES);
	}

	async fetchList(type: CompendiumTypeName, options?: FetchOptions): Promise<ProviderListResponse> {
		const limit = options?.limit || 500;

		if (type === 'spell') {
			const spells = await getSpellsApi(limit);
			return { items: spells, hasMore: false };
		}
		if (type === 'monster') {
			const monsters = await getMonstersApi(limit);
			return { items: monsters, hasMore: false };
		}
		if (type === 'subclass') {
			const subclasses = await getSubclassesApi(limit);
			return { items: subclasses, hasMore: false };
		}
		if (type === 'subrace') {
			const subraces = await getSubracesApi(limit);
			return { items: subraces, hasMore: false };
		}
		if (type === 'trait') {
			const traits = await getTraitsApi(limit);
			return { items: traits, hasMore: false };
		}
		if (type === 'condition') {
			const conditions = await getConditionsApi(limit);
			return { items: conditions, hasMore: false };
		}
		if (type === 'feature') {
			const features = await getFeaturesApi(limit);
			return { items: features, hasMore: false };
		}
		if (type === 'skill') {
			const skills = await getSkillsApi(limit);
			return { items: skills, hasMore: false };
		}
		if (type === 'language') {
			const languages = await getLanguagesApi(limit);
			return { items: languages, hasMore: false };
		}
		if (type === 'alignment') {
			const alignments = await getAlignmentsApi(limit);
			return { items: alignments, hasMore: false };
		}
		if (type === 'proficiency') {
			const proficiencies = await getProficienciesApi(limit);
			return { items: proficiencies, hasMore: false };
		}
		if (type === 'abilityScore') {
			const abilityScores = await getAbilityScoresApi(limit);
			return { items: abilityScores, hasMore: false };
		}
		if (type === 'damageType') {
			const damageTypes = await getDamageTypesApi(limit);
			return { items: damageTypes, hasMore: false };
		}
		if (type === 'magicSchool') {
			const magicSchools = await getMagicSchoolsApi(limit);
			return { items: magicSchools, hasMore: false };
		}
		if (type === 'equipment') {
			const equipment = await getEquipmentApi(limit);
			return { items: equipment, hasMore: false };
		}
		if (type === 'weaponProperty') {
			const weaponProperties = await getWeaponPropertiesApi(limit);
			return { items: weaponProperties, hasMore: false };
		}
		if (type === 'equipmentCategory') {
			const equipmentCategories = await getEquipmentCategoriesApi(limit);
			return { items: equipmentCategories, hasMore: false };
		}
		if (type === 'vehicle') {
			const vehicles = await getVehiclesApi(limit);
			return { items: vehicles, hasMore: false };
		}
		if (type === 'monsterType') {
			const monsterTypes = await getMonsterTypesApi(limit);
			return { items: monsterTypes, hasMore: false };
		}
		if (type === 'ruleSection') {
			const ruleSections = await getRuleSectionsApi(limit);
			return { items: ruleSections, hasMore: false };
		}
		if (type === 'rule') {
			const rules = await getRulesApi(limit);
			return { items: rules, hasMore: false };
		}

		throw new Error(`SRD does not support type: ${type}`);
	}

	async fetchAllPages(type: CompendiumTypeName): Promise<unknown[]> {
		log.info({ type }, 'Fetching all items');

		if (type === 'spell') {
			const spells = await getSpellsApi(500);
			log.info({ type, count: spells.length }, 'Received spells');
			return spells;
		}
		if (type === 'monster') {
			const monsters = await getMonstersWithDetails(500);
			log.info({ type, count: monsters.length }, 'Received monsters with full details');
			return monsters;
		}
		if (type === 'subclass') {
			const subclasses = await getSubclassesApi(500);
			log.info({ type, count: subclasses.length }, 'Received subclasses');
			return subclasses;
		}
		if (type === 'subrace') {
			const subraces = await getSubracesApi(500);
			log.info({ type, count: subraces.length }, 'Received subraces');
			return subraces;
		}
		if (type === 'trait') {
			const traits = await getTraitsApi(500);
			log.info({ type, count: traits.length }, 'Received traits');
			return traits;
		}
		if (type === 'condition') {
			const conditions = await getConditionsApi(500);
			log.info({ type, count: conditions.length }, 'Received conditions');
			return conditions;
		}
		if (type === 'feature') {
			const features = await getFeaturesApi(500);
			log.info({ type, count: features.length }, 'Received features');
			return features;
		}
		if (type === 'skill') {
			const skills = await getSkillsApi(500);
			log.info({ type, count: skills.length }, 'Received skills');
			return skills;
		}
		if (type === 'language') {
			const languages = await getLanguagesApi(500);
			log.info({ type, count: languages.length }, 'Received languages');
			return languages;
		}
		if (type === 'alignment') {
			const alignments = await getAlignmentsApi(500);
			log.info({ type, count: alignments.length }, 'Received alignments');
			return alignments;
		}
		if (type === 'proficiency') {
			const proficiencies = await getProficienciesApi(500);
			log.info({ type, count: proficiencies.length }, 'Received proficiencies');
			return proficiencies;
		}
		if (type === 'abilityScore') {
			const abilityScores = await getAbilityScoresApi(500);
			log.info({ type, count: abilityScores.length }, 'Received ability scores');
			return abilityScores;
		}
		if (type === 'damageType') {
			const damageTypes = await getDamageTypesApi(500);
			log.info({ type, count: damageTypes.length }, 'Received damage types');
			return damageTypes;
		}
		if (type === 'magicSchool') {
			const magicSchools = await getMagicSchoolsApi(500);
			log.info({ type, count: magicSchools.length }, 'Received magic schools');
			return magicSchools;
		}
		if (type === 'equipment') {
			const equipment = await getEquipmentApi(500);
			log.info({ type, count: equipment.length }, 'Received equipment');
			return equipment;
		}
		if (type === 'weaponProperty') {
			const weaponProperties = await getWeaponPropertiesApi(500);
			log.info({ type, count: weaponProperties.length }, 'Received weapon properties');
			return weaponProperties;
		}
		if (type === 'equipmentCategory') {
			const equipmentCategories = await getEquipmentCategoriesApi(500);
			log.info({ type, count: equipmentCategories.length }, 'Received equipment categories');
			return equipmentCategories;
		}
		if (type === 'vehicle') {
			const vehicles = await getVehiclesApi(500);
			log.info({ type, count: vehicles.length }, 'Received vehicles');
			return vehicles;
		}
		if (type === 'monsterType') {
			const monsterTypes = await getMonsterTypesApi(500);
			log.info({ type, count: monsterTypes.length }, 'Received monster types');
			return monsterTypes;
		}
		if (type === 'ruleSection') {
			const ruleSections = await getRuleSectionsApi(500);
			log.info({ type, count: ruleSections.length }, 'Received rule sections');
			return ruleSections;
		}
		if (type === 'rule') {
			const rules = await getRulesApi(500);
			log.info({ type, count: rules.length }, 'Received rules');
			return rules;
		}
		return [];
	}

	async fetchDetail(
		type: CompendiumTypeName,
		externalId: string
	): Promise<Record<string, unknown>> {
		const detailFetchers: Record<string, () => Promise<Record<string, unknown> | null>> = {
			spell: () => getSpellDetail(externalId),
			monster: () => getMonsterDetail(externalId),
			subclass: () => getSubclassDetail(externalId),
			subrace: () => getSubraceDetail(externalId),
			trait: () => getTraitDetail(externalId),
			condition: () => getConditionDetail(externalId),
			feature: () => getFeatureDetail(externalId),
			skill: () => getSkillDetail(externalId),
			language: () => getLanguageDetail(externalId),
			alignment: () => getAlignmentDetail(externalId),
			proficiency: () => getProficiencyDetail(externalId),
			abilityScore: () => getAbilityScoreDetail(externalId),
			damageType: () => getDamageTypeDetail(externalId),
			magicSchool: () => getMagicSchoolDetail(externalId),
			equipment: () => getEquipmentDetail(externalId),
			weaponProperty: () => getWeaponPropertyDetail(externalId),
			equipmentCategory: () => getEquipmentCategoryDetail(externalId),
			vehicle: () => getVehicleDetail(externalId),
			monsterType: () => getMonsterTypeDetail(externalId),
			ruleSection: () => getRuleSectionDetail(externalId),
			rule: () => getRuleDetail(externalId)
		};

		const fetcher = detailFetchers[type];
		if (!fetcher) {
			throw new Error(`SRD does not support type: ${type}`);
		}

		const result = await fetcher();
		if (!result) {
			throw new Error(`Failed to fetch ${type} detail: ${externalId}`);
		}
		return result;
	}

	transformItem(rawItem: unknown, type: CompendiumTypeName): TransformResult {
		const transformers: Record<string, (item: unknown) => TransformResult> = {
			spell: (item) => this.transformSpell(item as SrdSpell),
			monster: (item) => this.transformMonster(item as SrdMonsterSummary),
			subclass: (item) =>
				this.transformSubclass(
					item as {
						index: string;
						name: string;
						class: { name: string };
						desc: string[];
						subclass_flavor?: string;
					}
				),
			subrace: (item) =>
				this.transformSubrace(
					item as { index: string; name: string; race: { name: string }; desc?: string }
				),
			trait: (item) =>
				this.transformTrait(
					item as { index: string; name: string; desc?: string; races?: Array<{ name: string }> }
				),
			condition: (item) =>
				this.transformCondition(item as { index: string; name: string; desc: string[] }),
			feature: (item) =>
				this.transformFeature(
					item as {
						index: string;
						name: string;
						level: number;
						description?: string[];
						class?: { name: string };
					}
				),
			skill: (item) =>
				this.transformSkill(
					item as { index: string; name: string; ability_score: { name: string }; desc?: string[] }
				),
			language: (item) =>
				this.transformLanguage(
					item as { index: string; name: string; typical_speakers?: string[]; script?: string }
				),
			alignment: (item) =>
				this.transformAlignment(
					item as { index: string; name: string; abbreviation: string; desc?: string }
				),
			proficiency: (item) =>
				this.transformProficiency(item as { index: string; name: string; type: string }),
			abilityScore: (item) =>
				this.transformAbilityScore(
					item as { index: string; name?: string; abbreviation: string; desc?: string[] }
				),
			damageType: (item) =>
				this.transformDamageType(item as { index: string; name: string; desc?: string[] }),
			magicSchool: (item) =>
				this.transformMagicSchool(item as { index: string; name: string; desc?: string[] }),
			equipment: (item) =>
				this.transformEquipment(
					item as {
						index: string;
						name: string;
						equipment_category: { name: string };
						weight?: number;
						desc?: string[];
					}
				),
			weaponProperty: (item) =>
				this.transformWeaponProperty(item as { index: string; name: string; desc?: string[] }),
			equipmentCategory: (item) =>
				this.transformEquipmentCategory(item as { index: string; name: string }),
			vehicle: (item) =>
				this.transformVehicle(
					item as {
						index: string;
						name: string;
						vehicle_category: { name: string };
						capacity?: string;
						speed?: { quantity: number; unit: string };
					}
				),
			monsterType: (item) =>
				this.transformMonsterType(item as { index: string; name: string; desc?: string }),
			ruleSection: (item) =>
				this.transformRuleSection(item as { index: string; name: string; desc: string }),
			rule: (item) => this.transformRule(item as { index: string; name: string })
		};

		const transformer = transformers[type];
		if (!transformer) {
			throw new Error(`SRD does not support type: ${type}`);
		}

		// Validate the item based on type
		const schemaMap: Record<string, z.ZodType> = {
			spell: SrdSpellSchema,
			monster: SrdMonsterDetailSchema,
			subclass: SrdSubclassSchema,
			subrace: SrdSubraceSchema,
			trait: SrdTraitSchema,
			condition: SrdConditionSchema,
			feature: SrdFeatureSchema,
			skill: SrdSkillSchema,
			language: SrdLanguageSchema,
			alignment: SrdAlignmentSchema,
			proficiency: SrdProficiencySchema,
			abilityScore: SrdAbilityScoreSchema,
			damageType: SrdDamageTypeSchema,
			magicSchool: SrdMagicSchoolSchema,
			equipment: SrdEquipmentSchema,
			weaponProperty: SrdWeaponPropertySchema,
			equipmentCategory: SrdEquipmentCategorySchema,
			vehicle: SrdVehicleSchema,
			monsterType: SrdMonsterTypeSchema,
			ruleSection: SrdRuleSectionSchema,
			rule: SrdRuleSchema
		};

		const schema = schemaMap[type];
		const validated = schema ? validateData(schema, rawItem, `SRD ${type}`) : rawItem;
		return transformer(validated);
	}

	private transformSpell(spell: SrdSpell): TransformResult {
		return {
			externalId: spell.index,
			name: spell.name,
			summary: `Level ${spell.level} ${spell.school.name}`,
			details: spell as unknown as Record<string, unknown>,
			spellLevel: spell.level,
			spellSchool: spell.school.name
		};
	}

	private transformMonster(monster: SrdMonsterSummary): TransformResult {
		const size = this.toTitleCase(monster.size);
		const typeName = this.toTitleCase(monster.type);
		const cr = String(monster.challenge_rating);

		return {
			externalId: monster.index,
			name: monster.name,
			summary: `${size} ${typeName}, CR ${cr}`,
			details: monster as unknown as Record<string, unknown>,
			challengeRating: cr,
			monsterSize: size,
			monsterType: typeName
		};
	}

	private transformSubclass(subclass: {
		index: string;
		name: string;
		class: { name: string };
		desc: string[];
		subclass_flavor?: string;
	}): TransformResult {
		const summary = `${subclass.class.name} - ${subclass.subclass_flavor || 'Archetype'}`;

		return {
			externalId: subclass.index,
			name: subclass.name,
			summary,
			details: subclass as unknown as Record<string, unknown>,
			subclassName: subclass.name,
			className: subclass.class.name,
			subclassFlavor: subclass.subclass_flavor
		};
	}

	private transformSubrace(subrace: {
		index: string;
		name: string;
		race: { name: string };
		desc?: string;
	}): TransformResult {
		const summary = `${subrace.race.name} Subrace`;

		return {
			externalId: subrace.index,
			name: subrace.name,
			summary,
			details: subrace as unknown as Record<string, unknown>,
			subraceName: subrace.name,
			raceName: subrace.race.name
		};
	}

	private transformTrait(trait: {
		index: string;
		name: string;
		desc?: string;
		races?: Array<{ name: string }>;
	}): TransformResult {
		const raceNames = trait.races?.map((r) => r.name).join(', ') || 'All Races';

		return {
			externalId: trait.index,
			name: trait.name,
			summary: `Racial Trait - ${raceNames}`,
			details: trait as unknown as Record<string, unknown>,
			traitName: trait.name,
			traitRaces: raceNames
		};
	}

	private transformCondition(condition: {
		index: string;
		name: string;
		desc: string[];
	}): TransformResult {
		return {
			externalId: condition.index,
			name: condition.name,
			summary: `Condition`,
			details: condition as unknown as Record<string, unknown>,
			conditionName: condition.name
		};
	}

	private transformFeature(feature: {
		index: string;
		name: string;
		level: number;
		description?: string[];
		class?: { name: string };
	}): TransformResult {
		const className = feature.class?.name || 'Unknown';
		const desc = feature.description?.join(' ') || '';

		return {
			externalId: feature.index,
			name: feature.name,
			summary: `Level ${feature.level} - ${className}`,
			details: feature as unknown as Record<string, unknown>,
			featureName: feature.name,
			featureLevel: feature.level,
			className
		};
	}

	private transformSkill(skill: {
		index: string;
		name: string;
		ability_score: { name: string };
		desc?: string[];
	}): TransformResult {
		return {
			externalId: skill.index,
			name: skill.name,
			summary: `${skill.ability_score.name} skill`,
			details: skill as unknown as Record<string, unknown>,
			skillName: skill.name,
			abilityScore: skill.ability_score.name
		};
	}

	private transformLanguage(language: {
		index: string;
		name: string;
		typical_speakers?: string[];
		script?: string;
	}): TransformResult {
		const speakers = language.typical_speakers?.join(', ') || '';
		const scriptInfo = language.script ? ` (${language.script})` : '';

		return {
			externalId: language.index,
			name: language.name,
			summary: speakers ? `${speakers}${scriptInfo}` : `Language${scriptInfo}`,
			details: language as unknown as Record<string, unknown>,
			languageName: language.name,
			typicalSpeakers: speakers
		};
	}

	private transformAlignment(alignment: {
		index: string;
		name: string;
		abbreviation: string;
		desc?: string;
	}): TransformResult {
		return {
			externalId: alignment.index,
			name: alignment.name,
			summary: alignment.abbreviation,
			details: alignment as unknown as Record<string, unknown>,
			alignmentName: alignment.name,
			alignmentAbbreviation: alignment.abbreviation
		};
	}

	private transformProficiency(proficiency: {
		index: string;
		name: string;
		type: string;
	}): TransformResult {
		return {
			externalId: proficiency.index,
			name: proficiency.name,
			summary: `${proficiency.type} proficiency`,
			details: proficiency as unknown as Record<string, unknown>,
			proficiencyName: proficiency.name,
			proficiencyType: proficiency.type
		};
	}

	private transformAbilityScore(abilityScore: {
		index: string;
		name?: string;
		abbreviation: string;
		desc?: string[];
	}): TransformResult {
		return {
			externalId: abilityScore.index,
			name: abilityScore.name || abilityScore.abbreviation,
			summary: abilityScore.abbreviation,
			details: abilityScore as unknown as Record<string, unknown>,
			abilityScoreName: abilityScore.name,
			abilityScoreAbbreviation: abilityScore.abbreviation
		};
	}

	private transformDamageType(damageType: {
		index: string;
		name: string;
		desc?: string[];
	}): TransformResult {
		return {
			externalId: damageType.index,
			name: damageType.name,
			summary: 'Damage Type',
			details: damageType as unknown as Record<string, unknown>,
			damageTypeName: damageType.name
		};
	}

	private transformMagicSchool(magicSchool: {
		index: string;
		name: string;
		desc?: string[];
	}): TransformResult {
		return {
			externalId: magicSchool.index,
			name: magicSchool.name,
			summary: 'Magic School',
			details: magicSchool as unknown as Record<string, unknown>,
			magicSchoolName: magicSchool.name
		};
	}

	private transformEquipment(equipment: {
		index: string;
		name: string;
		equipment_category: { name: string };
		weight?: number;
		desc?: string[];
	}): TransformResult {
		const category = equipment.equipment_category.name;
		const summary = category + (equipment.weight ? `, ${equipment.weight} lbs` : '');

		return {
			externalId: equipment.index,
			name: equipment.name,
			summary,
			details: equipment as unknown as Record<string, unknown>,
			equipmentName: equipment.name,
			equipmentCategory: category
		};
	}

	private transformWeaponProperty(weaponProperty: {
		index: string;
		name: string;
		desc?: string[];
	}): TransformResult {
		return {
			externalId: weaponProperty.index,
			name: weaponProperty.name,
			summary: 'Weapon Property',
			details: weaponProperty as unknown as Record<string, unknown>,
			weaponPropertyName: weaponProperty.name
		};
	}

	private transformEquipmentCategory(equipmentCategory: {
		index: string;
		name: string;
	}): TransformResult {
		return {
			externalId: equipmentCategory.index,
			name: equipmentCategory.name,
			summary: 'Equipment Category',
			details: equipmentCategory as unknown as Record<string, unknown>,
			equipmentCategoryName: equipmentCategory.name
		};
	}

	private transformVehicle(vehicle: {
		index: string;
		name: string;
		vehicle_category: { name: string };
		capacity?: string;
		speed?: { quantity: number; unit: string };
	}): TransformResult {
		const speedInfo = vehicle.speed ? `${vehicle.speed.quantity} ${vehicle.speed.unit}` : '';
		const summary = vehicle.vehicle_category.name + (speedInfo ? `, ${speedInfo}` : '');

		return {
			externalId: vehicle.index,
			name: vehicle.name,
			summary,
			details: vehicle as unknown as Record<string, unknown>,
			vehicleName: vehicle.name,
			vehicleCategory: vehicle.vehicle_category.name
		};
	}

	private transformMonsterType(monsterType: {
		index: string;
		name: string;
		desc?: string;
	}): TransformResult {
		return {
			externalId: monsterType.index,
			name: monsterType.name,
			summary: 'Monster Type',
			details: monsterType as unknown as Record<string, unknown>,
			monsterTypeName: monsterType.name
		};
	}

	private transformRuleSection(ruleSection: {
		index: string;
		name: string;
		desc: string;
	}): TransformResult {
		return {
			externalId: ruleSection.index,
			name: ruleSection.name,
			summary: 'Rule Section',
			details: ruleSection as unknown as Record<string, unknown>,
			ruleSectionName: ruleSection.name
		};
	}

	private transformRule(rule: { index: string; name: string }): TransformResult {
		return {
			externalId: rule.index,
			name: rule.name,
			summary: 'Rule',
			details: rule as unknown as Record<string, unknown>,
			ruleName: rule.name
		};
	}

	protected getEndpoint(type: CompendiumTypeName): string {
		const endpoints: Record<string, string> = {
			spell: '/spells/',
			monster: '/monsters/',
			subclass: '/subclasses/',
			subrace: '/subraces/',
			trait: '/traits/',
			condition: '/conditions/',
			feature: '/features/',
			skill: '/skills/',
			language: '/languages/',
			alignment: '/alignments/',
			proficiency: '/proficiencies/',
			abilityScore: '/ability-scores/',
			damageType: '/damage-types/',
			magicSchool: '/magic-schools/',
			equipment: '/equipment/',
			weaponProperty: '/weapon-properties/',
			equipmentCategory: '/equipment-categories/',
			vehicle: '/vehicles/',
			monsterType: '/monster-types/',
			ruleSection: '/rule-sections/',
			rule: '/rules/'
		};

		if (!(type in endpoints)) {
			throw new Error(`SRD does not support type: ${type}`);
		}
		return endpoints[type];
	}
}
