/**
 * Compendium Loader Types
 *
 * Type definitions for the generic server-side loader.
 */

import type { CompendiumTypeName } from './index';

export interface LoaderOptions {
	slug: string;
	type: CompendiumTypeName;
	typeLabel: string; // 'Spell' | 'Monster' for error messages
}

export interface NavigationItem {
	externalId: string;
	__rowId: number;
	source?: string;
	name: string;
	// Monster fields
	type?: string;
	size?: string;
	challenge_rating?: string;
	// Spell fields
	level?: number;
	school?: string;
	// Additional fields from details
	[key: string]: unknown;
}

export interface NavigationResult {
	item: NavigationItem;
	navigation: {
		prev: NavigationItem | null;
		next: NavigationItem | null;
		currentIndex: number;
		total: number;
	};
}
