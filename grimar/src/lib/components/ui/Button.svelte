<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		href?: string;
		download?: string;
		class?: string;
		title?: string;
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
	};

	let {
		type = 'button',
		variant = 'primary',
		size = 'md',
		href,
		download,
		class: className = '',
		title: _title,
		disabled = false,
		onclick,
		children,
		...rest
	}: Props = $props();

	const baseClasses =
		'inline-flex items-center justify-center gap-2 font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

	const variantClasses = {
		primary: 'btn-gem',
		secondary: 'btn-3d hover:bg-[var(--color-bg-card)] text-[var(--color-text-secondary)]',
		ghost: 'hover:bg-[var(--color-bg-card)] text-[var(--color-text-secondary)]',
		danger: 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
	};

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-xs rounded-lg',
		md: 'px-4 py-2 text-sm rounded-xl',
		lg: 'px-6 py-3 text-base rounded-2xl'
	};

	const combinedClasses = $derived(
		`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()
	);
</script>

{#if href}
	<a {href} {download} class={combinedClasses} {...rest}>
		{#if children}
			{@render children()}
		{/if}
	</a>
{:else}
	<button {type} {disabled} class={combinedClasses} {onclick} {...rest}>
		{#if children}
			{@render children()}
		{/if}
	</button>
{/if}
