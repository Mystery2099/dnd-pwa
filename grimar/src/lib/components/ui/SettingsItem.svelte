<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		label: string;
		description?: string;
		control: Snippet;
		divider?: boolean;
		class?: string;
	};

	let { label, description, control, divider = true, class: className = '' }: Props = $props();
	const rowClass =
		'relative flex w-full items-start justify-between gap-5 rounded-[1.15rem] bg-[color-mix(in_srgb,var(--color-bg-overlay)_46%,transparent)] px-4 py-5 transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--color-bg-overlay)_70%,transparent)] max-sm:flex-col max-sm:items-stretch max-sm:gap-3';
	const dividerClass =
		'before:pointer-events-none before:absolute before:bottom-0 before:left-1/2 before:h-0.75 before:w-1 before:-translate-x-1/2 before:translate-y-1/2 before:rounded-sm before:bg-[var(--color-accent)] before:opacity-50 after:pointer-events-none after:absolute after:right-4 after:bottom-0 after:left-4 after:h-px after:bg-[linear-gradient(90deg,transparent,var(--color-border),transparent)]';
</script>

<div class={`${rowClass} ${divider ? dividerClass : ''} ${className}`.trim()}>
	<div class="min-w-0 flex-1">
		<span
			class="block overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap text-[var(--color-text-primary)]"
		>
			{label}
		</span>
		{#if description}
			<span class="mt-1 block text-xs leading-5 text-[var(--color-text-secondary)]">
				{description}
			</span>
		{/if}
	</div>

	<div
		class="min-w-0 shrink-0 overflow-hidden max-sm:max-w-full"
		style="max-width: min(100%, 34rem);"
	>
		{@render control()}
	</div>
</div>
