<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { getSourceBadgeClass, getSourceLabel } from '$lib/core/utils/sourceBadge';
	import Badge from '$lib/components/ui/Badge.svelte';

	type ItemVariant = 'grid' | 'list';

	interface Props {
		title: string;
		subtitle?: string;
		source?: string;
		active?: boolean;
		icon?: ComponentType;
		accentClass?: string;
		school?: string; // Simplified school name for gem colors
		variant?: ItemVariant;
		type?: string; // Compendium type (e.g., 'spells', 'monsters')
		slug?: string; // Item slug for URL generation
		onclick?: () => void;
	}

	let {
		title,
		subtitle,
		source,
		active,
		icon: Icon,
		accentClass: _accentClass = 'hover:border-[var(--color-accent)]/50',
		school,
		variant = 'list',
		type,
		slug,
		onclick
	}: Props = $props();

	// Map spell school to gem color CSS variable via theme
	const schoolGemColor: Record<string, string> = {
		evocation: 'var(--color-gem-ruby)',
		abjuration: 'var(--color-gem-sapphire)',
		necromancy: 'var(--color-gem-emerald)',
		illusion: 'var(--color-gem-amethyst)',
		divination: 'var(--color-gem-topaz)',
		Enchantment: 'var(--color-gem-amethyst)',
		Conjuration: 'var(--color-gem-emerald)',
		Transmutation: 'var(--color-gem-topaz)'
	};

	const accentColor = $derived(school ? schoolGemColor[school] : 'var(--color-accent)');
	const sourceBadgeClass = $derived(source ? getSourceBadgeClass(source) : '');
</script>
