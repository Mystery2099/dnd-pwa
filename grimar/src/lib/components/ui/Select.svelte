<script lang="ts">
	type Option = { label: string; value: string | number };

	type Props = {
		value?: string | number;
		options: Option[];
		placeholder?: string;
		id?: string;
		name?: string;
		class?: string;
		disabled?: boolean;
		onchange?: (value: string) => void;
	};

	let {
		value = $bindable(),
		options = [],
		placeholder = '',
		id,
		name,
		class: className = '',
		disabled = false,
		onchange,
		...rest
	}: Props = $props();

	const baseClasses = 'input-crystal w-full cursor-pointer appearance-none px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all';

	function handleChange(e: Event) {
		const target = e.currentTarget as HTMLSelectElement;
		value = target.value;
		onchange?.(target.value);
	}
</script>

<div class="relative w-full">
	<select
		bind:value
		{id}
		{name}
		{disabled}
		class={`${baseClasses} ${className}`.trim()}
		onchange={handleChange}
		{...rest}
	>
		{#if placeholder}
			<option value="" disabled selected>{placeholder}</option>
		{/if}
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
	
	<!-- Dropdown Arrow -->
	<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
		<svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
			<path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
		</svg>
	</div>
</div>
