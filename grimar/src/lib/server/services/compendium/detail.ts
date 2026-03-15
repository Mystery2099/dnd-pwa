import type { CompendiumTypeName } from '$lib/core/constants/compendium';
import type {
	CompendiumBenefitsSection,
	CompendiumClassFeaturesSection,
	CompendiumCreatureEncounterSection,
	CompendiumDetailHeaderBadge,
	CompendiumDetailPresentation,
	CompendiumRelatedImagePresentation,
	CompendiumCreatureSetRosterEntry,
	CompendiumCreatureSetRosterSection,
	CompendiumDescriptionsSection,
	CompendiumDetailField,
	CompendiumDetailPayload,
	CompendiumDetailReference,
	CompendiumDetailSection,
	CompendiumDescriptionEntry,
	CompendiumDetailValue,
	CompendiumEntityListSection
	,
	CompendiumMarkdownSection,
	CompendiumSpellClassesSection,
	CompendiumTraitsSection,
	CompendiumWeaponPropertiesSection
} from '$lib/core/types/compendium';
import { resolveCompendiumLink } from '$lib/core/utils/compendium-links';
import { resolveAoeToken, resolveDamageTypeTokens } from '$lib/core/utils/compendiumIconography';
import type { CompendiumItem } from '$lib/server/db/schema';
import { formatSpeed, formatValue, getImageKindLabel, isSpeedObject } from '$lib/utils/compendium';
import { formatFieldName, getSortedFields } from '$lib/utils/compendium';
import { OPEN5E_API_BASE_URL } from '$lib/server/providers/open5e-config';

const CREATURE_REFERENCE_FIELD_KEYS = new Set([
	'armor_class',
	'armor_detail',
	'hit_points',
	'hit_dice',
	'type',
	'size',
	'alignment',
	'challenge_rating_text',
	'experience_points'
]);

const IMAGE_DETAIL_EXCLUDED_FIELD_KEYS = new Set(['file_url', 'alt_text', 'attribution', 'document']);

export interface CompendiumMarkdownSource {
	key: string;
	text: string;
}

function resolveImageAssetUrl(fileUrl: unknown): string | null {
	if (typeof fileUrl !== 'string' || fileUrl.length === 0) return null;
	try {
		if (/^https?:\/\//i.test(fileUrl)) {
			const parsed = new URL(fileUrl);
			const open5eOrigin = OPEN5E_API_BASE_URL.replace(/\/v2$/i, '');
			if (parsed.origin === open5eOrigin) {
				return `/api/assets/open5e${parsed.pathname}${parsed.search}`;
			}
			return parsed.toString();
		}

		const normalizedPath = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
		return `/api/assets/open5e${normalizedPath}`;
	} catch {
		return null;
	}
}

function extractKeyFromUrl(url: string): string | null {
	try {
		const parsed = new URL(url);
		const parts = parsed.pathname.split('/').filter(Boolean);
		return parts.at(-1) ?? null;
	} catch {
		const parts = url.split('/').filter(Boolean);
		return parts.at(-1) ?? null;
	}
}

function buildReferenceFromUrl(
	value: string,
	preferredLabel?: string,
	meta?: string
): CompendiumDetailReference | null {
	const resolvedLink = resolveCompendiumLink(value, preferredLabel, meta);
	if (!resolvedLink) {
		return null;
	}

	return {
		kind: 'entity',
		type: resolvedLink.type,
		key: resolvedLink.key,
		label: resolvedLink.label,
		href: resolvedLink.href,
		meta: resolvedLink.meta,
		sourceUrl: resolvedLink.sourceUrl
	};
}

function buildConditionArtwork(item: CompendiumItem): CompendiumRelatedImagePresentation | undefined {
	if (item.type !== 'conditions') {
		return undefined;
	}

	const itemData = (item.data ?? {}) as Record<string, unknown>;
	const icon = isRecord(itemData.icon) ? itemData.icon : null;
	if (!icon) {
		return undefined;
	}

	const assetUrl = resolveImageAssetUrl(icon.file_url);
	const key = getString(icon.key) ?? (typeof icon.url === 'string' ? extractKeyFromUrl(icon.url) : null);
	if (!assetUrl || !key) {
		return undefined;
	}

	return {
		key,
		name: getString(icon.name) ?? item.name,
		assetUrl,
		altText: getString(icon.alt_text),
		attribution: getString(icon.attribution),
		documentLabel: item.documentName ?? undefined
	};
}

function buildPresentation(item: CompendiumItem): CompendiumDetailPresentation {
	const itemData = (item.data ?? {}) as Record<string, unknown>;
	const document = isRecord(itemData.document) ? itemData.document : null;
	const documentLabel =
		getString(document?.display_name) ??
		getString(document?.name) ??
		(item.documentName ?? undefined);

	const imagePresentation =
		item.type === 'images'
			? {
					fileUrl: getString(itemData.file_url),
					assetUrl: resolveImageAssetUrl(itemData.file_url),
					altText: getString(itemData.alt_text),
					attribution: getString(itemData.attribution),
					publisher: document && isRecord(document.publisher) ? getString(document.publisher.name) : undefined,
					gameSystem:
						document && isRecord(document.gamesystem) ? getString(document.gamesystem.name) : undefined,
					permalink: getString(document?.permalink)
				}
			: undefined;

	const creatureHeader =
		item.type === 'creatures'
			? {
					challengeRatingText: getString(itemData.challenge_rating_text),
					size: normalizeValue(itemData.size),
					typeValue: normalizeValue(itemData.type),
					alignment: normalizeValue(itemData.alignment),
					experiencePoints:
						typeof itemData.experience_points === 'number' ? itemData.experience_points : undefined
				}
			: undefined;

	const headerBadges = buildHeaderBadges(item.type, itemData);
	const conditionArtwork = buildConditionArtwork(item);

	return {
		documentLabel,
		image: imagePresentation,
		conditionArtwork,
		creatureHeader,
		headerBadges
	};
}

function buildHeaderBadges(
	type: CompendiumItem['type'],
	itemData: Record<string, unknown>
): CompendiumDetailHeaderBadge[] {
	if (type === 'spells') {
		const badges: CompendiumDetailHeaderBadge[] = [];
		const level = itemData.level;
		if (typeof level === 'number') {
			badges.push({
				label: level === 0 ? 'Cantrip' : `Level ${level}`,
				variant: 'solid'
			});
		}

		const schoolLabel = formatValue(itemData.school);
		const schoolToken =
			typeof itemData.school === 'string'
				? itemData.school.trim().toLowerCase().replace(/\s+/g, '-')
				: getLinkedLabel(itemData.school)?.trim().toLowerCase().replace(/\s+/g, '-');
		if (schoolLabel !== '—') {
			badges.push({
				label: schoolLabel,
				variant: 'outline',
				icon: schoolToken ? { family: 'spell-school', value: schoolToken } : undefined
			});
		}

		const damageTypesLabel = formatValue(itemData.damage_types);
		const damageTypeToken = resolveDamageTypeTokens(itemData.damage_types)[0];
		if (damageTypesLabel !== '—') {
			badges.push({
				label: damageTypesLabel,
				variant: 'outline',
				icon: damageTypeToken ? { family: 'damage-type', value: damageTypeToken } : undefined
			});
		}

		const targetTypeLabel = formatValue(itemData.target_type);
		const aoeToken = resolveAoeToken(itemData.target_type);
		if (targetTypeLabel !== '—') {
			badges.push({
				label: targetTypeLabel,
				variant: 'outline',
				icon: aoeToken ? { family: 'aoe', value: aoeToken } : undefined
			});
		}

		if (itemData.concentration) {
			badges.push({ label: 'Concentration', variant: 'outline' });
		}

		if (itemData.ritual) {
			badges.push({ label: 'Ritual', variant: 'outline' });
		}

		return badges;
	}

	if (type === 'classes') {
		const badges: CompendiumDetailHeaderBadge[] = [];
		if (itemData.hit_dice) {
			badges.push({
				label: `Hit Die: d${itemData.hit_dice}`,
				variant: 'solid'
			});
		}

		const primaryAbilities = formatValue(itemData.primary_abilities);
		if (primaryAbilities !== '—') {
			badges.push({ label: primaryAbilities, variant: 'outline' });
		}

		const savingThrows = formatValue(itemData.saving_throws);
		if (savingThrows !== '—') {
			badges.push({ label: `Saves: ${savingThrows}`, variant: 'outline' });
		}

		return badges;
	}

	if (type === 'magicitems') {
		const badges: CompendiumDetailHeaderBadge[] = [];
		const rarity = getString(itemData.rarity);
		if (rarity) {
			badges.push({ label: rarity, variant: 'solid' });
		}

		const itemType = getString(itemData.type);
		if (itemType) {
			badges.push({ label: itemType, variant: 'outline' });
		}

		if (itemData.requires_attunement) {
			badges.push({ label: 'Requires Attunement', variant: 'outline' });
		}

		return badges;
	}

	if (type === 'images') {
		const badges: CompendiumDetailHeaderBadge[] = [
			{
				label: getImageKindLabel(getString(itemData.file_url)),
				variant: 'solid'
			}
		];

		if (getString(itemData.attribution)) {
			badges.push({ label: 'Attributed', variant: 'outline' });
		}

		return badges;
	}

	return [];
}

function normalizeScalar(value: unknown): CompendiumDetailValue {
	if (value === null || value === undefined) return null;
	if (typeof value === 'string') {
		return buildReferenceFromUrl(value) ?? value;
	}
	if (typeof value === 'number' || typeof value === 'boolean') {
		return value;
	}
	return String(value);
}

function normalizeObject(value: Record<string, unknown>): CompendiumDetailValue {
	const recordUrl = typeof value.url === 'string' ? value.url : null;
	const recordName = typeof value.name === 'string' ? value.name : undefined;
	const recordKey = typeof value.key === 'string' ? value.key : undefined;

	if (recordUrl) {
		const normalizedLabel = recordName?.trim() || recordKey?.trim();
		const referenceMeta =
			recordKey && normalizedLabel && recordKey !== normalizedLabel ? recordKey : undefined;
		return (
			buildReferenceFromUrl(recordUrl, normalizedLabel, referenceMeta) ?? {
				...Object.fromEntries(
					Object.entries(value).map(([entryKey, entryValue]) => [entryKey, normalizeValue(entryValue)])
				)
			}
		);
	}

	return Object.fromEntries(
		Object.entries(value).map(([entryKey, entryValue]) => [entryKey, normalizeValue(entryValue)])
	);
}

function normalizeValue(value: unknown): CompendiumDetailValue {
	if (Array.isArray(value)) {
		return value.map((entry) => normalizeValue(entry));
	}

	if (value && typeof value === 'object') {
		return normalizeObject(value as Record<string, unknown>);
	}

	return normalizeScalar(value);
}

function getString(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function getLinkedLabel(value: unknown): string | undefined {
	if (!value) return undefined;
	if (typeof value === 'string') return getString(value);
	if (typeof value !== 'object' || Array.isArray(value)) return undefined;

	const record = value as Record<string, unknown>;
	return getString(record.name) ?? getString(record.key);
}

function getEnvironmentLabels(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.map((entry) => getLinkedLabel(entry)).filter((entry): entry is string => Boolean(entry));
}

function getSpeedLabel(value: unknown): string | undefined {
	if (!isSpeedObject(value)) {
		return undefined;
	}

	return formatSpeed(value);
}

function buildCreatureSetRosterSection(rawValue: unknown): CompendiumCreatureSetRosterSection | null {
	if (!Array.isArray(rawValue)) {
		return null;
	}

	const items: CompendiumCreatureSetRosterEntry[] = rawValue
		.map((entry): CompendiumCreatureSetRosterEntry | null => {
			if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
				return null;
			}

			const record = entry as Record<string, unknown>;
			const url = getString(record.url);
			const reference = url ? buildReferenceFromUrl(url, getString(record.name), getString(record.key)) : null;
			if (!reference) {
				return null;
			}

			return {
				key: reference.key,
				label: reference.label,
				href: reference.href,
				type: getLinkedLabel(record.type),
				size: getLinkedLabel(record.size),
				documentLabel:
					getLinkedLabel(record.document) ??
					(record.document &&
					typeof record.document === 'object' &&
					!Array.isArray(record.document)
						? getString((record.document as Record<string, unknown>).display_name)
						: undefined),
				environments: getEnvironmentLabels(record.environments),
				challengeRatingText: getString(record.challenge_rating_text),
				armorClass: typeof record.armor_class === 'number' ? record.armor_class : undefined,
				hitPoints: typeof record.hit_points === 'number' ? record.hit_points : undefined,
				speed: getSpeedLabel(record.speed)
			};
		})
		.filter((entry): entry is CompendiumCreatureSetRosterEntry => entry !== null);

	if (items.length === 0) {
		return null;
	}

	return {
		key: 'creatures',
		title: 'Roster',
		description: 'Creatures included in this set.',
		kind: 'creature-set-roster',
		items
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function buildDescriptionsSection(rawValue: unknown): CompendiumDescriptionsSection | null {
	if (!Array.isArray(rawValue) || rawValue.length === 0) {
		return null;
	}

	const items: CompendiumDescriptionEntry[] = rawValue
		.map((entry, index): CompendiumDescriptionEntry | null => {
			if (!isRecord(entry) || typeof entry.desc !== 'string') {
				return null;
			}

			return {
				document: getString(entry.document),
				gamesystem: getString(entry.gamesystem),
				markdownKey: `descriptions.${index}.desc`
			};
		})
		.filter((entry): entry is CompendiumDescriptionEntry => entry !== null);

	if (items.length === 0) {
		return null;
	}

	return {
		key: 'descriptions',
		title: 'Descriptions',
		description: 'Variant text grouped by system and source document.',
		kind: 'descriptions',
		items
	};
}

function buildBenefitsSection(rawValue: unknown): CompendiumBenefitsSection | null {
	if (!Array.isArray(rawValue) || rawValue.length === 0) {
		return null;
	}

	const items = rawValue
		.map((entry, index) => (isRecord(entry) && typeof entry.desc === 'string' ? { markdownKey: `benefits.${index}.desc` } : null))
		.filter((entry): entry is { markdownKey: string } => entry !== null);

	if (items.length === 0) {
		return null;
	}

	return {
		key: 'benefits',
		title: 'Benefits',
		description: 'Mechanical benefits and repeatable advantages.',
		kind: 'benefits',
		items
	};
}

function buildWeaponPropertiesSection(rawValue: unknown): CompendiumWeaponPropertiesSection | null {
	if (!Array.isArray(rawValue) || rawValue.length === 0) {
		return null;
	}

	const items = rawValue
		.map((entry, index) => {
			if (!isRecord(entry) || !isRecord(entry.property)) {
				return null;
			}

			const property = entry.property;
			const name = getString(property.name);
			if (!name) {
				return null;
			}

			return {
				name,
				propertyType: getString(property.type),
				detail: getString(entry.detail),
				markdownKey: typeof property.desc === 'string' ? `weaponProperties.${index}.desc` : undefined
			};
		})
		.filter(
			(entry): entry is NonNullable<typeof entry> => entry !== null
		);

	if (items.length === 0) {
		return null;
	}

	return {
		key: 'weapon-properties',
		title: 'Properties',
		description: 'Rules traits attached to this weapon.',
		kind: 'weapon-properties',
		items
	};
}

function buildTraitsSection(rawValue: unknown): CompendiumTraitsSection | null {
	if (!Array.isArray(rawValue) || rawValue.length === 0) {
		return null;
	}

	const items = rawValue
		.map((entry, index) => {
			if (!isRecord(entry)) {
				return null;
			}

			const name = getString(entry.name);
			if (!name) {
				return null;
			}

			return {
				name,
				markdownKey: typeof entry.desc === 'string' ? `traits.${index}.desc` : undefined
			};
		})
		.filter((entry): entry is NonNullable<typeof entry> => entry !== null);

	if (items.length === 0) {
		return null;
	}

	return {
		key: 'traits',
		title: 'Traits',
		description: 'Species-specific traits and inherited features.',
		kind: 'traits',
		items
	};
}

function buildDescriptionSection(item: CompendiumItem): CompendiumMarkdownSection | null {
	const itemData = (item.data ?? {}) as Record<string, unknown>;
	const description = itemData.desc ?? item.description;
	if (typeof description !== 'string' || !description.trim()) {
		return null;
	}

	return {
		key: 'description',
		title: 'Description',
		description:
			item.type === 'creatures'
				? 'Lore and encounter-facing rules text.'
				: 'Core rules text and narrative summary.',
		kind: 'markdown',
		markdownKey: 'description',
		defaultOpen: true
	};
}

function buildHigherLevelSection(rawValue: unknown): CompendiumMarkdownSection | null {
	if (typeof rawValue !== 'string' || !rawValue.trim()) {
		return null;
	}

	return {
		key: 'higher_level',
		title: 'At Higher Levels',
		description: 'Scaling notes when the spell is cast using stronger slots.',
		kind: 'markdown',
		markdownKey: 'higher_level'
	};
}

function buildSpellClassesSection(rawValue: unknown): CompendiumSpellClassesSection | null {
	if (!Array.isArray(rawValue) || rawValue.length === 0) {
		return null;
	}

	const items = rawValue
		.map((entry) => {
			if (typeof entry === 'string' && entry.trim()) {
				return {
					label: entry,
					href: `/compendium/classes/${entry}`
				};
			}

			if (!isRecord(entry)) {
				return null;
			}

			const label = getString(entry.name) ?? getString(entry.key);
			if (!label) {
				return null;
			}

			const key = getString(entry.key) ?? getString(entry.name);
			return {
				label,
				href: key ? `/compendium/classes/${key}` : undefined
			};
		})
		.filter((entry): entry is NonNullable<typeof entry> => entry !== null);

	if (items.length === 0) {
		return null;
	}

	return {
		key: 'classes',
		title: 'Classes',
		description: 'Spell lists and known class access.',
		kind: 'spell-classes',
		items
	};
}

function buildClassFeaturesSection(rawValue: unknown): CompendiumClassFeaturesSection | null {
	if (!Array.isArray(rawValue) || rawValue.length === 0) {
		return null;
	}

	const items = rawValue
		.map((entry, index) => {
			if (!isRecord(entry)) {
				return null;
			}

			const name = getString(entry.name) ?? getString(entry.key);
			if (!name) {
				return null;
			}

			const gainedAt = entry.gained_at;
			const level = Array.isArray(gainedAt)
				? typeof gainedAt[0]?.level === 'number'
					? gainedAt[0].level
					: undefined
				: isRecord(gainedAt) && typeof gainedAt.level === 'number'
					? gainedAt.level
					: undefined;

			return {
				key: getString(entry.key) ?? `feature-${index}`,
				name,
				level,
				markdownKey: typeof entry.desc === 'string' ? `features.${index}.desc` : undefined
			};
		})
		.filter((entry): entry is NonNullable<typeof entry> => entry !== null);

	if (items.length === 0) {
		return null;
	}

	return {
		key: 'class-features',
		title: 'Class Features',
		description: 'Expandable feature entries grouped by the class progression.',
		kind: 'class-features',
		items,
		defaultOpen: true
	};
}

function buildCreatureEncounterSection(itemData: Record<string, unknown>): CompendiumCreatureEncounterSection | null {
	const orderedAbilities = [
		'strength',
		'dexterity',
		'constitution',
		'intelligence',
		'wisdom',
		'charisma'
	];
	const abilityScoresRecord =
		isRecord(itemData.ability_scores) ? (itemData.ability_scores as Record<string, unknown>) : null;
	const abilityScores = abilityScoresRecord
		? orderedAbilities
				.map((ability) => {
					const score = abilityScoresRecord[ability];
					return typeof score === 'number' ? { ability, score } : null;
				})
				.filter((entry): entry is NonNullable<typeof entry> => entry !== null)
		: [];

	const actions = Array.isArray(itemData.actions)
		? itemData.actions
				.map((entry, index) => {
					if (!isRecord(entry)) {
						return null;
					}
					const name = getString(entry.name) ?? getString(entry.key);
					if (!name) {
						return null;
					}
					return {
						name,
						markdownKey: typeof entry.desc === 'string' ? `actions.${index}.desc` : undefined
					};
				})
				.filter((entry): entry is NonNullable<typeof entry> => entry !== null)
		: [];

	const traits = Array.isArray(itemData.traits)
		? itemData.traits
				.map((entry, index) => {
					if (!isRecord(entry)) {
						return null;
					}
					const name = getString(entry.name) ?? getString(entry.key);
					if (!name) {
						return null;
					}
					return {
						name,
						markdownKey: typeof entry.desc === 'string' ? `traits.${index}.desc` : undefined
					};
				})
				.filter((entry): entry is NonNullable<typeof entry> => entry !== null)
		: [];

	const armorClass = typeof itemData.armor_class === 'number' ? itemData.armor_class : undefined;
	const hitPoints = typeof itemData.hit_points === 'number' ? itemData.hit_points : undefined;
	const speed = getSpeedLabel(itemData.speed_all);

	if (
		abilityScores.length === 0 &&
		armorClass === undefined &&
		hitPoints === undefined &&
		!getString(itemData.hit_dice) &&
		!speed &&
		actions.length === 0 &&
		traits.length === 0
	) {
		return null;
	}

	return {
		key: 'creature-encounter',
		title: 'Encounter Reference',
		kind: 'creature-encounter',
		abilityScores,
		armorClass,
		armorDetail: getString(itemData.armor_detail),
		hitPoints,
		hitDice: getString(itemData.hit_dice),
		speed,
		actions,
		traits
	};
}

function normalizeFields(item: CompendiumItem): {
	fields: CompendiumDetailField[];
	sections: CompendiumDetailSection[];
} {
	const itemData = (item.data ?? {}) as Record<string, unknown>;
	const sections: CompendiumDetailSection[] = [];
	const fields: CompendiumDetailField[] = [];
	const consumedSectionKeys = new Set<string>();

	const descriptionSection = buildDescriptionSection(item);
	if (descriptionSection) {
		sections.push(descriptionSection);
		consumedSectionKeys.add('desc');
	}

	const rosterSection =
		item.type === 'creaturesets' ? buildCreatureSetRosterSection(itemData.creatures) : null;
	if (rosterSection) {
		sections.push(rosterSection);
		consumedSectionKeys.add('creatures');
	}

	const descriptionsSection = buildDescriptionsSection(itemData.descriptions);
	if (descriptionsSection) {
		sections.push(descriptionsSection);
		consumedSectionKeys.add('descriptions');
	}

	const benefitsSection = buildBenefitsSection(itemData.benefits);
	if (benefitsSection) {
		sections.push(benefitsSection);
		consumedSectionKeys.add('benefits');
	}

	const weaponPropertiesSection =
		item.type === 'weapons' ? buildWeaponPropertiesSection(itemData.properties) : null;
	if (weaponPropertiesSection) {
		sections.push(weaponPropertiesSection);
		consumedSectionKeys.add('properties');
	}

	const traitsSection = item.type === 'species' ? buildTraitsSection(itemData.traits) : null;
	if (traitsSection) {
		sections.push(traitsSection);
		consumedSectionKeys.add('traits');
	}

	const spellClassesSection = item.type === 'spells' ? buildSpellClassesSection(itemData.classes) : null;
	if (spellClassesSection) {
		sections.push(spellClassesSection);
		consumedSectionKeys.add('classes');
	}

	const higherLevelSection = item.type === 'spells' ? buildHigherLevelSection(itemData.higher_level) : null;
	if (higherLevelSection) {
		sections.push(higherLevelSection);
		consumedSectionKeys.add('higher_level');
	}

	const classFeaturesSection = item.type === 'classes' ? buildClassFeaturesSection(itemData.features) : null;
	if (classFeaturesSection) {
		sections.push(classFeaturesSection);
		consumedSectionKeys.add('features');
	}

	const creatureEncounterSection =
		item.type === 'creatures' ? buildCreatureEncounterSection(itemData) : null;
	if (creatureEncounterSection) {
		sections.push(creatureEncounterSection);
		consumedSectionKeys.add('ability_scores');
		consumedSectionKeys.add('actions');
		consumedSectionKeys.add('traits');
		consumedSectionKeys.add('armor_class');
		consumedSectionKeys.add('armor_detail');
		consumedSectionKeys.add('hit_points');
		consumedSectionKeys.add('hit_dice');
		consumedSectionKeys.add('speed_all');
	}

	const orderedFields = getSortedFields(itemData, item.type);

	for (const [key, rawValue] of orderedFields) {
		if (consumedSectionKeys.has(key)) {
			continue;
		}

		if (item.type === 'images' && IMAGE_DETAIL_EXCLUDED_FIELD_KEYS.has(key)) {
			continue;
		}

		if (item.type === 'creatures' && CREATURE_REFERENCE_FIELD_KEYS.has(key)) {
			continue;
		}

		fields.push({
			key,
			label: formatFieldName(key),
			value: normalizeValue(rawValue)
		});
	}

	return { fields, sections };
}

export function buildCompendiumDetailPayload(item: CompendiumItem): CompendiumDetailPayload {
	const { fields, sections } = normalizeFields(item);
	return {
		detailSchemaVersion: 1,
		item: {
			...item,
			type: item.type as CompendiumTypeName
		},
		presentation: buildPresentation(item),
		fields,
		sections
	};
}

function getMarkdownArrayEntry(
	itemData: Record<string, unknown>,
	collectionKey: string,
	index: number,
	fieldKey = 'desc'
): string | null {
	const value = itemData[collectionKey];
	if (!Array.isArray(value)) {
		return null;
	}

	const entry = value[index];
	if (!isRecord(entry)) {
		return null;
	}

	const text = entry[fieldKey];
	return typeof text === 'string' && text.trim() ? text : null;
}

function getMarkdownTextForKey(
	item: CompendiumItem,
	payload: CompendiumDetailPayload,
	key: string
): string | null {
	const itemData = (item.data ?? {}) as Record<string, unknown>;

	if (key === 'description') {
		const description = itemData.desc ?? item.description;
		return typeof description === 'string' && description.trim() ? description : null;
	}

	if (key === 'higher_level') {
		return typeof itemData.higher_level === 'string' && itemData.higher_level.trim()
			? itemData.higher_level
			: null;
	}

	const descriptionsSection = payload.sections.find(
		(section): section is CompendiumDescriptionsSection => section.kind === 'descriptions'
	);
	const descriptionsIndex = descriptionsSection?.items.findIndex((entry) => entry.markdownKey === key) ?? -1;
	if (descriptionsIndex >= 0) {
		return getMarkdownArrayEntry(itemData, 'descriptions', descriptionsIndex);
	}

	const benefitsSection = payload.sections.find(
		(section): section is CompendiumBenefitsSection => section.kind === 'benefits'
	);
	const benefitsIndex = benefitsSection?.items.findIndex((entry) => entry.markdownKey === key) ?? -1;
	if (benefitsIndex >= 0) {
		return getMarkdownArrayEntry(itemData, 'benefits', benefitsIndex);
	}

	const weaponPropertiesSection = payload.sections.find(
		(section): section is CompendiumWeaponPropertiesSection => section.kind === 'weapon-properties'
	);
	const propertyIndex =
		weaponPropertiesSection?.items.findIndex((entry) => entry.markdownKey === key) ?? -1;
	if (propertyIndex >= 0) {
		const properties = itemData.properties;
		if (Array.isArray(properties)) {
			const propertyEntry = properties[propertyIndex];
			if (isRecord(propertyEntry) && isRecord(propertyEntry.property)) {
				const text = propertyEntry.property.desc;
				return typeof text === 'string' && text.trim() ? text : null;
			}
		}
		return null;
	}

	const traitsSection = payload.sections.find(
		(section): section is CompendiumTraitsSection => section.kind === 'traits'
	);
	const traitIndex = traitsSection?.items.findIndex((entry) => entry.markdownKey === key) ?? -1;
	if (traitIndex >= 0) {
		return getMarkdownArrayEntry(itemData, 'traits', traitIndex);
	}

	const classFeaturesSection = payload.sections.find(
		(section): section is CompendiumClassFeaturesSection => section.kind === 'class-features'
	);
	const featureIndex =
		classFeaturesSection?.items.findIndex((entry) => entry.markdownKey === key) ?? -1;
	if (featureIndex >= 0) {
		return getMarkdownArrayEntry(itemData, 'features', featureIndex);
	}

	const creatureEncounterSection = payload.sections.find(
		(section): section is CompendiumCreatureEncounterSection => section.kind === 'creature-encounter'
	);
	const actionIndex =
		creatureEncounterSection?.actions.findIndex((entry) => entry.markdownKey === key) ?? -1;
	if (actionIndex >= 0) {
		return getMarkdownArrayEntry(itemData, 'actions', actionIndex);
	}

	const creatureTraitIndex =
		creatureEncounterSection?.traits.findIndex((entry) => entry.markdownKey === key) ?? -1;
	if (creatureTraitIndex >= 0) {
		return getMarkdownArrayEntry(itemData, 'traits', creatureTraitIndex);
	}

	return null;
}

export function collectCompendiumMarkdownSources(
	item: CompendiumItem,
	payload: CompendiumDetailPayload
): CompendiumMarkdownSource[] {
	const markdownKeys = new Set<string>();

	for (const section of payload.sections) {
		if (section.kind === 'markdown') {
			markdownKeys.add(section.markdownKey);
			continue;
		}

		if (section.kind === 'descriptions' || section.kind === 'benefits' || section.kind === 'traits') {
			for (const entry of section.items) {
				if (entry.markdownKey) {
					markdownKeys.add(entry.markdownKey);
				}
			}
			continue;
		}

		if (section.kind === 'weapon-properties' || section.kind === 'class-features') {
			for (const entry of section.items) {
				if (entry.markdownKey) {
					markdownKeys.add(entry.markdownKey);
				}
			}
			continue;
		}

		if (section.kind === 'creature-encounter') {
			for (const entry of section.actions) {
				if (entry.markdownKey) {
					markdownKeys.add(entry.markdownKey);
				}
			}
			for (const entry of section.traits) {
				if (entry.markdownKey) {
					markdownKeys.add(entry.markdownKey);
				}
			}
		}
	}

	return Array.from(markdownKeys)
		.map((key) => {
			const text = getMarkdownTextForKey(item, payload, key);
			return text ? { key, text } : null;
		})
		.filter((entry): entry is CompendiumMarkdownSource => entry !== null);
}
