<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { getSourceBadgeClass, getSourceLabel } from '$lib/core/utils/sourceBadge';
	import Badge from '$lib/components/ui/Badge.svelte';

	type ItemVariant = 'grid' | 'list';

	interface Props {
		title: string;
		subtitle?: string;
		source?: string;
		active?: boolean;
		icon?: ComponentType;
		accentClass?: string;
		school?: string; // Simplified school name for gem colors
		variant?: ItemVariant;
		onclick?: () => void;
	}

	let {
		title,
		subtitle,
		source,
		active,
		icon: Icon,
		accentClass: _accentClass = 'hover:border-[var(--color-accent)]/50',
		school,
		variant = 'list',
		onclick
	}: Props = $props();

	// Map spell school to gem color CSS variable via theme
	const schoolGemColor: Record<string, string> = {
		evocation: 'var(--color-gem-ruby)',
		abjuration: 'var(--color-gem-sapphire)',
		necromancy: 'var(--color-gem-emerald)',
		illusion: 'var(--color-gem-amethyst)',
		divination: 'var(--color-gem-topaz)',
		Enchantment: 'var(--color-gem-amethyst)',
		Conjuration: 'var(--color-gem-emerald)',
		Transmutation: 'var(--color-gem-topaz)'
	};

	const accentColor = $derived(school ? schoolGemColor[school] : 'var(--color-accent)');
	const sourceBadgeClass = $derived(source ? getSourceBadgeClass(source) : '');
</script>

<button
	data-testid="compendium-item"
	class="group relative w-full overflow-hidden transition-all duration-300 {variant === 'grid'
		? 'h-full rounded-2xl'
		: 'mb-2 rounded-xl'}"
	{onclick}
	style="--accent-color: {accentColor}"
>
	<!-- Card Base - glass-morphic background -->
	<div
		class="absolute inset-0 rounded-xl border border-[var(--color-border)]/60 bg-[color-mix(in_srgb,var(--color-bg-card)_85%,var(--color-bg-overlay))] backdrop-blur-sm transition-all duration-300 {active
			? 'border-[var(--accent-color)]/40 bg-[color-mix(in_srgb,var(--accent-color)]/10%,var(--color-bg-card))]'
			: 'group-hover:border-[var(--color-border)] group-hover:bg-[color-mix(in_srgb,var(--color-bg-card)_90%,var(--color-bg-overlay))]'}"
	></div>

	<!-- Gem accent border (left side) -->
	<div
		class="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-linear-to-b from-[var(--accent-color)] to-[color-mix(in_srgb,var(--accent-color),transparent_50%)] opacity-0 transition-opacity duration-300 {active
			? 'opacity-100'
			: 'group-hover:opacity-100'}"
	></div>

	<!-- Inner glow on hover -->
	<div
		class="bg-radial-gradient(from-[var(--accent-color)]/10 absolute inset-0 rounded-xl to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
	></div>

	<!-- Card content -->
	<div
		class="relative flex h-full w-full items-center justify-between gap-3 {variant === 'grid'
			? 'flex-col items-center justify-center gap-2 p-3 text-center'
			: 'flex-row p-3'}"
	>
		<!-- Icon container -->
		{#if Icon}
			<div
				class="relative rounded-lg bg-[color-mix(in_srgb,var(--color-bg-overlay)_50%,transparent)] p-2 transition-transform duration-300 group-hover:scale-105 {variant ===
				'grid'
					? 'p-3'
					: 'p-2'}"
			>
				<!-- Icon glow -->
				<div
					class="absolute inset-0 rounded-lg bg-[var(--accent-color)]/15 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
				></div>
				<Icon
					class="relative z-10 {variant === 'grid' ? 'size-6' : 'size-5'} {active
						? 'text-[var(--accent-color)]'
						: 'text-[var(--color-text-secondary)] transition-colors group-hover:text-[var(--accent-color)]'}"
				/>
			</div>
		{/if}

		<!-- Text content -->
		<div class="w-full min-w-0 flex-1">
			<div class="flex items-center gap-2 {variant === 'grid' ? 'flex-col' : ''}">
				<span
					class="font-bold text-[var(--color-text-primary)] transition-colors {variant === 'grid'
						? 'text-base tracking-wide'
						: 'text-sm'}"
				>
					{title}
				</span>
				{#if source}
					<Badge color={sourceBadgeClass} class="shrink-0 text-[10px] tracking-wider uppercase">
						{getSourceLabel(source)}
					</Badge>
				{/if}
			</div>
			{#if subtitle}
				<div
					class="text-xs text-[var(--color-text-muted)] transition-colors {active
						? ''
						: 'group-hover:text-[var(--color-text-secondary)]'} {variant === 'grid' ? 'mt-1' : ''}"
				>
					{subtitle}
				</div>
			{/if}
		</div>
	</div>

	<!-- Active state glow ring -->
	{#if active}
		<div
			class="absolute inset-0 rounded-xl ring-1 ring-[var(--accent-color)]/25"
			style="box-shadow: 0 0 15px color-mix(in srgb, var(--accent-color) 20%, transparent)"
		></div>
	{/if}

	<!-- Hover lift shadow -->
	<div
		class="absolute inset-0 -z-10 rounded-xl bg-[var(--color-bg-card)] opacity-0 transition-all duration-300 group-hover:translate-y-[-2px] group-hover:opacity-100"
		style="box-shadow: 0 6px 24px color-mix(in srgb, var(--accent-color) 12%, transparent)"
	></div>
</button>
