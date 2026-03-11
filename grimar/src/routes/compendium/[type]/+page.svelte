<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';
	import { createCompendiumQuery, prefetchCompendiumDetail } from '$lib/core/client/queries';
	import { queryClient } from '$lib/core/client/query-client';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Breadcrumb from '$lib/components/ui/Breadcrumb.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import VirtualGrid from '$lib/components/ui/VirtualGrid.svelte';
	import { Select } from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import * as Pagination from '$lib/components/ui/pagination';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import { COMPENDIUM_TYPE_CONFIGS } from '$lib/core/constants/compendium';
	import type { CompendiumItem, CompendiumTypeName } from '$lib/core/types/compendium';
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

	type SortBy = 'name' | 'createdAt' | 'updatedAt';
	type SortOrder = 'asc' | 'desc';
	type SelectOption = {
		label: string;
		value: string;
	};
	const SEARCH_DEBOUNCE_MS = 250;
	const SOURCE_DEBOUNCE_MS = 250;
	const VIRTUALIZATION_THRESHOLD = 30;

	const SORT_BY_OPTIONS: SelectOption[] = [
		{ label: 'Name', value: 'name' },
		{ label: 'Created', value: 'createdAt' },
		{ label: 'Updated', value: 'updatedAt' }
	];
	const SORT_ORDER_OPTIONS: SelectOption[] = [
		{ label: 'Ascending', value: 'asc' },
		{ label: 'Descending', value: 'desc' }
	];
	const SPELL_LEVEL_OPTIONS: SelectOption[] = [
		{ label: 'Any Level', value: 'all' },
		{ label: 'Cantrip (0)', value: '0' },
		{ label: 'Level 1', value: '1' },
		{ label: 'Level 2', value: '2' },
		{ label: 'Level 3', value: '3' },
		{ label: 'Level 4', value: '4' },
		{ label: 'Level 5', value: '5' },
		{ label: 'Level 6', value: '6' },
		{ label: 'Level 7', value: '7' },
		{ label: 'Level 8', value: '8' },
		{ label: 'Level 9', value: '9' }
	];
	const SPELL_SCHOOL_OPTIONS: SelectOption[] = [
		{ label: 'Any School', value: 'all' },
		{ label: 'Abjuration', value: 'abjuration' },
		{ label: 'Conjuration', value: 'conjuration' },
		{ label: 'Divination', value: 'divination' },
		{ label: 'Enchantment', value: 'enchantment' },
		{ label: 'Evocation', value: 'evocation' },
		{ label: 'Illusion', value: 'illusion' },
		{ label: 'Necromancy', value: 'necromancy' },
		{ label: 'Transmutation', value: 'transmutation' }
	];
	const CREATURE_TYPE_OPTIONS: SelectOption[] = [
		{ label: 'Any Type', value: 'all' },
		{ label: 'Aberration', value: 'aberration' },
		{ label: 'Beast', value: 'beast' },
		{ label: 'Celestial', value: 'celestial' },
		{ label: 'Construct', value: 'construct' },
		{ label: 'Dragon', value: 'dragon' },
		{ label: 'Elemental', value: 'elemental' },
		{ label: 'Fey', value: 'fey' },
		{ label: 'Fiend', value: 'fiend' },
		{ label: 'Giant', value: 'giant' },
		{ label: 'Humanoid', value: 'humanoid' },
		{ label: 'Monstrosity', value: 'monstrosity' },
		{ label: 'Ooze', value: 'ooze' },
		{ label: 'Plant', value: 'plant' },
		{ label: 'Undead', value: 'undead' }
	];
	const CHALLENGE_RATING_OPTIONS: SelectOption[] = [
		{ label: 'Any CR', value: 'all' },
		{ label: '0', value: '0' },
		{ label: '1/8', value: '0.125' },
		{ label: '1/4', value: '0.25' },
		{ label: '1/2', value: '0.5' },
		{ label: '1', value: '1' },
		{ label: '2', value: '2' },
		{ label: '3', value: '3' },
		{ label: '4', value: '4' },
		{ label: '5', value: '5' },
		{ label: '6', value: '6' },
		{ label: '7', value: '7' },
		{ label: '8', value: '8' },
		{ label: '9', value: '9' },
		{ label: '10+', value: '10' }
	];

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

	const initialSearchQuery = $page.url.searchParams.get('search') ?? '';
	let searchInput = $state(initialSearchQuery);
	let searchQuery = $state(initialSearchQuery);
	const initialSourceFilter = $page.url.searchParams.get('source') ?? '';
	let sourceInput = $state(initialSourceFilter);
	let currentPage = $state(Number($page.url.searchParams.get('page')) || 1);
	let sortBy = $state(($page.url.searchParams.get('sortBy') as SortBy) ?? 'name');
	let sortOrder = $state(($page.url.searchParams.get('sortOrder') as SortOrder) ?? 'asc');
	let sourceFilter = $state(initialSourceFilter);
	let creatureTypeFilter = $state($page.url.searchParams.get('creatureType') ?? 'all');
	let spellLevelFilter = $state($page.url.searchParams.get('spellLevel') ?? 'all');
	let spellSchoolFilter = $state($page.url.searchParams.get('spellSchool') ?? 'all');
	let challengeRatingFilter = $state($page.url.searchParams.get('challengeRating') ?? 'all');

	let config = $derived(COMPENDIUM_TYPE_CONFIGS[data.type]);
	let query = $derived(
		createCompendiumQuery(data.type as CompendiumTypeName, {
			search: searchQuery || undefined,
			page: currentPage,
			sortBy,
			sortOrder,
			source: sourceFilter || undefined,
			includeSubclasses: data.type === 'classes' ? false : data.type === 'subclasses' ? true : undefined,
			onlySubclasses: data.type === 'subclasses' ? true : undefined,
			creatureType: data.type === 'creatures' && creatureTypeFilter !== 'all' ? creatureTypeFilter : undefined,
			spellLevel: data.type === 'spells' && spellLevelFilter !== 'all' ? spellLevelFilter : undefined,
			spellSchool: data.type === 'spells' && spellSchoolFilter !== 'all' ? spellSchoolFilter : undefined,
			challengeRating:
				data.type === 'creatures' && challengeRatingFilter !== 'all' ? challengeRatingFilter : undefined
		})
	);
	let items = $derived(query.data?.items ?? []);
	let totalItems = $derived(query.data?.total ?? 0);
	let totalPages = $derived(query.data?.totalPages ?? 1);
	let pageSize = $derived(query.data?.pageSize ?? 50);
	let isLoading = $derived(query.isFetching);
	let isMounted = $state(false);
	let searchDebounceTimeout: ReturnType<typeof setTimeout> | undefined;
	let sourceDebounceTimeout: ReturnType<typeof setTimeout> | undefined;

	onMount(() => {
		isMounted = true;
	});

	onDestroy(() => {
		if (searchDebounceTimeout) clearTimeout(searchDebounceTimeout);
		if (sourceDebounceTimeout) clearTimeout(sourceDebounceTimeout);
	});

	function updateUrl() {
		if (!isMounted) return;

		const parts: string[] = [];
		if (searchQuery) parts.push(`search=${encodeURIComponent(searchQuery)}`);
		if (currentPage > 1) parts.push(`page=${currentPage}`);
		if (sortBy !== 'name') parts.push(`sortBy=${sortBy}`);
		if (sortOrder !== 'asc') parts.push(`sortOrder=${sortOrder}`);
		if (sourceFilter) parts.push(`source=${encodeURIComponent(sourceFilter)}`);
		if (data.type === 'creatures' && creatureTypeFilter !== 'all') {
			parts.push(`creatureType=${encodeURIComponent(creatureTypeFilter)}`);
		}
		if (data.type === 'spells' && spellLevelFilter !== 'all') {
			parts.push(`spellLevel=${encodeURIComponent(spellLevelFilter)}`);
		}
		if (data.type === 'spells' && spellSchoolFilter !== 'all') {
			parts.push(`spellSchool=${encodeURIComponent(spellSchoolFilter)}`);
		}
		if (data.type === 'creatures' && challengeRatingFilter !== 'all') {
			parts.push(`challengeRating=${encodeURIComponent(challengeRatingFilter)}`);
		}
		const newUrl = parts.length > 0 ? `${$page.url.pathname}?${parts.join('&')}` : $page.url.pathname;
		const currentUrl = `${$page.url.pathname}${$page.url.search}`;
		if (newUrl === currentUrl) return;
		replaceState(newUrl, $page.state);
	}

	function handleSearch(e: Event) {
		const target = e.target as HTMLInputElement;
		searchInput = target.value;
		if (searchDebounceTimeout) clearTimeout(searchDebounceTimeout);
		searchDebounceTimeout = setTimeout(() => {
			searchQuery = searchInput;
			currentPage = 1;
			updateUrl();
		}, SEARCH_DEBOUNCE_MS);
	}

	function handleSortByChange(nextSortBy: string) {
		sortBy = nextSortBy as SortBy;
		currentPage = 1;
		updateUrl();
	}

	function handleSortOrderChange(nextSortOrder: string) {
		sortOrder = nextSortOrder as SortOrder;
		currentPage = 1;
		updateUrl();
	}

	function handleSourceFilterInput(e: Event) {
		const target = e.target as HTMLInputElement;
		sourceInput = target.value;
		if (sourceDebounceTimeout) clearTimeout(sourceDebounceTimeout);
		sourceDebounceTimeout = setTimeout(() => {
			sourceFilter = sourceInput;
			currentPage = 1;
			updateUrl();
		}, SOURCE_DEBOUNCE_MS);
	}

	function applyFilters() {
		currentPage = 1;
		updateUrl();
	}

	function handleSpellLevelChange(nextValue: string) {
		spellLevelFilter = nextValue;
		applyFilters();
	}

	function handleSpellSchoolChange(nextValue: string) {
		spellSchoolFilter = nextValue;
		applyFilters();
	}

	function handleCreatureTypeChange(nextValue: string) {
		creatureTypeFilter = nextValue;
		applyFilters();
	}

	function handleChallengeRatingChange(nextValue: string) {
		challengeRatingFilter = nextValue;
		applyFilters();
	}

	function handlePageChange(nextPage: number) {
		currentPage = nextPage;
		updateUrl();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function clearFilters() {
		if (searchDebounceTimeout) clearTimeout(searchDebounceTimeout);
		if (sourceDebounceTimeout) clearTimeout(sourceDebounceTimeout);
		searchInput = '';
		searchQuery = '';
		sourceInput = '';
		sourceFilter = '';
		creatureTypeFilter = 'all';
		spellLevelFilter = 'all';
		spellSchoolFilter = 'all';
		challengeRatingFilter = 'all';
		sortBy = 'name';
		sortOrder = 'asc';
		currentPage = 1;
		updateUrl();
	}

	function handleItemPrefetch(itemKey: string) {
		if (!queryClient) return;
		void prefetchCompendiumDetail(queryClient, data.type, itemKey).catch(() => {
			// Ignore prefetch errors; this is best-effort optimization.
		});
	}

	function prefetchOnVisible(node: HTMLElement, itemKey: string) {
		if (!browser || !queryClient || !('IntersectionObserver' in window)) return;

		let hasPrefetched = false;
		const observer = new IntersectionObserver(
			(entries) => {
				const isVisible = entries.some((entry) => entry.isIntersecting);
				if (!isVisible || hasPrefetched) return;
				hasPrefetched = true;
				handleItemPrefetch(itemKey);
				observer.disconnect();
			},
			{ rootMargin: '220px', threshold: 0.15 }
		);

		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
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
					<Breadcrumb items={[{ label: 'Compendium', href: '/compendium' }, { label: config.plural }]} />
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

		<div class="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/60 p-4">
			<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
				<div class="relative md:col-span-2 lg:col-span-2">
					<Input
						type="text"
						placeholder="Search {config.plural.toLowerCase()}..."
						value={searchInput}
						oninput={handleSearch}
						class="w-full pl-10"
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

				<Select
					type="single"
					value={sortBy}
					options={SORT_BY_OPTIONS}
					placeholder="Sort by"
					onchange={handleSortByChange}
				/>
				<Select
					type="single"
					value={sortOrder}
					options={SORT_ORDER_OPTIONS}
					placeholder="Sort order"
					onchange={handleSortOrderChange}
				/>

				<Input
					type="text"
					placeholder="Source (e.g. open5e)"
					value={sourceInput}
					oninput={handleSourceFilterInput}
				/>

				{#if data.type === 'spells'}
					<Select
						type="single"
						value={spellLevelFilter}
						options={SPELL_LEVEL_OPTIONS}
						placeholder="Spell level"
						onchange={handleSpellLevelChange}
					/>
					<Select
						type="single"
						value={spellSchoolFilter}
						options={SPELL_SCHOOL_OPTIONS}
						placeholder="Spell school"
						onchange={handleSpellSchoolChange}
					/>
				{/if}

				{#if data.type === 'creatures'}
					<Select
						type="single"
						value={creatureTypeFilter}
						options={CREATURE_TYPE_OPTIONS}
						placeholder="Creature type"
						onchange={handleCreatureTypeChange}
					/>
					<Select
						type="single"
						value={challengeRatingFilter}
						options={CHALLENGE_RATING_OPTIONS}
						placeholder="Challenge rating"
						onchange={handleChallengeRatingChange}
					/>
				{/if}
			</div>

			<div class="mt-3 flex justify-end">
				<Button
					onclick={clearFilters}
					variant="outline"
					size="sm"
				>
					Reset filters
				</Button>
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
					<Button
						onclick={clearFilters}
						class="mt-4"
					>
						Reset filters
					</Button>
				{/if}
			</div>
			{:else}
				{#snippet compendiumCard(item: CompendiumItem)}
					{@const itemData = item.data as CardItemData}
					<div use:prefetchOnVisible={item.key} class="h-full w-full">
						<SurfaceCard
							href="/compendium/{data.type}/{item.key}"
							class="group h-full w-full"
							onmouseenter={() => handleItemPrefetch(item.key)}
							onfocusin={() => handleItemPrefetch(item.key)}
						>
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
										<Badge variant="outline">{getSchoolLabel(itemData.school)}</Badge>
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
							{:else if (data.type === 'classes' || data.type === 'subclasses') && itemData}
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
					</div>
				{/snippet}

				{#if items.length >= VIRTUALIZATION_THRESHOLD}
					<div class="h-[70vh] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/20">
						<VirtualGrid
							items={items}
							estimateRowHeight={190}
							minCardWidth={260}
							mobileMinCardWidth={170}
							tabletMinCardWidth={220}
							gap={24}
							rowGap={32}
							resetScrollOnItemsChange={true}
						>
							{#snippet children(item: CompendiumItem, index: number)}
								{@render compendiumCard(item)}
							{/snippet}
						</VirtualGrid>
					</div>
				{:else}
					<div class="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{#each items as item (item.key)}
							{@render compendiumCard(item)}
						{/each}
					</div>
				{/if}

				{#if totalPages > 1}
					<div class="mt-8">
						<Pagination.Pagination
							count={totalItems}
							perPage={pageSize}
							siblingCount={1}
							bind:page={currentPage}
							onPageChange={handlePageChange}
						>
							{#snippet children({ pages, currentPage })}
								<Pagination.PaginationContent>
									<Pagination.PaginationItem>
										<Pagination.PaginationPrevious />
									</Pagination.PaginationItem>

									{#each pages as pageItem (pageItem.key)}
										<Pagination.PaginationItem>
											{#if pageItem.type === 'ellipsis'}
												<Pagination.PaginationEllipsis />
											{:else}
												<Pagination.PaginationLink
													page={pageItem}
													isActive={currentPage === pageItem.value}
												/>
											{/if}
										</Pagination.PaginationItem>
									{/each}

									<Pagination.PaginationItem>
										<Pagination.PaginationNext />
									</Pagination.PaginationItem>
								</Pagination.PaginationContent>
							{/snippet}
						</Pagination.Pagination>
					</div>
				{/if}
		{/if}
	</div>
</div>
