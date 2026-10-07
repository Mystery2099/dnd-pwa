<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import { abilities, skills, label, modifier, proficiency, signed, type Sheet } from './rules';
	let {
		sheet = $bindable(),
		roll
	}: { sheet: Sheet; roll: (value: string, title: string) => void } = $props();
	const pb = $derived(proficiency(sheet.level));
</script>

<SurfaceCard padding="p-5">
	<h2 class="mb-4 text-xl font-bold">Abilities &amp; saving throws</h2>
	<div class="space-y-3">
		{#each abilities as ability (ability)}
			<div class="grid grid-cols-[1fr_4rem_auto] items-end gap-2">
				<label
					>{label(ability)}<input
						class="input-crystal mt-1 w-full p-2"
						type="number"
						min="1"
						max="30"
						bind:value={sheet.abilities[ability]}
					/></label
				>
				<span class="pb-2 text-center">{signed(modifier(sheet.abilities[ability]))}</span>
				<Button
					size="sm"
					variant="secondary"
					onclick={() => roll(`1d20${signed(modifier(sheet.abilities[ability]))}`, label(ability))}
					>Check</Button
				>
			</div>
			<div class="flex items-center justify-between gap-2">
				<label class="flex items-center gap-2"
					><input
						type="checkbox"
						checked={sheet.saves.includes(ability)}
						onchange={(e) => {
							sheet.saves = e.currentTarget.checked
								? [...sheet.saves, ability]
								: sheet.saves.filter((a) => a !== ability);
						}}
					/>Save proficiency</label
				>
				<Button
					size="sm"
					variant="ghost"
					onclick={() =>
						roll(
							`1d20${signed(modifier(sheet.abilities[ability]) + (sheet.saves.includes(ability) ? pb : 0))}`,
							`${label(ability)} save`
						)}
					>Save {signed(
						modifier(sheet.abilities[ability]) + (sheet.saves.includes(ability) ? pb : 0)
					)}</Button
				>
			</div>
		{/each}
	</div>
</SurfaceCard>
<SurfaceCard padding="p-5">
	<h2 class="mb-4 text-xl font-bold">Skills</h2>
	<div class="space-y-2">
		{#each Object.entries(skills) as [skill, ability] (skill)}
			<div class="grid grid-cols-[1fr_7rem_auto] items-center gap-2">
				<label for={`skill-${skill}`}>{label(skill)}</label>
				<select
					id={`skill-${skill}`}
					class="input-crystal min-w-0 p-2"
					value={sheet.skills[skill] || 0}
					onchange={(e) => {
						sheet.skills[skill] = Number(e.currentTarget.value);
					}}
					><option value={0}>None</option><option value={1}>Proficient</option><option value={2}
						>Expertise</option
					></select
				>
				<Button
					size="sm"
					variant="ghost"
					title={`Roll ${label(skill)}`}
					onclick={() =>
						roll(
							`1d20${signed(modifier(sheet.abilities[ability]) + pb * (sheet.skills[skill] || 0))}`,
							label(skill)
						)}
					>{signed(modifier(sheet.abilities[ability]) + pb * (sheet.skills[skill] || 0))}</Button
				>
			</div>
		{/each}
	</div>
</SurfaceCard>
