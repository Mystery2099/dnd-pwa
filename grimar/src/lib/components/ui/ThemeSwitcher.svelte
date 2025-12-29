<script lang="ts">
	import { THEMES, getTheme, setTheme } from '$lib/core/client/themeStore.svelte';
	import { Check } from 'lucide-svelte';
	import SurfaceCard from './SurfaceCard.svelte';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	const currentTheme = $derived(getTheme());

	function handleSetTheme(id: string) {
		setTheme(id);
	}

	// Helper to get preview colors based on theme ID
	// These are hardcoded for the switcher preview to look accurate even before theme is applied
	const themePreviews: Record<string, { bg: string; accent: string }> = {
		amethyst: { bg: '#0f172a', accent: '#a855f7' },
		arcane: { bg: '#451a03', accent: '#f59e0b' },
		nature: { bg: '#052e16', accent: '#10b981' },
		fire: { bg: '#450a0a', accent: '#f97316' },
		ice: { bg: '#0c4a6e', accent: '#06b6d4' },
		void: { bg: '#000000', accent: '#a855f7' },
		ocean: { bg: '#042f2e', accent: '#14b8a6' }
	};
</script>

<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 {className}">
	{#each THEMES as theme (theme.id)}
		{@const isSelected = currentTheme === theme.id}
		{@const preview = themePreviews[theme.id]}

		<button
			onclick={() => handleSetTheme(theme.id)}
			class="group relative text-left transition-all"
			aria-label="Select {theme.name} theme"
		>
			<SurfaceCard
				class="h-full border p-4 transition-all duration-300 hover:scale-[1.02] 
                {isSelected
					? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20 shadow-[0_0_20px_rgba(var(--theme-accent),0.3)]'
					: 'border-white/5 hover:border-white/20'}"
			>
				<div class="flex items-center gap-4">
					<!-- Theme Preview Orb -->
					<div
						class="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 shadow-lg"
						style="background: radial-gradient(circle at 50% 0%, {preview.accent}44, {preview.bg});"
					>
						<div class="size-4 rounded-full" style="background-color: {preview.accent}; shadow: 0 0 10px {preview.accent};"></div>
						{#if isSelected}
							<div class="absolute inset-0 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-[1px]">
								<Check class="size-5 text-white" />
							</div>
						{/if}
					</div>

					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-2">
							<span class="truncate font-bold text-white">{theme.name}</span>
						</div>
						<p class="truncate text-xs text-gray-400">{theme.description}</p>
					</div>
				</div>
			</SurfaceCard>
		</button>
	{/each}
</div>
