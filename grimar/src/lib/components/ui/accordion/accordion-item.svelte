<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import type { Snippet } from 'svelte';

	type Props = {
		value: string;
		class?: string;
		children?: Snippet;
	};

	let { value, class: className = '', children }: Props = $props();
</script>

<AccordionPrimitive.Item {value} class={cn('border-b border-[var(--color-border)]', className)}>
	{@render children()}
</AccordionPrimitive.Item>
