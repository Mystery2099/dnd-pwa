<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
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

		<Button href="/dashboard" variant="primary" size="lg">Enter the Archives</Button>
	</SurfaceCard>
</div>
