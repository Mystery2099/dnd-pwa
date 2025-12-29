<script lang="ts">
	import { Bookmark, X } from 'lucide-svelte';
	import { type Snippet } from 'svelte';
	import { getSourceBadgeClass } from '$lib/utils/sourceBadge';

	interface Props {
		title: string;
		titleId?: string;
		type: string; // "Spell", "Monster", etc.
		tags?: string[]; // "Evocation", "Level 3"
		source?: string; // "open5e", "homebrew", "srd"
		onClose?: () => void;
		onBookmark?: () => void;
		bookmarked?: boolean;
		accentColor?: string; // e.g. "text-rose-400"
		animate?: boolean;
		children: Snippet;
	}

	let {
		title,
		titleId,
		type,
		tags = [],
		source,
		onClose,
		onBookmark,
		bookmarked,
		accentColor = 'text-purple-400',
		animate = true,
		children
	}: Props = $props();

	// Unified "Arcane Glass" style:
	// - Roundness & 3D: rounded-2xl, card-crystal (shadows/borders)
	// - Transparency: bg-gray-900/60, backdrop-blur-xl
	let containerClass = $derived(
		`card-crystal ${animate ? 'animate-enter' : ''} h-full flex flex-col relative overflow-hidden bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl transition-all duration-300`
	);
</script>

<div class={containerClass}>
	<!-- Header -->
	<div class="flex shrink-0 items-start justify-between border-b border-white/10 bg-white/5 p-6">
		<div>
			<h2 id={titleId} class="text-2xl font-bold tracking-tight text-white">{title}</h2>
			<div class="mt-2 flex flex-wrap items-center gap-2">
				<span class={`text-xs font-bold tracking-wider uppercase ${accentColor}`}>{type}</span>
				{#if tags.length > 0}
					<span class="text-white/20">•</span>
					{#each tags as tag (tag)}
						<span class="text-xs font-medium text-gray-400">{tag}</span>
					{/each}
				{/if}
				{#if source}
					<span class="text-white/20">•</span>
					<span
						class={`rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase ${getSourceBadgeClass(source)}`}
					>
						{source.charAt(0).toUpperCase() + source.slice(1)}
					</span>
				{/if}
			</div>
		</div>

		<div class="flex items-center gap-2">
			{#if onBookmark}
				<button
					onclick={onBookmark}
					class="rounded-full p-2 transition-colors {bookmarked
						? 'bg-white/10 text-yellow-400'
						: 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}"
					aria-label="Bookmark"
				>
					<Bookmark class="h-5 w-5" />
				</button>
			{/if}
			<button
				data-testid="close-detail"
				onclick={onClose}
				class="rounded-full bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
				aria-label="Close"
			>
				<X class="h-5 w-5" />
			</button>
		</div>
	</div>

	<!-- Scrollable Content -->
	<div class="glass-scroll flex-1 overflow-y-auto p-6">
		<div
			class="prose max-w-none prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white"
		>
			{@render children()}
		</div>
	</div>
</div>
