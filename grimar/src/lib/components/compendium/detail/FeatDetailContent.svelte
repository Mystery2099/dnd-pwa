<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		feat: Record<string, unknown> & { externalId?: string };
	}

	let { feat }: Props = $props();

	const description = $derived(feat.description as string[] | undefined);
	const prerequisites = $derived(feat.prerequisites as string[] | undefined);

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

{#if prerequisites && prerequisites.length > 0}
	<div class="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
		<div class="text-xs font-bold text-gray-500 uppercase">Prerequisites</div>
		<div class="mt-1 text-sm text-gray-200">{prerequisites.join(', ')}</div>
	</div>
{/if}

<!-- Description (Markdown rendered) -->
{#if descriptionMd && SvelteMarkdown}
	<div class="prose prose-sm max-w-none text-gray-300 prose-invert">
		<SvelteMarkdown source={descriptionMd} />
	</div>
{:else if descriptionMd}
	<div class="whitespace-pre-wrap text-sm text-gray-300">
		{descriptionMd}
	</div>
{/if}

<div class="mt-8 font-mono text-xs text-gray-600">
	ID: {feat.externalId ?? feat.id ?? feat.index}
</div>
