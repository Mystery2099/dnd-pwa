<script lang="ts">
	import CharacterGrid from '$lib/features/dashboard/components/CharacterGrid.svelte';
	import DashboardActions from '$lib/features/dashboard/components/DashboardActions.svelte';

	let { data } = $props();
</script>

<div class="relative min-h-[calc(100vh-6rem)]">
	<!-- Header Area -->
	<div class="mb-8">
		<div>
			<h1 class="text-holo mb-1 text-3xl font-bold text-white">My Characters</h1>
			<p class="text-sm text-gray-400">Manage your heroes and adventurers.</p>
		</div>
	</div>

	<!-- Content -->
	{#if data.characters.length === 0}
		<DashboardActions />
	{:else}
		<CharacterGrid characters={data.characters} />
	{/if}
</div>
