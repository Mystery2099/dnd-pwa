<script lang="ts">
	import PageShell from '$lib/components/ui/PageShell.svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import { COMPENDIUM_CATEGORIES, COMPENDIUM_TYPE_CONFIGS } from '$lib/core/constants/compendium';

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
			{@const categoryTypes = category.types.filter((t: string) => COMPENDIUM_TYPE_CONFIGS[t as keyof typeof COMPENDIUM_TYPE_CONFIGS])}
			{#if categoryTypes.length > 0}
				<div class="category-card">
					<h2 class="category-title">{category.name}</h2>
					<p class="category-description">{category.description}</p>
					<div class="type-list">
						{#each categoryTypes as type}
							{@const config = COMPENDIUM_TYPE_CONFIGS[type]}
							{@const count = counts[type] ?? 0}
							<SurfaceCard href="/compendium/{type}" class="type-card" padding="p-3">
								<div class="type-content">
									<div class="type-info">
										<span class="type-icon">{config.icon}</span>
										<span class="type-name">{config.plural}</span>
									</div>
									<span class="type-count">{count.toLocaleString()}</span>
								</div>
							</SurfaceCard>
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	</div>
</PageShell>

<style>
	.category-card {
		background: var(--color-bg-card, rgba(255, 255, 255, 0.05));
		border: 1px solid var(--color-border, rgba(255, 255, 255, 0.1));
		border-radius: 12px;
		padding: 1.25rem;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.category-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
	}

	.category-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.category-icon {
		font-size: 1.5rem;
		filter: drop-shadow(0 0 8px var(--color-accent, #a78bfa));
	}

	.category-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text-primary, #f4f4f5);
		margin: 0;
	}

	.category-description {
		font-size: 0.875rem;
		color: var(--color-text-muted, #71717a);
		margin: 0 0 1rem 0;
		line-height: 1.5;
	}

	.type-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.type-card {
		background: var(--color-bg-subtle, rgba(255, 255, 255, 0.03));
		border: 1px solid var(--color-border, rgba(255, 255, 255, 0.08));
		border-radius: 8px;
		transition: background 0.15s ease, border-color 0.15s ease;
	}

	.type-card:hover {
		background: var(--color-bg-hover, rgba(255, 255, 255, 0.08));
		border-color: var(--color-accent, #a78bfa);
	}

	.type-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.type-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.type-icon {
		font-size: 1rem;
		opacity: 0.8;
	}

	.type-name {
		font-size: 0.9375rem;
		color: var(--color-text-primary, #f4f4f5);
		font-weight: 500;
	}

	.type-count {
		font-size: 0.8125rem;
		color: var(--color-text-muted, #71717a);
		background: var(--color-bg-subtle, rgba(0, 0, 0, 0.2));
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		font-variant-numeric: tabular-nums;
	}
</style>
