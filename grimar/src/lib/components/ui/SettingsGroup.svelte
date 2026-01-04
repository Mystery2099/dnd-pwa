<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ComponentType } from 'svelte';

	type Props = {
		title: string;
		description?: string;
		icon?: ComponentType;
		children: Snippet;
		id?: string;
		class?: string;
		index?: number;
	};

	let {
		title,
		description,
		icon,
		children,
		id,
		class: className = '',
		index = 0
	}: Props = $props();

	// Calculate animation delay based on index
	let animationDelay = $derived(`${index * 0.1}s`);
</script>

<div class="arcane-panel {className}" style="animation-delay: {animationDelay}" {id}>
	<div class="arcane-panel-header">
		{#if icon}
			{@const Icon = icon}
			<div class="arcane-panel-icon">
				<Icon class="size-5" />
			</div>
		{/if}
		<div class="flex-1">
			<h2 class="arcane-panel-title">{title}</h2>
			{#if description}
				<p class="arcane-panel-description">{description}</p>
			{/if}
		</div>
	</div>

	<div class="arcane-panel-content">
		<div class="divide-y divide-white/5">
			{@render children()}
		</div>
	</div>
</div>
