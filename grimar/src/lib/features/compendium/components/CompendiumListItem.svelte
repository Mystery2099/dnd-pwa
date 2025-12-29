<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { getSourceBadgeClass } from '$lib/core/utils/sourceBadge';
	import Badge from '$lib/components/ui/Badge.svelte';

	interface Props {
		title: string;
		subtitle?: string; // e.g. "Level 3 Evocation"
		source?: string; // e.g. "open5e", "homebrew", "srd"
		active?: boolean;
		icon?: ComponentType;
		accentClass?: string; // e.g. "hover:border-rose-500/50" (border applied on hover)
		onclick?: () => void;
	}

	let {
		title,
		subtitle,
		source,
		active,
		icon: Icon,
		accentClass = 'hover:border-[var(--color-accent)]/50',
		onclick
	}: Props = $props();

	// Format source name for display
	function formatSourceName(source: string | undefined): string {
		if (!source) return 'Unknown';
		return source.charAt(0).toUpperCase() + source.slice(1).replace(/(\d)/, ' $1');
	}
</script>

<button
	data-testid="compendium-item"
	class={`
        group mb-2 flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all duration-200
        ${
					active
						? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/20 shadow-[var(--color-accent-glow)]'
						: 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:scale-[1.01] hover:bg-[var(--color-bg-card)]/80 hover:shadow-[var(--color-accent-glow)] ' +
							accentClass
				}
    `}
	{onclick}
>
	<div class="flex items-center gap-3">
		{#if Icon}
			<div
				class={`rounded-lg bg-[color-mix(in_srgb,black_20%,transparent)] p-1.5 ${active ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] transition-colors group-hover:text-[var(--color-text-primary)]'}`}
			>
				<Icon class="size-4" />
			</div>
		{/if}
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-2">
				<span
					class={`truncate text-sm font-bold ${active ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-primary)] group-hover:text-[var(--color-text-primary)]'}`}
				>
					{title}
				</span>
				{#if source}
					<Badge color={getSourceBadgeClass(source)} class="shrink-0">
						{formatSourceName(source)}
					</Badge>
				{/if}
			</div>
			{#if subtitle}
				<div
					class="text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]"
				>
					{subtitle}
				</div>
			{/if}
		</div>
	</div>
</button>
