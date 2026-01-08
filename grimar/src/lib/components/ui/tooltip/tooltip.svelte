<script lang="ts">
	import { Tooltip as TooltipPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import type { Snippet } from 'svelte';

	type Props = {
		delayDuration?: number;
		class?: string;
		children?: Snippet;
		content?: Snippet;
	};

	let { delayDuration = 200, class: className = '', children, content }: Props = $props();
</script>

<TooltipPrimitive.Root {delayDuration}>
	<TooltipPrimitive.Trigger class="contents">
		{@render children?.()}
	</TooltipPrimitive.Trigger>

	<TooltipPrimitive.Portal>
		<TooltipPrimitive.Content
			class={cn(
				'z-50 w-max max-w-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm shadow-lg',
				'text-[var(--color-text-primary)]',
				'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
				className
			)}
			sideOffset={4}
		>
			{@render content?.()}
		</TooltipPrimitive.Content>
	</TooltipPrimitive.Portal>
</TooltipPrimitive.Root>
