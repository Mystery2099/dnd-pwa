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

<div class="runic-row {className}">
	{#if label}
		<div class="runic-text">
			<span class="runic-label">{label}</span>
			{#if description}
				<span class="runic-description">{description}</span>
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
		class="runic-seal"
		class:opacity-50={disabled}
		data-state={checked ? 'checked' : 'unchecked'}
	>
		<!-- Rune symbol - changes based on state -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="size-4"
		>
			{#if checked}
				<!-- Active rune - star/asterisk pattern -->
				<polygon
					points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
				/>
			{:else}
				<!-- Inactive rune - simple circle -->
				<circle cx="12" cy="12" r="3" />
				<line x1="12" y1="2" x2="12" y2="6" />
				<line x1="12" y1="18" x2="12" y2="22" />
				<line x1="2" y1="12" x2="6" y2="12" />
				<line x1="18" y1="12" x2="22" y2="12" />
			{/if}
		</svg>
	</button>
</div>
