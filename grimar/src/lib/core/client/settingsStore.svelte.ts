/**
 * Settings Store
 *
 * Client-side settings with localStorage persistence.
 * Uses Svelte 5 runes for reactive state management.
 */

const STORAGE_KEY = 'grimar-settings';
const DEFAULT_SETTINGS = {
	fontSize: 'md' as const,
	compactMode: false,
	animationLevel: 'full' as const,
	defaultCompendiumView: 'grid' as const,
	itemsPerPage: 24,
	showSRDBadge: true,
	syncOnLoad: false,
	offlineEnabled: true,
	autoSyncInterval: 'never' as const,
	reducedMotion: false,
	highContrast: false,
	keyboardShortcuts: true
};

type FontSize = 'sm' | 'md' | 'lg' | 'xl';
type AnimationLevel = 'full' | 'reduced' | 'minimal';
type CompendiumView = 'grid' | 'list';
type SyncInterval = 'never' | '15min' | '30min' | '1h';

export interface Settings {
	fontSize: FontSize;
	compactMode: boolean;
	animationLevel: AnimationLevel;
	defaultCompendiumView: CompendiumView;
	itemsPerPage: number;
	showSRDBadge: boolean;
	syncOnLoad: boolean;
	offlineEnabled: boolean;
	autoSyncInterval: SyncInterval;
	reducedMotion: boolean;
	highContrast: boolean;
	keyboardShortcuts: boolean;
}

interface SettingsActions {
	setFontSize: (value: FontSize) => void;
	setCompactMode: (value: boolean) => void;
	setAnimationLevel: (value: AnimationLevel) => void;
	setDefaultCompendiumView: (value: CompendiumView) => void;
	setItemsPerPage: (value: number) => void;
	setShowSRDBadge: (value: boolean) => void;
	setSyncOnLoad: (value: boolean) => void;
	setOfflineEnabled: (value: boolean) => void;
	setAutoSyncInterval: (value: SyncInterval) => void;
	setReducedMotion: (value: boolean) => void;
	setHighContrast: (value: boolean) => void;
	setKeyboardShortcuts: (value: boolean) => void;
	reset: () => void;
}

function createSettingsStore() {
	// Load settings from localStorage or use defaults
	let settings = $state<Settings>(DEFAULT_SETTINGS);

	function load() {
		if (typeof window === 'undefined') return;
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				settings = { ...DEFAULT_SETTINGS, ...parsed };
			}
		} catch {
			console.error('[SettingsStore] Failed to load settings');
		}
	}

	function save() {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
		} catch {
			console.error('[SettingsStore] Failed to save settings');
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

	function setItemsPerPage(value: number) {
		settings.itemsPerPage = value;
		save();
	}

	function setShowSRDBadge(value: boolean) {
		settings.showSRDBadge = value;
		save();
	}

	function setSyncOnLoad(value: boolean) {
		settings.syncOnLoad = value;
		save();
	}

	function setOfflineEnabled(value: boolean) {
		settings.offlineEnabled = value;
		save();
	}

	function setAutoSyncInterval(value: SyncInterval) {
		settings.autoSyncInterval = value;
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

	function reset() {
		settings = { ...DEFAULT_SETTINGS };
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
		setItemsPerPage,
		setShowSRDBadge,
		setSyncOnLoad,
		setOfflineEnabled,
		setAutoSyncInterval,
		setReducedMotion,
		setHighContrast,
		setKeyboardShortcuts,
		reset,
		load
	};
}

export const settingsStore = createSettingsStore();

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

export const ITEMS_PER_PAGE_OPTIONS = [
	{ value: '12', label: '12', description: 'Fewer items per page' },
	{ value: '24', label: '24', description: 'Standard amount' },
	{ value: '48', label: '48', description: 'More items per page' },
	{ value: '96', label: '96', description: 'Maximum items per page' }
] as const;

export const SYNC_INTERVAL_OPTIONS = [
	{ value: 'never', label: 'Never', description: 'Manual sync only' },
	{ value: '15min', label: '15 minutes', description: 'Sync every 15 minutes' },
	{ value: '30min', label: '30 minutes', description: 'Sync every 30 minutes' },
	{ value: '1h', label: 'Hourly', description: 'Sync every hour' }
] as const;
