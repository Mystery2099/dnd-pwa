<script lang="ts">
	import { Switch } from '$lib/components/ui/switch/index.js';

	type Props = {
		checked?: boolean;
		disabled?: boolean;
		label?: string;
		description?: string;
		onchange?: (checked: boolean) => void;
		class?: string;
	};

	let {
		checked = $bindable(false),
		disabled = false,
		label,
		description,
		onchange,
		class: className = ''
	}: Props = $props();

	function handleCheckedChange(newChecked: boolean) {
		checked = newChecked;
		onchange?.(newChecked);
	}
</script>

<Switch
	{checked}
	{disabled}
	{label}
	{description}
	class={className}
	onCheckedChange={handleCheckedChange}
/>
