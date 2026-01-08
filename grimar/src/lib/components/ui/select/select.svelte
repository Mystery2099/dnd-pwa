<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import type { Snippet } from 'svelte';

	type SelectOption = {
		label: string;
		value: string;
		disabled?: boolean;
	};

	type Props = {
		type: 'single';
		placeholder?: string;
		options: SelectOption[];
		class?: string;
		contentClass?: string;
		value?: string;
	};

	let {
		value = $bindable<string | undefined>(undefined),
		type,
		placeholder = 'Select...',
		options,
		class: className = '',
		contentClass = '',
		...restProps
	}: Props = $props();

	const selectedOption = $derived(
		options.find((option) => option.value === value)
	);
</script>

<SelectPrimitive.Root {type} bind:value {...restProps}>
	<SelectPrimitive.Trigger
		class={cn(
			'flex h-10 w-full items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-canvas)] disabled:cursor-not-allowed disabled:opacity-50',
			className
		)}
	>
		{#if selectedOption}
			{selectedOption.label}
		{:else}
			{placeholder}
		{/if}

		<ChevronDown class="size-4 text-[var(--color-text-muted)]" />
	</SelectPrimitive.Trigger>

	<SelectPrimitive.Portal>
		<SelectPrimitive.Content
			class={cn(
				'relative z-50 min-w-[200px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-lg',
				contentClass
			)}
		>
			<SelectPrimitive.Viewport class="max-h-[300px] overflow-y-auto p-1">
				{#each options as option (option.value)}
					<SelectPrimitive.Item
						value={option.value}
						disabled={option.disabled}
						class="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors hover:bg-[var(--color-accent)]/10 focus:bg-[var(--color-accent)]/20 data-[state=checked]:bg-[var(--color-accent)]/15 data-[state=checked]:text-[var(--color-accent)] disabled:pointer-events-none disabled:opacity-50"
					>
						{#snippet children({ selected })}
							{#if selected}
								<div
									class="absolute right-2 flex size-3.5 items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)]/20"
								>
									<div class="size-2 rounded-full bg-[var(--color-accent)]"></div>
								</div>
							{/if}
							<span>{option.label}</span>
						{/snippet}
					</SelectPrimitive.Item>
				{/each}
			</SelectPrimitive.Viewport>
		</SelectPrimitive.Content>
	</SelectPrimitive.Portal>
</SelectPrimitive.Root>
