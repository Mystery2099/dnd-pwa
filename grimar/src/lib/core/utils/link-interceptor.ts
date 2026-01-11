/**
 * Link Interceptor Utility
 *
 * Intercepts clicks on links in svelte-markdown rendered content.
 * Converts open5e.com URLs to internal navigation paths.
 */

import { goto } from '$app/navigation';
import { browser } from '$app/environment';

/**
 * URL patterns to intercept and their corresponding compendium types
 * Supports both v1 and v2 Open5e API URL patterns
 */
const OPEN5E_PATTERNS: Record<string, string> = {
	monsters: 'monster',
	spells: 'spell',
	items: 'item',
	feats: 'feat',
	backgrounds: 'background',
	races: 'race',
	classes: 'class',
	// v2 patterns
	creatures: 'monster',
	species: 'race'
};

/**
 * Parse an open5e URL and return an internal path if valid
 * @param url - The URL to parse (e.g., https://api.open5e.com/monsters/shroud)
 * @returns Internal path (e.g., /compendium/monsters/open5e/{document}/shroud) or null if not an open5e URL
 */
export function open5eToInternalPath(url: string, sourceBook: string = 'Unknown'): string | null {
	try {
		const urlObj = new URL(url);
		const hostname = urlObj.hostname;

		// Only intercept api.open5e.com URLs
		if (hostname !== 'api.open5e.com' && hostname !== 'open5e.com') {
			return null;
		}

		// Parse the path: /monsters/shroud -> ["monsters", "shroud"]
		const pathParts = urlObj.pathname.split('/').filter(Boolean);
		if (pathParts.length < 2) {
			return null;
		}

		const [type, ...slugParts] = pathParts;
		const compendiumType = OPEN5E_PATTERNS[type];

		if (!compendiumType) {
			// Unknown type - let it remain an external link
			return null;
		}

		const slug = slugParts.join('-');
		return `/compendium/${compendiumType}/open5e/${sourceBook}/${slug}`;
	} catch {
		// Invalid URL
		return null;
	}
}

/**
 * Options for the link interceptor
 */
export interface LinkInterceptorOptions {
	/** Called when an internal open5e URL is clicked */
	onInternal?: (path: string) => void;
	/** Called when an external URL is clicked */
	onExternal?: (url: string) => void;
}

/**
 * Create a custom link renderer for svelte-markdown
 * @param options - Configuration options for link handling
 * @returns A renderer object for svelte-markdown
 */
export function createLinkInterceptor(options: LinkInterceptorOptions = {}) {
	const { onInternal, onExternal } = options;

	return {
		component: 'a',
		props: {
			href: (props: { href: string }) => props.href,
			onclick: (props: { href: string }) => {
				return function handleClick(event: MouseEvent) {
					event.preventDefault();

					const href = props.href;
					const internalPath = open5eToInternalPath(href);

					if (internalPath) {
						// This is an open5e URL - navigate internally
						if (browser && onInternal) {
							onInternal(internalPath);
						} else if (browser) {
							goto(internalPath);
						}
					} else {
						// External link - open in new tab
						if (browser && onExternal) {
							onExternal(href);
						} else if (browser) {
							window.open(href, '_blank', 'noopener,noreferrer');
						}
					}
				};
			}
		}
	};
}
