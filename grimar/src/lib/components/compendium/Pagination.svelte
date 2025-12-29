<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { SvelteURL, SvelteURLSearchParams } from 'svelte/reactivity';
	import type { PaginatedResult } from '$lib/server/db/repositories/compendium';

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
</script>

<div class="card-crystal flex items-center justify-between p-4">
	<div class="flex items-center gap-4">
		<span class="text-sm text-gray-400">
			Showing {pagination.offset + 1}-
			{Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} items
		</span>

		<!-- Page size selector -->
		<select
			value={pagination.limit}
			class="panel-inset rounded border border-white/10 bg-black/20 px-3 py-1 text-sm text-white"
			onchange={(e) => {
				const target = e.target as HTMLSelectElement;
				const newLimit = parseInt(target.value);
				if (typeof window !== 'undefined') {
					window.location.href = buildUrl(0, newLimit);
				}
			}}
		>
			<option value={25}>25 per page</option>
			<option value={50}>50 per page</option>
			<option value={100}>100 per page</option>
		</select>
	</div>

	<div class="flex items-center gap-2">
		<a
			class="btn-gem px-3 py-1 text-sm {pagination.hasPrevious
				? ''
				: 'pointer-events-none cursor-not-allowed opacity-50'}"
			href={previousUrl}
			onclick={(e) => {
				if (!pagination.hasPrevious) {
					e.preventDefault();
					return;
				}
			}}
		>
			<ChevronLeft class="size-4" />
			Previous
		</a>

		<span class="mx-2 text-sm text-gray-400">
			Page {pagination.currentPage} of {pagination.totalPages || 1}
		</span>

		<a
			class="btn-gem px-3 py-1 text-sm {pagination.hasMore
				? ''
				: 'pointer-events-none cursor-not-allowed opacity-50'}"
			href={nextUrl}
			onclick={(e) => {
				if (!pagination.hasMore) {
					e.preventDefault();
					return;
				}
			}}
		>
			Next
			<ChevronRight class="size-4" />
		</a>
	</div>
</div>
