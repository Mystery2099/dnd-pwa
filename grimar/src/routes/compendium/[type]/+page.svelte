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
	import CompendiumCardIcon from '$lib/components/compendium/icons/CompendiumCardIcon.svelte';
	import CompendiumTypeIcon from '$lib/components/compendium/icons/CompendiumTypeIcon.svelte';
	import DamageTypeIcon from '$lib/components/compendium/icons/DamageTypeIcon.svelte';
	import AoeIcon from '$lib/components/compendium/icons/AoeIcon.svelte';
	import { COMPENDIUM_TYPE_CONFIGS } from '$lib/core/constants/compendium';
	import { resolveAoeToken, resolveDamageTypeTokens } from '$lib/core/utils/compendiumIconography';
	import type { CompendiumItem, CompendiumTypeName } from '$lib/core/types/compendium';
	import { getImageKindLabel } from '$lib/utils/compendium';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	type CardItemData = {
		level?: number;
		school?: { name?: string; key?: string } | string;
		challenge_rating_text?: string;
		type?: { name?: string } | string;
		target_type?: string;
		damage_types?: unknown;
		hit_dice?: string | number;
		file_url?: string;
		alt_text?: string;
		attribution?: string;
		document?: {
			name?: string;
			display_name?: string;
		};
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

	function getDocumentLabel(item: CompendiumItem, itemData: CardItemData): string | undefined {
		return (
			itemData.document?.display_name ?? itemData.document?.name ?? item.documentName ?? undefined
		);
	}

	function getCardDescription(item: CompendiumItem, itemData: CardItemData): string | undefined {
		return item.description ?? itemData.alt_text;
	}

	function getPrimaryDamageType(itemData: CardItemData): string | undefined {
		return resolveDamageTypeTokens(itemData.damage_types)[0];
	}

	function getAoeShape(itemData: CardItemData): string | undefined {
		return resolveAoeToken(itemData.target_type);
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
			includeSubclasses:
				data.type === 'classes' ? false : data.type === 'subclasses' ? true : undefined,
			onlySubclasses: data.type === 'subclasses' ? true : undefined,
			creatureType:
				data.type === 'creatures' && creatureTypeFilter !== 'all' ? creatureTypeFilter : undefined,
			spellLevel:
				data.type === 'spells' && spellLevelFilter !== 'all' ? spellLevelFilter : undefined,
			spellSchool:
				data.type === 'spells' && spellSchoolFilter !== 'all' ? spellSchoolFilter : undefined,
			challengeRating:
				data.type === 'creatures' && challengeRatingFilter !== 'all'
					? challengeRatingFilter
					: undefined
		})
	);
	let items = $derived(query.data?.items ?? []);
	let totalItems = $derived(query.data?.total ?? 0);
	let totalPages = $derived(query.data?.totalPages ?? 1);
	let pageSize = $derived(query.data?.pageSize ?? 50);
	let isLoading = $derived(query.isFetching);
	let activeFilterLabels = $derived.by(() => {
		const labels: string[] = [];
		if (searchQuery) labels.push(`Search: ${searchQuery}`);
		if (sourceFilter) labels.push(`Source: ${sourceFilter}`);
		if (data.type === 'spells' && spellLevelFilter !== 'all') {
			labels.push(`Level: ${spellLevelFilter}`);
		}
		if (data.type === 'spells' && spellSchoolFilter !== 'all') {
			labels.push(`School: ${spellSchoolFilter}`);
		}
		if (data.type === 'creatures' && creatureTypeFilter !== 'all') {
			labels.push(`Type: ${creatureTypeFilter}`);
		}
		if (data.type === 'creatures' && challengeRatingFilter !== 'all') {
			labels.push(`CR: ${challengeRatingFilter}`);
		}
		if (sortBy !== 'name') labels.push(`Sort: ${sortBy}`);
		if (sortOrder !== 'asc') labels.push(`Order: ${sortOrder}`);
		return labels;
	});
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
		const newUrl =
			parts.length > 0 ? `${$page.url.pathname}?${parts.join('&')}` : $page.url.pathname;
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
	<div class="mx-auto max-w-[92rem] px-4 py-8">
		<section
			class="relative mb-6 overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-accent)_18%,transparent),transparent_38%),linear-gradient(145deg,color-mix(in_srgb,var(--color-bg-card)_82%,transparent),color-mix(in_srgb,var(--color-bg-primary)_96%,transparent))] p-5 shadow-[0_1.4rem_3rem_color-mix(in_srgb,var(--color-shadow)_16%,transparent)] lg:p-6"
		>
			<div class="absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(120deg,transparent,color-mix(in_srgb,var(--color-accent)_8%,transparent),transparent)] opacity-70"></div>
			<div class="relative">
				<div>
					<Breadcrumb
						items={[{ label: 'Compendium', href: '/compendium' }, { label: config.plural }]}
					/>
					<h1
						class="mt-3 flex items-center gap-3 text-3xl font-black tracking-tight text-[var(--color-text-primary)] md:text-4xl"
					>
						<CompendiumTypeIcon type={data.type} fallback={config.icon} class="h-10 w-10" />
						{config.plural}
					</h1>
					<p class="mt-2 max-w-2xl text-[color-mix(in_srgb,var(--color-text-primary)_72%,var(--color-text-secondary))]">
						{config.description}
					</p>
					<div class="mt-5 grid gap-3 sm:grid-cols-3">
						<div class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/50 px-4 py-3">
							<p class="text-[0.68rem] font-medium tracking-[0.18em] text-[var(--color-text-muted)] uppercase">
								Entries
							</p>
							<p class="mt-2 text-2xl font-black text-[var(--color-text-primary)]">
								{totalItems.toLocaleString()}
							</p>
						</div>
						<div class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/50 px-4 py-3">
							<p class="text-[0.68rem] font-medium tracking-[0.18em] text-[var(--color-text-muted)] uppercase">
								Pages
							</p>
							<p class="mt-2 text-2xl font-black text-[var(--color-text-primary)]">{totalPages}</p>
						</div>
						<div class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/50 px-4 py-3">
							<p class="text-[0.68rem] font-medium tracking-[0.18em] text-[var(--color-text-muted)] uppercase">
								Page Size
							</p>
							<p class="mt-2 text-2xl font-black text-[var(--color-text-primary)]">{pageSize}</p>
						</div>
					</div>
					{#if activeFilterLabels.length > 0}
						<div class="mt-4 flex flex-wrap gap-2">
							{#each activeFilterLabels as label (label)}
								<Badge variant="outline" class="border-accent/25 bg-accent/8 text-xs">
									{label}
								</Badge>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</section>

		<div class="grid gap-6 xl:grid-cols-[17rem_minmax(0,1fr)]">
			<aside
				class="h-fit rounded-[1.75rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_86%,transparent),color-mix(in_srgb,var(--color-bg-primary)_96%,transparent))] p-5 shadow-[0_1.5rem_3rem_color-mix(in_srgb,var(--color-shadow)_18%,transparent)] xl:sticky xl:top-6"
			>
				<div class="mb-5 flex items-start justify-between gap-4">
					<div>
						<p class="text-[0.68rem] font-medium tracking-[0.2em] text-[color-mix(in_srgb,var(--color-text-primary)_52%,var(--color-text-muted))] uppercase">
							Refine Shelf
						</p>
						<h2 class="mt-2 text-xl font-semibold text-[var(--color-text-primary)]">Filters</h2>
					</div>
					<Button onclick={clearFilters} variant="outline" size="sm">Reset</Button>
				</div>

				<div class="grid gap-4">
					<div class="relative">
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
			</aside>

			<section class="space-y-6">
				<div class="flex flex-wrap items-end justify-between gap-3">
					<div>
						<p class="text-[0.72rem] font-medium tracking-[0.2em] text-[color-mix(in_srgb,var(--color-text-primary)_52%,var(--color-text-muted))] uppercase">
							Browse Results
						</p>
						<p class="mt-1 text-sm text-[color-mix(in_srgb,var(--color-text-primary)_70%,var(--color-text-secondary))]">
							Each card is optimized for quick triage before you open the full record.
						</p>
					</div>
					{#if activeFilterLabels.length > 0}
						<p class="text-sm text-[var(--color-text-secondary)]">
							{activeFilterLabels.length} active filter{activeFilterLabels.length === 1 ? '' : 's'}
						</p>
					{/if}
				</div>

		{#if isLoading}
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each Array(12) as _, index (index)}
						<div class="card-crystal h-40 animate-pulse rounded-[1.5rem] bg-[var(--color-bg-card)]"></div>
					{/each}
				</div>
		{:else if items.length === 0}
				<div
					class="flex min-h-[24rem] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)]/35 px-6 py-16 text-center"
				>
					<div class="mb-4 text-6xl">🔍</div>
					<h2 class="text-xl font-semibold text-[var(--color-text-primary)]">
						No {config.plural.toLowerCase()} found
					</h2>
					<p class="mt-2 max-w-md text-[var(--color-text-secondary)]">
						{searchQuery ? `No results for "${searchQuery}"` : 'No items available in this category'}
					</p>
					{#if searchQuery}
						<Button onclick={clearFilters} class="mt-4">Reset filters</Button>
					{/if}
				</div>
		{:else}
			{#snippet compendiumCard(item: CompendiumItem)}
				{@const itemData = item.data as CardItemData}
				<div use:prefetchOnVisible={item.key} class="h-full w-full">
					<SurfaceCard
						href="/compendium/{data.type}/{item.key}"
						class="group h-full w-full rounded-[1.6rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_84%,transparent),color-mix(in_srgb,var(--color-bg-primary)_96%,transparent))] shadow-[0_1.35rem_3.1rem_color-mix(in_srgb,var(--color-shadow)_18%,transparent),inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent)]"
						onmouseenter={() => handleItemPrefetch(item.key)}
						onfocusin={() => handleItemPrefetch(item.key)}
					>
						<div class="relative p-4.5">
							<div class="pointer-events-none absolute top-3 right-4 text-[var(--color-text-primary)]/12">
								<CompendiumCardIcon
									type={data.type}
									itemData={itemData}
									fallback={config.icon}
									class="h-11 w-11"
								/>
							</div>
							<div class="mb-2.5 flex items-center justify-between gap-3">
								<p class="text-[0.68rem] font-medium tracking-[0.18em] text-[color-mix(in_srgb,var(--color-text-primary)_48%,var(--color-text-muted))] uppercase">
									{config.label}
								</p>
								{#if item.source && item.source !== 'open5e'}
									<Badge variant="outline" class="text-[0.68rem]">{item.source}</Badge>
								{/if}
							</div>
							<h3
								class="line-clamp-2 pr-10 text-lg font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-accent"
							>
								{item.name}
							</h3>
							{#if getCardDescription(item, itemData)}
								<p class="mt-2.5 line-clamp-3 min-h-[3.3rem] text-sm leading-5.5 text-[color-mix(in_srgb,var(--color-text-primary)_74%,var(--color-text-secondary))]">
									{getCardDescription(item, itemData)}
								</p>
							{/if}
							{#if data.type === 'spells' && itemData}
								<div class="mt-3.5 flex flex-wrap gap-1.5">
									{#if itemData.level !== undefined}
										<Badge variant="solid">
											{itemData.level === 0 ? 'Cantrip' : `Level ${itemData.level}`}
										</Badge>
									{/if}
									{#if itemData.school}
										<Badge variant="outline" class="gap-1.5">
											<CompendiumCardIcon type="spells" {itemData} class="h-3.5 w-3.5" />
											{getSchoolLabel(itemData.school)}
										</Badge>
									{/if}
									{#if getPrimaryDamageType(itemData)}
										<Badge variant="outline" class="gap-1.5">
											<DamageTypeIcon type={getPrimaryDamageType(itemData)!} class="h-3.5 w-3.5" />
											{getPrimaryDamageType(itemData)}
										</Badge>
									{/if}
									{#if getAoeShape(itemData)}
										<Badge variant="outline" class="gap-1.5">
											<AoeIcon shape={getAoeShape(itemData)!} class="h-3.5 w-3.5" />
											{itemData.target_type}
										</Badge>
									{/if}
								</div>
							{:else if data.type === 'creatures' && itemData}
								<div class="mt-3.5 flex flex-wrap gap-1.5">
									{#if itemData.challenge_rating_text}
										<Badge
											variant="solid"
											class="bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-accent)_34%,var(--color-bg-overlay)),color-mix(in_srgb,var(--color-accent)_18%,var(--color-bg-card)))] px-2.5 py-1 text-[0.7rem] text-[var(--color-text-inverted)] shadow-[0_0.55rem_1.25rem_color-mix(in_srgb,var(--color-accent)_18%,transparent),inset_0_1px_0_color-mix(in_srgb,var(--color-text-inverted)_22%,transparent)]"
										>
											CR {itemData.challenge_rating_text}
										</Badge>
									{/if}
									{#if itemData.type}
										<Badge variant="outline">{getTypeLabel(itemData.type)}</Badge>
									{/if}
								</div>
							{:else if (data.type === 'classes' || data.type === 'subclasses') && itemData}
								<div class="mt-3.5 flex flex-wrap gap-1.5">
									{#if itemData.hit_dice}
										<Badge variant="solid">d{itemData.hit_dice}</Badge>
									{/if}
								</div>
							{:else if data.type === 'images' && itemData}
								<div class="mt-3.5 flex flex-wrap gap-1.5">
									<Badge variant="solid">{getImageKindLabel(itemData.file_url)}</Badge>
									{#if itemData.attribution}
										<Badge variant="outline" class="max-w-full truncate text-xs">
											Artwork credit
										</Badge>
									{/if}
								</div>
							{/if}
							{#if getDocumentLabel(item, itemData)}
								<div class="mt-3.5 border-t border-[var(--color-border)]/70 pt-3.5">
									<Badge variant="outline" class="max-w-full truncate text-xs"
										>{getDocumentLabel(item, itemData)}</Badge
									>
								</div>
							{/if}
						</div>
					</SurfaceCard>
				</div>
			{/snippet}

			{#if items.length >= VIRTUALIZATION_THRESHOLD}
				<div
					class="h-[70vh] rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-bg-card)]/20 p-3"
				>
					<VirtualGrid
						{items}
						estimateRowHeight={178}
						minCardWidth={260}
						mobileMinCardWidth={170}
						tabletMinCardWidth={220}
						gap={24}
						rowGap={32}
						resetScrollOnItemsChange={true}
					>
						{#snippet children(item: CompendiumItem)}
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
				<div class="mt-8 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-bg-card)]/35 p-4">
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
			</section>
		</div>
	</div>
</div>
