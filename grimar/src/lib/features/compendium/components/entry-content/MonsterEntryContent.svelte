<script lang="ts">
	import {
		markdownRenderers,
		useLazyMarkdown
	} from '$lib/features/compendium/utils/markdown.svelte';

	interface Props {
		details: Record<string, unknown>;
	}

	let { details }: Props = $props();

	function getMod(stat: number): string {
		const mod = Math.floor((stat - 10) / 2);
		return mod >= 0 ? `+${mod}` : String(mod);
	}

	const speed = $derived(details.speed as Record<string, string> | undefined);
	const actions = $derived(details.actions as Array<{ name: string; desc?: string; attack_bonus?: number; damage?: unknown }> | undefined);
	const specialAbilities = $derived(details.special_abilities as Array<{ name: string; desc?: string }> | undefined);
	const legendaryActions = $derived(details.legendary_actions as Array<{ name: string; desc?: string }> | undefined);
	const reactions = $derived(details.reactions as Array<{ name: string; desc?: string }> | undefined);

	const armorClass = $derived(Number(details.armor_class ?? 0));
	const hitPoints = $derived(Number(details.hit_points ?? 0));
	const hitDice = $derived(details.hit_dice as string | undefined);
	const strength = $derived(Number(details.strength ?? 10));
	const dexterity = $derived(Number(details.dexterity ?? 10));
	const constitution = $derived(Number(details.constitution ?? 10));
	const intelligence = $derived(Number(details.intelligence ?? 10));
	const wisdom = $derived(Number(details.wisdom ?? 10));
	const charisma = $derived(Number(details.charisma ?? 10));
	const proficiencies = $derived(details.proficiencies as Array<{ name: string; value: number }> | undefined);
	const senses = $derived(details.senses as Record<string, string> | undefined);
	const languages = $derived(details.languages as string | undefined);
	const damageVulnerabilities = $derived(details.damage_vulnerabilities as string[] | undefined);
	const damageResistances = $derived(details.damage_resistances as string[] | undefined);
	const damageImmunities = $derived(details.damage_immunities as string[] | undefined);
	const conditionImmunities = $derived(details.condition_immunities as string[] | undefined);
	const id = $derived(details.id as string | undefined);

	const hasMarkdown = $derived(
		(actions?.some((a) => a.desc) ?? false) ||
			(specialAbilities?.some((s) => s.desc) ?? false) ||
			(legendaryActions?.some((l) => l.desc) ?? false) ||
			(reactions?.some((r) => r.desc) ?? false)
	);

	const { SvelteMarkdown } = useLazyMarkdown(() => (hasMarkdown ? 'true' : ''));
</script>

<!-- Monster Stats Header -->
<div
	class="mb-6 grid grid-cols-3 gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4"
>
	<div class="text-center">
		<div class="text-xs font-bold text-[var(--color-text-muted)] uppercase">AC</div>
		<div class="text-xl font-bold text-[var(--color-text-primary)]">
			{armorClass}
		</div>
	</div>
	<div class="border-l border-[var(--color-border)] text-center">
		<div class="text-xs font-bold text-[var(--color-text-muted)] uppercase">HP</div>
		<div class="text-xl font-bold text-[var(--color-accent)]">{hitPoints}</div>
		{#if hitDice}
			<div class="text-xs text-[var(--color-text-muted)]">{hitDice}</div>
		{/if}
	</div>
	<div class="border-l border-[var(--color-border)] text-center">
		<div class="text-xs font-bold text-[var(--color-text-muted)] uppercase">Speed</div>
		<div class="mt-1 text-sm font-medium text-[var(--color-text-primary)]">
			{#if speed}
				{Object.entries(speed)
					.filter(([, v]) => v)
					.map(([k, v]) => `${k} ${v}`)
					.join(', ')}
			{:else}
				N/A
			{/if}
		</div>
	</div>
</div>

<!-- Ability Scores -->
<div class="mb-8 grid grid-cols-6 gap-2">
	{#each [
		{ name: 'STR', value: strength },
		{ name: 'DEX', value: dexterity },
		{ name: 'CON', value: constitution },
		{ name: 'INT', value: intelligence },
		{ name: 'WIS', value: wisdom },
		{ name: 'CHA', value: charisma }
	] as stat (stat.name)}
		<div
			class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-overlay)] p-2 text-center"
		>
			<div class="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">
				{stat.name}
			</div>
			<div class="text-sm font-bold text-[var(--color-text-primary)]">{stat.value}</div>
			<div class="text-[10px] text-[var(--color-text-secondary)]">{getMod(stat.value)}</div>
		</div>
	{/each}
</div>

<!-- Tidbits Row -->
<div
	class="mb-6 grid grid-cols-2 gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 text-sm md:grid-cols-4"
>
	<div>
		<span class="font-bold text-[var(--color-text-muted)]">Saving Throws: </span>
		<span class="text-[var(--color-text-primary)]">
			{proficiencies?.filter((p) => p.name.includes('Save')).map((p) => `${p.name} ${p.value >= 0 ? '+' : ''}${p.value}`).join(', ') || 'None'}
		</span>
	</div>
	<div>
		<span class="font-bold text-[var(--color-text-muted)]">Skills: </span>
		<span class="text-[var(--color-text-primary)]">
			{proficiencies?.filter((p) => !p.name.includes('Save')).map((p) => `${p.name} ${p.value >= 0 ? '+' : ''}${p.value}`).join(', ') || 'None'}
		</span>
	</div>
	<div>
		<span class="font-bold text-[var(--color-text-muted)]">Senses: </span>
		<span class="text-[var(--color-text-primary)]">
			{Object.entries(senses || {}).map(([k, v]) => `${k} ${v}`).join(', ') || 'None'}
		</span>
	</div>
	<div>
		<span class="font-bold text-[var(--color-text-muted)]">Languages: </span>
		<span class="text-[var(--color-text-primary)]">{languages || 'None'}</span>
	</div>
</div>

<!-- Damage/Condition Info -->
{#if damageVulnerabilities?.length || damageResistances?.length || damageImmunities?.length || conditionImmunities?.length}
	<div
		class="mb-6 grid grid-cols-2 gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 text-sm md:grid-cols-4"
	>
		{#if damageVulnerabilities?.length}
			<div>
				<span class="font-bold text-[var(--color-text-muted)]">Vulnerabilities: </span>
				<span class="text-[var(--color-text-primary)]">{damageVulnerabilities.join(', ')}</span>
			</div>
		{/if}
		{#if damageResistances?.length}
			<div>
				<span class="font-bold text-[var(--color-text-muted)]">Resistances: </span>
				<span class="text-[var(--color-text-primary)]">{damageResistances.join(', ')}</span>
			</div>
		{/if}
		{#if damageImmunities?.length}
			<div>
				<span class="font-bold text-[var(--color-text-muted)]">Damage Immunities: </span>
				<span class="text-[var(--color-text-primary)]">{damageImmunities.join(', ')}</span>
			</div>
		{/if}
		{#if conditionImmunities?.length}
			<div>
				<span class="font-bold text-[var(--color-text-muted)]">Condition Immunities: </span>
				<span class="text-[var(--color-text-primary)]">{conditionImmunities.join(', ')}</span>
			</div>
		{/if}
	</div>
{/if}

<!-- Special Abilities / Traits -->
{#if specialAbilities?.length}
	<h3
		class="mb-4 border-b border-[var(--color-border)] pb-2 font-bold text-[var(--color-text-primary)]"
	>
		Traits
	</h3>
	<div class="space-y-4">
		{#each specialAbilities as trait (trait.name)}
			<div>
				<div class="mb-1 font-bold text-[var(--color-text-primary)]">{trait.name}</div>
				{#if trait.desc}
					{#if SvelteMarkdown}
						<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
							<SvelteMarkdown source={trait.desc} renderers={markdownRenderers} />
						</div>
					{:else}
						<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
							<p class="whitespace-pre-wrap">{trait.desc}</p>
						</div>
					{/if}
				{/if}
			</div>
		{/each}
	</div>
{/if}

<!-- Actions -->
{#if actions?.length}
	<h3
		class="mt-8 mb-4 border-b border-[var(--color-border)] pb-2 font-bold text-[var(--color-text-primary)]"
	>
		Actions
	</h3>
	<div class="space-y-6">
		{#each actions as action (action.name)}
			<div>
				<div
					class="mb-1 flex items-center gap-2 text-lg font-bold text-[var(--color-text-primary)]"
				>
					{action.name}
					{#if action.attack_bonus}
						<span
							class="rounded bg-[var(--color-bg-card)] px-1.5 py-0.5 text-xs text-[var(--color-text-secondary)]"
							>+{action.attack_bonus} to hit</span
						>
					{/if}
				</div>
				{#if action.desc}
					{#if SvelteMarkdown}
						<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
							<SvelteMarkdown source={action.desc} renderers={markdownRenderers} />
						</div>
					{:else}
						<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
							<p class="whitespace-pre-wrap">{action.desc}</p>
						</div>
					{/if}
				{/if}
				{#if action.damage}
					<div class="mt-1 font-mono text-xs text-[var(--color-accent)]">
						Damage:
						{Array.isArray(action.damage)
							? action.damage.map((d: { dice?: string }) => d.dice).join(' + ')
							: `${(action.damage as { dice?: string }).dice} ${(action.damage as { type?: string }).type}`}
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<!-- Legendary Actions -->
{#if legendaryActions?.length}
	<h3
		class="mt-8 mb-4 border-b border-[var(--color-border)] pb-2 font-bold text-[var(--color-text-primary)]"
	>
		Legendary Actions
	</h3>
	<div class="space-y-4">
		{#each legendaryActions as action (action.name)}
			<div>
				<div class="mb-1 font-bold text-[var(--color-text-primary)]">{action.name}</div>
				{#if action.desc}
					{#if SvelteMarkdown}
						<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
							<SvelteMarkdown source={action.desc} renderers={markdownRenderers} />
						</div>
					{:else}
						<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
							<p class="whitespace-pre-wrap">{action.desc}</p>
						</div>
					{/if}
				{/if}
			</div>
		{/each}
	</div>
{/if}

<!-- Reactions -->
{#if reactions?.length}
	<h3
		class="mt-8 mb-4 border-b border-[var(--color-border)] pb-2 font-bold text-[var(--color-text-primary)]"
	>
		Reactions
	</h3>
	<div class="space-y-4">
		{#each reactions as reaction (reaction.name)}
			<div>
				<div class="mb-1 font-bold text-[var(--color-text-primary)]">{reaction.name}</div>
				{#if reaction.desc}
					{#if SvelteMarkdown}
						<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
							<SvelteMarkdown source={reaction.desc} renderers={markdownRenderers} />
						</div>
					{:else}
						<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
							<p class="whitespace-pre-wrap">{reaction.desc}</p>
						</div>
					{/if}
				{/if}
			</div>
		{/each}
	</div>
{/if}

{#if id}
	<div class="mt-8 font-mono text-xs text-[var(--color-text-muted)]">
		ID: {id}
	</div>
{/if}
