import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

vi.mock('svelte/reactivity', async (importOriginal) => {
	const actual = await importOriginal<typeof import('svelte/reactivity')>();
	return {
		...actual,
		MediaQuery: class {
			current = false;
		}
	};
});

import Select from './select.svelte';

const options = [
	{ label: 'Wizard', value: 'wizard' },
	{ label: 'Rogue', value: 'rogue' }
];

describe('mobile Select', () => {
	it('connects its trigger to an accessibly named dialog with radio options', async () => {
		render(Select, { type: 'single', placeholder: 'Choose a class', options, value: 'wizard' });
		const trigger = screen.getByRole('button', { name: /wizard/i });

		expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
		expect(trigger).toHaveAttribute('aria-expanded', 'false');
		expect(trigger).toHaveAttribute('aria-controls');

		await fireEvent.click(trigger);
		const dialog = await screen.findByRole('dialog', { name: 'Choose a class' });
		expect(dialog).toHaveAttribute('id', trigger.getAttribute('aria-controls'));
		expect(trigger).toHaveAttribute('aria-expanded', 'true');

		const wizard = within(dialog).getByRole('radio', { name: 'Wizard' });
		const rogue = within(dialog).getByRole('radio', { name: 'Rogue' });
		expect(wizard).toBeChecked();
		expect(rogue).not.toBeChecked();
	});
});
