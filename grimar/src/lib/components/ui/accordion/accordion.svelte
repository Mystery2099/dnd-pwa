<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import type { Snippet } from 'svelte';

	type Props = {
		type?: 'single' | 'multiple';
		value?: string | string[];
		onValueChange?: (value: string | string[]) => void;
		class?: string;
		collapsible?: boolean;
		children?: Snippet;
	};

	let {
		type = 'single',
		value = $bindable<string | string[]>(type === 'single' ? '' : []),
		onValueChange,
		class: className = '',
		collapsible = true,
		children
	}: Props = $props();
</script>

<AccordionPrimitive.Root
	{type}
	{value}
	{collapsible}
	class={cn('w-full', className)}
	onValueChange={(newValue) => {
		value = newValue;
		onValueChange?.(newValue);
	}}
>
	{@render children()}
</AccordionPrimitive.Root>
