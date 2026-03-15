<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import CompendiumAccordionSection from './CompendiumAccordionSection.svelte';
	import type {
		CompendiumMarkdownSection,
		CompendiumSpellClassEntry
	} from '$lib/core/types/compendium';

	interface Props {
		classes: CompendiumSpellClassEntry[];
		higherLevelSection?: CompendiumMarkdownSection | null;
		markdownAt: (path: string) => string;
	}

	let { classes, higherLevelSection = null, markdownAt }: Props = $props();
</script>

{#if classes.length > 0}
	<CompendiumAccordionSection
		title="Classes"
		description="Spell lists and known class access."
		value="spell-classes"
	>
		<div class="flex flex-wrap gap-2">
			{#each classes as cls, index (`${cls.label}-${index}`)}
				{#if cls.href}
					<a href={cls.href} class="transition-colors hover:text-accent">
						<Badge variant="outline">{cls.label}</Badge>
					</a>
				{:else}
					<Badge variant="outline">{cls.label}</Badge>
				{/if}
			{/each}
		</div>
	</CompendiumAccordionSection>
{/if}

{#if higherLevelSection}
	<CompendiumAccordionSection
		title={higherLevelSection.title}
		description={higherLevelSection.description}
		value="spell-higher-level"
	>
		<div class="prose prose-invert max-w-none text-[var(--color-text-secondary)]">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html markdownAt(higherLevelSection.markdownKey)}
		</div>
	</CompendiumAccordionSection>
{/if}
