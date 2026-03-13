import type { CompendiumTypeName } from '$lib/core/types/compendium';

export type CardIconData = {
	school?: { name?: string; key?: string } | string;
	type?: { name?: string } | string;
	damage_types?: unknown;
	target_type?: unknown;
};

export type DynamicCompendiumIcon =
	| {
			family: 'spell-school';
			value: string;
	  }
	| {
			family: 'creature-type';
			value: string;
	  }
	| {
			family: 'damage-type';
			value: string;
	  }
	| {
			family: 'aoe';
			value: string;
	  };

export function resolveCompendiumCardIcon(
	type: CompendiumTypeName,
	itemData: CardIconData
): DynamicCompendiumIcon | undefined {
	if (type === 'spells') {
		const school = readToken(itemData.school);
		return school ? { family: 'spell-school', value: school } : undefined;
	}

	if (type === 'creatures') {
		const creatureType = readToken(itemData.type);
		return creatureType ? { family: 'creature-type', value: creatureType } : undefined;
	}

	return undefined;
}

function readToken(value: CardIconData['school'] | CardIconData['type']): string | undefined {
	if (!value) return undefined;
	if (typeof value === 'string') return normalizeToken(value);

	return normalizeToken(value.name ?? ('key' in value ? value.key : undefined));
}

function normalizeToken(value: string | undefined): string | undefined {
	return value?.trim().toLowerCase().replace(/\s+/g, '-');
}

export function resolveDamageTypeTokens(value: unknown): string[] {
	if (value == null) return [];
	if (typeof value === 'string') {
		return value
			.split(',')
			.map((part) => normalizeToken(part))
			.filter((token): token is string => Boolean(token));
	}

	if (Array.isArray(value)) {
		return value
			.map((entry) => {
				if (typeof entry === 'string') return normalizeToken(entry);
				if (entry && typeof entry === 'object') {
					const record = entry as Record<string, unknown>;
					if (typeof record.name === 'string') return normalizeToken(record.name);
					if (typeof record.key === 'string') return normalizeToken(record.key);
				}
				return undefined;
			})
			.filter((token): token is string => Boolean(token));
	}

	return [];
}

export function resolveAoeToken(value: unknown): string | undefined {
	if (typeof value !== 'string') return undefined;

	const normalized = normalizeToken(value);
	if (!normalized) return undefined;

	if (normalized.includes('cone')) return 'cone';
	if (normalized.includes('sphere') || normalized.includes('radius')) return 'sphere';
	if (normalized.includes('cube')) return 'cube';
	if (normalized.includes('line')) return 'line';
	if (normalized.includes('wall')) return 'wall';
	if (normalized.includes('self')) return 'self';
	if (normalized.includes('touch')) return 'touch';
	if (normalized.includes('creature')) return 'creature';
	if (normalized.includes('point')) return 'point';

	return normalized;
}
