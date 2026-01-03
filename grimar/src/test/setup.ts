// Test setup file for Vitest
import { vi, beforeEach, afterEach } from 'vitest';

// Mock SvelteKit app imports
const mockPageState = {
	url: new URL('http://localhost:5173/compendium/spells'),
	state: {}
};

vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

vi.mock('$app/environment', () => ({
	browser: true
}));

vi.mock('$app/state', () => ({
	page: mockPageState
}));

vi.mock('$lib/core/types/compendium/filter', () => ({
	CompendiumFilterConfig: {}
}));

// Mock Svelte internals
const mockSet = new Set<string>();
const mockSvelteSet = class Set {
	has = (v: string) => mockSet.has(v);
	add = (v: string) => {
		mockSet.add(v);
		return this;
	};
	delete = (v: string) => mockSet.delete(v);
	size = mockSet.size;
	forEach = (cb: (v: string) => void) => mockSet.forEach(cb);
	clear = () => mockSet.clear();
	values = () => mockSet.values();
};

vi.mock('svelte/reactivity', () => ({
	SvelteSet: mockSvelteSet,
	SvelteURL: class {
		searchParams: URLSearchParams;
		constructor(url: string) {
			this.searchParams = new URL(url).searchParams;
		}
	}
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
	observe: vi.fn((el) => {
		// Immediately trigger callback with the element
		callback([{
			target: el,
			contentRect: {
				width: el.clientWidth || 0,
				height: el.clientHeight || 0,
				top: 0,
				left: 0,
				bottom: 0,
				right: 0,
				x: 0,
				y: 0,
				toJSON: () => {}
			},
			devicePixelContentBoxSize: [],
			borderBoxSize: [],
			contentBoxSize: []
		}]);
	}),
	unobserve: vi.fn(),
	disconnect: vi.fn()
}));

// Mock sessionStorage
const sessionStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn()
};
Object.defineProperty(global, 'sessionStorage', {
	writable: true,
	value: sessionStorageMock
});

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn()
};
Object.defineProperty(global, 'localStorage', {
	writable: true,
	value: localStorageMock
});

// Clean up after each test
afterEach(() => {
	vi.clearAllMocks();
	mockSet.clear();
});
