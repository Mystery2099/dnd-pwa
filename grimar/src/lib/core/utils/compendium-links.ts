import { COMPENDIUM_TYPE_CONFIGS } from '$lib/core/constants/compendium';
import type { CompendiumTypeName } from '$lib/core/types/compendium';

export interface ResolvedCompendiumLink {
	type: CompendiumTypeName;
	key: string;
	label: string;
	href: string;
	meta?: string;
	sourceUrl: string;
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

export function resolveCompendiumLink(
	value: string,
	preferredLabel?: string,
	meta?: string
): ResolvedCompendiumLink | null {
	try {
		const parsed = new URL(value);
		const pathParts = parsed.pathname.split('/').filter(Boolean);
		const apiIndex = pathParts.indexOf('v2');
		const endpoint = apiIndex >= 0 ? pathParts[apiIndex + 1] : null;
		const key = apiIndex >= 0 ? pathParts[apiIndex + 2] : null;

		if (!endpoint || !key) {
			return null;
		}

		const type = endpointToTypeMap.get(endpoint);
		if (!type) {
			return null;
		}

		return {
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
