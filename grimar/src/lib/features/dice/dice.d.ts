// Type declarations for dice-box and rpg-dice-roller

declare module '@3d-dice/dice-box' {
	interface DiceBoxOptions {
		selector?: string; // CSS selector for container
		id?: string; // Canvas element ID
		assetPath: string;
		theme?: string;
		themeColor?: string;
		scale?: number;
		offscreen?: boolean;
		suspendSimulation?: boolean;
		enableShadows?: boolean;
		lightIntensity?: number;
		throwForce?: number;
		spinForce?: number;
		preloadThemes?: string[];
		externalThemes?: Record<string, string>;
		onBeforeRoll?: (rollArray: unknown[]) => void;
		onDieComplete?: (dieResult: DieResult) => void;
		onRollComplete?: (results: RollResult[]) => void;
		onRemoveComplete?: (removedDie: unknown) => void;
		onThemeConfigLoaded?: (themeData: unknown) => void;
		onThemeLoaded?: (themeData: unknown) => void;
		onCollision?: (body0Id: number, body1Id: number, force: number) => void;
	}

	interface DieResult {
		rollId: number;
		sides: number;
		groupId: number;
		theme: string;
		value: number;
		dieType: string;
	}

	interface RollResult {
		groupId: number;
		rollId: number;
		sides: number;
		qty: number;
		modifier: number;
		value: number;
		theme: string;
		themeColor: string;
		rolls: DieResult[];
	}

	export default class DiceBox {
		// v1.1.x: constructor(config) where config.selector contains the CSS selector
		constructor(config: DiceBoxOptions);
		init(): Promise<void>;
		roll(
			notation: string,
			options?: { theme?: string; themeColor?: string; newStartPoint?: boolean }
		): Promise<RollResult[]>;
		add(
			notation: string,
			options?: { theme?: string; themeColor?: string; newStartPoint?: boolean }
		): Promise<RollResult[]>;
		clear(): void;
		getRollResults(): RollResult[];
		updateConfig(updates: Partial<DiceBoxOptions>): Promise<void>;
		loadTheme(theme: string): Promise<unknown>;
		getThemeConfig(theme: string): Promise<unknown>;

		// Callbacks (assignable)
		onBeforeRoll?: (rollArray: unknown[]) => void;
		onDieComplete?: (dieResult: DieResult) => void;
		onRollComplete?: (results: RollResult[]) => void;
		onRemoveComplete?: (removedDie: unknown) => void;
		onThemeConfigLoaded?: (themeData: unknown) => void;
		onThemeLoaded?: (themeData: unknown) => void;
		onCollision?: (body0Id: number, body1Id: number, force: number) => void;
	}
}

declare module 'rpg-dice-roller' {
	export class DiceRoller {
		constructor();
		roll(notation: string): Roll;
		rollMany(notation: string): Roll[];
		verbose(notation: string): string;
		get latest(): Roll;
	}

	export class Roll {
		notation: string;
		total: number;
		rolls: Die[];
		average: number;
		minimum: number;
		maximum: number;
		toString(): string;
		toJSON(): object;
	}

	export class Die {
		faces: number;
		quantity: number;
		modifier: number;
		rolls: number[];
		children: unknown[];
		constructor(faces: number, quantity?: number, modifier?: number);
		roll(): number[];
	}
}
