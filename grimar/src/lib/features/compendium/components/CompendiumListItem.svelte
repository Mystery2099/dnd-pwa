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
		accentClass = 'hover:border-purple-500/50',
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
						? 'border-purple-500/50 bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
						: 'border-white/5 bg-gray-800/40 hover:scale-[1.01] hover:bg-gray-800/80 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] ' +
							accentClass
				}
    `}
	{onclick}
>
	<div class="flex items-center gap-3">
		{#if Icon}
			<div
				class={`rounded-lg bg-black/20 p-1.5 ${active ? 'text-white' : 'text-gray-400 transition-colors group-hover:text-white'}`}
			>
				<Icon class="size-4" />
			</div>
		{/if}
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-2">
				<span
					class={`truncate text-sm font-bold ${active ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}
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
				<div class="text-xs text-gray-500 group-hover:text-gray-400">{subtitle}</div>
			{/if}
		</div>
	</div>
</button>
