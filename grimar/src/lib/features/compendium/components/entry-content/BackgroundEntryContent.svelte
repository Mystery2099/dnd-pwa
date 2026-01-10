<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		background: Record<string, unknown> & { externalId?: string };
	}

	let { background }: Props = $props();

	const description = $derived(background.description as string[] | undefined);
	const feature = $derived(background.feature as { name: string; description: string } | undefined);
	const skillProficiencies = $derived(background.skill_proficiencies as string[] | undefined);

	// Combine paragraphs into markdown format
	const descriptionMd = $derived(description ? description.join('\n\n') : '');

	// Lazy load svelte-markdown only when needed
	let SvelteMarkdown: any = $state(null);

	onMount(async () => {
		if (descriptionMd || feature?.description) {
			const module = await import('svelte-markdown');
			SvelteMarkdown = module.default;
		}
	});
</script>

<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
	{#if skillProficiencies && skillProficiencies.length > 0}
		<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
			<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">
				Skill Proficiencies
			</div>
			<div class="text-sm text-[var(--color-text-primary)]">{skillProficiencies.join(', ')}</div>
		</div>
	{/if}

	{#if feature}
		<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
			<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">
				Feature: {feature.name}
			</div>
			{#if SvelteMarkdown}
				<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
					<SvelteMarkdown source={feature.description} />
				</div>
			{:else}
				<div class="text-sm text-[var(--color-text-primary)]">{feature.description}</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Description (Markdown rendered) -->
{#if descriptionMd && SvelteMarkdown}
	<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
		<SvelteMarkdown source={descriptionMd} />
	</div>
{:else if descriptionMd}
	<div class="text-sm whitespace-pre-wrap text-[var(--color-text-secondary)]">
		{descriptionMd}
	</div>
{/if}

<div class="mt-8 font-mono text-xs text-[var(--color-text-muted)]">
	ID: {background.externalId ?? background.id ?? background.index}
</div>
