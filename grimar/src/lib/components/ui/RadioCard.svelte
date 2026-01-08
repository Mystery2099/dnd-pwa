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

	<div class="grid gap-3" style="grid-template-columns: repeat({gridCols}, minmax(0, 1fr));">
		{#each options as option (option.value)}
			{@const isSelected = value === option.value}
			<button
				type="button"
				onclick={() => {
					value = option.value;
					onchange?.(option.value);
				}}
				class="runestone"
				data-state={isSelected ? 'selected' : 'unselected'}
				aria-label="Select {option.label}"
			>
				{#if children}
					{@render children({ option, checked: isSelected })}
				{:else}
					<div class="runestone-content">
						<div class="runestone-label">
							<span class="runestone-label-text">{option.label}</span>
						</div>
					</div>
				{/if}
			</button>
		{/each}
	</div>
</div>
