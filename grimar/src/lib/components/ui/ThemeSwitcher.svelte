<script lang="ts">
	import { getTheme, setTheme, THEME_OPTIONS } from '$lib/core/client/themeStore.svelte';
	import Select from '$lib/components/ui/Select.svelte';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	const currentTheme = $derived(getTheme());

	function handleSetTheme(themeId: string) {
		setTheme(themeId);
	}
</script>

<div class="flex items-center gap-3 {className}">
	<Select
		value={currentTheme}
		options={THEME_OPTIONS}
		onchange={handleSetTheme}
		placeholder="Select theme"
		class="w-40"
	/>
</div>
