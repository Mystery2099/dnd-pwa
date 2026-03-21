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
			'group flex h-10 w-full transform-gpu items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_8%,transparent)] transition-[transform,border-color,background-color,box-shadow,color] duration-150 ease-out hover:-translate-y-px hover:border-[var(--color-border-hover)] hover:bg-[color-mix(in_srgb,var(--color-bg-card)_92%,var(--color-accent))] hover:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent),0_0.7rem_1.4rem_color-mix(in_srgb,var(--color-shadow)_10%,transparent)] active:translate-y-px active:scale-[0.985] focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-canvas)] focus:outline-none data-[state=open]:border-[color-mix(in_srgb,var(--color-accent)_36%,var(--color-border))] data-[state=open]:bg-[color-mix(in_srgb,var(--color-bg-card)_90%,var(--color-accent))] data-[state=open]:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent),0_0_0_1px_color-mix(in_srgb,var(--color-accent)_18%,transparent),0_0.9rem_1.8rem_color-mix(in_srgb,var(--color-accent)_10%,transparent)] motion-reduce:transform-none motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50',
			className
		)}
	>
		{#if selectedOption}
			{selectedOption.label}
		{:else}
			{placeholder}
		{/if}

		<ChevronDown class="size-4 text-[var(--color-text-muted)] transition-[transform,color] duration-150 ease-out group-data-[state=open]:rotate-180 group-data-[state=open]:text-[var(--color-accent)]" />
	</SelectPrimitive.Trigger>

	<SelectPrimitive.Portal>
		<SelectPrimitive.Content
			class={cn(
				'relative z-50 min-w-[200px] origin-top overflow-hidden rounded-xl border border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-overlay)_94%,var(--color-bg-canvas)),color-mix(in_srgb,var(--color-bg-card)_96%,var(--color-bg-canvas)))] shadow-[0_1.2rem_2.75rem_color-mix(in_srgb,var(--color-shadow)_34%,transparent),inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_16%,transparent),0_0_0_1px_color-mix(in_srgb,var(--color-border)_92%,transparent)] backdrop-blur-xl will-change-[transform,opacity] data-[state=open]:animate-(--animate-dropdown-in) data-[state=closed]:animate-(--animate-dropdown-out) motion-reduce:data-[state=open]:animate-none motion-reduce:data-[state=closed]:animate-none',
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
						class="relative flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none select-none transition-[transform,background-color,color,box-shadow] duration-150 ease-out hover:translate-x-0.5 hover:bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] focus:translate-x-0.5 focus:bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] data-[state=checked]:text-[var(--color-accent)] data-[state=checked]:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-accent)_14%,transparent)]"
					>
						{#snippet children({ selected })}
							{#if selected}
								<div
									class="absolute right-2 flex size-3.5 items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)]/20 transition-[transform,background-color,opacity] duration-150 ease-out"
								>
									<div class="size-2 rounded-full bg-[var(--color-accent)] transition-transform duration-150 ease-out group-data-[state=checked]:scale-100"></div>
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
