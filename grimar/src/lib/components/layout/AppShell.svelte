<script lang="ts">
	import type { Snippet } from 'svelte';
	import TopBar from '$lib/components/layout/TopBar.svelte';
	import VerticalNav from '$lib/components/layout/VerticalNav.svelte';

	type ShellUser = {
		username: string;
		name: string;
		email: string | null;
		role: 'user' | 'admin';
	} | null;

	type Props = {
		children: Snippet;
		user?: ShellUser;
	};

	let { children, user = null }: Props = $props();
	let sidebarCollapsed = $state(false);
	const collapsedSidebarWidth = '64px';
	const expandedSidebarWidth = '220px';
	const sidebarOffset = $derived(sidebarCollapsed ? '67px' : '223px');
	const sidebarWidth = $derived(sidebarCollapsed ? collapsedSidebarWidth : expandedSidebarWidth);
</script>

<div
	class="relative flex h-screen bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)] selection:bg-[var(--color-accent)]/30"
>
	<div class="pointer-events-none fixed inset-0 overflow-hidden">
		<div
			class="absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--color-bg-overlay)_58%,transparent),transparent_48%),linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-canvas)_86%,black),var(--color-bg-canvas))]"
		></div>
		<div
			class="absolute inset-0 opacity-[var(--noise-opacity)]"
			style="background-image:
				repeating-linear-gradient(115deg, color-mix(in_srgb, var(--color-text-primary) 0.045, transparent) 0 1px, transparent 1px 22px),
				repeating-linear-gradient(0deg, color-mix(in_srgb, black 0.14, transparent) 0 2px, transparent 2px 18px),
				radial-gradient(circle at 20% 16%, color-mix(in_srgb, var(--color-accent) 0.16, transparent), transparent 22%),
				radial-gradient(circle at 78% 12%, color-mix(in_srgb, var(--color-text-primary) 0.08, transparent), transparent 18%);
			background-size: auto, auto, auto, auto;"
		></div>
		<div
			class="absolute inset-y-0 left-[max(14rem,18vw)] w-px bg-[linear-gradient(180deg,transparent,color-mix(in_srgb,var(--color-border)_72%,transparent),transparent)] opacity-70"
		></div>
	</div>

	<!-- Left Rail (thin decorative bar) -->
	<div
		class="fixed top-0 bottom-0 left-0 z-60 w-3 border-r border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-overlay)_28%,var(--color-bg-canvas))]"
	></div>

	<!-- Sidebar -->
	<aside
		class="fixed top-0 bottom-0 left-3 z-50 flex flex-col transition-[width] duration-300 ease-[var(--ease-smooth)]"
		style="width: {sidebarWidth};"
	>
		<VerticalNav bind:collapsed={sidebarCollapsed} {user} />
	</aside>

	<!-- Right Rail (thin decorative bar) -->
	<div
		class="fixed top-0 right-0 bottom-0 z-60 w-3 border-l border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-overlay)_28%,var(--color-bg-canvas))]"
	></div>

	<!-- Bottom Rail -->
	<div
		class="fixed right-0 bottom-0 left-0 z-60 h-3 border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-overlay)_28%,var(--color-bg-canvas))]"
	>
		<!-- Corner Connectors (Visual Only) -->
		<div
			class="absolute bottom-0 left-0 h-full w-4 border-r border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-overlay)_28%,var(--color-bg-canvas))]"
		></div>
		<div
			class="absolute right-0 bottom-0 h-full w-4 border-l border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-overlay)_28%,var(--color-bg-canvas))]"
		></div>
	</div>

	<!-- Main Content Area -->
	<main
		class="relative flex-1 overflow-y-auto bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-canvas)_86%,transparent),color-mix(in_srgb,var(--color-bg-overlay)_10%,transparent))] pb-16 transition-[margin-left] duration-300 ease-[var(--ease-smooth)]"
		style="margin-left: {sidebarOffset}; margin-right: 12px;"
	>
		<TopBar />
		<div class="mx-auto max-w-5xl px-3 pt-6">
			{@render children()}
		</div>
	</main>
</div>
