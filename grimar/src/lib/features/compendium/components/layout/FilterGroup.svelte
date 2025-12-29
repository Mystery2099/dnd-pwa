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

<div class="border-b border-[var(--color-border)] last:border-0">
	<button
		class="group flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold text-[var(--color-text-secondary)] transition-all hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]"
		onclick={() => (open = !open)}
	>
		<span>{title}</span>
		{#if open}
			<ChevronDown
				class="size-4 text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-text-secondary)]"
			/>
		{:else}
			<ChevronRight
				class="size-4 text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-text-secondary)]"
			/>
		{/if}
	</button>

	{#if open}
		<div class="px-4 pb-4" transition:slide={{ duration: 200 }}>
			{@render children()}
		</div>
	{/if}
</div>
