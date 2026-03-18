<script lang="ts">
	import type { Snippet } from 'svelte';
	import VerticalNav from '$lib/components/layout/VerticalNav.svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
	let sidebarCollapsed = $state(false);
</script>

<div
	class="relative flex h-screen text-[var(--color-text-primary)] selection:bg-[var(--color-accent)]/30"
>
	<!-- Left Rail (thin decorative bar) -->
	<div
		class="fixed top-0 bottom-0 left-0 z-60 w-3 border-r border-[var(--color-border)] bg-[var(--color-bg-tertiary)] shadow-[2px_0_15px_color-mix(in_srgb,black_50%,transparent)] backdrop-blur-2xl"
	></div>

	<!-- Sidebar -->
	<aside class="fixed top-0 bottom-0 left-3 z-50 flex flex-col">
		<VerticalNav bind:collapsed={sidebarCollapsed} />
	</aside>

	<!-- Right Rail (thin decorative bar) -->
	<div
		class="fixed top-0 right-0 bottom-0 z-60 w-3 border-l border-[var(--color-border)] bg-[var(--color-bg-tertiary)] shadow-[-2px_0_15px_color-mix(in_srgb,black_50%,transparent)] backdrop-blur-2xl"
	></div>

	<!-- Bottom Rail -->
	<div
		class="fixed right-0 bottom-0 left-0 z-60 h-3 border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)] shadow-[0_-2px_15px_color-mix(in_srgb,black_50%,transparent)] backdrop-blur-2xl"
	>
		<!-- Corner Connectors (Visual Only) -->
		<div
			class="absolute bottom-0 left-0 h-full w-4 border-r border-[var(--color-border)] bg-[var(--color-bg-tertiary)]"
		></div>
		<div
			class="absolute right-0 bottom-0 h-full w-4 border-l border-[var(--color-border)] bg-[var(--color-bg-tertiary)]"
		></div>
	</div>

	<!-- Main Content Area -->
	<main
		class="flex-1 overflow-y-auto pl-3 pt-4 pb-16 pr-3"
		style="margin-left: {sidebarCollapsed ? '67px' : '223px'}; margin-right: 12px;"
	>
		<div class="mx-auto max-w-5xl">
			{@render children()}
		</div>
	</main>
</div>