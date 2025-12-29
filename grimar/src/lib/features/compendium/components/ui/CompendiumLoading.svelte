<script lang="ts">
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';

	interface Props {
		message?: string;
		subtext?: string;
		accentColor?: string; // e.g. "border-t-[var(--color-accent)]"
	}

	let {
		message = 'Loading...',
		subtext = 'Fetching data',
		accentColor = 'border-t-[var(--color-accent)]'
	}: Props = $props();
</script>

<div
	class="absolute inset-0 z-30 flex items-center justify-center bg-[var(--color-bg-overlay)] backdrop-blur-sm"
>
	<SurfaceCard
		class="flex flex-col items-center gap-3 border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 text-[var(--color-text-primary)] shadow-xl"
	>
		<div
			class={`h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] ${accentColor}`}
		></div>
		<div class="text-sm font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase">
			{message}
		</div>
		<div class="text-xs text-[var(--color-text-muted)]">{subtext}</div>
	</SurfaceCard>
</div>
