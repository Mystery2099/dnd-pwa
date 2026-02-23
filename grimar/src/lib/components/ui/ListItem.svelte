<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ComponentType } from 'svelte';

	type Props = {
		href?: string;
		icon?: ComponentType;
		iconClass?: string;
		title: string;
		description?: string;
		badge?: string | number;
		badgeVariant?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
		arrow?: boolean;
		class?: string;
		onclick?: () => void;
		children?: Snippet;
	};

	let {
		href,
		icon: Icon,
		iconClass = '',
		title,
		description,
		badge,
		badgeVariant = 'default',
		arrow = false,
		class: className = '',
		onclick,
		children,
	}: Props = $props();

	const tag = $derived(href ? 'a' : 'button');
	
	const badgeClasses = $derived({
		default: 'bg-[color-mix(in_srgb,black_30%,transparent)] text-[var(--color-text-muted)]',
		accent: 'bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] text-[var(--color-accent)]',
		success: 'bg-emerald-500/20 text-emerald-400',
		warning: 'bg-amber-500/20 text-amber-400',
		danger: 'bg-red-500/20 text-red-400',
	}[badgeVariant]);
</script>

<svelte:element
	this={tag}
	{href}
	onclick={href ? undefined : onclick}
	class="list-item group {className}"
	role={href ? undefined : 'button'}
	tabindex={href ? undefined : 0}
>
	{#if Icon}
		<div class="list-item-icon {iconClass}">
			<Icon class="size-5" />
		</div>
	{/if}
	
	<div class="list-item-content">
		<span class="list-item-title">{title}</span>
		{#if description}
			<span class="list-item-description">{description}</span>
		{/if}
		{#if children}
			{@render children()}
		{/if}
	</div>

	{#if badge !== undefined}
		<div class="list-item-meta">
			<span class="list-item-badge {badgeClasses}">{badge}</span>
		</div>
	{/if}

	{#if arrow}
		<div class="list-item-arrow">
			<svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</div>
	{/if}
</svelte:element>
