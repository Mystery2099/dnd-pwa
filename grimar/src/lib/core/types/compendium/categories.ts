import type { ComponentType } from 'svelte';

export interface CompendiumCategory {
	id: string;
	title: string;
	gridCols: string;
}

export interface CompendiumCard {
	title: string;
	description: string;
	href: string;
	icon: ComponentType;
	gradient: string;
	accent: string;
	categoryId: string;
}
