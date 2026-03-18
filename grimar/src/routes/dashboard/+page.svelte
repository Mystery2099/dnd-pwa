<script lang="ts">
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Dashboard | Grimar</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between gap-4 px-1">
		<p class="text-sm text-[var(--color-text-secondary)]">
			Welcome back, <span class="font-semibold text-[var(--color-accent)]"
				>{data.user?.username || 'Traveler'}</span
			>.
		</p>
		<div class="text-[0.68rem] font-semibold tracking-[0.24em] text-[var(--color-text-muted)] uppercase">
			Grimoire Overview
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		<SurfaceCard class="group p-5 hover:scale-[1.02] hover:border-[var(--color-accent)]/30">
			<h2 class="mb-1 text-lg font-bold text-[var(--color-text-primary)]">Character Builder</h2>
			<p class="mb-4 text-sm text-[var(--color-text-muted)]">
				Create a new hero for your next adventure.
			</p>
			<Button class="w-full text-sm">Open Forge</Button>
		</SurfaceCard>

		<div class="panel-inset flex flex-col items-center justify-center p-5 text-center">
			<div class="mb-1 text-xs font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
				Active Session
			</div>
			<div class="text-sm text-[var(--color-text-secondary)]">No active game session found.</div>
		</div>
	</div>
</div>
