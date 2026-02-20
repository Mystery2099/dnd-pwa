<script lang="ts">
	import type { ComponentType } from 'svelte';

	type ItemVariant = 'grid' | 'list';

	interface Props {
		title: string;
		subtitle?: string;
		sourceBook?: string | null;
		active?: boolean;
		icon?: ComponentType;
		accentClass?: string;
		school?: string;
		variant?: ItemVariant;
		type?: string;
		slug?: string;
		onclick?: () => void;
	}

	let {
		title,
		subtitle,
		sourceBook,
		active,
		icon: Icon,
		accentClass: _accentClass = 'hover:border-[var(--color-accent)]/50',
		school,
		variant = 'list',
		type,
		slug,
		onclick
	}: Props = $props();

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
</script>
