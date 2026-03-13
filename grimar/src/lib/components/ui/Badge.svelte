<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		variant?: 'glass' | 'solid' | 'outline';
		color?: string; // Custom color classes (e.g. 'text-rose-400 border-rose-500/60')
		class?: string;
		children?: Snippet;
	};

	let { variant = 'glass', color = '', class: className = '', children }: Props = $props();

	const baseClasses =
		'inline-flex items-center min-w-0 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase transition-all';

	const variantClasses = {
		glass:
			'border border-[color-mix(in_srgb,var(--color-border-hover)_72%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-bg-overlay)_42%,var(--color-bg-card))] text-[color-mix(in_srgb,var(--color-text-primary)_94%,var(--color-text-secondary))] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent)] backdrop-blur-sm',
		solid:
			'border border-[color-mix(in_srgb,var(--color-border-hover)_78%,var(--color-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-overlay)_72%,var(--color-bg-card)),color-mix(in_srgb,var(--color-bg-card)_96%,var(--color-bg-canvas)))] text-[var(--color-text-primary)] shadow-[0_0.4rem_1rem_color-mix(in_srgb,var(--color-shadow)_16%,transparent),inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_12%,transparent)]',
		outline:
			'border border-[color-mix(in_srgb,var(--color-border-hover)_76%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-bg-overlay)_34%,transparent)] text-[color-mix(in_srgb,var(--color-text-primary)_90%,var(--color-text-secondary))] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_8%,transparent)]'
	};

	const combinedClasses = $derived(
		`${baseClasses} ${variantClasses[variant]} ${color} ${className}`.trim()
	);
</script>

<span class={combinedClasses}>
	{#if children}
		{@render children()}
	{/if}
</span>
