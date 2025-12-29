<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		href?: string;
		class?: string;
		padding?: string;
		children?: Snippet;
	};

	const props = $props();
	const { href, class: className = '', padding = 'p-0', children, ...rest } = props satisfies Props;

	const tag: 'a' | 'div' = href ? 'a' : 'div';
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
