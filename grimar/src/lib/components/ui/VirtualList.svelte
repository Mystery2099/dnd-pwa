<script lang="ts" generics="T">
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import type { Snippet } from 'svelte';
	import DebugPanel from '$lib/components/ui/DebugPanel.svelte';

	let {
		items,
		estimateSize = 72,
		overscan = 10,
		children,
		class: className = ''
	}: {
		items: T[];
		estimateSize?: number;
		overscan?: number;
		children: Snippet<[T, number]>;
		class?: string;
	} = $props();

	let containerEl: HTMLDivElement | undefined = $state();

	// Recreate virtualizer when dependencies change
	let virtualizer = $derived.by(() => {
		return createVirtualizer({
			count: items.length,
			estimateSize: () => estimateSize,
			overscan: overscan,
			getScrollElement: () => containerEl ?? null
		});
	});

	let displayInfo = $state({
		startIndex: 0,
		endIndex: 0,
		totalItems: 0,
		scrollTop: 0,
		totalSize: 0
	});

	function updateDisplayInfo() {
		const virtualItems = $virtualizer.getVirtualItems();
		displayInfo.startIndex = virtualItems[0]?.index ?? 0;
		displayInfo.endIndex = virtualItems[virtualItems.length - 1]?.index ?? 0;
		displayInfo.totalItems = items.length;
		displayInfo.scrollTop = containerEl?.scrollTop ?? 0;
		displayInfo.totalSize = $virtualizer.getTotalSize();
	}

	$effect(() => {
		updateDisplayInfo();
	});
</script>

<div
	bind:this={containerEl}
	class="virtual-list-container {className} h-full w-full overflow-auto"
	onscroll={updateDisplayInfo}
>
	<DebugPanel
		listName="VirtualList"
		startIndex={displayInfo.startIndex}
		endIndex={displayInfo.endIndex}
		totalItems={displayInfo.totalItems}
		scrollTop={displayInfo.scrollTop}
	/>
	<div class="relative w-full" style="height: {$virtualizer.getTotalSize()}px;">
		{#each $virtualizer.getVirtualItems() as row (row.index)}
			<div
				class="virtual-list-item absolute left-0 w-full"
				style="height: {row.size}px; transform: translateY({row.start}px);"
			>
				{#if row.index >= 0 && row.index < items.length}
					{@render children(items[row.index], row.index)}
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.virtual-list-container {
		/* Smooth scrolling with momentum */
		scroll-behavior: smooth;
		/* Custom scrollbar */
		scrollbar-width: thin;
		scrollbar-color: var(--color-accent) transparent;
	}

	.virtual-list-container::-webkit-scrollbar {
		width: 8px;
	}

	.virtual-list-container::-webkit-scrollbar-track {
		background: transparent;
	}

	.virtual-list-container::-webkit-scrollbar-thumb {
		background-color: var(--color-accent);
		border-radius: 4px;
		opacity: 0.6;
	}

	.virtual-list-container::-webkit-scrollbar-thumb:hover {
		opacity: 1;
	}

	.virtual-list-item {
		/* Ensure smooth rendering */
		will-change: transform;
	}
</style>
