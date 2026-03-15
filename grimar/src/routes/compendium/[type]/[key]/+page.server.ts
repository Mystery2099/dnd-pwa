import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { COMPENDIUM_TYPE_CONFIGS, type CompendiumTypeName } from '$lib/core/constants/compendium';
import { getItem, getRelatedImages } from '$lib/server/repositories/compendium';
import type { CompendiumType } from '$lib/server/db/schema';
import { OPEN5E_API_BASE_URL } from '$lib/server/providers/open5e-config';
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
	itemData: Record<string, unknown>,
	itemDescription: unknown
): Promise<Record<string, string>> {
	const markdownHtml: Record<string, string> = {};

	await setMarkdown(markdownHtml, 'description', itemData.desc ?? itemDescription);
	await setMarkdown(markdownHtml, 'higher_level', itemData.higher_level);

	if (Array.isArray(itemData.descriptions)) {
		for (const [index, description] of itemData.descriptions.entries()) {
			const entry = getRecord(description);
			if (!entry) continue;
			await setMarkdown(markdownHtml, `descriptions.${index}.desc`, entry.desc);
		}
	}

	if (Array.isArray(itemData.benefits)) {
		for (const [index, benefit] of itemData.benefits.entries()) {
			const entry = getRecord(benefit);
			if (!entry) continue;
			await setMarkdown(markdownHtml, `benefits.${index}.desc`, entry.desc);
		}
	}

	if (Array.isArray(itemData.properties)) {
		for (const [index, property] of itemData.properties.entries()) {
			const propertyRecord = getRecord(property);
			const innerProperty = propertyRecord ? getRecord(propertyRecord.property) : null;
			if (!innerProperty) continue;
			await setMarkdown(markdownHtml, `weaponProperties.${index}.desc`, innerProperty.desc);
		}
	}

	if (Array.isArray(itemData.traits)) {
		for (const [index, trait] of itemData.traits.entries()) {
			const entry = getRecord(trait);
			if (!entry) continue;
			await setMarkdown(markdownHtml, `traits.${index}.desc`, entry.desc);
		}
	}

	if (Array.isArray(itemData.actions)) {
		for (const [index, action] of itemData.actions.entries()) {
			const entry = getRecord(action);
			if (!entry) continue;
			await setMarkdown(markdownHtml, `actions.${index}.desc`, entry.desc);
		}
	}

	if (Array.isArray(itemData.features)) {
		for (const [index, feature] of itemData.features.entries()) {
			const entry = getRecord(feature);
			if (!entry) continue;
			await setMarkdown(markdownHtml, `features.${index}.desc`, entry.desc);
		}
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

type RelatedImageRecord = {
	url?: unknown;
	key?: unknown;
	name?: unknown;
	file_url?: unknown;
	alt_text?: unknown;
	attribution?: unknown;
};

function extractKeyFromUrl(url: string): string | null {
	try {
		const parsed = new URL(url);
		const parts = parsed.pathname.split('/').filter(Boolean);
		return parts.at(-1) ?? null;
	} catch {
		const parts = url.split('/').filter(Boolean);
		return parts.at(-1) ?? null;
	}
}

function buildEmbeddedConditionImage(
	itemData: Record<string, unknown>,
	itemName: string,
	documentName: string | null
): RelatedImage | null {
	const icon = getRecord(itemData.icon) as RelatedImageRecord | null;
	if (!icon) return null;

	const assetUrl = resolveImageAssetUrl(icon.file_url);
	if (!assetUrl) return null;

	const key =
		(typeof icon.key === 'string' && icon.key.trim()) ||
		(typeof icon.url === 'string' && extractKeyFromUrl(icon.url)) ||
		null;
	if (!key) return null;

	return {
		key,
		name: typeof icon.name === 'string' && icon.name.trim() ? icon.name : itemName,
		documentName,
		description: null,
		assetUrl,
		altText: typeof icon.alt_text === 'string' ? icon.alt_text : null,
		attribution: typeof icon.attribution === 'string' ? icon.attribution : null
	};
}

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
	const itemData = (item.data ?? {}) as Record<string, unknown>;
	const markdownHtml = await buildMarkdownHtml(itemData, item.description);
	const imageAssetUrl = type === 'images' ? resolveImageAssetUrl(itemData.file_url) : null;
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
	const embeddedConditionImage =
		type === 'conditions'
			? buildEmbeddedConditionImage(itemData, item.name, item.documentName)
			: null;
	const relatedImages = embeddedConditionImage
		? [
				embeddedConditionImage,
				...relatedImagesFromCompendium.filter((image) => image.key !== embeddedConditionImage.key)
			]
		: relatedImagesFromCompendium;

	return {
		type,
		key,
		config,
		item: sanitizePageData(item),
		markdownHtml: sanitizePageData(markdownHtml),
		imageAssetUrl,
		relatedImages: sanitizePageData(relatedImages)
	};
};
