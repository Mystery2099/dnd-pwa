<script lang="ts">
	import { Bookmark, ArrowUpDown } from 'lucide-svelte';
	import { type Snippet } from 'svelte';
	import Select from '$lib/components/ui/select/select.svelte';

	interface Props {
		onClear?: () => void;
		onSort?: (value: string) => void;
		sortOptions?: { label: string; value: string }[];
		initialSort?: string;
		hasActiveFilters?: boolean;
		filters?: Snippet;
	}

	let {
		onClear,
		onSort,
		sortOptions = [],
		initialSort,
		hasActiveFilters = false,
		filters
	}: Props = $props();
	let currentSort = $state('');

	// Initialize sort value from prop or first option
	$effect(() => {
		if (sortOptions.length > 0) {
			// Use initialSort if provided and valid, otherwise use first option
			if (initialSort && sortOptions.some((opt) => opt.value === initialSort)) {
				currentSort = initialSort;
			} else if (currentSort === '') {
				currentSort = sortOptions[0].value;
			}
		}
	});

	function clear() {
		onClear?.();
	}

	function handleSort(val: string) {
		currentSort = val;
		onSort?.(val);
	}
</script>

<div class="flex h-full flex-col overflow-hidden">
	<!-- Header -->
	<div class="shrink-0 space-y-4 border-b border-[var(--color-border)] p-4">
		<div class="flex items-center justify-between">
			<h2 class="text-xs font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
				Index Filter
			</h2>
			{#if hasActiveFilters}
				<button
					onclick={clear}
					class="text-xs font-bold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent)]"
				>
					Clear All
				</button>
			{/if}
		</div>

		<!-- Sort Dropdown -->
		{#if sortOptions.length > 0}
			<div class="relative">
				<ArrowUpDown
					class="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-[var(--color-text-secondary)]"
				/>
				<Select
					type="single"
					bind:value={currentSort}
					options={sortOptions}
					class="h-10 pr-10 pl-9"
				/>
			</div>
		{/if}

		<!-- View Toggle (Index vs Bookmarks) -->
		<div class="flex rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-1">
			<button
				class="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-card)] py-1.5 text-center text-xs font-medium text-[var(--color-text-primary)] shadow-sm"
			>
				All Items
			</button>
			<button
				class="flex flex-1 items-center justify-center gap-1 rounded py-1.5 text-center text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]"
			>
				<Bookmark class="size-3" />
				<span>Bookmarks</span>
			</button>
		</div>
	</div>

	<!-- Filters (no scroll, wrap naturally) -->
	<div class="min-h-0 flex-1 overflow-y-auto">
		{#if filters}
			{@render filters()}
		{/if}
	</div>
</div>
