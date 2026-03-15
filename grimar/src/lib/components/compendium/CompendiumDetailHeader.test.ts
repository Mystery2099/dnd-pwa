import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import CompendiumDetailHeader from './CompendiumDetailHeader.svelte';

describe('CompendiumDetailHeader', () => {
	it('renders normalized header badges without raw item data', () => {
		render(CompendiumDetailHeader, {
			props: {
				label: 'Spell',
				title: 'Major Image',
				icon: 'S',
				type: 'spells',
				headerBadges: [
					{ label: 'Level 3', variant: 'solid' },
					{
						label: 'Illusion',
						variant: 'outline',
						icon: { family: 'spell-school', value: 'illusion' }
					},
					{
						label: 'Psychic',
						variant: 'outline',
						icon: { family: 'damage-type', value: 'psychic' }
					}
				]
			}
		});

		expect(screen.getByText('Level 3')).toBeInTheDocument();
		expect(screen.getByText('Illusion')).toBeInTheDocument();
		expect(screen.getByText('Psychic')).toBeInTheDocument();
	});
});
