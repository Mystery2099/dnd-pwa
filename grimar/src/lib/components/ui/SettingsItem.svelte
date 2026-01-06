<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		label: string;
		description?: string;
		control: Snippet;
		divider?: boolean;
		class?: string;
	};

	let { label, description, control, divider = true, class: className = '' }: Props = $props();
</script>

<div class="runic-row {divider ? 'runic-divider' : ''} {className}">
	<div class="runic-text flex-1">
		<span class="runic-label">{label}</span>
		{#if description}
			<span class="runic-description">{description}</span>
		{/if}
	</div>

	<div class="runic-control">
		{@render control()}
	</div>
</div>
