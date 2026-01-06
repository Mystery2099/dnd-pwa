<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLUListElement>> = $props();
</script>

<ul
	bind:this={ref}
	data-slot="pagination-content"
	class={cn(
		'flex flex-row items-center gap-1 rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-bg-card)]/50 p-2 backdrop-blur-sm',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</ul>
