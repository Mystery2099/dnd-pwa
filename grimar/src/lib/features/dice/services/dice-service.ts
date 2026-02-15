/**
 * Dice service - wraps dice-box (3D physics) and rpg-dice-roller (parsing)
 */

import { DiceRoller } from 'rpg-dice-roller';
import type { RollResult, DiceBoxConfig, DiceBoxRollResult } from '../types';
import { createRollResult, parseIndividualRolls } from '../utils/roll-result';
import { createLogger } from '$lib/core/client/logger';
import { settingsStore } from '$lib/core/client/settingsStore.svelte';

const logger = createLogger({ service: 'dice-service' });

// Retry configuration
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000; // ms

// Lazy loading module cache
let diceBoxModulePromise: Promise<typeof import('@3d-dice/dice-box').default> | null = null;
let diceBoxConstructor: typeof import('@3d-dice/dice-box').default | null = null;

// Type for DiceBox instance
type DiceBoxInstance = InstanceType<typeof import('@3d-dice/dice-box').default>;

let diceBoxInstance: DiceBoxInstance | null = null;
let diceRollerInstance: DiceRoller | null = null;

// Callback for when rolls complete
let onRollCompleteCallback: ((results: RollResult[]) => void) | null = null;

/**
 * Lazy load the dice-box module to reduce initial bundle size
 */
async function loadDiceBoxModule() {
	if (diceBoxConstructor) return diceBoxConstructor;

	if (!diceBoxModulePromise) {
		logger.debug('Lazy loading dice-box module');
		diceBoxModulePromise = import('@3d-dice/dice-box').then((m) => m.default);
		diceBoxConstructor = await diceBoxModulePromise;
	}

	return diceBoxConstructor;
}

/**
 * Dice types that have known physics issues in dice-box
 * d4: tetrahedron mesh has collision detection gaps
 * d10/d100: similar polyhedral issues with face mapping
 * For these dice, we skip 3D rendering and use the reliable fallback
 */
const PROBLEMATIC_DICE_TYPES = ['d4', 'd10', 'd100'];

/**
 * Validate that required dice assets are available
 * Checks WASM file and theme config existence
 */
async function validateAssets(): Promise<boolean> {
	try {
		// Check if WASM file exists
		const wasmResponse = await fetch('/dice-box/ammo/ammo.wasm.wasm', { method: 'HEAD' });
		if (!wasmResponse.ok) {
			logger.error('WASM file not found', { url: '/dice-box/ammo/ammo.wasm.wasm' });
			return false;
		}

		// Check if theme config exists
		const themeResponse = await fetch('/dice-box/themes/default/theme.config.json');
		if (!themeResponse.ok) {
			logger.error('Theme config not found', { url: '/dice-box/themes/default/theme.config.json' });
			return false;
		}

		logger.debug('Asset validation passed');
		return true;
	} catch (error) {
		logger.error('Asset validation failed', { error });
		return false;
	}
}

/**
 * Check if a notation contains only dice types that have physics issues
 * If so, we should skip the 3D animation entirely
 */
function isProblematicDiceOnly(notation: string): boolean {
	const normalized = notation.toLowerCase();
	return PROBLEMATIC_DICE_TYPES.some((die) => {
		// Match d4, d10, d100 as whole dice types (not parts of other words)
		const regex = new RegExp(`\\b\\d*${die}\\b`);
		return regex.test(normalized);
	});
}

/**
 * Initialize dice-box with configuration
 */
export async function initDiceBox(
	containerSelector: string,
	config: Partial<DiceBoxConfig> = {},
	onComplete?: (results: RollResult[]) => void
): Promise<void> {
	if (diceBoxInstance) {
		logger.debug('DiceBox already initialized');
		return;
	}

	// Validate assets before initialization
	const assetsValid = await validateAssets();
	if (!assetsValid) {
		throw new Error(
			'Required dice assets are missing. Please ensure /dice-box/ static assets are properly deployed.'
		);
	}

	// Lazy load the dice-box module
	const DiceBox = await loadDiceBoxModule();
	if (!DiceBox) {
		throw new Error('Failed to load dice-box module');
	}

	const defaultConfig: DiceBoxConfig = {
		assetPath: '/dice-box/',
		theme: 'default',
		themeColor: '#8b5cf6',
		scale: 5,
		offscreen: true, // Better performance with web workers
		...config
	};

	// dice-box v1.1.x: constructor(config) where config.selector contains the CSS selector
	diceBoxInstance = new DiceBox({
		selector: containerSelector,
		assetPath: defaultConfig.assetPath,
		theme: defaultConfig.theme,
		themeColor: defaultConfig.themeColor,
		scale: defaultConfig.scale,
		offscreen: defaultConfig.offscreen,
		suspendSimulation: false
	});

	// Set up callbacks
	if (onComplete) {
		onRollCompleteCallback = onComplete;
	}

	diceBoxInstance.onRollComplete = (results: DiceBoxRollResult[]) => {
		const rollResults = transformDiceBoxResults(results);
		if (onRollCompleteCallback) {
			onRollCompleteCallback(rollResults);
		}
	};

	await diceBoxInstance.init();
}

/**
 * Get or create the dice-roller instance for notation parsing
 */
export function getDiceRoller(): DiceRoller {
	if (!diceRollerInstance) {
		diceRollerInstance = new DiceRoller();
	}
	return diceRollerInstance;
}

/**
 * Parse dice notation using rpg-dice-roller
 * Returns the parsed notation or null if invalid
 */
export function parseNotation(notation: string): string | null {
	return isValidNotation(notation) ? notation : null;
}

/**
 * Validate if a notation string is valid dice notation
 */
export function isValidNotation(notation: string): boolean {
	try {
		getDiceRoller().roll(notation);
		return true;
	} catch {
		return false;
	}
}

/**
 * Roll dice using dice-box 3D animation
 * Falls back to rpg-dice-roller for problematic dice types (d4, d10, d100)
 * Implements retry logic with exponential backoff for failed rolls
 */
export async function roll(notation: string): Promise<RollResult | null> {
	// Respect user setting - skip 3D if disabled
	if (!settingsStore.settings.use3DDice) {
		logger.debug('3D dice disabled, using fallback', { notation });
		return fallbackRoll(notation);
	}

	// Guard clauses
	if (!diceBoxInstance) {
		logger.error('DiceBox not initialized', { notation });
		return fallbackRoll(notation);
	}
	if (!isValidNotation(notation)) {
		logger.error('Invalid dice notation', { notation });
		return fallbackRoll(notation);
	}

	// Pre-emptive fallback for dice types with known physics issues
	// This prevents mesh collision errors from appearing in the console
	if (isProblematicDiceOnly(notation)) {
		return fallbackRoll(notation);
	}

	let lastError: Error | null = null;
	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			const results = await diceBoxInstance.roll(notation);
			const firstResult = results?.[0];

			// Check if result is valid (dice-box sometimes returns value: 0 for d100/d10/d4)
			const isValidResult =
				firstResult &&
				(firstResult.value !== 0 || (firstResult.rolls && firstResult.rolls.length > 0));

			if (isValidResult) {
				return transformSingleResult(firstResult);
			}
		} catch (error) {
			lastError = error as Error;
			logger.warn(`Roll attempt ${attempt} failed`, { notation, attempt, error });

			if (attempt < MAX_RETRIES) {
				const delay = BASE_RETRY_DELAY * attempt; // Exponential backoff
				await new Promise((resolve) => setTimeout(resolve, delay));
				continue;
			}
		}
	}

	logger.error('All roll attempts failed, using fallback', { notation, lastError });
	return fallbackRoll(notation);
}

/**
 * Fallback roll using rpg-dice-roller when dice-box fails
 */
function fallbackRoll(notation: string): RollResult | null {
	try {
		const roller = getDiceRoller();
		const roll = roller.roll(notation);
		const individual = roll.rolls.map((d) => d.rolls[0]);
		const breakdown = roll.toString();
		const total = roll.total;

		// Check for critical/fumble in fallback
		const isCritical =
			roll.rolls.length === 1 && roll.rolls[0].faces === 20 && roll.rolls[0].rolls[0] === 20;
		const isFumble =
			roll.rolls.length === 1 && roll.rolls[0].faces === 20 && roll.rolls[0].rolls[0] === 1;

		return createRollResult(notation, total, breakdown, individual, isCritical, isFumble);
	} catch (error) {
		logger.error('Fallback roll failed', { notation, error });
		return null;
	}
}

/**
 * Add more dice to the current scene without clearing
 * Falls back to rpg-dice-roller for problematic dice types (d4, d10, d100)
 */
export async function addDice(notation: string): Promise<RollResult | null> {
	if (!diceBoxInstance) {
		logger.error('DiceBox not initialized', { notation });
		return null;
	}

	// Pre-emptive fallback for dice types with known physics issues
	if (isProblematicDiceOnly(notation)) {
		return fallbackRoll(notation);
	}

	try {
		if (!isValidNotation(notation)) {
			throw new Error(`Invalid dice notation: ${notation}`);
		}

		const results = await diceBoxInstance.add(notation);
		return transformSingleResult(results[0]);
	} catch (error) {
		logger.error('Add dice failed', { notation, error });
		return fallbackRoll(notation);
	}
}

/**
 * Clear all dice from the scene
 */
export function clear(): void {
	if (diceBoxInstance) {
		diceBoxInstance.clear();
	}
}

/**
 * Get current roll results from dice-box
 */
export function getResults(): RollResult[] {
	if (!diceBoxInstance) {
		return [];
	}

	const results = diceBoxInstance.getRollResults();
	return results.map(transformSingleResult);
}

/**
 * Update dice-box configuration at runtime
 */
export function updateConfig(updates: Partial<DiceBoxConfig>): void {
	if (!diceBoxInstance) {
		return;
	}

	diceBoxInstance.updateConfig(updates as Record<string, unknown>);
}

/**
 * Check if dice-box is initialized
 */
export function isReady(): boolean {
	return diceBoxInstance !== null && diceBoxInstance !== undefined;
}

/**
 * Set callback for roll completion
 */
export function setOnRollComplete(callback: (results: RollResult[]) => void): void {
	onRollCompleteCallback = callback;
}

/**
 * Transform dice-box result to our RollResult interface
 */
function transformDiceBoxResults(results: DiceBoxRollResult[]): RollResult[] {
	return results.map(transformSingleResult);
}

/**
 * Transform a single dice-box result to our RollResult
 */
function transformSingleResult(result: DiceBoxRollResult): RollResult {
	const individual = result.rolls?.map((r) => r.value) || [];
	const modifier = result.modifier ?? 0;
	const value = result.value ?? 0;

	// Build breakdown string
	let breakdown: string;
	if (individual.length > 0) {
		breakdown = `${individual.join(' + ')} ${modifier !== 0 ? (modifier >= 0 ? '+' : '') + modifier : ''} = ${value}`;
	} else {
		breakdown = `${value}`;
	}

	// Check for critical (natural 20 on d20) or fumble (natural 1 on d20)
	let isCritical = false;
	let isFumble = false;
	if (result.sides === 20 && result.qty === 1 && individual.length > 0) {
		if (individual[0] === 20) {
			isCritical = true;
		} else if (individual[0] === 1) {
			isFumble = true;
		}
	}

	// Build notation string
	const notation = `${result.qty ?? 1}d${result.sides ?? 6}${modifier !== 0 ? (modifier >= 0 ? `+${modifier}` : modifier) : ''}`;

	return createRollResult(notation, value, breakdown, individual, isCritical, isFumble);
}

/**
 * Clean up resources
 */
export function destroy(): void {
	if (diceBoxInstance) {
		diceBoxInstance.clear();
		diceBoxInstance = null;
	}
	diceRollerInstance = null;
	onRollCompleteCallback = null;
}
