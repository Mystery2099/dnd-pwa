<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { setSheetContext } from './context.js';

	let {
		open = $bindable(false),
		children,
		onOpenChange,
		...restProps
	}: DialogPrimitive.RootProps & { children?: Snippet } = $props();

	setSheetContext({
		close: () => {
			if (!open) return;
			open = false;
			onOpenChange?.(false);
		}
	});
</script>

<DialogPrimitive.Root bind:open {onOpenChange} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</DialogPrimitive.Root>
