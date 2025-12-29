<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		sidebar: Snippet;
		children: Snippet;
	}

	let { sidebar, children }: Props = $props();
	let mainElement = $state<HTMLElement>();

	$effect(() => {
		// Dependency on url to trigger scroll reset
		if (mainElement) {
			mainElement.scrollTop = 0;
		}
	});
</script>

<div class="flex h-[calc(100vh-6rem)] flex-col overflow-hidden lg:flex-row">
	<!-- Sidebar: 3D Panel with floating effect -->
	<aside
		class="panel-3d z-10 flex w-full shrink-0 flex-col overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-bg-card)] backdrop-blur-md lg:w-[320px]"
	>
		{@render sidebar()}
	</aside>

	<!-- Content: Deep Weave Background (Transparent, relies on global bg) -->
	<main
		bind:this={mainElement}
		class="glass-scroll relative min-w-0 flex-1 overflow-y-auto p-4 lg:p-6"
	>
		{@render children()}
	</main>
</div>
