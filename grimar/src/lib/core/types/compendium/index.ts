export type CompendiumTypeName =
	| 'spells'
	| 'creatures'
	| 'species'
	| 'classes'
	| 'subclasses'
	| 'classfeatures'
	| 'backgrounds'
	| 'feats'
	| 'skills'
	| 'abilities'
	| 'weapons'
	| 'armor'
	| 'items'
	| 'magicitems'
	| 'itemcategories'
	| 'itemrarities'
	| 'itemsets'
	| 'weaponproperties'
	| 'weaponpropertyassignments'
	| 'conditions'
	| 'damagetypes'
	| 'environments'
	| 'sizes'
	| 'languages'
	| 'alignments'
	| 'documents'
	| 'gamesystems'
	| 'publishers'
	| 'licenses'
	| 'images'
	| 'services'
	| 'rulesections'
	| 'rulesets'
	| 'creaturetypes'
	| 'creaturesets'
	| 'creatureactions'
	| 'creatureactionattacks'
	| 'creaturetraits'
	| 'speciestraits'
	| 'backgroundbenefits'
	| 'featbenefits'
	| 'classfeatureitems'
	| 'spellcastingoptions'
	| 'spellschools'
	| 'rules';

export interface CompendiumItem {
	key: string;
	type: CompendiumTypeName;
	name: string;
	source: string | null;
	documentKey: string | null;
	documentName: string | null;
	gamesystemKey: string | null;
	gamesystemName: string | null;
	publisherKey: string | null;
	publisherName: string | null;
	description: string | null;
	data: Record<string, unknown>;
	createdAt: Date;
	updatedAt: Date;
}

export interface CompendiumTypeConfig {
	name: CompendiumTypeName;
	label: string;
	plural: string;
	icon: string;
	description: string;
	endpoint: string;
}

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

export interface CompendiumEntityListSection {
	key: string;
	title: string;
	description?: string;
	kind: 'entity-list';
	items: CompendiumDetailValue[];
}

export interface CompendiumCreatureSetRosterEntry {
	key: string;
	label: string;
	href: string;
	type?: string;
	size?: string;
	documentLabel?: string;
	environments: string[];
	challengeRatingText?: string;
	armorClass?: number;
	hitPoints?: number;
	speed?: string;
}

export interface CompendiumCreatureSetRosterSection {
	key: string;
	title: string;
	description?: string;
	kind: 'creature-set-roster';
	items: CompendiumCreatureSetRosterEntry[];
}

export type CompendiumDetailSection =
	| CompendiumEntityListSection
	| CompendiumCreatureSetRosterSection;

export interface CompendiumDetailPayload {
	item: CompendiumItem;
	fields: CompendiumDetailField[];
	sections: CompendiumDetailSection[];
}

export interface CompendiumSearchResult {
	items: CompendiumItem[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
	hasMore: boolean;
	resultsTruncated: boolean;
}

export interface CompendiumFilterOptions {
	search?: string;
	type?: CompendiumTypeName;
	types?: CompendiumTypeName[];
	gamesystem?: string;
	document?: string;
	source?: string;
	sortBy?: 'name' | 'createdAt' | 'updatedAt';
	sortOrder?: 'asc' | 'desc';
	page?: number;
	pageSize?: number;
}
