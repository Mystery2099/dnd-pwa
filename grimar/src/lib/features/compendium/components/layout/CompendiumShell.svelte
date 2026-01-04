<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		sidebar: Snippet;
		children: Snippet;
	}

	let { sidebar, children }: Props = $props();
</script>

<div class="flex h-full min-h-0 flex-col overflow-hidden lg:flex-row">
	<!-- Sidebar: 3D Panel with floating effect -->
	<aside
		class="panel-3d z-10 flex w-full shrink-0 flex-col overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-bg-card)] backdrop-blur-md lg:w-[320px]"
	>
		{@render sidebar()}
	</aside>

	<!-- Content: Fixed container, only entries list scrolls -->
	<main class="relative min-w-0 flex-1 overflow-hidden p-4 lg:p-6">
		{@render children()}
	</main>
</div>
