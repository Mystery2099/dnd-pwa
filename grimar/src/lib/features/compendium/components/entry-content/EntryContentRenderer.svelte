<script lang="ts">
	import type { UnifiedCompendiumItem, CompendiumType } from '$lib/core/types/compendium/unified';
	import MonsterEntryContent from './MonsterEntryContent.svelte';
	import SpellEntryContent from './SpellEntryContent.svelte';
	import FeatEntryContent from './FeatEntryContent.svelte';
	import BackgroundEntryContent from './BackgroundEntryContent.svelte';
	import RaceEntryContent from './RaceEntryContent.svelte';
	import ClassEntryContent from './ClassEntryContent.svelte';
	import ItemEntryContent from './ItemEntryContent.svelte';

	interface Props {
		dbType: CompendiumType;
		item?: UnifiedCompendiumItem;
		details?: Record<string, unknown>;
	}

	let { dbType, item, details }: Props = $props();

	const data = $derived(item?.details ?? details ?? {});
</script>

{#if dbType === 'creature'}
	<MonsterEntryContent details={data} />
{:else if dbType === 'spell'}
	<SpellEntryContent details={data} />
{:else if dbType === 'feat'}
	<FeatEntryContent details={data} />
{:else if dbType === 'background'}
	<BackgroundEntryContent details={data} />
{:else if dbType === 'race'}
	<RaceEntryContent details={data} />
{:else if dbType === 'class'}
	<ClassEntryContent details={data} />
{:else if dbType === 'item'}
	<ItemEntryContent details={data} />
{:else}
	<div class="prose prose-invert max-w-none">
		<p class="text-[var(--color-text-muted)]">No content renderer for {dbType}</p>
	</div>
{/if}
