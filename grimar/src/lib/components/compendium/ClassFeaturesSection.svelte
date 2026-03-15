<script lang="ts">
	import {
		Accordion,
		AccordionItem,
		AccordionTrigger,
		AccordionContent
	} from '$lib/components/ui/accordion';
	import CompendiumAccordionSection from './CompendiumAccordionSection.svelte';
	import type { CompendiumClassFeatureEntry } from '$lib/core/types/compendium';

	interface Props {
		features: CompendiumClassFeatureEntry[];
		title?: string;
		description?: string;
		defaultOpen?: boolean;
		markdownAt: (path: string) => string;
	}

	let { features, title = 'Class Features', description, defaultOpen = true, markdownAt }: Props = $props();
	let activeFeature = $state('');
</script>

{#if features.length > 0}
	<CompendiumAccordionSection
		{title}
		{description}
		value="class-features"
		open={defaultOpen}
	>
		<Accordion
			bind:value={activeFeature}
			class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/55 px-4"
		>
			{#each features as feature, index (`${feature.key ?? feature.name ?? 'feature'}-${index}`)}
				{@const featureValue = String(feature.key || feature.name || `feature-${index}`)}
				<AccordionItem value={featureValue} class="border-[var(--color-border)]">
					<AccordionTrigger class="py-3 hover:no-underline">
						<span class="mr-3 text-left font-semibold text-accent">
							{feature.name || feature.key}
						</span>
						{#if feature.level !== undefined}
							<span class="text-xs text-[var(--color-text-muted)]">
								Level {feature.level}
							</span>
						{/if}
					</AccordionTrigger>
					<AccordionContent>
						{#if feature.markdownKey && activeFeature === featureValue}
							<div
								class="prose prose-invert prose-sm max-w-none text-[var(--color-text-secondary)]"
							>
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html markdownAt(feature.markdownKey)}
							</div>
						{/if}
					</AccordionContent>
				</AccordionItem>
			{/each}
		</Accordion>
	</CompendiumAccordionSection>
{/if}
