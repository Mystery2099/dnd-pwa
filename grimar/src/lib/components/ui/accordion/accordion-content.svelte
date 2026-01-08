<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import type { Snippet } from 'svelte';

	type Props = {
		class?: string;
		children?: Snippet;
	};

	let { class: className = '', children }: Props = $props();
</script>

<AccordionPrimitive.Content
	class={cn('overflow-hidden text-sm transition-all duration-200', className)}
>
	<div class="pt-0 pb-4 text-[var(--color-text-secondary)]">
		{@render children()}
	</div>
</AccordionPrimitive.Content>
