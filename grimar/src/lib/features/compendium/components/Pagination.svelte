<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { SvelteURL, SvelteURLSearchParams } from 'svelte/reactivity';
	import type { PaginatedResult } from '$lib/server/repositories/compendium';
	import Button from '$lib/components/ui/Button.svelte';
	import Select from '$lib/components/ui/Select.svelte';

	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';

	type PaginationInfo = Omit<PaginatedResult<unknown>, 'items'>;

	type Props = {
		pagination: PaginationInfo;
		baseUrl: string;
	};

	let { pagination, baseUrl }: Props = $props();

	function buildUrl(
		newOffset: number,
		newLimit?: number,
		newSearch?: string,
		newSortBy?: string,
		newSortOrder?: string
	) {
		// Handle SSR - build URL manually on server
		if (typeof window === 'undefined') {
			// Server-side: construct URL manually
			const searchParams = new SvelteURLSearchParams();

			if (newOffset > 0) {
				searchParams.set('offset', newOffset.toString());
			}

			if (newLimit && newLimit !== 50) {
				searchParams.set('limit', newLimit.toString());
			}

			if (newSearch) {
				searchParams.set('search', newSearch);
			}

			if (newSortBy && newSortBy !== 'name') {
				searchParams.set('sortBy', newSortBy);
			}

			if (newSortOrder && newSortOrder !== 'asc') {
				searchParams.set('sortOrder', newSortOrder);
			}

			const queryString = searchParams.toString();
			return queryString ? `${baseUrl}?${queryString}` : baseUrl;
		} else {
			// Client-side: use URL constructor
			const url = new SvelteURL(baseUrl, window.location.origin);

			if (newOffset > 0) {
				url.searchParams.set('offset', newOffset.toString());
			} else {
				url.searchParams.delete('offset');
			}

			if (newLimit && newLimit !== 50) {
				url.searchParams.set('limit', newLimit.toString());
			}

			if (newSearch) {
				url.searchParams.set('search', newSearch);
			}

			if (newSortBy && newSortBy !== 'name') {
				url.searchParams.set('sortBy', newSortBy);
			}

			if (newSortOrder && newSortOrder !== 'asc') {
				url.searchParams.set('sortOrder', newSortOrder);
			}

			return url.pathname + url.search;
		}
	}

	const previousUrl = $derived(
		buildUrl(Math.max(0, pagination.offset - pagination.limit), pagination.limit)
	);
	const nextUrl = $derived(buildUrl(pagination.offset + pagination.limit, pagination.limit));

	const limitOptions = [
		{ label: '25 per page', value: 25 },
		{ label: '50 per page', value: 50 },
		{ label: '100 per page', value: 100 }
	];

	function handleLimitChange(val: string) {
		const newLimit = parseInt(val);
		if (typeof window !== 'undefined') {
			window.location.href = buildUrl(0, newLimit);
		}
	}
</script>

<SurfaceCard class="flex items-center justify-between p-4">
	<div class="flex items-center gap-4">
		<span class="text-sm text-gray-400">
			Showing {pagination.offset + 1}-
			{Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} items
		</span>

		<!-- Page size selector -->
		<div class="w-40">
			<Select
				value={pagination.limit}
				options={limitOptions}
				onchange={handleLimitChange}
				class="h-8 py-0 px-3 text-xs"
			/>
		</div>
	</div>

	<div class="flex items-center gap-2">
		<Button
			size="sm"
			variant="gem"
			disabled={!pagination.hasPrevious}
			href={previousUrl}
			onclick={(e) => {
				if (!pagination.hasPrevious) {
					e.preventDefault();
				}
			}}
		>
			<ChevronLeft class="size-4" />
			Previous
		</Button>

		<span class="mx-2 text-sm text-gray-400">
			Page {pagination.currentPage} of {pagination.totalPages || 1}
		</span>

		<Button
			size="sm"
			variant="gem"
			disabled={!pagination.hasMore}
			href={nextUrl}
			onclick={(e) => {
				if (!pagination.hasMore) {
					e.preventDefault();
				}
			}}
		>
			Next
			<ChevronRight class="size-4" />
		</Button>
	</div>
</SurfaceCard>
