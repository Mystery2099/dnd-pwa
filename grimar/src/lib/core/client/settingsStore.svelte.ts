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
	gridMaxColumns: 4
};

export interface DeviceSettings {
	gridMaxColumns: number;
}

interface _DeviceSettingsActions {
	setGridMaxColumns: (value: number) => void;
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

	function setGridMaxColumns(value: number) {
		settings.gridMaxColumns = value;
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
		setGridMaxColumns,
		reset,
		load
	};
}

export const deviceSettingsStore = createDeviceSettingsStore();

// Backward compatibility alias
export const settingsStore = deviceSettingsStore;

// Helper functions for dropdown options
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
