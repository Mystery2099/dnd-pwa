<script lang="ts">
	import { Plus } from 'lucide-svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
</script>

<div class="px-4 py-16 text-center">
	<SurfaceCard class="mx-auto inline-block max-w-md p-8 backdrop-blur-xl">
		<div
			class="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-br from-[color-mix(in_srgb,var(--color-text-primary)_12%,transparent)] to-transparent opacity-50"
		></div>
		<h2 class="text-holo mb-2 text-2xl font-bold text-[var(--color-text-primary)]">
			The Forge Awaits
		</h2>
		<p class="mb-8 leading-relaxed text-[var(--color-text-muted)]">
			You have no characters inscribed in your Grimoire yet. Create a new hero to begin your
			journey.
		</p>
		<Button href="/forge" size="lg">
			<Plus class="size-5" />
			<span>Create New Character</span>
		</Button>
	</SurfaceCard>
</div>
