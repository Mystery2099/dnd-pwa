<script lang="ts" generics="T">
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import type { Snippet } from 'svelte';
	import { browser } from '$app/environment';
	import DebugPanel from '$lib/components/ui/DebugPanel.svelte';

	// ============================================================================
	// ARCHITECTURE OVERVIEW
	// ============================================================================
	//
	// VirtualGrid is a virtualized grid component that renders only visible items
	// for performance. It handles dynamic row heights using TanStack Virtual's
	// measureElement system.
	//
	// KEY IMPLEMENTATION DECISIONS (DO NOT CHANGE WITHOUT REVIEW):
	//
	// 1. ROW-BASED VIRTUALIZATION
	//    - We virtualize ROWS, not individual cards
	//    - Each row contains multiple cards based on responsive columns
	//    - This is more efficient than virtualizing individual cards
	//
	// 2. DYNAMIC HEIGHT MEASUREMENT
	//    - Using measureElement (via use:measureRow action) to track ACTUAL row heights
	//    - NOT relying on fixed estimateRowHeight after initial render
	//    - TanStack Virtual uses ResizeObserver internally to watch for changes
	//    - CRITICAL: Without this, cards of different heights would overlap
	//
	// 3. ESTIMATE ROW HEIGHT DEFAULT (155px)
	//    - This is ONLY for initial rendering before measurement
	//    - After first render, actual measured heights are used
	//    - Choose a value close to typical card height to minimize layout shift
	//
	// 4. measureElement ACTION PATTERN
	//    - We use Svelte's use: directive (not bind:this)
	//    - Svelte actions are called when element mounts
	//    - This triggers TanStack's internal ResizeObserver
	//    - DO NOT replace with $effect or manual measurement
	//
	// 5. REMEASUREMENT ON DATA/RESIZE CHANGES
	//    - When items array changes (filtering) or columns change (resize)
	//    - We MUST call virtualizer.measure() to reset cached measurements
	//    - Without this, stale measurements cause layout glitches
	//    - The glitch fixes itself after scrolling because new items trigger measurement
	//    - But we proactively remeasure to prevent visual artifacts
	//
	// 6. RESPONSIVE COLUMN CALCULATION
	//    - Calculated from containerWidth (via bind:clientWidth)
	//    - Different minCardWidth for mobile/tablet/desktop breakpoints
	//    - When containerWidth changes → columns change → rowCount changes
	//
	// 7. GRID LAYOUT WITHIN ROWS
	//    - Each row is CSS Grid: grid-template-columns: repeat(columns, minmax(..., 1fr))
	//    - NOT using nested virtualizers (would be overkill)
	//    - Cards are flex items within grid cells for proper stretching
	//
	// ============================================================================
	// WHY THESE DECISIONS MATTER:
	// ============================================================================
	//
	// Without measureElement:
	//   - Cards with varying heights (e.g., spell descriptions vs monster stats)
	//   - Would visually overlap into rows below
	//   - Estimated height (155px) insufficient for variable content
	//
	// Without remeasurement on filters/resize:
	//   - Filtering the list → items array changes
	//   - Resizing window → columns change → rowCount changes
	//   - Existing row measurements become STALE
	//   - Result: visual glitch requiring scroll to fix
	//
	// Without row-based virtualization:
	//   - Would need to virtualize individual cards
	//   - Much more complex positioning (x + y coordinates)
	//   - Row-based is simpler and equally performant for grids
	//
	// ============================================================================

	interface Props {
		items: T[];
		children: Snippet<[T, number]>;
		/**
		 * Estimated row height in pixels (default: 155)
		 *
		 * PURPOSE: Initial rendering estimate BEFORE measureElement runs
		 * IMPORTANT: Only affects first render; actual heights are measured afterward
		 * RECOMMENDATION: Choose a value close to your typical card height
		 * TRADEOFF: Too low = more layout shift; too high = wasted scroll space
		 *
		 * This is NOT the actual row height - it's just an initial guess.
		 * The measureElement action measures ACTUAL heights and overrides this.
		 */
		estimateRowHeight?: number;
		/**
		 * Number of rows to render outside visible area (default: 5)
		 *
		 * PURPOSE: Pre-render rows above/below viewport to reduce blank space
		 * when scrolling quickly
		 * TRADEOFF: Higher = smoother scroll, but more DOM nodes
		 * DEFAULT: TanStack Virtual default is 1, we use 5 for grids
		 *
		 * For grids, higher overscan is better because:
		 * - Rows contain multiple cards (more content per row)
		 * - Visual impact of blank row is higher
		 * - Modern devices handle 5-10 extra rows easily
		 */
		overscan?: number;
		/**
		 * Minimum card width for responsive columns (default: 220)
		 *
		 * PURPOSE: Minimum width at which cards will wrap to next column
		 * AFFECTS: Number of columns on desktop (1024px+)
		 * CALCULATION: columns = floor(containerWidth / (minCardWidth + gap))
		 *
		 * Example: 1000px container, 220px minWidth, 16px gap
		 * columns = floor(1000 / 236) = 4 columns
		 *
		 * ADJUST THIS based on your card content:
		 * - Text-heavy cards: increase (larger minimums)
		 * - Image cards: decrease (can be smaller)
		 * - Ensure cards have breathing room
		 */
		minCardWidth?: number;
		/**
		 * Minimum card width for mobile screens < 640px (default: 150)
		 *
		 * PURPOSE: Smaller minimum for mobile devices
		 * REASON: Mobile has limited horizontal space
		 * AUTOMATIC: Applied when containerWidth < 640px
		 *
		 * Typical mobile breakpoints:
		 * - 375px (iPhone SE): 2 columns with 150px min
		 * - 414px (iPhone Max): 2 columns with 150px min
		 * - 768px (iPad): Would use tabletMinCardWidth instead
		 */
		mobileMinCardWidth?: number;
		/**
		 * Minimum card width for tablet screens 640px-1024px (default: 190)
		 *
		 * PURPOSE: Balanced size for tablet devices
		 * AUTOMATIC: Applied when 640px <= containerWidth < 1024px
		 * BETWEEN: Larger than mobile, smaller than desktop
		 *
		 * Typical tablet breakpoints:
		 * - 768px (iPad Mini): 3-4 columns with 190px min
		 * - 1024px (iPad Pro): Would use desktop minCardWidth
		 */
		tabletMinCardWidth?: number;
		/**
		 * Gap between cards in pixels (default: 16 = Tailwind gap-4)
		 *
		 * PURPOSE: Spacing between cards in the same row
		 * CALCULATION: Handled by CSS Grid: grid-gap property
		 * APPLIED TO: grid-template-columns calculation
		 *
		 * Note: This affects column count calculation:
		 * availableSpace = containerWidth - gap * (columns - 1)
		 * columns = floor((availableSpace + gap) / (minWidth + gap))
		 *
		 * ADJUSTMENT: Increase for breathing room, decrease for density
		 */
		gap?: number;
		class?: string;
	}

	let {
		items,
		children,
		estimateRowHeight = 155,
		overscan = 5,
		minCardWidth = 220,
		mobileMinCardWidth = 150,
		tabletMinCardWidth = 190,
		gap = 16,
		class: className = ''
	}: Props = $props();

	// ============================================
	// Container-based column detection with automatic resize tracking
	// ============================================
	let containerEl: HTMLDivElement | undefined = $state();
	let containerWidth = $state(0);

	// Calculate responsive min card width based on container width (mobile-first)
	let currentMinCardWidth = $derived(
		containerWidth < 640
			? mobileMinCardWidth
			: containerWidth < 1024
				? tabletMinCardWidth
				: minCardWidth
	);

	// Calculate how many columns fit based on responsive minimum width
	let columns = $derived.by(() => {
		if (!containerEl || containerWidth === 0) return 1;
		// Calculate how many cards fit based on responsive minimum width
		return Math.max(1, Math.floor(containerWidth / (currentMinCardWidth + gap)));
	});

	let rowCount = $derived(Math.ceil(items.length / columns));

	// Recreate virtualizer when dependencies change
	let virtualizer = $derived.by(() => {
		return createVirtualizer({
			count: rowCount,
			estimateSize: () => estimateRowHeight,
			overscan,
			getScrollElement: () => containerEl ?? null
		});
	});

	// ============================================
	// NOTE: Manual remeasurement not needed
	// ============================================
	//
	// CRITICAL: We do NOT call virtualizer.measure() because:
	// - It can trigger infinite loops via Svelte's reactivity system
	// - The measureRow action uses ResizeObserver (automatic tracking)
	// - When virtualizer recreates, measurements are preserved
	// - New rows trigger measurement via use:measureRow action
	//
	// The measure() method is only needed for:
	// - In-place array mutations (without array reference change)
	// - Manual DOM manipulation bypassing Svelte reactivity
	// - For normal filtering/sorting/resize, measureElement is sufficient
	//
	// See: https://tanstack.com/virtual/latest/docs/api/virtualizer
	// "measure(): Resets any prev item measurements"

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

	// Action to measure row element dynamically
	// This fixes issue where cards of different heights cut into rows below
	//
	// WHY WE NEED THIS:
	// - Row height depends on the TALLEST card in that row
	// - Cards have variable content (spell descriptions, monster stats, etc.)
	// - Fixed estimateRowHeight (155px) cannot predict actual heights
	//
	// HOW IT WORKS:
	// 1. Svelte calls this action when row element mounts
	// 2. We call virtualizer.measureElement(node)
	// 3. TanStack Virtual internally uses ResizeObserver to track size
	// 4. When size changes (e.g., image loads, font loads), it recalculates
	// 5. Virtualizer adjusts row positions automatically
	//
	// CRITICAL IMPLEMENTATION NOTES:
	// - DO NOT replace with bind:this (Svelte limitation)
	// - DO NOT use $effect with manual DOM queries (race conditions)
	// - This action pattern is the idiomatic Svelte way for side effects
	//
	// See: https://tanstack.com/virtual/latest/docs/api/virtualizer
	// "measureElement(el): Measures element using configured measureElement option"
	function measureRow(node: HTMLDivElement) {
		$virtualizer.measureElement(node);
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
	<!-- bind:clientWidth automatically tracks resize events -->
	<div
		bind:this={containerEl}
		bind:clientWidth={containerWidth}
		class="virtual-grid-container h-full w-full overflow-auto p-2 sm:p-3 md:p-4 lg:p-4"
		onscroll={() => {
			const virtualItems = $virtualizer.getVirtualItems();
			displayInfo.startIndex = virtualItems[0]?.index ?? 0;
			displayInfo.endIndex = virtualItems[virtualItems.length - 1]?.index ?? 0;
			displayInfo.scrollTop = containerEl?.scrollTop ?? 0;
		}}
	>
		{#if browser && items.length > 0}
			<div class="relative w-full" style="height: {$virtualizer.getTotalSize()}px;">
				{#each $virtualizer.getVirtualItems() as row (row.key)}
					{@const rowItems = getRowItems(row.index)}
					<div
						use:measureRow
						data-index={row.index}
						class="absolute left-0 grid w-full"
						style="gap: {gap}px; transform: translateY({row.start}px); grid-template-columns: repeat({columns}, minmax({currentMinCardWidth}px, 1fr)); will-change: transform;"
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
	}

	.virtual-grid-container::-webkit-scrollbar-thumb:hover {
		background-color: hsl(var(--accent) / 0.8);
	}
</style>
