<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import X from 'lucide-svelte/icons/x';
	import type { Snippet } from 'svelte';

	type Side = 'top' | 'right' | 'bottom' | 'left';

	type Props = {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		side?: Side;
		class?: string;
		children?: Snippet;
		title?: string;
		description?: string;
	};

	let {
		open = $bindable(false),
		onOpenChange,
		side = 'right',
		class: className = '',
		children,
		title,
		description
	}: Props = $props();

	const sideStyles = {
		top: 'top-0 left-0 right-0 w-full',
		right: 'right-0 top-0 h-full w-3/4 sm:max-w-sm',
		bottom: 'bottom-0 left-0 right-0 w-full',
		left: 'left-0 top-0 h-full w-3/4 sm:max-w-sm'
	};

	const animations = {
		top: 'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
		right: 'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
		bottom: 'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
		left: 'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left'
	};

	function handleOpenChange(value: boolean) {
		open = value;
		onOpenChange?.(value);
	}
</script>

<DialogPrimitive.Root {open} onOpenChange={handleOpenChange}>
	{#if children}
		<DialogPrimitive.Trigger class="contents">
			{@render children()}
		</DialogPrimitive.Trigger>
	{/if}

	<DialogPrimitive.Portal>
		<DialogPrimitive.Overlay class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
		<DialogPrimitive.Content
			class={cn(
				'fixed z-50 gap-4 border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl',
				sideStyles[side],
				animations[side],
				className
			)}
		>
			<!-- Glass overlay effect -->
			<div
				class="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--color-accent)]/20 to-transparent"
			></div>

			{#if title || description}
				<div class="flex flex-col gap-1.5 pr-8">
					{#if title}
						<DialogPrimitive.Title class="text-lg font-semibold text-[var(--color-text-primary)]">
							{title}
						</DialogPrimitive.Title>
					{/if}
					{#if description}
						<DialogPrimitive.Description class="text-sm text-[var(--color-text-secondary)]">
							{description}
						</DialogPrimitive.Description>
					{/if}
				</div>
			{/if}

			<DialogPrimitive.Close
				class="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-[var(--color-bg-card)] transition-opacity hover:opacity-100 focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-[var(--color-bg-surface)]"
			>
				<X class="size-4 text-[var(--color-text-muted)]" />
				<span class="sr-only">Close</span>
			</DialogPrimitive.Close>

			<div class="h-full overflow-y-auto">
				{@render children?.()}
			</div>
		</DialogPrimitive.Content>
	</DialogPrimitive.Portal>
</DialogPrimitive.Root>
