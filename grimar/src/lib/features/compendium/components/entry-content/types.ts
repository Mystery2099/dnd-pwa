export type FieldType = 'text' | 'array' | 'boolean' | 'markdown' | 'list' | 'object';

export interface FieldConfig {
	key: string;
	label: string;
	type: FieldType;
	format?: (value: unknown) => string;
	listKey?: string;
	objectKey?: string;
}

export interface SectionConfig {
	title?: string;
	fields: FieldConfig[];
	columns?: number;
}
