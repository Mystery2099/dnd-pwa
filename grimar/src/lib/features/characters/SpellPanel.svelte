<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import { abilities, label, modifier, proficiency, signed, type Sheet } from './rules';
	let {
		sheet = $bindable(),
		roll
	}: { sheet: Sheet; roll: (value: string, title: string) => void } = $props();
	const pb = $derived(proficiency(sheet.level));
	const dc = $derived(
		sheet.castingAbility === 'none'
			? null
			: 8 + pb + modifier(sheet.abilities[sheet.castingAbility])
	);
</script>

<SurfaceCard padding="p-5">
	<h2 class="mb-4 text-xl font-bold">Spellcasting</h2>
	<label class="block"
		>Casting ability<select class="input-crystal mt-1 w-full p-2" bind:value={sheet.castingAbility}
			><option value="none">None</option>{#each abilities as a (a)}<option value={a}
					>{label(a)}</option
				>{/each}</select
		></label
	>
	{#if dc !== null}<p class="my-3">Spell save DC {dc} · Spell attack {signed(dc - 8)}</p>
		<Button size="sm" onclick={() => roll(`1d20${signed(dc! - 8)}`, 'Spell attack')}
			>Roll spell attack</Button
		>{/if}
	<p class="my-3 text-sm text-[var(--color-text-muted)]">
		Set your slot totals, including multiclass choices. Track pact magic and class-specific
		resources in notes.
	</p>
	<div class="space-y-2">
		{#each sheet.slots as slot, i (i)}
			<div class="grid grid-cols-3 items-end gap-2">
				<span class="pb-2">Level {i + 1}</span><label
					>Maximum<input
						class="input-crystal mt-1 w-full p-2"
						type="number"
						min="0"
						max="20"
						bind:value={slot.max}
					/></label
				><label
					>Used<input
						class="input-crystal mt-1 w-full p-2"
						type="number"
						min="0"
						max={slot.max}
						bind:value={slot.used}
					/></label
				>
			</div>
		{/each}
	</div>
</SurfaceCard>
