<script lang="ts">
	import CharacterGrid from '$lib/features/dashboard/components/CharacterGrid.svelte';
	import DashboardActions from '$lib/features/dashboard/components/DashboardActions.svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import { createCharactersQuery } from '$lib/core/client/queries';

	let { data: _data } = $props();

	const charactersQuery = $derived(createCharactersQuery());
	const roster = $derived((charactersQuery.data ?? []) as Array<{ status?: string | null }>);
	const characterCount = $derived(roster.length);
	const activeCount = $derived(
		roster.filter((character) => (character.status ?? '').toLowerCase() === 'active').length
	);
	const draftCount = $derived(
		roster.filter((character) => (character.status ?? '').toLowerCase() === 'draft').length
	);
</script>

<svelte:head>
	<title>Characters | Grimar</title>
</svelte:head>

<div class="min-h-[calc(100vh-6rem)] space-y-6 px-1">
	<section
		class="relative overflow-hidden rounded-[1.85rem] border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_58%,transparent),color-mix(in_srgb,var(--color-bg-overlay)_10%,transparent))] p-5 shadow-[0_0.75rem_1.8rem_color-mix(in_srgb,var(--color-shadow)_9%,transparent)] md:p-6"
	>
		<div
			class="absolute inset-y-0 right-0 w-[32%] bg-[linear-gradient(120deg,transparent,color-mix(in_srgb,var(--color-accent)_5%,transparent),transparent)] opacity-45"
		></div>
		<div class="relative grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(16rem,0.95fr)] xl:items-end">
			<div>
				<div class="flex flex-wrap items-center gap-3">
					<p
						class="text-[0.68rem] font-medium tracking-[0.24em] text-[var(--color-text-muted)] uppercase"
					>
						Roster Ledger
					</p>
					<span
						class="rounded-full border border-[color-mix(in_srgb,var(--color-border)_82%,var(--color-accent))] bg-[color-mix(in_srgb,var(--color-bg-card)_54%,transparent)] px-2.5 py-1 text-[0.65rem] tracking-[0.2em] text-[color-mix(in_srgb,var(--color-text-primary)_64%,var(--color-text-muted))] uppercase"
					>
						{characterCount} registered
					</span>
				</div>
				<h2
					class="mt-3 max-w-4xl text-[2rem] leading-[1.02] font-black tracking-tight text-[var(--color-text-primary)] md:text-[2.5rem]"
				>
					Keep every hero, draft, and party-ready build in one faster roster.
				</h2>
				<p
					class="mt-3 max-w-3xl text-sm leading-6 text-[color-mix(in_srgb,var(--color-text-primary)_72%,var(--color-text-secondary))] md:text-base"
				>
					Track active adventurers, keep unfinished builds in circulation, and jump into the forge
					without losing the shape of your campaign bench.
				</p>
			</div>

			<div class="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
				<div
					class="rounded-[1.35rem] border border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_26%,transparent)] px-4 py-3.5"
				>
					<p
						class="text-[0.64rem] font-medium tracking-[0.2em] text-[var(--color-text-muted)] uppercase"
					>
						Total Characters
					</p>
					<p class="mt-1.5 text-[1.7rem] leading-none font-black text-[var(--color-text-primary)]">
						{characterCount}
					</p>
				</div>
				<div
					class="rounded-[1.35rem] border border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_26%,transparent)] px-4 py-3.5"
				>
					<p
						class="text-[0.64rem] font-medium tracking-[0.2em] text-[var(--color-text-muted)] uppercase"
					>
						Active
					</p>
					<p class="mt-1.5 text-[1.7rem] leading-none font-black text-[var(--color-text-primary)]">
						{activeCount}
					</p>
				</div>
				<div
					class="rounded-[1.35rem] border border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_26%,transparent)] px-4 py-3.5"
				>
					<p
						class="text-[0.64rem] font-medium tracking-[0.2em] text-[var(--color-text-muted)] uppercase"
					>
						Drafts
					</p>
					<p class="mt-1.5 text-[1.7rem] leading-none font-black text-[var(--color-text-primary)]">
						{draftCount}
					</p>
				</div>
			</div>
		</div>
	</section>

	<SurfaceCard
		padding="p-5 md:p-6"
		class="border-[color-mix(in_srgb,var(--color-border)_86%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_80%,transparent),color-mix(in_srgb,var(--color-bg-primary)_94%,transparent))] shadow-[0_0.9rem_2rem_color-mix(in_srgb,var(--color-shadow)_10%,transparent)]"
	>
		{#if charactersQuery.isPending}
			<div class="flex items-center justify-center py-12">
				<div class="text-[var(--color-text-muted)]">Loading characters...</div>
			</div>
		{:else if charactersQuery.isError}
			<div class="flex items-center justify-center py-12">
				<div class="text-red-400">
					{charactersQuery.error instanceof Error ? charactersQuery.error.message : 'Unknown error'}
				</div>
			</div>
		{:else if charactersQuery.data.length === 0}
			<DashboardActions />
		{:else}
			<CharacterGrid characters={charactersQuery.data} />
		{/if}
	</SurfaceCard>
</div>
