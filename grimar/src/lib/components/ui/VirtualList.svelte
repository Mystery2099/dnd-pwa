<script lang="ts" generics="T">
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import type { Snippet } from 'svelte';

	let {
		items,
		estimateSize = 40,
		overscan = 5,
		children,
		class: className = ''
	}: {
		items: T[];
		estimateSize?: number | ((index: number) => number);
		overscan?: number;
		children: Snippet<[T, number]>;
		class?: string;
	} = $props();

	let containerEl: HTMLDivElement | undefined = $state();

	const virtualizer = createVirtualizer({
		count: items.length,
		getScrollElement: () => containerEl ?? null,
		get estimateSize() {
			return typeof estimateSize === 'number' ? () => estimateSize : estimateSize;
		},
		get overscan() {
			return overscan;
		}
	});
</script>

<div
	bind:this={containerEl}
	class="virtual-list-container {className}"
	style="height: 100%; width: 100%; overflow: auto;"
>
	<div
		class="virtual-list-inner"
		style="position: relative; height: {$virtualizer.getTotalSize()}px; width: 100%;"
	>
		{#each $virtualizer.getVirtualItems() as row (row.index)}
			<div
				class="virtual-list-item"
				style="position: absolute; top: 0; left: 0; width: 100%; height: {row.size}px; transform: translateY({row.start}px);"
			>
				{@render children(items[row.index], row.index)}
			</div>
		{/each}
	</div>
</div>
