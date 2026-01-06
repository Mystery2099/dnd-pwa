<script lang="ts">
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

	function toggle() {
		if (disabled) return;
		checked = !checked;
		onchange?.(checked);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			toggle();
		}
	}
</script>

<div class="toggle-row {className}">
	{#if label}
		<div class="toggle-text">
			<span class="toggle-label">{label}</span>
			{#if description}
				<span class="toggle-description">{description}</span>
			{/if}
		</div>
	{/if}

	<button
		type="button"
		role="switch"
		aria-checked={checked}
		aria-label={label}
		{disabled}
		onclick={toggle}
		onkeydown={handleKeydown}
		class="toggle-track"
		class:toggle-checked={checked}
	>
		<span class="toggle-thumb" class:translate-x-4={checked}></span>
	</button>
</div>
