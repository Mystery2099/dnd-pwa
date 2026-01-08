<script lang="ts">
	import { Check } from 'lucide-svelte';
	import { RadioGroup } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	interface Option {
		value: string;
		label: string;
		description?: string;
	}

	type Props = {
		value?: string;
		options: readonly Option[];
		class?: string;
		size?: 'sm' | 'md' | 'lg';
	};

	let {
		value = $bindable<string>(),
		options,
		class: className = '',
		size = 'md'
	}: Props = $props();

	const sizeClasses = {
		sm: 'text-xs gap-1 px-2 py-1',
		md: 'text-sm gap-1.5 px-3 py-2',
		lg: 'text-base gap-2 px-4 py-2.5'
	};

	const iconSizes = {
		sm: '12px',
		md: '14px',
		lg: '16px'
	};
</script>

<div class={className}>
	<RadioGroup.Root
		bind:value
		class="inline-flex items-center rounded-xl border border-white/10 bg-[var(--color-bg-card)] p-1 shadow-inner"
	>
		{#each options as option (option.value)}
			{@const isSelected = value === option.value}
			<RadioGroup.Item
				value={option.value}
				class="inline-flex items-center justify-center rounded-lg transition-all duration-200 {sizeClasses[
					size
				]}"
				class:bg-[var(--color-accent)]={isSelected}
				class:text-white={isSelected}
				class:shadow-md={isSelected}
				class:shadow-[var(--color-accent-glow)]={isSelected}
				class:text-[var(--color-text-secondary)]={!isSelected}
				class:hover:bg-[var(--color-bg-surface)]={!isSelected}
			>
				{#snippet children({ checked })}
					{#if checked}
						<Check class="shrink-0" style="width: {iconSizes[size]}; height: {iconSizes[size]}" />
					{/if}
					<span class="font-medium whitespace-nowrap">{option.label}</span>
				{/snippet}
			</RadioGroup.Item>
		{/each}
	</RadioGroup.Root>
</div>
