<script lang="ts" generics="T">
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import type { Snippet } from 'svelte';
	import { browser } from '$app/environment';
	import DebugPanel from '$lib/components/ui/DebugPanel.svelte';

	interface Props {
		items: T[];
		children: Snippet<[T, number]>;
		/**
		 * Estimated row height in pixels (default: 155)
		 */
		estimateRowHeight?: number;
		/**
		 * Number of rows to render outside visible area (default: 5)
		 */
		overscan?: number;
		/**
		 * Minimum card width for responsive columns (default: 220)
		 */
		minCardWidth?: number;
		/**
		 * Gap between cards in pixels (default: 16 = Tailwind gap-4)
		 */
		gap?: number;
		class?: string;
	}

	let {
		items,
		children,
		estimateRowHeight: estimateSize = 155,
		overscan = 5,
		minCardWidth = 220,
		gap = 16,
		class: className = ''
	}: Props = $props();

	let containerEl: HTMLDivElement | undefined = $state();

	// ============================================
	// Container-based column detection (no hardcoded breakpoints)
	// ============================================
	let columns = $derived.by(() => {
		if (!containerEl) return 1;
		// Calculate how many cards fit based on container width
		return Math.max(1, Math.floor(containerEl.clientWidth / (minCardWidth + gap)));
	});

	// ============================================
	// Height caching with automatic reset on column change
	// ============================================
	let rowHeights = $state<Map<number, number>>(new Map());
	let prevColumns: number | undefined = $state();

	$effect(() => {
		// Reset height caches when columns change to prevent stale data
		if (prevColumns !== undefined && prevColumns !== columns) {
			rowHeights = new Map();
		}
		prevColumns = columns;
	});

	let rowCount = $derived(Math.ceil(items.length / columns));

	// ============================================
	// Virtualizer with built-in element measurement
	// ============================================
	let virtualizer = $derived.by(() => {
		return createVirtualizer({
			count: rowCount,
			estimateSize: () => estimateSize,
			overscan,
			getScrollElement: () => containerEl ?? null,
			measureElement: (element) => {
				if (element) {
					const height = element.getBoundingClientRect().height;
					if (height > 10) {
						// Get row index from data attribute
						const rowIndex = parseInt(element.getAttribute('data-row-index') || '0', 10);
						rowHeights.set(rowIndex, height);
					}
					return height;
				}
				return estimateSize;
			}
		});
	});

	// ============================================
	// Display info for DebugPanel
	// ============================================
	let displayInfo = $state({
		startIndex: 0,
		endIndex: 0,
		totalItems: 0,
		scrollTop: 0,
		columns: 1
	});

	$effect(() => {
		const virtualItems = $virtualizer.getVirtualItems();
		displayInfo.startIndex = virtualItems[0]?.index ?? 0;
		displayInfo.endIndex = virtualItems[virtualItems.length - 1]?.index ?? 0;
		displayInfo.totalItems = items.length;
		displayInfo.scrollTop = containerEl?.scrollTop ?? 0;
		displayInfo.columns = columns;
	});

	// ============================================
	// Optimized height calculations
	// ============================================
	let totalHeight = $derived.by(() => {
		let total = 0;
		for (let i = 0; i < rowCount; i++) {
			total += rowHeights.get(i) ?? estimateSize;
		}
		return total;
	});

	function getRowStart(rowIndex: number): number {
		let start = 0;
		for (let i = 0; i < rowIndex; i++) {
			start += rowHeights.get(i) ?? estimateSize;
		}
		return start;
	}

	function getRowItems(rowIndex: number): Array<{ item: T; index: number }> {
		const itemsInRow = [];
		for (let col = 0; col < columns; col++) {
			const itemIndex = rowIndex * columns + col;
			if (itemIndex < items.length) {
				itemsInRow.push({ item: items[itemIndex], index: itemIndex });
			}
		}
		return itemsInRow;
	}

	function getRowHeight(rowIndex: number): number {
		return rowHeights.get(rowIndex) ?? estimateSize;
	}
</script>

<div class="virtual-grid-wrapper relative h-full w-full {className}">
	<DebugPanel
		listName="VirtualGrid"
		startIndex={displayInfo.startIndex * displayInfo.columns}
		endIndex={Math.min((displayInfo.endIndex + 1) * displayInfo.columns, displayInfo.totalItems) -
			1}
		totalItems={displayInfo.totalItems}
		scrollTop={displayInfo.scrollTop}
		columns={displayInfo.columns}
	/>
	<div bind:this={containerEl} class="virtual-grid-container h-full w-full overflow-auto p-4">
		{#if browser && items.length > 0}
			<div class="relative w-full" style="height: {totalHeight}px;">
				{#each $virtualizer.getVirtualItems() as row (row.key)}
					{@const rowItems = getRowItems(row.index)}
					{@const rowHeight = getRowHeight(row.index)}
					<div
						data-row-index={row.index}
						class="absolute left-0 grid w-full"
						style="gap: {gap}px; transform: translateY({getRowStart(
							row.index
						)}px); height: {rowHeight}px; grid-template-columns: repeat({columns}, minmax({minCardWidth}px, 1fr));"
					>
						{#each rowItems as { item, index } (index)}
							<div class="flex min-w-0 items-stretch" data-index={index}>
								{@render children(item, index)}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{:else if items.length === 0}
			<div class="flex h-full w-full items-center justify-center">
				<span class="text-muted-foreground text-sm">No items</span>
			</div>
		{:else}
			<div class="flex h-full w-full items-center justify-center">
				<span class="text-muted-foreground text-sm">Loading...</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.virtual-grid-container {
		/* Smooth scrolling */
		scroll-behavior: smooth;
		/* Custom scrollbar */
		scrollbar-width: thin;
		scrollbar-color: hsl(var(--accent)) transparent;
	}

	.virtual-grid-container::-webkit-scrollbar {
		width: 8px;
	}

	.virtual-grid-container::-webkit-scrollbar-track {
		background: transparent;
	}

	.virtual-grid-container::-webkit-scrollbar-thumb {
		background-color: hsl(var(--accent));
		border-radius: 4px;
		opacity: 0.6;
	}

	.virtual-grid-container::-webkit-scrollbar-thumb:hover {
		opacity: 1;
	}
</style>
