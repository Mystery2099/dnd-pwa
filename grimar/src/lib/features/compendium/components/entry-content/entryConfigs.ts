import type { SectionConfig } from './types';

export const featConfig: SectionConfig[] = [
	{
		fields: [
			{ key: 'prerequisites', label: 'Prerequisites', type: 'array', format: (v: unknown) => (Array.isArray(v) ? v.join(', ') : String(v)) }
		],
		columns: 2
	},
	{
		title: 'Benefits',
		fields: [{ key: 'benefits', label: '', type: 'list' }]
	}
];

export const backgroundConfig: SectionConfig[] = [
	{
		fields: [
			{ key: 'skill_proficiencies', label: 'Skill Proficiencies', type: 'array' },
			{ key: 'tool_proficiencies', label: 'Tool Proficiencies', type: 'array' },
			{ key: 'languages', label: 'Languages', type: 'text' },
			{ key: 'equipment', label: 'Equipment', type: 'array' }
		],
		columns: 2
	},
	{
		title: 'Feature',
		fields: [{ key: 'feature', label: '', type: 'object' }]
	}
];

export const lookupConfig: SectionConfig[] = [
	{
		fields: [{ key: 'name', label: 'Name', type: 'text' }]
	}
];

export function getConfigForType(dbType: string): SectionConfig[] | null {
	switch (dbType) {
		case 'feats':
		case 'feat':
			return featConfig;
		case 'backgrounds':
		case 'background':
			return backgroundConfig;
		case 'lookup':
			return lookupConfig;
		default:
			return null;
	}
}
