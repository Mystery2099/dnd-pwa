<script lang="ts">
	import { RadioGroup } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Option {
		value: string;
		label: string;
		description?: string;
		icon?: string;
	}

	type Props = {
		value?: string;
		options: readonly Option[];
		class?: string;
		gridCols?: number;
		label?: string;
		description?: string;
		onchange?: (value: string) => void;
		children?: Snippet<[{ option: Option; checked: boolean }]>;
	};

	let {
		value = $bindable<string>(),
		options,
		class: className = '',
		gridCols = 2,
		label,
		description,
		onchange,
		children
	}: Props = $props();

	function handleSelect(optionValue: string) {
		value = optionValue;
		onchange?.(optionValue);
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

	<RadioGroup.Root bind:value class="grid gap-3" style="grid-template-columns: repeat({gridCols}, minmax(0, 1fr));">
		{#each options as option (option.value)}
			<RadioGroup.Item value={option.value} class="contents">
				{#snippet children({ checked })}
					{@render children?.({ option, checked })}
				{/snippet}
			</RadioGroup.Item>
		{/each}
	</RadioGroup.Root>
</div>
