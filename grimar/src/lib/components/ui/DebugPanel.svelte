<script lang="ts">
	interface Props {
		listName: string;
		startIndex: number;
		endIndex: number;
		totalItems: number;
		scrollTop: number;
		columns?: number;
	}

	let { listName = '', startIndex, endIndex, totalItems, scrollTop, columns }: Props = $props();
</script>

{#if import.meta.env.DEV}
	<div
		class="pointer-events-none fixed right-4 bottom-4 z-50 rounded-lg border border-[var(--color-accent)]/30 bg-black/80 px-3 py-2 font-mono text-xs text-[var(--color-accent)] shadow-lg backdrop-blur-md"
	>
		<div class="flex items-baseline gap-1">
			<span class="text-[var(--color-text-muted)]">{listName}:</span>
		</div>
		<div>Range: {startIndex}-{endIndex}/{totalItems}</div>
		{#if columns !== undefined}
			<div>Cols: {columns}</div>
		{/if}
		<div>Scroll: {Math.round(scrollTop)}px</div>
	</div>
{/if}
