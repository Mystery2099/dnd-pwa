<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import CompendiumAccordionSection from './CompendiumAccordionSection.svelte';

	type SpellClass = string | { key?: string; name?: string };

	interface Props {
		classes: SpellClass[];
		higherLevel?: unknown;
		markdownAt: (path: string) => string;
	}

	let { classes, higherLevel, markdownAt }: Props = $props();
</script>

{#if classes.length > 0}
	<CompendiumAccordionSection
		title="Classes"
		description="Spell lists and known class access."
		value="spell-classes"
	>
		<div class="flex flex-wrap gap-2">
			{#each classes as cls, index (`${typeof cls === 'string' ? cls : cls.key ?? cls.name ?? 'class'}-${index}`)}
				<a
					href="/compendium/classes/{typeof cls === 'string' ? cls : cls.key || cls.name}"
					class="transition-colors hover:text-accent"
				>
					<Badge variant="outline">{typeof cls === 'string' ? cls : cls.name || cls.key}</Badge>
				</a>
			{/each}
		</div>
	</CompendiumAccordionSection>
{/if}

{#if higherLevel}
	<CompendiumAccordionSection
		title="At Higher Levels"
		description="Scaling notes when the spell is cast using stronger slots."
		value="spell-higher-level"
	>
		<div class="prose prose-invert max-w-none text-[var(--color-text-secondary)]">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html markdownAt('higher_level')}
		</div>
	</CompendiumAccordionSection>
{/if}
