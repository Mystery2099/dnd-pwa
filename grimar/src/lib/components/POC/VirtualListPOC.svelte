<script lang="ts">
  import { createVirtualizer } from '@tanstack/svelte-virtual';

  let virtualListEl: HTMLDivElement;

  // Create 10,000 items for the POC
  const items = Array.from({ length: 10000 }, (_, i) => `Item ${i}`);

  const virtualizer = createVirtualizer({
    count: items.length,
    getScrollElement: () => virtualListEl,
    estimateSize: () => 35,
    overscan: 5,
  });
</script>

<div
  bind:this={virtualListEl}
  class:list={true}
  style="height: 400px; width: 100%; overflow: auto; border: 1px solid #ccc;"
>
  <div
    style="position: relative; height: {$virtualizer.getTotalSize()}px; width: 100%;"
  >
    {#each $virtualizer.getVirtualItems() as row (row.index)}
      <div
        style="position: absolute; top: 0; left: 0; width: 100%; height: {row.size}px; transform: translateY({row.start}px);"
      >
        Row {row.index}: {items[row.index]}
      </div>
    {/each}
  </div>
</div>

<style>
  .list {
    background: white;
    color: black;
  }
</style>
