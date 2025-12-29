/**
 * Compendium Loader Types
 *
 * Type definitions for the generic server-side loader.
 */

import type { CompendiumTypeName, CompendiumItem } from './index';

export interface LoaderOptions {
	slug: string;
	type: CompendiumTypeName;
	typeLabel: string; // 'Spell' | 'Monster' for error messages
}

export interface NavigationResult {
	item: CompendiumItem;
	navigation: {
		prev: CompendiumItem | null;
		next: CompendiumItem | null;
		currentIndex: number;
		total: number;
	};
}
