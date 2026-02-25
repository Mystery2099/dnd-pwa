<script lang="ts">
	import type { FieldConfig } from './types';

	type Props = {
		config: FieldConfig;
		fieldId: string;
		value: unknown;
		onChange: (value: unknown) => void;
	};

	let { config, fieldId, value, onChange }: Props = $props();

	function handleChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		onChange(target.value);
	}
</script>

<div>
	<label for={fieldId} class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
		{config.label}
		{#if config.required}<span class="text-red-400">*</span>{/if}
	</label>
	<select
		id={fieldId}
		value={value as string ?? ''}
		onchange={handleChange}
		class="input-crystal w-full rounded-xl px-4 py-2"
	>
		{#if !config.required}
			<option value="">Select...</option>
		{/if}
		{#each config.options ?? [] as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</div>