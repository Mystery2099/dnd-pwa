<script lang="ts">
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();
</script>

<SurfaceCard class="animate-enter p-6">
	<!-- Static Glossy Overlay -->
	<div
		class="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-br from-[color-mix(in_srgb,var(--color-text-primary)_15%,transparent)] to-transparent opacity-60"
	></div>

	<div class="relative z-10">
		<h1 class="text-holo mb-2 text-3xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>
		<p class="text-[var(--color-text-secondary)]">
			Welcome to your Grimoire, <span class="font-semibold text-[var(--color-accent)]"
				>{data.user?.username || 'Traveler'}</span
			>.
		</p>

		<div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			<!-- Example Action Card -->
			<SurfaceCard class="group p-5 hover:scale-[1.02] hover:border-[var(--color-accent)]/30">
				<h3 class="mb-1 text-lg font-bold text-[var(--color-text-primary)]">Character Builder</h3>
				<p class="mb-4 text-sm text-[var(--color-text-muted)]">
					Create a new hero for your next adventure.
				</p>
				<Button class="w-full text-sm">Open Forge</Button>
			</SurfaceCard>

			<!-- Example Stat Panel -->
			<div class="panel-inset flex flex-col items-center justify-center p-5 text-center">
				<div
					class="mb-1 text-xs font-bold tracking-widest text-[var(--color-text-muted)] uppercase"
				>
					Active Session
				</div>
				<div class="text-sm text-[var(--color-text-secondary)]">No active game session found.</div>
			</div>
		</div>
	</div>
</SurfaceCard>
