<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		href?: string;
		class?: string;
		padding?: string;
		children?: Snippet;
		onclick?: (event: MouseEvent) => void;
		onmouseenter?: (event: MouseEvent) => void;
		onfocusin?: (event: FocusEvent) => void;
	}

	let {
		href = '',
		class: className = '',
		padding = 'p-0',
		children,
		onclick,
		onmouseenter,
		onfocusin,
		...rest
	}: Props = $props();

	const tag = $derived<'a' | 'div'>(href ? 'a' : 'div');
</script>

<svelte:element
	this={tag}
	{href}
	{onclick}
	{onmouseenter}
	{onfocusin}
	class={`card-crystal relative block overflow-hidden ${padding} ${className}`.trim()}
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</svelte:element>
