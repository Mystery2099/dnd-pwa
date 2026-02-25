<script lang="ts">
	import type { FieldConfig } from './types';
	import Field from './Field.svelte';

	type Props = {
		fields: FieldConfig[];
		values: Record<string, unknown>;
		onChange: (field: string, value: unknown) => void;
	};

	let { fields, values, onChange }: Props = $props();

	function handleChange(field: string, value: unknown) {
		onChange(field, value);
	}
</script>

<div class="space-y-4">
	{#each fields as field}
		<Field config={field} value={values[field.name]} onChange={(v) => handleChange(field.name, v)} />
	{/each}
</div>