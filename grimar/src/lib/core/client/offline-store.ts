/**
 * Offline Store
 *
 * Tracks online/offline state and pending sync operations.
 * Uses browser APIs for reactivity, not Svelte runes.
 */

import { browser } from '$app/environment';

interface OfflineState {
	isOnline: boolean;
	lastOnline: number | null;
	pendingSync: number;
	reconnectAttempts: number;
}

type StateListener = (state: OfflineState) => void;

class OfflineStore {
	private state: OfflineState = {
		isOnline: true,
		lastOnline: null,
		pendingSync: 0,
		reconnectAttempts: 0
	};

	private listeners: Set<StateListener> = new Set();
	private initialized = false;

	constructor() {
		if (browser) {
			this.initialize();
		}
	}

	private initialize() {
		if (this.initialized) return;
		this.initialized = true;

		// Set initial state
		this.state.isOnline = navigator.onLine;
		this.state.lastOnline = this.state.isOnline ? Date.now() : null;

		// Listen for online/offline events
		window.addEventListener('online', this.handleOnline);
		window.addEventListener('offline', this.handleOffline);
	}

	private handleOnline = () => {
		this.state.isOnline = true;
		this.state.lastOnline = Date.now();
		this.state.reconnectAttempts = 0;
		this.notifyListeners();
		console.log('[OfflineStore] Back online');
	};

	private handleOffline = () => {
		this.state.isOnline = false;
		this.notifyListeners();
		console.log('[OfflineStore] Gone offline');
	};

	private notifyListeners() {
		for (const listener of this.listeners) {
			listener(this.state);
		}
	}

	/**
	 * Subscribe to state changes.
	 */
	subscribe(listener: StateListener): () => void {
		this.listeners.add(listener);
		// Immediately call with current state
		listener(this.state);
		return () => {
			this.listeners.delete(listener);
		};
	}

	/**
	 * Get current state.
	 */
	get current(): OfflineState {
		return { ...this.state };
	}

	/**
	 * Check if online.
	 */
	get isOnline(): boolean {
		return this.state.isOnline;
	}

	/**
	 * Get last online timestamp.
	 */
	get lastOnline(): number | null {
		return this.state.lastOnline;
	}

	/**
	 * Increment pending sync counter.
	 */
	incrementPendingSync() {
		this.state.pendingSync++;
		this.notifyListeners();
	}

	/**
	 * Decrement pending sync counter.
	 */
	decrementPendingSync() {
		if (this.state.pendingSync > 0) {
			this.state.pendingSync--;
			this.notifyListeners();
		}
	}

	/**
	 * Clear all pending sync operations.
	 */
	clearPendingSync() {
		this.state.pendingSync = 0;
		this.notifyListeners();
	}

	/**
	 * Increment reconnect attempts.
	 */
	incrementReconnectAttempts() {
		this.state.reconnectAttempts++;
		this.notifyListeners();
	}

	/**
	 * Reset reconnect attempts counter.
	 */
	resetReconnectAttempts() {
		this.state.reconnectAttempts = 0;
		this.notifyListeners();
	}

	/**
	 * Cleanup event listeners.
	 */
	destroy() {
		if (browser) {
			window.removeEventListener('online', this.handleOnline);
			window.removeEventListener('offline', this.handleOffline);
		}
	}
}

/**
 * Singleton instance of the offline store.
 */
export const offlineStore = new OfflineStore();

/**
 * Helper to format last online time for display.
 */
export function formatLastOnline(timestamp: number | null): string {
	if (!timestamp) return 'Never';

	const diff = Date.now() - timestamp;
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `${days}d ago`;
	if (hours > 0) return `${hours}h ago`;
	if (minutes > 0) return `${minutes}m ago`;
	return 'Just now';
}
