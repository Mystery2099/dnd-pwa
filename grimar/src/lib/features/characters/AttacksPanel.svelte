<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import { abilities, label, modifier, proficiency, signed, type Sheet } from './rules';
	let {
		sheet = $bindable(),
		roll
	}: { sheet: Sheet; roll: (value: string, title: string) => void } = $props();
	const pb = $derived(proficiency(sheet.level));
</script>

<SurfaceCard padding="p-5">
	<h2 class="mb-4 text-xl font-bold">Attacks</h2>
	<p class="mb-3 text-sm text-[var(--color-text-muted)]">
		Enter damage dice including your damage modifier. Attack bonuses include the chosen ability and
		proficiency.
	</p>
	{#each sheet.attacks as attack, i (i)}
		<fieldset class="panel-inset mb-3 space-y-2 p-3">
			<legend>Attack {i + 1}</legend>
			<label class="block"
				>Name<input
					class="input-crystal mt-1 w-full p-2"
					maxlength="200"
					bind:value={attack.name}
				/></label
			>
			<div class="grid grid-cols-2 gap-2">
				<label
					>Ability<select class="input-crystal mt-1 w-full p-2" bind:value={attack.ability}
						>{#each abilities as a (a)}<option value={a}>{label(a)}</option>{/each}</select
					></label
				>
				<label
					>Extra attack bonus<input
						class="input-crystal mt-1 w-full p-2"
						type="number"
						min="-100"
						max="100"
						bind:value={attack.bonus}
					/></label
				>
			</div>
			<label class="flex items-center gap-2"
				><input type="checkbox" bind:checked={attack.proficient} />Proficient</label
			>
			<label class="block"
				>Damage dice<input
					class="input-crystal mt-1 w-full p-2"
					placeholder="1d8+3"
					maxlength="40"
					bind:value={attack.damage}
				/></label
			>
			<div class="flex flex-wrap gap-2">
				<Button
					size="sm"
					onclick={() =>
						roll(
							`1d20${signed(modifier(sheet.abilities[attack.ability]) + (attack.proficient ? pb : 0) + attack.bonus)}`,
							attack.name || 'Attack'
						)}>Attack</Button
				><Button
					size="sm"
					variant="secondary"
					onclick={() => roll(attack.damage, `${attack.name || 'Attack'} damage`)}
					>Damage roll</Button
				><Button
					size="sm"
					variant="ghost"
					onclick={() => {
						sheet.attacks = sheet.attacks.filter((_, index) => index !== i);
					}}>Remove attack {i + 1}</Button
				>
			</div>
		</fieldset>
	{/each}
	<Button
		variant="secondary"
		disabled={sheet.attacks.length >= 30}
		onclick={() => {
			sheet.attacks = [
				...sheet.attacks,
				{ name: '', ability: 'strength', proficient: true, bonus: 0, damage: '1d8' }
			];
		}}>Add attack</Button
	>
</SurfaceCard>
