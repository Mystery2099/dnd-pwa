<script lang="ts">
	import SpellEntryContent from './SpellEntryContent.svelte';
	import MonsterEntryContent from './MonsterEntryContent.svelte';
	import FeatEntryContent from './FeatEntryContent.svelte';
	import BackgroundEntryContent from './BackgroundEntryContent.svelte';
	import RaceEntryContent from './RaceEntryContent.svelte';
	import ClassEntryContent from './ClassEntryContent.svelte';
	import ItemEntryContent from './ItemEntryContent.svelte';
	import LookupEntryContent from './LookupEntryContent.svelte';

	interface Props {
		dbType: string;
		details: Record<string, unknown>;
	}

	let { dbType, details }: Props = $props();

	const LOOKUP_TYPES = ['skills', 'conditions', 'languages', 'alignments'] as const;
</script>

{#if dbType === 'spells'}
	<SpellEntryContent spell={details} />
{:else if dbType === 'creatures'}
	<MonsterEntryContent monster={details} />
{:else if dbType === 'feats'}
	<FeatEntryContent feat={details} />
{:else if dbType === 'backgrounds'}
	<BackgroundEntryContent background={details} />
{:else if dbType === 'species'}
	<RaceEntryContent race={details} />
{:else if dbType === 'classes'}
	<ClassEntryContent classData={details} />
{:else if dbType === 'magicitems'}
	<ItemEntryContent item={details} />
{:else if LOOKUP_TYPES.includes(dbType as typeof LOOKUP_TYPES[number])}
	<LookupEntryContent
		details={details}
		type={dbType as 'skills' | 'conditions' | 'languages' | 'alignments'}
	/>
{:else}
	<div class="space-y-4">
		<div
			class="rounded-lg border border-[var(--color-border)] bg-black/20 p-4 font-mono text-xs"
		>
			<pre>{JSON.stringify(details, null, 2)}</pre>
		</div>
	</div>
{/if}
