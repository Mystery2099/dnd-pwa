import { COMPENDIUM_TYPE_CONFIGS, type CompendiumTypeName } from '$lib/core/constants/compendium';
import type {
	CompendiumCreatureSetRosterEntry,
	CompendiumCreatureSetRosterSection,
	CompendiumDetailField,
	CompendiumDetailPayload,
	CompendiumDetailReference,
	CompendiumDetailSection,
	CompendiumDetailValue,
	CompendiumEntityListSection
} from '$lib/core/types/compendium';
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

const endpointToTypeMap = new Map<string, CompendiumTypeName>(
	Object.values(COMPENDIUM_TYPE_CONFIGS).map((config) => [config.endpoint, config.name])
);

function formatSlugLabel(slug: string): string {
	return slug
		.replace(/[-_]+/g, ' ')
		.replace(/\b\w/g, (char) => char.toUpperCase())
		.trim();
}

function buildReferenceFromUrl(
	value: string,
	preferredLabel?: string,
	meta?: string
): CompendiumDetailReference | null {
	try {
		const parsed = new URL(value);
		const pathParts = parsed.pathname.split('/').filter(Boolean);
		const v2Index = pathParts.indexOf('v2');
		const endpoint = v2Index >= 0 ? pathParts[v2Index + 1] : null;
		const key = v2Index >= 0 ? pathParts[v2Index + 2] : null;

		if (!endpoint || !key) {
			return null;
		}

		const type = endpointToTypeMap.get(endpoint);
		if (!type) {
			return null;
		}

		return {
			kind: 'entity',
			type,
			key,
			label: preferredLabel?.trim() || formatSlugLabel(key),
			href: `/compendium/${type}/${key}`,
			meta,
			sourceUrl: value
		};
	} catch {
		return null;
	}
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

function normalizeFields(item: CompendiumItem): {
	fields: CompendiumDetailField[];
	sections: CompendiumDetailSection[];
} {
	const itemData = (item.data ?? {}) as Record<string, unknown>;
	const sections: CompendiumDetailSection[] = [];
	const fields: CompendiumDetailField[] = [];
	const orderedFields = getSortedFields(itemData, item.type);

	for (const [key, rawValue] of orderedFields) {
		if (key === 'creatures' && item.type === 'creaturesets' && Array.isArray(rawValue)) {
			const rosterSection = buildCreatureSetRosterSection(rawValue);
			if (rosterSection) {
				sections.push(rosterSection);
			}
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
