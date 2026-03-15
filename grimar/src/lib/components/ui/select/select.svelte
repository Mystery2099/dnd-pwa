<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';

	type SelectOption = {
		label: string;
		value: string;
		disabled?: boolean;
	};

	type Props = {
		type: 'single';
		placeholder?: string;
		options: readonly SelectOption[];
		class?: string;
		contentClass?: string;
		value?: string;
		onchange?: (value: string) => void;
	};

	let {
		value = $bindable<string | undefined>(undefined),
		type,
		placeholder = 'Select...',
		options,
		class: className = '',
		contentClass = '',
		onchange,
		...restProps
	}: Props = $props();

	const selectedOption = $derived(options.find((option) => option.value === value));
</script>

<SelectPrimitive.Root
	{type}
	bind:value
	onValueChange={(nextValue) => {
		value = nextValue;
		onchange?.(nextValue);
	}}
	{...restProps}
>
	<SelectPrimitive.Trigger
		class={cn(
			'flex h-10 w-full items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-hover)] focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-canvas)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
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
				'relative z-50 min-w-[200px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-overlay)_94%,var(--color-bg-canvas)),color-mix(in_srgb,var(--color-bg-card)_96%,var(--color-bg-canvas)))] shadow-[0_1.2rem_2.75rem_color-mix(in_srgb,var(--color-shadow)_34%,transparent),inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_16%,transparent),0_0_0_1px_color-mix(in_srgb,var(--color-border)_92%,transparent)] backdrop-blur-xl',
				contentClass
			)}
		>
			<div
				class="pointer-events-none absolute inset-x-3 top-0 h-px bg-linear-to-r from-transparent via-[color-mix(in_srgb,var(--color-text-primary)_32%,transparent)] to-transparent"
			></div>
			<SelectPrimitive.Viewport class="max-h-[300px] overflow-y-auto p-1.5">
				{#each options as option (option.value)}
					<SelectPrimitive.Item
						value={option.value}
						disabled={option.disabled}
						class="relative flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] transition-colors outline-none select-none hover:bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] focus:bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] data-[state=checked]:text-[var(--color-accent)]"
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
