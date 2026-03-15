import type { CompendiumDetailReference } from '$lib/core/types/compendium';

export function isCompendiumDetailReference(value: unknown): value is CompendiumDetailReference {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return false;
	}

	const record = value as Record<string, unknown>;
	return (
		record.kind === 'entity' &&
		typeof record.label === 'string' &&
		record.label.trim().length > 0 &&
		typeof record.href === 'string' &&
		record.href.trim().length > 0 &&
		typeof record.key === 'string' &&
		record.key.trim().length > 0 &&
		typeof record.type === 'string' &&
		record.type.trim().length > 0
	);
}

export function getCompendiumDetailReferenceLabel(value: unknown): string | null {
	return isCompendiumDetailReference(value) ? value.label : null;
}
