/**
 * Keyboard Navigation Utility
 *
 * Provides keyboard navigation handlers for compendium detail pages.
 * Supports: ArrowLeft/ArrowRight for navigation, Escape to close.
 */

import { goto } from '$app/navigation';
import { onMount } from 'svelte';
import type { CompendiumItem } from '$lib/core/types/compendium';

interface KeyboardNavOptions {
	navigation: {
		prev: CompendiumItem | null;
		next: CompendiumItem | null;
	};
	basePath: string;
	onClose?: () => void;
	listUrlKey?: string; // sessionStorage key for list URL
}

export function createKeyboardNav(options: KeyboardNavOptions): () => void {
	const { navigation, basePath, onClose, listUrlKey } = options;

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			if (onClose) {
				onClose();
			} else if (listUrlKey) {
				const listUrl = sessionStorage.getItem(listUrlKey);
				goto(listUrl || basePath);
			} else {
				goto(basePath);
			}
		} else if (e.key === 'ArrowLeft' && navigation.prev) {
			goto(`${basePath}/${navigation.prev.externalId}`);
		} else if (e.key === 'ArrowRight' && navigation.next) {
			goto(`${basePath}/${navigation.next.externalId}`);
		}
	};

	window.addEventListener('keydown', handleKeydown);

	// Return cleanup function
	return () => {
		window.removeEventListener('keydown', handleKeydown);
	};
}
