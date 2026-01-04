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

import { getTheme, setTheme, initThemeSync } from './themeStore.svelte';

describe('themeStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should have default theme amethyst', () => {
		expect(getTheme()).toBe('amethyst');
	});

	it('should change theme', () => {
		setTheme('fire');
		expect(getTheme()).toBe('fire');
		expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'fire');
		expect(mockLocalStorage.setItem).toHaveBeenCalledWith('grimar-theme', 'fire');
	});

	it('should not change to invalid theme', () => {
		const result = setTheme('invalid');
		expect(result).toBe(false);
		expect(getTheme()).not.toBe('invalid');
	});

	it('should initialize from localStorage', () => {
		mockLocalStorage.getItem.mockReturnValue('ocean');
		initThemeSync();
		expect(getTheme()).toBe('ocean');
		expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'ocean');
	});
});
