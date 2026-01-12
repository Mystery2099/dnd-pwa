<script lang="ts">
	import { goto } from '$app/navigation';
	import { createKeyboardNav } from '$lib/core/utils/keyboardNav';
	import CompendiumEntryView from '$lib/features/compendium/components/CompendiumEntryView.svelte';
	import EntryViewNavigation from '$lib/features/compendium/components/EntryViewNavigation.svelte';
	import { getCompendiumConfig } from '$lib/core/constants/compendium';
	import type { PageData } from './$types';
	import type { CompendiumItem } from '$lib/core/types/compendium';

	// Entry Content Components
	import SpellEntryContent from '$lib/features/compendium/components/entry-content/SpellEntryContent.svelte';
	import MonsterEntryContent from '$lib/features/compendium/components/entry-content/MonsterEntryContent.svelte';
	import FeatEntryContent from '$lib/features/compendium/components/entry-content/FeatEntryContent.svelte';
	import BackgroundEntryContent from '$lib/features/compendium/components/entry-content/BackgroundEntryContent.svelte';
	import RaceEntryContent from '$lib/features/compendium/components/entry-content/RaceEntryContent.svelte';
	import ClassEntryContent from '$lib/features/compendium/components/entry-content/ClassEntryContent.svelte';
	import ItemEntryContent from '$lib/features/compendium/components/entry-content/ItemEntryContent.svelte';

	let { data }: { data: PageData } = $props();

	const item = $derived(data.item);
	const nav = $derived(data.navigation);
	const dbType = $derived(data.dbType);
	const pathType = $derived(data.pathType);
	const provider = $derived(data.provider);
	const sourceBook = $derived(data.sourceBook);
	const config = $derived(getCompendiumConfig(pathType));

	// Cast item to CompendiumItem for config functions that expect it
	// The unified types have the same essential properties
	const itemForConfig = $derived(item as unknown as CompendiumItem);

	// Get accent color from config
	const accentColor = $derived(config.display.detailAccent(itemForConfig));

	// Build URLs with provider/sourceBook
	const basePath = $derived(`/compendium/${pathType}/${provider}/${sourceBook}`);
	const prevUrl = $derived(nav.prev ? `${basePath}/${nav.prev.slug}` : null);
	const nextUrl = $derived(nav.next ? `${basePath}/${nav.next.slug}` : null);
	// URL for "All X" button - goes to full list without provider/sourceBook filter
	const allUrl = $derived(`/compendium/${pathType}`);
	const listUrl = $derived(allUrl);

	// Keyboard navigation
	$effect(() => {
		const cleanup = createKeyboardNav({
			navigation: nav as { prev: CompendiumItem | null; next: CompendiumItem | null },
			basePath,
			onClose: handleClose,
			listUrlKey: config.routes.storageKeyListUrl
		});
		return cleanup;
	});

	// Close handler that preserves filters
	function handleClose() {
		const savedListUrl = sessionStorage.getItem(config.routes.storageKeyListUrl);
		goto(savedListUrl || listUrl);
	}
</script>

<svelte:head>
	<title>{item.name} - {config.ui.displayName} - Grimar Compendium</title>
	<meta name="description" content={config.display.metaDescription(itemForConfig)} />
	<meta property="og:title" content={item.name} />
	<meta property="og:description" content={config.display.subtitle(itemForConfig)} />
	<meta property="og:type" content="website" />
</svelte:head>

<div class="mx-auto max-w-4xl p-4 md:p-6">
	<EntryViewNavigation {prevUrl} {nextUrl} {listUrl} />

	<CompendiumEntryView
		title={item.name}
		type={config.ui.displayName}
		source={item.source}
		{sourceBook}
		{provider}
		tags={config.display.tags(itemForConfig)}
		onClose={handleClose}
		{accentColor}
	>
		{#if dbType === 'spells'}
			<SpellEntryContent spell={item.details ?? {}} />
		{:else if dbType === 'creatures'}
			<MonsterEntryContent monster={item.details ?? {}} />
		{:else if dbType === 'feats'}
			<FeatEntryContent feat={item.details ?? {}} />
		{:else if dbType === 'backgrounds'}
			<BackgroundEntryContent background={item.details ?? {}} />
		{:else if dbType === 'species'}
			<RaceEntryContent race={item.details ?? {}} />
		{:else if dbType === 'classes'}
			<ClassEntryContent classData={item.details ?? {}} />
		{:else if dbType === 'magicitems'}
			<ItemEntryContent item={item.details ?? {}} />
		{:else}
			<div class="space-y-4">
				<div
					class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-overlay)] p-4 font-mono text-xs"
				>
					<pre>{JSON.stringify(item.details, null, 2)}</pre>
				</div>
			</div>
		{/if}
	</CompendiumEntryView>

	<!-- Keyboard shortcuts hint -->
	<div class="mt-6 text-center text-xs text-[var(--color-text-muted)]">
		<span class="mr-4">← → Navigate {config.ui.displayNamePlural.toLowerCase()}</span>
		<span>Esc Close</span>
	</div>
</div>
