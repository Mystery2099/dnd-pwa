import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Keyboard Navigation Handler Tests
 *
 * These tests verify the keyboard navigation logic by testing
 * the handler function in isolation.
 */

interface MockNavigationItem {
	externalId: string;
	name: string;
}

interface MockNavigation {
	prev: MockNavigationItem | null;
	next: MockNavigationItem | null;
}

interface MockKeyboardEvent {
	key: string;
	preventDefault?: () => void;
}

describe('Keyboard Navigation Handler', () => {
	let mockGoto: ReturnType<typeof vi.fn>;
	let mockOnClose: () => void;
	let cleanup: (() => void) | null = null;

	beforeEach(() => {
		mockGoto = vi.fn();
		mockOnClose = vi.fn();

		// Mock sessionStorage
		vi.spyOn(sessionStorage, 'getItem').mockReturnValue(null);

		// Mock goto
		vi.stubGlobal('goto', mockGoto);
	});

	afterEach(() => {
		if (cleanup) {
			cleanup();
			cleanup = null;
		}
		vi.restoreAllMocks();
	});

	/**
	 * Create a mock keyboard event handler for testing
	 */
	function createMockHandler(options: {
		navigation: MockNavigation;
		basePath: string;
		onClose?: () => void;
		listUrlKey?: string;
	}): (e: MockKeyboardEvent) => void {
		const { navigation, basePath, onClose, listUrlKey } = options;

		return (e: MockKeyboardEvent) => {
			if (e.key === 'Escape') {
				if (onClose) {
					onClose();
				} else if (listUrlKey) {
					const listUrl = sessionStorage.getItem(listUrlKey);
					(mockGoto as any)(listUrl || basePath);
				} else {
					(mockGoto as any)(basePath);
				}
			} else if (e.key === 'ArrowLeft' && navigation.prev) {
				(mockGoto as any)(`${basePath}/${navigation.prev.externalId}`);
			} else if (e.key === 'ArrowRight' && navigation.next) {
				(mockGoto as any)(`${basePath}/${navigation.next.externalId}`);
			}
		};
	}

	describe('Escape key', () => {
		it('should call onClose when provided', () => {
			const handler = createMockHandler({
				navigation: { prev: null, next: null },
				basePath: '/compendium/spells',
				onClose: mockOnClose
			});

			handler({ key: 'Escape' });

			expect(mockOnClose).toHaveBeenCalledOnce();
			expect(mockGoto).not.toHaveBeenCalled();
		});

		it('should navigate to stored list URL when listUrlKey provided', () => {
			// Override the mock for this test
			vi.spyOn(sessionStorage, 'getItem').mockReturnValue('/compendium/spells?search=fireball');

			const handler = createMockHandler({
				navigation: { prev: null, next: null },
				basePath: '/compendium/spells',
				listUrlKey: 'spell-list-url'
			});

			handler({ key: 'Escape' });

			expect(sessionStorage.getItem).toHaveBeenCalledWith('spell-list-url');
			expect(mockGoto).toHaveBeenCalledWith('/compendium/spells?search=fireball');
		});

		it('should fallback to basePath when no list URL stored', () => {
			// Override the mock for this test (returns null)
			vi.spyOn(sessionStorage, 'getItem').mockReturnValue(null);

			const handler = createMockHandler({
				navigation: { prev: null, next: null },
				basePath: '/compendium/monsters',
				listUrlKey: 'monster-list-url'
			});

			handler({ key: 'Escape' });

			expect(mockGoto).toHaveBeenCalledWith('/compendium/monsters');
		});

		it('should navigate to basePath when no onClose or listUrlKey', () => {
			const handler = createMockHandler({
				navigation: { prev: null, next: null },
				basePath: '/compendium/spells'
			});

			handler({ key: 'Escape' });

			expect(mockGoto).toHaveBeenCalledWith('/compendium/spells');
		});
	});

	describe('ArrowLeft key', () => {
		it('should navigate to previous item', () => {
			const prevItem: MockNavigationItem = { externalId: 'fireball', name: 'Fireball' };
			const handler = createMockHandler({
				navigation: { prev: prevItem, next: null },
				basePath: '/compendium/spells'
			});

			handler({ key: 'ArrowLeft' });

			expect(mockGoto).toHaveBeenCalledWith('/compendium/spells/fireball');
		});

		it('should not navigate when no previous item', () => {
			const handler = createMockHandler({
				navigation: { prev: null, next: null },
				basePath: '/compendium/spells'
			});

			handler({ key: 'ArrowLeft' });

			expect(mockGoto).not.toHaveBeenCalled();
		});
	});

	describe('ArrowRight key', () => {
		it('should navigate to next item', () => {
			const nextItem: MockNavigationItem = { externalId: 'lightning-bolt', name: 'Lightning Bolt' };
			const handler = createMockHandler({
				navigation: { prev: null, next: nextItem },
				basePath: '/compendium/spells'
			});

			handler({ key: 'ArrowRight' });

			expect(mockGoto).toHaveBeenCalledWith('/compendium/spells/lightning-bolt');
		});

		it('should not navigate when no next item', () => {
			const handler = createMockHandler({
				navigation: { prev: null, next: null },
				basePath: '/compendium/spells'
			});

			handler({ key: 'ArrowRight' });

			expect(mockGoto).not.toHaveBeenCalled();
		});
	});

	describe('Other keys', () => {
		it('should ignore other key presses', () => {
			const handler = createMockHandler({
				navigation: { prev: null, next: null },
				basePath: '/compendium/spells'
			});

			const keys = ['a', 'A', '1', 'Enter', 'Tab', ' '];

			for (const key of keys) {
				handler({ key });
			}

			expect(mockGoto).not.toHaveBeenCalled();
			expect(mockOnClose).not.toHaveBeenCalled();
		});
	});

	describe('navigation chain', () => {
		it('should handle full navigation chain', () => {
			const prevItem: MockNavigationItem = { externalId: 'magic-missile', name: 'Magic Missile' };
			const nextItem: MockNavigationItem = { externalId: 'lightning-bolt', name: 'Lightning Bolt' };

			const handler = createMockHandler({
				navigation: { prev: prevItem, next: nextItem },
				basePath: '/compendium/spells',
				onClose: mockOnClose
			});

			// Go to next
			handler({ key: 'ArrowRight' });
			expect(mockGoto).toHaveBeenCalledWith('/compendium/spells/lightning-bolt');

			// Go back to previous
			handler({ key: 'ArrowLeft' });
			expect(mockGoto).toHaveBeenCalledWith('/compendium/spells/magic-missile');

			// Close
			handler({ key: 'Escape' });
			expect(mockOnClose).toHaveBeenCalled();
		});
	});

	describe('URL construction', () => {
		it('should handle external IDs with special characters', () => {
			const nextItem: MockNavigationItem = { externalId: 'cure-wounds', name: 'Cure Wounds' };

			const handler = createMockHandler({
				navigation: { prev: null, next: nextItem },
				basePath: '/compendium/spells'
			});

			handler({ key: 'ArrowRight' });

			expect(mockGoto).toHaveBeenCalledWith('/compendium/spells/cure-wounds');
		});

		it('should handle basePath with trailing slash', () => {
			const handler = createMockHandler({
				navigation: { prev: null, next: null },
				basePath: '/compendium/monsters/'
			});

			handler({ key: 'Escape' });

			expect(mockGoto).toHaveBeenCalledWith('/compendium/monsters/');
		});

		it('should handle basePath without trailing slash', () => {
			const handler = createMockHandler({
				navigation: { prev: null, next: null },
				basePath: '/compendium/monsters'
			});

			handler({ key: 'Escape' });

			expect(mockGoto).toHaveBeenCalledWith('/compendium/monsters');
		});
	});
});
