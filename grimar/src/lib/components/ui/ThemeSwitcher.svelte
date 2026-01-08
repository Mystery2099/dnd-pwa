<script lang="ts">
	import { getTheme, THEME_OPTIONS } from '$lib/core/client/themeStore.svelte';
	import Select from '$lib/components/ui/select/select.svelte';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	const currentTheme = $derived(getTheme());
</script>

<div class="flex items-center gap-3 {className}">
	<Select
		type="single"
		bind:value={currentTheme}
		options={THEME_OPTIONS}
		placeholder="Select theme"
		class="w-40"
	/>
</div>
