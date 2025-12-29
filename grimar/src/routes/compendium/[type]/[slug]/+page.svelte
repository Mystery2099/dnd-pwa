<script lang="ts">
	import { goto } from '$app/navigation';
	import { createKeyboardNav } from '$lib/utils/keyboardNav';
	import CompendiumDetail from '$lib/components/compendium/CompendiumDetail.svelte';
	import DetailNavigation from '$lib/components/compendium/DetailNavigation.svelte';
	import type { PageData } from './$types';

	// Detail Content Components
	import SpellDetailContent from '$lib/components/compendium/detail/SpellDetailContent.svelte';
	import MonsterDetailContent from '$lib/components/compendium/detail/MonsterDetailContent.svelte';

	let { data }: { data: PageData } = $props();

	const item = $derived(data.item);
	const nav = $derived(data.navigation);
	const config = $derived(data.config);
	const dbType = $derived(data.dbType);
	const pathType = $derived(data.pathType);

	// Get accent color from config
	const accentColor = $derived(config.display.detailAccent(item));

	// Keyboard navigation
	$effect(() => {
		const cleanup = createKeyboardNav({
			navigation: nav,
			basePath: `/compendium/${pathType}`,
			onClose: handleClose,
			listUrlKey: config.routes.storageKeyListUrl
		});
		return cleanup;
	});

	// Close handler that preserves filters
	function handleClose() {
		const listUrl = sessionStorage.getItem(config.routes.storageKeyListUrl);
		goto(listUrl || `/compendium/${pathType}`);
	}
</script>

<svelte:head>
	<title>{item.name} - {config.ui.displayName} - Grimar Compendium</title>
	<meta name="description" content={config.display.metaDescription(item)} />
	<meta property="og:title" content={item.name} />
	<meta property="og:description" content={config.display.subtitle(item)} />
	<meta property="og:type" content="website" />
</svelte:head>

<div class="mx-auto max-w-4xl p-4 md:p-6">
	<DetailNavigation
		prevUrl={nav.prev ? `/compendium/${pathType}/${nav.prev.externalId}` : null}
		nextUrl={nav.next ? `/compendium/${pathType}/${nav.next.externalId}` : null}
		listUrl={`/compendium/${pathType}`}
	/>

	<CompendiumDetail
		title={item.name}
		type={config.ui.displayName}
		source={item.source}
		tags={config.display.tags(item)}
		onClose={handleClose}
		{accentColor}
	>
		{#if dbType === 'spell'}
			<SpellDetailContent spell={item} />
		{:else if dbType === 'monster'}
			<MonsterDetailContent monster={item} />
		{:else}
			<div class="space-y-4">
				<div class="rounded-lg border border-white/10 bg-black/20 p-4 font-mono text-xs">
					<pre>{JSON.stringify(item, null, 2)}</pre>
				</div>
			</div>
		{/if}
	</CompendiumDetail>

	<!-- Keyboard shortcuts hint -->
	<div class="mt-6 text-center text-xs text-gray-600">
		<span class="mr-4">← → Navigate {config.ui.displayNamePlural.toLowerCase()}</span>
		<span>Esc Close</span>
	</div>
</div>
