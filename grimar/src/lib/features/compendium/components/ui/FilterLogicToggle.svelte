<script lang="ts">
	interface Props {
		logic: 'and' | 'or';
		onToggle: () => void;
	}

	let { logic, onToggle }: Props = $props();
</script>

<div class="px-4 py-2">
	<button
		onclick={onToggle}
		class="group flex w-full items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-xs font-bold tracking-wider text-[var(--color-text-muted)] uppercase transition-all hover:from-[color-mix(in_srgb,var(--color-text-primary)_15%,transparent)] hover:to-[color-mix(in_srgb,var(--color-text-primary)_8%,transparent)]"
	>
		<span class="transition-colors group-hover:text-[var(--color-text-secondary)]"
			>Filter Logic</span
		>
		<span class={logic === 'and' ? 'text-[var(--color-accent)]' : 'text-cyan-400'}>
			{logic.toUpperCase()}
		</span>
	</button>
</div>
