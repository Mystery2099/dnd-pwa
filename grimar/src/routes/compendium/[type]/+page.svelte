<script lang="ts">
	import { page } from '$app/state';
	import { pushState } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import CompendiumShell from '$lib/components/compendium/layout/CompendiumShell.svelte';
	import CompendiumSidebar from '$lib/components/compendium/layout/CompendiumSidebar.svelte';
	import FilterGroup from '$lib/components/compendium/layout/FilterGroup.svelte';
	import CompendiumListItem from '$lib/components/compendium/CompendiumListItem.svelte';
	import CompendiumDetail from '$lib/components/compendium/CompendiumDetail.svelte';
	import Pagination from '$lib/components/compendium/Pagination.svelte';
	import { Download, RefreshCw } from 'lucide-svelte';
	import { CompendiumFilterStore } from '$lib/client/CompendiumFilterStore.svelte';
	import CompendiumLoading from '$lib/components/compendium/ui/CompendiumLoading.svelte';
	import FilterLogicToggle from '$lib/components/compendium/ui/FilterLogicToggle.svelte';
	import CompendiumError from '$lib/components/compendium/ui/CompendiumError.svelte';

	// Detail Content Components
	import SpellDetailContent from '$lib/components/compendium/detail/SpellDetailContent.svelte';
	import MonsterDetailContent from '$lib/components/compendium/detail/MonsterDetailContent.svelte';

	let { data } = $props();

	// -- Config & Derived --
	const config = $derived(data.config);
	const dbType = $derived(data.dbType);
	const pathType = $derived(data.pathType);

	// Initialize filter store using config
	// Note: We recreate this when pathType changes
	let filters = $derived.by(() => new CompendiumFilterStore(config));

	// Sync filters with URL state
	$effect(() => {
		// Only sync filters when on list page, not overlay
		if (page.url.pathname === `/compendium/${pathType}`) {
			filters.syncWithUrl(page.url);
		}
	});

	// Restore filter state from sessionStorage on mount
	onMount(() => {
		const saved = sessionStorage.getItem(config.routes.storageKeyFilters);
		if (saved) {
			try {
				filters.deserialize(JSON.parse(saved));
				sessionStorage.removeItem(config.routes.storageKeyFilters);
			} catch (e) {
				console.warn('Failed to restore filter state:', e);
			}
		}

		// Keyboard navigation
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

	// -- State --
	let selectedItem = $state<any | null>(null);
	let loadedItems = $state<any[]>([]);
	let listContainer = $state<HTMLElement>();

	// Populate loadedItems when streamed data resolves
	$effect(() => {
		const resolved = data.streamed.items;
		if (resolved && typeof resolved.then === 'function') {
			resolved.then((result: any) => {
				if (result?.items) {
					loadedItems = result.items;
				}
			});
		} else if (resolved && (resolved as any)?.items) {
			loadedItems = (resolved as any).items;
		}
	});

	// Navigation state for overlay
	const itemNav = $derived(() => {
		if (!selectedItem) return null;
		if (!loadedItems || loadedItems.length === 0) return null;

		const externalId = selectedItem.externalId;
		if (!externalId) return null;

		const idx = loadedItems.findIndex((i: any) => i.externalId === externalId);
		if (idx === -1) return null;

		return {
			prev: idx > 0 ? loadedItems[idx - 1] : null,
			next: idx < loadedItems.length - 1 ? loadedItems[idx + 1] : null
		};
	});

	// Reset scroll on URL changes
	let prevUrl = $state(page.url.href);
	$effect(() => {
		const currentUrl = page.url.href;
		const currentPathname = page.url.pathname;
		const prevPathname = prevUrl ? new URL(prevUrl).pathname : '';

		const isOverlayNav =
			currentPathname.startsWith(`/compendium/${pathType}/`) &&
			prevPathname.startsWith(`/compendium/${pathType}/`);

		if (listContainer && !isOverlayNav) {
			listContainer.scrollTop = 0;
		}
		prevUrl = currentUrl;
	});

	// URL sync effect for overlay state
	$effect(() => {
		const pathname = page.url.pathname;
		const parts = pathname.split('/');
		const state = page.state as { selectedItem?: any };

		// Check if on detail route: /compendium/[type]/[slug]
		const isDetailRoute = parts.length === 4 && parts[2] === pathType && parts[3];

		if (state.selectedItem) {
			if (!selectedItem || selectedItem.externalId !== state.selectedItem.externalId) {
				selectedItem = state.selectedItem;
			}
			return;
		}

		if (isDetailRoute && parts[3]) {
			const slug = parts[3];
			if (loadedItems && loadedItems.length > 0) {
				const item = loadedItems.find((i: any) => i.externalId === slug);
				if (item && (!selectedItem || selectedItem.externalId !== slug)) {
					selectedItem = item;
				}
			}
		} else {
			selectedItem = null;
		}
	});

	// -- Actions --
	function handleSearch(term: string) {
		filters.setSearchTerm(term);
	}

	function handleSort(value: string) {
		const [sortBy, sortOrder] = value.split('-');
		filters.setSort(sortBy, sortOrder as 'asc' | 'desc');
	}

	function toggleLogic() {
		filters.toggleLogic();
	}

	function clearFilters() {
		filters.clearFilters();
	}

	function toggleFilter(key: string, value: string | number) {
		filters.toggle(key, String(value));
	}

	async function selectItem(item: any) {
		sessionStorage.setItem(config.routes.storageKeyFilters, JSON.stringify(filters.serialize()));
		sessionStorage.setItem(config.routes.storageKeyListUrl, window.location.href);

		pushState(`/compendium/${pathType}/${item.externalId}`, {
			selectedItem: item
		});
	}

	function closeOverlay() {
		if (page.url.pathname !== `/compendium/${pathType}`) {
			pushState(`/compendium/${pathType}`, {});
		} else {
			selectedItem = null;
		}
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

<CompendiumShell>
	{#snippet sidebar()}
		<CompendiumSidebar
			onSearch={handleSearch}
			onClear={clearFilters}
			onSort={handleSort}
			sortOptions={config.sorting.options}
			initialSort={`${filters.sortBy}-${filters.sortOrder}`}
			hasActiveFilters={filters.hasActiveFilters}
		>
			{#snippet filters()}
				<FilterLogicToggle logic={filters.filterLogic} onToggle={toggleLogic} />

				{#each config.filters as group (group.key)}
					<FilterGroup title={group.title} open={group.openByDefault}>
						<div class="flex flex-wrap gap-2">
							{#each group.values as option (option.value)}
								{@const isSelected = filters.getSet(group.key).has(String(option.value))}
								<button
									class={`group rounded-md border px-2 py-1 text-xs transition-all ${
										isSelected
											? `${
													option.color?.base || 'border-purple-400 text-purple-300'
												} border-current bg-current/10 text-current shadow-[0_0_12px_rgba(255,255,255,0.1)]`
											: 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
									}`}
									onclick={() => toggleFilter(group.key, option.value)}
								>
									{option.label}
								</button>
							{/each}
						</div>
					</FilterGroup>
				{/each}
			{/snippet}
		</CompendiumSidebar>
	{/snippet}

	<div class="relative h-full">
		<div
			bind:this={listContainer}
			class="h-full overflow-y-auto {selectedItem ? 'hidden lg:block' : 'block'}"
		>
			{#await data.streamed.items}
				<CompendiumLoading
					message={`Loading ${config.ui.displayNamePlural.toLowerCase()}...`}
					subtext="Fetching from archives"
					accentColor={config.ui.categoryAccent.replace('text', 'border-t')}
				/>
			{:then resolved}
				{#if !resolved.hasAnyItems}
					<div class="flex h-full items-center justify-center p-8">
						<div class="max-w-md text-center">
							<div class="mb-6 text-6xl">
								<config.ui.icon class="mx-auto size-16" />
							</div>
							<h3 class="mb-4 text-xl font-bold text-white">
								{config.ui.databaseEmptyState.title}
							</h3>
							<p class="mb-6 text-gray-400">
								{config.ui.databaseEmptyState.description}
							</p>

							<!-- Sync Button -->
							<div class="mb-6 flex justify-center">
								<button
									class="relative flex items-center gap-2 rounded-lg border border-white/10 bg-linear-to-r from-white/10 to-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
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
								<div class="mb-4 rounded-md border border-green-500/30 bg-green-500/10 p-3">
									<p class="text-sm text-green-400">{syncMessage}</p>
								</div>
							{/if}

							{#if syncError}
								<div class="mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3">
									<p class="text-sm text-red-400">{syncError}</p>
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<div class="grid grid-cols-1 gap-3 p-1 md:grid-cols-2 xl:grid-cols-3">
						{#each resolved.items as item (item.externalId ?? item.__rowId ?? item.name)}
							<CompendiumListItem
								title={item.name}
								subtitle={config.display.subtitle(item)}
								source={item.source}
								icon={config.ui.icon}
								accentClass={config.display.listItemAccent(item)}
								onclick={() => selectItem(item)}
							/>
						{/each}
					</div>

					{#if resolved.items.length === 0}
						<div class="py-12 text-center text-gray-500">
							{config.ui.emptyState.title}. {config.ui.emptyState.description}
						</div>
					{/if}

					{#if !selectedItem && resolved.pagination && resolved.pagination.totalPages > 1}
						<div class="mt-2">
							<Pagination pagination={resolved.pagination} baseUrl={`/compendium/${pathType}`} />
						</div>
					{/if}
				{/if}
			{:catch error}
				<CompendiumError message={error.message} />
			{/await}
		</div>

		<!-- Detail View Overlay -->
		{#if selectedItem}
			<div class="absolute inset-0 z-20 p-2 lg:p-4" transition:fly={{ x: 20, duration: 300 }}>
				<CompendiumDetail
					title={selectedItem.name}
					type={config.ui.displayName}
					source={selectedItem.source}
					tags={config.display.tags(selectedItem)}
					onClose={closeOverlay}
					accentColor={config.display.detailAccent(selectedItem)}
					animate={false}
				>
					{#if dbType === 'spell'}
						<SpellDetailContent spell={selectedItem} />
					{:else if dbType === 'monster'}
						<MonsterDetailContent monster={selectedItem} />
					{:else}
						<div class="space-y-4">
							<div class="rounded-lg border border-white/10 bg-black/20 p-4 font-mono text-xs">
								<pre>{JSON.stringify(selectedItem, null, 2)}</pre>
							</div>
						</div>
					{/if}
				</CompendiumDetail>
			</div>
		{/if}
	</div>
</CompendiumShell>
