import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CompendiumDetailPayload } from '$lib/core/types/compendium';
import { makeCompendiumItem } from '../../../../test/fixtures/compendium';

const { getItemMock, buildDetailMock, collectMarkdownMock } = vi.hoisted(() => ({
	getItemMock: vi.fn(),
	buildDetailMock: vi.fn(),
	collectMarkdownMock: vi.fn()
}));

vi.mock('$lib/server/repositories/compendium', () => ({ getItem: getItemMock }));
vi.mock('$lib/server/services/compendium/detail', () => ({
	buildCompendiumDetailPayload: buildDetailMock,
	collectCompendiumMarkdownSources: collectMarkdownMock
}));

describe('getCompendiumQuickDetail markdown rendering', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getItemMock.mockResolvedValue(makeCompendiumItem());
		buildDetailMock.mockReturnValue({ detailSchemaVersion: 1 } as CompendiumDetailPayload);
	});

	it('preserves safe Markdown after parsing', async () => {
		collectMarkdownMock.mockReturnValue([
			{ key: 'description', text: '**Bold** and [rules](https://example.com/rules).' }
		]);
		const { getCompendiumQuickDetail } = await import('./quick-detail');

		const result = await getCompendiumQuickDetail('languages', 'common');

		expect(result?.markdownHtml.description).toContain('<strong>Bold</strong>');
		expect(result?.markdownHtml.description).toContain('href="https://example.com/rules"');
	});

	it.each([
		['script elements', '<script>alert(1)</script><p>Safe</p>', ['<script', 'alert(1)']],
		['event handlers', '<img src="x" onerror="alert(2)">', ['onerror', 'alert(2)']],
		['javascript URLs', '[click](javascript:alert(3))', ['javascript:', 'alert(3)']],
		[
			'data URLs',
			'<a href="data:text/html,<script>alert(4)</script>">click</a>',
			['data:text/html', 'alert(4)']
		]
	])('removes %s from parsed HTML', async (_label, text, forbidden) => {
		collectMarkdownMock.mockReturnValue([{ key: `unsafe-${_label}`, text }]);
		const { getCompendiumQuickDetail } = await import('./quick-detail');

		const result = await getCompendiumQuickDetail('languages', 'common');
		const html = result?.markdownHtml[`unsafe-${_label}`] ?? '';

		for (const fragment of forbidden) {
			expect(html.toLowerCase()).not.toContain(fragment);
		}
	});
});
