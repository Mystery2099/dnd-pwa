<script lang="ts">
	import { diceState } from '../stores/dice-store.svelte';
	import DiceTrayContent from './DiceTrayContent.svelte';
	import RollHistory from './RollHistory.svelte';
	import { Dices, X, History } from 'lucide-svelte';

	let activeTab = $state<'roll' | 'history'>('roll');

	function toggleTray() {
		diceState.toggleTray();
	}

	function handleRollComplete(_notation: string) {
		// Dice rolling is shown in full-screen overlay
		// Overlay stays open until user clicks close button
	}
</script>

{#if diceState.open}
	<!-- Backdrop -->
	<button class="dice-backdrop" onclick={toggleTray} aria-label="Close dice tray"></button>
{/if}

<!-- Floating Action Button -->
<button
	class="dice-fab"
	class:open={diceState.open}
	onclick={toggleTray}
	aria-label="Open dice tray"
>
	{#if diceState.open}
		<X size={24} />
	{:else}
		<Dices size={24} />
	{/if}
</button>

<!-- Tray Panel -->
{#if diceState.open}
	<div class="dice-tray-panel" role="dialog" aria-label="Dice rolling tray">
		<div class="tray-header">
			<div class="tabs">
				<button
					class="tab"
					class:active={activeTab === 'roll'}
					onclick={() => (activeTab = 'roll')}
				>
					<Dices size={14} />
					Roll
				</button>
				<button
					class="tab"
					class:active={activeTab === 'history'}
					onclick={() => (activeTab = 'history')}
				>
					<History size={14} />
					History
				</button>
			</div>
		</div>

		<div class="tray-body">
			{#if activeTab === 'roll'}
				<DiceTrayContent onRoll={handleRollComplete} />
			{:else}
				<RollHistory maxItems={15} />
			{/if}
		</div>
	</div>
{/if}

<style>
	.dice-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(2px);
		z-index: 40;
		border: none;
		cursor: pointer;
	}

	.dice-fab {
		position: fixed;
		bottom: 24px;
		right: 24px;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
		border: 2px solid rgba(255, 255, 255, 0.2);
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
		box-shadow:
			0 4px 20px rgba(139, 92, 246, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.dice-fab:hover {
		transform: scale(1.08);
		box-shadow:
			0 6px 24px rgba(139, 92, 246, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	.dice-fab:active {
		transform: scale(0.95);
	}

	.dice-fab.open {
		background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);
	}

	.dice-tray-panel {
		position: fixed;
		bottom: 96px;
		right: 24px;
		width: 380px;
		max-width: calc(100vw - 48px);
		max-height: 500px;
		background: rgba(15, 15, 30, 0.95);
		border: 1px solid rgba(139, 92, 246, 0.3);
		border-radius: 16px;
		box-shadow:
			0 20px 60px rgba(0, 0, 0, 0.5),
			0 0 40px rgba(139, 92, 246, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		z-index: 45;
		overflow: hidden;
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.tray-header {
		padding: 12px 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.tabs {
		display: flex;
		gap: 4px;
		background: rgba(0, 0, 0, 0.3);
		padding: 4px;
		border-radius: 10px;
	}

	.tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 8px 12px;
		background: none;
		border: none;
		border-radius: 8px;
		color: rgba(255, 255, 255, 0.6);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tab:hover {
		color: rgba(255, 255, 255, 0.9);
	}

	.tab.active {
		background: rgba(139, 92, 246, 0.3);
		color: white;
	}

	.tray-body {
		max-height: 400px;
		overflow-y: auto;
	}
</style>
