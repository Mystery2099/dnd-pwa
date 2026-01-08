<script lang="ts">
	import { Switch as SwitchPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';

	type Props = WithoutChildrenOrChild<SwitchPrimitive.RootProps> & {
		label?: string;
		description?: string;
		class?: string;
	};

	let {
		checked = $bindable(false),
		disabled = false,
		label,
		description,
		class: className = '',
		...restProps
	}: Props = $props();
</script>

{#if label}
	<div class="toggle-row {className}">
		<div class="toggle-text">
			<span class="toggle-label">{label}</span>
			{#if description}
				<span class="toggle-description">{description}</span>
			{/if}
		</div>

		<SwitchPrimitive.Root
			bind:checked
			{disabled}
			class={cn('toggle-track', checked && 'toggle-checked', className)}
		>
			{#snippet children({ checked })}
				<span class="toggle-thumb {checked ? 'translate-x-4' : ''}"></span>
			{/snippet}
		</SwitchPrimitive.Root>
	</div>
{:else}
	<SwitchPrimitive.Root
		bind:checked
		{disabled}
		class={cn('toggle-track', checked && 'toggle-checked', className)}
		{...restProps}
	>
		{#snippet children({ checked })}
			<span class="toggle-thumb {checked ? 'translate-x-4' : ''}"></span>
		{/snippet}
	</SwitchPrimitive.Root>
{/if}
