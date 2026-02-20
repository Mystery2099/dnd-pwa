<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { settingsStore } from '$lib/core/client/settingsStore.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

	type ItemVariant = 'grid' | 'list';

	interface Props {
		title: string;
		subtitle?: string;
		sourceBook?: string | null;
		active?: boolean;
		icon?: ComponentType;
		variant?: ItemVariant;
		school?: string; // Simplified school name for gem colors (evocation, abjuration, etc.) or any string
		type?: string; // Compendium type (e.g., 'spells', 'monsters')
		slug?: string; // Item slug for URL generation
		onclick?: () => void;
	}

	let {
		title,
		subtitle,
		sourceBook,
		active,
		icon: Icon,
		variant = 'list',
		school,
		type,
		slug,
		onclick
	}: Props = $props();

	// Map spell school to gem color CSS variable via theme
	const schoolGemColor: Record<string, string> = {
		evocation: 'var(--color-gem-ruby)',
		abjuration: 'var(--color-gem-sapphire)',
		necromancy: 'var(--color-gem-emerald)',
		illusion: 'var(--color-gem-amethyst)',
		divination: 'var(--color-gem-topaz)',
		// Handle capitalized/full names
		Evocation: 'var(--color-gem-ruby)',
		Abjuration: 'var(--color-gem-sapphire)',
		Necromancy: 'var(--color-gem-emerald)',
		Illusion: 'var(--color-gem-amethyst)',
		Divination: 'var(--color-gem-topaz)',
		Enchantment: 'var(--color-gem-amethyst)',
		Conjuration: 'var(--color-gem-emerald)',
		Transmutation: 'var(--color-gem-topaz)'
	};

	// Use school gem color, or fall back to theme accent color
	const accentColor = $derived(school ? schoolGemColor[school] : 'var(--color-accent)');

</script>

<button
	data-testid="compendium-item"
	class="group relative w-full overflow-visible transition-all duration-300 {variant === 'grid'
		? 'h-full rounded-2xl'
		: 'mb-2 rounded-xl'}"
	{onclick}
	style="--accent-color: {accentColor}"
>
	<!-- Card Base - glass-morphic background using theme colors -->
	<div
		class="absolute inset-0 rounded-2xl border border-[var(--color-border)]/60 bg-[color-mix(in_srgb,var(--color-bg-card)_85%,var(--color-bg-overlay))] backdrop-blur-sm transition-all duration-300 {active
			? 'border-[var(--accent-color)]/40 bg-[color-mix(in_srgb,var(--accent-color)_10%,var(--color-bg-card))]'
			: 'group-hover:border-[var(--color-border)] group-hover:bg-[color-mix(in_srgb,var(--color-bg-card)_90%,var(--color-bg-overlay))]'}"
	></div>

	<!-- Gem accent border (left side) - uses theme's gem colors -->
	<div
		class="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-linear-to-b from-[var(--accent-color)] to-[color-mix(in_srgb,var(--accent-color),transparent_50%)] opacity-0 transition-opacity duration-300 {active
			? 'opacity-100'
			: 'group-hover:opacity-100'}"
	></div>

	<!-- Inner glow on hover using theme accent -->
	<div
		class="bg-radial-gradient(from-[var(--accent-color)]/15 absolute inset-0 rounded-2xl to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
	></div>

	<!-- Card content -->
	<div
		class="relative flex h-full w-full {variant === 'grid'
			? 'flex-col items-center justify-center gap-2 p-3 text-center'
			: 'flex-row items-center justify-between gap-3 p-3'}"
	>
		<!-- Icon container -->
		{#if Icon}
			<div
				class="relative rounded-xl bg-[color-mix(in_srgb,var(--color-bg-overlay)_50%,transparent)] p-3 transition-transform duration-300 group-hover:scale-110 {variant ===
				'grid'
					? 'p-3'
					: 'p-2.5'}"
			>
				<!-- Icon glow using theme accent -->
				<div
					class="absolute inset-0 rounded-xl bg-[var(--accent-color)]/20 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
				></div>
				<Icon
					class="relative z-10 {variant === 'grid' ? 'size-6' : 'size-5'} {active
						? 'text-[var(--accent-color)]'
						: 'text-[var(--color-text-secondary)] transition-colors group-hover:text-[var(--accent-color)]'}"
				/>
			</div>
		{/if}

		<!-- Text content -->
		<div class="w-full min-w-0 flex-1 {variant === 'grid' ? 'text-center' : ''}">
			<div
				class="flex items-center gap-2 {variant === 'grid' ? 'flex-col' : 'flex-row'} {variant ===
				'grid'
					? 'text-center'
					: ''}"
			>
				<span
					class="font-bold text-[var(--color-text-primary)] transition-colors {variant === 'grid'
						? 'text-base tracking-wide'
						: 'text-sm'}"
				>
					{title}
				</span>
				{#if sourceBook}
					<Badge variant="outline" class="shrink-0 text-[10px] tracking-wider uppercase">
						{sourceBook}
					</Badge>
				{/if}
			</div>
			{#if subtitle}
				<div
					class="text-xs text-[var(--color-text-muted)] transition-colors {active
						? ''
						: 'group-hover:text-[var(--color-text-secondary)]'} {variant === 'grid'
						? 'mt-1 text-center'
						: ''}"
				>
					{subtitle}
				</div>
			{/if}
		</div>
	</div>

	<!-- Active state glow ring using theme accent -->
	{#if active}
		<div
			class="absolute inset-0 rounded-2xl ring-1 ring-[var(--accent-color)]/30"
			style="box-shadow: 0 0 20px color-mix(in srgb, var(--accent-color) 25%, transparent)"
		></div>
	{/if}

	<!-- Hover lift shadow using theme accent -->
	<div
		class="absolute inset-0 -z-10 rounded-2xl bg-[var(--color-bg-card)] opacity-0 transition-all duration-300 group-hover:translate-y-[-4px] group-hover:opacity-100"
		style="box-shadow: 0 8px 32px color-mix(in srgb, var(--accent-color) 15%, transparent)"
	></div>
</button>
