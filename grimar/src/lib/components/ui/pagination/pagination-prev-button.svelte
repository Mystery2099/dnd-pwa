<script lang="ts">
	import { Pagination as PaginationPrimitive } from 'bits-ui';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: PaginationPrimitive.PrevButtonProps = $props();
</script>

{#snippet Fallback()}
	<ChevronLeftIcon class="size-4" />
	<span>Previous</span>
{/snippet}

<PaginationPrimitive.PrevButton
	bind:ref
	aria-label="Go to previous page"
	class={cn(
		buttonVariants({
			size: 'sm',
			variant: 'outline',
			class: 'gap-1.5 px-3'
		}),
		// Arcane Aero styling
		'bg-[var(--color-bg-card)] transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-text-inverted)]',
		className
	)}
	children={children || Fallback}
	{...restProps}
/>
