import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ThemeCardSelector from './ThemeCardSelector.svelte';
import { setTheme } from '$lib/core/client/themeStore.svelte';

describe('ThemeCardSelector', () => {
	let getItemSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		getItemSpy = vi.spyOn(localStorage, 'getItem').mockReturnValue(null);
		setTheme('amethyst');
	});

	afterEach(() => {
		getItemSpy.mockRestore();
	});

	it('updates the active theme card immediately after switching themes', async () => {
		render(ThemeCardSelector);

		const amethystButton = screen.getByRole('button', { name: 'Select Amethyst theme' });
		const arcaneButton = screen.getByRole('button', { name: 'Select Arcane theme' });

		expect(amethystButton.getAttribute('aria-pressed')).toBe('true');
		expect(arcaneButton.getAttribute('aria-pressed')).toBe('false');

		await fireEvent.click(arcaneButton);

		expect(amethystButton.getAttribute('aria-pressed')).toBe('false');
		expect(arcaneButton.getAttribute('aria-pressed')).toBe('true');
	});
});
