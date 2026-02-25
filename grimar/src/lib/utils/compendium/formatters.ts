import type {
	LinkedItem,
	WeaponProperty,
	SpeedData,
	LanguageData
} from './type-guards';
import {
	isLinkedArray,
	isWeaponPropertyArray,
	isLanguageObject,
	isSpeedObject
} from './type-guards';

export function formatSpeed(speed: SpeedData): string {
	const parts: string[] = [];
	const unit = speed.unit ?? 'ft';
	if (speed.walk) parts.push(`Walk ${speed.walk} ${unit}`);
	if (speed.swim) parts.push(`Swim ${speed.swim} ${unit}`);
	if (speed.fly && speed.fly > 0) parts.push(`Fly ${speed.fly} ${unit}${speed.hover ? ' (hover)' : ''}`);
	if (speed.burrow) parts.push(`Burrow ${speed.burrow} ${unit}`);
	if (speed.climb) parts.push(`Climb ${speed.climb} ${unit}`);
	if (speed.crawl) parts.push(`Crawl ${speed.crawl} ${unit}`);
	return parts.join(', ') || '—';
}

export function formatLanguages(lang: LanguageData): string {
	if (lang.as_string) return lang.as_string;
	const parts: string[] = [];
	if (lang.data && lang.data.length > 0) {
		parts.push(lang.data.map((l: LinkedItem) => l.name ?? l.key ?? '').filter(Boolean).join(', '));
	}
	if (lang.languages && lang.languages.length > 0) {
		parts.push(lang.languages.join(', '));
	}
	if (lang.any_languages) parts.push(`any ${lang.any_languages} languages`);
	if (lang.any_one_language) parts.push(`any one language`);
	if (lang.telepathy) parts.push(`telepathy ${lang.telepathy} ft`);
	if (lang.understands_but_cant_speak?.length) {
		parts.push(`understands ${lang.understands_but_cant_speak.join(', ')} but can't speak`);
	}
	return parts.join('; ') || '—';
}

export function formatFieldName(key: string): string {
	return key
		.replace(/_/g, ' ')
		.replace(/([A-Z])/g, ' $1')
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ')
		.trim();
}

export function formatValue(value: unknown): string {
	if (value === null || value === undefined) return '—';
	if (typeof value === 'boolean') return value ? 'Yes' : 'No';
	if (typeof value === 'number') return value.toLocaleString();
	if (typeof value === 'string') return value;

	if (isLinkedArray(value)) return value.map((v: LinkedItem) => v.name ?? v.key ?? '').filter(Boolean).join(', ');
	if (isWeaponPropertyArray(value)) {
		return value
			.map((wp: WeaponProperty) => {
				const name = wp.property?.name ?? '';
				return wp.detail ? `${name} (${wp.detail})` : name;
			})
			.filter(Boolean)
			.join(', ');
	}
	if (Array.isArray(value)) {
		if (value.length === 0) return 'None';
		if (typeof value[0] === 'string') return value.join(', ');
		return JSON.stringify(value);
	}
	if (isLanguageObject(value)) return formatLanguages(value);
	if (isSpeedObject(value)) return formatSpeed(value);
	if (typeof value === 'object' && value !== null) {
		const o = value as Record<string, unknown>;
		if (typeof o.name === 'string') return o.name;
	}
	return String(value);
}

export const DISPLAY_FIELDS: Record<string, string[]> = {
	spells: ['level', 'school', 'casting_time', 'duration', 'range', 'range_text', 'concentration', 'ritual', 'verbal', 'somatic', 'material', 'material_specified', 'material_cost', 'material_consumed', 'target_type', 'target_count', 'saving_throw_ability', 'attack_roll', 'damage_roll', 'damage_types', 'classes'],
	creatures: ['type', 'size', 'challenge_rating_text', 'alignment', 'armor_class', 'armor_detail', 'hit_points', 'hit_dice', 'experience_points'],
	classes: ['hit_die', 'saving_throws', 'primary_abilities'],
	species: ['size', 'speed'],
	backgrounds: [],
	feats: [],
	weapons: ['damage_dice', 'damage_type', 'weight', 'range'],
	armor: ['armor_class', 'armor_type', 'weight', 'strength_required', 'stealth_disadvantage'],
	magicitems: ['rarity', 'requires_attunement', 'type']
};

export const EXCLUDE_FIELDS = [
	'key', 'name', 'desc', 'description', 'descriptions', 'document', 'document_key', 
	'document_name', 'gamesystem_key', 'gamesystem_name', 'publisher_key', 'publisher_name', 
	'created_at', 'updated_at', 'url', 'features', 'benefits', 'properties', 'speed_all', 'languages'
];

export function getDisplayFields(type: string): string[] {
	return DISPLAY_FIELDS[type] ?? [];
}

export function shouldDisplayField(key: string, type: string): boolean {
	if (EXCLUDE_FIELDS.includes(key)) return false;
	const displayFields = getDisplayFields(type);
	if (displayFields.length > 0) {
		return displayFields.includes(key);
	}
	return true;
}

export function getSortedFields(itemData: Record<string, unknown>, type: string): [string, unknown][] {
	const fields = Object.entries(itemData).filter(([key]) => shouldDisplayField(key, type));
	const displayFields = getDisplayFields(type);

	if (displayFields.length > 0) {
		fields.sort((a, b) => {
			const aIndex = displayFields.indexOf(a[0]);
			const bIndex = displayFields.indexOf(b[0]);
			if (aIndex === -1 && bIndex === -1) return 0;
			if (aIndex === -1) return 1;
			if (bIndex === -1) return -1;
			return aIndex - bIndex;
		});
	} else {
		fields.sort((a, b) => a[0].localeCompare(b[0]));
	}

	return fields;
}

export function renderDescription(desc: unknown): string {
	if (typeof desc !== 'string') return '';
	return desc
		.replace(/<\/?p>/gi, '\n')
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<[^>]+>/g, '')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}
