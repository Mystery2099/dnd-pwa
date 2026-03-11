import { browser, dev } from '$app/environment';

export interface DebugFlagsState {
	showVirtualDebug: boolean;
	showPerfPanel: boolean;
}

type Listener = (state: DebugFlagsState) => void;

const STORAGE_KEY = 'grimar-debug-flags';

const DEFAULT_FLAGS: DebugFlagsState = {
	showVirtualDebug: true,
	showPerfPanel: true
};

class DebugFlagsStore {
	private state: DebugFlagsState = { ...DEFAULT_FLAGS };
	private listeners: Set<Listener> = new Set();

	constructor() {
		if (!browser || !dev) return;

		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw) as Partial<DebugFlagsState>;
				this.state = {
					showVirtualDebug:
						typeof parsed.showVirtualDebug === 'boolean'
							? parsed.showVirtualDebug
							: DEFAULT_FLAGS.showVirtualDebug,
					showPerfPanel:
						typeof parsed.showPerfPanel === 'boolean'
							? parsed.showPerfPanel
							: DEFAULT_FLAGS.showPerfPanel
				};
			}
		} catch {
			this.state = { ...DEFAULT_FLAGS };
		}
	}

	private persist(): void {
		if (!browser || !dev) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
	}

	private notify(): void {
		for (const listener of this.listeners) listener(this.state);
	}

	subscribe(listener: Listener): () => void {
		this.listeners.add(listener);
		listener(this.state);
		return () => this.listeners.delete(listener);
	}

	get current(): DebugFlagsState {
		return { ...this.state };
	}

	set<K extends keyof DebugFlagsState>(key: K, value: DebugFlagsState[K]): void {
		this.state = { ...this.state, [key]: value };
		this.persist();
		this.notify();
	}

	toggle<K extends keyof DebugFlagsState>(key: K): void {
		this.set(key, !this.state[key]);
	}

	reset(): void {
		this.state = { ...DEFAULT_FLAGS };
		this.persist();
		this.notify();
	}
}

export const debugFlagsStore = new DebugFlagsStore();
