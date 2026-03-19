<script lang="ts">
	import { goto } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import CompendiumTypeIcon from '$lib/components/compendium/icons/CompendiumTypeIcon.svelte';
	import { Select } from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { COMPENDIUM_TYPE_CONFIGS, SEARCHABLE_TYPES, type CompendiumTypeName } from '$lib/core/constants/compendium';
	import {
		ATTUNEMENT_OPTIONS,
		CHALLENGE_RATING_OPTIONS,
		CREATURE_TYPE_OPTIONS,
		ITEM_KIND_OPTIONS,
		ITEM_RARITY_OPTIONS,
		SPELL_LEVEL_OPTIONS,
		SPELL_SCHOOL_OPTIONS,
		createAtlasHref,
		getAtlasFilterContext,
		getActiveFilterLabels,
		getBadgeClasses,
		getAtlasSortOptions,
		getTypeAccentClasses,
		type AtlasState,
		type AtlasAttunementFilter,
		type AtlasItemKind,
		type AtlasSortId
	} from '$lib/features/compendium/atlas';
	import type { PageData } from './$types';

	const SEARCH_DEBOUNCE_MS = 220;

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let searchInput = $state('');
	let selectedType = $state<'all' | CompendiumTypeName>('all');
	let sort = $state<AtlasSortId>('relevance');
	let spellLevel = $state('all');
	let spellSchool = $state('all');
	let creatureType = $state('all');
	let challengeRating = $state('all');
	let itemKind = $state<AtlasItemKind>('all');
	let itemRarity = $state('all');
	let attunement = $state<AtlasAttunementFilter>('all');
	let typeScroller = $state<HTMLDivElement | null>(null);
	let canScrollTypesLeft = $state(false);
	let canScrollTypesRight = $state(false);
	let searchTimeout: ReturnType<typeof setTimeout> | undefined;

	const activeLabels = $derived(getActiveFilterLabels(data.state));
	const hasFilters = $derived(activeLabels.length > 0);
	const resultWindowEnd = $derived(Math.min(data.page * data.pageSize, data.total));
	const pageTitle = $derived(
		selectedType === 'all'
			? 'Compendium Atlas'
			: `${COMPENDIUM_TYPE_CONFIGS[selectedType]?.plural ?? 'Compendium'} Atlas`
	);
	const searchableTypeEntries = $derived(
		SEARCHABLE_TYPES.map((type) => ({
			type,
			config: COMPENDIUM_TYPE_CONFIGS[type],
			count: Number(data.counts[type] ?? 0)
		}))
	);
	const filterContext = $derived(getAtlasFilterContext(data.state));
	const sortOptions = $derived(getAtlasSortOptions(data.state));

	$effect(() => {
		searchInput = data.state.search;
		selectedType = data.state.selectedType;
		sort = data.state.sort;
		spellLevel = data.state.spellLevel;
		spellSchool = data.state.spellSchool;
		creatureType = data.state.creatureType;
		challengeRating = data.state.challengeRating;
		itemKind = data.state.itemKind;
		itemRarity = data.state.itemRarity;
		attunement = data.state.attunement;
	});

	onDestroy(() => {
		if (searchTimeout) clearTimeout(searchTimeout);
	});

	onMount(() => {
		updateTypeScrollerState();

		if (!typeScroller) return;

		const controller = new AbortController();
		const observer = new ResizeObserver(() => updateTypeScrollerState());

		typeScroller.addEventListener('scroll', updateTypeScrollerState, {
			passive: true,
			signal: controller.signal
		});
		window.addEventListener('resize', updateTypeScrollerState, {
			passive: true,
			signal: controller.signal
		});
		observer.observe(typeScroller);

		return () => {
			controller.abort();
			observer.disconnect();
		};
	});

	function currentState(): AtlasState {
		return {
			scope: 'all',
			selectedType,
			search: searchInput.trim(),
			sort,
			page: 1,
			spellLevel,
			spellSchool,
			creatureType,
			challengeRating,
			itemKind,
			itemRarity,
			attunement
		};
	}

	async function navigateWithState(nextState: ReturnType<typeof currentState>, options?: { noScroll?: boolean }) {
		await goto(createAtlasHref(nextState), {
			replaceState: true,
			keepFocus: true,
			noScroll: options?.noScroll ?? true
		});
	}

	function handleSearchInput(event: Event) {
		searchInput = (event.currentTarget as HTMLInputElement).value;
		if (searchTimeout) clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			void navigateWithState(currentState());
		}, SEARCH_DEBOUNCE_MS);
	}

	function handleSortChange(nextSort: string) {
		sort = nextSort as AtlasSortId;
		void navigateWithState(currentState());
	}

	function resetFilters() {
		searchInput = '';
		selectedType = 'all';
		sort = 'relevance';
		spellLevel = 'all';
		spellSchool = 'all';
		creatureType = 'all';
		challengeRating = 'all';
		itemKind = 'all';
		itemRarity = 'all';
		attunement = 'all';
		void navigateWithState(currentState());
	}

	function updateSpellLevel(nextValue: string) {
		spellLevel = nextValue;
		void navigateWithState(currentState());
	}

	function handleTypeChange(nextType: 'all' | CompendiumTypeName) {
		selectedType = nextType;
		sort = 'relevance';
		spellLevel = 'all';
		spellSchool = 'all';
		creatureType = 'all';
		challengeRating = 'all';
		itemKind = 'all';
		itemRarity = 'all';
		attunement = 'all';
		void navigateWithState(currentState());
	}

	function updateSpellSchool(nextValue: string) {
		spellSchool = nextValue;
		void navigateWithState(currentState());
	}

	function updateCreatureType(nextValue: string) {
		creatureType = nextValue;
		void navigateWithState(currentState());
	}

	function updateChallengeRating(nextValue: string) {
		challengeRating = nextValue;
		void navigateWithState(currentState());
	}

	function updateItemKind(nextValue: string) {
		itemKind = nextValue as AtlasItemKind;
		itemRarity = 'all';
		attunement = 'all';
		void navigateWithState(currentState());
	}

	function updateItemRarity(nextValue: string) {
		itemRarity = nextValue;
		void navigateWithState(currentState());
	}

	function updateAttunement(nextValue: string) {
		attunement = nextValue as AtlasAttunementFilter;
		void navigateWithState(currentState());
	}

	function pageHref(nextPage: number) {
		return createAtlasHref({
			...data.state,
			page: nextPage
		});
	}

	function scrollTypeRail(direction: 'left' | 'right') {
		if (!typeScroller) return;
		const delta = Math.max(typeScroller.clientWidth * 0.38, 140);
		typeScroller.scrollBy({
			left: direction === 'right' ? delta : -delta,
			behavior: 'smooth'
		});
	}

	function updateTypeScrollerState() {
		if (!typeScroller) {
			canScrollTypesLeft = false;
			canScrollTypesRight = false;
			return;
		}

		const maxScrollLeft = typeScroller.scrollWidth - typeScroller.clientWidth;
		canScrollTypesLeft = typeScroller.scrollLeft > 8;
		canScrollTypesRight = maxScrollLeft - typeScroller.scrollLeft > 8;
	}
</script>

<svelte:head>
	<title>{pageTitle} | Beta | Grimar</title>
</svelte:head>

<div class="min-h-screen bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--color-accent)_14%,transparent),transparent_38%),linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-canvas)_74%,black),color-mix(in_srgb,var(--color-bg-canvas)_88%,#040302)_48%,color-mix(in_srgb,var(--color-bg-canvas)_76%,var(--color-bg-overlay)))]">
	<div class="mx-auto flex max-w-[94rem] flex-col gap-6 px-3 py-3 md:px-5 md:py-4">
		<section class="relative overflow-hidden rounded-[2rem] border border-[color-mix(in_srgb,var(--color-accent)_24%,var(--color-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-overlay)_54%,var(--color-bg-canvas)),color-mix(in_srgb,var(--color-bg-canvas)_96%,transparent))] p-5 shadow-[0_1.4rem_3rem_color-mix(in_srgb,var(--color-shadow)_32%,transparent)] md:p-7">
			<div class="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-accent)_6%,transparent),transparent)]"></div>
			<div class="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(color-mix(in_srgb,var(--color-accent)_10%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--color-accent)_10%,transparent)_1px,transparent_1px)] [background-position:center] [background-size:3.5rem_3.5rem]"></div>
			<div class="relative grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(19rem,0.8fr)] xl:items-end">
				<div>
					<div class="flex flex-wrap items-center gap-3">
						<Badge variant="outline" class="border-[color-mix(in_srgb,var(--color-accent)_30%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-[0.65rem] tracking-[0.24em] text-[color-mix(in_srgb,var(--color-text-primary)_94%,var(--color-accent))] uppercase">
							Beta Route
						</Badge>
						<a
							href="/compendium"
							class="text-[0.72rem] tracking-[0.2em] text-[color-mix(in_srgb,var(--color-text-primary)_62%,var(--color-text-muted))] uppercase transition-colors hover:text-[var(--color-text-primary)]"
						>
							Back to current compendium
						</a>
					</div>
					<h1 class="mt-4 max-w-4xl font-[var(--font-display)] text-[2.25rem] leading-[0.98] font-semibold tracking-tight text-[var(--color-text-primary)] md:text-[3.4rem]">
						One archive page. Filters first. Details second.
					</h1>
					<p class="mt-4 max-w-3xl text-sm leading-6 text-[color-mix(in_srgb,var(--color-text-primary)_78%,var(--color-text-secondary))] md:text-base">
						This preview treats the compendium as a searchable atlas instead of a shelf of category cards.
						Type chips narrow the archive, contextual filters appear only when they matter, and every card still
						lands in the existing detail pages.
					</p>
				</div>

				<div class="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
					<div class="rounded-[1.35rem] border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_34%,transparent)] px-4 py-3.5 backdrop-blur-sm">
						<p class="text-[0.65rem] tracking-[0.22em] text-[var(--color-text-muted)] uppercase">Current Type</p>
						<p class="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
							{selectedType === 'all' ? 'All' : COMPENDIUM_TYPE_CONFIGS[selectedType]?.plural}
						</p>
					</div>
					<div class="rounded-[1.35rem] border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_34%,transparent)] px-4 py-3.5 backdrop-blur-sm">
						<p class="text-[0.65rem] tracking-[0.22em] text-[var(--color-text-muted)] uppercase">Indexed Entries</p>
						<p class="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
							{selectedType === 'all'
								? data.scopeCounts[data.state.scope].toLocaleString()
								: Number(data.counts[selectedType] ?? 0).toLocaleString()}
						</p>
					</div>
					<div class="rounded-[1.35rem] border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_34%,transparent)] px-4 py-3.5 backdrop-blur-sm">
						<p class="text-[0.65rem] tracking-[0.22em] text-[var(--color-text-muted)] uppercase">Browse Window</p>
						<p class="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">{data.pageSize}</p>
					</div>
				</div>
			</div>
		</section>

		<section class="rounded-[1.8rem] border border-[color-mix(in_srgb,var(--color-border)_86%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_82%,transparent),color-mix(in_srgb,var(--color-bg-canvas)_96%,transparent))] p-4 shadow-[0_1rem_2.25rem_color-mix(in_srgb,var(--color-shadow)_26%,transparent)] md:p-5">
			<div class="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_15rem]">
				<div class="relative">
					<Input
						type="text"
						value={searchInput}
						placeholder="Search the atlas by name or summary..."
						oninput={handleSearchInput}
						class="h-12 rounded-[1rem] border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_44%,transparent)] pr-4 pl-11 text-base text-[var(--color-text-primary)] placeholder:text-[color-mix(in_srgb,var(--color-text-muted)_82%,transparent)]"
					/>
					<svg
						class="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-[var(--color-text-muted)]"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>

				<Select
					type="single"
					value={sort}
					options={sortOptions}
					placeholder="Sort results"
					onchange={handleSortChange}
					class="h-12 rounded-[1rem] border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_44%,transparent)] text-[var(--color-text-primary)]"
				/>
			</div>

			<div class="mt-4 flex items-center gap-3">
				<button
					type="button"
					class={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all md:inline-flex ${
						canScrollTypesLeft
							? 'border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_30%,transparent)] text-[var(--color-text-primary)] hover:border-[color-mix(in_srgb,var(--color-accent)_24%,var(--color-border))] hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]'
							: 'border-[color-mix(in_srgb,var(--color-border)_64%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_14%,transparent)] text-[var(--color-text-muted)] opacity-45'
					}`}
					onclick={() => scrollTypeRail('left')}
					disabled={!canScrollTypesLeft}
					aria-label="Scroll type filters left"
				>
					<span aria-hidden="true" class="text-lg leading-none">‹</span>
				</button>

				<div class="relative min-w-0 flex-1">
					<div
						class={`pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-linear-to-r from-[var(--color-bg-canvas)] to-transparent transition-opacity ${
							canScrollTypesLeft ? 'opacity-100' : 'opacity-0'
						}`}
					></div>
					<div
						class={`pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l from-[var(--color-bg-canvas)] to-transparent transition-opacity ${
							canScrollTypesRight ? 'opacity-100' : 'opacity-0'
						}`}
					></div>
					<div
						bind:this={typeScroller}
						class="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[color-mix(in_srgb,var(--color-border)_88%,transparent)] flex gap-2 overflow-x-auto pb-1"
					>
						<button
					type="button"
					class={`shrink-0 rounded-full border px-4 py-2 text-sm transition-all ${
						selectedType === 'all'
							? 'border-[color-mix(in_srgb,var(--color-accent)_52%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-[var(--color-text-primary)] shadow-[0_0.8rem_1.8rem_color-mix(in_srgb,var(--color-accent)_14%,transparent)]'
							: 'border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_18%,transparent)] text-[color-mix(in_srgb,var(--color-text-primary)_64%,var(--color-text-secondary))] hover:border-[color-mix(in_srgb,var(--color-accent)_22%,var(--color-border))] hover:text-[var(--color-text-primary)]'
					}`}
					onclick={() => handleTypeChange('all')}
				>
					All
					<span class="ml-2 text-[0.72rem] text-inherit/70">
						{data.scopeCounts.all.toLocaleString()}
					</span>
				</button>
						{#each searchableTypeEntries as entry (entry.type)}
							<button
						type="button"
						class={`shrink-0 rounded-full border px-4 py-2 text-sm transition-all ${
							selectedType === entry.type
								? 'border-[color-mix(in_srgb,var(--color-accent)_52%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-[var(--color-text-primary)] shadow-[0_0.8rem_1.8rem_color-mix(in_srgb,var(--color-accent)_14%,transparent)]'
								: 'border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_18%,transparent)] text-[color-mix(in_srgb,var(--color-text-primary)_64%,var(--color-text-secondary))] hover:border-[color-mix(in_srgb,var(--color-accent)_22%,var(--color-border))] hover:text-[var(--color-text-primary)]'
						}`}
						onclick={() => handleTypeChange(entry.type)}
					>
						{entry.config.plural}
						<span class="ml-2 text-[0.72rem] text-inherit/70">
							{entry.count.toLocaleString()}
						</span>
					</button>
						{/each}
					</div>
				</div>

				<button
					type="button"
					class={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all md:inline-flex ${
						canScrollTypesRight
							? 'border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_30%,transparent)] text-[var(--color-text-primary)] hover:border-[color-mix(in_srgb,var(--color-accent)_24%,var(--color-border))] hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]'
							: 'border-[color-mix(in_srgb,var(--color-border)_64%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_14%,transparent)] text-[var(--color-text-muted)] opacity-45'
					}`}
					onclick={() => scrollTypeRail('right')}
					disabled={!canScrollTypesRight}
					aria-label="Scroll type filters right"
				>
					<span aria-hidden="true" class="text-lg leading-none">›</span>
				</button>
			</div>

			<div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				{#if filterContext === 'spells'}
					<Select
						type="single"
						value={spellLevel}
						options={SPELL_LEVEL_OPTIONS}
						placeholder="Any Level"
						onchange={updateSpellLevel}
						class="rounded-[1rem] border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_44%,transparent)] text-[var(--color-text-primary)]"
					/>
					<Select
						type="single"
						value={spellSchool}
						options={SPELL_SCHOOL_OPTIONS}
						placeholder="Any School"
						onchange={updateSpellSchool}
						class="rounded-[1rem] border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_44%,transparent)] text-[var(--color-text-primary)]"
					/>
				{:else if filterContext === 'monsters'}
					<Select
						type="single"
						value={creatureType}
						options={CREATURE_TYPE_OPTIONS}
						placeholder="Any Type"
						onchange={updateCreatureType}
						class="rounded-[1rem] border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_44%,transparent)] text-[var(--color-text-primary)]"
					/>
					<Select
						type="single"
						value={challengeRating}
						options={CHALLENGE_RATING_OPTIONS}
						placeholder="Any CR"
						onchange={updateChallengeRating}
						class="rounded-[1rem] border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_44%,transparent)] text-[var(--color-text-primary)]"
					/>
				{:else if filterContext === 'items'}
					<Select
						type="single"
						value={itemKind}
						options={ITEM_KIND_OPTIONS}
						placeholder="Any Item"
						onchange={updateItemKind}
						class="rounded-[1rem] border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_44%,transparent)] text-[var(--color-text-primary)]"
					/>
					<Select
						type="single"
						value={itemRarity}
						options={ITEM_RARITY_OPTIONS}
						placeholder="Any Rarity"
						onchange={updateItemRarity}
						class="rounded-[1rem] border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_44%,transparent)] text-[var(--color-text-primary)]"
					/>
					<Select
						type="single"
						value={attunement}
						options={ATTUNEMENT_OPTIONS}
						placeholder="Any Attunement"
						onchange={updateAttunement}
						class="rounded-[1rem] border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_44%,transparent)] text-[var(--color-text-primary)]"
					/>
				{:else}
					<div class="rounded-[1rem] border border-dashed border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_20%,transparent)] px-4 py-3 text-sm text-[color-mix(in_srgb,var(--color-text-primary)_58%,var(--color-text-secondary))] md:col-span-2 xl:col-span-4">
						Contextual filters appear for spell, monster, and item scopes. The rest of the atlas is using the shared browse model first.
					</div>
				{/if}
			</div>

			<div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[color-mix(in_srgb,var(--color-border)_78%,transparent)] pt-4">
				<div>
					<p class="text-[0.7rem] tracking-[0.22em] text-[var(--color-text-muted)] uppercase">Result Set</p>
					<p class="mt-1 text-sm text-[color-mix(in_srgb,var(--color-text-primary)_72%,var(--color-text-secondary))]">
						Showing {data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1} to {resultWindowEnd}
						of {data.total.toLocaleString()} entries in {data.scopeMeta.label.toLowerCase()}.
					</p>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					{#if hasFilters}
						{#each activeLabels as label (label)}
							<Badge variant="outline" class="border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_24%,transparent)] text-[0.68rem] text-[color-mix(in_srgb,var(--color-text-primary)_84%,var(--color-text-secondary))]">
								{label}
							</Badge>
						{/each}
					{/if}
					<Button variant="outline" size="sm" class="border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_24%,transparent)] text-[var(--color-text-primary)] hover:bg-[color-mix(in_srgb,var(--color-bg-card)_36%,transparent)]" onclick={resetFilters}>
						Reset
					</Button>
				</div>
			</div>
		</section>

		<section class="space-y-4">
			{#if data.items.length === 0}
				<div class="rounded-[1.8rem] border border-dashed border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_18%,transparent)] px-6 py-16 text-center">
					<p class="text-[0.72rem] tracking-[0.24em] text-[var(--color-text-muted)] uppercase">No Matches</p>
					<h2 class="mt-3 font-[var(--font-display)] text-3xl text-[var(--color-text-primary)]">The archive came up empty.</h2>
					<p class="mx-auto mt-3 max-w-xl text-sm leading-6 text-[color-mix(in_srgb,var(--color-text-primary)_62%,var(--color-text-secondary))]">
						Try a broader search, switch to a different scope, or clear the contextual filters. This page is
						designed to keep the controls in view so dead ends stay recoverable.
					</p>
				</div>
			{:else}
				<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
					{#each data.items as item (item.type + item.key)}
						<SurfaceCard
							href={item.href}
							class="group h-full rounded-[1.45rem] border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_84%,transparent),color-mix(in_srgb,var(--color-bg-canvas)_96%,transparent))] shadow-[0_1rem_2rem_color-mix(in_srgb,var(--color-shadow)_26%,transparent)] transition-transform duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-accent)_28%,var(--color-border))]"
						>
							<div class="relative h-full p-4.5">
								<div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] to-transparent"></div>
								<div class="mb-4 flex items-start justify-between gap-3">
									<div class="min-w-0">
										<p class={`text-[0.68rem] tracking-[0.22em] uppercase ${getTypeAccentClasses(item.type)}`}>
											{item.typeLabel}
										</p>
										<h2 class="mt-2 line-clamp-2 font-[var(--font-display)] text-[1.2rem] leading-tight font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-[color-mix(in_srgb,var(--color-text-primary)_88%,var(--color-accent))]">
											{item.name}
										</h2>
									</div>
									<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] border border-[color-mix(in_srgb,var(--color-border)_78%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_24%,transparent)] text-[color-mix(in_srgb,var(--color-text-primary)_66%,var(--color-text-secondary))]">
										<CompendiumTypeIcon type={item.type} fallback="✦" class="h-5 w-5" />
									</div>
								</div>

								{#if item.description}
									<p class="line-clamp-4 min-h-[5.4rem] text-sm leading-6 text-[color-mix(in_srgb,var(--color-text-primary)_60%,var(--color-text-secondary))]">
										{item.description}
									</p>
								{/if}

								<div class="mt-4 flex flex-wrap gap-1.5">
									{#each item.badges as badge, index (`${badge.label}-${index}`)}
										<Badge variant="outline" class={getBadgeClasses(badge.tone)}>
											{badge.label}
										</Badge>
									{/each}
								</div>

								{#if item.documentLabel}
									<div class="mt-4 border-t border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] pt-3.5">
										<p class="text-[0.65rem] tracking-[0.22em] text-[var(--color-text-muted)] uppercase">Source</p>
										<p class="mt-1 truncate text-sm text-[color-mix(in_srgb,var(--color-text-primary)_62%,var(--color-text-secondary))]">{item.documentLabel}</p>
									</div>
								{/if}
							</div>
						</SurfaceCard>
					{/each}
				</div>
			{/if}

			{#if data.totalPages > 1}
				<div class="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_18%,transparent)] px-4 py-3">
					<p class="text-sm text-[color-mix(in_srgb,var(--color-text-primary)_56%,var(--color-text-secondary))]">
						Page {data.page} of {data.totalPages}
					</p>
					<div class="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							class="border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_24%,transparent)] text-[var(--color-text-primary)] hover:bg-[color-mix(in_srgb,var(--color-bg-card)_36%,transparent)]"
							href={data.page > 1 ? pageHref(data.page - 1) : undefined}
							disabled={data.page <= 1}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							class="border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_24%,transparent)] text-[var(--color-text-primary)] hover:bg-[color-mix(in_srgb,var(--color-bg-card)_36%,transparent)]"
							href={data.page < data.totalPages ? pageHref(data.page + 1) : undefined}
							disabled={data.page >= data.totalPages}
						>
							Next
						</Button>
					</div>
				</div>
			{/if}
		</section>
	</div>
</div>
