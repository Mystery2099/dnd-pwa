<script lang="ts">
	import { page } from '$app/stores';
	import { createCompendiumQuery } from '$lib/core/client/queries';
	import Badge from '$lib/components/ui/Badge.svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import { COMPENDIUM_TYPE_CONFIGS } from '$lib/core/constants/compendium';
	import type { CompendiumTypeName } from '$lib/core/types/compendium';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	type CardItemData = {
		level?: number;
		school?: { name?: string; key?: string } | string;
		challenge_rating_text?: string;
		type?: { name?: string } | string;
		hit_dice?: string | number;
	};

	function getSchoolLabel(school: CardItemData['school']): string | undefined {
		if (!school) return undefined;
		if (typeof school === 'string') return school;
		return school.name ?? school.key;
	}

	function getTypeLabel(type: CardItemData['type']): string | undefined {
		if (!type) return undefined;
		if (typeof type === 'string') return type;
		return type.name;
	}

	let { data }: Props = $props();

	let searchQuery = $state($page.url.searchParams.get('search') ?? '');
	let currentPage = $state(Number($page.url.searchParams.get('page')) || 1);
	let sortBy = $state(
		($page.url.searchParams.get('sortBy') as 'name' | 'createdAt' | 'updatedAt') ?? 'name'
	);
	let sortOrder = $state(($page.url.searchParams.get('sortOrder') as 'asc' | 'desc') ?? 'asc');

	let config = $derived(COMPENDIUM_TYPE_CONFIGS[data.type]);
	let query = $derived(
		createCompendiumQuery(data.type as CompendiumTypeName, {
			search: searchQuery || undefined,
			page: currentPage,
			sortBy,
			sortOrder,
			creatureType: $page.url.searchParams.get('creatureType') ?? undefined,
			spellLevel: $page.url.searchParams.get('spellLevel') ?? undefined,
			spellSchool: $page.url.searchParams.get('spellSchool') ?? undefined,
			challengeRating: $page.url.searchParams.get('challengeRating') ?? undefined
		})
	);
	let items = $derived(query.data?.items ?? []);
	let totalItems = $derived(query.data?.total ?? 0);
	let totalPages = $derived(query.data?.totalPages ?? 1);
	let isLoading = $derived(query.isFetching);

	function updateUrl() {
		const parts: string[] = [];
		if (searchQuery) parts.push(`search=${encodeURIComponent(searchQuery)}`);
		if (currentPage > 1) parts.push(`page=${currentPage}`);
		if (sortBy !== 'name') parts.push(`sortBy=${sortBy}`);
		if (sortOrder !== 'asc') parts.push(`sortOrder=${sortOrder}`);
		const newUrl = parts.length > 0 ? `?${parts.join('&')}` : window.location.pathname;
		window.history.replaceState({}, '', newUrl);
	}

	function handleSearch(e: Event) {
		const target = e.target as HTMLInputElement;
		searchQuery = target.value;
		currentPage = 1;
		updateUrl();
	}

	function handleSort(by: 'name' | 'createdAt' | 'updatedAt') {
		if (sortBy === by) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = by;
			sortOrder = 'asc';
		}
		updateUrl();
	}

	function goToPage(page: number) {
		currentPage = Math.max(1, Math.min(page, totalPages));
		updateUrl();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>{config.plural} | Compendium | D&D</title>
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-b from-[var(--color-bg-primary)] to-[var(--color-bg-secondary)]"
>
	<div class="mx-auto max-w-7xl px-4 py-8">
		<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<a
					href="/compendium"
					class="text-sm text-[var(--color-text-muted)] transition-colors hover:text-accent"
				>
					← Back to Compendium
				</a>
				<h1
					class="mt-2 flex items-center gap-3 text-3xl font-bold text-[var(--color-text-primary)]"
				>
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
			<div class="relative max-w-md flex-1">
				<input
					type="text"
					placeholder="Search {config.plural.toLowerCase()}..."
					value={searchQuery}
					oninput={handleSearch}
					class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-2 pl-10 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
				/>
				<svg
					class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
			</div>

			<div class="flex gap-2">
				<button
					onclick={() => handleSort('name')}
					class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:border-accent hover:text-accent {sortBy ===
					'name'
						? 'border-accent text-accent'
						: ''}"
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
				<div class="mb-4 text-6xl">🔍</div>
				<h2 class="text-xl font-semibold text-[var(--color-text-primary)]">
					No {config.plural.toLowerCase()} found
				</h2>
				<p class="mt-2 text-[var(--color-text-secondary)]">
					{searchQuery ? `No results for "${searchQuery}"` : 'No items available in this category'}
				</p>
				{#if searchQuery}
					<button
						onclick={() => {
							searchQuery = '';
							currentPage = 1;
							updateUrl();
						}}
						class="mt-4 rounded-lg bg-accent px-4 py-2 text-white transition-opacity hover:opacity-90"
					>
						Clear search
					</button>
				{/if}
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each items as item (item.key)}
					{@const itemData = item.data as CardItemData}
					<SurfaceCard href="/compendium/{data.type}/{item.key}" class="group">
						<div class="p-4">
							<h3
								class="line-clamp-1 font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-accent"
							>
								{item.name}
							</h3>
							{#if item.description}
								<p class="mt-2 line-clamp-2 text-sm text-[var(--color-text-secondary)]">
									{item.description}
								</p>
							{/if}
							{#if data.type === 'spells' && itemData}
								<div class="mt-3 flex flex-wrap gap-1">
									{#if itemData.level !== undefined}
										<Badge variant="solid">
											{itemData.level === 0 ? 'Cantrip' : `Level ${itemData.level}`}
										</Badge>
									{/if}
									{#if itemData.school}
										<Badge variant="outline"
											>{getSchoolLabel(itemData.school)}</Badge
										>
									{/if}
								</div>
							{:else if data.type === 'creatures' && itemData}
								<div class="mt-3 flex flex-wrap gap-1">
									{#if itemData.challenge_rating_text}
										<Badge variant="solid">CR {itemData.challenge_rating_text}</Badge>
									{/if}
									{#if itemData.type}
										<Badge variant="outline">{getTypeLabel(itemData.type)}</Badge>
									{/if}
								</div>
							{:else if data.type === 'classes' && itemData}
								<div class="mt-3 flex flex-wrap gap-1">
									{#if itemData.hit_dice}
										<Badge variant="solid">d{itemData.hit_dice}</Badge>
									{/if}
								</div>
							{/if}
							{#if item.documentName}
								<div class="mt-3">
									<Badge variant="outline" class="text-xs opacity-70">{item.documentName}</Badge>
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
									class="min-w-[2.5rem] rounded-lg border {currentPage === pageNum
										? 'border-accent bg-accent/20 text-accent'
										: 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-accent'} px-3 py-2 text-sm transition-colors"
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
