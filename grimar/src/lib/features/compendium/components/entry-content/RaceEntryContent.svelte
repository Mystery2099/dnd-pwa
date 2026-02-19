<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		details: Record<string, unknown>;
	}

	let { details }: Props = $props();

	const desc = details.desc as string[] | string | undefined;
	const descriptionMd = $derived(Array.isArray(desc) ? desc.join('\n\n') : desc || '');

	interface AbilityBonus {
		ability_score?: { name?: string };
		bonus?: number;
	}

	interface Trait {
		name?: string;
		desc?: string;
	}

	const abilityBonuses = details.ability_bonuses as AbilityBonus[] | undefined;
	const traits = details.traits as Trait[] | undefined;

	let SvelteMarkdown: any = $state(null);

	onMount(async () => {
		if (descriptionMd || traits?.some((t) => t.desc)) {
			const module = await import('svelte-markdown');
			SvelteMarkdown = module.default;
		}
	});
</script>

<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
	<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
		<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">
			Traits & Features
		</div>
		<div class="flex flex-wrap gap-2 pt-2">
			<span
				class="rounded bg-[var(--color-bg-card)] px-2 py-1 text-xs text-[var(--color-text-primary)]"
				>Size: {details.size ?? 'Unknown'}</span
			>
			<span
				class="rounded bg-[var(--color-bg-card)] px-2 py-1 text-xs text-[var(--color-text-primary)]"
				>Speed: {details.speed ?? 0}ft</span
			>
		</div>
	</div>

	{#if abilityBonuses && abilityBonuses.length > 0}
		<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
			<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">
				Ability Score Increases
			</div>
			<div class="flex flex-wrap gap-2 pt-2">
				{#each abilityBonuses as bonus, i (i)}
					<span
						class="rounded bg-[var(--color-gem-emerald)]/20 px-2 py-1 text-xs font-bold text-[var(--color-gem-emerald)]"
					>
						{(bonus.ability_score?.name ?? 'Unknown').toUpperCase()} +{bonus.bonus ?? 0}
					</span>
				{/each}
			</div>
		</div>
	{/if}
</div>

{#if details.starting_proficiencies || details.languages}
	<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
		{#if details.starting_proficiencies && Array.isArray(details.starting_proficiencies) && details.starting_proficiencies.length > 0}
			<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
				<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">
					Skill Proficiencies
				</div>
				<div class="text-sm text-[var(--color-text-primary)]">
					{(details.starting_proficiencies as { name?: string }[])
						.map((p) => p.name)
						.filter(Boolean)
						.join(', ')}
				</div>
			</div>
		{/if}
		{#if details.languages && Array.isArray(details.languages) && details.languages.length > 0}
			<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
				<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">
					Languages
				</div>
				<div class="text-sm text-[var(--color-text-primary)]">
					{(details.languages as string[]).join(', ')}
				</div>
			</div>
		{/if}
	</div>
{/if}

{#if traits && traits.length > 0}
	<div class="mb-8">
		<h3 class="mb-4 font-bold text-[var(--color-text-primary)]">Racial Traits</h3>
		<div class="space-y-4">
			{#each traits as trait, i (i)}
				<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
					<div class="mb-1 font-bold text-[var(--color-text-primary)]">{trait.name ?? 'Unknown'}</div>
					{#if trait.desc}
						{#if SvelteMarkdown}
							<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
								<SvelteMarkdown source={trait.desc} />
							</div>
						{:else}
							<div class="text-sm text-[var(--color-text-secondary)]">{trait.desc}</div>
						{/if}
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}

{#if descriptionMd && SvelteMarkdown}
	<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
		<SvelteMarkdown source={descriptionMd} />
	</div>
{:else if descriptionMd}
	<div class="text-sm whitespace-pre-wrap text-[var(--color-text-secondary)]">
		{descriptionMd}
	</div>
{/if}

<div class="mt-8 font-mono text-xs text-[var(--color-text-muted)]">
	ID: {details.slug ?? details.id ?? 'Unknown'}
</div>
