<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import type { PaginatedResult } from '$lib/server/repositories/compendium';
	import Button from '$lib/components/ui/Button.svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';

	type PaginationInfo = Omit<PaginatedResult<unknown>, 'items'>;

	let { pagination, baseUrl }: { pagination: PaginationInfo; baseUrl: string } = $props();

	// API returns: { currentPage, limit, totalCount, totalPages }
	const prevPage = $derived(pagination.currentPage > 1 ? pagination.currentPage - 1 : null);
	const nextPage = $derived(
		pagination.currentPage < pagination.totalPages ? pagination.currentPage + 1 : null
	);
</script>

<SurfaceCard class="flex items-center justify-between gap-4 p-4">
	<span class="text-sm text-[var(--color-text-muted)]">
		{pagination.currentPage} / {pagination.totalPages}
	</span>

	<div class="flex items-center gap-2">
		<Button
			size="sm"
			variant="gem"
			disabled={!prevPage}
			href={prevPage ? `${baseUrl}?page=${prevPage}` : undefined}
		>
			<ChevronLeft class="size-4" />
		</Button>

		<Button
			size="sm"
			variant="gem"
			disabled={!nextPage}
			href={nextPage ? `${baseUrl}?page=${nextPage}` : undefined}
		>
			<ChevronRight class="size-4" />
		</Button>
	</div>
</SurfaceCard>
