<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		race: Record<string, unknown> & { externalId?: string };
	}

	let { race }: Props = $props();

	const description = $derived(race.description as string[] | undefined);
	const traits = $derived(race.traits as string[] | undefined);
	const abilityBonuses = $derived(
		race.ability_bonuses as Array<{ ability_score: { name: string }; bonus: number }> | undefined
	);

	// Combine paragraphs into markdown format
	const descriptionMd = $derived(description ? description.join('\n\n') : '');

	// Lazy load svelte-markdown only when needed
	let SvelteMarkdown: any = $state(null);

	onMount(async () => {
		if (descriptionMd) {
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
				>Size: {race.size || 'Medium'}</span
			>
			<span
				class="rounded bg-[var(--color-bg-card)] px-2 py-1 text-xs text-[var(--color-text-primary)]"
				>Speed: {race.speed || 30}ft</span
			>
			{#if traits}
				{#each traits as trait (trait)}
					<span
						class="rounded bg-[var(--color-accent)]/20 px-2 py-1 text-xs text-[var(--color-text-secondary)]"
						>{trait}</span
					>
				{/each}
			{/if}
		</div>
	</div>

	{#if abilityBonuses && abilityBonuses.length > 0}
		<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
			<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">
				Ability Score Increases
			</div>
			<div class="flex flex-wrap gap-2 pt-2">
				{#each abilityBonuses as bonus (bonus.ability_score.name)}
					<span
						class="rounded bg-[var(--color-gem-emerald)]/20 px-2 py-1 text-xs font-bold text-[var(--color-gem-emerald)]"
					>
						{bonus.ability_score.name} +{bonus.bonus}
					</span>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Description (Markdown rendered) -->
{#if descriptionMd && SvelteMarkdown}
	<div class="prose prose-sm max-w-none text-[var(--color-text-secondary)] prose-invert">
		<SvelteMarkdown source={descriptionMd} />
	</div>
{:else if descriptionMd}
	<div class="text-sm whitespace-pre-wrap text-[var(--color-text-secondary)]">
		{descriptionMd}
	</div>
{/if}

<div class="mt-8 font-mono text-xs text-[var(--color-text-muted)]">
	ID: {race.externalId ?? race.id ?? race.index}
</div>
