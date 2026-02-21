<script lang="ts">
	import { page } from '$app/stores';
	import { createCompendiumQuery } from '$lib/core/client/queries';
	import Badge from '$lib/components/ui/Badge.svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import { COMPENDIUM_TYPE_CONFIGS } from '$lib/core/constants/compendium';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let searchQuery = $state($page.url.searchParams.get('search') ?? '');
	let currentPage = $state(Number($page.url.searchParams.get('page')) || 1);
	let sortBy = $state($page.url.searchParams.get('sortBy') ?? 'name');
	let sortOrder = $state(($page.url.searchParams.get('sortOrder') as 'asc' | 'desc') ?? 'asc');

	let config = $derived(COMPENDIUM_TYPE_CONFIGS[data.type]);
	let query = createCompendiumQuery(data.type);
	let items = $derived(query.data?.items ?? []);
	let totalItems = $derived(query.data?.total ?? 0);
	let totalPages = $derived(query.data?.totalPages ?? 1);
	let isLoading = $derived(query.isFetching);

	function updateUrl() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('search', searchQuery);
		if (currentPage > 1) params.set('page', currentPage.toString());
		if (sortBy !== 'name') params.set('sortBy', sortBy);
		if (sortOrder !== 'asc') params.set('sortOrder', sortOrder);
		const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
		window.history.replaceState({}, '', newUrl);
	}

	function handleSearch(e: Event) {
		const target = e.target as HTMLInputElement;
		searchQuery = target.value;
		currentPage = 1;
		updateUrl();
		query.refetch();
	}

	function handleSort(by: 'name' | 'createdAt' | 'updatedAt') {
		if (sortBy === by) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = by;
			sortOrder = 'asc';
		}
		updateUrl();
		query.refetch();
	}

	function goToPage(page: number) {
		currentPage = Math.max(1, Math.min(page, totalPages));
		updateUrl();
		query.refetch();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>{config.plural} | Compendium | D&D</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-[var(--color-bg-primary)] to-[var(--color-bg-secondary)]">
	<div class="mx-auto max-w-7xl px-4 py-8">
		<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<a href="/compendium" class="text-sm text-[var(--color-text-muted)] hover:text-accent transition-colors">
					← Back to Compendium
				</a>
				<h1 class="mt-2 text-3xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
					<span class="text-4xl">{config.icon}</span>
					{config.plural}
				</h1>
				<p class="mt-1 text-[var(--color-text-secondary)]">{config.description}</p>
			</div>
			<div class="text-sm text-[var(--color-text-muted)]">
				{totalItems.toLocaleString()} items
			</div>
		</div>

		<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="relative flex-1 max-w-md">
				<input
					type="text"
					placeholder="Search {config.plural.toLowerCase()}..."
					value={searchQuery}
					oninput={handleSearch}
					class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-2 pl-10 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				/>
				<svg class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>

			<div class="flex gap-2">
				<button
					onclick={() => handleSort('name')}
					class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:border-accent hover:text-accent {sortBy === 'name' ? 'border-accent text-accent' : ''}"
				>
					Name {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
				</button>
			</div>
		</div>

		{#if isLoading}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each Array(12) as _}
					<div class="card-crystal h-32 animate-pulse rounded-lg bg-[var(--color-bg-card)]"></div>
				{/each}
			</div>
		{:else if items.length === 0}
			<div class="flex flex-col items-center justify-center py-16 text-center">
				<div class="text-6xl mb-4">🔍</div>
				<h2 class="text-xl font-semibold text-[var(--color-text-primary)]">No {config.plural.toLowerCase()} found</h2>
				<p class="mt-2 text-[var(--color-text-secondary)]">
					{searchQuery ? `No results for "${searchQuery}"` : 'No items available in this category'}
				</p>
				{#if searchQuery}
					<button
						onclick={() => { searchQuery = ''; currentPage = 1; updateUrl(); query.refetch(); }}
						class="mt-4 rounded-lg bg-accent px-4 py-2 text-white transition-opacity hover:opacity-90"
					>
						Clear search
					</button>
				{/if}
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each items as item (item.key)}
					<SurfaceCard href="/compendium/{data.type}/{item.key}" class="group">
						<div class="p-4">
							<h3 class="font-semibold text-[var(--color-text-primary)] group-hover:text-accent transition-colors line-clamp-1">
								{item.name}
							</h3>
							{#if item.source}
								<p class="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-1">
									{item.source}
								</p>
							{/if}
							{#if item.description}
								<p class="mt-2 text-sm text-[var(--color-text-secondary)] line-clamp-2">
									{item.description}
								</p>
							{/if}
							{#if data.type === 'spells' && item.data}
								<div class="mt-3 flex flex-wrap gap-1">
									{#if item.data.level !== undefined}
										<Badge variant="solid">
											{item.data.level === 0 ? 'Cantrip' : `Level ${item.data.level}`}
										</Badge>
									{/if}
									{#if item.data.school}
										<Badge variant="outline">{String(item.data.school)}</Badge>
									{/if}
								</div>
							{:else if data.type === 'creatures' && item.data}
								<div class="mt-3 flex flex-wrap gap-1">
									{#if item.data.challenge_rating_text}
										<Badge variant="solid">CR {item.data.challenge_rating_text}</Badge>
									{/if}
									{#if item.data.type}
										<Badge variant="outline">{String(item.data.type)}</Badge>
									{/if}
								</div>
							{:else if data.type === 'classes' && item.data}
								<div class="mt-3 flex flex-wrap gap-1">
									{#if item.data.hit_dice}
										<Badge variant="solid">d{item.data.hit_dice}</Badge>
									{/if}
								</div>
							{/if}
						</div>
					</SurfaceCard>
				{/each}
			</div>

			{#if totalPages > 1}
				<div class="mt-8 flex items-center justify-center gap-2">
					<button
						onclick={() => goToPage(currentPage - 1)}
						disabled={currentPage === 1}
						class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:border-accent disabled:opacity-50 disabled:hover:border-[var(--color-border)]"
					>
						Previous
					</button>
					
					<div class="flex items-center gap-1">
						{#each Array(Math.min(5, totalPages)) as _, i}
							{@const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i))}
							{#if pageNum >= 1 && pageNum <= totalPages}
								<button
									onclick={() => goToPage(pageNum)}
									class="min-w-[2.5rem] rounded-lg border {currentPage === pageNum ? 'border-accent bg-accent/20 text-accent' : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-accent'} px-3 py-2 text-sm transition-colors"
								>
									{pageNum}
								</button>
							{/if}
						{/each}
					</div>

					<button
						onclick={() => goToPage(currentPage + 1)}
						disabled={currentPage === totalPages}
						class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:border-accent disabled:opacity-50 disabled:hover:border-[var(--color-border)]"
					>
						Next
					</button>
				</div>
			{/if}
		{/if}
	</div>
</div>
