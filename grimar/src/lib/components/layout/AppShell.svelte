<script lang="ts">
	import type { Snippet } from 'svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';

	type Props = {
		header?: Snippet;
		nav?: Snippet;
		children: Snippet;
	};

	let { header, nav, children }: Props = $props();
</script>

<div
	class="relative min-h-dvh text-[var(--color-text-primary)] selection:bg-[var(--color-accent)]/30"
>
	<!-- THE OBSIDIAN FRAME -->
	<!-- Common Frame Styles: bg-indigo-950/60 backdrop-blur-2xl border-[var(--color-border)] -->

	<!-- Left Rail -->
	<div
		class="fixed top-0 bottom-0 left-0 z-60 w-3 border-r border-[var(--color-border)] bg-[var(--color-bg-tertiary)] shadow-[2px_0_15px_color-mix(in_srgb,black_50%,transparent)] backdrop-blur-2xl md:w-4"
	></div>

	<!-- Right Rail -->
	<div
		class="fixed top-0 right-0 bottom-0 z-60 w-3 border-l border-[var(--color-border)] bg-[var(--color-bg-tertiary)] shadow-[-2px_0_15px_color-mix(in_srgb,black_50%,transparent)] backdrop-blur-2xl md:w-4"
	></div>

	<!-- Bottom Rail -->
	<div
		class="fixed right-0 bottom-0 left-0 z-60 h-3 border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)] shadow-[0_-2px_15px_color-mix(in_srgb,black_50%,transparent)] backdrop-blur-2xl md:h-4"
	>
		<!-- Corner Connectors (Visual Only) -->
		<div
			class="absolute bottom-0 left-0 h-full w-4 border-r border-[var(--color-border)] bg-[var(--color-bg-tertiary)]"
		></div>
		<div
			class="absolute right-0 bottom-0 h-full w-4 border-l border-[var(--color-border)] bg-[var(--color-bg-tertiary)]"
		></div>
	</div>

	<!-- Sticky Header (Top Frame) -->
	<!-- z-[70] to sit ABOVE the side rails. Full width (no mx) to act as the top frame bar. -->
	<div
		class="sticky top-0 z-70 border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)] shadow-[0_4px_30px_color-mix(in_srgb,black_50%,transparent)] backdrop-blur-2xl"
	>
		<div class="mx-auto max-w-375 px-3 py-3 sm:px-4">
			{#if header}
				{@render header()}
			{/if}
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="mx-auto max-w-375 px-3 py-4 pb-16 sm:px-4 sm:py-6 lg:px-8">
		<div class="grid gap-6 lg:grid-cols-[260px_1fr]">
			<!-- Sidebar (Obsidian Glass) -->
			<aside class="hidden lg:block">
				<SurfaceCard
					class="sticky top-24 border border-[var(--color-border)] bg-[color-mix(in_srgb,black_20%,var(--color-bg-card))] p-4"
				>
					{#if nav}
						{@render nav()}
					{/if}
				</SurfaceCard>
			</aside>

			<!-- Page Content -->
			<main class="min-w-0">
				{@render children()}
			</main>
		</div>
	</div>
</div>
