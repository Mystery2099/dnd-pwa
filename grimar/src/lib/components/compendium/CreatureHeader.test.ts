import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import CreatureHeader from './CreatureHeader.svelte';

describe('CreatureHeader', () => {
	it('renders normalized entity references as internal badge links', () => {
		render(CreatureHeader, {
			props: {
				label: 'Creature',
				title: 'Archmage',
				icon: 'C',
				size: {
					kind: 'entity',
					type: 'sizes',
					key: 'medium',
					label: 'Medium',
					href: '/compendium/sizes/medium',
					sourceUrl: 'http://10.147.20.240:8888/v2/sizes/medium/'
				},
				typeValue: {
					kind: 'entity',
					type: 'creaturetypes',
					key: 'humanoid',
					label: 'Humanoid',
					href: '/compendium/creaturetypes/humanoid',
					sourceUrl: 'http://10.147.20.240:8888/v2/creaturetypes/humanoid/'
				}
			}
		});

		const mediumLink = screen.getByRole('link', { name: /medium/i });
		const humanoidLink = screen.getByRole('link', { name: /humanoid/i });

		expect(mediumLink.getAttribute('href')).toBe('/compendium/sizes/medium');
		expect(mediumLink.getAttribute('target')).toBeNull();
		expect(humanoidLink.getAttribute('href')).toBe('/compendium/creaturetypes/humanoid');
		expect(humanoidLink.getAttribute('target')).toBeNull();
	});
});
