<script lang="ts">
	import CharacterGrid from '$lib/features/dashboard/components/CharacterGrid.svelte';
	import DashboardActions from '$lib/features/dashboard/components/DashboardActions.svelte';
	import { createCharactersQuery } from '$lib/core/client/queries';

	let { data: _data } = $props();

	const charactersQuery = $derived(createCharactersQuery());
</script>

<div class="relative min-h-[calc(100vh-6rem)]">
	<div class="mb-8">
		<div>
			<h1 class="text-holo mb-1 text-3xl font-bold text-[var(--color-text-primary)]">
				My Characters
			</h1>
			<p class="text-sm text-[var(--color-text-muted)]">Manage your heroes and adventurers.</p>
		</div>
	</div>

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
</div>
