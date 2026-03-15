import type {
	CompendiumDetailHeaderBadge,
	CompendiumListItem,
	CompendiumSearchResult
} from '$lib/core/types/compendium';
import type { CompendiumTypeName } from '$lib/core/types/compendium';
import {
	resolveAoeToken,
	type CardIconData,
	resolveCompendiumCardIcon,
	resolveDamageTypeTokens
} from '$lib/core/utils/compendiumIconography';
import { formatValue, getImageKindLabel } from '$lib/utils/compendium';
import type { CompendiumItem as DbCompendiumItem } from '$lib/server/db/schema';

function getDocumentLabel(
	item: DbCompendiumItem,
	itemData: Record<string, unknown>
): string | undefined {
	const document = itemData.document;
	if (document && typeof document === 'object' && !Array.isArray(document)) {
		const record = document as Record<string, unknown>;
		if (typeof record.display_name === 'string' && record.display_name.trim()) {
			return record.display_name.trim();
		}
		if (typeof record.name === 'string' && record.name.trim()) {
			return record.name.trim();
		}
	}

	return item.documentName ?? undefined;
}

function getDescription(item: DbCompendiumItem, itemData: Record<string, unknown>): string | undefined {
	if (typeof item.description === 'string' && item.description.trim()) {
		return item.description.trim();
	}

	return typeof itemData.alt_text === 'string' && itemData.alt_text.trim()
		? itemData.alt_text
		: undefined;
}

function readCardIconData(itemData: Record<string, unknown>): CardIconData {
	return {
		school:
			typeof itemData.school === 'string' ||
			(itemData.school && typeof itemData.school === 'object' && !Array.isArray(itemData.school))
				? (itemData.school as CardIconData['school'])
				: undefined,
		type:
			typeof itemData.type === 'string' ||
			(itemData.type && typeof itemData.type === 'object' && !Array.isArray(itemData.type))
				? (itemData.type as CardIconData['type'])
				: undefined,
		damage_types: itemData.damage_types,
		target_type: itemData.target_type
	};
}

function toCoreCompendiumItem(item: DbCompendiumItem): CompendiumListItem['item'] {
	return {
		...item,
		type: item.type as CompendiumTypeName
	};
}

function buildBadges(
	item: DbCompendiumItem,
	itemData: Record<string, unknown>
): CompendiumDetailHeaderBadge[] {
	if (item.type === 'spells') {
		const badges: CompendiumDetailHeaderBadge[] = [];
		if (typeof itemData.level === 'number') {
			badges.push({
				label: itemData.level === 0 ? 'Cantrip' : `Level ${itemData.level}`,
				variant: 'solid'
			});
		}

		const schoolLabel = formatValue(itemData.school);
		const schoolToken = resolveCompendiumCardIcon('spells', readCardIconData(itemData))?.value;
		if (schoolLabel !== '—') {
			badges.push({
				label: schoolLabel,
				variant: 'outline',
				icon: schoolToken ? { family: 'spell-school', value: schoolToken } : undefined
			});
		}

		const damageTypeToken = resolveDamageTypeTokens(itemData.damage_types)[0];
		if (damageTypeToken) {
			badges.push({
				label: damageTypeToken,
				variant: 'outline',
				icon: { family: 'damage-type', value: damageTypeToken }
			});
		}

		const aoeToken = resolveAoeToken(itemData.target_type);
		if (aoeToken && typeof itemData.target_type === 'string' && itemData.target_type.trim()) {
			badges.push({
				label: itemData.target_type,
				variant: 'outline',
				icon: { family: 'aoe', value: aoeToken }
			});
		}

		return badges;
	}

	if (item.type === 'creatures') {
		const badges: CompendiumDetailHeaderBadge[] = [];
		if (
			typeof itemData.challenge_rating_text === 'string' &&
			itemData.challenge_rating_text.trim()
		) {
			badges.push({
				label: `CR ${itemData.challenge_rating_text.trim()}`,
				variant: 'solid'
			});
		}

		const typeLabel = formatValue(itemData.type);
		if (typeLabel !== '—') {
			badges.push({ label: typeLabel, variant: 'outline' });
		}

		return badges;
	}

	if (item.type === 'classes' || item.type === 'subclasses') {
		return itemData.hit_dice ? [{ label: `d${itemData.hit_dice}`, variant: 'solid' }] : [];
	}

	if (item.type === 'images') {
		const badges: CompendiumDetailHeaderBadge[] = [
			{
				label: getImageKindLabel(
					typeof itemData.file_url === 'string' ? itemData.file_url : undefined
				),
				variant: 'solid'
			}
		];

		if (typeof itemData.attribution === 'string' && itemData.attribution.trim()) {
			badges.push({ label: 'Artwork credit', variant: 'outline' });
		}

		return badges;
	}

	return [];
}

export function buildCompendiumListItem(item: DbCompendiumItem): CompendiumListItem {
	const itemData = (item.data ?? {}) as Record<string, unknown>;
	const resolvedCardIcon = resolveCompendiumCardIcon(
		item.type as CompendiumTypeName,
		readCardIconData(itemData)
	);

	return {
		item: toCoreCompendiumItem(item),
		presentation: {
			description: getDescription(item, itemData),
			documentLabel: getDocumentLabel(item, itemData),
			cardIcon: resolvedCardIcon
				? {
						family: resolvedCardIcon.family,
						value: resolvedCardIcon.value
					}
				: undefined,
			badges: buildBadges(item, itemData)
		}
	};
}

export function buildCompendiumListResult(
	result: Omit<CompendiumSearchResult, 'items' | 'listSchemaVersion'> & {
		items: DbCompendiumItem[];
	}
): CompendiumSearchResult {
	return {
		listSchemaVersion: 1,
		items: result.items.map((item) => buildCompendiumListItem(item)),
		total: result.total,
		page: result.page,
		pageSize: result.pageSize,
		totalPages: result.totalPages,
		hasMore: result.hasMore,
		resultsTruncated: result.resultsTruncated
	};
}
