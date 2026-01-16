/**
 * Markdown rendering utilities for compendium entries.
 * Provides lazy loading and link interception for internal navigation.
 */

import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import { open5eToInternalPath } from '$lib/core/utils/link-interceptor';

// ============================================================================
// Link Renderer
// ============================================================================

/**
 * Creates a link renderer component for svelte-markdown.
 * Intercepts internal Open5e links and converts them to app navigation.
 */
export function createLinkRenderer() {
	return {
		link: {
			component: 'a',
			props: {
				href: (props: { href: string }) => props.href,
				onclick: (props: { href: string }) => {
					return function handleClick(event: MouseEvent) {
						event.preventDefault();
						const href = props.href;
						const internalPath = open5eToInternalPath(href);

						if (internalPath && browser) {
							goto(internalPath);
						} else if (browser) {
							window.open(href, '_blank', 'noopener,noreferrer');
						}
					};
				}
			}
		}
	};
}

/**
 * Custom renderers for svelte-markdown with internal link handling.
 */
export const markdownRenderers = createLinkRenderer();

// ============================================================================
// Lazy Markdown Loading
// ============================================================================

/**
 * Hook for lazy loading svelte-markdown only when content exists.
 * Reduces initial bundle size by deferring the markdown library load.
 */
export function useLazyMarkdown(content: () => string) {
	let SvelteMarkdown: any = null;

	onMount(async () => {
		if (content() && !SvelteMarkdown) {
			const module = await import('svelte-markdown');
			SvelteMarkdown = module.default;
		}
	});

	return { SvelteMarkdown };
}
