import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import StructuredValue from './StructuredValue.svelte';

describe('StructuredValue', () => {
	it('renders normalized entity references as a single compendium link', () => {
		render(StructuredValue, {
			props: {
				value: {
					kind: 'entity',
					type: 'spellschools',
					key: 'illusion',
					label: 'Illusion',
					href: '/compendium/spellschools/illusion',
					meta: 'illusion',
					sourceUrl: 'http://10.147.20.240:8888/v2/spellschools/illusion/'
				}
			}
		});

		const link = screen.getByRole('link', { name: 'Illusion' });

		expect(link.getAttribute('href')).toBe('/compendium/spellschools/illusion');
		expect(screen.getByText('illusion')).toBeTruthy();
		expect(screen.queryByText('kind', { selector: 'dt' })).toBeNull();
		expect(screen.queryByText('source url', { selector: 'dt' })).toBeNull();
	});
});
