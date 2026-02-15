<script lang="ts">
	import { getAllThemes, getCurrentTheme, setTheme, type ThemeConfig } from '$lib/core/client/themeStore.svelte';
	import { getThemeGradient, getThemeAccentClass } from '$lib/core/client/themeCSS';
	import { Palette } from 'lucide-svelte';

	const currentTheme = $derived(getCurrentTheme());
	const themes = $derived(getAllThemes());

	function handleSetTheme(themeId: string) {
		setTheme(themeId);
	}
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	{#each themes as theme (theme.id)}
		{@const isSelected = currentTheme?.id === theme.id}
		{@const gradient = getThemeGradient(theme)}
		{@const accentClass = getThemeAccentClass(theme)}
		{@const Icon = theme.icon || Palette}

		<button
			type="button"
			onclick={() => handleSetTheme(theme.id)}
			class="group relative h-full w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 text-left transition-all hover:scale-[1.02] hover:border-[var(--color-accent)]/30 focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-canvas)] focus:outline-none {isSelected
				? 'border-[var(--theme-accent)] bg-[color-mix(in_srgb,var(--theme-accent)_10%,var(--color-bg-card))] shadow-[var(--color-accent-glow)]'
				: ''}"
			aria-label="Select {theme.name} theme"
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
					class="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full border border-[var(--theme-accent)] bg-[color-mix(in_srgb,var(--theme-accent)_20%,var(--color-bg-card))] text-[var(--theme-accent)] shadow-[0_0_12px_var(--color-accent-glow)]"
				>
					<div class="size-2 rounded-full bg-[var(--theme-accent)]"></div>
				</div>
			{/if}

			<div class="relative flex h-full flex-col items-center justify-center gap-4 text-center">
				<!-- Icon Container -->
				<div
					class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent),0_4px_20px_color-mix(in_srgb,black_30%,transparent)] transition-all duration-300 group-hover:scale-110 {accentClass}"
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
						{theme.name}
					</h3>
					<p class="text-sm text-[var(--color-text-secondary)]">{theme.description}</p>
				</div>
			</div>
		</button>
	{/each}
</div>
