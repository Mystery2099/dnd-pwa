<script lang="ts">
	import { Check } from 'lucide-svelte';

	interface Option {
		value: string;
		label: string;
		description?: string;
	}

	type Props = {
		value: string;
		options: readonly Option[];
		onchange?: (value: string) => void;
		class?: string;
		size?: 'sm' | 'md' | 'lg';
	};

	let { value, options, onchange, class: className = '', size = 'md' }: Props = $props();

	const sizeClasses = {
		sm: 'text-xs gap-1 px-2 py-1',
		md: 'text-sm gap-1.5 px-3 py-2',
		lg: 'text-base gap-2 px-4 py-2.5'
	};

	function handleSelect(optionValue: string) {
		value = optionValue;
		onchange?.(optionValue);
	}

	function handleKeydown(e: KeyboardEvent, optionValue: string, index: number) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleSelect(optionValue);
		} else if (e.key === 'ArrowRight') {
			const nextIndex = Math.min(index + 1, options.length - 1);
			handleSelect(options[nextIndex].value);
		} else if (e.key === 'ArrowLeft') {
			const prevIndex = Math.max(index - 1, 0);
			handleSelect(options[prevIndex].value);
		}
	}
</script>

<div class={className}>
	<div
		class="inline-flex items-center rounded-xl border border-white/10 bg-[var(--color-bg-card)] p-1 shadow-inner"
		role="radiogroup"
		aria-label="Segmented control"
	>
		{#each options as option, index (option.value)}
			{@const isSelected = value === option.value}
			<button
				type="button"
				role="radio"
				aria-checked={isSelected}
				aria-label={option.label}
				onclick={() => handleSelect(option.value)}
				onkeydown={(e) => handleKeydown(e, option.value, index)}
				disabled={isSelected}
				class="inline-flex items-center justify-center rounded-lg transition-all duration-200 {sizeClasses[
					size
				]}"
				class:bg-[var(--color-accent)]={isSelected}
				class:text-white={isSelected}
				class:shadow-md={isSelected}
				class:shadow-[var(--color-accent-glow)]={isSelected}
				class:text-[var(--color-text-secondary)]={!isSelected}
				class:hover:bg-[var(--color-bg-surface)]={!isSelected}
				class:disabled:cursor-default={isSelected}
			>
				{#if isSelected}
					<Check
						class="shrink-0"
						style="width: {size === 'sm'
							? '12px'
							: size === 'md'
								? '14px'
								: '16px'}; height: {size === 'sm' ? '12px' : size === 'md' ? '14px' : '16px'}"
					/>
				{/if}
				<span class="font-medium whitespace-nowrap">{option.label}</span>
			</button>
		{/each}
	</div>
</div>
