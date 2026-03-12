<script lang="ts">
	import VirtualList from './VirtualList.svelte';
	type VirtualListTestItem = { name: string };

	let { items }: { items: VirtualListTestItem[] } = $props();
</script>

<VirtualList {items} estimateSize={40}>
	{#snippet children(item: VirtualListTestItem, index: number)}
		<div>Item {index}: {item.name}</div>
	{/snippet}
</VirtualList>
