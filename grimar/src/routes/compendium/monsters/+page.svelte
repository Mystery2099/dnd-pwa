<script lang="ts">
	import { page } from '$app/state';
	import { pushState } from '$app/navigation';
	import { onMount } from 'svelte';
	import CompendiumShell from '$lib/components/compendium/layout/CompendiumShell.svelte';
	import CompendiumSidebar from '$lib/components/compendium/layout/CompendiumSidebar.svelte';
	import FilterGroup from '$lib/components/compendium/layout/FilterGroup.svelte';
	import CompendiumListItem from '$lib/components/compendium/CompendiumListItem.svelte';
	import CompendiumDetail from '$lib/components/compendium/CompendiumDetail.svelte';
	import Pagination from '$lib/components/compendium/Pagination.svelte';
	import { Skull, Download, RefreshCw } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import { CompendiumFilterStore } from '$lib/client/CompendiumFilterStore.svelte';
	import { MONSTERS_FILTER_CONFIG } from '$lib/constants/compendium';
	import { TYPE_COLORS } from '$lib/constants/monsters';
	import { MONSTERS_CONFIG } from './config/index';
	import CompendiumLoading from '$lib/components/compendium/ui/CompendiumLoading.svelte';
	import FilterLogicToggle from '$lib/components/compendium/ui/FilterLogicToggle.svelte';
	import CompendiumError from '$lib/components/compendium/ui/CompendiumError.svelte';
	import MonsterDetailContent from '$lib/components/compendium/detail/MonsterDetailContent.svelte';

	interface Monster {
		id: number;
		name: string;
		size: string;
		type: string;
		hit_points: number;
		armor_class: number;
		speed: string;
		special_abilities: Array<{ name: string; desc: string }>;
		actions: Array<{ name: string; desc: string }>;
		damage?: Array<{ damage_dice: string }>;
		externalId?: string;
		__rowId?: number;
		index?: string;
	}

	let { data } = $props();

	// -- Filter Store --
	const filters = new CompendiumFilterStore(MONSTERS_FILTER_CONFIG);

	// Sync with URL
	$effect(() => {
		filters.syncWithUrl(page.url);
	});

	// Restore filter state from sessionStorage on mount
	onMount(() => {
		const saved = sessionStorage.getItem('monster-filters');
		if (saved) {
			try {
				filters.deserialize(JSON.parse(saved));
				sessionStorage.removeItem('monster-filters');
			} catch (e) {
				console.warn('Failed to restore filter state:', e);
			}
		}

		// Keyboard navigation
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && selectedMonster) {
				closeOverlay();
			} else if (e.key === 'ArrowLeft' && itemNav()?.prev) {
				selectMonster(itemNav()!.prev!);
			} else if (e.key === 'ArrowRight' && itemNav()?.next) {
				selectMonster(itemNav()!.next!);
			}
		};

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	// -- State --
	let selectedMonster = $state<any | null>(null);
	let loadedMonsters = $state<Monster[]>([]);
	let listContainer = $state<HTMLElement>();

	// Populate loadedMonsters when data loads
	$effect(() => {
		const resolved = data.streamed.monsters;
		if (resolved && typeof resolved.then === 'function') {
			resolved.then((result: any) => {
				if (result?.monsters) {
					loadedMonsters = result.monsters;
				}
			});
		} else if (resolved && (resolved as any)?.monsters) {
			loadedMonsters = (resolved as any).monsters;
		}
	});

	// Navigation state - derived to update when filters change
	const itemNav = $derived(() => {
		if (!selectedMonster) return null;
		if (!loadedMonsters || loadedMonsters.length === 0) return null;

		const externalId = selectedMonster.externalId;
		if (!externalId) return null;

		const idx = loadedMonsters.findIndex((m: Monster) => m.externalId === externalId);
		if (idx === -1) return null;

		return {
			prev: idx > 0 ? loadedMonsters[idx - 1] : null,
			next: idx < loadedMonsters.length - 1 ? loadedMonsters[idx + 1] : null
		};
	});

	$effect(() => {
		// Reset scroll when URL changes (pagination/filters), but NOT for overlay navigation
		const currentUrl = page.url.href;
		const prevPathname = prevUrl ? new URL(prevUrl).pathname : '';
		const currentPathname = page.url.pathname;

		// Only reset if not just opening/closing overlay (both are monster routes)
		const isOverlayNav =
			currentPathname.startsWith('/compendium/monsters/') &&
			prevPathname.startsWith('/compendium/monsters/');

		if (listContainer && !isOverlayNav) {
			listContainer.scrollTop = 0;
		}
		prevUrl = currentUrl;
	});

	// URL sync effect - sync overlay state with URL changes
	$effect(() => {
		// Don't re-open if we're in the process of closing
		if (isClosing || !selectedMonster) return;

		const pathname = page.url.pathname;
		const parts = pathname.split('/');
		const state = page.state as { selectedMonster?: Monster };

		// Check if on detail route: /compendium/monsters/[slug]
		const isDetailRoute = parts.length === 4 && parts[3];

		// 1. Priority: State object from pushState/shallow routing
		if (state.selectedMonster) {
			if (selectedMonster.externalId !== state.selectedMonster.externalId) {
				selectedMonster = state.selectedMonster;
			}
			return;
		}

		// 2. Secondary: URL Slug (Direct load or Back/Forward nav without state)
		if (isDetailRoute && parts[3]) {
			const slug = parts[3];
			// Find monster in loaded list
			if (loadedMonsters && loadedMonsters.length > 0) {
				const monster = loadedMonsters.find((m: Monster) => m.externalId === slug);
				if (monster && selectedMonster.externalId !== slug) {
					selectedMonster = monster;
				}
			}
		} else if (pathname === '/compendium/monsters' && selectedMonster) {
			// Back to list, close overlay
			selectedMonster = null;
		}
	});

	let prevUrl = $state(page.url.href);

	// State for sync operation
	let isSyncing = $state(false);
	let syncMessage = $state('');
	let syncError = $state('');
	let isClosing = $state(false);

	const types = [
		'Beast',
		'Dragon',
		'Humanoid',
		'Monstrosity',
		'Undead',
		'Fiend',
		'Celestial',
		'Elemental',
		'Fey',
		'Aberration',
		'Construct'
	];

	const sizes = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];

	// -- Derived --
	const filterLogic = $derived(filters.filterLogic);
	const selectedType = $derived(filters.getSet('type'));
	const selectedSize = $derived(filters.getSet('size'));
	const hasActiveFilters = $derived(filters.hasActiveFilters);
	const currentSort = $derived(`${filters.sortBy}-${filters.sortOrder}`);

	function handleSearch(term: string) {
		filters.setSearchTerm(term);
	}

	async function selectMonster(monster: Monster) {
		sessionStorage.setItem('monster-filters', JSON.stringify(filters.serialize()));
		sessionStorage.setItem('monster-list-url', window.location.href);

		pushState(`/compendium/monsters/${monster.externalId}`, {
			selectedMonster: monster
		});
	}

	function closeOverlay() {
		isClosing = true;
		selectedMonster = null;
		if (page.url.pathname !== '/compendium/monsters') {
			pushState('/compendium/monsters', {});

			// Reset closing flag after navigation completes
			setTimeout(() => {
				isClosing = false;
			}, 100);
		} else {
			isClosing = false;
		}
	}

	function toggleType(type: string) {
		filters.toggle('type', type);
	}

	function toggleSize(size: string) {
		filters.toggle('size', size);
	}

	function toggleLogic() {
		filters.toggleLogic();
	}

	function clearFilters() {
		filters.clearFilters();
	}

	function handleSort(value: string) {
		const [sortBy, sortOrder] = value.split('-');
		filters.setSort(sortBy, sortOrder as 'asc' | 'desc');
	}

	// Function to trigger compendium sync
	async function syncItems() {
		isSyncing = true;
		syncMessage = '';
		syncError = '';

		try {
			const response = await fetch('/api/compendium/sync', {
				method: 'POST',
				body: new FormData()
			});

			const result = await response.json();

			if (result.ok) {
				syncMessage = `Synced ${result.summary.monsters} monsters successfully! The page will refresh shortly.`;
				setTimeout(() => {
					window.location.href = `/compendium/monsters?t=${Date.now()}`;
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
			sortOptions={[
				{ label: 'Name (A-Z)', value: 'name-asc' },
				{ label: 'Name (Z-A)', value: 'name-desc' },
				{ label: 'CR (Low to High)', value: 'challengeRating-asc' },
				{ label: 'CR (High to Low)', value: 'challengeRating-desc' },
				{ label: 'Type (A-Z)', value: 'monsterType-asc' },
				{ label: 'Type (Z-A)', value: 'monsterType-desc' },
				{ label: 'Size (Tiny to Gargantuan)', value: 'monsterSize-asc' },
				{ label: 'Size (Gargantuan to Tiny)', value: 'monsterSize-desc' }
			]}
			initialSort={currentSort}
			{hasActiveFilters}
		>
			{#snippet filters()}
				<FilterLogicToggle logic={filterLogic} onToggle={toggleLogic} />

				<FilterGroup title="Type">
					<div class="flex flex-wrap gap-2">
						{#each types as type (type)}
							<button
								data-testid="filter-type"
								data-type={type.toLowerCase()}
								class={`group rounded-md border px-2 py-1 text-xs transition-all ${
									selectedType.has(type)
										? `${
												TYPE_COLORS[type as keyof typeof TYPE_COLORS] ||
												'border-gray-400 text-gray-400'
											} border-current bg-current/10 text-current shadow-[0_0_12px_rgba(255,255,255,0.1)]`
										: 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
								}`}
								onclick={() => toggleType(type)}
							>
								{type}
							</button>
						{/each}
					</div>
				</FilterGroup>

				<FilterGroup title="Size">
					<div class="flex flex-wrap gap-2">
						{#each sizes as size (size)}
							<button
								data-testid="filter-size"
								class={`group rounded-md border px-2 py-1 text-xs transition-all ${
									selectedSize.has(size)
										? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
										: 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
								}`}
								onclick={() => toggleSize(size)}
							>
								{size}
							</button>
						{/each}
					</div>
				</FilterGroup>
			{/snippet}
		</CompendiumSidebar>
	{/snippet}

	<div class="relative h-full">
		<div
			bind:this={listContainer}
			data-testid="monster-grid"
			class="h-full overflow-y-auto {selectedMonster ? 'hidden lg:block' : 'block'}"
		>
			{#await data.streamed.monsters}
				<CompendiumLoading
					message="Loading monsters..."
					subtext="Fetching bestiary"
					accentColor="border-t-emerald-400"
				/>
			{:then resolved}
				{#if resolved.monsters.length === 0}
					<div class="flex h-full items-center justify-center p-8">
						<div class="max-w-md text-center">
							<div class="mb-6 text-6xl">🐉</div>
							<h3 class="mb-4 text-xl font-bold text-white">
								{MONSTERS_CONFIG.ui.databaseEmptyState.title}
							</h3>
							<p class="mb-6 text-gray-400">
								{MONSTERS_CONFIG.ui.databaseEmptyState.description}
							</p>

							<!-- Sync Button -->
							<div class="mb-6 flex justify-center">
								<button
									class="relative flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-linear-to-r from-emerald-600/20 to-teal-600/20 px-4 py-2 text-sm font-medium text-white transition-all hover:border-emerald-500/50 hover:from-emerald-600/30 hover:to-teal-600/30 disabled:cursor-not-allowed disabled:opacity-50"
									onclick={syncItems}
									disabled={isSyncing}
								>
									{#if isSyncing}
										<RefreshCw class="h-4 w-4 animate-spin" />
										Syncing...
									{:else}
										<Download class="h-4 w-4" />
										Sync Monsters from Open5e
									{/if}
								</button>
							</div>

							<!-- Sync Status Messages -->
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
					<!-- List View -->
					<div class="grid grid-cols-1 gap-3 p-1 md:grid-cols-2 xl:grid-cols-3">
						{#each resolved.monsters as monster (monster.externalId ?? monster.index ?? monster.__rowId ?? monster.name)}
							<CompendiumListItem
								title={monster.name}
								subtitle={`${monster.size} • ${monster.type}`}
								source={monster.source}
								icon={Skull}
								accentClass={TYPE_COLORS[monster.type as keyof typeof TYPE_COLORS] ||
									TYPE_COLORS['default']}
								onclick={() => selectMonster(monster)}
							/>
						{/each}
					</div>

					<!-- Pagination (only when no monster selected) -->
					{#if !selectedMonster && resolved.pagination && resolved.pagination.totalPages > 1}
						<div class="mt-2">
							<Pagination pagination={resolved.pagination} baseUrl="/compendium/monsters" />
						</div>
					{/if}
				{/if}
			{:catch error}
				<CompendiumError message={error.message} />
			{/await}
		</div>

		<!-- Detail View -->
		{#if selectedMonster}
			<div
				data-testid="monster-detail-overlay"
				class="absolute inset-0 z-20 p-2 lg:p-4"
				transition:fly={{ x: 20, duration: 300 }}
			>
				<CompendiumDetail
					title={selectedMonster.name}
					type="Monster"
					source={selectedMonster.source}
					tags={[
						selectedMonster.size,
						selectedMonster.type,
						`CR ${selectedMonster.challenge_rating}`
					]}
					onClose={closeOverlay}
					accentColor={TYPE_COLORS[selectedMonster.type as keyof typeof TYPE_COLORS]
						? TYPE_COLORS[selectedMonster.type as keyof typeof TYPE_COLORS].split(' ')[0]
						: 'text-gray-400'}
					animate={false}
				>
					<MonsterDetailContent monster={selectedMonster} />
				</CompendiumDetail>
			</div>
		{/if}
	</div>
</CompendiumShell>
