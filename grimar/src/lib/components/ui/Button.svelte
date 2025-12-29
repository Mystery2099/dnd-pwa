<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		type?: 'button' | 'submit' | 'reset';
		variant?: 'gem' | 'ghost' | 'outline' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		href?: string;
		class?: string;
		title?: string;
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
	};

	let {
		type = 'button',
		variant = 'gem',
		size = 'md',
		href,
		class: className = '',
		title,
		disabled = false,
		onclick,
		children,
		...rest
	}: Props = $props();

	const baseClasses =
		'inline-flex items-center justify-center gap-2 font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

	const variantClasses = {
		gem: 'btn-gem',
		ghost: 'hover:bg-[var(--color-bg-card)] text-[var(--color-text-secondary)]',
		outline: 'btn-3d hover:bg-[var(--color-bg-card)] text-[var(--color-text-secondary)]',
		danger: 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30',
		panel: 'btn-3d'
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
	<a {href} class={combinedClasses} {...rest}>
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
