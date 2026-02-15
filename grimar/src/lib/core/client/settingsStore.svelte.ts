/**
 * Device Settings Store
 *
 * Device-specific preferences stored in localStorage.
 * These are purely cosmetic/device-specific and don't sync across devices.
 *
 * Server-backed settings are in userSettingsStore.svelte.ts
 */

const STORAGE_KEY = 'grimar-device-settings';
const DEFAULT_DEVICE_SETTINGS = {
	fontSize: 'md' as const,
	compactMode: false,
	animationLevel: 'full' as const,
	defaultCompendiumView: 'grid' as const,
	gridMaxColumns: 4,
	reducedMotion: false,
	highContrast: false,
	keyboardShortcuts: true,
	use3DDice: true
};

type FontSize = 'sm' | 'md' | 'lg' | 'xl';
type AnimationLevel = 'full' | 'reduced' | 'minimal';
type CompendiumView = 'grid' | 'list';

export interface DeviceSettings {
	fontSize: FontSize;
	compactMode: boolean;
	animationLevel: AnimationLevel;
	defaultCompendiumView: CompendiumView;
	gridMaxColumns: number;
	reducedMotion: boolean;
	highContrast: boolean;
	keyboardShortcuts: boolean;
	use3DDice: boolean;
}

interface _DeviceSettingsActions {
	setFontSize: (value: FontSize) => void;
	setCompactMode: (value: boolean) => void;
	setAnimationLevel: (value: AnimationLevel) => void;
	setDefaultCompendiumView: (value: CompendiumView) => void;
	setGridMaxColumns: (value: number) => void;
	setReducedMotion: (value: boolean) => void;
	setHighContrast: (value: boolean) => void;
	setKeyboardShortcuts: (value: boolean) => void;
	setUse3DDice: (value: boolean) => void;
	reset: () => void;
}

function createDeviceSettingsStore() {
	// Load settings from localStorage or use defaults
	let settings = $state<DeviceSettings>(DEFAULT_DEVICE_SETTINGS);

	function load() {
		if (typeof window === 'undefined') return;
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				settings = { ...DEFAULT_DEVICE_SETTINGS, ...parsed };
			}
		} catch {
			console.error('[DeviceSettingsStore] Failed to load settings');
		}
	}

	function save() {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
		} catch {
			console.error('[DeviceSettingsStore] Failed to save settings');
		}
	}

	function setFontSize(value: FontSize) {
		settings.fontSize = value;
		save();
	}

	function setCompactMode(value: boolean) {
		settings.compactMode = value;
		save();
	}

	function setAnimationLevel(value: AnimationLevel) {
		settings.animationLevel = value;
		save();
	}

	function setDefaultCompendiumView(value: CompendiumView) {
		settings.defaultCompendiumView = value;
		save();
	}

	function setGridMaxColumns(value: number) {
		settings.gridMaxColumns = value;
		save();
	}

	function setReducedMotion(value: boolean) {
		settings.reducedMotion = value;
		save();
	}

	function setHighContrast(value: boolean) {
		settings.highContrast = value;
		save();
	}

	function setKeyboardShortcuts(value: boolean) {
		settings.keyboardShortcuts = value;
		save();
	}

	function setUse3DDice(value: boolean) {
		settings.use3DDice = value;
		save();
	}

	function reset() {
		settings = { ...DEFAULT_DEVICE_SETTINGS };
		save();
	}

	// Initialize on client-side
	if (typeof window !== 'undefined') {
		load();
	}

	return {
		get settings() {
			return settings;
		},
		setFontSize,
		setCompactMode,
		setAnimationLevel,
		setDefaultCompendiumView,
		setGridMaxColumns,
		setReducedMotion,
		setHighContrast,
		setKeyboardShortcuts,
		setUse3DDice,
		reset,
		load
	};
}

export const deviceSettingsStore = createDeviceSettingsStore();

// Backward compatibility alias
export const settingsStore = deviceSettingsStore;

// Helper functions for dropdown options
export const FONT_SIZE_OPTIONS = [
	{ value: 'sm', label: 'Small', description: 'Compact text size' },
	{ value: 'md', label: 'Medium', description: 'Standard text size' },
	{ value: 'lg', label: 'Large', description: 'Larger text size' },
	{ value: 'xl', label: 'Extra Large', description: 'Maximum text size' }
] as const;

export const ANIMATION_LEVEL_OPTIONS = [
	{ value: 'full', label: 'Full', description: 'All animations enabled' },
	{ value: 'reduced', label: 'Reduced', description: 'Minimal animations' },
	{ value: 'minimal', label: 'Minimal', description: 'Essential animations only' }
] as const;

export const COMPENDIUM_VIEW_OPTIONS = [
	{ value: 'grid', label: 'Grid', description: 'Card-based grid layout' },
	{ value: 'list', label: 'List', description: 'Compact list layout' }
] as const;

export const SYNC_INTERVAL_OPTIONS = [
	{ value: 'never', label: 'Never', description: 'Manual sync only' },
	{ value: '15min', label: '15 minutes', description: 'Sync every 15 minutes' },
	{ value: '30min', label: '30 minutes', description: 'Sync every 30 minutes' },
	{ value: '1h', label: 'Hourly', description: 'Sync every hour' }
] as const;

export const GRID_MAX_COLUMNS_OPTIONS = [
	{ value: '2', label: '2', description: 'Up to 2 columns' },
	{ value: '3', label: '3', description: 'Up to 3 columns' },
	{ value: '4', label: '4', description: 'Up to 4 columns' },
	{ value: '5', label: '5', description: 'Up to 5 columns' },
	{ value: '6', label: '6', description: 'Up to 6 columns' }
] as const;

export const SPELL_SORT_OPTIONS = [
	{ value: 'name', label: 'Name', description: 'Alphabetical order' },
	{ value: 'level', label: 'Level', description: 'By spell level' },
	{ value: 'school', label: 'School', description: 'By spell school' }
] as const;
