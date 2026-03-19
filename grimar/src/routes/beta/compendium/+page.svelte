<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import XIcon from 'lucide-svelte/icons/x';
	import Badge from '$lib/components/ui/Badge.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import Input from '$lib/components/ui/Input.svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import StructuredValue from '$lib/components/ui/StructuredValue.svelte';
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
		type AtlasItem,
		type AtlasState,
		type AtlasAttunementFilter,
		type AtlasItemKind,
		type AtlasSortId
	} from '$lib/features/compendium/atlas';
	import type {
		CompendiumCreatureEncounterSection,
		CompendiumDetailField,
		CompendiumDetailSection
	} from '$lib/core/types/compendium';
	import { fadeIn, fadeUp, paneEnter, paneExit, stagger } from '$lib/ui/motion';
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
	let showAtlasIntro = $state(false);
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
	const hasContextualFilters = $derived(filterContext !== null);
	const detailSelection = $derived(data.detailSelection);
	const activeDetail = $derived(data.detail);
	const detailFields = $derived((activeDetail?.fields ?? []) as CompendiumDetailField[]);
	const leadingDetailFields = $derived(detailFields.slice(0, 6));
	const trailingDetailFields = $derived(detailFields.slice(6));
	const detailDescriptionSection = $derived(
		findMarkdownSection(activeDetail?.sections ?? [], 'description')
	);
	const detailHigherLevelSection = $derived(
		findMarkdownSection(activeDetail?.sections ?? [], 'higher_level')
	);
	const supplementalDetailSections = $derived(
		(activeDetail?.sections ?? []).filter(
			(section): section is Extract<CompendiumDetailSection, { kind: 'markdown' }> =>
				section.kind === 'markdown' &&
				section.key !== 'description' &&
				section.key !== 'higher_level'
		)
	);
	const creatureEncounterSection = $derived(
		(activeDetail?.sections ?? []).find(
			(section): section is CompendiumCreatureEncounterSection =>
				section.kind === 'creature-encounter'
		) ?? null
	);
	const isDetailOpen = $derived(Boolean(detailSelection && activeDetail));
	const detailHref = $derived(
		activeDetail ? `/compendium/${activeDetail.item.type}/${activeDetail.item.key}` : null
	);

	const typeChipBaseClass =
		'shrink-0 transform-gpu rounded-full border px-4 py-2 text-sm will-change-transform transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-out motion-reduce:transform-none motion-reduce:transition-none active:scale-[0.985]';
	const activeTypeChipClass =
		'border-[color-mix(in_srgb,var(--color-accent)_56%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-accent)_16%,transparent)] text-[var(--color-text-primary)] shadow-[0_0.8rem_1.8rem_color-mix(in_srgb,var(--color-accent)_14%,transparent)]';
	const inactiveTypeChipClass =
		'border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_18%,transparent)] text-[color-mix(in_srgb,var(--color-text-primary)_64%,var(--color-text-secondary))] hover:scale-[1.01] hover:border-[color-mix(in_srgb,var(--color-accent)_28%,var(--color-border))] hover:bg-[color-mix(in_srgb,var(--color-accent)_8%,var(--color-bg-card))] hover:text-[var(--color-text-primary)]';
	const railButtonBaseClass =
		'h-10 w-10 shrink-0 transform-gpu items-center justify-center rounded-full border will-change-transform transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-150 ease-out motion-reduce:transform-none motion-reduce:transition-none active:scale-[0.985] md:inline-flex';
	const activeRailButtonClass =
		'border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_30%,transparent)] text-[var(--color-text-primary)] shadow-[0_0.65rem_1.4rem_color-mix(in_srgb,var(--color-shadow)_12%,transparent)] hover:scale-[1.01] hover:border-[color-mix(in_srgb,var(--color-accent)_28%,var(--color-border))] hover:bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] hover:shadow-[0_0.85rem_1.7rem_color-mix(in_srgb,var(--color-accent)_12%,transparent)]';
	const inactiveRailButtonClass =
		'border-[color-mix(in_srgb,var(--color-border)_64%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_14%,transparent)] text-[var(--color-text-muted)] opacity-45';

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

	function getTypeChipClass(isActive: boolean) {
		return `${typeChipBaseClass} ${isActive ? activeTypeChipClass : inactiveTypeChipClass}`;
	}

	function getRailButtonClass(isEnabled: boolean) {
		return `${railButtonBaseClass} ${isEnabled ? activeRailButtonClass : inactiveRailButtonClass}`;
	}

	function handleDetailCardClick(event: MouseEvent, item: AtlasItem) {
		if (
			event.defaultPrevented ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}

		event.preventDefault();
		void openDetail(item);
	}

	async function openDetail(item: AtlasItem) {
		const nextUrl = new URL(page.url);
		nextUrl.searchParams.set('detailType', item.type);
		nextUrl.searchParams.set('detail', item.key);

		await goto(`${nextUrl.pathname}${nextUrl.search}`, {
			keepFocus: true,
			noScroll: true
		});
	}

	async function closeDetail() {
		const nextUrl = new URL(page.url);
		nextUrl.searchParams.delete('detailType');
		nextUrl.searchParams.delete('detail');

		await goto(`${nextUrl.pathname}${nextUrl.search}`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}

	function handleDetailOpenChange(open: boolean) {
		if (!open) {
			void closeDetail();
		}
	}

	function markdownAt(key: string): string {
		return activeDetail?.markdownHtml?.[key] ?? '';
	}

	function resolveFieldValue(field: CompendiumDetailField): unknown {
		if (field.key !== 'prerequisite') {
			return field.value;
		}

		if (typeof field.value === 'string') {
			return field.value.trim() ? field.value : 'None';
		}

		if (field.value === null || field.value === undefined) {
			return 'None';
		}

		if (Array.isArray(field.value) && field.value.length === 0) {
			return 'None';
		}

		return field.value;
	}

	function findMarkdownSection(
		sections: CompendiumDetailSection[],
		key: string
	): Extract<CompendiumDetailSection, { kind: 'markdown' }> | null {
		return (
			sections.find(
				(section): section is Extract<CompendiumDetailSection, { kind: 'markdown' }> =>
					section.kind === 'markdown' && section.key === key
			) ?? null
		);
	}

	function getAbilityAbbreviation(ability: string): string {
		return ability.slice(0, 3).toUpperCase();
	}

	function getAbilityModifier(score: number): string {
		const modifier = Math.floor((score - 10) / 2);
		return `${modifier >= 0 ? '+' : ''}${modifier}`;
	}

</script>

<svelte:head>
	<title>{pageTitle} | Beta | Grimar</title>
</svelte:head>

<div class="min-h-screen bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--color-accent)_14%,transparent),transparent_38%),linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-canvas)_74%,black),color-mix(in_srgb,var(--color-bg-canvas)_88%,#040302)_48%,color-mix(in_srgb,var(--color-bg-canvas)_76%,var(--color-bg-overlay)))]">
	<div
		class="ui-depth-recede mx-auto flex max-w-[94rem] flex-col gap-6 px-3 py-3 md:px-5 md:py-4"
		data-depth={isDetailOpen ? 'active' : 'idle'}
	>
		<section class="relative overflow-hidden rounded-[2rem] border border-[color-mix(in_srgb,var(--color-accent)_24%,var(--color-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-overlay)_54%,var(--color-bg-canvas)),color-mix(in_srgb,var(--color-bg-canvas)_96%,transparent))] p-5 shadow-[0_1.4rem_3rem_color-mix(in_srgb,var(--color-shadow)_32%,transparent)] md:p-6">
			<div class="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-accent)_6%,transparent),transparent)]"></div>
			<div class="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(color-mix(in_srgb,var(--color-accent)_10%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--color-accent)_10%,transparent)_1px,transparent_1px)] [background-position:center] [background-size:3.5rem_3.5rem]"></div>
			<div class="relative">
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
						<button
							type="button"
							class="ui-lift ui-press inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-border)_78%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_18%,transparent)] px-3 py-1.5 text-[0.72rem] tracking-[0.14em] text-[color-mix(in_srgb,var(--color-text-primary)_82%,var(--color-text-secondary))] uppercase transition-[border-color,background-color,color,box-shadow] hover:border-[color-mix(in_srgb,var(--color-accent)_26%,var(--color-border))] hover:bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] hover:text-[var(--color-text-primary)] hover:shadow-[0_0.85rem_1.7rem_color-mix(in_srgb,var(--color-accent)_10%,transparent)]"
							onclick={() => (showAtlasIntro = !showAtlasIntro)}
							aria-expanded={showAtlasIntro}
							aria-controls="atlas-intro"
						>
							<span
								aria-hidden="true"
								class={`text-[0.9rem] leading-none transition-transform duration-200 ease-out ${showAtlasIntro ? 'rotate-180 text-[var(--color-accent)]' : ''}`}
							>
								i
							</span>
							About Atlas
						</button>
					</div>
					<h1 class="mt-4 max-w-4xl font-[var(--font-display)] text-[1.8rem] leading-[0.98] font-semibold tracking-tight text-[var(--color-text-primary)] md:text-[2.35rem]">
						The Atlas
					</h1>
					{#if showAtlasIntro}
						<p id="atlas-intro" class="mt-3 max-w-3xl text-sm leading-6 text-[color-mix(in_srgb,var(--color-text-primary)_72%,var(--color-text-secondary))]">
							This preview treats the compendium as a searchable atlas instead of a shelf of category cards.
							Type chips narrow the archive, contextual filters appear only when they matter, and every card still
							opens in a Preview Pane before taking you to its Tome.
						</p>
					{/if}
				</div>
			</div>
		</section>

		<section class="rounded-[1.8rem] border border-[color-mix(in_srgb,var(--color-border)_86%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_82%,transparent),color-mix(in_srgb,var(--color-bg-canvas)_96%,transparent))] p-4 shadow-[0_1rem_2.25rem_color-mix(in_srgb,var(--color-shadow)_26%,transparent)] md:p-5">
			<div class="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_15rem_auto]">
				<div class="group/search ui-focus-glow relative rounded-[1rem]">
					<div class="pointer-events-none absolute inset-0 rounded-[1rem] border border-[color-mix(in_srgb,var(--color-accent)_0%,transparent)] opacity-0 shadow-[0_0_0_0_color-mix(in_srgb,var(--color-accent)_0%,transparent)] transition-[opacity,transform] duration-[var(--duration-base)] ease-[var(--ease-smooth)] group-focus-within/search:scale-[1.01] group-focus-within/search:opacity-100 motion-reduce:transform-none"></div>
					<Input
						type="text"
						value={searchInput}
						placeholder="Search the atlas by name or summary..."
						oninput={handleSearchInput}
						class="h-12 rounded-[1rem] border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_44%,transparent)] pr-4 pl-11 text-base text-[var(--color-text-primary)] transition-[border-color,background-color,box-shadow] duration-200 ease-out placeholder:text-[color-mix(in_srgb,var(--color-text-muted)_82%,transparent)] focus-visible:border-[color-mix(in_srgb,var(--color-accent)_34%,var(--color-border))] focus-visible:bg-[color-mix(in_srgb,var(--color-bg-card)_56%,transparent)]"
					/>
					<svg
						class="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-[var(--color-text-muted)] transition-[color,transform] duration-200 ease-out group-focus-within/search:-translate-y-1/2 group-focus-within/search:scale-110 group-focus-within/search:text-[var(--color-accent)] motion-reduce:transform-none"
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

				<Button
					variant="outline"
					class="h-12 rounded-[1rem] border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_24%,transparent)] px-5 text-[var(--color-text-primary)] hover:bg-[color-mix(in_srgb,var(--color-bg-card)_36%,transparent)]"
					onclick={resetFilters}
					disabled={!hasFilters}
				>
					Reset
				</Button>
			</div>

			<div class="mt-4 flex items-center gap-3">
				<button
					type="button"
					class={`hidden ${getRailButtonClass(canScrollTypesLeft)}`}
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
							class={getTypeChipClass(selectedType === 'all')}
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
								class={getTypeChipClass(selectedType === entry.type)}
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
					class={`hidden ${getRailButtonClass(canScrollTypesRight)}`}
					onclick={() => scrollTypeRail('right')}
					disabled={!canScrollTypesRight}
					aria-label="Scroll type filters right"
				>
					<span aria-hidden="true" class="text-lg leading-none">›</span>
				</button>
			</div>

			{#if hasContextualFilters}
				<div transition:slide={{ duration: 180 }} class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
					{/if}
				</div>
			{/if}

			{#if hasFilters}
				<div class="mt-4 flex flex-wrap items-center gap-2 border-t border-[color-mix(in_srgb,var(--color-border)_78%,transparent)] pt-4">
					{#each activeLabels as label (label)}
						<Badge variant="outline" class="border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_24%,transparent)] text-[0.68rem] text-[color-mix(in_srgb,var(--color-text-primary)_84%,var(--color-text-secondary))]">
							{label}
						</Badge>
					{/each}
				</div>
			{/if}
		</section>

		<section class="space-y-4">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<p class="text-sm text-[color-mix(in_srgb,var(--color-text-primary)_72%,var(--color-text-secondary))]">
					Showing {data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1} to {resultWindowEnd}
					of {data.total.toLocaleString()} entries
					{#if selectedType !== 'all'}
						in {COMPENDIUM_TYPE_CONFIGS[selectedType]?.plural.toLowerCase()}.
					{:else}
						in all.
					{/if}
				</p>
			</div>

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
							onclick={(event: MouseEvent) => handleDetailCardClick(event, item)}
							class="ui-card-interactive group h-full rounded-[1.45rem] border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_84%,transparent),color-mix(in_srgb,var(--color-bg-canvas)_96%,transparent))] shadow-[0_1rem_2rem_color-mix(in_srgb,var(--color-shadow)_26%,transparent)] hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_92%,transparent),color-mix(in_srgb,var(--color-bg-canvas)_98%,transparent))]"
						>
							<div class="relative h-full p-4.5">
								<div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] to-transparent opacity-70 transition-opacity duration-300 ease-out group-hover:opacity-100"></div>
								<div class="pointer-events-none absolute inset-x-8 top-0 h-16 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-accent)_12%,transparent),transparent_68%)] opacity-0 blur-2xl transition-[opacity,transform] duration-300 ease-out group-hover:translate-y-1 group-hover:opacity-100 motion-reduce:transform-none"></div>
								<div class="mb-4 flex items-start justify-between gap-3">
									<div class="min-w-0">
										<p class={`text-[0.68rem] tracking-[0.22em] uppercase ${getTypeAccentClasses(item.type)}`}>
											{item.typeLabel}
										</p>
										<h2 class="mt-2 line-clamp-2 font-[var(--font-display)] text-[1.2rem] leading-tight font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-[color-mix(in_srgb,var(--color-text-primary)_88%,var(--color-accent))]">
											{item.name}
										</h2>
									</div>
									<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] border border-[color-mix(in_srgb,var(--color-border)_78%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_24%,transparent)] text-[color-mix(in_srgb,var(--color-text-primary)_66%,var(--color-text-secondary))] transition-[transform,border-color,background-color,color,box-shadow] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:scale-[1.03] group-hover:border-[color-mix(in_srgb,var(--color-accent)_24%,var(--color-border))] group-hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] group-hover:text-[var(--color-text-primary)] group-hover:shadow-[0_0.8rem_1.6rem_color-mix(in_srgb,var(--color-accent)_10%,transparent)] motion-reduce:transform-none">
										<CompendiumTypeIcon type={item.type} fallback="✦" class="h-5 w-5" />
									</div>
								</div>

								{#if item.description}
									<p class="line-clamp-4 min-h-[5.4rem] text-sm leading-6 text-[color-mix(in_srgb,var(--color-text-primary)_60%,var(--color-text-secondary))] transition-colors duration-200 ease-out group-hover:text-[color-mix(in_srgb,var(--color-text-primary)_74%,var(--color-text-secondary))]">
										{item.description}
									</p>
								{/if}

								<div class="mt-4 flex flex-wrap gap-1.5 transition-transform duration-200 ease-out group-hover:translate-y-px motion-reduce:transform-none">
									{#each item.badges as badge, index (`${badge.label}-${index}`)}
										<Badge variant="outline" class={getBadgeClasses(badge.tone)}>
											{badge.label}
										</Badge>
									{/each}
								</div>

								{#if item.documentLabel}
									<div class="mt-4 border-t border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] pt-3.5 transition-[border-color,transform] duration-200 ease-out group-hover:translate-y-px group-hover:border-[color-mix(in_srgb,var(--color-accent)_16%,var(--color-border))] motion-reduce:transform-none">
										<p class="text-[0.65rem] tracking-[0.22em] text-[var(--color-text-muted)] uppercase">Source</p>
										<p class="mt-1 truncate text-sm text-[color-mix(in_srgb,var(--color-text-primary)_62%,var(--color-text-secondary))]">{item.documentLabel}</p>
									</div>
								{/if}

								<div class="pointer-events-none mt-4 flex items-center justify-between border-t border-transparent pt-3 text-[0.68rem] tracking-[0.18em] text-[color-mix(in_srgb,var(--color-text-muted)_84%,transparent)] uppercase opacity-0 transition-[opacity,transform,color] duration-200 ease-out group-hover:translate-y-0 group-hover:border-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] group-hover:opacity-100 group-hover:text-[color-mix(in_srgb,var(--color-text-primary)_72%,var(--color-accent))] motion-reduce:transform-none">
									<span>Preview Pane</span>
									<span aria-hidden="true" class="text-sm leading-none transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none">↗</span>
								</div>
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

<Dialog.Root open={isDetailOpen} onOpenChange={handleDetailOpenChange}>
	<Dialog.Content
		showCloseButton={false}
		class="atlas-preview-pane group/pane top-0 right-0 left-auto h-screen max-h-screen w-full max-w-[min(42rem,100vw)] translate-x-0 translate-y-0 overflow-visible rounded-none border-0 bg-transparent p-0 shadow-none backdrop-blur-0 motion-reduce:transition-none"
		portalProps={{
			disabled: false
		}}
	>
			{#if activeDetail}
				{#key `${activeDetail.item.type}:${activeDetail.item.key}`}
				<div
					class="relative flex h-full max-h-screen flex-col gap-0 overflow-hidden rounded-none border-t-0 border-r-0 border-b-0 border-l border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-overlay)_88%,var(--color-bg-canvas)),color-mix(in_srgb,var(--color-bg-canvas)_98%,transparent))] p-0 shadow-[-2rem_0_4rem_color-mix(in_srgb,var(--color-shadow)_34%,transparent)] backdrop-blur-[28px]"
					in:fly={paneEnter()}
					out:fly={paneExit()}
				>
				<div class="flex items-start justify-between gap-4 border-b border-[color-mix(in_srgb,var(--color-border)_74%,transparent)] px-5 py-4 transition-[opacity,transform,border-color] duration-120 ease-out group-data-[state=closed]/pane:-translate-y-2 group-data-[state=closed]/pane:opacity-0 group-data-[state=open]/pane:translate-y-0 group-data-[state=open]/pane:opacity-100 md:px-6">
					<div class="min-w-0">
						<div
							class="flex flex-wrap items-center gap-2"
							in:fly={fadeUp(stagger(0, 150), 10, 160)}
							out:fade={fadeIn(0, 80)}
						>
							<Badge
								variant="outline"
								class={`text-[0.68rem] tracking-[0.18em] uppercase ${getTypeAccentClasses(activeDetail.item.type)}`}
							>
								{COMPENDIUM_TYPE_CONFIGS[activeDetail.item.type]?.plural ?? activeDetail.item.type}
							</Badge>
							{#if activeDetail.item.source && activeDetail.item.source !== 'open5e'}
								<Badge variant="outline" class="text-[0.68rem]">
									{activeDetail.item.source}
								</Badge>
							{/if}
						</div>
						<div in:fly={fadeUp(stagger(0, 150), 10, 180)} out:fade={fadeIn(0, 80)}>
							<Dialog.Title class="mt-4 font-[var(--font-display)] text-[2rem] leading-tight font-semibold text-[var(--color-text-primary)] md:text-[2.35rem]">
								{activeDetail.item.name}
							</Dialog.Title>
						</div>
						{#if activeDetail.presentation.documentLabel}
							<div in:fly={fadeUp(stagger(0, 175), 10, 170)} out:fade={fadeIn(0, 80)}>
								<Dialog.Description class="mt-2 text-sm text-[color-mix(in_srgb,var(--color-text-primary)_66%,var(--color-text-secondary))]">
									{activeDetail.presentation.documentLabel}
								</Dialog.Description>
							</div>
						{/if}
					</div>

					<Dialog.Close
						class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_24%,transparent)] text-[var(--color-text-muted)] transition-[transform,border-color,background-color,color] duration-150 ease-out hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--color-accent)_26%,var(--color-border))] hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] hover:text-[var(--color-text-primary)] active:translate-y-px active:scale-[0.985]"
					>
						<XIcon class="size-4" />
						<span class="sr-only">Close preview pane</span>
					</Dialog.Close>
				</div>

				<div class="flex-1 overflow-y-auto px-5 py-5 md:px-6">
					<div class="space-y-6 transition-[opacity,transform] duration-120 ease-out group-data-[state=closed]/pane:translate-x-3 group-data-[state=closed]/pane:opacity-0 group-data-[state=open]/pane:translate-x-0 group-data-[state=open]/pane:opacity-100">
						{#if activeDetail.presentation.headerBadges.length > 0}
							<div
								class="flex flex-wrap gap-2"
								in:fly={fadeUp(stagger(1, 150), 10, 170)}
								out:fade={fadeIn(0, 80)}
							>
								{#each activeDetail.presentation.headerBadges as badge, index (`${badge.label}-${index}`)}
									<Badge variant={badge.variant}>{badge.label}</Badge>
								{/each}
							</div>
						{/if}

						{#if leadingDetailFields.length > 0}
							<section
								class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
								in:fly={fadeUp(stagger(1, 150), 10, 170)}
								out:fade={fadeIn(0, 80)}
							>
								{#each leadingDetailFields as field (field.key)}
									<div class="rounded-[1rem] border border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_22%,transparent)] px-4 py-3.5 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_8%,transparent)]">
										<p class="text-[0.66rem] tracking-[0.18em] text-[var(--color-text-muted)] uppercase">
											{field.label}
										</p>
										<div class="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">
											<StructuredValue value={resolveFieldValue(field)} />
										</div>
									</div>
								{/each}
							</section>
						{/if}

						{#if creatureEncounterSection}
							<section
								class="space-y-4"
								in:fly={fadeUp(stagger(2, 150, 75), 10, 175)}
								out:fade={fadeIn(0, 80)}
							>
								<div class="flex items-center gap-2">
									<div class="h-px flex-1 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-accent)_18%,transparent),transparent)]"></div>
									<p class="text-[0.72rem] tracking-[0.22em] text-[var(--color-text-muted)] uppercase">
										Encounter Reference
									</p>
								</div>

								{#if creatureEncounterSection.abilityScores.length > 0}
									<div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
										{#each creatureEncounterSection.abilityScores as abilityScore (abilityScore.ability)}
											<div class="rounded-[1rem] border border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_22%,transparent)] px-3 py-3 text-center shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_8%,transparent)]">
												<p class="text-[0.64rem] tracking-[0.18em] text-[var(--color-text-muted)] uppercase">
													{getAbilityAbbreviation(abilityScore.ability)}
												</p>
												<p class="mt-2 text-xl font-semibold text-[var(--color-text-primary)]">
													{abilityScore.score}
												</p>
												<p class="text-xs text-[color-mix(in_srgb,var(--color-text-primary)_68%,var(--color-text-secondary))]">
													{getAbilityModifier(abilityScore.score)}
												</p>
											</div>
										{/each}
									</div>
								{/if}

								<div class="grid gap-3 sm:grid-cols-3">
									<div class="rounded-[1rem] border border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_22%,transparent)] px-4 py-3.5 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_8%,transparent)]">
										<p class="text-[0.66rem] tracking-[0.18em] text-[var(--color-text-muted)] uppercase">
											Armor Class
										</p>
										<p class="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">
											{creatureEncounterSection.armorClass !== undefined
												? String(creatureEncounterSection.armorClass)
												: '—'}
										</p>
										{#if creatureEncounterSection.armorDetail}
											<p class="mt-1 text-xs leading-5 text-[color-mix(in_srgb,var(--color-text-primary)_68%,var(--color-text-secondary))]">
												{creatureEncounterSection.armorDetail}
											</p>
										{/if}
									</div>
									<div class="rounded-[1rem] border border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_22%,transparent)] px-4 py-3.5 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_8%,transparent)]">
										<p class="text-[0.66rem] tracking-[0.18em] text-[var(--color-text-muted)] uppercase">
											Hit Points
										</p>
										<p class="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">
											{creatureEncounterSection.hitPoints !== undefined
												? String(creatureEncounterSection.hitPoints)
												: '—'}
										</p>
										{#if creatureEncounterSection.hitDice}
											<p class="mt-1 text-xs leading-5 text-[color-mix(in_srgb,var(--color-text-primary)_68%,var(--color-text-secondary))]">
												{creatureEncounterSection.hitDice}
											</p>
										{/if}
									</div>
									<div class="rounded-[1rem] border border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_22%,transparent)] px-4 py-3.5 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_8%,transparent)]">
										<p class="text-[0.66rem] tracking-[0.18em] text-[var(--color-text-muted)] uppercase">
											Speed
										</p>
										<p class="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">
											{creatureEncounterSection.speed ?? '—'}
										</p>
									</div>
								</div>

								{#if creatureEncounterSection.traits.length > 0}
									<div class="space-y-3">
										<p class="text-[0.72rem] tracking-[0.22em] text-[var(--color-text-muted)] uppercase">
											Traits
										</p>
										<div class="space-y-3">
											{#each creatureEncounterSection.traits as trait, index (`trait-${trait.name}-${index}`)}
												<div class="rounded-[1.1rem] border border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_20%,transparent)] px-4 py-4">
													<p class="text-sm font-semibold text-[var(--color-text-primary)]">{trait.name}</p>
													{#if trait.markdownKey}
														<div class="mt-2 text-sm leading-7 text-[color-mix(in_srgb,var(--color-text-primary)_88%,var(--color-text-secondary))] [&_a]:text-[var(--color-accent)] [&_li]:ml-5 [&_ol]:list-decimal [&_p+p]:mt-4 [&_ul]:list-disc">
															{@html markdownAt(trait.markdownKey)}
														</div>
													{/if}
												</div>
											{/each}
										</div>
									</div>
								{/if}

								{#if creatureEncounterSection.actions.length > 0}
									<div class="space-y-3">
										<p class="text-[0.72rem] tracking-[0.22em] text-[var(--color-text-muted)] uppercase">
											Actions
										</p>
										<div class="space-y-3">
											{#each creatureEncounterSection.actions as action, index (`action-${action.name}-${index}`)}
												<div class="rounded-[1.1rem] border border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_20%,transparent)] px-4 py-4">
													<p class="text-sm font-semibold text-[var(--color-text-primary)]">{action.name}</p>
													{#if action.markdownKey}
														<div class="mt-2 text-sm leading-7 text-[color-mix(in_srgb,var(--color-text-primary)_88%,var(--color-text-secondary))] [&_a]:text-[var(--color-accent)] [&_li]:ml-5 [&_ol]:list-decimal [&_p+p]:mt-4 [&_ul]:list-disc">
															{@html markdownAt(action.markdownKey)}
														</div>
													{/if}
												</div>
											{/each}
										</div>
									</div>
								{/if}
							</section>
						{/if}

						{#if detailDescriptionSection}
							<section
								class="space-y-3"
								in:fly={fadeUp(stagger(2, 150, 100), 10, 180)}
								out:fade={fadeIn(0, 80)}
							>
								<div class="flex items-center gap-2">
									<div class="h-px flex-1 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-accent)_18%,transparent),transparent)]"></div>
									<p class="text-[0.72rem] tracking-[0.22em] text-[var(--color-text-muted)] uppercase">
										Description
									</p>
								</div>
								<div class="rounded-[1.2rem] border border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_20%,transparent)] px-4 py-4 text-sm leading-7 text-[color-mix(in_srgb,var(--color-text-primary)_88%,var(--color-text-secondary))] [&_a]:text-[var(--color-accent)] [&_blockquote]:border-l-2 [&_blockquote]:border-[color-mix(in_srgb,var(--color-accent)_26%,transparent)] [&_blockquote]:pl-4 [&_li]:ml-5 [&_ol]:list-decimal [&_p+p]:mt-4 [&_ul]:list-disc">
									{@html markdownAt(detailDescriptionSection.markdownKey)}
								</div>
							</section>
						{:else if activeDetail.item.description}
							<section
								class="space-y-3"
								in:fly={fadeUp(stagger(2, 150, 100), 10, 180)}
								out:fade={fadeIn(0, 80)}
							>
								<div class="flex items-center gap-2">
									<div class="h-px flex-1 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-accent)_18%,transparent),transparent)]"></div>
									<p class="text-[0.72rem] tracking-[0.22em] text-[var(--color-text-muted)] uppercase">
										Description
									</p>
								</div>
								<div class="rounded-[1.2rem] border border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_20%,transparent)] px-4 py-4 text-sm leading-7 text-[color-mix(in_srgb,var(--color-text-primary)_88%,var(--color-text-secondary))]">
									<p>{activeDetail.item.description}</p>
								</div>
							</section>
						{/if}

						{#if detailHigherLevelSection}
							<section
								class="space-y-3"
								in:fly={fadeUp(stagger(2, 150, 100), 10, 180)}
								out:fade={fadeIn(0, 80)}
							>
								<div class="flex items-center gap-2">
									<div class="h-px flex-1 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-accent)_18%,transparent),transparent)]"></div>
									<p class="text-[0.72rem] tracking-[0.22em] text-[var(--color-text-muted)] uppercase">
										{detailHigherLevelSection.title}
									</p>
								</div>
								<div class="rounded-[1.2rem] border border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_20%,transparent)] px-4 py-4 text-sm leading-7 text-[color-mix(in_srgb,var(--color-text-primary)_88%,var(--color-text-secondary))] [&_a]:text-[var(--color-accent)] [&_li]:ml-5 [&_ol]:list-decimal [&_p+p]:mt-4 [&_ul]:list-disc">
									{@html markdownAt(detailHigherLevelSection.markdownKey)}
								</div>
							</section>
						{/if}

						{#if supplementalDetailSections.length > 0}
							<section
								class="space-y-3"
								in:fly={fadeUp(stagger(3, 150, 75), 10, 190)}
								out:fade={fadeIn(0, 80)}
							>
								<div class="flex items-center gap-2">
									<div class="h-px flex-1 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-accent)_18%,transparent),transparent)]"></div>
									<p class="text-[0.72rem] tracking-[0.22em] text-[var(--color-text-muted)] uppercase">
										More
									</p>
								</div>
								<div class="space-y-3">
									{#each supplementalDetailSections as section (section.key)}
										<div class="rounded-[1.2rem] border border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_20%,transparent)] px-4 py-4">
											<p class="text-sm font-semibold text-[var(--color-text-primary)]">{section.title}</p>
											{#if section.description}
												<p class="mt-1 text-sm text-[color-mix(in_srgb,var(--color-text-primary)_62%,var(--color-text-secondary))]">
													{section.description}
												</p>
											{/if}
											<div class="mt-3 text-sm leading-7 text-[color-mix(in_srgb,var(--color-text-primary)_88%,var(--color-text-secondary))] [&_a]:text-[var(--color-accent)] [&_li]:ml-5 [&_ol]:list-decimal [&_p+p]:mt-4 [&_ul]:list-disc">
												{@html markdownAt(section.markdownKey)}
											</div>
										</div>
									{/each}
								</div>
							</section>
						{/if}

						{#if trailingDetailFields.length > 0}
							<section
								class="space-y-3"
								in:fly={fadeUp(stagger(3, 150, 75), 10, 190)}
								out:fade={fadeIn(0, 80)}
							>
								<div class="flex items-center gap-2">
									<div class="h-px flex-1 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-accent)_18%,transparent),transparent)]"></div>
									<p class="text-[0.72rem] tracking-[0.22em] text-[var(--color-text-muted)] uppercase">
										Additional Details
									</p>
								</div>
								<div class="grid gap-3 sm:grid-cols-2">
									{#each trailingDetailFields as field (field.key)}
										<div class="rounded-[1rem] border border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_18%,transparent)] px-4 py-3.5">
											<p class="text-[0.66rem] tracking-[0.18em] text-[var(--color-text-muted)] uppercase">
												{field.label}
											</p>
											<div class="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">
												<StructuredValue value={resolveFieldValue(field)} />
											</div>
										</div>
									{/each}
								</div>
							</section>
						{/if}
					</div>
				</div>

				<div class="border-t border-[color-mix(in_srgb,var(--color-border)_74%,transparent)] px-5 py-4 transition-[opacity,transform,border-color] duration-120 ease-out group-data-[state=closed]/pane:translate-y-2 group-data-[state=closed]/pane:opacity-0 group-data-[state=open]/pane:translate-y-0 group-data-[state=open]/pane:opacity-100 md:px-6">
					<div class="flex flex-col gap-3 sm:flex-row">
						<Button
							variant="outline"
							class="flex-1 border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_20%,transparent)] text-[var(--color-text-primary)]"
							onclick={closeDetail}
						>
							Close
						</Button>
						{#if detailHref}
							<Button href={detailHref} class="flex-1">
								<ExternalLink class="size-4" />
								Open Tome
							</Button>
						{/if}
					</div>
				</div>
				</div>
				{/key}
			{/if}
	</Dialog.Content>
</Dialog.Root>
