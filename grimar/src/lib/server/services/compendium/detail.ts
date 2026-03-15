import type { CompendiumTypeName } from '$lib/core/constants/compendium';
import type {
	CompendiumBenefitEntry,
	CompendiumBenefitGroup,
	CompendiumBenefitsSection,
	CompendiumClassFeaturesSection,
	CompendiumClassTableSection,
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
	CompendiumEntityListSection,
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

const IMAGE_DETAIL_EXCLUDED_FIELD_KEYS = new Set([
	'file_url',
	'alt_text',
	'attribution',
	'document'
]);
const BACKGROUND_BENEFIT_GROUP_ORDER = [
	'ability_score',
	'skill_proficiency',
	'tool_proficiency',
	'language',
	'equipment',
	'feature',
	'feat',
	'connections',
	'mementos',
	'adventures_and_advancement',
	'suggested_characteristics'
] as const;

const BACKGROUND_BENEFIT_GROUP_LABELS: Record<string, string> = {
	ability_score: 'Ability Scores',
	skill_proficiency: 'Skill Proficiencies',
	tool_proficiency: 'Tool Proficiencies',
	language: 'Languages',
	equipment: 'Equipment',
	feature: 'Features',
	feat: 'Feats',
	connections: 'Connections',
	mementos: 'Mementos',
	adventures_and_advancement: 'Adventures and Advancement',
	suggested_characteristics: 'Suggested Characteristics'
};

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

function buildConditionArtwork(
	item: CompendiumItem
): CompendiumRelatedImagePresentation | undefined {
	if (item.type !== 'conditions') {
		return undefined;
	}

	const itemData = (item.data ?? {}) as Record<string, unknown>;
	const icon = isRecord(itemData.icon) ? itemData.icon : null;
	if (!icon) {
		return undefined;
	}

	const assetUrl = resolveImageAssetUrl(icon.file_url);
	const key =
		getString(icon.key) ?? (typeof icon.url === 'string' ? extractKeyFromUrl(icon.url) : null);
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
		item.documentName ??
		undefined;

	const imagePresentation =
		item.type === 'images'
			? {
					fileUrl: getString(itemData.file_url),
					assetUrl: resolveImageAssetUrl(itemData.file_url),
					altText: getString(itemData.alt_text),
					attribution: getString(itemData.attribution),
					publisher:
						document && isRecord(document.publisher)
							? getString(document.publisher.name)
							: undefined,
					gameSystem:
						document && isRecord(document.gamesystem)
							? getString(document.gamesystem.name)
							: undefined,
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
					Object.entries(value).map(([entryKey, entryValue]) => [
						entryKey,
						normalizeValue(entryValue)
					])
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

function getMeaningfulDescription(value: unknown): string | undefined {
	const text = getString(value);
	if (!text) {
		return undefined;
	}

	return /^\[column data\]$/i.test(text) ? undefined : text;
}

function getFeatureType(value: unknown): string | undefined {
	return getString(value)?.toUpperCase();
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

	return value
		.map((entry) => getLinkedLabel(entry))
		.filter((entry): entry is string => Boolean(entry));
}

function getSpeedLabel(value: unknown): string | undefined {
	if (!isSpeedObject(value)) {
		return undefined;
	}

	return formatSpeed(value);
}

function buildCreatureSetRosterSection(
	rawValue: unknown
): CompendiumCreatureSetRosterSection | null {
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
			const reference = url
				? buildReferenceFromUrl(url, getString(record.name), getString(record.key))
				: null;
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
					(record.document && typeof record.document === 'object' && !Array.isArray(record.document)
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

	const items: CompendiumBenefitEntry[] = rawValue
		.map((entry, index): CompendiumBenefitEntry | null => {
			if (!isRecord(entry) || typeof entry.desc !== 'string') {
				return null;
			}

			return {
				markdownKey: `benefits.${index}.desc`,
				name: getString(entry.name)
			};
		})
		.filter((entry): entry is CompendiumBenefitEntry => entry !== null);

	if (items.length === 0) {
		return null;
	}

	return {
		key: 'benefits',
		title: 'Benefits',
		description: 'Mechanical benefits and repeatable advantages.',
		kind: 'benefits',
		layout: 'list',
		items,
		groups: []
	};
}

function getBackgroundBenefitGroupLabel(benefitType: string): string {
	return BACKGROUND_BENEFIT_GROUP_LABELS[benefitType] ?? formatFieldName(benefitType);
}

function sortBackgroundBenefitGroups(groups: CompendiumBenefitGroup[]): CompendiumBenefitGroup[] {
	return groups.sort((left, right) => {
		const leftIndex = BACKGROUND_BENEFIT_GROUP_ORDER.indexOf(
			left.key as (typeof BACKGROUND_BENEFIT_GROUP_ORDER)[number]
		);
		const rightIndex = BACKGROUND_BENEFIT_GROUP_ORDER.indexOf(
			right.key as (typeof BACKGROUND_BENEFIT_GROUP_ORDER)[number]
		);
		const normalizedLeftIndex = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
		const normalizedRightIndex = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

		if (normalizedLeftIndex !== normalizedRightIndex) {
			return normalizedLeftIndex - normalizedRightIndex;
		}

		return left.title.localeCompare(right.title);
	});
}

function joinMarkdownParts(...parts: Array<string | undefined>): string | null {
	const normalizedParts = parts
		.map((part) => part?.trim())
		.filter((part): part is string => Boolean(part));
	if (normalizedParts.length === 0) {
		return null;
	}

	return normalizedParts.join('\n\n');
}

function splitConnectionAndMementoBenefit(markdown: string): {
	connections?: string;
	mementos?: string;
} {
	const connectionMatch = markdown.match(/^#{3,4}\s+.*Connections\s*$/im);
	const mementoMatch = markdown.match(/^#{3,4}\s+.*Mementos?\s*$/im);
	if (!connectionMatch || !mementoMatch) {
		return {};
	}

	const connectionIndex = connectionMatch.index ?? -1;
	const mementoIndex = mementoMatch.index ?? -1;
	if (connectionIndex < 0 || mementoIndex < 0 || connectionIndex >= mementoIndex) {
		return {};
	}

	const intro = markdown.slice(0, connectionIndex).trim();
	const connectionsBody = markdown
		.slice(connectionIndex + connectionMatch[0].length, mementoIndex)
		.trim();
	const mementosBody = markdown.slice(mementoIndex + mementoMatch[0].length).trim();

	return {
		connections: joinMarkdownParts(intro, connectionsBody) ?? undefined,
		mementos: joinMarkdownParts(intro, mementosBody) ?? undefined
	};
}

function buildBackgroundBenefitsSection(rawValue: unknown): CompendiumBenefitsSection | null {
	if (!Array.isArray(rawValue) || rawValue.length === 0) {
		return null;
	}

	type BackgroundBenefitEntry = CompendiumBenefitEntry & {
		benefitType?: string;
		markdownFieldKey?: 'desc' | 'connections' | 'mementos';
	};

	const items: BackgroundBenefitEntry[] = rawValue.flatMap(
		(entry, index): BackgroundBenefitEntry[] => {
			if (!isRecord(entry) || typeof entry.desc !== 'string') {
				return [];
			}

			const benefitType = getString(entry.type);
			if (benefitType === 'connection_and_memento') {
				const splitBenefit = splitConnectionAndMementoBenefit(entry.desc);
				const entries: BackgroundBenefitEntry[] = [];
				if (splitBenefit.connections) {
					entries.push({
						markdownKey: `benefits.${index}.connections`,
						benefitType: 'connections',
						markdownFieldKey: 'connections'
					});
				}
				if (splitBenefit.mementos) {
					entries.push({
						markdownKey: `benefits.${index}.mementos`,
						benefitType: 'mementos',
						markdownFieldKey: 'mementos'
					});
				}
				if (entries.length > 0) {
					return entries;
				}
			}

			return [
				{
					markdownKey: `benefits.${index}.desc`,
					name: getString(entry.name),
					benefitType,
					markdownFieldKey: 'desc'
				}
			];
		}
	);

	if (items.length === 0) {
		return null;
	}

	const groupedEntries = new Map<string, CompendiumBenefitGroup>();
	for (const item of items) {
		const groupKey = item.benefitType?.toLowerCase() ?? 'other';
		const existingGroup = groupedEntries.get(groupKey);
		const entry = {
			markdownKey: item.markdownKey,
			name: item.name
		} satisfies CompendiumBenefitEntry;

		if (existingGroup) {
			existingGroup.items.push(entry);
			continue;
		}

		groupedEntries.set(groupKey, {
			key: groupKey,
			title: getBackgroundBenefitGroupLabel(groupKey),
			items: [entry]
		});
	}

	return {
		key: 'benefits',
		title: 'Background Benefits',
		description: 'Training, equipment, and story hooks granted by this background.',
		kind: 'benefits',
		layout: 'grouped',
		items: items.map(({ markdownKey, name }) => ({ markdownKey, name })),
		groups: sortBackgroundBenefitGroups(Array.from(groupedEntries.values()))
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
				markdownKey:
					typeof property.desc === 'string' ? `weaponProperties.${index}.desc` : undefined
			};
		})
		.filter((entry): entry is NonNullable<typeof entry> => entry !== null);

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

			const featureType = getFeatureType(entry.feature_type);
			const name = getString(entry.name) ?? getString(entry.key);
			const description = getMeaningfulDescription(entry.desc);
			if (!name || !description || featureType !== 'CLASS_LEVEL_FEATURE') {
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
				markdownKey: `features.${index}.desc`
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

function buildClassCoreTraitsSection(rawValue: unknown): CompendiumMarkdownSection | null {
	if (!Array.isArray(rawValue) || rawValue.length === 0) {
		return null;
	}

	const entryIndex = rawValue.findIndex(
		(entry) =>
			isRecord(entry) &&
			getFeatureType(entry.feature_type) === 'CORE_TRAITS_TABLE' &&
			Boolean(getMeaningfulDescription(entry.desc))
	);
	if (entryIndex < 0) {
		return null;
	}

	const entry = rawValue[entryIndex] as Record<string, unknown>;
	return {
		key: getString(entry.key) ?? 'core-traits',
		title: getString(entry.name) ?? 'Core Traits',
		description: 'Core class table data and training summary.',
		kind: 'markdown',
		markdownKey: `features.${entryIndex}.desc`,
		defaultOpen: true
	};
}

function getClassSupplementalSectionDescription(featureType: string): string | undefined {
	switch (featureType) {
		case 'CORE_TRAITS_TABLE':
			return 'Core class table data and training summary.';
		case 'PROFICIENCIES':
			return 'Starting proficiencies, saves, and skill training.';
		case 'STARTING_EQUIPMENT':
			return 'Default starting gear and equipment choices.';
		case 'CLASS_FEATURE_OPTION_LIST':
			return 'Feature option list and available choices.';
		default:
			return undefined;
	}
}

function buildClassSupplementalMarkdownSections(rawValue: unknown): CompendiumMarkdownSection[] {
	if (!Array.isArray(rawValue) || rawValue.length === 0) {
		return [];
	}

	const supportedTypes = new Set([
		'CORE_TRAITS_TABLE',
		'PROFICIENCIES',
		'STARTING_EQUIPMENT',
		'CLASS_FEATURE_OPTION_LIST'
	]);

	const sections = rawValue
		.map((entry, index) => {
			if (!isRecord(entry)) {
				return null;
			}

			const featureType = getFeatureType(entry.feature_type);
			const description = getMeaningfulDescription(entry.desc);
			if (!featureType || !supportedTypes.has(featureType) || !description) {
				return null;
			}

			return {
				key: getString(entry.key) ?? `features-${index}`,
				title: getString(entry.name) ?? formatFieldName(featureType.toLowerCase()),
				description: getClassSupplementalSectionDescription(featureType),
				kind: 'markdown' as const,
				markdownKey: `features.${index}.desc`,
				defaultOpen: featureType === 'CORE_TRAITS_TABLE'
			};
		})
		.filter((entry) => entry !== null);

	return sections;
}

function normalizeClassTableEntries(
	rawValue: unknown,
	supportedTypes: Set<string>
): Array<Record<string, unknown> & { feature_type: string; name: string }> {
	if (!Array.isArray(rawValue)) {
		return [];
	}

	return rawValue
		.map((entry) => {
			if (!isRecord(entry)) {
				return null;
			}

			const featureType = getFeatureType(entry.feature_type);
			const name = getString(entry.name);
			if (!featureType || !name || !supportedTypes.has(featureType)) {
				return null;
			}

			return {
				...entry,
				feature_type: featureType,
				name
			};
		})
		.filter(
			(entry): entry is Record<string, unknown> & { feature_type: string; name: string } =>
				entry !== null
		);
}

function getClassTableValues(entry: Record<string, unknown>): Map<number, string> {
	const rawTableData = entry.data_for_class_table;
	if (!Array.isArray(rawTableData)) {
		return new Map();
	}

	return new Map(
		rawTableData
			.map((row) => {
				if (!isRecord(row) || typeof row.level !== 'number') {
					return null;
				}

				const value = getString(row.column_value) ?? String(row.column_value ?? '').trim();
				if (!value) {
					return null;
				}

				return [row.level, value] as const;
			})
			.filter((row): row is readonly [number, string] => row !== null)
	);
}

function buildClassTableSections(rawValue: unknown): CompendiumClassTableSection[] {
	const entries = normalizeClassTableEntries(
		rawValue,
		new Set(['PROFICIENCY_BONUS', 'CLASS_TABLE_DATA', 'SPELL_SLOTS'])
	);
	if (entries.length === 0) {
		return [];
	}

	const progressionEntries = entries.filter((entry) => entry.feature_type !== 'SPELL_SLOTS');
	const spellSlotEntries = entries.filter((entry) => entry.feature_type === 'SPELL_SLOTS');
	const sections: CompendiumClassTableSection[] = [];

	function buildSection(
		key: string,
		title: string,
		description: string,
		tableEntries: Array<Record<string, unknown> & { feature_type: string; name: string }>
	): CompendiumClassTableSection | null {
		if (tableEntries.length === 0) {
			return null;
		}

		const columns = tableEntries.map((entry) => ({
			key: getString(entry.key) ?? entry.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
			label: entry.name
		}));

		const rowLevels = new Set<number>();
		const columnValues = new Map<string, Map<number, string>>();
		for (const [index, entry] of tableEntries.entries()) {
			const columnKey = columns[index].key;
			const values = getClassTableValues(entry);
			columnValues.set(columnKey, values);
			for (const level of values.keys()) {
				rowLevels.add(level);
			}
		}

		const rows = Array.from(rowLevels)
			.sort((a, b) => a - b)
			.map((level) => ({
				level,
				values: Object.fromEntries(
					columns.map((column) => [column.key, columnValues.get(column.key)?.get(level) ?? '—'])
				)
			}));

		if (rows.length === 0) {
			return null;
		}

		return {
			key,
			title,
			description,
			kind: 'class-table',
			columns,
			rows
		};
	}

	const progressionSection = buildSection(
		'class-progression',
		'Class Progression',
		'Level-based class table data such as proficiency bonus and scaling resources.',
		progressionEntries
	);
	if (progressionSection) {
		sections.push(progressionSection);
	}

	const spellSlotSection = buildSection(
		'spell-slots',
		'Spell Slots',
		'Spell slot progression by class level.',
		spellSlotEntries
	);
	if (spellSlotSection) {
		sections.push(spellSlotSection);
	}

	return sections;
}

function buildCreatureEncounterSection(
	itemData: Record<string, unknown>
): CompendiumCreatureEncounterSection | null {
	const orderedAbilities = [
		'strength',
		'dexterity',
		'constitution',
		'intelligence',
		'wisdom',
		'charisma'
	];
	const abilityScoresRecord = isRecord(itemData.ability_scores)
		? (itemData.ability_scores as Record<string, unknown>)
		: null;
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

	const benefitsSection =
		item.type === 'backgrounds'
			? buildBackgroundBenefitsSection(itemData.benefits)
			: buildBenefitsSection(itemData.benefits);
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

	const spellClassesSection =
		item.type === 'spells' ? buildSpellClassesSection(itemData.classes) : null;
	if (spellClassesSection) {
		sections.push(spellClassesSection);
		consumedSectionKeys.add('classes');
	}

	const higherLevelSection =
		item.type === 'spells' ? buildHigherLevelSection(itemData.higher_level) : null;
	if (higherLevelSection) {
		sections.push(higherLevelSection);
		consumedSectionKeys.add('higher_level');
	}

	const classFeaturesSection =
		item.type === 'classes' ? buildClassFeaturesSection(itemData.features) : null;
	const classSupplementalSections =
		item.type === 'classes' ? buildClassSupplementalMarkdownSections(itemData.features) : [];
	for (const section of classSupplementalSections) {
		sections.push(section);
	}
	const classTableSections =
		item.type === 'classes' ? buildClassTableSections(itemData.features) : [];
	for (const section of classTableSections) {
		sections.push(section);
	}
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

function getCollectionIndexFromMarkdownKey(
	key: string,
	collectionKey: string,
	fieldKey = 'desc'
): number | null {
	const match = key.match(new RegExp(`^${collectionKey}\\.(\\d+)\\.${fieldKey}$`));
	if (!match) {
		return null;
	}

	const index = Number.parseInt(match[1], 10);
	return Number.isNaN(index) ? null : index;
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
	const descriptionsIndex =
		descriptionsSection && key.startsWith('descriptions.')
			? getCollectionIndexFromMarkdownKey(key, 'descriptions')
			: null;
	if (descriptionsIndex !== null) {
		return getMarkdownArrayEntry(itemData, 'descriptions', descriptionsIndex);
	}

	const benefitsSection = payload.sections.find(
		(section): section is CompendiumBenefitsSection => section.kind === 'benefits'
	);
	const benefitsIndex =
		benefitsSection && key.startsWith('benefits.')
			? Number.parseInt(key.split('.')[1] ?? '', 10)
			: null;
	if (benefitsIndex !== null) {
		if (Number.isNaN(benefitsIndex)) {
			return null;
		}

		if (key.endsWith('.connections') || key.endsWith('.mementos')) {
			const benefitText = getMarkdownArrayEntry(itemData, 'benefits', benefitsIndex);
			if (!benefitText) {
				return null;
			}

			const splitBenefit = splitConnectionAndMementoBenefit(benefitText);
			if (key.endsWith('.connections')) {
				return splitBenefit.connections ?? null;
			}

			return splitBenefit.mementos ?? null;
		}

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
	const traitIndex =
		traitsSection && key.startsWith('traits.')
			? getCollectionIndexFromMarkdownKey(key, 'traits')
			: null;
	if (traitIndex !== null) {
		return getMarkdownArrayEntry(itemData, 'traits', traitIndex);
	}

	const classFeaturesSection = payload.sections.find(
		(section): section is CompendiumClassFeaturesSection => section.kind === 'class-features'
	);
	const featureIndex =
		classFeaturesSection && key.startsWith('features.')
			? getCollectionIndexFromMarkdownKey(key, 'features')
			: null;
	if (featureIndex !== null) {
		return getMarkdownArrayEntry(itemData, 'features', featureIndex);
	}

	const creatureEncounterSection = payload.sections.find(
		(section): section is CompendiumCreatureEncounterSection =>
			section.kind === 'creature-encounter'
	);
	const actionIndex =
		creatureEncounterSection && key.startsWith('actions.')
			? getCollectionIndexFromMarkdownKey(key, 'actions')
			: null;
	if (actionIndex !== null) {
		return getMarkdownArrayEntry(itemData, 'actions', actionIndex);
	}

	const creatureTraitIndex =
		creatureEncounterSection && key.startsWith('traits.')
			? getCollectionIndexFromMarkdownKey(key, 'traits')
			: null;
	if (creatureTraitIndex !== null) {
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

		if (
			section.kind === 'descriptions' ||
			section.kind === 'benefits' ||
			section.kind === 'traits'
		) {
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
