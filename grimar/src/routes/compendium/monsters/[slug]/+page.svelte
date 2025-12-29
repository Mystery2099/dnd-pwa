<script lang="ts">
	import { createKeyboardNav } from '$lib/utils/keyboardNav';
	import CompendiumDetail from '$lib/components/compendium/CompendiumDetail.svelte';
	import DetailNavigation from '$lib/components/compendium/DetailNavigation.svelte';
	import MonsterDetailContent from '$lib/components/compendium/detail/MonsterDetailContent.svelte';
	import { TYPE_TEXT_COLORS } from '$lib/constants/monsters';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const monster = $derived(data.monster);
	const nav = $derived(data.navigation);

	// Get accent color based on type
	const accentColor = $derived(
		monster.type
			? TYPE_TEXT_COLORS[monster.type as keyof typeof TYPE_TEXT_COLORS] || TYPE_TEXT_COLORS.default
			: TYPE_TEXT_COLORS.default
	);

	// Keyboard navigation - re-run when nav changes
	$effect(() => {
		createKeyboardNav({
			navigation: nav,
			basePath: '/compendium/monsters',
			onClose: handleClose,
			listUrlKey: 'monster-list-url'
		});
	});

	// Close handler that preserves filters
	function handleClose() {
		const listUrl = sessionStorage.getItem('monster-list-url');
		window.location.href = listUrl || '/compendium/monsters';
	}
</script>

<svelte:head>
	<title>{monster.name} - Grimar Compendium</title>
	<meta
		name="description"
		content={`${monster.size} ${monster.type}, CR ${monster.challenge_rating} - D&D 5e Monster`}
	/>
	<meta property="og:title" content={monster.name} />
	<meta
		property="og:description"
		content={`${monster.size} ${monster.type}, Challenge Rating ${monster.challenge_rating}`}
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<div class="container mx-auto max-w-4xl p-4 md:p-6">
	<DetailNavigation
		prevUrl={nav.prev ? `/compendium/monsters/${nav.prev.externalId}` : null}
		nextUrl={nav.next ? `/compendium/monsters/${nav.next.externalId}` : null}
		listUrl="/compendium/monsters"
	/>

	<CompendiumDetail
		title={monster.name}
		type="Monster"
		tags={[
			monster.size ?? 'Unknown',
			monster.type ?? 'Unknown',
			`CR ${monster.challenge_rating ?? '?'}`
		]}
		onClose={handleClose}
		{accentColor}
	>
		<MonsterDetailContent {monster} />
	</CompendiumDetail>

	<!-- Keyboard shortcuts hint -->
	<div class="mt-6 text-center text-xs text-gray-600">
		<span class="mr-4">← → Navigate monsters</span>
		<span>Esc Close</span>
	</div>
</div>
