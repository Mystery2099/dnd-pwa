<script lang="ts">
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
</script>

<div class="flex min-h-[80vh] items-center justify-center p-4">
	<SurfaceCard class="max-w-md bg-[var(--color-bg-card)] p-8 text-center">
		<h1
			class="text-holo mb-4 text-4xl font-black tracking-tighter text-[var(--color-text-primary)]"
		>
			Grimar
		</h1>
		<p class="mb-8 leading-relaxed text-[var(--color-text-secondary)]">
			Welcome to the Digital Grimoire. Inscribe your heroes, study the arcane, and manage your
			adventures in a self-hosted, offline-capable environment.
		</p>

		<a
			href="/dashboard"
			class="btn-gem px-8 py-3 text-lg"
			onclick={(e) => {
				// Handle navigation with proper SvelteKit routing
				const target = e.currentTarget as HTMLAnchorElement;
				const url = new URL(target.href, window.location.origin);
				if (window.location.pathname !== url.pathname) {
					import('$app/navigation').then(({ goto }) => {
						goto(url.pathname).catch(() => {});
					});
				}
				e.preventDefault();
			}}
		>
			Enter the Archives
		</a>
	</SurfaceCard>
</div>
