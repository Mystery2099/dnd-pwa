<script lang="ts">
	import { Search } from 'lucide-svelte';
	import CategoryCard from '$lib/features/compendium/components/CategoryCard.svelte';
	import { CATEGORIES, getCardsByCategory } from '$lib/core/constants/compendium/categories';
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
		{#each CATEGORIES as category (category.id)}
			<section>
				<h2
					class="mb-6 inline-block border-b border-[var(--color-border)] pb-2 text-xl font-bold text-[var(--color-text-primary)]"
				>
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
						/>
					{/each}
				</div>
			</section>
		{/each}
	</div>
</div>
