<script lang="ts">
	import { ChevronLeft, ChevronRight, List } from 'lucide-svelte';
	import Button from '$lib/components/ui/Button.svelte';

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
			<Button href={prevUrl} variant="gem" size="sm" title="Previous spell (Left Arrow)">
				<ChevronLeft class="size-4" />
				<span class="hidden sm:inline">Previous</span>
			</Button>
		{/if}
	</div>

	<Button href={listUrl} variant="gem" size="sm" title="Back to list (Escape)">
		<List class="size-4" />
		<span class="hidden sm:inline">All Spells</span>
	</Button>

	<div class="flex items-center gap-2">
		{#if nextUrl}
			<Button href={nextUrl} variant="gem" size="sm" title="Next spell (Right Arrow)">
				<span class="hidden sm:inline">Next</span>
				<ChevronRight class="size-4" />
			</Button>
		{/if}
	</div>
</nav>
