<script lang="ts">
	import { ChevronLeft, ChevronRight, List } from 'lucide-svelte';

	interface Props {
		prevUrl: string | null;
		nextUrl: string | null;
		listUrl: string;
	}

	let { prevUrl, nextUrl, listUrl }: Props = $props();
</script>

<nav class="mb-4 flex items-center justify-between gap-2">
	<div class="flex items-center gap-2">
		{#if prevUrl}
			<a
				href={prevUrl}
				class="btn-gem flex items-center gap-2 px-4 py-2 text-sm"
				title="Previous spell (Left Arrow)"
			>
				<ChevronLeft class="size-4" />
				<span class="hidden sm:inline">Previous</span>
			</a>
		{/if}
	</div>

	<a
		href={listUrl}
		class="btn-gem flex items-center gap-2 px-4 py-2 text-sm"
		title="Back to list (Escape)"
	>
		<List class="size-4" />
		<span class="hidden sm:inline">All Spells</span>
	</a>

	<div class="flex items-center gap-2">
		{#if nextUrl}
			<a
				href={nextUrl}
				class="btn-gem flex items-center gap-2 px-4 py-2 text-sm"
				title="Next spell (Right Arrow)"
			>
				<span class="hidden sm:inline">Next</span>
				<ChevronRight class="size-4" />
			</a>
		{/if}
	</div>
</nav>
