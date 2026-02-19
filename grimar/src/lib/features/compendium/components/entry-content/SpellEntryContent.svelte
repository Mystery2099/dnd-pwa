<script lang="ts">
	import {
		markdownRenderers,
		useLazyMarkdown
	} from '$lib/features/compendium/utils/markdown.svelte';

	interface Props {
		details: Record<string, unknown>;
	}

	let { details }: Props = $props();

	const desc = details.desc as string[] | string | undefined;
	const descriptionMd = $derived(Array.isArray(desc) ? desc.join('\n\n') : desc || '');
	const higherLevelMd = $derived(details.higher_level as string | undefined);

	const { SvelteMarkdown } = useLazyMarkdown(() => descriptionMd || higherLevelMd || '');
</script>

<div
	class="mb-8 grid grid-cols-2 gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 md:grid-cols-4"
>
	<div>
		<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Casting Time</div>
		<div class="text-sm text-[var(--color-text-primary)]">{details.casting_time ?? 'Unknown'}</div>
	</div>
	<div>
		<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Range</div>
		<div class="text-sm text-[var(--color-text-primary)]">{details.range ?? 'Unknown'}</div>
	</div>
	<div>
		<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Components</div>
		<div class="text-sm text-[var(--color-text-primary)]">
			{Array.isArray(details.components) ? details.components.join(', ') : details.components ?? 'None'}
		</div>
	</div>
	<div>
		<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Duration</div>
		<div class="text-sm text-[var(--color-text-primary)]">{details.duration ?? 'Unknown'}</div>
	</div>
</div>

<div
	class="mb-8 grid grid-cols-2 gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 md:grid-cols-4"
>
	<div>
		<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Level</div>
		<div class="text-sm text-[var(--color-text-primary)]">
			{details.level === 0 ? 'Cantrip' : details.level ?? 'Unknown'}
		</div>
	</div>
	<div>
		<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">School</div>
		<div class="text-sm text-[var(--color-text-primary)]">{details.school ?? 'Unknown'}</div>
	</div>
	<div>
		<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Concentration</div>
		<div class="text-sm text-[var(--color-text-primary)]">
			{details.concentration ? 'Yes' : 'No'}
		</div>
	</div>
	<div>
		<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Ritual</div>
		<div class="text-sm text-[var(--color-text-primary)]">{details.ritual ? 'Yes' : 'No'}</div>
	</div>
</div>

{#if details.material}
	<div class="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
		<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">
			Material Components
		</div>
		<div class="text-sm text-[var(--color-text-primary)]">{details.material}</div>
	</div>
{/if}

{#if details.classes && Array.isArray(details.classes) && details.classes.length}
	<div class="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
		<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Classes</div>
		<div class="text-sm text-[var(--color-text-primary)]">{details.classes.join(', ')}</div>
	</div>
{/if}

{#if SvelteMarkdown}
	<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
		<SvelteMarkdown source={descriptionMd} renderers={markdownRenderers} />
	</div>
{:else if descriptionMd}
	<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
		<p class="whitespace-pre-wrap">{descriptionMd}</p>
	</div>
{/if}

{#if higherLevelMd}
	{#if SvelteMarkdown}
		<div class="mt-6 border-t border-[var(--color-border)] pt-6">
			<h4 class="mb-2 font-bold text-[var(--color-text-primary)]">At Higher Levels</h4>
			<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
				<SvelteMarkdown source={higherLevelMd} renderers={markdownRenderers} />
			</div>
		</div>
	{:else}
		<div class="mt-6 border-t border-[var(--color-border)] pt-6">
			<h4 class="mb-2 font-bold text-[var(--color-text-primary)]">At Higher Levels</h4>
			<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
				<p class="whitespace-pre-wrap">{higherLevelMd}</p>
			</div>
		</div>
	{/if}
{/if}

<div class="mt-8 font-mono text-xs text-[var(--color-text-muted)]">
	ID: {details.slug ?? details.id ?? 'Unknown'}
</div>
