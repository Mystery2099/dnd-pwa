<script lang="ts">
	import type { UnifiedCompendiumItem, CompendiumType } from '$lib/core/types/compendium/unified';
	import type { CompendiumItem } from '$lib/server/db/schema';
	import MonsterEntryContent from './MonsterEntryContent.svelte';
	import SpellEntryContent from './SpellEntryContent.svelte';
	import RaceEntryContent from './RaceEntryContent.svelte';
	import ClassEntryContent from './ClassEntryContent.svelte';
	import ItemEntryContent from './ItemEntryContent.svelte';
	import GenericEntryContent from './GenericEntryContent.svelte';
	import { getConfigForType } from './entryConfigs';

	interface Props {
		dbType: CompendiumType | string;
		item?: UnifiedCompendiumItem | CompendiumItem;
		details?: Record<string, unknown>;
	}

	let { dbType, item, details }: Props = $props();

	const data = $derived(
		(item as CompendiumItem)?.data ?? (item as UnifiedCompendiumItem)?.details ?? details ?? {}
	);
	const genericConfig = $derived(getConfigForType(dbType));
</script>

{#if dbType === 'creatures' || dbType === 'creature'}
	<MonsterEntryContent details={data} />
{:else if dbType === 'spells' || dbType === 'spell'}
	<SpellEntryContent details={data} />
{:else if dbType === 'species' || dbType === 'race' || dbType === 'races'}
	<RaceEntryContent details={data} />
{:else if dbType === 'classes' || dbType === 'class'}
	<ClassEntryContent details={data} />
{:else if dbType === 'magicitems' || dbType === 'item' || dbType === 'items'}
	<ItemEntryContent details={data} />
{:else if genericConfig}
	<GenericEntryContent details={data} sections={genericConfig} />
{:else}
	<div class="prose prose-invert max-w-none">
		<p class="text-[var(--color-text-muted)]">No content renderer for {dbType}</p>
	</div>
{/if}
