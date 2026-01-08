<script lang="ts">
	import { setTheme, THEME_OPTIONS } from '$lib/core/client/themeStore.svelte';
	import { Palette, Sparkles, Flame, Leaf, Droplets, CircleDot } from 'lucide-svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';

	// Theme icons mapping
	const THEME_ICONS: Record<string, any> = {
		amethyst: Sparkles,
		arcane: Flame,
		nature: Leaf,
		fire: Sparkles,
		ocean: Droplets,
		obsidian: CircleDot
	};

	// Theme gradients mapping
	const THEME_GRADIENTS: Record<string, string> = {
		amethyst: 'from-purple-500/20 to-pink-500/20',
		arcane: 'from-amber-500/20 to-orange-500/20',
		nature: 'from-emerald-500/20 to-green-500/20',
		fire: 'from-red-500/20 to-orange-500/20',
		ocean: 'from-cyan-500/20 to-teal-500/20',
		obsidian: 'from-gray-500/20 to-slate-500/20'
	};

	// Theme accent colors
	const THEME_ACCENTS: Record<string, string> = {
		amethyst: 'text-purple-400',
		arcane: 'text-amber-400',
		nature: 'text-emerald-400',
		fire: 'text-red-400',
		ocean: 'text-cyan-400',
		obsidian: 'text-gray-400'
	};

	import { getTheme } from '$lib/core/client/themeStore.svelte';

	const currentTheme = $derived(getTheme());
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	{#each THEME_OPTIONS as theme (theme.value)}
		{@const Icon = THEME_ICONS[theme.value] || Palette}
		{@const isSelected = currentTheme === theme.value}
		{@const gradient = THEME_GRADIENTS[theme.value] || 'from-purple-500/20 to-pink-500/20'}
		{@const accent = THEME_ACCENTS[theme.value] || 'text-purple-400'}

		<button
			type="button"
			onclick={() => setTheme(theme.value)}
			class="group relative h-full w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 text-left transition-all hover:scale-[1.02] hover:border-[var(--color-accent)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-canvas)] {isSelected
				? 'border-[var(--theme-accent)] bg-[color-mix(in_srgb,var(--theme-accent)_10%,var(--color-bg-card))] shadow-[var(--color-accent-glow)]'
				: ''}"
			aria-label="Select {theme.label} theme"
			aria-pressed={isSelected}
		>
			<!-- Background Gradient -->
			<div
				class="absolute inset-0 rounded-2xl bg-linear-to-br {gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100"
			></div>

			<!-- Static Glossy Overlay -->
			<div
				class="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-br from-[color-mix(in_srgb,var(--color-text-primary)_15%,transparent)] to-transparent opacity-60"
			></div>

			<!-- Selection Indicator -->
			{#if isSelected}
				<div
					class="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full border border-[var(--theme-accent)] bg-[color-mix(in_srgb,var(--theme-accent)_20%,var(--color-bg-card))] text-[var(--theme-accent)] shadow-[0_0_12px_var(--color-accent-glow)]"
				>
					<div class="size-2 rounded-full bg-[var(--theme-accent)]"></div>
				</div>
			{/if}

			<div class="relative flex h-full flex-col items-center justify-center gap-4 text-center">
				<!-- Icon Container -->
				<div
					class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent),0_4px_20px_color-mix(in_srgb,black_30%,transparent)] transition-all duration-300 group-hover:scale-110 {accent}"
				>
					<Icon
						class="size-8 drop-shadow-[0_0_8px_currentColor]"
						style="color: {isSelected ? 'var(--theme-accent)' : ''}"
					/>
				</div>

				<div>
					<h3
						class="mb-1 text-xl font-bold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-text-primary)]"
					>
						{theme.label}
					</h3>
					<p class="text-sm text-[var(--color-text-secondary)]">{theme.description}</p>
				</div>
			</div>
		</button>
	{/each}
</div>
