<script lang="ts">
	import { Pagination as PaginationPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import { type Props, buttonVariants } from '$lib/components/ui/button/index.js';

	let {
		ref = $bindable(null),
		class: className,
		size = 'icon',
		isActive,
		page,
		children,
		...restProps
	}: PaginationPrimitive.PageProps &
		Props & {
			isActive: boolean;
		} = $props();
</script>

{#snippet Fallback()}
	{page.value}
{/snippet}

<PaginationPrimitive.Page
	bind:ref
	{page}
	aria-current={isActive ? 'page' : undefined}
	data-slot="pagination-link"
	data-active={isActive}
	class={cn(
		buttonVariants({
			variant: isActive ? 'default' : 'outline',
			size
		}),
		// Arcane Aero styling for active pagination link
		isActive
			? 'bg-[var(--color-accent)] text-white shadow-[0_0_15px_var(--color-accent-glow,rgba(139,92,246,0.4))] ring-1 ring-white/20'
			: 'bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-overlay)]',
		className
	)}
	children={children || Fallback}
	{...restProps}
/>
