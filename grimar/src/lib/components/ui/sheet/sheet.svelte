<script lang="ts">
	import { Sheet as SheetPrimitive } from 'bits-ui';
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
		top: 'top-0 left-0 right-0 w-full data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
		right: 'right-0 top-0 h-full w-3/4 sm:max-w-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
		bottom: 'bottom-0 left-0 right-0 w-full data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
		left: 'left-0 top-0 h-full w-3/4 sm:max-w-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left'
	};
</script>

<SheetPrimitive.Root bind:open bind:onOpenChange>
	{#if children}
		<SheetPrimitive.Trigger class="contents">
			{@render children()}
		</SheetPrimitive.Trigger>
	{/if}

	<SheetPrimitive.Portal>
		<SheetPrimitive.Overlay
			class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
		/>
		<SheetPrimitive.Content
			class={cn(
				'fixed z-50 gap-4 border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl',
				sideStyles[side],
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
						<SheetPrimitive.Title
							class="text-lg font-semibold text-[var(--color-text-primary)]"
						>
							{title}
						</SheetPrimitive.Title>
					{/if}
					{#if description}
						<SheetPrimitive.Description class="text-sm text-[var(--color-text-secondary)]">
							{description}
						</SheetPrimitive.Description>
					{/if}
				</div>
			{/if}

			<SheetPrimitive.Close
				class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-[var(--color-bg-card)] transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-[var(--color-bg-surface)]"
			>
				<X class="size-4 text-[var(--color-text-muted)]" />
				<span class="sr-only">Close</span>
			</SheetPrimitive.Close>

			<div class="h-full overflow-y-auto">
				<slot />
			</div>
		</SheetPrimitive.Content>
	</SheetPrimitive.Portal>
</SheetPrimitive.Root>
