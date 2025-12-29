<script lang="ts">
	import { goto } from '$app/navigation';
	import { createKeyboardNav } from '$lib/utils/keyboardNav';
	import CompendiumDetail from '$lib/components/compendium/CompendiumDetail.svelte';
	import DetailNavigation from '$lib/components/compendium/DetailNavigation.svelte';
	import SpellDetailContent from '$lib/components/compendium/detail/SpellDetailContent.svelte';
	import { SCHOOL_TEXT_COLORS } from '$lib/constants/spells';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const spell = $derived(data.spell as any);
	const nav = $derived(data.navigation);

	// Get accent color based on school
	const accentColor = $derived(
		spell.school?.name
			? SCHOOL_TEXT_COLORS[spell.school.name as keyof typeof SCHOOL_TEXT_COLORS] ||
					SCHOOL_TEXT_COLORS.default
			: SCHOOL_TEXT_COLORS.default
	);

	// Keyboard navigation - re-run when nav changes
	$effect(() => {
		createKeyboardNav({
			navigation: nav,
			basePath: '/compendium/spells',
			onClose: handleClose,
			listUrlKey: 'spell-list-url'
		});
	});

	// Close handler that preserves filters
	function handleClose() {
		const listUrl = sessionStorage.getItem('spell-list-url');
		goto(listUrl || '/compendium/spells');
	}
</script>

<svelte:head>
	<title>{spell.name} - Grimar Compendium</title>
	<meta
		name="description"
		content={`${spell.level === 0 ? 'Cantrip' : 'Level ' + spell.level} ${spell.school?.name || ''} spell for D&D 5th Edition`}
	/>
	<meta property="og:title" content={spell.name} />
	<meta
		property="og:description"
		content={`${spell.level === 0 ? 'Cantrip' : 'Level ' + spell.level} ${spell.school?.name || ''} spell`}
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<div class="container mx-auto max-w-4xl p-4 md:p-6">
	<DetailNavigation
		prevUrl={nav.prev ? `/compendium/spells/${nav.prev.externalId}` : null}
		nextUrl={nav.next ? `/compendium/spells/${nav.next.externalId}` : null}
		listUrl="/compendium/spells"
	/>

	<CompendiumDetail
		title={spell.name}
		type="Spell"
		tags={[
			spell.school?.name || spell.school || 'Unknown',
			spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			...((spell as any).classes
				? Array.isArray((spell as any).classes)
					? (spell as any).classes.map((c: any) => c.name || c)
					: typeof (spell as any).classes === 'string'
						? (spell as any).classes.split(',').map((c: string) => c.trim())
						: []
				: (spell as any).dnd_class
					? (spell as any).dnd_class.split(',').map((c: string) => c.trim())
					: [])
		]}
		onClose={handleClose}
		{accentColor}
	>
		<SpellDetailContent {spell} />
	</CompendiumDetail>

	<!-- Keyboard shortcuts hint -->
	<div class="mt-6 text-center text-xs text-gray-600">
		<span class="mr-4">← → Navigate spells</span>
		<span>Esc Close</span>
	</div>
</div>
