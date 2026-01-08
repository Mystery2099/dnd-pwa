<script lang="ts">
	import { RadioGroup } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import type { Snippet } from 'svelte';

	interface Option {
		value: string;
		label: string;
		description?: string;
	}

	type Props = {
		name?: string;
		value?: string;
		options: readonly Option[];
		columns?: number;
		onchange?: (value: string) => void;
		label?: string;
		description?: string;
		class?: string;
	};

	let {
		name = '',
		value = $bindable(''),
		options,
		columns = 2,
		onchange,
		label,
		description,
		class: className = ''
	}: Props = $props();

	function handleValueChange(newValue: string) {
		value = newValue;
		onchange?.(newValue);
	}
</script>

<div class={className}>
	{#if label}
		<div class="mb-3">
			<span class="block text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
			{#if description}
				<span class="block text-xs text-[var(--color-text-secondary)]">{description}</span>
			{/if}
		</div>
	{/if}

	<RadioGroup.Root {value} {name} onValueChange={handleValueChange}>
		<div class="grid gap-3" style="grid-template-columns: repeat({columns}, minmax(0, 1fr));">
			{#each options as option (option.value)}
				{@const isSelected = value === option.value}
				<RadioGroup.Item
					value={option.value}
					class={cn(
						'rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3 text-left transition-all',
						'hover:border-[var(--color-accent)]/50',
						isSelected
							? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 ring-1 ring-[var(--color-accent)]'
							: ''
					)}
				>
					{#snippet children()}
						<div class="flex flex-col">
							<span
								class="text-sm font-medium"
								class:text-white={isSelected}
								class:text-[var(--color-text-primary)]={!isSelected}
							>
								{option.label}
							</span>
							{#if option.description}
								<span
									class="text-xs"
									class:text-[var(--color-text-muted)]={isSelected}
									class:text-[var(--color-text-secondary)]={!isSelected}
								>
									{option.description}
								</span>
							{/if}
						</div>
					{/snippet}
				</RadioGroup.Item>
			{/each}
		</div>
	</RadioGroup.Root>
</div>
