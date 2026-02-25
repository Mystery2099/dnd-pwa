export interface LinkedItem {
	name?: string;
	key?: string;
	url?: string;
}

export interface WeaponProperty {
	property?: {
		name?: string;
		type?: string | null;
		desc?: string;
	};
	detail?: string | null;
}

export interface DescriptionItem {
	desc: string;
	document?: string;
	gamesystem?: string;
}

export interface BenefitItem {
	desc: string;
}

export interface SpeedData {
	unit?: string;
	walk?: number;
	crawl?: number;
	fly?: number;
	hover?: boolean;
	burrow?: number;
	climb?: number;
	swim?: number;
}

export interface LanguageData {
	as_string?: string;
	data?: LinkedItem[];
	languages?: string[];
	any_languages?: number;
	any_one_language?: number;
	telepathy?: number;
	understands_but_cant_speak?: string[];
}

export function isLinkedItem(obj: unknown): obj is LinkedItem {
	if (!obj || typeof obj !== 'object') return false;
	const o = obj as Record<string, unknown>;
	return (typeof o.name === 'string' || typeof o.key === 'string') && typeof o.url === 'string';
}

export function isLinkedArray(value: unknown): value is LinkedItem[] {
	return Array.isArray(value) && value.length > 0 && isLinkedItem(value[0]);
}

export function getLinkedItems(value: unknown): LinkedItem[] | null {
	if (isLinkedArray(value)) return value;
	if (isLinkedItem(value)) return [value];
	return null;
}

export function isWeaponPropertyArray(value: unknown): value is WeaponProperty[] {
	if (!Array.isArray(value) || value.length === 0) return false;
	const first = value[0] as Record<string, unknown>;
	return typeof first.property === 'object';
}

export function getWeaponProperties(value: unknown): WeaponProperty[] | null {
	return isWeaponPropertyArray(value) ? value : null;
}

export function isDescriptionArray(value: unknown): value is DescriptionItem[] {
	if (!Array.isArray(value) || value.length === 0) return false;
	const first = value[0] as Record<string, unknown>;
	return typeof first.desc === 'string' && ('document' in first || 'gamesystem' in first);
}

export function getDescriptions(value: unknown): DescriptionItem[] | null {
	return isDescriptionArray(value) ? value : null;
}

export function isBenefitArray(value: unknown): value is BenefitItem[] {
	if (!Array.isArray(value) || value.length === 0) return false;
	const first = value[0] as Record<string, unknown>;
	return typeof first.desc === 'string' && !('document' in first) && !('gamesystem' in first) && !('property' in first);
}

export function getBenefits(value: unknown): BenefitItem[] | null {
	return isBenefitArray(value) ? value : null;
}

export function isSpeedObject(value: unknown): value is SpeedData {
	if (!value || typeof value !== 'object') return false;
	const o = value as Record<string, unknown>;
	return typeof o.walk === 'number' || typeof o.swim === 'number' || typeof o.fly === 'number';
}

export function isLanguageObject(value: unknown): value is LanguageData {
	if (!value || typeof value !== 'object') return false;
	const o = value as Record<string, unknown>;
	return typeof o.as_string === 'string' || Array.isArray(o.data) || Array.isArray(o.languages);
}
