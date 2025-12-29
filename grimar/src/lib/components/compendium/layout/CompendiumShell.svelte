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
	<!-- Sidebar: Obsidian Surface -->
	<aside
		class="z-10 flex w-full shrink-0 flex-col overflow-hidden border-b border-white/10 bg-indigo-950/40 backdrop-blur-md lg:w-[350px] lg:border-r lg:border-b-0"
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
