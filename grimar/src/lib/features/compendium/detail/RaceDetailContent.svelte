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
	<div class="rounded-xl border border-white/10 bg-white/5 p-4">
		<div class="mb-1 text-xs font-bold text-gray-500 uppercase">Traits & Features</div>
		<div class="flex flex-wrap gap-2 pt-2">
			<span class="rounded bg-white/10 px-2 py-1 text-xs text-gray-200"
				>Size: {race.size || 'Medium'}</span
			>
			<span class="rounded bg-white/10 px-2 py-1 text-xs text-gray-200"
				>Speed: {race.speed || 30}ft</span
			>
			{#if traits}
				{#each traits as trait}
					<span class="rounded bg-purple-500/20 px-2 py-1 text-xs text-purple-200">{trait}</span>
				{/each}
			{/if}
		</div>
	</div>

	{#if abilityBonuses && abilityBonuses.length > 0}
		<div class="rounded-xl border border-white/10 bg-white/5 p-4">
			<div class="mb-1 text-xs font-bold text-gray-500 uppercase">Ability Score Increases</div>
			<div class="flex flex-wrap gap-2 pt-2">
				{#each abilityBonuses as bonus}
					<span class="rounded bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-200">
						{bonus.ability_score.name} +{bonus.bonus}
					</span>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Description (Markdown rendered) -->
{#if descriptionMd && SvelteMarkdown}
	<div class="prose prose-sm max-w-none text-gray-300 prose-invert">
		<SvelteMarkdown source={descriptionMd} />
	</div>
{:else if descriptionMd}
	<div class="text-sm whitespace-pre-wrap text-gray-300">
		{descriptionMd}
	</div>
{/if}

<div class="mt-8 font-mono text-xs text-gray-600">
	ID: {race.externalId ?? race.id ?? race.index}
</div>
