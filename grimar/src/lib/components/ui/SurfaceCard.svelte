<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		href?: string;
		class?: string;
		padding?: string;
		children?: Snippet;
	}

	let { href = '', class: className = '', padding = 'p-0', children, ...rest }: Props = $props();

	const tag = $derived<'a' | 'div'>(href ? 'a' : 'div');
</script>

<svelte:element
	this={tag}
	{href}
	class={`card-crystal relative overflow-hidden transition-all duration-300 ${padding} ${className}`.trim()}
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</svelte:element>
