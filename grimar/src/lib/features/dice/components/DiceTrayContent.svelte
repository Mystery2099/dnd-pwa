<script lang="ts">
	import { diceState, QUICK_ROLLS } from '../stores/dice-store.svelte';
	import { roll, clear, isValidNotation } from '../services/dice-service';
	import { Dices, Trash2 } from 'lucide-svelte';

	interface Props {
		onRoll?: (notation: string) => void;
	}

	let { onRoll }: Props = $props();

	let notationInput = $state('');
	let inputError = $state<string | null>(null);
	let isRolling = $derived(diceState.isRolling);
	let canRoll = $derived(isValidNotation(notationInput));

	async function handleQuickRoll(notation: string) {
		diceState.startRoll(notation);
		onRoll?.(notation);
	}

	async function handleManualRoll() {
		if (!notationInput.trim() || !canRoll) return;

		diceState.startRoll(notationInput.trim());
		onRoll?.(notationInput.trim());
		notationInput = '';
		inputError = null;
	}

	function handleClear() {
		clear();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && canRoll) {
			handleManualRoll();
		}
	}
</script>

<div class="dice-tray-content">
	<div class="tray-section">
		<h4>Quick Rolls</h4>
		<div class="quick-rolls">
			{#each QUICK_ROLLS as quick}
				<button
					class="quick-roll-btn"
					onclick={() => handleQuickRoll(quick.notation)}
					disabled={isRolling}
				>
					{quick.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="tray-section manual-section">
		<h4>Custom Roll</h4>
		<div class="manual-input">
			<input
				type="text"
				class="notation-input"
				placeholder="e.g., 2d6+3, 4d6kh3"
				bind:value={notationInput}
				onkeydown={handleKeydown}
				disabled={isRolling}
				class:error={inputError !== null}
			/>
			<button class="roll-btn" onclick={handleManualRoll} disabled={!canRoll || isRolling}>
				<Dices size={16} />
			</button>
		</div>
		{#if inputError}
			<p class="input-hint error">{inputError}</p>
		{:else}
			<p class="input-hint">Enter dice notation (e.g., 1d20+5)</p>
		{/if}
	</div>

	<div class="tray-section actions-section">
		<button class="action-btn clear" onclick={handleClear} disabled={isRolling}>
			<Trash2 size={16} />
			Clear Dice
		</button>
	</div>
</div>

<style>
	.dice-tray-content {
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: 16px;
	}

	.tray-section h4 {
		margin: 0 0 12px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: rgba(255, 255, 255, 0.6);
	}

	.quick-rolls {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.quick-roll-btn {
		flex: 1;
		min-width: 50px;
		padding: 10px 8px;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: rgba(255, 255, 255, 0.9);
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.quick-roll-btn:hover:not(:disabled) {
		background: rgba(139, 92, 246, 0.2);
		border-color: rgba(139, 92, 246, 0.4);
		transform: translateY(-1px);
	}

	.quick-roll-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.quick-roll-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.manual-section {
		background: rgba(0, 0, 0, 0.2);
		padding: 12px;
		border-radius: 12px;
	}

	.manual-input {
		display: flex;
		gap: 8px;
	}

	.notation-input {
		flex: 1;
		padding: 12px 16px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 8px;
		color: rgba(255, 255, 255, 0.95);
		font-size: 15px;
		font-family: monospace;
		outline: none;
		transition: all 0.2s;
	}

	.notation-input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.notation-input:focus {
		border-color: rgba(139, 92, 246, 0.5);
		background: rgba(255, 255, 255, 0.08);
	}

	.notation-input.error {
		border-color: rgba(244, 63, 94, 0.5);
	}

	.roll-btn {
		padding: 12px 16px;
		background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
		border: none;
		border-radius: 8px;
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.roll-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
	}

	.roll-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.input-hint {
		margin: 8px 0 0;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.4);
	}

	.input-hint.error {
		color: #f43f5e;
	}

	.actions-section {
		display: flex;
		justify-content: center;
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 20px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: rgba(255, 255, 255, 0.7);
		font-size: 13px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.action-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
	}

	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
