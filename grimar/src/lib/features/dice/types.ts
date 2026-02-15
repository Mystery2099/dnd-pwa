/**
 * Dice rolling feature types
 */

/**
 * Dice box internal result type (from the dice-box library)
 */
export interface DiceBoxRollResult {
	groupId: number;
	rollId: number;
	sides: number;
	qty: number;
	modifier: number;
	value: number;
	theme: string;
	themeColor: string;
	rolls: Array<{
		rollId: number;
		sides: number;
		groupId: number;
		value: number;
		theme: string;
		dieType: string;
	}>;
}

/**
 * Represents a single dice roll result (app-level)
 */
export interface RollResult {
	id: string;
	notation: string;
	total: number;
	breakdown: string;
	individual: number[];
	isCritical?: boolean;
	isFumble?: boolean;
	timestamp: number;
}

/**
 * Dice notation type (e.g., "2d6", "1d20+5", "4d6kh3")
 */
export type DiceNotation = string;

/**
 * Dice sides available
 */
export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

/**
 * Quick roll button configuration
 */
export interface QuickRollButton {
	notation: DiceNotation;
	label: string;
	icon?: string;
}

/**
 * Dice box configuration options
 */
export interface DiceBoxConfig {
	assetPath: string;
	theme: string;
	themeColor: string;
	scale: number;
	offscreen: boolean;
}

/**
 * Roll history item for display
 */
export interface RollHistoryItem {
	id: string;
	notation: string;
	total: number;
	breakdown: string;
	individual: number[];
	isCritical: boolean;
	timestamp: number;
}

/**
 * Dice service state
 */
export interface DiceServiceState {
	isInitialized: boolean;
	isRolling: boolean;
	canRoll: boolean;
}
