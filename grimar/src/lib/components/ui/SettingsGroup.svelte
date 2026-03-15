<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ComponentType } from 'svelte';

	type Props = {
		title: string;
		description?: string;
		icon?: ComponentType;
		children: Snippet;
		id?: string;
		class?: string;
		index?: number;
		accentColor?: string; // Section-specific accent color (gem color)
	};

	let {
		title,
		description,
		icon,
		children,
		id,
		class: className = '',
		index = 0,
		accentColor = 'var(--color-accent)'
	}: Props = $props();

	// Calculate animation delay based on index
	let animationDelay = $derived(`${index * 0.1}s`);

	// Generate accent border style
	let accentBorderStyle = $derived(`--accent-color: ${accentColor}`);
	const rootClass =
		'relative animate-arcane-materialize overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-card)_80%,transparent)] opacity-0 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_15%,transparent),0_4px_24px_color-mix(in_srgb,black_40%,transparent),0_0_0_1px_var(--color-border)] backdrop-blur-[16px] before:absolute before:top-0 before:right-0 before:left-0 before:h-0.5 before:bg-[linear-gradient(90deg,var(--accent-color,var(--color-accent)),transparent)] before:opacity-80 after:absolute after:top-2 after:right-2 after:h-3 after:w-3 after:rounded-tr-md after:border-t-2 after:border-r-2 after:border-t-[color-mix(in_srgb,var(--accent-color,var(--color-accent))_50%,transparent)] after:border-r-[color-mix(in_srgb,var(--accent-color,var(--color-accent))_50%,transparent)]';
</script>

<div
	class={`${rootClass} ${className}`.trim()}
	style="animation-delay: {animationDelay}; {accentBorderStyle}"
	{id}
>
	<div class="flex items-start gap-4 px-6 pt-6">
		{#if icon}
			{@const Icon = icon}
			<div
				class="flex h-12 w-12 items-center justify-center rounded-lg border bg-[color-mix(in_srgb,currentColor_15%,transparent)] shadow-[0_0_12px_color-mix(in_srgb,currentColor_20%,transparent),inset_0_1px_0_color-mix(in_srgb,currentColor_20%,transparent)]"
				style="color: {accentColor}; border-color: color-mix(in srgb, currentColor 30%, transparent)"
			>
				<Icon class="size-5" />
			</div>
		{/if}
		<div class="flex-1">
			<h2
				class="text-[0.82rem] font-semibold tracking-[0.24em] text-[var(--color-text-primary)] uppercase"
			>
				{title}
			</h2>
			{#if description}
				<p class="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
					{description}
				</p>
			{/if}
		</div>
	</div>

	<div class="px-6 pt-4 pb-6">
		<div class="w-full divide-y divide-white/5">
			{@render children()}
		</div>
	</div>
</div>
