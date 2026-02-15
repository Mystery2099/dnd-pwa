<script lang="ts">
	import { diceState } from '../stores/dice-store.svelte';
	import type { RollHistoryItem } from '../types';
	import { roll } from '../services/dice-service';
	import { Dices, X, Trophy, AlertCircle } from 'lucide-svelte';

	interface Props {
		maxItems?: number;
		compact?: boolean;
	}

	let { maxItems = 10, compact = false }: Props = $props();

	let historyItems = $derived(diceState.getHistoryItems().slice(0, maxItems));
	let isEmpty = $derived(historyItems.length === 0);

	async function handleReroll(item: RollHistoryItem) {
		await roll(item.notation);
	}

	function isFumble(item: RollHistoryItem): boolean {
		// Fumble: natural 1 on single d20 roll
		return item.notation === '1d20' &&
			item.individual.length === 1 &&
			item.individual[0] === 1;
	}

	function formatTime(timestamp: number): string {
		const now = Date.now();
		const diff = now - timestamp;

		if (diff < 60000) return 'Just now';
		if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
		if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

		return new Date(timestamp).toLocaleDateString();
	}
</script>

<div class="roll-history" class:compact>
	<div class="history-header">
		<h3>
			<Dices size={16} />
			Roll History
		</h3>
		{#if diceState.count > 0}
			<button class="clear-btn" onclick={() => diceState.clearHistory()} title="Clear history">
				<X size={14} />
			</button>
		{/if}
	</div>

	{#if isEmpty}
		<div class="empty-state">
			<Dices size={24} />
			<p>No rolls yet</p>
			<span>Roll some dice to see history</span>
		</div>
	{:else}
		<div class="history-list">
			{#each historyItems as item (item.id)}
				<div
					class="history-item"
					class:critical={item.isCritical}
					class:fumble={isFumble(item)}
				>
					<button class="roll-content" onclick={() => handleReroll(item)}>
						<div class="roll-notation">{item.notation}</div>
						<div class="roll-result">
							{#if item.isCritical}
								<Trophy size={14} class="critical-icon" />
							{/if}
							<span class="total">{item.total}</span>
						</div>
					</button>
					<div class="roll-meta">
						<span class="breakdown">{item.breakdown}</span>
						<span class="timestamp">{formatTime(item.timestamp)}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.roll-history {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 200px;
	}

	.roll-history.compact {
		min-height: auto;
	}

	.history-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.history-header h3 {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
	}

	.clear-btn {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.5);
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.clear-btn:hover {
		color: rgba(255, 255, 255, 0.9);
		background: rgba(255, 255, 255, 0.1);
	}

	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		color: rgba(255, 255, 255, 0.4);
		padding: 24px;
		text-align: center;
	}

	.empty-state p {
		margin: 0;
		font-size: 14px;
	}

	.empty-state span {
		font-size: 12px;
		opacity: 0.7;
	}

	.history-list {
		flex: 1;
		overflow-y: auto;
		padding: 8px;
	}

	.history-item {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		margin-bottom: 8px;
		overflow: hidden;
		transition: all 0.2s;
	}

	.history-item:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.15);
	}

	.history-item.critical {
		border-color: rgba(244, 63, 94, 0.5);
		background: linear-gradient(to right, rgba(244, 63, 94, 0.15), rgba(255, 255, 255, 0.05) 60%);
	}

	.history-item.fumble {
		border-color: rgba(100, 116, 139, 0.5);
		opacity: 0.7;
	}

	.roll-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 10px 12px;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
	}

	.roll-notation {
		font-size: 13px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.8);
		font-family: monospace;
	}

	.roll-result {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.roll-result .total {
		font-size: 18px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.95);
	}

	.roll-result :global(.critical-icon) {
		color: #f43f5e;
		animation: pulse 1s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}

	.roll-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 12px 8px;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.breakdown {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.5);
		font-family: monospace;
	}

	.timestamp {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.4);
	}

	.roll-history.compact .history-header {
		padding: 8px 12px;
	}

	.roll-history.compact .history-list {
		padding: 4px;
	}

	.roll-history.compact .history-item {
		margin-bottom: 4px;
	}

	.roll-history.compact .roll-content {
		padding: 8px 10px;
	}
</style>
