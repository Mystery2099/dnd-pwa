<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { diceState } from '../stores/dice-store.svelte';
	import { initDiceBox, roll as diceRoll, clear, destroy } from '../services/dice-service';
	import { X, AlertCircle, RotateCw } from 'lucide-svelte';
	import type { RollResult } from '../types';
	import { settingsStore } from '$lib/core/client/settingsStore.svelte';
	import { createLogger } from '$lib/core/client/logger';

	const logger = createLogger({ service: 'dice-canvas' });

	let { containerId = 'dice-canvas' }: { containerId?: string } = $props();

	let containerEl: HTMLDivElement;
	let isLoading = $state(true);
	let initError = $state<string | null>(null);

	function setInitError(error: string | null): void {
		diceState.setInitError(error);
	}

	// Initialize dice-box immediately when component mounts
	onMount(async () => {
		try {
			isLoading = true;
			initError = null;

			// Lazy load - only init if 3D is enabled
			if (settingsStore.settings.use3DDice) {
				await initDiceBox(`#${containerId}`, {
					themeColor: diceState.themeColor,
					offscreen: true
				});
				diceState.setInitialized(true);
			} else {
				diceState.setInitialized(true);
			}
			
			isLoading = false;
		} catch (e) {
			initError = e instanceof Error ? e.message : 'Failed to initialize dice';
			isLoading = false;
		}
	});

	// Cleanup on destroy
	onDestroy(() => {
		clear();
		destroy();
	});

	// Watch for rolling state and execute pending rolls
	$effect(() => {
		if (diceState.isRolling && diceState.pendingRoll && !diceState.isRollLocked) {
			// Wait for overlay to be visible before rolling
			const checkAndRoll = () => {
				const container = document.querySelector(`#${containerId}`) as HTMLElement | null;
				if (container && container.offsetParent !== null) {
					// Container is visible, execute the roll
					executeRoll(diceState.pendingRoll!);
				} else {
					// Retry after short delay
					setTimeout(checkAndRoll, 20);
				}
			};
			checkAndRoll();
		}
	});

	async function executeRoll(notation: string) {
		let result: RollResult | null = null;
		try {
			// Lazy init if not already initialized and 3D is enabled
			if (!diceState.isInitialized && settingsStore.settings.use3DDice) {
				diceState.setInitializing(true);
				await initDiceBox(`#${containerId}`, {
					themeColor: diceState.themeColor,
					offscreen: true
				});
				diceState.setInitialized(true);
				diceState.setInitializing(false);
			} else if (!settingsStore.settings.use3DDice) {
				diceState.setInitialized(true);
			}
			
			diceState.setDiceAnimationComplete(false);
			result = await diceRoll(notation);
			
			if (result) {
				// Add to history
				diceState.addRoll(result);
				diceState.setDiceAnimationComplete(true);
			}
		} catch (e) {
			logger.error('Roll failed', { notation, error: e });
			diceState.setInitializing(false);
			diceState.setRolling(false);
		} finally {
			if (!result) {
				diceState.setInitializing(false);
				diceState.setRolling(false);
			}
		}
	}

	async function retryInit() {
		initError = null;
		try {
			isLoading = true;
			await initDiceBox(`#${containerId}`, {
				themeColor: diceState.themeColor,
				offscreen: true
			});
			diceState.setInitialized(true);
			isLoading = false;
		} catch (e) {
			initError = e instanceof Error ? e.message : 'Failed to initialize dice';
			isLoading = false;
		}
	}

	async function useFallback() {
		settingsStore.setUse3DDice(false);
		diceState.setInitialized(true);
	}

	function close() {
		diceState.setRolling(false);
		diceState.setInitializing(false);
		diceState.setDiceAnimationComplete(false);
		clear();
	}
</script>

<!-- Dice canvas container - always mounted but hidden when not rolling -->
<div
	class="dice-container-wrapper"
	class:visible={diceState.isRolling}
	role="dialog"
	aria-label="Dice rolling"
>
	<!-- Loading state -->
	{#if isLoading}
		<div class="dice-loading">
			<div class="spinner"></div>
			<p>Loading 3D dice engine...</p>
		</div>
	{/if}

	<!-- Initialization error state -->
	{#if diceState.initError}
		<div class="dice-error-banner">
			<AlertCircle size={20} />
			<div>
				<p>{diceState.initError}</p>
				<div class="error-actions">
					<button class="retry-btn" onclick={retryInit}>
						<RotateCw size={14} />
						Retry 3D
					</button>
					<button class="fallback-btn" onclick={useFallback}> Use 2D Only </button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Rolling/initializing overlay -->
	{#if diceState.isRolling}
		<div class="dice-container-wrapper visible">
			{#if diceState.isInitializing}
				<div class="loading-overlay">
					<div class="spinner"></div>
					<p>Loading dice engine...</p>
				</div>
			{:else if !diceState.diceAnimationComplete}
				<div class="rolling-indicator">
					<div class="spinner"></div>
					<p>Rolling...</p>
				</div>
			{/if}
			<div class="dice-container" id={containerId}></div>
			<button class="close-btn" onclick={close} aria-label="Close dice">
				<X size={24} />
			</button>
		</div>
	{/if}

	<div class="dice-container" id={containerId} bind:this={containerEl}></div>

	<button class="close-btn" onclick={close} aria-label="Close dice">
		<X size={24} />
	</button>
</div>

<style>
	.dice-container-wrapper {
		display: none;
		position: fixed;
		inset: 0;
		z-index: 1000;
		background: linear-gradient(135deg, rgba(15, 15, 30, 0.95), rgba(30, 27, 75, 0.95));
	}

	.dice-container-wrapper.visible {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.dice-container {
		width: 100%;
		height: 100%;
		max-width: 800px;
		max-height: 600px;
	}

	.close-btn {
		position: absolute;
		top: 20px;
		right: 20px;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		cursor: pointer;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: scale(1.1);
	}

	.dice-loading {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		color: white;
	}

	.loading-overlay,
	.rolling-indicator {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		color: white;
		z-index: 5;
	}

	.loading-overlay p,
	.rolling-indicator p {
		margin-top: 16px;
		font-size: 18px;
		font-weight: 500;
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid rgba(255, 255, 255, 0.2);
		border-top-color: #8b5cf6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.dice-error-banner {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(244, 63, 94, 0.95);
		border: 1px solid rgba(244, 63, 94, 0.3);
		border-radius: 12px;
		padding: 20px;
		color: white;
		text-align: center;
		min-width: 320px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
		z-index: 10;
	}

	.dice-error-banner p {
		margin: 0 0 16px;
		font-size: 15px;
		line-height: 1.4;
	}

	.error-actions {
		display: flex;
		gap: 12px;
		justify-content: center;
	}

	.retry-btn,
	.fallback-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		border: none;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.retry-btn {
		background: rgba(255, 255, 255, 0.2);
		color: white;
	}

	.retry-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.fallback-btn {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: rgba(255, 255, 255, 0.9);
	}

	.fallback-btn:hover {
		background: rgba(255, 255, 255, 0.2);
	}
</style>
