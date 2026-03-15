import type { CompendiumTypeName } from '$lib/core/constants/compendium';
import type {
	CompendiumBenefitsSection,
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
	CompendiumTraitsSection,
	CompendiumWeaponPropertiesSection
} from '$lib/core/types/compendium';
import { resolveCompendiumLink } from '$lib/core/utils/compendium-links';
import type { CompendiumItem } from '$lib/server/db/schema';
import { formatFieldName, getSortedFields } from '$lib/utils/compendium';

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
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return undefined;
	}

	const record = value as Record<string, unknown>;
	const walk = record.walk;
	if (typeof walk !== 'number') {
		return undefined;
	}

	return `${walk} ${getString(record.unit) ?? 'ft'}`;
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

function normalizeFields(item: CompendiumItem): {
	fields: CompendiumDetailField[];
	sections: CompendiumDetailSection[];
} {
	const itemData = (item.data ?? {}) as Record<string, unknown>;
	const sections: CompendiumDetailSection[] = [];
	const fields: CompendiumDetailField[] = [];
	const consumedSectionKeys = new Set<string>();

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
		item: {
			...item,
			type: item.type as CompendiumTypeName
		},
		fields,
		sections
	};
}
