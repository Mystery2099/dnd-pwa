<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import { modifier, signed, damage, heal, type Sheet } from './rules';
	let {
		sheet = $bindable(),
		roll
	}: { sheet: Sheet; roll: (value: string, title: string) => void } = $props();
	let amount = $state(1);
</script>

<SurfaceCard padding="p-5">
	<h2 class="mb-4 text-xl font-bold">Combat</h2>
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
		<label
			>Armor class<input
				class="input-crystal mt-1 w-full p-2"
				type="number"
				min="0"
				max="100"
				bind:value={sheet.armorClass}
			/></label
		>
		<label
			>Speed (feet)<input
				class="input-crystal mt-1 w-full p-2"
				type="number"
				min="0"
				max="1000"
				bind:value={sheet.speed}
			/></label
		>
		<label
			>Initiative bonus<input
				class="input-crystal mt-1 w-full p-2"
				type="number"
				min="-100"
				max="100"
				bind:value={sheet.initiativeBonus}
			/></label
		>
		<label
			>Maximum HP<input
				class="input-crystal mt-1 w-full p-2"
				type="number"
				min="1"
				max="10000"
				bind:value={sheet.maxHp}
			/></label
		>
		<label
			>Current HP<input
				class="input-crystal mt-1 w-full p-2"
				type="number"
				min="0"
				max={sheet.maxHp}
				bind:value={sheet.hp}
			/></label
		>
		<label
			>Temporary HP<input
				class="input-crystal mt-1 w-full p-2"
				type="number"
				min="0"
				max="10000"
				bind:value={sheet.tempHp}
			/></label
		>
	</div>
	<div class="mt-4 flex flex-wrap items-end gap-2">
		<label class="w-24"
			>Amount<input
				class="input-crystal mt-1 w-full p-2"
				type="number"
				min="0"
				max="10000"
				bind:value={amount}
			/></label
		>
		<Button
			variant="secondary"
			onclick={() => {
				if (Number.isInteger(amount) && amount >= 0) sheet = damage(sheet, amount);
			}}>Damage</Button
		>
		<Button
			variant="secondary"
			onclick={() => {
				if (Number.isInteger(amount) && amount >= 0) sheet = heal(sheet, amount);
			}}>Heal</Button
		>
		<Button
			variant="secondary"
			onclick={() =>
				roll(
					`1d20${signed(modifier(sheet.abilities.dexterity) + sheet.initiativeBonus)}`,
					'Initiative'
				)}>Roll initiative</Button
		>
	</div>
	<p class="mt-3 text-sm text-[var(--color-text-muted)]">
		Track resistance, instant death, and damage at zero HP manually.
	</p>
	<div class="mt-3 grid grid-cols-2 gap-3">
		<label
			>Death save successes<input
				class="input-crystal mt-1 w-full p-2"
				type="number"
				min="0"
				max="3"
				bind:value={sheet.deathSuccesses}
			/></label
		>
		<label
			>Death save failures<input
				class="input-crystal mt-1 w-full p-2"
				type="number"
				min="0"
				max="3"
				bind:value={sheet.deathFailures}
			/></label
		>
	</div>
</SurfaceCard>
