<script lang="ts">
	import { Pagination as PaginationPrimitive } from 'bits-ui';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: PaginationPrimitive.NextButtonProps = $props();
</script>

{#snippet Fallback()}
	<span>Next</span>
	<ChevronRightIcon class="size-4" />
{/snippet}

<PaginationPrimitive.NextButton
	bind:ref
	aria-label="Go to next page"
	class={cn(
		buttonVariants({
			size: 'sm',
			variant: 'outline',
			class: 'gap-1.5 px-3'
		}),
		// Arcane Aero styling
		'bg-[var(--color-bg-card)] transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white',
		className
	)}
	children={children || Fallback}
	{...restProps}
/>
