<script lang="ts">
	import type { Snippet } from 'svelte';
	import SurfaceCard from './SurfaceCard.svelte';

	interface Props {
		title: string;
		description?: string;
		class?: string;
		centered?: boolean;
		children?: Snippet;
	}

	let { title, description, class: className = '', centered = false, children }: Props = $props();
</script>

<SurfaceCard
	padding="p-6 md:p-8"
	class={centered
		? `flex min-h-[60vh] flex-col items-center justify-center text-center ${className}`
		: className}
>
	<h1 class="text-holo mb-2 text-3xl font-bold tracking-tight">
		{title}
	</h1>
	{#if description}
		<p class="mb-6 text-[var(--color-text-secondary)]">
			{description}
		</p>
	{/if}
	<div class="w-full">
		{#if children}
			{@render children()}
		{/if}
	</div>
</SurfaceCard>
