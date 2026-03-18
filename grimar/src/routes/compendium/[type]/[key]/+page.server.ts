import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { COMPENDIUM_TYPE_CONFIGS, type CompendiumTypeName } from '$lib/core/constants/compendium';
import { getItem, getRelatedImages } from '$lib/server/repositories/compendium';
import type { CompendiumType } from '$lib/server/db/schema';
import { OPEN5E_API_BASE_URL } from '$lib/server/providers/open5e-config';
import {
	buildCompendiumDetailPayload,
	collectCompendiumMarkdownSources
} from '$lib/server/services/compendium/detail';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: true });

const MAX_CACHE_ENTRIES = 1000;
const markdownRenderCache = new Map<string, string>();

async function renderMarkdown(text: unknown): Promise<string | null> {
	if (typeof text !== 'string') return null;
	const original = text as string;
	if (original.length === 0) return null;
	const cacheKey = original;

	const cached = markdownRenderCache.get(cacheKey);
	if (cached) {
		// LRU touch: move accessed key to tail.
		markdownRenderCache.delete(cacheKey);
		markdownRenderCache.set(cacheKey, cached);
		return cached;
	}

	try {
		const parsed = marked.parse(escapeHtml(original));
		const rendered = typeof parsed === 'string' ? parsed : await parsed;
		markdownRenderCache.set(cacheKey, rendered);
		if (markdownRenderCache.size > MAX_CACHE_ENTRIES) {
			const oldestKey = markdownRenderCache.keys().next().value;
			if (oldestKey) {
				markdownRenderCache.delete(oldestKey);
			}
		}
		return rendered;
	} catch (error) {
		console.error('Failed to render markdown for compendium detail page', {
			error,
			textPreview: original.slice(0, 200)
		});
		return null;
	}
}

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function getRecord(value: unknown): Record<string, unknown> | null {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
	return value as Record<string, unknown>;
}

function buildOpen5eAssetProxyPath(path: string, search = ''): string {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `/api/assets/open5e${normalizedPath}${search}`;
}

async function setMarkdown(
	target: Record<string, string>,
	key: string,
	value: unknown
): Promise<void> {
	const rendered = await renderMarkdown(value);
	if (rendered) {
		target[key] = rendered;
	}
}

async function buildMarkdownHtml(
	markdownSources: Array<{ key: string; text: string }>
): Promise<Record<string, string>> {
	const markdownHtml: Record<string, string> = {};

	for (const source of markdownSources) {
		await setMarkdown(markdownHtml, source.key, source.text);
	}

	return markdownHtml;
}

function resolveImageAssetUrl(fileUrl: unknown): string | null {
	if (typeof fileUrl !== 'string' || fileUrl.length === 0) return null;
	try {
		if (/^https?:\/\//i.test(fileUrl)) {
			const parsed = new URL(fileUrl);
			const open5eOrigin = OPEN5E_API_BASE_URL.replace(/\/v2$/i, '');
			if (parsed.origin === open5eOrigin) {
				return buildOpen5eAssetProxyPath(parsed.pathname, parsed.search);
			}
			return parsed.toString();
		}

		return buildOpen5eAssetProxyPath(fileUrl);
	} catch (error) {
		console.warn('Unable to resolve compendium image asset URL', {
			fileUrl,
			error
		});
		return null;
	}
}

type RelatedImage = {
	key: string;
	name: string;
	documentName: string | null;
	description: string | null;
	assetUrl: string | null;
	altText: string | null;
	attribution: string | null;
};

function sanitizePageData<T>(value: T): T {
	if (value === null || value === undefined) return value;
	if (value instanceof Date) return value;
	if (Array.isArray(value)) return value.map((entry) => sanitizePageData(entry)) as T;
	if (typeof value !== 'object') return value;

	const record = value as Record<string, unknown>;
	const sanitized: Record<string, unknown> = {};

	for (const [key, entry] of Object.entries(record)) {
		if (key === '__proto__') continue;
		sanitized[key] = sanitizePageData(entry);
	}

	return sanitized as T;
}

export const load: PageServerLoad = async ({ params }) => {
	const type = params.type as CompendiumTypeName;
	const key = params.key;

	const config = COMPENDIUM_TYPE_CONFIGS[type];
	if (!config) {
		throw error(404, `Unknown compendium type: ${type}`);
	}

	const itemType = (config.endpoint === 'classes' ? 'classes' : type) as CompendiumType;
	const item = await getItem(itemType, key);
	if (!item) {
		throw error(404, `${config.label} not found: ${key}`);
	}
	const detail = buildCompendiumDetailPayload(item);
	const markdownSources = collectCompendiumMarkdownSources(item, detail);
	const markdownHtml = await buildMarkdownHtml(markdownSources);
	const relatedImagesRaw = await getRelatedImages(itemType, item.name);
	const relatedImagesFromCompendium: RelatedImage[] = relatedImagesRaw.map((image) => {
		const imageData = (image.data ?? {}) as Record<string, unknown>;
		return {
			key: image.key,
			name: image.name,
			documentName: image.documentName,
			description: image.description,
			assetUrl: resolveImageAssetUrl(imageData.file_url),
			altText: typeof imageData.alt_text === 'string' ? imageData.alt_text : null,
			attribution: typeof imageData.attribution === 'string' ? imageData.attribution : null
		};
	});

	return {
		type,
		key,
		config,
		item: sanitizePageData(item),
		detail: sanitizePageData(detail),
		markdownHtml: sanitizePageData(markdownHtml),
		relatedImages: sanitizePageData(relatedImagesFromCompendium)
	};
};
