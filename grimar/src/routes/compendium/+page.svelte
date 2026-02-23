<script lang="ts">
	import PageShell from '$lib/components/ui/PageShell.svelte';
	import { COMPENDIUM_CATEGORIES, COMPENDIUM_TYPE_CONFIGS } from '$lib/core/constants/compendium';
	import { cn } from '$lib/utils.js';

	interface Props {
		data: {
			counts: Record<string, number>;
		};
	}

	let { data }: Props = $props();
	const counts = $derived(data.counts ?? {});
</script>

<PageShell title="Compendium" description="Browse the complete D&D 5e reference library">
	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each COMPENDIUM_CATEGORIES as category}
			{@const categoryTypes = category.types.filter(
				(t: string) => COMPENDIUM_TYPE_CONFIGS[t as keyof typeof COMPENDIUM_TYPE_CONFIGS]
			)}
			{#if categoryTypes.length > 0}
				<div class="category-card group">
					<h2 class="category-title">{category.name}</h2>
					<p class="category-description">{category.description}</p>
					<div class="type-list">
						{#each categoryTypes as type}
							{@const config = COMPENDIUM_TYPE_CONFIGS[type]}
							{@const count = counts[type] ?? 0}
							<a href="/compendium/{type}" class="type-row">
								<div class="type-info">
									<span class="type-icon">{config.icon}</span>
									<span class="type-name">{config.plural}</span>
								</div>
								<span class="type-count">{count.toLocaleString()}</span>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	</div>
</PageShell>
