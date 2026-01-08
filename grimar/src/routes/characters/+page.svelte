<script lang="ts">
	import CharacterGrid from '$lib/features/dashboard/components/CharacterGrid.svelte';
	import DashboardActions from '$lib/features/dashboard/components/DashboardActions.svelte';
	import { createCharactersQuery } from '$lib/core/client/queries';
	import CompendiumLoading from '$lib/features/compendium/components/ui/CompendiumLoading.svelte';
	import CompendiumError from '$lib/features/compendium/components/ui/CompendiumError.svelte';

	let { data: _data } = $props();

	// TanStack Query for characters (server-first, NetworkOnly)
	const charactersQuery = $derived(createCharactersQuery());
</script>

<div class="relative min-h-[calc(100vh-6rem)]">
	<!-- Header Area -->
	<div class="mb-8">
		<div>
			<h1 class="text-holo mb-1 text-3xl font-bold text-[var(--color-text-primary)]">
				My Characters
			</h1>
			<p class="text-sm text-[var(--color-text-muted)]">Manage your heroes and adventurers.</p>
		</div>
	</div>

	<!-- Content -->
	{#if charactersQuery.isPending}
		<CompendiumLoading message="Loading characters..." subtext="Fetching from server" />
	{:else if charactersQuery.isError}
		<CompendiumError
			message={charactersQuery.error instanceof Error
				? charactersQuery.error.message
				: 'Unknown error'}
		/>
	{:else if charactersQuery.data.length === 0}
		<DashboardActions />
	{:else}
		<CharacterGrid characters={charactersQuery.data} />
	{/if}
</div>
