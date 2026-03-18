import { describe, expect, it } from 'vitest';
import { resolveCompendiumLink } from './compendium-links';

const TEST_OPEN5E_BASE = 'http://localhost:8888/v2';

describe('resolveCompendiumLink', () => {
	it('resolves recognized Open5e item URLs into internal links', () => {
		expect(resolveCompendiumLink(`${TEST_OPEN5E_BASE}/languages/infernal/`)).toEqual({
			type: 'languages',
			key: 'infernal',
			label: 'Infernal',
			href: '/compendium/languages/infernal',
			meta: undefined,
			sourceUrl: `${TEST_OPEN5E_BASE}/languages/infernal/`
		});
	});

	it('returns null for unrelated URLs', () => {
		expect(resolveCompendiumLink('https://example.com/not-open5e')).toBeNull();
	});
});
