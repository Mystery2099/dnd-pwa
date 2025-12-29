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
	import { Flame, Download, RefreshCw } from 'lucide-svelte';
	import {
		SPELL_LEVELS,
		SPELL_SCHOOLS,
		SCHOOL_COLORS,
		SCHOOL_TEXT_COLORS
	} from '$lib/constants/spells';
	import { CompendiumFilterStore } from '$lib/client/CompendiumFilterStore.svelte';
	import { SPELLS_FILTER_CONFIG } from '$lib/constants/compendium';
	import CompendiumLoading from '$lib/components/compendium/ui/CompendiumLoading.svelte';
	import FilterLogicToggle from '$lib/components/compendium/ui/FilterLogicToggle.svelte';
	import CompendiumError from '$lib/components/compendium/ui/CompendiumError.svelte';
	import SpellDetailContent from '$lib/components/compendium/detail/SpellDetailContent.svelte';

	interface Spell {
		id?: number;
		name: string;
		level: number;
		school: { name: string };
		casting_time?: string;
		range?: string;
		components?: string[];
		duration?: string;
		desc?: string[];
		higher_level?: string[];
		classes?: Array<{ name: string }>;
		externalId?: string;
		__rowId?: number;
		source?: string;
	}

	let { data } = $props();

	// Initialize filters with configuration
	const filters = new CompendiumFilterStore(SPELLS_FILTER_CONFIG);

	// Sync filters with URL state
	$effect(() => {
		// Only sync filters when on list page, not overlay
		if (page.url.pathname === '/compendium/spells') {
			filters.syncWithUrl(page.url);
		}
	});

	// Restore filter state from sessionStorage on mount
	onMount(() => {
		const saved = sessionStorage.getItem('spell-filters');
		if (saved) {
			try {
				filters.deserialize(JSON.parse(saved));
				// Clear after restoring
				sessionStorage.removeItem('spell-filters');
			} catch (e) {
				console.warn('Failed to restore filter state:', e);
			}
		}

		// Keyboard navigation
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && selectedSpell) {
				closeOverlay();
			} else if (e.key === 'ArrowLeft' && itemNav()?.prev) {
				selectSpell(itemNav()!.prev!);
			} else if (e.key === 'ArrowRight' && itemNav()?.next) {
				selectSpell(itemNav()!.next!);
			}
		};

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	// State for selected spell overlay
	let selectedSpell = $state<Spell | null>(null);
	let loadedSpells = $state<Spell[]>([]);
	let listContainer = $state<HTMLElement>();

	// Populate loadedSpells when data loads
	$effect(() => {
		const resolved = data.streamed.spells;
		if (resolved && typeof resolved.then === 'function') {
			resolved.then((result: any) => {
				if (result?.spells) {
					loadedSpells = result.spells;
				}
			});
		} else if (resolved && (resolved as any)?.spells) {
			loadedSpells = (resolved as any).spells;
		}
	});

	// Navigation state - derived to update when filters change
	const itemNav = $derived(() => {
		if (!selectedSpell) return null;
		if (!loadedSpells || loadedSpells.length === 0) return null;

		const externalId = selectedSpell.externalId;
		if (!externalId) return null;

		const idx = loadedSpells.findIndex((s: Spell) => s.externalId === externalId);
		if (idx === -1) return null;

		return {
			prev: idx > 0 ? loadedSpells[idx - 1] : null,
			next: idx < loadedSpells.length - 1 ? loadedSpells[idx + 1] : null
		};
	});

	// State for sync operation
	let isSyncing = $state(false);
	let syncMessage = $state('');
	let syncError = $state('');
	let isClosing = $state(false);

	// URL sync effect - sync overlay state with URL changes
	$effect(() => {
		const pathname = page.url.pathname;
		const parts = pathname.split('/');
		const state = page.state as { selectedSpell?: Spell };

		// Check if on detail route: /compendium/spells/[slug]
		const isDetailRoute = parts.length === 4 && parts[3];

		// 1. Priority: State object from pushState/shallow routing
		if (state.selectedSpell) {
			if (!selectedSpell || selectedSpell.externalId !== state.selectedSpell.externalId) {
				selectedSpell = state.selectedSpell;
			}
			return;
		}

		// 2. Secondary: URL Slug (Direct load or Back/Forward nav without state)
		if (isDetailRoute && parts[3]) {
			const slug = parts[3];
			// Find spell in loaded list
			if (loadedSpells && loadedSpells.length > 0) {
				const spell = loadedSpells.find((s: Spell) => s.externalId === slug);
				if (spell && (!selectedSpell || selectedSpell.externalId !== slug)) {
					selectedSpell = spell;
				}
			}
		} else {
			// If not a detail route, ensure overlay is closed
			selectedSpell = null;
		}
	});

	// Reactive derived values
	const searchTerm = $derived(filters.searchTerm);
	const selectedLevel = $derived(filters.getSet('level'));
	const selectedSchool = $derived(filters.getSet('school'));
	const filterLogic = $derived(filters.filterLogic);
	const hasActiveFilters = $derived(filters.hasActiveFilters);
	const currentSort = $derived(`${filters.sortBy}-${filters.sortOrder}`);

	let prevUrl = $state(page.url.href);

	$effect(() => {
		// Reset scroll when URL changes (pagination/filters), but NOT for overlay navigation
		const currentUrl = page.url.href;
		const prevPathname = prevUrl ? new URL(prevUrl).pathname : '';
		const currentPathname = page.url.pathname;

		// Only reset if not just opening/closing overlay (both are spell routes)
		const isOverlayNav =
			currentPathname.startsWith('/compendium/spells/') &&
			prevPathname.startsWith('/compendium/spells/');

		if (listContainer && !isOverlayNav) {
			listContainer.scrollTop = 0;
		}
		prevUrl = currentUrl;
	});

	// Event handlers
	function handleSearch(term: string) {
		filters.setSearchTerm(term);
	}

	function handleSort(value: string) {
		const [sortBy, sortOrder] = value.split('-');
		filters.setSort(sortBy, sortOrder as 'asc' | 'desc');
	}

	// Function to trigger spell sync
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
				syncMessage = `Synced ${result.summary.spells} spells successfully! The page will refresh shortly.`;
				setTimeout(() => {
					window.location.href = `/compendium/spells?t=${Date.now()}`;
				}, 2000);
			} else {
				syncError = result.error || 'Failed to sync spells';
			}
		} catch (e) {
			syncError = e instanceof Error ? e.message : 'Network error';
		} finally {
			isSyncing = false;
		}
	}

	function toggleLevel(level: string) {
		filters.toggle('level', level);
	}

	function toggleSchool(school: string) {
		filters.toggle('school', school);
	}

	function toggleLogic() {
		filters.toggleLogic();
	}

	function clearFilters() {
		filters.clearFilters();
	}

	async function selectSpell(spell: Spell) {
		// Save filter state for return navigation
		sessionStorage.setItem('spell-filters', JSON.stringify(filters.serialize()));
		sessionStorage.setItem('spell-list-url', window.location.href);

		// Update URL (creates history entry) using pushState to avoid navigation
		pushState(`/compendium/spells/${spell.externalId}`, {
			selectedSpell: spell
		});
	}

	function closeOverlay() {
		if (page.url.pathname !== '/compendium/spells') {
			pushState('/compendium/spells', {});
		} else {
			selectedSpell = null;
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
				{ label: 'Level (Low to High)', value: 'spellLevel-asc' },
				{ label: 'Level (High to Low)', value: 'spellLevel-desc' },
				{ label: 'School (A-Z)', value: 'spellSchool-asc' },
				{ label: 'School (Z-A)', value: 'spellSchool-desc' }
			]}
			initialSort={currentSort}
			{hasActiveFilters}
		>
			{#snippet filters()}
				<FilterLogicToggle logic={filterLogic} onToggle={toggleLogic} />

				<FilterGroup title="Level">
					<div class="flex flex-wrap gap-2">
						{#each SPELL_LEVELS as level (level)}
							<button
								data-testid="filter-level"
								data-level={level}
								class={`rounded-md border px-2 py-1 text-xs transition-all ${
									selectedLevel.has(level)
										? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
										: 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10'
								}`}
								onclick={() => toggleLevel(level)}
							>
								{level}
							</button>
						{/each}
					</div>
				</FilterGroup>

				<FilterGroup title="School">
					<div class="flex flex-col gap-1">
						{#each SPELL_SCHOOLS as school (school)}
							<button
								class={`group rounded-md border px-2 py-1.5 text-left text-xs transition-all ${
									selectedSchool.has(school)
										? 'border-white/20 bg-white/10 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)]'
										: 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
								}`}
								onclick={() => toggleSchool(school)}
							>
								<span
									class={SCHOOL_TEXT_COLORS[school as keyof typeof SCHOOL_TEXT_COLORS] ||
										'text-gray-400'}>●</span
								>
								{school}
							</button>
						{/each}
					</div>
				</FilterGroup>
			{/snippet}
		</CompendiumSidebar>
	{/snippet}

	<!-- Content Area -->
	<div class="relative h-full">
		<!-- Spell List -->
		<div
			bind:this={listContainer}
			data-testid="spell-grid"
			class="h-full overflow-y-auto {selectedSpell ? 'hidden lg:block' : 'block'}"
		>
			{#await data.streamed.spells}
				<CompendiumLoading
					message="Loading spells..."
					subtext="Fetching arcane indices"
					accentColor="border-t-purple-400"
				/>
			{:then resolved}
				<!-- Spell List -->
				{#if resolved.spells.length === 0}
					<div class="flex h-full items-center justify-center p-8">
						<div class="max-w-md text-center">
							<div class="mb-6 text-6xl">📖</div>
							<h3 class="mb-4 text-xl font-bold text-white">No Spells in Compendium</h3>
							<p class="mb-6 text-gray-400">
								The spell database appears to be empty. Sync data from the Open5e API to populate
								it.
							</p>

							<!-- Sync Button -->
							<div class="mb-6 flex justify-center">
								<button
									class="relative flex items-center gap-2 rounded-lg border border-purple-500/30 bg-linear-to-r from-purple-600/20 to-indigo-600/20 px-4 py-2 text-sm font-medium text-white transition-all hover:border-purple-500/50 hover:from-purple-600/30 hover:to-indigo-600/30 disabled:cursor-not-allowed disabled:opacity-50"
									onclick={syncItems}
									disabled={isSyncing}
								>
									{#if isSyncing}
										<RefreshCw class="h-4 w-4 animate-spin" />
										Syncing spells...
									{:else}
										<Download class="h-4 w-4" />
										Sync Spells from Open5e
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

							<div class="mx-auto mb-8 max-w-sm rounded-lg border border-white/10 bg-white/5 p-4">
								<h4 class="mb-2 text-sm font-bold text-white">About Open5e</h4>
								<p class="mb-2 text-xs text-gray-400">
									This will fetch all D&D 5e spells from the Open5e API and store them in your local
									database.
								</p>
								<p class="text-xs text-gray-400">
									Once synced, the spells will be available for offline use.
								</p>
							</div>
						</div>
					</div>
				{:else}
					<div class="flex flex-col gap-4 p-1 lg:p-4">
						<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
							{#each resolved.spells as spell (spell.externalId ?? spell.__rowId ?? spell.name)}
								<CompendiumListItem
									title={spell.name}
									subtitle={`${spell.level === 0 ? 'Cantrip' : 'Level ' + spell.level} • ${spell.school.name}`}
									source={spell.source}
									icon={Flame}
									accentClass={SCHOOL_COLORS[spell.school.name as keyof typeof SCHOOL_COLORS] ||
										SCHOOL_COLORS.default}
									onclick={() => selectSpell(spell)}
								/>
							{/each}
						</div>

						{#if resolved.spells.length === 0}
							<div class="py-12 text-center text-gray-500">
								No spells found matching your criteria.
							</div>
						{/if}

						<!-- Pagination (hidden when overlay is open) -->
						{#if !selectedSpell && resolved.pagination && resolved.pagination.totalPages > 1}
							<div class="mt-2">
								<Pagination pagination={resolved.pagination} baseUrl="/compendium/spells" />
							</div>
						{/if}
					</div>
				{/if}
			{:catch error}
				<CompendiumError message={error.message} />
			{/await}
		</div>

		<!-- Detail Overlay -->
		{#if selectedSpell}
			<div
				data-testid="spell-detail-overlay"
				class="absolute inset-0 z-20 p-2 lg:p-4"
				transition:fly={{ x: 20, duration: 300 }}
			>
				<CompendiumDetail
					title={selectedSpell.name}
					type="Spell"
					source={selectedSpell.source}
					tags={[
						selectedSpell.school.name,
						selectedSpell.level === 0 ? 'Cantrip' : `Level ${selectedSpell.level}`,
						...(selectedSpell.classes || []).map((c: { name: string }) => c.name)
					]}
					onClose={closeOverlay}
					accentColor={SCHOOL_TEXT_COLORS[
						selectedSpell.school.name as keyof typeof SCHOOL_TEXT_COLORS
					] || SCHOOL_TEXT_COLORS.default}
					animate={false}
				>
					<SpellDetailContent
						spell={selectedSpell as unknown as Record<string, unknown> & { externalId?: string }}
					/>
				</CompendiumDetail>
			</div>
		{/if}
	</div>
</CompendiumShell>
