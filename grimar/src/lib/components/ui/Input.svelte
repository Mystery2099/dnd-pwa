<script lang="ts">
	type Props = {
		value?: string | number;
		placeholder?: string;
		type?: string;
		id?: string;
		name?: string;
		class?: string;
		disabled?: boolean;
		ref?: HTMLInputElement | null;
		oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void;
		onchange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
		onkeydown?: (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => void;
	};

	let {
		value = $bindable(),
		placeholder = '',
		type = 'text',
		id,
		name,
		class: className = '',
		disabled = false,
		ref = $bindable(),
		oninput,
		onchange,
		onkeydown,
		...rest
	}: Props = $props();

	const baseClasses =
		'input-crystal w-full px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all';
</script>

<input
	bind:this={ref}
	bind:value
	{type}
	{id}
	{name}
	{placeholder}
	{disabled}
	class={`${baseClasses} ${className}`.trim()}
	{oninput}
	{onchange}
	{onkeydown}
	{...rest}
/>
