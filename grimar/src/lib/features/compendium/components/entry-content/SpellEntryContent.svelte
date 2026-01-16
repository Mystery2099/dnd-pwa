<script lang="ts">
	import {
		markdownRenderers,
		useLazyMarkdown
	} from '$lib/features/compendium/utils/markdown.svelte';

	interface Props {
		spell: Record<string, unknown> & { externalId?: string };
	}

	let { spell }: Props = $props();

	// Normalize description - can be string or array of strings
	const descriptionArray = $derived(
		typeof spell.desc === 'string' ? [spell.desc] : (spell.desc as string[] | undefined) || []
	);

	// Normalize higher_level - can be string or array of strings
	const higherLevelArray = $derived(
		typeof spell.higher_level === 'string'
			? [spell.higher_level]
			: (spell.higher_level as string[] | undefined) || []
	);

	// Combine paragraphs into markdown format
	const descriptionMd = $derived(descriptionArray.join('\n\n'));
	const higherLevelMd = $derived(higherLevelArray.join('\n\n'));

	// Lazy load markdown rendering
	const { SvelteMarkdown } = useLazyMarkdown(() => descriptionMd || higherLevelMd);
</script>

<!-- Spell Details Table -->
<div
	class="mb-8 grid grid-cols-2 gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 md:grid-cols-4"
>
	<div>
		<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Casting Time</div>
		<div class="text-sm text-[var(--color-text-primary)]">{spell.casting_time}</div>
	</div>
	<div>
		<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Range</div>
		<div class="text-sm text-[var(--color-text-primary)]">{spell.range}</div>
	</div>
	<div>
		<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Components</div>
		<div class="text-sm text-[var(--color-text-primary)]">
			{#if Array.isArray(spell.components)}
				{spell.components.join(', ')}
			{:else}
				{spell.components || 'None'}
			{/if}
		</div>
	</div>
	<div>
		<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Duration</div>
		<div class="text-sm text-[var(--color-text-primary)]">{spell.duration}</div>
	</div>
</div>

<!-- Description (Markdown rendered) -->
{#if SvelteMarkdown}
	<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
		<SvelteMarkdown source={descriptionMd} renderers={markdownRenderers} />
	</div>
{:else if descriptionMd}
	<!-- Static fallback for SSR -->
	<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
		<p class="whitespace-pre-wrap">{descriptionMd}</p>
	</div>
{/if}

{#if SvelteMarkdown}
	<div class="mt-6 border-t border-[var(--color-border)] pt-6">
		<h4 class="mb-2 font-bold text-[var(--color-text-primary)]">At Higher Levels</h4>
		<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
			<SvelteMarkdown source={higherLevelMd} renderers={markdownRenderers} />
		</div>
	</div>
{:else if higherLevelMd}
	<div class="mt-6 border-t border-[var(--color-border)] pt-6">
		<h4 class="mb-2 font-bold text-[var(--color-text-primary)]">At Higher Levels</h4>
		<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
			<p class="whitespace-pre-wrap">{higherLevelMd}</p>
		</div>
	</div>
{/if}

<div class="mt-8 font-mono text-xs text-[var(--color-text-muted)]">
	ID: {spell.externalId ?? spell.id ?? spell.index}
</div>
