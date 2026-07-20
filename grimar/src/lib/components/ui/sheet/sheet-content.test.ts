import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

vi.mock('svelte/reactivity', async (importOriginal) => importOriginal());

import SheetTestHarness from './sheet.test-harness.svelte';

describe('Sheet.Content drag interaction', () => {
	it('closes the bound root after crossing the drag threshold', async () => {
		render(SheetTestHarness);
		const content = await screen.findByTestId('sheet-content');
		const handle = content.querySelector<HTMLElement>('[data-sheet-handle]');
		expect(handle).not.toBeNull();
		Object.defineProperty(content, 'offsetHeight', { configurable: true, value: 100 });

		await fireEvent.pointerDown(handle!, { button: 0, clientY: 0, pointerId: 1 });
		await fireEvent.pointerMove(content, { clientY: 60, pointerId: 1 });
		await fireEvent.pointerUp(content, { clientY: 60, pointerId: 1 });

		await waitFor(() => expect(screen.getByTestId('sheet-open')).toHaveTextContent('false'));
		expect(screen.getByTestId('sheet-open-change')).toHaveTextContent('1:false');

		await fireEvent.click(screen.getByTestId('sheet-reopen'));
		const reopenedContent = await screen.findByTestId('sheet-content');
		expect(reopenedContent.getAttribute('style')).toContain('transform: translateY(0px)');
	});

	it('animates an incomplete drag back to its resting position', async () => {
		render(SheetTestHarness);
		let now = 0;
		const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => (now += 100));
		const content = await screen.findByTestId('sheet-content');
		const handle = content.querySelector<HTMLElement>('[data-sheet-handle]');
		expect(handle).not.toBeNull();
		Object.defineProperty(content, 'offsetHeight', { configurable: true, value: 100 });

		await fireEvent.pointerDown(handle!, { button: 0, clientY: 0, pointerId: 2 });
		await fireEvent.pointerMove(content, { clientY: 20, pointerId: 2 });
		await fireEvent.pointerUp(content, { clientY: 20, pointerId: 2 });

		expect(screen.getByTestId('sheet-open')).toHaveTextContent('true');
		expect(content.getAttribute('style')).toContain('transform: translateY(0px)');
		expect(content.getAttribute('style')).toContain('transition: transform 350ms');
		nowSpy.mockRestore();
	});
});
