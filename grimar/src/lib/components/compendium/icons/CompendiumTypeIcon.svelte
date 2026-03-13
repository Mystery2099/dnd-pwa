<script lang="ts">
	import type { CompendiumTypeName } from '$lib/core/types/compendium';
	import DamageTypeIcon from './DamageTypeIcon.svelte';
	import SpellSchoolIcon from './SpellSchoolIcon.svelte';
	import CreatureTypeIcon from './CreatureTypeIcon.svelte';

	type Props = {
		type: string;
		fallback?: string;
		class?: string;
	};

	let { type, fallback = '', class: className = '' }: Props = $props();

	const normalizedType = $derived(type.trim().toLowerCase() as CompendiumTypeName);

	const isSpellSchool = $derived(normalizedType === 'spellschools' || normalizedType === 'spells');
	const isDamageType = $derived(normalizedType === 'damagetypes');
	const isCreatureFamily = $derived(
		normalizedType === 'creaturetypes' ||
			normalizedType === 'creatures' ||
			normalizedType === 'creaturesets'
	);
</script>

{#if isSpellSchool}
	<SpellSchoolIcon school="arcane" class={className} />
{:else if isDamageType}
	<DamageTypeIcon type="force" class={className} />
{:else if isCreatureFamily}
	<CreatureTypeIcon
		type={normalizedType === 'creaturetypes'
			? 'construct'
			: normalizedType === 'creaturesets'
				? 'fiend'
				: 'dragon'}
		class={className}
	/>
{:else}
	<svg
		viewBox="0 0 64 64"
		fill="none"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="2.5"
		class={`overflow-visible text-[color-mix(in_srgb,var(--color-accent)_42%,var(--color-text-primary))] [filter:drop-shadow(0_0_0.55rem_color-mix(in_srgb,var(--color-accent)_16%,transparent))] ${className}`.trim()}
		aria-hidden="true"
	>
		<circle
			cx="32"
			cy="32"
			r="24"
			class="fill-[color-mix(in_srgb,var(--color-accent)_24%,transparent)] stroke-none"
		></circle>
		<circle
			cx="32"
			cy="32"
			r="24"
			class="fill-none stroke-[color-mix(in_srgb,var(--color-text-primary)_22%,var(--color-border-hover))]"
		></circle>

		<g
			transform="translate(32 32) scale(1.08) translate(-32 -32)"
			class="stroke-[color-mix(in_srgb,var(--color-text-primary)_94%,var(--color-accent))]"
		>
			{#if normalizedType === 'species'}
				<circle
					cx="32"
					cy="24"
					r="7"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></circle>
				<path d="M21 46c2.2-8 6.6-12 11-12s8.8 4 11 12"></path>
			{:else if normalizedType === 'classes'}
				<path d="M22 44l14-22"></path>
				<path
					d="M18 46l8-2-6-6-2 8z"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
				<path d="M42 18v22"></path>
				<path d="M37 21c3-4 7-4 10 0" class="stroke-[var(--color-accent)]"></path>
			{:else if normalizedType === 'subclasses'}
				<circle
					cx="32"
					cy="39"
					r="4.5"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></circle>
				<circle cx="22" cy="23" r="3"></circle>
				<circle cx="42" cy="23" r="3"></circle>
				<path d="M32 35V27"></path>
				<path d="M32 27l-10-4"></path>
				<path d="M32 27l10-4" class="stroke-[var(--color-accent)]"></path>
			{:else if normalizedType === 'classfeatures' || normalizedType === 'classfeatureitems'}
				<path d="M22 18h16l6 6v22H22V18z"></path>
				<path d="M38 18v8h8"></path>
				<path d="M27 31h10"></path>
				<path d="M27 38h10" class="stroke-[var(--color-accent)]"></path>
			{:else if normalizedType === 'backgrounds' || normalizedType === 'backgroundbenefits'}
				<path d="M24 18h14c4 4 5 6 5 10v18H21V28c0-4 1-6 3-10z"></path>
				<path d="M27 18c-1 7-3 10-6 12" class="stroke-[var(--color-accent)]"></path>
				<path d="M37 18c1 7 3 10 6 12" class="stroke-[var(--color-accent)]"></path>
				<path d="M25 35c4-3 10-3 14 0"></path>
			{:else if normalizedType === 'feats' || normalizedType === 'featbenefits'}
				<circle cx="32" cy="32" r="14"></circle>
				<path
					d="M32 22l2.8 5.8 6.2.8-4.5 4.2 1.1 6.2-5.6-3.1-5.6 3.1 1.1-6.2-4.5-4.2 6.2-.8z"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
				<path d="M21 27c-2 2.5-3 5.5-3 9"></path>
				<path d="M43 27c2 2.5 3 5.5 3 9" class="stroke-[var(--color-accent)]"></path>
			{:else if normalizedType === 'spellcastingoptions'}
				<circle cx="32" cy="32" r="9"></circle>
				<path d="M32 16v6" class="stroke-[var(--color-accent)]"></path>
				<path d="M32 42v6" class="stroke-[var(--color-accent)]"></path>
				<path d="M16 32h6" class="stroke-[var(--color-accent)]"></path>
				<path d="M42 32h6" class="stroke-[var(--color-accent)]"></path>
			{:else if normalizedType === 'speciestraits'}
				<path d="M32 47V26"></path>
				<path
					d="M32 26c0-7-5-11-12-11 0 7 4 12 12 12"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
				<path
					d="M32 31c0-7 5-11 12-11 0 7-4 12-12 12"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
				<path d="M26 47h12"></path>
			{:else if normalizedType === 'creatureactions' || normalizedType === 'creatureactionattacks'}
				<path d="M24 44l16-24"></path>
				<path d="M23 20h17"></path>
				<path d="M20 44h17"></path>
			{:else if normalizedType === 'creaturetraits'}
				<path d="M24 44c0-9 3.8-15 8-15s8 6 8 15"></path>
				<path d="M26 30l-5-8" class="stroke-[var(--color-accent)]"></path>
				<path d="M38 30l5-8" class="stroke-[var(--color-accent)]"></path>
			{:else if normalizedType === 'weapons'}
				<path d="M22 43l20-20"></path>
				<path
					d="M18 46l8-2-6-6-2 8z"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
				<path d="M37 18h9v9" class="stroke-[var(--color-accent)]"></path>
			{:else if normalizedType === 'armor'}
				<path
					d="M32 17l12 5v10c0 8-5.7 14.8-12 17-6.3-2.2-12-9-12-17V22l12-5z"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
			{:else if normalizedType === 'items' || normalizedType === 'itemcategories'}
				<path
					d="M24 24c0-4 3.5-6 8-6s8 2 8 6c0 2-1 4-3 6l1 13H26l1-13c-2-2-3-4-3-6z"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
				<path d="M28 24h8"></path>
				<path d="M32 18v8" class="stroke-[var(--color-accent)]"></path>
			{:else if normalizedType === 'magicitems'}
				<path d="M24 43c5-3 10-9 12-16"></path>
				<path d="M36 27l7-7"></path>
				<path
					d="M21 46l6-3-3-6-3 9z"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
				<path
					d="M45 18l1.5 3 3.5.3-2.7 2.2.8 3.5-3.1-1.7-3.1 1.7.8-3.5-2.7-2.2 3.5-.3 1.5-3z"
					class="stroke-[var(--color-accent)]"
				></path>
			{:else if normalizedType === 'itemrarities'}
				<path d="M32 17l9 9-9 21-9-21 9-9z"></path>
				<path d="M32 24v16" class="stroke-[var(--color-accent)]"></path>
			{:else if normalizedType === 'itemsets'}
				<rect x="18" y="24" width="16" height="16" rx="4"></rect>
				<rect
					x="30"
					y="24"
					width="16"
					height="16"
					rx="4"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></rect>
			{:else if normalizedType === 'weaponproperties' || normalizedType === 'weaponpropertyassignments'}
				<path d="M22 43l20-20"></path>
				<path
					d="M18 46l8-2-6-6-2 8z"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
				<path
					d="M41 20l1.5 3 3.5.3-2.7 2.2.8 3.5-3.1-1.7-3.1 1.7.8-3.5-2.7-2.2 3.5-.3 1.5-3z"
					class="fill-[var(--color-accent)] stroke-none"
				></path>
			{:else if normalizedType === 'conditions'}
				<path d="M19 32c0-7 6-13 13-13 3.5 0 7 1.5 9.2 3.8" class="stroke-[var(--color-accent)]"
				></path>
				<path d="M45 32c0 7-6 13-13 13-3.5 0-7-1.5-9.2-3.8"></path>
				<path
					d="M39 19l2 4 4 .5-3 2.4.9 4-3.9-2.1-3.9 2.1.9-4-3-2.4 4-.5 2-4z"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
			{:else if normalizedType === 'skills'}
				<circle cx="29" cy="29" r="10"></circle>
				<path d="M36 36l10 10" class="stroke-[var(--color-accent)]"></path>
			{:else if normalizedType === 'abilities'}
				<path d="M21 39c3.5-11 9-17 16-17 3 0 5.5 1 8 3" class="stroke-[var(--color-accent)]"
				></path>
				<path
					d="M19 45c7-2 13-2 18 0 5-8 7-15 6-22"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
			{:else if normalizedType === 'rules'}
				<path d="M24 41h18"></path>
				<path d="M31 23l10 10"></path>
				<rect
					x="22"
					y="39"
					width="8"
					height="4"
					rx="1"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></rect>
				<path
					d="M37 17l7 7-6 6-7-7z"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
			{:else if normalizedType === 'rulesets'}
				<path
					d="M22 18h16a4 4 0 014 4v24H22z"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
				<path d="M26 18v28"></path>
				<path d="M32 18v28" class="stroke-[var(--color-accent)]"></path>
				<path d="M38 18v28"></path>
				<path d="M42 22h3v16l-3 3" class="stroke-[var(--color-accent)]"></path>
			{:else if normalizedType === 'languages'}
				<path
					d="M20 24h20a8 8 0 018 8 8 8 0 01-8 8h-4l-8 7v-7h-8a8 8 0 01-8-8 8 8 0 018-8z"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
				<path d="M24 32h12"></path>
			{:else if normalizedType === 'environments'}
				<path
					d="M18 42l10-14 7 9 5-7 6 12H18z"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
				<circle cx="24" cy="24" r="4" class="fill-[var(--color-accent)] stroke-none"></circle>
			{:else if normalizedType === 'alignments'}
				<path d="M22 22h20"></path>
				<path d="M32 22v18"></path>
				<path
					d="M24 40c0 3.5 2.7 6 6 6s6-2.5 6-6l-6-8-6 8z"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
				<path d="M34 40c0 3.5 2.7 6 6 6s6-2.5 6-6l-6-8-6 8z"></path>
			{:else if normalizedType === 'sizes'}
				<path d="M18 42h28"></path>
				<path d="M18 42l4-4"></path>
				<path d="M18 42l4 4"></path>
				<path d="M46 42l-4-4"></path>
				<path d="M46 42l-4 4"></path>
				<path d="M24 22h16" class="stroke-[var(--color-accent)]"></path>
			{:else if normalizedType === 'documents'}
				<path
					d="M22 18h16l6 6v22H22V18z"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
				<path d="M38 18v8h8"></path>
				<path d="M27 32h10"></path>
				<path d="M27 38h10"></path>
			{:else if normalizedType === 'gamesystems'}
				<path
					d="M21 24l11-7 11 7v16l-11 7-11-7V24z"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
				<path d="M32 22v20"></path>
				<path d="M24 27l16 10" class="stroke-[var(--color-accent)]"></path>
			{:else if normalizedType === 'publishers'}
				<path d="M22 43c4-4 10-11 15-21"></path>
				<path
					d="M37 22l5-5 5 5-5 5z"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
				<path d="M20 46c5-2 10-2 15 0" class="stroke-[var(--color-accent)]"></path>
			{:else if normalizedType === 'licenses'}
				<path d="M22 18h16l6 6v22H22V18z"></path>
				<path d="M38 18v8h8"></path>
				<circle
					cx="32"
					cy="36"
					r="5"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></circle>
				<path d="M32 31v10" class="stroke-[var(--color-accent)]"></path>
			{:else if normalizedType === 'images'}
				<rect x="18" y="21" width="28" height="22" rx="3"></rect>
				<circle cx="27" cy="28" r="3" class="fill-[var(--color-accent)] stroke-none"></circle>
				<path
					d="M22 39l7-7 6 5 5-6 6 8"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
			{:else if normalizedType === 'services'}
				<path d="M22 42h20"></path>
				<path
					d="M24 42c0-8 4-13 8-13s8 5 8 13"
					class="fill-[color-mix(in_srgb,var(--color-accent)_13%,transparent)]"
				></path>
				<circle cx="32" cy="26" r="3" class="stroke-[var(--color-accent)]"></circle>
			{:else if fallback}
				<text
					x="32"
					y="38"
					text-anchor="middle"
					class="fill-current text-[1.7rem] leading-none"
					stroke="none"
				>
					{fallback}
				</text>
			{/if}
		</g>
	</svg>
{/if}
