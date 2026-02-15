import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import DiceTray from './DiceTray.svelte';
import { diceState } from '../stores/dice-store.svelte';

describe('DiceTray Component', () => {
	beforeEach(() => {
		diceState.clearHistory();
		diceState.closeTray();
	});

	it('should render FAB button', () => {
		render(DiceTray);
		const button = screen.getByLabelText('Open dice tray');
		expect(button).toBeDefined();
	});

	it('should open tray when FAB clicked', async () => {
		render(DiceTray);
		const button = screen.getByLabelText('Open dice tray');
		await fireEvent.click(button);
		expect(diceState.open).toBe(true);
	});

	it('should close tray when backdrop clicked', async () => {
		render(DiceTray);
		const fabButton = screen.getByLabelText('Open dice tray');
		await fireEvent.click(fabButton);

		const backdrop = screen.getByLabelText('Close dice tray');
		await fireEvent.click(backdrop);
		expect(diceState.open).toBe(false);
	});

	it('should show close icon when tray open', async () => {
		render(DiceTray);
		const fabButton = screen.getByLabelText('Open dice tray');
		await fireEvent.click(fabButton);

		const closeButton = screen.getByLabelText('Close dice tray');
		expect(closeButton).toBeDefined();
	});
});
