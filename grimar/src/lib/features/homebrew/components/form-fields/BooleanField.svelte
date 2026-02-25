<script lang="ts">
	import type { FieldConfig } from './types';
	import { Switch } from '$lib/components/ui/switch';

	type Props = {
		config: FieldConfig;
		fieldId: string;
		value: unknown;
		onChange: (value: unknown) => void;
	};

	let { config, fieldId, value, onChange }: Props = $props();

	function handleChange() {
		onChange(!value);
	}
</script>

<div class="flex items-center gap-2">
	<Switch id={fieldId} checked={!!value} onCheckedChange={handleChange} />
	<label class="text-sm" for={fieldId}>{config.label}</label>
</div>