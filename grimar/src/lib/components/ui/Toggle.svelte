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

	// Track changes to call onchange callback
	$effect(() => {
		onchange?.(checked);
	});
</script>

<Switch
	{checked}
	{disabled}
	{label}
	{description}
	class={className}
/>
