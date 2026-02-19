<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		details: Record<string, unknown>;
	}

	let { details }: Props = $props();

	const desc = details.desc as string[] | string | undefined;
	const descriptionMd = $derived(Array.isArray(desc) ? desc.join('\n\n') : desc || '');
	const benefitsMd = $derived(
		Array.isArray(details.benefits) ? (details.benefits as string[]).join('\n\n') : ''
	);

	let SvelteMarkdown: any = $state(null);

	onMount(async () => {
		if (descriptionMd || benefitsMd) {
			const module = await import('svelte-markdown');
			SvelteMarkdown = module.default;
		}
	});
</script>

{#if details.prerequisites && Array.isArray(details.prerequisites) && details.prerequisites.length > 0}
	<div class="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
		<div class="text-xs font-bold text-[var(--color-text-muted)] uppercase">Prerequisites</div>
		<div class="mt-1 text-sm text-[var(--color-text-primary)]">
			{(details.prerequisites as string[]).join(', ')}
		</div>
	</div>
{/if}

{#if descriptionMd && SvelteMarkdown}
	<div class="prose prose-sm max-w-none text-[var(--color-text-secondary)] prose-invert">
		<SvelteMarkdown source={descriptionMd} />
	</div>
{:else if descriptionMd}
	<div class="text-sm whitespace-pre-wrap text-[var(--color-text-secondary)]">
		{descriptionMd}
	</div>
{/if}

{#if benefitsMd && SvelteMarkdown}
	<div class="mt-6 border-t border-[var(--color-border)] pt-6">
		<h4 class="mb-2 font-bold text-[var(--color-text-primary)]">Benefits</h4>
		<div class="prose prose-sm max-w-none text-[var(--color-text-secondary)] prose-invert">
			<SvelteMarkdown source={benefitsMd} />
		</div>
	</div>
{:else if benefitsMd}
	<div class="mt-6 border-t border-[var(--color-border)] pt-6">
		<h4 class="mb-2 font-bold text-[var(--color-text-primary)]">Benefits</h4>
		<div class="text-sm whitespace-pre-wrap text-[var(--color-text-secondary)]">
			{benefitsMd}
		</div>
	</div>
{/if}

<div class="mt-8 font-mono text-xs text-[var(--color-text-muted)]">
	ID: {details.slug ?? details.id ?? 'Unknown'}
</div>
