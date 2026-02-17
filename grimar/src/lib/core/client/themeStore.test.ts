import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock $app/environment
vi.mock('$app/environment', () => ({
	browser: true
}));

// Mock browser globals
const mockLocalStorage = {
	getItem: vi.fn(),
	setItem: vi.fn()
};

const mockDocument = {
	documentElement: {
		setAttribute: vi.fn()
	}
};

global.localStorage = mockLocalStorage as any;
global.document = mockDocument as any;

import { getTheme, setTheme, initThemeSync, themeStore } from './themeStore.svelte';

describe('themeStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset the store to default by calling setTheme with the default
		// and clearing localStorage mock to return null
		mockLocalStorage.getItem.mockReturnValue(null);
		setTheme('amethyst');
	});

	it('should have default theme amethyst', () => {
		expect(getTheme()?.id).toBe('amethyst');
	});

	it('should change theme', () => {
		setTheme('fire');
		expect(getTheme()?.id).toBe('fire');
		expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'fire');
		expect(mockLocalStorage.setItem).toHaveBeenCalledWith('grimar-theme', 'fire');
	});

	it('should not change to invalid theme', () => {
		const result = setTheme('invalid');
		expect(result).toBe(false);
		expect(getTheme()?.id).not.toBe('invalid');
	});

	// Note: initThemeSync only applies theme to DOM, doesn't update the store
	// This test verifies the DOM is updated correctly
	it('should initialize from localStorage', () => {
		// Reset to get fresh localStorage read
		mockLocalStorage.getItem.mockReturnValue(null);
		setTheme('amethyst');
		
		mockLocalStorage.getItem.mockReturnValue('ocean');
		initThemeSync();
		// initThemeSync updates DOM but not the store value
		// The store was already set to amethyst in beforeEach
		expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'ocean');
	});
});
