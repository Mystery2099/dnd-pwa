<script lang="ts">
	import type { CompendiumTypeName } from '$lib/core/types/compendium';
	import {
		resolveCompendiumCardIcon,
		type CardIconData
	} from '$lib/core/utils/compendiumIconography';
	import CompendiumTypeIcon from './CompendiumTypeIcon.svelte';
	import CreatureTypeIcon from './CreatureTypeIcon.svelte';
	import SpellSchoolIcon from './SpellSchoolIcon.svelte';

	type Props = {
		type: CompendiumTypeName;
		itemData: CardIconData;
		fallback?: string;
		class?: string;
	};

	let { type, itemData, fallback = '', class: className = '' }: Props = $props();

	const resolvedIcon = $derived(resolveCompendiumCardIcon(type, itemData));
</script>

{#if resolvedIcon?.family === 'spell-school'}
	<SpellSchoolIcon school={resolvedIcon.value} class={className} />
{:else if resolvedIcon?.family === 'creature-type'}
	<CreatureTypeIcon type={resolvedIcon.value} class={className} />
{:else if fallback}
	<CompendiumTypeIcon {type} {fallback} class={className} />
{/if}
