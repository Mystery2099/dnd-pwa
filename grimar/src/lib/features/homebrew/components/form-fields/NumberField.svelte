<script lang="ts">
	import type { FieldConfig } from './types';
	import Input from '$lib/components/ui/Input.svelte';

	type Props = {
		config: FieldConfig;
		fieldId: string;
		value: unknown;
		onChange: (value: unknown) => void;
	};

	let { config, fieldId, value, onChange }: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const num = parseFloat(target.value);
		onChange(isNaN(num) ? undefined : num);
	}
</script>

<div>
	<label for={fieldId} class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
		{config.label}
		{#if config.required}<span class="text-red-400">*</span>{/if}
	</label>
	<Input
		id={fieldId}
		value={value as number ?? ''}
		oninput={handleInput}
		placeholder={config.placeholder}
		type="number"
	/>
</div>