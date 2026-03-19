import { marked } from 'marked';
import { getItem } from '$lib/server/repositories/compendium';
import type { CompendiumType } from '$lib/server/db/schema';
import type { CompendiumDetailPayload } from '$lib/core/types/compendium';
import {
	buildCompendiumDetailPayload,
	collectCompendiumMarkdownSources
} from '$lib/server/services/compendium/detail';

marked.setOptions({ gfm: true, breaks: true });

const MAX_CACHE_ENTRIES = 1000;
const markdownRenderCache = new Map<string, string>();

export type CompendiumQuickDetailPayload = CompendiumDetailPayload & {
	markdownHtml: Record<string, string>;
};

export async function getCompendiumQuickDetail(
	type: CompendiumType,
	key: string
): Promise<CompendiumQuickDetailPayload | null> {
	const item = await getItem(type, key);
	if (!item) {
		return null;
	}

	const detail = buildCompendiumDetailPayload(item);
	const markdownHtml = await buildMarkdownHtml(collectCompendiumMarkdownSources(item, detail));

	return {
		...detail,
		markdownHtml
	};
}

async function buildMarkdownHtml(
	markdownSources: Array<{ key: string; text: string }>
): Promise<Record<string, string>> {
	const markdownHtml: Record<string, string> = {};

	for (const source of markdownSources) {
		const rendered = await renderMarkdown(source.text);
		if (rendered) {
			markdownHtml[source.key] = rendered;
		}
	}

	return markdownHtml;
}

async function renderMarkdown(text: unknown): Promise<string | null> {
	if (typeof text !== 'string') return null;
	const original = text;
	if (!original.length) return null;

	const cached = markdownRenderCache.get(original);
	if (cached) {
		markdownRenderCache.delete(original);
		markdownRenderCache.set(original, cached);
		return cached;
	}

	try {
		const parsed = marked.parse(escapeHtml(original));
		const rendered = typeof parsed === 'string' ? parsed : await parsed;
		markdownRenderCache.set(original, rendered);

		if (markdownRenderCache.size > MAX_CACHE_ENTRIES) {
			const oldestKey = markdownRenderCache.keys().next().value;
			if (oldestKey) {
				markdownRenderCache.delete(oldestKey);
			}
		}

		return rendered;
	} catch (error) {
		console.error('Failed to render markdown for compendium quick detail', {
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
