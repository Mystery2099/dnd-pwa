<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { MediaQuery } from 'svelte/reactivity';
	import { cn } from '$lib/utils.js';
	import * as Sheet from '$lib/components/ui/sheet';
	import Check from 'lucide-svelte/icons/check';
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

	const desktopViewport = new MediaQuery('min-width: 640px', true);
	const componentId = $props.id();
	const mobileTriggerId = `${componentId}-trigger`;
	const mobileDialogId = `${componentId}-dialog`;
	const mobileOptionName = `${componentId}-option`;

	let mobileSheetOpen = $state(false);

	const selectedOption = $derived(options.find((option) => option.value === value));
	const selectedLabel = $derived(selectedOption?.label ?? placeholder);
	const isDesktop = $derived(desktopViewport.current);

	const triggerClassName =
		'group flex h-10 w-full transform-gpu items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_8%,transparent)] transition-[transform,border-color,background-color,box-shadow,color] duration-150 ease-out hover:-translate-y-px hover:border-[var(--color-border-hover)] hover:bg-[color-mix(in_srgb,var(--color-bg-card)_92%,var(--color-accent))] hover:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent),0_0.7rem_1.4rem_color-mix(in_srgb,var(--color-shadow)_10%,transparent)] active:translate-y-px active:scale-[0.985] focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-canvas)] focus:outline-none data-[state=open]:border-[color-mix(in_srgb,var(--color-accent)_36%,var(--color-border))] data-[state=open]:bg-[color-mix(in_srgb,var(--color-bg-card)_90%,var(--color-accent))] data-[state=open]:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent),0_0_0_1px_color-mix(in_srgb,var(--color-accent)_18%,transparent),0_0.9rem_1.8rem_color-mix(in_srgb,var(--color-accent)_10%,transparent)] motion-reduce:transform-none motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50';

	function handleValueChange(nextValue: string) {
		value = nextValue;
		onchange?.(nextValue);
	}

	function handleMobileSelect(nextValue: string) {
		handleValueChange(nextValue);
		mobileSheetOpen = false;
	}

	function handleWindowResize() {
		if (window.matchMedia('(min-width: 640px)').matches) mobileSheetOpen = false;
	}
</script>

<svelte:window onresize={handleWindowResize} />

{#if isDesktop}
	<SelectPrimitive.Root {type} bind:value onValueChange={handleValueChange} {...restProps}>
		<SelectPrimitive.Trigger class={cn(triggerClassName, className)}>
			{selectedLabel}

			<ChevronDown
				class="size-4 text-[var(--color-text-muted)] transition-[transform,color] duration-150 ease-out group-data-[state=open]:rotate-180 group-data-[state=open]:text-[var(--color-accent)]"
			/>
		</SelectPrimitive.Trigger>

		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				class={cn(
					'relative z-50 min-w-[200px] origin-top overflow-hidden rounded-xl border border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-overlay)_94%,var(--color-bg-canvas)),color-mix(in_srgb,var(--color-bg-card)_96%,var(--color-bg-canvas)))] shadow-[0_1.2rem_2.75rem_color-mix(in_srgb,var(--color-shadow)_34%,transparent),inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_16%,transparent),0_0_0_1px_color-mix(in_srgb,var(--color-border)_92%,transparent)] backdrop-blur-xl will-change-[transform,opacity] data-[state=closed]:animate-(--animate-dropdown-out) data-[state=open]:animate-(--animate-dropdown-in) motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none',
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
							class="relative flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] transition-[transform,background-color,color,box-shadow] duration-150 ease-out outline-none select-none hover:translate-x-0.5 hover:bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] focus:translate-x-0.5 focus:bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] data-[state=checked]:text-[var(--color-accent)] data-[state=checked]:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-accent)_14%,transparent)]"
						>
							{#snippet children({ selected })}
								{#if selected}
									<div
										class="absolute right-2 flex size-3.5 items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)]/20 transition-[transform,background-color,opacity] duration-150 ease-out"
									>
										<div
											class="size-2 rounded-full bg-[var(--color-accent)] transition-transform duration-150 ease-out group-data-[state=checked]:scale-100"
										></div>
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
{:else}
	<button
		id={mobileTriggerId}
		type="button"
		class={cn(triggerClassName, className)}
		aria-expanded={mobileSheetOpen}
		aria-haspopup="dialog"
		aria-controls={mobileDialogId}
		onclick={() => {
			mobileSheetOpen = true;
		}}
	>
		<span class="truncate">{selectedLabel}</span>
		<ChevronDown
			class="size-4 text-[var(--color-text-muted)] transition-colors duration-150 ease-out"
		/>
	</button>

	<Sheet.Root bind:open={mobileSheetOpen}>
		<Sheet.Content
			id={mobileDialogId}
			side="bottom"
			variant="sheet"
			overlayVariant="blur"
			overlayBlur="sm"
			class="max-h-[78vh] px-0 pt-3"
		>
			<div class="space-y-3 px-3 text-left">
				<Sheet.Title class="font-medium">
					{placeholder === 'Select...' ? 'Choose an option' : placeholder}
				</Sheet.Title>
				<Sheet.Description class="text-[var(--color-text-muted)]">
					Tap an option to apply it immediately.
				</Sheet.Description>
			</div>
			<div class="px-3 pb-4">
				<fieldset
					class="rounded-[1.15rem] border border-[color-mix(in_srgb,var(--color-border)_84%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_38%,transparent)] p-2 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_8%,transparent)]"
				>
					<legend class="sr-only">
						{placeholder === 'Select...' ? 'Choose an option' : placeholder}
					</legend>
					<div class="max-h-[52vh] space-y-1 overflow-y-auto">
						{#each options as option (option.value)}
							<label
								class={cn(
									'flex w-full cursor-pointer items-center justify-between rounded-[0.95rem] px-3.5 py-3 text-left text-sm font-medium text-[var(--color-text-primary)] transition-[background-color,color,transform,box-shadow] duration-150 ease-out active:scale-[0.99] has-disabled:cursor-not-allowed has-disabled:opacity-45',
									option.value === value
										? 'bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-[var(--color-accent)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-accent)_18%,transparent)]'
										: 'bg-transparent hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]'
								)}
							>
								<input
									class="sr-only"
									type="radio"
									name={mobileOptionName}
									value={option.value}
									checked={option.value === value}
									disabled={option.disabled}
									onchange={() => handleMobileSelect(option.value)}
								/>
								<span class="pr-3">{option.label}</span>
								{#if option.value === value}
									<span
										class="flex size-7 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--color-accent)_48%,transparent)] bg-[color-mix(in_srgb,var(--color-accent)_16%,transparent)]"
									>
										<Check class="size-3.5" />
									</span>
								{/if}
							</label>
						{/each}
					</div>
				</fieldset>
			</div>
		</Sheet.Content>
	</Sheet.Root>
{/if}
