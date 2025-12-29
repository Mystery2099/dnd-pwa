<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		classData: Record<string, unknown> & { externalId?: string };
	}

	let { classData }: Props = $props();

	const description = $derived(classData.description as string[] | undefined);
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
	<div class="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
		<div class="text-xs font-bold text-gray-500 uppercase">Hit Die</div>
		<div class="mt-1 text-2xl font-bold text-white">d{hitDie || 8}</div>
	</div>

	<div class="rounded-xl border border-white/10 bg-white/5 p-4 md:col-span-2">
		<div class="mb-1 text-xs font-bold text-gray-500 uppercase">Proficiencies</div>
		<div class="flex flex-wrap gap-2 pt-1">
			{#if proficiencies}
				{#each proficiencies as p}
					<span class="rounded bg-white/10 px-2 py-0.5 text-xs text-gray-200">{p.name}</span>
				{/each}
			{/if}
		</div>
		{#if savingThrows}
			<div class="mt-3 flex items-center gap-2">
				<span class="text-xs font-bold text-gray-500 uppercase">Saves:</span>
				{#each savingThrows as s}
					<span class="text-xs font-medium text-purple-300">{s.name}</span>
				{/each}
			</div>
		{/if}
	</div>
</div>

{#if spellcasting}
	<div class="mb-8 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
		<div class="mb-2 flex items-center gap-2">
			<span class="text-xs font-bold text-blue-400 uppercase">Spellcasting</span>
			<span class="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
			<span class="text-xs text-blue-300">Level {spellcasting.level}</span>
		</div>
		<div class="text-sm text-gray-300">
			Uses <span class="font-bold text-white">{(spellcasting.ability as any)?.name}</span> as
			spellcasting ability. DC <span class="font-bold text-white">{spellcasting.dc}</span>, Modifier
			<span class="font-bold text-white">+{spellcasting.mod}</span>.
		</div>
	</div>
{/if}

<!-- Description (Markdown rendered) -->
{#if descriptionMd && SvelteMarkdown}
	<div class="prose prose-sm max-w-none text-gray-300 prose-invert">
		<SvelteMarkdown source={descriptionMd} />
	</div>
{:else if descriptionMd}
	<div class="text-sm whitespace-pre-wrap text-gray-300">
		{descriptionMd}
	</div>
{/if}

<div class="mt-8 font-mono text-xs text-gray-600">
	ID: {classData.externalId ?? classData.id ?? classData.index}
</div>
