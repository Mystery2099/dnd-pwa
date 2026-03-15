import { describe, expect, it } from 'vitest';
import { resolveCompendiumLink } from './compendium-links';

describe('resolveCompendiumLink', () => {
	it('resolves recognized Open5e item URLs into internal links', () => {
		expect(resolveCompendiumLink('http://10.147.20.240:8888/v2/languages/infernal/')).toEqual({
			type: 'languages',
			key: 'infernal',
			label: 'Infernal',
			href: '/compendium/languages/infernal',
			meta: undefined,
			sourceUrl: 'http://10.147.20.240:8888/v2/languages/infernal/'
		});
	});

	it('returns null for unrelated URLs', () => {
		expect(resolveCompendiumLink('https://example.com/not-open5e')).toBeNull();
	});
});
