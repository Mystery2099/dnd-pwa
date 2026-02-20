<script lang="ts">
	import { page } from '$app/state';
	import { pushState } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { browser } from '$app/environment';
	import { createCompendiumAllQuery } from '$lib/core/client/queries';
	import { getCompendiumConfig } from '$lib/core/constants/compendium';
	import CompendiumShell from '$lib/features/compendium/components/layout/CompendiumShell.svelte';
	import CompendiumSidebar from '$lib/features/compendium/components/layout/CompendiumSidebar.svelte';
	import FilterGroup from '$lib/features/compendium/components/layout/FilterGroup.svelte';
	import CompendiumListItem from '$lib/features/compendium/components/EntryListItem.svelte';
	import CompendiumCardItem from '$lib/features/compendium/components/EntryCard.svelte';
	import CompendiumEntryView from '$lib/features/compendium/components/CompendiumEntryView.svelte';
	import VirtualList from '$lib/components/ui/VirtualList.svelte';
	import { Download, RefreshCw } from 'lucide-svelte';
	import { CompendiumFilterStore } from '$lib/features/compendium/stores/filter.svelte';
	import type { CompendiumItem, CompendiumType } from '$lib/core/types/compendium';
	import CompendiumSkeleton from '$lib/features/compendium/components/ui/CompendiumSkeleton.svelte';
	import CompendiumError from '$lib/features/compendium/components/ui/CompendiumError.svelte';
	import { settingsStore } from '$lib/core/client/settingsStore.svelte';
	import { userSettingsStore } from '$lib/core/client/userSettingsStore.svelte';
	import VirtualGrid from '$lib/components/ui/VirtualGrid.svelte';

	// Entry Content Component
	import EntryContentRenderer from '$lib/features/compendium/components/entry-content/EntryContentRenderer.svelte';

	// Lookup types that use the simple reference view
	const LOOKUP_TYPES = ['skills', 'conditions', 'languages', 'alignments'] as const;

	let { data } = $props();

	// -- Config & Derived --
	const pathType = $derived(data.pathType);
	const dbType = $derived(data.dbType);
	// Load config client-side to avoid SSR serialization issues with Svelte components
	// Use non-null assertion since pathType should always be defined when page renders
	const config = $derived(pathType ? getCompendiumConfig(pathType) : {
		ui: { displayName: 'Loading...' }
	} as ReturnType<typeof getCompendiumConfig>);

	// Page title
	const pageTitle = $derived(`${config.ui.displayName} - Grimar Compendium`);

	// TanStack Query for compendium data - only available on client
	// Use onMount to avoid hydration mismatch (effects run during hydration)
	let query = $state<ReturnType<typeof createCompendiumAllQuery> | null>(null);
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
		if (pathType) {
			query = createCompendiumAllQuery(pathType);
		}
	});

	// Map CompendiumTypeConfig to CompendiumFilterConfig expected by the store
	const filterConfig = $derived({
		setParams: config.filters.reduce(
			(acc: Record<string, string>, f: any) => ({ ...acc, [f.urlParam]: f.key }),
			{}
		),
		validSortBy: config.sorting.options.map((o: any) => o.column),
		defaults: {
			sortBy: config.sorting.default.column,
			sortOrder: config.sorting.default.direction
		}
	});

	// Initialize filter store once - recreate only when pathType changes
	let filters = $state<CompendiumFilterStore | null>(null);

	// Create/recreate filter store when pathType changes
	$effect(() => {
		if (pathType && mounted) {
			filters = new CompendiumFilterStore(filterConfig);
		}
	});

	// Build search index when data loads
	$effect(() => {
		if (filters && query?.data?.items && query.data.items.length > 0) {
			filters.buildSearchIndex(query.data.items);
		}
	});

	// -- State --
	let selectedItem = $state<CompendiumItem | null>(null);

	// Derived filtered items
	const filteredItems = $derived.by(() => {
		if (!query?.data?.items || !filters) return [];
		return filters.apply<CompendiumItem>(query.data.items);
	});

	// Navigation helper - finds adjacent items in the current list
	// Use database id to uniquely identify items (handles duplicates from different sources)
	let itemNav = $derived(() => {
		const items = filteredItems;
		if (!selectedItem || items.length === 0) return null;
		const selectedId = selectedItem.id;
		const idx = items.findIndex((i) => i.id === selectedId);
		if (idx === -1) return null;
		return {
			prev: items[idx - 1] ?? null,
			next: items[idx + 1] ?? null
		};
	});

	// Select an item for detail view
	function selectItem(item: CompendiumItem) {
		selectedItem = item;
		// Update URL to include item identifier for deep linking
		const itemId = item.externalId || item.name?.toLowerCase().replace(/\s+/g, '-');
		const provider = item.source || 'open5e';
		const sourceBook = item.sourceBook || 'SRD';
		pushState(`/compendium/${pathType}/${provider}/${sourceBook}/${itemId}`, {});
	}

	// Sync filters with URL state
	$effect(() => {
		// Only sync filters when on list page, not overlay
		if (filters && page.url.pathname === `/compendium/${pathType}`) {
			filters.syncWithUrl(page.url);
		}
	});

	// Restore filter state from sessionStorage on mount
	onMount(() => {
		if (!filters) return;
		const saved = sessionStorage.getItem(config.routes.storageKeyFilters);
		if (saved) {
			try {
				filters.deserialize(JSON.parse(saved));
				sessionStorage.removeItem(config.routes.storageKeyFilters);
			} catch (e) {
				console.warn('Failed to restore filter state:', e);
			}
		}

		// Sync on load if setting is enabled
		if (userSettingsStore.data.syncOnLoad) {
			syncItems();
		}
	});

	// Keyboard navigation using $effect to avoid stale closures
	$effect(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && selectedItem) {
				closeOverlay();
			} else if (e.key === 'ArrowLeft' && itemNav()?.prev) {
				selectItem(itemNav()!.prev!);
			} else if (e.key === 'ArrowRight' && itemNav()?.next) {
				selectItem(itemNav()!.next!);
			}
		};

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	function closeOverlay() {
		// If we arrived here via pushState, going back is cleaner
		if (page.url.pathname !== `/compendium/${pathType}`) {
			if (window.history.length > 1) {
				window.history.back();
			} else {
				pushState(`/compendium/${pathType}`, {});
			}
		}
		selectedItem = null;
	}

	// -- Filter Handlers --
	function toggleFilter(groupKey: string, value: string) {
		filters?.toggle(groupKey, String(value));
	}

	function clearFilters() {
		filters?.clearFilters();
	}

	function handleSort(value: string) {
		if (!filters) return;
		const [sortBy, sortOrder] = value.split('-');
		filters.setSort(sortBy, (sortOrder as 'asc' | 'desc') || 'asc');
	}

	// -- Sync --
	let isSyncing = $state(false);
	let syncMessage = $state('');
	let syncError = $state('');

	async function syncItems() {
		isSyncing = true;
		syncMessage = '';
		syncError = '';

		try {
			const response = await fetch('/api/compendium/sync', {
				method: 'POST'
			});

			const result = await response.json();

			if (result.ok) {
				syncMessage = `Synced successfully! The page will refresh shortly.`;
				setTimeout(() => {
					window.location.href = `/compendium/${pathType}?t=${Date.now()}`;
				}, 2000);
			} else {
				syncError = result.error || 'Failed to sync compendium';
			}
		} catch (e) {
			syncError = e instanceof Error ? e.message : 'Network error';
		} finally {
			isSyncing = false;
		}
	}
</script>

{#snippet filtersSnippet()}
	{#each config.filters as group (group.key)}
		<FilterGroup title={group.title} open={group.openByDefault}>
			<div class="flex flex-wrap gap-2">
				{#each group.values as option (option.value)}
					{@const isSelected = filters?.getSet(group.key).has(String(option.value)) ?? false}
					<button
						class={`group rounded-md border px-2 py-1 text-xs transition-all ${
							isSelected
								? `${
										option.color?.base || 'border-[var(--color-accent)] text-[var(--color-accent)]'
									} border-current bg-current/10 text-current shadow-[0_0_12px_color-mix(in_srgb,var(--color-text-primary)_10%,transparent)]`
								: 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)]'
						}`}
						onclick={() => toggleFilter(group.key, String(option.value))}
					>
						{option.label}
					</button>
				{/each}
			</div>
		</FilterGroup>
	{/each}
{/snippet}

{#snippet sidebarSnippet()}
	<CompendiumSidebar
		onClear={clearFilters}
		onSort={handleSort}
		sortOptions={config.sorting.options}
		initialSort={filters ? `${filters.sortBy}-${filters.sortOrder}` : 'name-asc'}
		hasActiveFilters={filters?.hasActiveFilters ?? false}
		filters={filtersSnippet}
	/>
{/snippet}

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<CompendiumShell sidebar={sidebarSnippet}>
	<!-- Fixed header -->
	<header class="mb-4 shrink-0 border-b border-[var(--color-border)] pb-4">
		<h1 class="text-2xl font-bold text-[var(--color-text-primary)]">
			{config.ui.displayName}
		</h1>
	</header>

	<!-- Scrollable entries container -->
	<div class="relative flex min-h-0 flex-1 flex-col {selectedItem ? 'lg:flex' : 'flex'}">
		{#if !mounted}
			<!-- Loading state during hydration - use default to avoid SSR/client mismatch -->
			<CompendiumSkeleton variant="grid" count={8} />
		{:else if query?.isPending}
			{#if settingsStore.settings.defaultCompendiumView === 'grid'}
				<CompendiumSkeleton variant="grid" count={8} />
			{:else}
				<CompendiumSkeleton variant="list" count={8} />
			{/if}
		{:else if !query}
			<CompendiumError message="Failed to initialize query" />
		{:else if query.isError}
			<CompendiumError
				message={query.error instanceof Error ? query.error.message : 'Unknown error'}
			/>
		{:else}
			{@const resolved = query.data}
			{#if !resolved?.hasAnyItems}
				<div class="z-50 flex h-full items-center justify-center p-8">
					<div class="max-w-md text-center">
						<div class="mb-6 text-6xl">
							<config.ui.icon class="mx-auto size-16" />
						</div>
						<h3 class="mb-4 text-xl font-bold text-[var(--color-text-primary)]">
							{config.ui.databaseEmptyState.title}
						</h3>
						<p class="mb-6 text-[var(--color-text-muted)]">
							{config.ui.databaseEmptyState.description}
						</p>

						<!-- Sync Button -->
						<div class="mb-6 flex justify-center">
							<button
								class="relative flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-bg-overlay)] disabled:cursor-not-allowed disabled:opacity-50"
								onclick={syncItems}
								disabled={isSyncing}
							>
								{#if isSyncing}
									<RefreshCw class="h-4 w-4 animate-spin" />
									Syncing...
								{:else}
									<Download class="h-4 w-4" />
									{config.ui.databaseEmptyState.ctaText || 'Sync Now'}
								{/if}
							</button>
						</div>

						{#if syncMessage}
							<div
								class="mb-4 rounded-md border border-[var(--color-gem-emerald)]/30 bg-[var(--color-gem-emerald)]/10 p-3"
							>
								<p class="text-sm text-[var(--color-gem-emerald)]">{syncMessage}</p>
							</div>
						{/if}

						{#if syncError}
							<div
								class="mb-4 rounded-md border border-[var(--color-gem-ruby)]/30 bg-[var(--color-gem-ruby)]/10 p-3"
							>
								<p class="text-sm text-[var(--color-gem-ruby)]">{syncError}</p>
							</div>
						{/if}
					</div>
				</div>
			{:else if filteredItems.length === 0}
				<div
					class="flex flex-1 items-center justify-center py-12 text-center text-[var(--color-text-muted)]"
				>
					{config.ui.emptyState.title}. {config.ui.emptyState.description}
				</div>
			{:else}
				<div class="relative z-10 max-h-[calc(100vh-280px)] min-h-0 flex-1">
					{#if settingsStore.settings.defaultCompendiumView === 'grid'}
						<VirtualGrid
							items={filteredItems}
							class="glass-scroll"
							mobileMinCardWidth={140}
							tabletMinCardWidth={180}
							minCardWidth={220}
						>
							{#snippet children(item: CompendiumItem, _index: number)}
								{@const sourcePrefix = item.externalId?.includes('_')
									? item.externalId.split('_', 2)[0]
									: ''}
								{@const itemId = item.externalId?.includes('_')
									? item.externalId.split('_', 2)[1]
									: item.externalId}
								{@const slug = `providers/${sourcePrefix}/${itemId}`}
								<CompendiumCardItem
									title={item.name}
									subtitle={config.display.subtitle(item)}
									sourceBook={item.sourceBook}
									icon={config.ui.icon}
									school={config.display.cardSchool?.(item)}
									variant="grid"
									type={pathType}
									{slug}
									onclick={() => selectItem(item)}
								/>
							{/snippet}
						</VirtualGrid>
					{:else}
						<VirtualList items={filteredItems} class="glass-scroll p-1">
							{#snippet children(item: CompendiumItem, _index: number)}
								{@const sourcePrefix = item.externalId?.includes('_')
									? item.externalId.split('_', 2)[0]
									: ''}
								{@const itemId = item.externalId?.includes('_')
									? item.externalId.split('_', 2)[1]
									: item.externalId}
								{@const slug = `providers/${sourcePrefix}/${itemId}`}
								<div class="p-1">
									<CompendiumListItem
										title={item.name}
										subtitle={config.display.subtitle(item)}
										sourceBook={item.sourceBook}
										icon={config.ui.icon}
										type={pathType}
										{slug}
										onclick={() => selectItem(item)}
									/>
								</div>
							{/snippet}
						</VirtualList>
					{/if}
				</div>
			{/if}
		{/if}
	</div>

	<!-- Detail View Overlay -->
	{#if selectedItem}
		{@const sourceBook = selectedItem.sourceBook || 'SRD'}
		<div class="absolute inset-0 z-50 p-2 lg:p-4" transition:fly={{ x: 20, duration: 300 }}>
			<CompendiumEntryView
				title={selectedItem.name}
				type={config.ui.displayName}
				{sourceBook}
				tags={config.display.tags(selectedItem)}
				onClose={closeOverlay}
				accentColor={config.display.detailAccent(selectedItem)}
				animate={false}
			>
				<EntryContentRenderer dbType={dbType as CompendiumType} details={selectedItem.details ?? {}} />
			</CompendiumEntryView>
		</div>
	{/if}
</CompendiumShell>
