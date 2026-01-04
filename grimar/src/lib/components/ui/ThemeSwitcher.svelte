<script lang="ts">
	import { THEMES, getTheme, setTheme } from '$lib/core/client/themeStore.svelte';
	import { Check } from 'lucide-svelte';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	const currentTheme = $derived(getTheme());

	function handleSetTheme(id: string) {
		setTheme(id);
	}

	// Helper to get preview colors based on theme ID
	const themePreviews: Record<string, { bg: string; accent: string; name: string }> = {
		amethyst: { bg: '#0f172a', accent: '#a855f7', name: 'Amethyst' },
		arcane: { bg: '#451a03', accent: '#f59e0b', name: 'Arcane' },
		nature: { bg: '#052e16', accent: '#10b981', name: 'Nature' },
		fire: { bg: '#450a0a', accent: '#f97316', name: 'Fire' },
		ice: { bg: '#0c4a6e', accent: '#06b6d4', name: 'Ice' },
		void: { bg: '#000000', accent: '#a855f7', name: 'Void' },
		ocean: { bg: '#042f2e', accent: '#14b8a6', name: 'Ocean' }
	};

	// Calculate orbital positions for themes (7 themes = roughly evenly distributed)
	const radius = 90; // Distance from center in pixels
	function getPosition(index: number, total: number) {
		const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top
		const x = Math.cos(angle) * radius;
		const y = Math.sin(angle) * radius;
		return { x, y, angle };
	}

	const totalThemes = THEMES.length;
</script>

<div class="w-full {className}">
	<!-- Mobile: Grid layout (same as before but with runestone styling) -->
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
		{#each THEMES as theme (theme.id)}
			{@const isSelected = currentTheme === theme.id}
			{@const preview = themePreviews[theme.id]}

			<button
				onclick={() => handleSetTheme(theme.id)}
				class="runestone"
				data-state={isSelected ? 'selected' : 'unselected'}
				aria-label="Select {theme.name} theme"
			>
				<div class="runestone-content">
					<div
						class="runestone-rune"
						style="background: radial-gradient(circle at 50% 0%, {preview.accent}88, {preview.accent}44);"
						aria-hidden="true"
					></div>
					<div class="runestone-label">
						<span class="runestone-label-text">{theme.name}</span>
						<span class="runestone-label-desc">{theme.description}</span>
					</div>
					{#if isSelected}
						<Check class="size-4 shrink-0 text-[var(--color-accent)]" />
					{/if}
				</div>
			</button>
		{/each}
	</div>

	<!-- Desktop: Orbital Nexus -->
	<div class="hidden lg:block">
		<div class="theme-nexus">
			<!-- Orbital ring -->
			<div class="theme-nexus-ring" aria-hidden="true"></div>

			<!-- Central current theme -->
			<button
				class="theme-nexus-center"
				onclick={() => {
					const currentIndex = THEMES.findIndex((t) => t.id === currentTheme);
					const nextIndex = (currentIndex + 1) % THEMES.length;
					handleSetTheme(THEMES[nextIndex].id);
				}}
				aria-label="Current theme: {themePreviews[currentTheme]
					?.name}. Click to cycle to next theme."
			>
				{#if themePreviews[currentTheme]}
					<div
						class="size-8 rounded-full"
						style="background: radial-gradient(circle at 30% 30%, {themePreviews[currentTheme]
							.accent}, {themePreviews[currentTheme].bg}); box-shadow: 0 0 16px {themePreviews[
							currentTheme
						].accent}88;"
					></div>
				{/if}
			</button>

			<!-- Orbiting theme options -->
			{#each THEMES as theme, i (theme.id)}
				{@const isSelected = currentTheme === theme.id}
				{@const preview = themePreviews[theme.id]}
				{@const pos = getPosition(i, totalThemes)}

				<button
					class="theme-nexus-orb"
					data-active={isSelected}
					style="transform: translate(calc(-50% + {pos.x}px), calc(-50% + {pos.y}px));"
					onclick={() => handleSetTheme(theme.id)}
					aria-label="Select {theme.name} theme"
				>
					<div
						class="theme-nexus-orb-preview"
						style="background: radial-gradient(circle at 50% 0%, {preview.accent}88, {preview.accent}44);"
					></div>
					{#if isSelected}
						<Check
							class="absolute -bottom-5 left-1/2 size-3 -translate-x-1/2 text-[var(--color-accent)]"
						/>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Current theme label -->
		<div class="mt-6 text-center">
			<span class="text-sm font-medium text-[var(--color-text-primary)]">
				{themePreviews[currentTheme]?.name}
			</span>
			<p class="text-xs text-[var(--color-text-secondary)]">
				{THEMES.find((t) => t.id === currentTheme)?.description}
			</p>
		</div>
	</div>
</div>
