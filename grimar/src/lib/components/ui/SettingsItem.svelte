<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Settings, Palette, Book, Database, Eye, User, Info } from 'lucide-svelte';
	import type { ComponentType } from 'svelte';

	type Props = {
		label: string;
		description?: string;
		control: Snippet;
		divider?: boolean;
		class?: string;
		/** Category for runic indicator icon */
		category?:
			| 'appearance'
			| 'compendium'
			| 'data'
			| 'accessibility'
			| 'account'
			| 'about'
			| 'general';
	};

	let {
		label,
		description,
		control,
		divider = true,
		class: className = '',
		category = 'general'
	}: Props = $props();

	// Map categories to runic icons
	const categoryIcons: Record<string, ComponentType> = {
		appearance: Palette,
		compendium: Book,
		data: Database,
		accessibility: Eye,
		account: User,
		about: Info,
		general: Settings
	};

	// Get the icon component using $derived
	const Icon = $derived(categoryIcons[category] || Settings);
</script>

<div class="runic-row {divider ? 'runic-divider' : ''} {className}">
	<div class="runic-indicator" aria-hidden="true">
		<Icon class="size-4" />
	</div>

	<div class="runic-text">
		<span class="runic-label">{label}</span>
		{#if description}
			<span class="runic-description">{description}</span>
		{/if}
	</div>

	<div class="runic-control">
		{@render control()}
	</div>
</div>
