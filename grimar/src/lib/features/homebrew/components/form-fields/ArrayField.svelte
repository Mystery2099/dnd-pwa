<script lang="ts">
	import type { FieldConfig } from './types';

	type Props = {
		config: FieldConfig;
		fieldId: string;
		value: unknown;
		onChange: (value: unknown) => void;
	};

	let { config, fieldId, value, onChange }: Props = $props();

	const arrayValue = $derived(Array.isArray(value) ? value : []);

	function getTextValue(arr: unknown[]): string {
		return arr.join('\n');
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		const items = target.value.split('\n').map(s => s.trim()).filter(Boolean);
		onChange(items);
	}
</script>

<div>
	<label for={fieldId} class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
		{config.label}
		<span class="text-xs text-[var(--color-text-muted)]">(one per line)</span>
	</label>
	<textarea
		id={fieldId}
		value={getTextValue(arrayValue)}
		oninput={handleInput}
		placeholder="Item 1&#10;Item 2&#10;Item 3"
		class="input-crystal h-32 w-full resize-none rounded-xl p-4"
		rows={config.rows ?? 6}
	></textarea>
</div>