<script lang="ts">
	import { ChevronRight } from 'lucide-svelte';

	export interface BreadcrumbItem {
		label: string;
		href?: string;
	}

	interface Props {
		items: BreadcrumbItem[];
		class?: string;
	}

	let { items, class: className = '' }: Props = $props();
	let lastIndex = $derived(Math.max(0, items.length - 1));
</script>

<nav aria-label="Breadcrumb" class={className}>
	<ol class="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-muted)]">
		{#each items as item, index (item.href ?? `${item.label}-${index}`)}
			<li class="inline-flex items-center gap-2">
				{#if item.href && index !== lastIndex}
					<a href={item.href} class="transition-colors hover:text-accent">{item.label}</a>
				{:else}
					<span aria-current={index === lastIndex ? 'page' : undefined} class="text-[var(--color-text-secondary)]">
						{item.label}
					</span>
				{/if}
				{#if index < lastIndex}
					<ChevronRight class="h-4 w-4 opacity-60" />
				{/if}
			</li>
		{/each}
	</ol>
</nav>
