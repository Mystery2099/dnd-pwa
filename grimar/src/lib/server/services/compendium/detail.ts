import { COMPENDIUM_TYPE_CONFIGS, type CompendiumTypeName } from '$lib/core/constants/compendium';
import type { CompendiumItem } from '$lib/server/db/schema';
import { formatFieldName } from '$lib/utils/compendium';

export interface CompendiumDetailReference {
	kind: 'entity';
	type: CompendiumTypeName;
	key: string;
	label: string;
	href: string;
	meta?: string;
	sourceUrl: string;
}

export type CompendiumDetailValue =
	| string
	| number
	| boolean
	| null
	| CompendiumDetailReference
	| CompendiumDetailValue[]
	| { [key: string]: CompendiumDetailValue };

export interface CompendiumDetailField {
	key: string;
	label: string;
	value: CompendiumDetailValue;
}

export interface CompendiumDetailSection {
	key: string;
	title: string;
	description?: string;
	kind: 'entity-list';
	items: CompendiumDetailValue[];
}

export interface CompendiumDetailPayload {
	item: CompendiumItem;
	fields: CompendiumDetailField[];
	sections: CompendiumDetailSection[];
}

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

function normalizeFields(item: CompendiumItem): {
	fields: CompendiumDetailField[];
	sections: CompendiumDetailSection[];
} {
	const itemData = (item.data ?? {}) as Record<string, unknown>;
	const sections: CompendiumDetailSection[] = [];
	const fields: CompendiumDetailField[] = [];

	for (const [key, rawValue] of Object.entries(itemData)) {
		if (key === 'creatures' && item.type === 'creaturesets' && Array.isArray(rawValue)) {
			sections.push({
				key: 'creatures',
				title: 'Roster',
				description: 'Creatures included in this set.',
				kind: 'entity-list',
				items: rawValue.map((entry) => normalizeValue(entry))
			});
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
		item,
		fields,
		sections
	};
}
