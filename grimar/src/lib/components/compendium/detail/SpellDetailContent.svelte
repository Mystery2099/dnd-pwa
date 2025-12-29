<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		spell: Record<string, unknown> & { externalId?: string };
	}

	let { spell }: Props = $props();

	const description = $derived(spell.description as string[] | undefined);
	const higherLevel = $derived(spell.higher_level as string[] | undefined);

	// Combine paragraphs into markdown format
	const descriptionMd = $derived(description ? description.join('\n\n') : '');
	const higherLevelMd = $derived(higherLevel ? higherLevel.join('\n\n') : '');

	// Lazy load svelte-markdown only when needed
	let SvelteMarkdown: any = $state(null);

	onMount(async () => {
		if (descriptionMd || higherLevelMd) {
			const module = await import('svelte-markdown');
			SvelteMarkdown = module.default;
		}
	});
</script>

<!-- Spell Details Table -->
<div
	class="mb-8 grid grid-cols-2 gap-4 rounded-xl border border-white/10 bg-white/5 p-4 md:grid-cols-4"
>
	<div>
		<div class="mb-1 text-xs font-bold text-gray-500 uppercase">Casting Time</div>
		<div class="text-sm text-gray-200">{spell.casting_time}</div>
	</div>
	<div>
		<div class="mb-1 text-xs font-bold text-gray-500 uppercase">Range</div>
		<div class="text-sm text-gray-200">{spell.range}</div>
	</div>
	<div>
		<div class="mb-1 text-xs font-bold text-gray-500 uppercase">Components</div>
		<div class="text-sm text-gray-200">
			{#if Array.isArray(spell.components)}
				{spell.components.join(', ')}
			{:else}
				{spell.components || 'None'}
			{/if}
		</div>
	</div>
	<div>
		<div class="mb-1 text-xs font-bold text-gray-500 uppercase">Duration</div>
		<div class="text-sm text-gray-200">{spell.duration}</div>
	</div>
</div>

<!-- Description (Markdown rendered) -->
{#if descriptionMd && SvelteMarkdown}
	<div class="prose prose-sm max-w-none text-gray-300 prose-invert">
		<SvelteMarkdown source={descriptionMd} />
	</div>
{/if}

{#if higherLevelMd && SvelteMarkdown}
	<div class="mt-6 border-t border-white/10 pt-6">
		<h4 class="mb-2 font-bold text-white">At Higher Levels</h4>
		<div class="prose prose-sm max-w-none text-gray-300 prose-invert">
			<SvelteMarkdown source={higherLevelMd} />
		</div>
	</div>
{/if}

<div class="mt-8 font-mono text-xs text-gray-600">
	ID: {spell.externalId ?? spell.id ?? spell.index}
</div>
