<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		variant?: 'glass' | 'solid' | 'outline';
		color?: string; // Custom color classes (e.g. 'text-rose-400 border-rose-500/60')
		class?: string;
		children?: Snippet;
	};

	let {
		variant = 'glass',
		color = '',
		class: className = '',
		children
	}: Props = $props();

	const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all';
	
	const variantClasses = {
		glass: 'bg-white/10 text-white border border-white/10 backdrop-blur-sm',
		solid: 'bg-white/20 text-white font-bold shadow-sm',
		outline: 'border border-white/20 text-gray-300'
	};

	const combinedClasses = $derived(`${baseClasses} ${variantClasses[variant]} ${color} ${className}`.trim());
</script>

<span class={combinedClasses}>
	{#if children}
		{@render children()}
	{/if}
</span>
