<script lang="ts">
	import { Bookmark, X } from 'lucide-svelte';
	import { type Snippet } from 'svelte';
	import { getSourceBadgeClass } from '$lib/core/utils/sourceBadge';
	import Badge from '$lib/components/ui/Badge.svelte';

	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';

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
		`${animate ? 'animate-enter' : ''} h-full flex flex-col relative bg-[var(--color-bg-overlay)] backdrop-blur-xl rounded-2xl border border-[var(--color-border)] shadow-2xl transition-all duration-300`
	);
</script>

<SurfaceCard class={containerClass}>
	<!-- Header -->
	<div
		class="flex shrink-0 items-start justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-card)] p-6"
	>
		<div>
			<h2 id={titleId} class="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
				{title}
			</h2>
			<div class="mt-2 flex flex-wrap items-center gap-2">
				<Badge color={accentColor} variant="outline">{type}</Badge>
				{#if tags.length > 0}
					{#each tags as tag (tag)}
						<Badge variant="outline">{tag}</Badge>
					{/each}
				{/if}
				{#if source}
					<Badge color={getSourceBadgeClass(source)}>
						{source.charAt(0).toUpperCase() + source.slice(1)}
					</Badge>
				{/if}
			</div>
		</div>

		<div class="flex items-center gap-2">
			{#if onBookmark}
				<button
					onclick={onBookmark}
					class="rounded-full p-2 transition-colors {bookmarked
						? 'bg-[var(--color-bg-card)] text-[var(--color-accent)]'
						: 'bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)]'}"
					aria-label="Bookmark"
				>
					<Bookmark class="h-5 w-5" />
				</button>
			{/if}
			<button
				data-testid="close-detail"
				onclick={onClose}
				class="rounded-full bg-[var(--color-bg-card)] p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)]"
				aria-label="Close"
			>
				<X class="h-5 w-5" />
			</button>
		</div>
	</div>

	<!-- Scrollable Content -->
	<div class="glass-scroll flex-1 overflow-y-auto p-6">
		<div
			class="prose max-w-none prose-invert prose-headings:text-[var(--color-text-primary)] prose-p:text-[var(--color-text-secondary)] prose-a:text-[var(--color-accent)] prose-a:no-underline hover:prose-a:underline prose-strong:text-[var(--color-text-primary)]"
		>
			{@render children()}
		</div>
	</div>
</SurfaceCard>
