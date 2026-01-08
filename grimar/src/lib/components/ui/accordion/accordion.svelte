<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import type { Snippet } from 'svelte';

	type Props = {
		value?: string;
		class?: string;
		children?: Snippet;
	};

	let { value = $bindable(''), class: className = '', children }: Props = $props();
</script>

<AccordionPrimitive.Root type="single" bind:value class={cn('w-full', className)}>
	{@render children?.()}
</AccordionPrimitive.Root>
