<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		details: Record<string, unknown>;
	}

	let { details }: Props = $props();

	const desc = details.desc as string[] | string | undefined;
	const descriptionMd = $derived(Array.isArray(desc) ? desc.join('\n\n') : desc || '');
	const feature = details.feature as { name?: string; desc?: string } | undefined;

	let SvelteMarkdown: any = $state(null);

	onMount(async () => {
		if (descriptionMd || feature?.desc) {
			const module = await import('svelte-markdown');
			SvelteMarkdown = module.default;
		}
	});
</script>

<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
	{#if details.skill_proficiencies && Array.isArray(details.skill_proficiencies) && details.skill_proficiencies.length > 0}
		<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
			<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">
				Skill Proficiencies
			</div>
			<div class="text-sm text-[var(--color-text-primary)]">
				{(details.skill_proficiencies as string[]).join(', ')}
			</div>
		</div>
	{/if}

	{#if details.tool_proficiencies && Array.isArray(details.tool_proficiencies) && details.tool_proficiencies.length > 0}
		<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
			<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">
				Tool Proficiencies
			</div>
			<div class="text-sm text-[var(--color-text-primary)]">
				{(details.tool_proficiencies as string[]).join(', ')}
			</div>
		</div>
	{/if}

	{#if details.languages}
		<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
			<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Languages</div>
			<div class="text-sm text-[var(--color-text-primary)]">{details.languages}</div>
		</div>
	{/if}

	{#if details.equipment && Array.isArray(details.equipment) && details.equipment.length > 0}
		<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
			<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Equipment</div>
			<div class="text-sm text-[var(--color-text-primary)]">
				{(details.equipment as string[]).join(', ')}
			</div>
		</div>
	{/if}
</div>

{#if feature}
	<div class="mb-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
		<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">
			Feature: {feature.name ?? 'Unknown'}
		</div>
		{#if SvelteMarkdown && feature.desc}
			<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
				<SvelteMarkdown source={feature.desc} />
			</div>
		{:else if feature.desc}
			<div class="text-sm text-[var(--color-text-primary)]">{feature.desc}</div>
		{/if}
	</div>
{/if}

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
	ID: {details.slug ?? details.id ?? 'Unknown'}
</div>
