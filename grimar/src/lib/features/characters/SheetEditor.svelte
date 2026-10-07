<script lang="ts">
	import SpellPanel from './SpellPanel.svelte';
	import AttacksPanel from './AttacksPanel.svelte';
	import AbilityPanel from './AbilityPanel.svelte';
	import CombatPanel from './CombatPanel.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import {
		label,
		modifier,
		proficiency,
		signed,
		heal,
		longRest,
		rollDice,
		type Sheet
	} from './rules';
	let { sheet = $bindable() }: { sheet: Sheet } = $props();

	let expression = $state('1d20');
	let mode = $state<'normal' | 'advantage' | 'disadvantage'>('normal');
	let rolls = $state<string[]>([]);
	let rollError = $state('');
	let showResult = $state(false);
	let restConfirm = $state(false);
	const pb = $derived(proficiency(sheet.level));

	function roll(value: string, title: string) {
		try {
			const result = rollDice(value, mode);
			rolls = [
				`${title}: ${result.total} (${result.rolls.join(', ')}; ${signed(result.bonus)})`,
				...rolls
			].slice(0, 10);
			rollError = '';
			showResult = true;
		} catch (e) {
			rollError = e instanceof Error ? e.message : 'Could not roll.';
			showResult = true;
		}
	}
	function shortRest() {
		if (!sheet.hitDiceRemaining) return;
		const result = rollDice(`1${sheet.hitDie}${signed(modifier(sheet.abilities.constitution))}`);
		sheet = {
			...heal(sheet, Math.max(0, result.total)),
			hitDiceRemaining: sheet.hitDiceRemaining - 1
		};
		showResult = true;
		rolls = [
			`Hit die: ${result.total} (${result.rolls.join(', ')}; ${signed(result.bonus)})`,
			...rolls
		].slice(0, 10);
	}
</script>

<div class="grid gap-4 lg:grid-cols-2">
	<SurfaceCard padding="p-5">
		<h2 class="mb-4 text-xl font-bold">Identity</h2>
		<div class="grid grid-cols-2 gap-3">
			<label
				>Level<input
					class="input-crystal mt-1 w-full p-2"
					type="number"
					min="1"
					max="20"
					bind:value={sheet.level}
				/></label
			>
			<label
				>Class / subclasses<input
					class="input-crystal mt-1 w-full p-2"
					maxlength="200"
					bind:value={sheet.className}
				/></label
			>
			<label
				>Species<input
					class="input-crystal mt-1 w-full p-2"
					maxlength="200"
					bind:value={sheet.species}
				/></label
			>
			<label
				>Background<input
					class="input-crystal mt-1 w-full p-2"
					maxlength="200"
					bind:value={sheet.background}
				/></label
			>
		</div>
		<p class="mt-3 text-sm text-[var(--color-text-muted)]">
			Proficiency {signed(pb)} · Passive perception {10 +
				modifier(sheet.abilities.wisdom) +
				pb * (sheet.skills.perception || 0)}
		</p>
		<label class="mt-3 flex items-center gap-2"
			><input type="checkbox" bind:checked={sheet.inspiration} />Inspiration</label
		>
	</SurfaceCard>
	<CombatPanel bind:sheet {roll} />
	<AbilityPanel bind:sheet {roll} />

	<AttacksPanel bind:sheet {roll} />
	<SpellPanel bind:sheet {roll} />
	<SurfaceCard padding="p-5">
		<h2 class="mb-4 text-xl font-bold">Rest &amp; recovery</h2>
		<div class="grid grid-cols-2 gap-3">
			<label
				>Hit die<select class="input-crystal mt-1 w-full p-2" bind:value={sheet.hitDie}
					>{#each ['d6', 'd8', 'd10', 'd12'] as die (die)}<option>{die}</option>{/each}</select
				></label
			><label
				>Remaining hit dice<input
					class="input-crystal mt-1 w-full p-2"
					type="number"
					min="0"
					max={sheet.level}
					bind:value={sheet.hitDiceRemaining}
				/></label
			>
		</div>
		<div class="mt-4 flex flex-wrap gap-2">
			<Button variant="secondary" disabled={!sheet.hitDiceRemaining} onclick={shortRest}
				>Spend hit die</Button
			><Button
				variant="secondary"
				onclick={() => {
					restConfirm = true;
				}}>Long rest</Button
			>
		</div>
		<p class="mt-3 text-sm text-[var(--color-text-muted)]">
			Spend one hit die after a short rest. A long rest restores HP and spell slots, and at least
			one or half your level in hit dice. Apply eligibility, exhaustion, and class features
			manually.
		</p>
		{#if restConfirm}<div class="mt-3 space-y-2">
				<p>Apply long-rest recovery to this sheet?</p>
				<div class="flex gap-2">
					<Button
						onclick={() => {
							sheet = longRest(sheet);
							restConfirm = false;
						}}>Apply recovery</Button
					><Button
						variant="ghost"
						onclick={() => {
							restConfirm = false;
						}}>Cancel rest</Button
					>
				</div>
			</div>{/if}
	</SurfaceCard>
	<SurfaceCard padding="p-5">
		<h2 class="mb-4 text-xl font-bold">Dice</h2>
		<p class="mb-3 text-sm text-[var(--color-text-muted)]">
			Rolls are local to this device and are not shared with the group. Advantage applies to a
			single d20.
		</p>
		<label class="block"
			>Dice expression<input
				class="input-crystal mt-1 w-full p-2"
				bind:value={expression}
				maxlength="40"
			/></label
		>
		<label class="mt-3 block"
			>Roll mode<select class="input-crystal mt-1 w-full p-2" bind:value={mode}
				><option value="normal">Normal</option><option value="advantage">Advantage</option><option
					value="disadvantage">Disadvantage</option
				></select
			></label
		>
		<div class="mt-3"><Button onclick={() => roll(expression, expression)}>Roll dice</Button></div>
		{#if rollError}<p role="alert" class="mt-2">{rollError}</p>{/if}
		<ol aria-live="polite" class="mt-3 space-y-2 break-words">
			{#each rolls as result, i (i)}<li>{result}</li>{/each}
		</ol>
	</SurfaceCard>
	{#each ['equipment', 'spells', 'notes'] as section (section)}
		<SurfaceCard padding="p-5" class={section === 'notes' ? 'lg:col-span-2' : ''}>
			<label class="mb-3 block text-xl font-bold" for={`sheet-${section}`}>{label(section)}</label>
			<textarea
				id={`sheet-${section}`}
				class="input-crystal w-full p-3"
				rows="8"
				maxlength={section === 'notes' ? 40000 : 20000}
				bind:value={sheet[section as 'equipment' | 'spells' | 'notes']}
			></textarea>
			{#if section === 'spells'}<Button href="/compendium/spells" variant="ghost" size="sm"
					>Spell reference</Button
				>{/if}
		</SurfaceCard>
	{/each}
</div>

{#if showResult}
	<div
		class="panel-inset fixed right-4 bottom-4 left-4 z-40 flex items-center justify-between gap-3 p-4 shadow-xl md:left-auto md:max-w-md"
	>
		<p role="status" class="break-words">{rollError || rolls[0]}</p>
		<Button
			size="sm"
			variant="secondary"
			onclick={() => {
				showResult = false;
			}}>Dismiss roll</Button
		>
	</div>
{/if}
