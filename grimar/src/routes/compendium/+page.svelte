<script lang="ts">
	import { onMount } from 'svelte';
	import { Search } from 'lucide-svelte';
	import CategoryCard from '$lib/features/compendium/components/CategoryCard.svelte';
	import QuickReference from '$lib/features/compendium/components/QuickReference.svelte';
	import { CATEGORIES, getCardsByCategory } from '$lib/core/constants/compendium/categories';

	let itemCounts = $state<Record<string, number>>({});
	let lookupData = $state<Record<string, { name: string; desc: string; details: Record<string, unknown> }[]>>({});
	let loading = $state(true);

	const LOOKUP_TYPES = ['skills', 'conditions', 'languages', 'alignments'] as const;

	onMount(async () => {
		try {
			const countsRes = await fetch('/api/compendium/counts');
			if (countsRes.ok) {
				itemCounts = await countsRes.json();
			}

			// Fetch each lookup type separately
			for (const lookupType of LOOKUP_TYPES) {
				const lookupsRes = await fetch(`/api/compendium/items?type=${lookupType}&limit=100`);
				if (lookupsRes.ok) {
					const data = await lookupsRes.json();
					if (data.items?.length > 0) {
						lookupData[lookupType] = data.items.map((item: { name: string; desc: string; details: Record<string, unknown> }) => ({
							name: item.name,
							desc: item.desc || '',
							details: item.details || {}
						}));
					}
				}
			}
		} catch (e) {
			console.error('Failed to load compendium data:', e);
		} finally {
			loading = false;
		}
	});

	const lookupConfigs = [
		{ type: 'skills', title: 'Skills', color: 'text-emerald-400', keyField: 'name', descField: 'desc' },
		{ type: 'conditions', title: 'Conditions', color: 'text-amber-400', keyField: 'name', descField: 'desc' },
		{ type: 'languages', title: 'Languages', color: 'text-cyan-400', keyField: 'name', descField: 'desc' },
		{ type: 'alignments', title: 'Alignments', color: 'text-violet-400', keyField: 'name', descField: 'desc' }
	] as const;
</script>

<div class="relative flex min-h-[calc(100vh-6rem)] animate-enter flex-col items-center py-12 pb-24">
	<!-- Header -->
	<div class="mx-auto mb-12 max-w-2xl px-4 text-center">
		<h1
			class="mb-4 bg-linear-to-b from-[var(--color-text-primary)] via-[var(--color-text-primary)] to-[color-mix(in_srgb,var(--color-text-primary)_50%,var(--color-accent))] bg-clip-text text-4xl font-black tracking-tight text-transparent drop-shadow-[0_0_20px_var(--color-accent-glow)] md:text-5xl"
		>
			The Compendium
		</h1>
		<p class="text-lg text-[var(--color-text-muted)]">
			A complete index of arcane knowledge. Browse spells, beasts, and artifacts gathered from the
			weave.
		</p>
	</div>

	<!-- Search Hint -->
	<button class="group relative z-10 mx-auto mb-16 w-full max-w-lg">
		<div
			class="absolute -inset-0.5 rounded-full bg-linear-to-r from-purple-500 to-indigo-500 opacity-30 blur transition duration-500 group-hover:opacity-60"
		></div>
		<div
			class="relative flex h-14 w-full items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-overlay)] px-6 text-left shadow-2xl backdrop-blur-xl transition-all group-hover:bg-[var(--color-bg-overlay)]"
		>
			<Search
				class="size-5 text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-accent)]"
			/>
			<span class="text-lg text-[var(--color-text-muted)]">Search the archives...</span>
			<div class="ml-auto flex gap-1">
				<kbd
					class="hidden items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-card)] px-2 py-1 text-xs font-bold text-[var(--color-text-muted)] md:inline-flex"
					>⌘ K</kbd
				>
			</div>
		</div>
	</button>

	<div class="flex w-full max-w-6xl flex-col gap-16 px-4">
		<!-- Quick Reference Section -->
		{#if !loading && lookupData && Object.keys(lookupData).length > 0}
			<section class="animate-fade-in">
				<h2
					class="mb-6 flex items-center gap-3 text-xl font-bold text-[var(--color-text-primary)]"
				>
					<span class="inline-block h-px w-8 bg-[var(--color-accent)]"></span>
					Quick Reference
				</h2>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{#each lookupConfigs as config}
						{#if lookupData[config.type]}
							<QuickReference
								items={lookupData}
								title={config.title}
								icon=""
								type={config.type}
								accentColor={config.color}
								keyField={config.keyField}
								descriptionField={config.descField}
							/>
						{/if}
					{/each}
				</div>
			</section>
		{/if}

		{#each CATEGORIES as category (category.id)}
			<section>
				<h2
					class="mb-6 flex items-center gap-3 text-xl font-bold text-[var(--color-text-primary)]"
				>
					<span class="inline-block h-px w-8 bg-[var(--color-accent)]"></span>
					{category.title}
				</h2>
				<div class="grid {category.gridCols} gap-6">
					{#each getCardsByCategory(category.id) as card (card.title)}
						<CategoryCard
							title={card.title}
							description={card.description}
							href={card.href}
							icon={card.icon}
							gradient={card.gradient}
							accent={card.accent}
							count={itemCounts[card.href]}
						/>
					{/each}
				</div>
			</section>
		{/each}
	</div>
</div>
