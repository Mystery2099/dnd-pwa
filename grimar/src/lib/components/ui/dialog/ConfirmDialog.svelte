<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Button from '$lib/components/ui/Button.svelte';
	import type { ComponentType, Snippet } from 'svelte';

	type Props = {
		open: boolean;
		title: string;
		description: string;
		confirmText?: string;
		cancelText?: string;
		variant?: 'danger';
		icon?: ComponentType;
		onconfirm: () => void;
		onclose: () => void;
		children?: Snippet;
	};

	let {
		open = $bindable(false),
		title,
		description,
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		variant = 'danger',
		icon: Icon,
		onconfirm,
		onclose,
		children
	}: Props = $props();

	function handleConfirm() {
		onconfirm();
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-3">
				{#if Icon}
					<div
						class="rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 p-2.5 {variant ===
						'danger'
							? 'border-red-500/30 bg-red-500/10'
							: ''}"
					>
						<Icon
							class="size-6 {variant === 'danger' ? 'text-red-400' : 'text-[var(--color-accent)]'}"
						/>
					</div>
				{/if}
				{title}
			</Dialog.Title>
			<Dialog.Description class="mt-2 text-sm text-[var(--color-text-secondary)]">
				{description}
			</Dialog.Description>
		</Dialog.Header>

		{#if children}
			<div class="mt-4">{@render children()}</div>
		{/if}

		<Dialog.Footer class="mt-6 flex justify-end gap-3">
			<Button variant="outline" onclick={onclose}>{cancelText}</Button>
			<Button
				variant={variant === 'danger' ? 'danger' : 'gem'}
				onclick={handleConfirm}
				class="min-w-[100px]"
			>
				{confirmText}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
