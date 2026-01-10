<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		classData: Record<string, unknown> & { externalId?: string };
	}

	let { classData }: Props = $props();

	// Handle both array and string descriptions defensively
	const rawDescription = $derived(classData.description as string[] | string | undefined);
	const description = $derived(
		Array.isArray(rawDescription) ? rawDescription : rawDescription ? [rawDescription] : undefined
	);
	const hitDie = $derived(classData.hit_die as number | undefined);
	const proficiencies = $derived(
		classData.proficiencies as Array<{ index: string; name: string }> | undefined
	);
	const savingThrows = $derived(
		classData.saving_throws as Array<{ index: string; name: string }> | undefined
	);
	const spellcasting = $derived(classData.spellcasting as Record<string, unknown> | undefined);

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

<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
	<div
		class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 text-center"
	>
		<div class="text-xs font-bold text-[var(--color-text-muted)] uppercase">Hit Die</div>
		<div class="mt-1 text-2xl font-bold text-[var(--color-text-primary)]">d{hitDie || 8}</div>
	</div>

	<div
		class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 md:col-span-2"
	>
		<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Proficiencies</div>
		<div class="flex flex-wrap gap-2 pt-1">
			{#if proficiencies}
				{#each proficiencies as p (p.index)}
					<span
						class="rounded bg-[var(--color-bg-card)] px-2 py-0.5 text-xs text-[var(--color-text-primary)]"
						>{p.name}</span
					>
				{/each}
			{/if}
		</div>
		{#if savingThrows}
			<div class="mt-3 flex items-center gap-2">
				<span class="text-xs font-bold text-[var(--color-text-muted)] uppercase">Saves:</span>
				{#each savingThrows as s (s.index)}
					<span class="text-xs font-medium text-[var(--color-accent)]">{s.name}</span>
				{/each}
			</div>
		{/if}
	</div>
</div>

{#if spellcasting}
	<div
		class="mb-8 rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 p-4"
	>
		<div class="mb-2 flex items-center gap-2">
			<span class="text-xs font-bold text-[var(--color-accent)] uppercase">Spellcasting</span>
			<span class="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]"></span>
			<span class="text-xs text-[var(--color-text-secondary)]">Level {spellcasting.level}</span>
		</div>
		<div class="text-sm text-[var(--color-text-secondary)]">
			Uses <span class="font-bold text-[var(--color-text-primary)]"
				>{(spellcasting.ability as any)?.name}</span
			>
			as spellcasting ability. DC
			<span class="font-bold text-[var(--color-text-primary)]">{spellcasting.dc}</span>, Modifier
			<span class="font-bold text-[var(--color-text-primary)]">+{spellcasting.mod}</span>.
		</div>
	</div>
{/if}

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
	ID: {classData.externalId ?? classData.id ?? classData.index}
</div>
