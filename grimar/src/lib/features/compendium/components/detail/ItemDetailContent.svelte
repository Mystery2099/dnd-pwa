<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		item: Record<string, unknown> & { externalId?: string };
	}

	let { item }: Props = $props();

	const description = $derived(item.description as string | string[] | undefined);
	const type = $derived(item.type as string | undefined);
	const rarity = $derived(item.rarity as string | undefined);

	// Combine into markdown format
	const descriptionMd = $derived(
		Array.isArray(description) ? description.join('\n\n') : description || ''
	);

	// Lazy load svelte-markdown only when needed
	let SvelteMarkdown: any = $state(null);

	onMount(async () => {
		if (descriptionMd) {
			const module = await import('svelte-markdown');
			SvelteMarkdown = module.default;
		}
	});
</script>

<div class="mb-8 flex flex-wrap gap-4">
	{#if type}
		<div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-2">
			<div class="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Type</div>
			<div class="text-sm text-[var(--color-text-primary)]">{type}</div>
		</div>
	{/if}

	{#if rarity}
		<div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-2">
			<div class="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Rarity</div>
			<div class="text-sm font-medium text-[var(--color-gem-sapphire)]">{rarity}</div>
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
	ID: {item.externalId ?? item.id ?? item.slug}
</div>
