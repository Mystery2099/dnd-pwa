<script lang="ts">
	import { Check } from 'lucide-svelte';

	interface Option {
		value: string;
		label: string;
		description?: string;
		icon?: string;
	}

	type Props = {
		value: string;
		options: readonly Option[];
		onchange?: (value: string) => void;
		gridCols?: number;
		class?: string;
		label?: string;
		description?: string;
	};

	let {
		value,
		options,
		onchange,
		gridCols = 2,
		class: className = '',
		label,
		description
	}: Props = $props();

	function handleSelect(optionValue: string) {
		value = optionValue;
		onchange?.(optionValue);
	}

	// Get rune for option value (first letter as fallback)
	function getRune(option: Option, _isSelected: boolean): string {
		if (option.icon) return option.icon;
		return option.label.charAt(0).toUpperCase();
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

	<div class="grid gap-3" style="grid-template-columns: repeat({gridCols}, minmax(0, 1fr));">
		{#each options as option (option.value)}
			{@const isSelected = value === option.value}
			<button
				type="button"
				onclick={() => handleSelect(option.value)}
				class="runestone"
				data-state={isSelected ? 'selected' : 'unselected'}
				aria-label="Select {option.label}"
			>
				<div class="runestone-content">
					<div class="runestone-rune" aria-hidden="true">
						{getRune(option, isSelected)}
					</div>
					<div class="runestone-label">
						<span class="runestone-label-text">{option.label}</span>
						{#if option.description}
							<span class="runestone-label-desc">{option.description}</span>
						{/if}
					</div>
					{#if isSelected}
						<Check class="size-4 shrink-0 text-[var(--color-accent)]" />
					{/if}
				</div>
			</button>
		{/each}
	</div>
</div>
