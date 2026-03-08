import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { COMPENDIUM_TYPE_CONFIGS, type CompendiumTypeName } from '$lib/core/constants/compendium';
import { getItem } from '$lib/server/repositories/compendium';
import type { CompendiumType } from '$lib/server/db/schema';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

marked.setOptions({ gfm: true, breaks: true });

const markdownRenderCache = new Map<string, string>();

function renderMarkdown(text: unknown): string | null {
	if (typeof text !== 'string') return null;
	const cacheKey = text.trim();
	if (!cacheKey) return null;

	const cached = markdownRenderCache.get(cacheKey);
	if (cached) return cached;

	const rendered = DOMPurify.sanitize(marked.parse(cacheKey) as string);
	markdownRenderCache.set(cacheKey, rendered);
	return rendered;
}

function getRecord(value: unknown): Record<string, unknown> | null {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
	return value as Record<string, unknown>;
}

function setMarkdown(
	target: Record<string, string>,
	key: string,
	value: unknown
): void {
	const rendered = renderMarkdown(value);
	if (rendered) {
		target[key] = rendered;
	}
}

function buildMarkdownHtml(
	itemData: Record<string, unknown>,
	itemDescription: unknown
): Record<string, string> {
	const markdownHtml: Record<string, string> = {};

	setMarkdown(markdownHtml, 'description', itemData.desc ?? itemDescription);
	setMarkdown(markdownHtml, 'higher_level', itemData.higher_level);

	if (Array.isArray(itemData.descriptions)) {
		for (const [index, description] of itemData.descriptions.entries()) {
			const entry = getRecord(description);
			if (!entry) continue;
			setMarkdown(markdownHtml, `descriptions.${index}.desc`, entry.desc);
		}
	}

	if (Array.isArray(itemData.benefits)) {
		for (const [index, benefit] of itemData.benefits.entries()) {
			const entry = getRecord(benefit);
			if (!entry) continue;
			setMarkdown(markdownHtml, `benefits.${index}.desc`, entry.desc);
		}
	}

	if (Array.isArray(itemData.properties)) {
		for (const [index, property] of itemData.properties.entries()) {
			const propertyRecord = getRecord(property);
			const innerProperty = propertyRecord ? getRecord(propertyRecord.property) : null;
			if (!innerProperty) continue;
			setMarkdown(markdownHtml, `weaponProperties.${index}.desc`, innerProperty.desc);
		}
	}

	if (Array.isArray(itemData.traits)) {
		for (const [index, trait] of itemData.traits.entries()) {
			const entry = getRecord(trait);
			if (!entry) continue;
			setMarkdown(markdownHtml, `traits.${index}.desc`, entry.desc);
		}
	}

	if (Array.isArray(itemData.actions)) {
		for (const [index, action] of itemData.actions.entries()) {
			const entry = getRecord(action);
			if (!entry) continue;
			setMarkdown(markdownHtml, `actions.${index}.desc`, entry.desc);
		}
	}

	if (Array.isArray(itemData.features)) {
		for (const [index, feature] of itemData.features.entries()) {
			const entry = getRecord(feature);
			if (!entry) continue;
			setMarkdown(markdownHtml, `features.${index}.desc`, entry.desc);
		}
	}

	return markdownHtml;
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
	const markdownHtml = buildMarkdownHtml(itemData, item.description);

	return {
		type,
		key,
		config,
		item,
		markdownHtml
	};
};
