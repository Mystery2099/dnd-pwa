/**
 * Dice store - Svelte 5 runes-based state management for dice rolling
 */

import { nanoid } from 'nanoid';
import type { RollResult, RollHistoryItem } from '../types';
import { createRollResult } from '../utils/roll-result';
import { createLogger } from '$lib/core/client/logger';

const logger = createLogger({ service: 'dice-store' });

/**
 * Dice state using Svelte 5 runes
 */
class DiceState {
	// Roll history - all rolls made
	history = $state<RollResult[]>([]);

	// Current tray open/close state
	trayOpen = $state(false);

	// Whether dice-box is initialized
	isInitialized = $state(false);

	// Whether a roll is in progress
	isRolling = $state(false);

	// Pending roll notation (set before showing overlay)
	pendingRoll = $state<string | null>(null);

	// Roll locking to prevent concurrent rolls
	isRollLocked = $state(false);
	currentRollId = $state<string | null>(null);

	// Current theme color for dice
	themeColor = $state('#8b5cf6');

	// Maximum history items to keep
	maxHistory = 50;

	// Queue for rolls before initialization
	MAX_PENDING_ROLLS = 5;
	pendingRolls = $state<string[]>([]);

	// Initialization error for banner
	initError = $state<string | null>(null);

	// Loading and animation states
	isInitializing = $state(false);
	diceAnimationComplete = $state(false);

	/**
	 * Add a roll result to history
	 */
	addRoll(result: RollResult): void {
		this.history.unshift(result);

		// Trim history to max size
		if (this.history.length > this.maxHistory) {
			this.history = this.history.slice(0, this.maxHistory);
		}
	}

	/**
	 * Toggle tray open/close
	 */
	toggleTray(): void {
		this.trayOpen = !this.trayOpen;
	}

	/**
	 * Open the tray
	 */
	openTray(): void {
		this.trayOpen = true;
	}

	/**
	 * Close the tray
	 */
	closeTray(): void {
		this.trayOpen = false;
	}

	/**
	 * Set initialized state
	 */
	setInitialized(value: boolean): void {
		this.isInitialized = value;
	}

	/**
	 * Set rolling state
	 */
	setRolling(value: boolean): void {
		this.isRolling = value;
	}

	/**
	 * Start a dice roll - shows overlay and triggers roll
	 */
	startRoll(notation: string): boolean {
		// Reset stale lock state if roll is not actually in progress
		if (this.isRollLocked && !this.isRolling) {
			logger.debug('Resetting stale lock state', { notation });
			this.isRollLocked = false;
			this.currentRollId = null;
		}

		// Check if roll is already in progress
		if (this.isRollLocked) {
			logger.warn('Roll already in progress, ignoring', { notation });
			return false;
		}

		// Check if DiceBox is initialized
		if (!this.isInitialized) {
			if (this.pendingRolls.length >= this.MAX_PENDING_ROLLS) {
				logger.warn('Roll queue full, dropping roll', { notation });
				return false;
			}
			this.pendingRolls.push(notation);
			logger.info('Dice not initialized, queueing roll', { notation, queueSize: this.pendingRolls.length });
			return false;
		}

		// Start roll
		this.pendingRoll = notation;
		this.isRolling = true;
		this.isRollLocked = true;
		this.currentRollId = nanoid();
		return true;
	}

	/**
	 * Clear pending roll
	 */
	clearPendingRoll(): void {
		this.pendingRoll = null;
	}

	/**
	 * End a roll - add to history and reset state
	 */
	endRoll(result: RollResult): void {
		this.addRoll(result);
		this.isRolling = false;
		this.isRollLocked = false;
		this.pendingRoll = null;
		this.currentRollId = null;
	}

	/**
	 * Set roll locking state
	 */
	setRollLocked(value: boolean): void {
		this.isRollLocked = value;
	}

	/**
	 * Set initialization error
	 */
	setInitError(error: string | null): void {
		this.initError = error;
	}

	/**
	 * Set initializing state
	 */
	setInitializing(value: boolean): void {
		this.isInitializing = value;
	}

	/**
	 * Set dice animation complete state
	 */
	setDiceAnimationComplete(value: boolean): void {
		this.diceAnimationComplete = value;
	}

	/**
	 * Process pending rolls
	 */
	processPendingRolls(): void {
		while (this.pendingRolls.length > 0) {
			const notation = this.pendingRolls.shift();
			if (notation && this.isInitialized) {
				this.startRoll(notation);
			}
		}
	}

	/**
	 * Get queue size
	 */
	get queueSize(): number {
		return this.pendingRolls.length;
	}

	/**
	 * Set theme color
	 */
	setThemeColor(color: string): void {
		this.themeColor = color;
	}

	/**
	 * Clear all history
	 */
	clearHistory(): void {
		this.history = [];
	}

	/**
	 * Remove a specific roll from history
	 */
	removeRoll(id: string): void {
		this.history = this.history.filter((r) => r.id !== id);
	}

	/**
	 * Get history as display items
	 */
	getHistoryItems(): RollHistoryItem[] {
		return this.history.map((r) => ({
			id: r.id,
			notation: r.notation,
			total: r.total,
			breakdown: r.breakdown,
			individual: r.individual,
			isCritical: r.isCritical ?? false,
			timestamp: r.timestamp
		}));
	}

	/**
	 * Get recent rolls (for quick access)
	 */
	getRecentRolls(count = 5): RollHistoryItem[] {
		return this.getHistoryItems().slice(0, count);
	}

	/**
	 * Check if tray is open (for external components)
	 */
	get open(): boolean {
		return this.trayOpen;
	}

	/**
	 * Get history count (for external components)
	 */
	get count(): number {
		return this.history.length;
	}
}

// Singleton instance
export const diceState = new DiceState();

/**
 * Quick roll helpers for common dice
 */
export const QUICK_ROLLS = [
	{ notation: '1d4', label: 'd4' },
	{ notation: '1d6', label: 'd6' },
	{ notation: '1d8', label: 'd8' },
	{ notation: '1d10', label: 'd10' },
	{ notation: '1d12', label: 'd12' },
	{ notation: '1d20', label: 'd20' },
	{ notation: '1d100', label: 'd100' },
	{ notation: '2d6', label: '2d6' },
	{ notation: '4d6', label: '4d6' }
] as const;


