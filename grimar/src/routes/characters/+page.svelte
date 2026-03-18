<script lang="ts">
	import CharacterGrid from '$lib/features/dashboard/components/CharacterGrid.svelte';
	import DashboardActions from '$lib/features/dashboard/components/DashboardActions.svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import { createCharactersQuery } from '$lib/core/client/queries';

	let { data: _data } = $props();

	const charactersQuery = $derived(createCharactersQuery());
</script>

<svelte:head>
	<title>Characters | Grimar</title>
</svelte:head>

<div class="min-h-[calc(100vh-6rem)] space-y-4 px-1">
	<div class="flex items-center justify-between gap-4">
		<p class="text-sm text-[var(--color-text-secondary)]">Manage your heroes and adventurers.</p>
		<div class="text-[0.68rem] font-semibold tracking-[0.24em] text-[var(--color-text-muted)] uppercase">
			Roster
		</div>
	</div>

	<SurfaceCard padding="p-6 md:p-8">
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
