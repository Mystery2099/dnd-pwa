<script lang="ts">
	import VirtualList from './VirtualList.svelte';
	let { items } = $props();
</script>

<VirtualList {items} estimateSize={40}>
	{#snippet children(item: any, index: number)}
		<div>Item {index}: {item.name}</div>
	{/snippet}
</VirtualList>
