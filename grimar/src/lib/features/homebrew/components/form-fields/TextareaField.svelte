<script lang="ts">
	import type { FieldConfig } from './types';

	type Props = {
		config: FieldConfig;
		fieldId: string;
		value: unknown;
		onChange: (value: unknown) => void;
	};

	let { config, fieldId, value, onChange }: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		onChange(target.value);
	}
</script>

<div>
	<label for={fieldId} class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
		{config.label}
		{#if config.required}<span class="text-red-400">*</span>{/if}
	</label>
	<textarea
		id={fieldId}
		value={value as string ?? ''}
		oninput={handleInput}
		placeholder={config.placeholder}
		class="input-crystal h-40 w-full resize-none rounded-xl p-4"
		rows={config.rows ?? 6}
	></textarea>
</div>