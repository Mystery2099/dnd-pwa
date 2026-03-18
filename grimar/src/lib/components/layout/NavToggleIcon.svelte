<script lang="ts">
	type Props = {
		collapsed: boolean;
		class?: string;
	};

	let { collapsed, class: className = '' }: Props = $props();
</script>

<svg
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.8"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={`overflow-visible transition-transform duration-300 ease-[var(--ease-smooth)] ${className}`.trim()}
	aria-hidden="true"
>
	<rect x="4" y="5" width="16" height="14" rx="2" opacity="0.28" />
	<path d="M9 5v14" opacity="0.55" />

	{#if collapsed}
		<path d="M12.5 12h4.5" />
		<path d="M14.8 9.7L17.1 12l-2.3 2.3" />
	{:else}
		<path d="M17 12h-4.5" />
		<path d="M14.7 9.7L12.4 12l2.3 2.3" />
	{/if}
</svg>
