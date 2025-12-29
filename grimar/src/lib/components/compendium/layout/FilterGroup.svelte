<script lang="ts">
	import { ChevronDown, ChevronRight } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { type Snippet } from 'svelte';

	interface Props {
		title: string;
		open?: boolean;
		children: Snippet;
	}

	let { title, open = $bindable(true), children }: Props = $props();
</script>

<div class="border-b border-white/5 last:border-0">
	<button
		class="group flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold text-gray-300 transition-all hover:bg-linear-to-br hover:from-white/8 hover:to-white/2 hover:text-white"
		onclick={() => (open = !open)}
	>
		<span>{title}</span>
		{#if open}
			<ChevronDown class="size-4 text-gray-500 transition-colors group-hover:text-gray-400" />
		{:else}
			<ChevronRight class="size-4 text-gray-500 transition-colors group-hover:text-gray-400" />
		{/if}
	</button>

	{#if open}
		<div class="px-4 pb-4" transition:slide={{ duration: 200 }}>
			{@render children()}
		</div>
	{/if}
</div>
