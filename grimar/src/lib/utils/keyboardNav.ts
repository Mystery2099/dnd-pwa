/**
 * Keyboard Navigation Utility
 *
 * Provides keyboard navigation handlers for compendium detail pages.
 * Supports: ArrowLeft/ArrowRight for navigation, Escape to close.
 */

import { goto } from '$app/navigation';
import { onMount } from 'svelte';
import type { NavigationItem } from '$lib/types/compendium/loader';

interface KeyboardNavOptions {
	navigation: {
		prev: NavigationItem | null;
		next: NavigationItem | null;
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

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	// Return cleanup function for manual cleanup
	return () => {
		window.removeEventListener('keydown', handleKeydown);
	};
}
