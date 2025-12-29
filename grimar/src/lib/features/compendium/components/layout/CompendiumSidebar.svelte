<script lang="ts">
	import { Search, Bookmark, ArrowUpDown } from 'lucide-svelte';
	import { type Snippet } from 'svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';

	interface Props {
		onSearch: (term: string) => void;
		onClear?: () => void;
		onSort?: (value: string) => void;
		sortOptions?: { label: string; value: string }[];
		initialSort?: string;
		hasActiveFilters?: boolean;
		filters?: Snippet;
	}

	let {
		onSearch,
		onClear,
		onSort,
		sortOptions = [],
		initialSort,
		hasActiveFilters = false,
		filters
	}: Props = $props();
	let searchTerm = $state('');
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
		searchTerm = '';
		onSearch('');
		onClear?.();
	}

	function handleSort(val: string) {
		currentSort = val;
		onSort?.(val);
	}
</script>

<div class="flex h-full flex-col overflow-hidden">
	<!-- Header / Search -->
	<div class="shrink-0 space-y-4 border-b border-white/10 p-4">
		<div class="flex items-center justify-between">
			<h2 class="text-xs font-bold tracking-widest text-gray-500 uppercase">Index Filter</h2>
			{#if hasActiveFilters || searchTerm}
				<button
					onclick={clear}
					class="text-xs font-bold text-purple-400 transition-colors hover:text-purple-300"
				>
					Clear All
				</button>
			{/if}
		</div>

		<!-- Crystal Input -->
		<div class="relative">
			<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400 z-10" />
			<Input
				placeholder="Search..."
				bind:value={searchTerm}
				oninput={() => onSearch(searchTerm)}
				class="h-10 pr-3 pl-9"
			/>
		</div>

		<!-- Sort Dropdown -->
		{#if sortOptions.length > 0}
			<div class="relative">
				<ArrowUpDown
					class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400 z-10"
				/>
				<Select
					value={currentSort}
					onchange={handleSort}
					options={sortOptions}
					class="h-10 pr-10 pl-9"
				/>
			</div>
		{/if}

		<!-- View Toggle (Index vs Bookmarks) -->
		<div class="flex rounded-lg border border-white/5 bg-black/40 p-1">
			<button
				class="flex-1 rounded border border-white/10 bg-white/10 py-1.5 text-center text-xs font-medium text-white shadow-sm"
			>
				All Items
			</button>
			<button
				class="flex flex-1 items-center justify-center gap-1 rounded py-1.5 text-center text-xs font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
			>
				<Bookmark class="size-3" />
				<span>Bookmarks</span>
			</button>
		</div>
	</div>

	<!-- Scrollable Filters -->
	<div class="glass-scroll flex-1 overflow-y-auto">
		{#if filters}
			{@render filters()}
		{/if}
	</div>
</div>
